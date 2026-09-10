// Auth/role guard added here (was previously handled inside Clerk's
// clerkMiddleware() via sessionClaims.metadata.role — see commented-out
// block in root middleware.ts). Reads the role straight off your existing
// `members` table (see db/schema.ts) — no separate `profiles` table
// needed since members already serves that purpose.

import Link from "next/link";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { getCurrentRole, getAuthUserId } from "@/lib/supabase/auth-helpers";

const ADMIN_NAV = [
  { href: ROUTES.dashboard, label: "← Dashboard" },
  { href: ROUTES.admin, label: "Projects" },
  { href: ROUTES.adminMembers, label: "Members" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const userId = await getAuthUserId();
  if (!userId) redirect(ROUTES.signIn);

  const role = await getCurrentRole();

  if (role !== "admin" && role !== "exec") {
    redirect(ROUTES.dashboard);
  }

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-cream">
      <div className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 py-2.5 sm:px-6 md:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:bg-cream-2 hover:text-ink sm:px-4 sm:text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}
