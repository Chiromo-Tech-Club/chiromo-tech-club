// Auth/role guard added here (was previously handled inside Clerk's
// clerkMiddleware() via sessionClaims.metadata.role — see commented-out
// block in root middleware.ts). Reads the role straight off your existing
// `members` table (see db/schema.ts) — no separate `profiles` table
// needed since members already serves that purpose.
//
// Run once in the Supabase SQL editor (creates a member row automatically
// on every new Google sign-up, keyed by the same id as auth.users):
//
// create or replace function public.handle_new_user()
// returns trigger as $$
// begin
//   insert into public.members (id, full_name, email, avatar_url)
//   values (
//     new.id,
//     coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
//     new.email,
//     new.raw_user_meta_data->>'avatar_url'
//   );
//   return new;
// end;
// $$ language plpgsql security definer;
//
// create trigger on_auth_user_created
//   after insert on auth.users
//   for each row execute procedure public.handle_new_user();

import Link from "next/link";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { getCurrentRole } from "@/lib/supabase/auth-helpers";
import { getAuthUserId } from "@/lib/supabase/auth-helpers";

const ADMIN_NAV = [
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
    <div>
      <div className="fixed inset-x-0 top-20 z-40 border-b border-line bg-cream/95 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-[1280px] gap-1 px-8 py-2.5">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:bg-cream-2 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}