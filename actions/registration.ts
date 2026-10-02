"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { ensureMembersColumns } from "@/lib/drizzle/ensure-members-columns";
import { members, memberCommunities } from "@/lib/drizzle/schema";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import {
  fullRegistrationSchema,
  OTHER_CAMPUS_LABEL,
  type FullRegistrationInput,
} from "@/lib/validations/registration";
import { sendNewsletterConfirmation } from "@/services/email";
import { ROUTES } from "@/constants/routes";
import type { ActionResult } from "@/actions/membership";
import { friendlyAuthError } from "@/lib/utils/friendly-error";
import { pollStkStatus } from "@/lib/payments/payhero";
import { claimOneTimePass, redeemOneTimePass, releaseOneTimePass } from "@/lib/payments/one-time-pass";

async function confirmPaidReceipt(
  code: string,
  payheroReference?: string | null,
): Promise<{ ok: true; receipt: string } | { ok: false; error: string }> {
  const receipt = code.trim().toUpperCase();
  const lookup = payheroReference?.trim() || receipt;
  let result: Awaited<ReturnType<typeof pollStkStatus>>;
  try {
    result = await pollStkStatus(lookup);
  } catch {
    return { ok: false, error: "Could not confirm the M-Pesa payment. Try submitting again." };
  }
  if ("httpStatus" in result) return { ok: false, error: result.error };
  const confirmed = (result.receipt ?? "").toUpperCase();
  if (result.status === "SUCCESS" && confirmed === receipt) {
    return { ok: true, receipt: confirmed };
  }
  return {
    ok: false,
    error: "M-Pesa has not confirmed this payment yet. Wait for the code, then submit again.",
  };
}

function registrationErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  if (/already been registered|already registered|duplicate key|unique constraint|23505/i.test(msg)) {
    return "An account with this email already exists. Sign in, or use Finish with Google on this page.";
  }
  if (/foreign key|23503/i.test(msg)) {
    return "Please create your account in this registration form (password or Google), then submit again.";
  }
  return friendlyAuthError(
    err,
    "Unable to complete registration. Please check your details and try again.",
  );
}

function resolveCampusFields(data: FullRegistrationInput) {
  const isOther =
    !data.isChiromo &&
    (data.campus === OTHER_CAMPUS_LABEL || data.campus.toLowerCase().includes("other"));

  const institutionName = isOther ? data.institutionName?.trim() || null : null;
  const department =
    (isOther ? data.department?.trim() : data.department?.trim() || data.faculty?.trim()) || null;

  const campus = isOther && institutionName ? institutionName : data.campus;
  const isChiromoCampus =
    data.isChiromo || campus.toLowerCase().includes("chiromo");

  return { campus, isChiromoCampus, institutionName, department };
}

type MemberProfileValues = {
  fullName: string;
  email: string;
  phoneNumber: string;
  bio: string | null;
  githubHandle: string | null;
  studentId: string;
  campus: string;
  isChiromo: boolean;
  institutionName: string | null;
  department: string | null;
  course: string;
  yearOfStudy: string;
  experienceLevel: string | null;
  learningGoals: string | null;
  authProvider: string;
  membershipFeeStatus: string;
  feeAmountPaid: number;
  mpesaReference: string | null;
  mpesaPhoneNumber: string | null;
};

async function upsertMemberProfile(
  userId: string,
  profile: MemberProfileValues,
  communitySlugs: string[],
  preserveApproval: boolean,
  approve: boolean,
  reviewNotes: string,
) {
  const db = getDb();

  const [existing] = await db
    .select({ membershipStatus: members.membershipStatus, role: members.role })
    .from(members)
    .where(eq(members.id, userId))
    .limit(1);

  const keepLeadershipRole = existing?.role === "admin" || existing?.role === "exec";
  const membershipStatus = approve
    ? "approved"
    : preserveApproval &&
        (existing?.membershipStatus === "approved" || existing?.membershipStatus === "rejected")
      ? existing.membershipStatus
      : "pending";
  const role = approve ? (keepLeadershipRole ? existing.role : "member") : existing?.role;

  const [savedMember] = await db
    .insert(members)
    .values({
      id: userId,
      ...profile,
      role: role ?? "member",
      membershipStatus,
      reviewedAt: approve ? new Date() : null,
      reviewNotes: approve ? reviewNotes : null,
    })
    .onConflictDoUpdate({
      target: members.id,
      set: {
        ...profile,
        ...(role ? { role } : {}),
        membershipStatus,
        ...(approve
          ? {
              reviewedAt: new Date(),
              reviewNotes,
            }
          : {}),
        updatedAt: new Date(),
      },
    })
    .returning();

  if (communitySlugs.length > 0) {
    await db
      .insert(memberCommunities)
      .values(communitySlugs.map((slug) => ({ memberId: savedMember.id, communitySlug: slug })))
      .onConflictDoNothing();
  }

  return savedMember;
}

