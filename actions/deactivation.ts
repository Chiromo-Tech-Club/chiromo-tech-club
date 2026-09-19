"use server";

import { and, eq, isNotNull, isNull, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/drizzle/client";
import { ensureMembersColumns } from "@/lib/drizzle/ensure-members-columns";
import { members, memberEmails } from "@/lib/drizzle/schema";
import { getAuthUserId, getCurrentRole, getCurrentExecTitle } from "@/lib/supabase/auth-helpers";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { computePurgeScheduledAt, DEACTIVATION_GRACE_DAYS } from "@/lib/membership/constants";
import { ROUTES } from "@/constants/routes";
import type { ActionResult } from "@/actions/membership";

async function ensureSchema() {
  try {
    await ensureMembersColumns();
  } catch (err) {
    console.warn("ensureMembersColumns failed:", err);
  }
}

async function canManageMembers(): Promise<boolean> {
  const role = await getCurrentRole();
  if (role === "admin") return true;
  if (role === "exec") {
    const title = await getCurrentExecTitle();
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
 * Anonymize a member row after the grace period.
 * Keeps fee amounts, event registrations (FK), and finance party-name history.
 * Frees the email so a new person can register. Bans login permanently.
 */
export async function purgeMemberAccount(memberId: string): Promise<void> {
  const db = getDb();
  const [row] = await db.select().from(members).where(eq(members.id, memberId)).limit(1);
  if (!row) return;

  const freedEmail = row.email;
  const purgedEmail = `purged-${memberId}@internal.ctc`;

  await db.delete(memberEmails).where(eq(memberEmails.memberId, memberId));

  await db
    .update(members)
    .set({
      fullName: "Former Member",
      email: purgedEmail,
      username: null,
      avatarUrl: null,
      bio: null,
      githubHandle: null,
      phoneNumber: null,
      studentId: null,
      mpesaPhoneNumber: null,
      // Keep feeAmountPaid, membershipFeeStatus, mpesaReference for finance history
      role: "visitor",
      execTitle: null,
      deletedAt: row.deletedAt ?? new Date(),
      deactivatedAt: row.deactivatedAt ?? new Date(),
      purgeScheduledAt: null,
      updatedAt: new Date(),
    })
    .where(eq(members.id, memberId));

  try {
    const admin = getSupabaseServiceClient();
    // Change auth email so the freed address can be reused; ban login
    await admin.auth.admin.updateUserById(memberId, {
      email: purgedEmail,
      ban_duration: "876000h",
      user_metadata: {
        purged: true,
        former_email: freedEmail,
        purged_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.warn("purgeMemberAccount auth update failed:", err);
  }
}

/** Run purge for any accounts whose grace period has ended. */
export async function purgeExpiredDeactivations(): Promise<number> {
  await ensureSchema();
  const db = getDb();
  const now = new Date();

  try {
    const due = await db
      .select({ id: members.id })
      .from(members)
      .where(
        and(
          isNotNull(members.deactivatedAt),
          isNotNull(members.purgeScheduledAt),
          lte(members.purgeScheduledAt, now),
        ),
      );

    for (const row of due) {
      await purgeMemberAccount(row.id);
    }
    return due.length;
  } catch (err) {
    console.warn("purgeExpiredDeactivations failed:", err);
    return 0;
  }
}

/**
 * Member self-deactivation (Twitter-style). 14-day window to cancel.
 */
export async function requestAccountDeactivation(): Promise<
  ActionResult<{ purgeScheduledAt: string; graceDays: number }>
> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "You must be signed in." };

  await ensureSchema();
  const db = getDb();
  const now = new Date();
  const purgeScheduledAt = computePurgeScheduledAt(now);

  try {
    await db
      .update(members)
      .set({
        deactivatedAt: now,
        purgeScheduledAt,
        updatedAt: now,
      })
      .where(and(eq(members.id, userId), isNull(members.deletedAt)));

    revalidatePath(ROUTES.dashboard);
    revalidatePath(ROUTES.dashboardProfile);
    return {
      success: true,
      data: {
        purgeScheduledAt: purgeScheduledAt.toISOString(),
        graceDays: DEACTIVATION_GRACE_DAYS,
      },
    };
  } catch (err) {
    console.error("requestAccountDeactivation failed:", err);
    return { success: false, error: "Could not start deactivation." };
  }
}

/** Cancel deactivation within the grace period. */
export async function cancelAccountDeactivation(): Promise<ActionResult> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "You must be signed in." };

  await ensureSchema();
  const db = getDb();

  try {
    const [me] = await db.select().from(members).where(eq(members.id, userId)).limit(1);
    if (!me?.deactivatedAt) {
      return { success: false, error: "Your account is not scheduled for deletion." };
    }
    if (me.purgeScheduledAt && me.purgeScheduledAt.getTime() <= Date.now()) {
      return { success: false, error: "The grace period has ended; this account cannot be restored." };
    }

    await db
      .update(members)
      .set({
        deactivatedAt: null,
        purgeScheduledAt: null,
        updatedAt: new Date(),
      })
      .where(eq(members.id, userId));

    revalidatePath(ROUTES.dashboard);
    revalidatePath(ROUTES.dashboardProfile);
    return { success: true };
  } catch (err) {
    console.error("cancelAccountDeactivation failed:", err);
    return { success: false, error: "Could not cancel deactivation." };
  }
}

/**
 * Executive schedules deletion of a member (same 14-day grace).
 * Contributions (fees, event regs) stay; login access ends after purge.
 */
export async function scheduleMemberDeletion(
  memberId: string,
  reason?: string,
): Promise<ActionResult<{ purgeScheduledAt: string }>> {
  const allowed = await canManageMembers();
  if (!allowed) return { success: false, error: "Executive or Admin access required." };

  const reviewerId = await getAuthUserId();
  await ensureSchema();
  const db = getDb();
  const now = new Date();
  const purgeScheduledAt = computePurgeScheduledAt(now);

  try {
    await db
      .update(members)
      .set({
        deactivatedAt: now,
        purgeScheduledAt,
        reviewedById: reviewerId || null,
        reviewedAt: now,
        reviewNotes: reason || `Deletion scheduled (${DEACTIVATION_GRACE_DAYS}-day grace)`,
        updatedAt: now,
      })
      .where(and(eq(members.id, memberId), isNull(members.deletedAt)));

    revalidatePath(ROUTES.adminMembers);
    revalidatePath(ROUTES.dashboard);
    return {
      success: true,
      data: { purgeScheduledAt: purgeScheduledAt.toISOString() },
    };
  } catch (err) {
    console.error("scheduleMemberDeletion failed:", err);
    return { success: false, error: "Could not schedule member deletion." };
  }
}

/** Executive cancels a scheduled deletion during the grace window. */
export async function cancelMemberDeletion(memberId: string): Promise<ActionResult> {
  const allowed = await canManageMembers();
  if (!allowed) return { success: false, error: "Executive or Admin access required." };

  await ensureSchema();
  const db = getDb();

  try {
    await db
      .update(members)
      .set({
        deactivatedAt: null,
        purgeScheduledAt: null,
        updatedAt: new Date(),
      })
      .where(eq(members.id, memberId));

    revalidatePath(ROUTES.adminMembers);
    return { success: true };
  } catch (err) {
    console.error("cancelMemberDeletion failed:", err);
    return { success: false, error: "Could not cancel deletion." };
  }
}
