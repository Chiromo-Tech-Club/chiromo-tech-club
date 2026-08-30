import { isNull, desc } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { members, memberCommunities } from "@/lib/drizzle/schema";
import { getCurrentRole } from "@/lib/supabase/auth-helpers";
import { MembersTable, type ExtendedMemberRow } from "@/features/admin/MembersTable";
import type { MemberStatus } from "@/types/member-status";

export const metadata = { title: "Admin — Members & Approvals" };

async function getMembers(): Promise<ExtendedMemberRow[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: members.id,
      fullName: members.fullName,
      email: members.email,
      role: members.role,
      execTitle: members.execTitle,
      studentId: members.studentId,
      campus: members.campus,
      isChiromo: members.isChiromo,
      course: members.course,
      yearOfStudy: members.yearOfStudy,
      phoneNumber: members.phoneNumber,
      authProvider: members.authProvider,
      membershipStatus: members.membershipStatus,
      membershipFeeStatus: members.membershipFeeStatus,
      feeAmountPaid: members.feeAmountPaid,
      mpesaReference: members.mpesaReference,
      createdAt: members.createdAt,
    })
    .from(members)
    .where(isNull(members.deletedAt))
    .orderBy(desc(members.createdAt));

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
    status: (row.membershipStatus as MemberStatus) || (row.role === "visitor" ? "pending" : "approved"),
    isChiromo: row.isChiromo ?? true,
    feeAmountPaid: row.feeAmountPaid ?? 0,
    communitySlugs: communitiesByMember.get(row.id) ?? [],
    createdAt: row.createdAt ? row.createdAt.toISOString() : undefined,
  }));
}

export default async function AdminMembersPage() {
  const role = await getCurrentRole();
  if (role !== "admin" && role !== "exec") {
    return <div className="text-text-2">You don&apos;t have access to this page.</div>;
  }

  const memberRows = await getMembers();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold text-ink">Member Approvals & Administration</h1>
        <p className="mt-2 max-w-2xl text-sm text-text-2">
          Review pending club registrations, track student ID & campus verification, manage membership fee deposits, and assign executive leadership seats.
        </p>
      </div>

      <MembersTable members={memberRows} />
    </div>
  );
}
