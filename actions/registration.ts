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

function registrationErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  if (/column .* does not exist|42703/i.test(msg)) {
    return "Database is missing membership columns. Open Supabase → SQL Editor and run the members column migration, then try again.";
  }
  if (/duplicate key|unique constraint|23505|already been registered|already registered/i.test(msg)) {
    return "An account with this email already exists. Sign in, or use Finish with Google on this page.";
  }
  if (/foreign key|23503/i.test(msg)) {
    return "Please create your account in this registration form (password or Google), then submit again.";
  }
  return "Unable to complete registration. Please check your details and try again.";
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
  authProvider: string;
  membershipFeeStatus: string;
  feeAmountPaid: number;
  mpesaReference: string | null;
};

async function upsertMemberProfile(
  userId: string,
  profile: MemberProfileValues,
  communitySlugs: string[],
  preserveApproval: boolean,
) {
  const db = getDb();

  const [existing] = await db.select({ membershipStatus: members.membershipStatus }).from(members).where(eq(members.id, userId)).limit(1);

  const membershipStatus =
    preserveApproval &&
    (existing?.membershipStatus === "approved" || existing?.membershipStatus === "rejected")
      ? existing.membershipStatus
      : "pending";

  const [savedMember] = await db
    .insert(members)
    .values({
      id: userId,
      ...profile,
      membershipStatus: "pending",
    })
    .onConflictDoUpdate({
      target: members.id,
      set: {
        ...profile,
        membershipStatus,
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

  const feeAmountPaid =
    data.paymentOption === "full_500" ? 500 : data.paymentOption === "deposit_250" ? 250 : 0;
  const feeStatus =
    data.paymentOption === "full_500"
      ? "fully_paid"
      : data.paymentOption === "deposit_250"
        ? "deposit_paid"
        : "unpaid";

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
      authProvider,
      membershipFeeStatus: feeStatus,
      feeAmountPaid,
      mpesaReference: data.mpesaReference || null,
    };

    const savedMember = await upsertMemberProfile(userId, profile, data.communitySlugs, true);

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
        status: "pending",
        isNewGuest: false,
        needsClientSignIn,
      },
    };
  } catch (err) {
    console.error("submitClubRegistration failed:", err);
    return {
      success: false,
      error: registrationErrorMessage(err),
    };
  }
}
