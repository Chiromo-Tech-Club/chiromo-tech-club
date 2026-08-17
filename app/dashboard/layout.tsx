import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "@/lib/drizzle/client";
import { memberCommunities } from "@/lib/drizzle/schema";
import { getCurrentRole, getCurrentExecTitle } from "@/lib/supabase/auth-helpers";
import { getCurrentMember } from "@/lib/supabase/get-current-member";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { ExecDashboardShell } from "@/components/dashboard/ExecDashboard"; // Ensure correct filename
import { MemberOverview } from "@/features/dashboard/MemberOverview";
import { ROUTES } from "@/constants/routes";

export const metadata = { title: "Dashboard" };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const role = await getCurrentRole();
  const isExecOrAdmin = role === "exec" || role === "admin";
  const isAdmin = role === "admin";

  const member = await getCurrentMember();

  if (!member) {
    redirect(ROUTES.signUp);
  }

  if (!isExecOrAdmin) {
    const db = getDb();
    const [communityRow] = await db
      .select({ id: memberCommunities.id })
      .from(memberCommunities)
      .where(eq(memberCommunities.memberId, member.id))
      .limit(1);

    if (!communityRow) {
      redirect(ROUTES.join);
    }

    return (
      <div className="min-h-screen bg-cream">
        <header className="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-3 sm:px-6 md:px-8 md:py-4">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <span className="truncate font-display text-sm font-semibold text-ink">Member Dashboard</span>
          </Link>
          <UserMenu avatarUrl={member.avatarUrl ?? null} fullName={member.fullName ?? "Member"} />
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6 md:p-8">
          <MemberOverview member={member as any} />
        </main>
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
    <ExecDashboardShell 
      execTitle={execTitle} 
      isAdmin={isAdmin} 
      user={userPayload}
    >
      {children}
    </ExecDashboardShell>
  );
}