import { isNull } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { members, memberCommunities } from "@/lib/drizzle/schema";
import { requireRole } from "@/lib/clerk/client";
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
    return <main className="px-8 pt-40 text-text-2">You don&apos;t have access to this page.</main>;
  }

  const memberRows = await getMembers();

  return (
    <main className="mx-auto max-w-[1280px] px-8 pb-24 pt-40">
      <h1 className="font-display text-3xl">Members</h1>
      <p className="mt-2 max-w-xl text-sm text-text-2">
        Promote a member to Executive (and assign their seat) or Admin. Changes apply immediately — both here and
        to their Clerk account, so there&apos;s nothing else to update elsewhere.
      </p>
      <div className="mt-8">
        <MembersTable members={memberRows} />
      </div>
    </main>
  );
}
