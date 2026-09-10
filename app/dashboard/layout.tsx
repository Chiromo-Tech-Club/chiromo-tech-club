import Link from "next/link";
import { getCurrentRole, getCurrentExecTitle } from "@/lib/supabase/auth-helpers";
import { getCurrentMember } from "@/lib/supabase/get-current-member";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { ExecDashboardShell } from "@/components/dashboard/ExecDashboard";
import { ROUTES } from "@/constants/routes";

export const metadata = { title: "Dashboard" };

/**
 * No redirects to /register. Signed-in users with a profile see the dashboard.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const role = await getCurrentRole();
  const isExecOrAdmin = role === "exec" || role === "admin";
  const isAdmin = role === "admin";

  const member = await getCurrentMember();

  if (!isExecOrAdmin) {
    return (
      <div className="min-h-screen bg-cream">
        <header className="flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 sm:px-6 md:px-8 md:py-4">
          <Link href={ROUTES.dashboard} className="flex min-w-0 items-center gap-2">
            <span className="truncate font-display text-sm font-semibold text-ink">Member Dashboard</span>
          </Link>
          <UserMenu
            avatarUrl={member?.avatarUrl ?? null}
            fullName={member?.fullName ?? "Member"}
          />
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    );
  }

  const execTitle = await getCurrentExecTitle();

  return (
    <ExecDashboardShell
      execTitle={execTitle}
      isAdmin={isAdmin}
      user={{
        email: member?.email ?? "",
        user_metadata: {
          avatar_url: member?.avatarUrl,
          full_name: member?.fullName,
        },
      }}
    >
      {children}
    </ExecDashboardShell>
  );
}
