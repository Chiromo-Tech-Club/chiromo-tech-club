import Link from "next/link";
import { ROUTES } from "@/constants/routes";

const ADMIN_NAV = [
  { href: ROUTES.admin, label: "Projects" },
  { href: ROUTES.adminMembers, label: "Members" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="fixed inset-x-0 top-20 z-40 border-b border-line bg-cream/95 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-[1280px] gap-1 px-8 py-2.5">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:bg-white hover:text-ink"
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
