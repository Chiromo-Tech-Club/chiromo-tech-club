import Link from "next/link";
import { isNull, desc } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { getDb } from "@/lib/drizzle/client";
import { members, memberCommunities } from "@/lib/drizzle/schema";
import { getCurrentRole } from "@/lib/supabase/auth-helpers";
import { MembersTable, type ExtendedMemberRow } from "@/features/admin/MembersTable";
import type { MemberStatus } from "@/types/member-status";
import { ROUTES } from "@/constants/routes";

export const metadata = { title: "Admin — Members & Approvals" };

async function getMembers(): Promise<ExtendedMemberRow[]> {
  const { ensureMembersColumns } = await import("@/lib/drizzle/ensure-members-columns");
  try {
    await ensureMembersColumns();
  } catch (err) {
    console.warn("ensureMembersColumns failed:", err);
  }

  const db = getDb();

  const rows = await db
    .select({
      id: members.id,
      fullName: members.fullName,
      email: members.email,
      username: members.username,
      role: members.role,
      execTitle: members.execTitle,
      avatarUrl: members.avatarUrl,
      bio: members.bio,
      githubHandle: members.githubHandle,
      studentId: members.studentId,
      campus: members.campus,
      isChiromo: members.isChiromo,
      institutionName: members.institutionName,
      department: members.department,
      course: members.course,
      yearOfStudy: members.yearOfStudy,
      phoneNumber: members.phoneNumber,
      experienceLevel: members.experienceLevel,
      learningGoals: members.learningGoals,
      authProvider: members.authProvider,
      membershipStatus: members.membershipStatus,
      membershipFeeStatus: members.membershipFeeStatus,
      feeAmountPaid: members.feeAmountPaid,
      mpesaReference: members.mpesaReference,
      mpesaPhoneNumber: members.mpesaPhoneNumber,
      cardTheme: members.cardTheme,
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
    <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 sm:py-8">
      <div className="mb-5 sm:mb-6">
        <Link
          href={ROUTES.dashboard}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-sky hover:underline sm:mb-4"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
        <h1 className="font-display text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
          Member Approvals &amp; Administration
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-text-2">
          Review full applicant details (phone, tracks, academic info), preview each membership card,
          manage fee deposits, then approve or assign executive seats.
        </p>
      </div>

      <MembersTable members={memberRows} />
    </div>
  );
}
