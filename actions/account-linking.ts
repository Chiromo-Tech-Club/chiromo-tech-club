"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/drizzle/client";
import { ensureMembersColumns } from "@/lib/drizzle/ensure-members-columns";
import {
  members,
  memberEmails,
  memberCommunities,
  eventRegistrations,
} from "@/lib/drizzle/schema";
import { getAuthUserId } from "@/lib/supabase/auth-helpers";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import {
  maskEmail,
  normalizeMemberName,
  type SimilarMemberCandidate,
} from "@/lib/membership/name-match";
import { ROUTES } from "@/constants/routes";
import type { ActionResult } from "@/actions/membership";

async function ensureSchema() {
  try {
    await ensureMembersColumns();
  } catch (err) {
    console.warn("ensureMembersColumns failed:", err);
  }
}

/**
 * Find active members whose full name matches (case-insensitive), excluding
 * the given member / email and anyone already merged or deactivated.
 */
export async function findSimilarNamedMembers(input: {
  fullName: string;
  excludeMemberId?: string;
  excludeEmail?: string;
}): Promise<ActionResult<{ candidates: SimilarMemberCandidate[] }>> {
  const name = input.fullName?.trim();
  if (!name || name.length < 2) {
    return { success: true, data: { candidates: [] } };
  }

  await ensureSchema();
  const db = getDb();
  const normalized = normalizeMemberName(name);

  try {
    const all = await db
      .select({
        id: members.id,
        fullName: members.fullName,
        email: members.email,
        membershipStatus: members.membershipStatus,
        nameDistinctConfirmed: members.nameDistinctConfirmed,
      })
      .from(members)
      .where(
        and(isNull(members.deletedAt), isNull(members.deactivatedAt), isNull(members.mergedIntoId)),
      );

    const excludeEmail = input.excludeEmail?.trim().toLowerCase();
    const candidates: SimilarMemberCandidate[] = all
      .filter((r) => {
        if (input.excludeMemberId && r.id === input.excludeMemberId) return false;
        if (excludeEmail && r.email.toLowerCase() === excludeEmail) return false;
        if (r.nameDistinctConfirmed) return false;
        return normalizeMemberName(r.fullName) === normalized;
      })
      .map((r) => ({
        id: r.id,
        fullName: r.fullName,
        email: r.email,
        membershipStatus: r.membershipStatus,
        emailDisplay: maskEmail(r.email),
      }));

    return { success: true, data: { candidates } };
  } catch (err) {
    console.error("findSimilarNamedMembers failed:", err);
    return { success: false, error: "Could not check for similar names." };
  }
}

/**
 * New registrant / logged-in member says similar-named accounts are NOT them.
 */
export async function confirmNameIsDistinct(): Promise<ActionResult> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "You must be signed in." };

  await ensureSchema();
  const db = getDb();

  try {
    await db
      .update(members)
      .set({ nameDistinctConfirmed: true, updatedAt: new Date() })
      .where(eq(members.id, userId));
    return { success: true };
  } catch (err) {
    console.error("confirmNameIsDistinct failed:", err);
    return { success: false, error: "Could not save your choice." };
  }
}

/**
 * Merge two member accounts into one dashboard.
 * `primaryMemberId` keeps the dashboard; `secondaryMemberId` is soft-closed
 * and its email becomes a secondary email on the primary profile.
 */
