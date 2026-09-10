import { redirect } from "next/navigation";
import Link from "next/link";
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

/** True once the person has submitted club registration (not a bare auth-only row). */
function hasSubmittedRegistration(member: {
  role: string;
  membershipStatus?: string | null;
  studentId?: string | null;
  mpesaReference?: string | null;
  communitySlugs?: string[];
  feeAmountPaid?: number | null;
}): boolean {
  if (member.role === "member" || member.role === "exec" || member.role === "admin") return true;
  if (member.membershipStatus === "approved" || member.membershipStatus === "rejected") return true;
  // Real application markers — not just a default pending row from first sign-in
  if (member.studentId?.trim()) return true;
  if (member.mpesaReference?.trim()) return true;
  if ((member.feeAmountPaid ?? 0) > 0) return true;
  if ((member.communitySlugs?.length ?? 0) > 0) return true;
  return false;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const role = await getCurrentRole();
  const isExecOrAdmin = role === "exec" || role === "admin";
  const isAdmin = role === "admin";

  const member = await getCurrentMember();

  if (!member) {
    if (isExecOrAdmin) redirect(ROUTES.signIn);
    redirect(`${ROUTES.register}?complete=1`);
  }

  // Already applied / approved members must never be bounced back to /register
  // just because a community row is missing.
  if (!isExecOrAdmin && !hasSubmittedRegistration(member)) {
    redirect(`${ROUTES.register}?complete=1`);
  }

  // Membership must be approved before the full dashboard is usable.
  if (!hasDashboardAccess(member)) {
    return <PendingApprovalScreen fullName={member.fullName} email={member.email} />;
  }

  if (!isExecOrAdmin) {
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
