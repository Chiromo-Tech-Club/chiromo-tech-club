"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { members, memberCommunities } from "@/lib/drizzle/schema";
import { getAuthUserId } from "@/lib/supabase/auth-helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { fullRegistrationSchema, type FullRegistrationInput } from "@/lib/validations/registration";
import { sendNewsletterConfirmation } from "@/services/email";
import { ROUTES } from "@/constants/routes";
import type { ActionResult } from "@/actions/membership";

export async function submitClubRegistration(
  input: FullRegistrationInput,
): Promise<ActionResult<{ registrationId: string; status: string; isNewGuest?: boolean }>> {
  const parsed = fullRegistrationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid registration details. Please review the steps.",
    };
  }

  const data = parsed.data;
  const db = getDb();

  // Try to see if user is already authenticated (via Google or Supabase Auth session)
  const supabase = await getSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const authProvider = authUser?.app_metadata?.provider === "google" ? "google" : "email_password";
  const userId = authUser?.id;

  const feeAmountPaid =
    data.paymentOption === "full_500" ? 500 : data.paymentOption === "deposit_250" ? 250 : 0;
  const feeStatus =
    data.paymentOption === "full_500"
      ? "fully_paid"
      : data.paymentOption === "deposit_250"
      ? "deposit_paid"
      : "unpaid";

  const isChiromoCampus =
    data.isChiromo || data.campus.toLowerCase().includes("chiromo") || data.campus.toLowerCase().includes("jerome");

  try {
    if (userId) {
      // Upsert into `members` table keyed by auth.users.id
      const [savedMember] = await db
        .insert(members)
        .values({
          id: userId,
          fullName: data.fullName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          bio: data.bio || null,
          githubHandle: data.githubHandle || null,
          studentId: data.studentId,
          campus: data.campus,
          isChiromo: isChiromoCampus,
          course: data.course,
          yearOfStudy: data.yearOfStudy,
          authProvider,
          membershipStatus: "pending",
          membershipFeeStatus: feeStatus,
          feeAmountPaid,
          mpesaReference: data.mpesaReference || null,
        })
        .onConflictDoUpdate({
          target: members.id,
          set: {
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            bio: data.bio || null,
            githubHandle: data.githubHandle || null,
            studentId: data.studentId,
            campus: data.campus,
            isChiromo: isChiromoCampus,
            course: data.course,
            yearOfStudy: data.yearOfStudy,
            authProvider,
            membershipStatus: "pending",
            membershipFeeStatus: feeStatus,
            feeAmountPaid,
            mpesaReference: data.mpesaReference || null,
            updatedAt: new Date(),
          },
        })
        .returning();

      if (data.communitySlugs.length > 0) {
        await db
          .insert(memberCommunities)
          .values(data.communitySlugs.map((slug) => ({ memberId: savedMember.id, communitySlug: slug })))
          .onConflictDoNothing();
      }

      await sendNewsletterConfirmation(data.email, data.fullName).catch((err) =>
        console.error("Confirmation email failed:", err),
      );

      revalidatePath(ROUTES.dashboard);
      revalidatePath(ROUTES.adminMembers);

      return {
        success: true,
        data: { registrationId: savedMember.id, status: "pending", isNewGuest: false },
      };
    } else {
      // For visitors completing registration prior to signing in, check if member with this email exists
      const [existingMember] = await db.select().from(members).where(eq(members.email, data.email)).limit(1);

      if (existingMember) {
        await db
          .update(members)
          .set({
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            bio: data.bio || null,
            githubHandle: data.githubHandle || null,
            studentId: data.studentId,
            campus: data.campus,
            isChiromo: isChiromoCampus,
            course: data.course,
            yearOfStudy: data.yearOfStudy,
            authProvider: "email_password",
            membershipStatus: "pending",
            membershipFeeStatus: feeStatus,
            feeAmountPaid,
            mpesaReference: data.mpesaReference || null,
            updatedAt: new Date(),
          })
          .where(eq(members.id, existingMember.id));

        if (data.communitySlugs.length > 0) {
          await db
            .insert(memberCommunities)
            .values(data.communitySlugs.map((slug) => ({ memberId: existingMember.id, communitySlug: slug })))
            .onConflictDoNothing();
        }

        await sendNewsletterConfirmation(data.email, data.fullName).catch((err) =>
          console.error("Confirmation email failed:", err),
        );

        revalidatePath(ROUTES.adminMembers);
        return {
          success: true,
          data: { registrationId: existingMember.id, status: "pending", isNewGuest: false },
        };
      }

      await sendNewsletterConfirmation(data.email, data.fullName).catch((err) =>
        console.error("Confirmation email failed:", err),
      );

      return {
        success: true,
        data: {
          registrationId: "guest_pending",
          status: "pending",
          isNewGuest: true,
        },
      };
    }
  } catch (err) {
    console.error("submitClubRegistration failed:", err);
    return {
      success: false,
      error: "Unable to complete registration. Please check your details and try again.",
    };
  }
}
