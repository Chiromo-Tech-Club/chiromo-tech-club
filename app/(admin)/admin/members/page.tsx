import { isNull } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { members, memberCommunities } from "@/lib/drizzle/schema";
import { requireRole } from "@/lib/supabase/auth-helpers";
import { MembersTable, type MemberRow } from "@/features/admin/MembersTable";

export const metadata = { title: "Admin — Members" };

async function getMembers(): Promise<MemberRow[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: members.id,
      fullName: members.fullName,
      email: members.email,
      role: members.role,
      execTitle: members.execTitle,
    })
    .from(members)
    .where(isNull(members.deletedAt))
    .orderBy(members.fullName);

  const communityRows = await db
    .select({ memberId: memberCommunities.memberId, communitySlug: memberCommunities.communitySlug })
    .from(memberCommunities);

  const communitiesByMember = new Map<string, string[]>();
  for (const c of communityRows) {
    const list = communitiesByMember.get(c.memberId) ?? [];
    list.push(c.communitySlug);
    communitiesByMember.set(c.memberId, list);
  }

  return rows.map((row) => ({
    ...row,
    communitySlugs: communitiesByMember.get(row.id) ?? [],
  }));
}

export default async function AdminMembersPage() {
  const check = await requireRole("admin");
  if (!check.ok) {
    // FIX: Removed <main> and pt-40
    return <div className="text-text-2">You don't have access to this page.</div>;
  }

  const memberRows = await getMembers();

  return (
    // FIX: Changed <main> to <div> and removed pt-40 / px-8 so it fits perfectly in the shell
    <div className="mx-auto max-w-[1280px]">
      <h1 className="font-display text-3xl">Members</h1>
      <p className="mt-2 max-w-xl text-sm text-text-2">
        Promote a member to Executive (and assign their seat) or Admin. Changes apply immediately — there's
        nothing else to update elsewhere.
      </p>
      <div className="mt-8">
        <MembersTable members={memberRows} />
      </div>
    </div>
  );
}