export async function mergeMemberAccounts(input: {
  primaryMemberId: string;
  secondaryMemberId: string;
}): Promise<ActionResult<{ primaryEmail: string }>> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "You must be signed in." };

  const { primaryMemberId, secondaryMemberId } = input;
  if (primaryMemberId === secondaryMemberId) {
    return { success: false, error: "Pick two different emails." };
  }
  if (userId !== primaryMemberId && userId !== secondaryMemberId) {
    return { success: false, error: "You can only merge accounts that belong to you." };
  }

  await ensureSchema();
  const db = getDb();

  try {
    const [primary] = await db
      .select()
      .from(members)
      .where(and(eq(members.id, primaryMemberId), isNull(members.deletedAt)))
      .limit(1);
    const [secondary] = await db
      .select()
      .from(members)
      .where(and(eq(members.id, secondaryMemberId), isNull(members.deletedAt)))
      .limit(1);

    if (!primary || !secondary) {
      return { success: false, error: "One of the accounts could not be found." };
    }

    const secondaryRegs = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.memberId, secondaryMemberId));

    for (const reg of secondaryRegs) {
      try {
        await db
          .update(eventRegistrations)
          .set({ memberId: primaryMemberId })
          .where(eq(eventRegistrations.id, reg.id));
      } catch {
        await db.delete(eventRegistrations).where(eq(eventRegistrations.id, reg.id));
      }
    }

    const secondaryCommunities = await db
      .select()
      .from(memberCommunities)
      .where(eq(memberCommunities.memberId, secondaryMemberId));

    for (const row of secondaryCommunities) {
      await db
        .insert(memberCommunities)
        .values({ memberId: primaryMemberId, communitySlug: row.communitySlug })
        .onConflictDoNothing();
    }

    const primaryPaid = primary.feeAmountPaid ?? 0;
    const secondaryPaid = secondary.feeAmountPaid ?? 0;
    const feePatch =
      secondaryPaid > primaryPaid
        ? {
            feeAmountPaid: secondaryPaid,
            membershipFeeStatus: secondary.membershipFeeStatus,
            mpesaReference: secondary.mpesaReference ?? primary.mpesaReference,
            mpesaPhoneNumber: secondary.mpesaPhoneNumber ?? primary.mpesaPhoneNumber,
          }
        : {};

    const membershipStatus =
      primary.membershipStatus === "approved" || secondary.membershipStatus === "approved"
        ? "approved"
        : primary.membershipStatus === "pending" || secondary.membershipStatus === "pending"
          ? "pending"
          : primary.membershipStatus;

    let role = primary.role;
    if (secondary.role === "admin") role = "admin";
    else if (secondary.role === "exec" && primary.role !== "admin") role = "exec";
    else if (membershipStatus === "approved" && primary.role === "visitor") role = "member";

    await db
      .update(members)
      .set({
        ...feePatch,
        membershipStatus,
        role,
        updatedAt: new Date(),
      })
      .where(eq(members.id, primaryMemberId));

    await db
      .insert(memberEmails)
      .values([
        {
          memberId: primaryMemberId,
          email: primary.email.toLowerCase(),
          isPrimary: true,
          linkedAuthUserId: primaryMemberId,
        },
        {
          memberId: primaryMemberId,
          email: secondary.email.toLowerCase(),
          isPrimary: false,
          linkedAuthUserId: secondaryMemberId,
        },
      ])
      .onConflictDoNothing();

    await db
      .update(members)
      .set({
        mergedIntoId: primaryMemberId,
        deletedAt: new Date(),
        updatedAt: new Date(),
        email: `merged-${secondaryMemberId.slice(0, 8)}-${secondary.email}`,
      })
      .where(eq(members.id, secondaryMemberId));

    try {
      const admin = getSupabaseServiceClient();
      await admin.auth.admin.updateUserById(secondaryMemberId, {
        ban_duration: "876000h",
        user_metadata: {
          merged_into: primaryMemberId,
          merged_primary_email: primary.email,
        },
      });
    } catch (banErr) {
      console.warn("Could not ban merged secondary auth user:", banErr);
    }

    revalidatePath(ROUTES.dashboard);
    revalidatePath(ROUTES.adminMembers);
    return { success: true, data: { primaryEmail: primary.email } };
  } catch (err) {
    console.error("mergeMemberAccounts failed:", err);
    return { success: false, error: "Could not merge accounts. Please try again." };
  }
}

/**
 * After login: if the current user shares a case-insensitive name with
 * another active account, return candidates for the merge modal.
 */
export async function getLoginNameMergeCandidates(): Promise<
  ActionResult<{ candidates: SimilarMemberCandidate[]; current: SimilarMemberCandidate | null }>
> {
  const userId = await getAuthUserId();
  if (!userId) return { success: true, data: { candidates: [], current: null } };

  await ensureSchema();
  const db = getDb();

  try {
    const [me] = await db
      .select()
      .from(members)
      .where(and(eq(members.id, userId), isNull(members.deletedAt)))
      .limit(1);

    if (!me || me.nameDistinctConfirmed || me.deactivatedAt || me.mergedIntoId) {
      return { success: true, data: { candidates: [], current: null } };
    }

    const result = await findSimilarNamedMembers({
      fullName: me.fullName,
      excludeMemberId: me.id,
      excludeEmail: me.email,
    });

    if (!result.success || !result.data) {
      return { success: true, data: { candidates: [], current: null } };
    }

    return {
      success: true,
      data: {
        candidates: result.data.candidates,
        current: {
          id: me.id,
          fullName: me.fullName,
          email: me.email,
          membershipStatus: me.membershipStatus,
          emailDisplay: me.email,
        },
      },
    };
  } catch (err) {
    console.error("getLoginNameMergeCandidates failed:", err);
    return { success: true, data: { candidates: [], current: null } };
  }
}

/** List secondary emails for the signed-in (primary) member. */
export async function getMyLinkedEmails(): Promise<
  ActionResult<{ emails: { email: string; isPrimary: boolean }[] }>
> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Not signed in." };

  await ensureSchema();
  const db = getDb();

  try {
    const rows = await db
      .select({ email: memberEmails.email, isPrimary: memberEmails.isPrimary })
      .from(memberEmails)
      .where(eq(memberEmails.memberId, userId));

    if (rows.length === 0) {
      const [me] = await db
        .select({ email: members.email })
        .from(members)
        .where(eq(members.id, userId))
        .limit(1);
      return {
        success: true,
        data: { emails: me ? [{ email: me.email, isPrimary: true }] : [] },
      };
    }

    return { success: true, data: { emails: rows } };
  } catch {
    return { success: true, data: { emails: [] } };
  }
}
