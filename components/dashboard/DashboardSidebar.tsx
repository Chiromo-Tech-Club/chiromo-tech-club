"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, X } from "lucide-react";
import { SHARED_NAV_ITEMS, EXEC_NAV } from "@/config/dashboard-nav";
import { EXEC_TITLE_LABELS, type ExecTitle } from "@/types/exec-title";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils/cn";

interface DashboardSidebarProps {
  execTitle: ExecTitle | null;
  isAdmin: boolean;
  /** Controlled from the parent shell — this component owns no open/close state itself. */
  mobileOpen: boolean;
  onClose: () => void;
}

function NavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "block rounded-xl px-3.5 py-2.5 text-sm transition-colors",
        active ? "bg-green text-white font-medium" : "text-ink-2 hover:bg-cream hover:text-ink"
      )}
    >
      {label}
    </Link>
  );
}

export function DashboardSidebar({ execTitle, isAdmin, mobileOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();

  const execSectionsToShow: ExecTitle[] = execTitle
    ? [execTitle]
    : isAdmin
      ? (Object.keys(EXEC_NAV) as ExecTitle[])
      : [];

  const sidebarContent = (
    <>
      <Link
        href={ROUTES.dashboard}
        onClick={onClose}
        className="mb-6 flex items-center gap-2 px-2 font-display text-sm font-bold text-ink"
      >
        <LayoutDashboard size={18} className="text-green" />
        <span>Dashboard</span>
      </Link>

      <div
        className={cn(
          "mb-2 block rounded-xl px-3.5 py-2.5 text-sm",
          pathname === ROUTES.dashboard ? "bg-green text-white font-medium" : ""
        )}
      >
        <Link href={ROUTES.dashboard} onClick={onClose} className="block">
          Overview
        </Link>
      </div>

      <div className="mb-6">
        <h4 className="mb-2 px-3.5 text-xs font-semibold uppercase tracking-wide text-muted">Shared</h4>
        <nav className="flex flex-col gap-1">
          {SHARED_NAV_ITEMS.map((item) => (
            <NavLink key={item.slug} href={`/dashboard/${item.slug}`} label={item.label} onClick={onClose} />
          ))}
        </nav>
      </div>

      {execSectionsToShow.map((title) => (
        <div key={title} className="mb-6">
          <h4 className="mb-2 px-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
            {EXEC_TITLE_LABELS[title]}
          </h4>
          <nav className="flex flex-col gap-1">
            {EXEC_NAV[title].map((item) => (
              <NavLink
                key={item.slug}
                href={ROUTES.dashboardSection(title, item.slug)}
                label={item.label}
                onClick={onClose}
              />
            ))}
          </nav>
        </div>
      ))}
    </>
  );

  return (
    <>
      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" onClick={onClose} />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform overflow-y-auto bg-white p-6 shadow-xl transition-transform duration-300 ease-in-out md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-4 flex items-center justify-between border-b border-line pb-4">
          <span className="font-display text-sm font-bold text-ink">Menu</span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-cream hover:text-ink"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop persistent sidebar */}
      <aside className="hidden min-h-screen w-64 flex-none border-r border-line bg-white px-4 py-6 md:block">
        {sidebarContent}
      </aside>
    </>
  );
}