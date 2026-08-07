import Link from "next/link";
import { UserPen, Compass, CalendarPlus } from "lucide-react";
import { ROUTES } from "@/constants/routes";

const ACTIONS = [
  { href: ROUTES.join, label: "Edit My Profile", icon: UserPen },
  { href: ROUTES.communities, label: "Browse Communities", icon: Compass },
  { href: ROUTES.events, label: "Find an Event", icon: CalendarPlus },
];

export function MemberQuickActions() {
  return (
    <div className="rounded-[var(--radius-card-sm)] border border-line bg-white p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">Quick Actions</h3>
      <div className="flex flex-col gap-2">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-2.5 rounded-xl border border-line px-3.5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-cream"
          >
            <action.icon size={15} className="text-green" />
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
