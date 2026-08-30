import { eq, isNull, and } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { members, memberCommunities } from "@/lib/drizzle/schema";
import { getAuthUserId } from "@/lib/supabase/auth-helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Fetches the full `members` row for the logged-in user, WITH
 * communitySlugs attached — self-healing (creates the row if missing).
 *
 * Implements graceful schema fallback so that if newly added columns
 * have not yet been migrated in remote Postgres, it still resolves
 * cleanly without breaking the dashboard or layouts.
 */
export async function getCurrentMember() {
  const userId = await getAuthUserId();
  if (!userId) return null;

  const db = getDb();

  async function withCommunitySlugs(member: any) {
    try {
      const rows = await db
        .select({ communitySlug: memberCommunities.communitySlug })
        .from(memberCommunities)
        .where(eq(memberCommunities.memberId, member.id));
      return { ...member, communitySlugs: rows.map((r) => r.communitySlug) };
    } catch {
      return { ...member, communitySlugs: [] };
    }
  }

  // Safe fetch helper that tries full select and falls back to core fields if schema hasn't migrated columns
  async function fetchMemberRow(targetId: string) {
    try {
      const [row] = await db
        .select()
        .from(members)
        .where(and(eq(members.id, targetId), isNull(members.deletedAt)))
        .limit(1);
      return row ?? null;
    } catch (err) {
      console.warn("Full members row select failed (likely pending column migration), falling back to core columns:", err);
      try {
        const [coreRow] = await db
          .select({
            id: members.id,
            fullName: members.fullName,
            email: members.email,
            role: members.role,
            execTitle: members.execTitle,
            avatarUrl: members.avatarUrl,
            bio: members.bio,
            githubHandle: members.githubHandle,
            createdAt: members.createdAt,
            updatedAt: members.updatedAt,
            deletedAt: members.deletedAt,
          })
          .from(members)
          .where(and(eq(members.id, targetId), isNull(members.deletedAt)))
          .limit(1);

        if (!coreRow) return null;

        return {
          ...coreRow,
          studentId: null,
          campus: "Chiromo Campus",
          isChiromo: true,
          course: null,
          yearOfStudy: null,
          phoneNumber: null,
          authProvider: "email_password",
          membershipStatus: "pending",
          membershipFeeStatus: "unpaid",
          feeAmountPaid: 0,
          mpesaReference: null,
          reviewedById: null,
          reviewedAt: null,
          reviewNotes: null,
        } as typeof members.$inferSelect;
      } catch (fallbackErr) {
        console.error("Core members fallback query also failed:", fallbackErr);
        return null;
      }
    }
  }

  const existing = await fetchMemberRow(userId);
  if (existing) return withCommunitySlugs(existing);

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "New Member";
  const avatarUrl = (user.user_metadata?.avatar_url as string | undefined) ?? null;

  try {
    const [created] = await db
      .insert(members)
      .values({
        id: userId,
        fullName,
        email: user.email ?? "",
        avatarUrl,
      })
      .onConflictDoNothing()
      .returning();

    if (created) return withCommunitySlugs(created);
  } catch (insertErr) {
    console.warn("Insert into members encountered an issue:", insertErr);
  }

  const fromTrigger = await fetchMemberRow(userId);
  return fromTrigger ? withCommunitySlugs(fromTrigger) : null;
}
