// ─────────────────────────────────────────────────────────────────────────
// CLERK (commented out — kept for reference / rollback)
// ─────────────────────────────────────────────────────────────────────────
// import { currentUser } from "@clerk/nextjs/server";
// import { eq, isNull, and } from "drizzle-orm";
// import { getDb } from "@/lib/drizzle/client";
// import { members } from "@/lib/drizzle/schema";
//
// export async function getCurrentMember() {
//   const user = await currentUser();
//   if (!user) return null;
//
//   const db = getDb();
//   const [member] = await db
//     .select()
//     .from(members)
//     .where(and(eq(members.clerkUserId, user.id), isNull(members.deletedAt)))
//     .limit(1);
//
//   return member ?? null;
// }
// ─────────────────────────────────────────────────────────────────────────

import { eq, isNull, and } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { members, memberCommunities } from "@/lib/drizzle/schema";
import { getAuthUserId } from "@/lib/supabase/auth-helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Fetches the full `members` row for the logged-in user, WITH
 * communitySlugs attached — self-healing (creates the row if missing).
 *
 * communitySlugs is a real requirement, not a leftover Clerk-era field:
 * MemberOverview.tsx uses it to filter community-specific projects and
 * to drive MyCommunitiesWidget, so it has to be present on every return
 * path here, not just on the lucky path where a row already existed.
 */
export async function getCurrentMember() {
  const userId = await getAuthUserId();
  if (!userId) return null;

  const db = getDb();

  async function withCommunitySlugs(member: typeof members.$inferSelect) {
    const rows = await db
      .select({ communitySlug: memberCommunities.communitySlug })
      .from(memberCommunities)
      .where(eq(memberCommunities.memberId, member.id));
    return { ...member, communitySlugs: rows.map((r) => r.communitySlug) };
  }

  const [existing] = await db
    .select()
    .from(members)
    .where(and(eq(members.id, userId), isNull(members.deletedAt)))
    .limit(1);

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

  const [fromTrigger] = await db
    .select()
    .from(members)
    .where(and(eq(members.id, userId), isNull(members.deletedAt)))
    .limit(1);

  return fromTrigger ? withCommunitySlugs(fromTrigger) : null;
}