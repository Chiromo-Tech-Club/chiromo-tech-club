import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { getCurrentRole, getCurrentExecTitle } from "@/lib/clerk/client";
import { getCurrentMember } from "@/lib/clerk/get-current-user";
import { ExecDashboardShell } from "@/components/dashboard/ExecDashboard";
import { MemberOverview } from "@/features/dashboard/MemberOverview";

export const metadata = { title: "Dashboard" };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const role = await getCurrentRole();
  const isExecOrAdmin = role === "exec" || role === "admin";

  // 1. Non-exec / Non-admin users (members & visitors) — no sidebar, so no hamburger needed.
  if (!isExecOrAdmin) {
    const member = await getCurrentMember();

    return (
      <div className="min-h-screen bg-cream">
        <header className="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-3 sm:px-6 md:px-8 md:py-4">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <span className="truncate font-display text-sm font-semibold text-ink">Member Dashboard</span>
          </Link>
          <UserButton />
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6 md:p-8">
          {member ? (
            <MemberOverview member={member} />
          ) : (
            <div className="rounded-[var(--radius-card-sm)] border border-line bg-white p-6 text-sm text-muted">
              Unable to load profile data. Please try signing in again.
            </div>
          )}
        </main>
      </div>
    );
  }

  // 2. Executive Portal — sidebar + single header, mobile state owned by the shell.
  const execTitle = await getCurrentExecTitle();

  return (
    <ExecDashboardShell execTitle={execTitle} isAdmin={role === "admin"}>
      {children}
    </ExecDashboardShell>
  );
}