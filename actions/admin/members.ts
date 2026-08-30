"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { members } from "@/lib/drizzle/schema";
import { requireRole, setUserRole, getAuthUserId, getCurrentRole, getCurrentExecTitle } from "@/lib/supabase/auth-helpers";
import { ROLES } from "@/constants/roles";
import { EXEC_TITLES } from "@/types/exec-title";
import { ROUTES } from "@/constants/routes";
import type { ActionResult } from "@/actions/membership";

const updateRoleSchema = z
  .object({
    memberId: z.string().uuid(),
    role: z.enum(ROLES),
    execTitle: z.enum(EXEC_TITLES).nullable(),
  })
  .refine((v) => v.role !== "exec" || v.execTitle !== null, {
    message: "An exec title is required when the role is Executive.",
    path: ["execTitle"],
  });

/** Check if current user is an admin or executive officer eligible to manage approvals. */
async function canManageApprovals(): Promise<boolean> {
  const role = await getCurrentRole();
  if (role === "admin") return true;
  if (role === "exec") {
    const title = await getCurrentExecTitle();
    // Patron, Chairperson, Vice Chairperson, Secretary General, Treasurer, Membership Officer can review
    return (
      title === "patron" ||
      title === "chairperson" ||
      title === "vice_chairperson" ||
      title === "secretary_general" ||
      title === "treasurer" ||
      title === "membership_officer" ||
      title === "training_coordinator" ||
      title === "corporate_affairs"
    );
  }
  return false;
}

/**
 * Promotes/demotes a member and assigns their executive seat.
 */
export async function updateMemberRole(input: z.infer<typeof updateRoleSchema>): Promise<ActionResult> {
  const isAllowed = await canManageApprovals();
  if (!isAllowed) return { success: false, error: "Administrative/Executive access required." };

  const parsed = updateRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { memberId, role, execTitle } = parsed.data;
  const resolvedExecTitle = role === "exec" ? execTitle : null;

  try {
    await setUserRole(memberId, role, resolvedExecTitle);

    revalidatePath(ROUTES.adminMembers);
    revalidatePath(ROUTES.dashboard);
    return { success: true };
  } catch (err) {
    console.error("updateMemberRole failed:", err);
    return { success: false, error: "Could not update this member's role." };
  }
}

/**
 * Approves a pending club membership registration.
 */
export async function approveMember(memberId: string, notes?: string): Promise<ActionResult> {
  const isAllowed = await canManageApprovals();
  if (!isAllowed) return { success: false, error: "Executive or Admin access required." };

  const reviewerId = await getAuthUserId();
  const db = getDb();

  try {
    // Upgrades the user to a standard member and marks membership approved
    await db
      .update(members)
      .set({
        role: "member",
        membershipStatus: "approved",
        reviewedById: reviewerId || null,
        reviewedAt: new Date(),
        reviewNotes: notes || "Approved by leadership",
        updatedAt: new Date(),
      })
      .where(eq(members.id, memberId));

    revalidatePath(ROUTES.adminMembers);
    revalidatePath(ROUTES.dashboard);
    return { success: true };
  } catch (err) {
    console.error("approveMember failed:", err);
    return { success: false, error: "Could not approve member." };
  }
}

/**
 * Rejects a membership application with an optional reason.
 */
export async function rejectMember(memberId: string, reason?: string): Promise<ActionResult> {
  const isAllowed = await canManageApprovals();
  if (!isAllowed) return { success: false, error: "Executive or Admin access required." };

  const reviewerId = await getAuthUserId();
  const db = getDb();

  try {
    await db
      .update(members)
      .set({
        role: "visitor",
        membershipStatus: "rejected",
        reviewedById: reviewerId || null,
        reviewedAt: new Date(),
        reviewNotes: reason || "Application rejected",
        updatedAt: new Date(),
      })
      .where(eq(members.id, memberId));

    revalidatePath(ROUTES.adminMembers);
    revalidatePath(ROUTES.dashboard);
    return { success: true };
  } catch (err) {
    console.error("rejectMember failed:", err);
    return { success: false, error: "Could not reject member." };
  }
}

/**
 * Updates membership payment / fee deposit status (e.g., recorded by Treasurer).
 */
export async function updateMemberPaymentStatus(
  memberId: string,
  feeStatus: "unpaid" | "deposit_paid" | "fully_paid",
  amountPaid: number,
  mpesaRef?: string,
): Promise<ActionResult> {
  const isAllowed = await canManageApprovals();
  if (!isAllowed) return { success: false, error: "Executive or Admin access required." };

  const db = getDb();
  try {
    await db
      .update(members)
      .set({
        membershipFeeStatus: feeStatus,
        feeAmountPaid: amountPaid,
        mpesaReference: mpesaRef || null,
        updatedAt: new Date(),
      })
      .where(eq(members.id, memberId));

    revalidatePath(ROUTES.adminMembers);
    revalidatePath(ROUTES.dashboard);
    return { success: true };
  } catch (err) {
    console.error("updateMemberPaymentStatus failed:", err);
    return { success: false, error: "Could not update payment status." };
  }
}