/**
 * Creates (or links) a Supabase auth user for email/password registration.
 * Returns the auth user id.
 */
async function ensureAuthUserForRegistration(
  email: string,
  password: string,
  fullName: string,
): Promise<{ userId: string; created: boolean }> {
  const admin = getSupabaseServiceClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (data.user) {
    return { userId: data.user.id, created: true };
  }

  if (error && /already|registered|exists/i.test(error.message)) {
    throw new Error(
      "An account with this email already exists. Sign in, or use Finish joining with Google below.",
    );
  }

  throw new Error(error?.message ?? "Could not create account.");
}

export async function applyRegistrationPass(
  code: string,
): Promise<ActionResult<{ token: string }>> {
  const result = await redeemOneTimePass(code);
  if (!result.ok) return { success: false, error: result.error };
  return { success: true, data: { token: result.token } };
}

export async function submitClubRegistration(
  input: FullRegistrationInput,
): Promise<
  ActionResult<{
    registrationId: string;
    status: string;
    isNewGuest?: boolean;
    /** Client should sign in with email/password to open the dashboard. */
    needsClientSignIn?: boolean;
  }>
> {
  const parsed = fullRegistrationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid registration details. Please review the steps.",
    };
  }

  const data = parsed.data;
  const { campus, isChiromoCampus, institutionName, department } = resolveCampusFields(data);

  const supabase = await getSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let userId = authUser?.id ?? null;
  let authProvider =
    authUser?.app_metadata?.provider === "google" ? "google" : "email_password";
  let needsClientSignIn = false;

  const passToken = data.promoToken?.trim() ?? "";
  let confirmation: { ok: true; receipt: string } | null = null;
  if (!passToken) {
    const checked = await confirmPaidReceipt(data.mpesaReference ?? "", data.payheroReference);
    if (!checked.ok) return { success: false, error: checked.error };
    confirmation = checked;
  }

  const feeAmountPaid =
    data.paymentOption === "full_500" ? 500 : data.paymentOption === "deposit_250" ? 250 : 0;
  const feeStatus =
    data.paymentOption === "full_500"
      ? "fully_paid"
      : data.paymentOption === "deposit_250"
        ? "deposit_paid"
        : "unpaid";

  let passClaimed = false;
  let claimedUserId: string | null = null;

  try {
    await ensureMembersColumns();

    // Registration creates the account — no separate /sign-up needed.
    if (!userId) {
      const password = data.password?.trim() ?? "";
      if (password.length < 8) {
        return {
          success: false,
          error: "Create a password (min 8 characters) or finish joining with Google first.",
        };
      }

      const ensured = await ensureAuthUserForRegistration(data.email, password, data.fullName);
      userId = ensured.userId;
      authProvider = "email_password";
      needsClientSignIn = true;
    }

    if (passToken) {
      passClaimed = await claimOneTimePass(passToken, userId);
      claimedUserId = userId;
      if (!passClaimed) {
        return { success: false, error: "That pass has already been used." };
      }
    }

    const profile: MemberProfileValues = {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      bio: data.bio || null,
      githubHandle: data.githubHandle || null,
      studentId: data.studentId,
      campus,
      isChiromo: isChiromoCampus,
      institutionName,
      department,
      course: data.course,
      yearOfStudy: data.yearOfStudy,
      experienceLevel: data.experienceLevel || null,
      learningGoals: data.learningGoals?.trim() || null,
      authProvider,
      membershipFeeStatus: feeStatus,
      feeAmountPaid,
      mpesaReference: confirmation?.receipt ?? null,
      mpesaPhoneNumber: data.mpesaPhoneNumber?.trim() || null,
    };

    const savedMember = await upsertMemberProfile(
      userId,
      profile,
      data.communitySlugs,
      true,
      true,
      passClaimed
        ? "Approved with a one-time pass after an earlier payment"
        : "Approved automatically after M-Pesa confirmation",
    );

    await sendNewsletterConfirmation(data.email, data.fullName).catch((err) =>
      console.error("Confirmation email failed:", err),
    );

    revalidatePath(ROUTES.dashboard);
    revalidatePath(ROUTES.adminMembers);
    revalidatePath(ROUTES.register);

    return {
      success: true,
      data: {
        registrationId: savedMember.id,
        status: "approved",
        isNewGuest: false,
        needsClientSignIn,
      },
    };
  } catch (err) {
    if (passClaimed && claimedUserId && passToken) {
      await releaseOneTimePass(passToken, claimedUserId).catch(() => undefined);
    }
    console.error("submitClubRegistration failed:", err);
    return {
      success: false,
      error: registrationErrorMessage(err),
    };
  }
}
