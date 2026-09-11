import Link from "next/link";
import { UserPen, Compass, CalendarPlus, MessageCircle } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { SITE_CONFIG } from "@/config/site";

const ACTIONS = [
  { href: ROUTES.dashboardProfile, label: "Edit My Profile", icon: UserPen, external: false },
  { href: ROUTES.communities, label: "Browse Communities", icon: Compass, external: false },
  { href: ROUTES.events, label: "Find an Event", icon: CalendarPlus, external: false },
  {
    href: SITE_CONFIG.socials.whatsapp,
    label: "Join CTC WhatsApp",
    icon: MessageCircle,
    external: true,
  },
];

export function MemberQuickActions() {
  return (
    <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">Quick Actions</h3>
      <div className="flex flex-col gap-2">
        {ACTIONS.map((action) =>
          action.external ? (
            <a
              key={action.href}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-xl border border-line px-3.5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-cream"
            >
              <action.icon size={15} className="text-green" />
              {action.label}
            </a>
          ) : (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-2.5 rounded-xl border border-line px-3.5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-cream"
            >
              <action.icon size={15} className="text-green" />
              {action.label}
            </Link>
          ),
        )}
      </div>
      <p className="mt-3 text-[11px] text-muted">
        Official Chiromo Tech Club WhatsApp community for announcements and updates.
      </p>
    </div>
  );
}
