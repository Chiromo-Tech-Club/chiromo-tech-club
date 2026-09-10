import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "@/lib/drizzle/client";
import { memberCommunities } from "@/lib/drizzle/schema";
import { getCurrentRole, getCurrentExecTitle } from "@/lib/supabase/auth-helpers";
import { getCurrentMember } from "@/lib/supabase/get-current-member";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { ExecDashboardShell } from "@/components/dashboard/ExecDashboard";
import { PendingApprovalScreen } from "@/components/dashboard/PendingApprovalScreen";
import { ROUTES } from "@/constants/routes";

export const metadata = { title: "Dashboard" };

function hasDashboardAccess(member: {
  role: string;
  membershipStatus?: string | null;
}): boolean {
  if (member.role === "admin" || member.role === "exec") return true;
  const status =
    member.membershipStatus ??
    (member.role === "member" ? "approved" : "pending");
  return status === "approved";
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const role = await getCurrentRole();
  const isExecOrAdmin = role === "exec" || role === "admin";
  const isAdmin = role === "admin";

  const member = await getCurrentMember();

  if (!member) {
    redirect(`${ROUTES.register}?complete=1`);
  }

  // Membership must be approved before the dashboard (and its links) are usable.
  if (!hasDashboardAccess(member)) {
    return <PendingApprovalScreen fullName={member.fullName} email={member.email} />;
  }

  if (!isExecOrAdmin) {
    const db = getDb();
    const [communityRow] = await db
      .select({ id: memberCommunities.id })
      .from(memberCommunities)
      .where(eq(memberCommunities.memberId, member.id))
      .limit(1);

    if (!communityRow) {
      redirect(`${ROUTES.register}?complete=1`);
    }

    return (
      <div className="min-h-screen bg-cream">
        <header className="flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 sm:px-6 md:px-8 md:py-4">
          <Link href={ROUTES.dashboard} className="flex min-w-0 items-center gap-2">
            <span className="truncate font-display text-sm font-semibold text-ink">Member Dashboard</span>
          </Link>
          <UserMenu avatarUrl={member.avatarUrl ?? null} fullName={member.fullName ?? "Member"} />
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    );
  }

  const execTitle = await getCurrentExecTitle();

  const userPayload = {
    email: member.email,
    user_metadata: {
      avatar_url: member.avatarUrl,
      full_name: member.fullName,
    },
  };

  return (
    <ExecDashboardShell execTitle={execTitle} isAdmin={isAdmin} user={userPayload}>
      {children}
    </ExecDashboardShell>
  );
}
