"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import {useSupabaseAuth} from "@/lib/supabase/use-auth";
import { NAV_ITEMS } from "@/config/nav";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/alignui/button";
import { HamburgerToggle } from "@/components/animations/HambugerToggle";
import { cn } from "@/lib/utils/cn";
import {UserMenu} from "@/components/dashboard/UserMenu";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { user, isSignedIn } =useSupabaseAuth();

  return (
    <div className="md:hidden">
      {/* Toggle Button — same animated hamburger used on the dashboard */}
      <HamburgerToggle open={open} onToggle={() => setOpen((v) => !v)} />

      {/* Mobile Menu Overlay Dropdown */}
      <div
        className={cn(
          "fixed inset-x-0 top-[65px] z-50 flex h-[calc(100vh-65px)] w-full flex-col justify-between overflow-y-auto bg-cream px-6 py-8 shadow-2xl transition-all duration-300 ease-in-out sm:top-[73px] sm:h-[calc(100vh-73px)]",
          open
            ? "opacity-100 pointer-events-auto translate-y-0"
            : "opacity-0 pointer-events-none -translate-y-2"
        )}
      >
        {/* Navigation Links */}
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b border-line py-4 font-display text-2xl font-bold text-ink transition-colors hover:text-ink-2"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Action Buttons: Login, Register & Join — signed-out visitors only */}
        {!isSignedIn && (
          <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6">
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-xl border border-line bg-white/60 py-3 text-sm font-bold text-ink shadow-sm transition-all active:scale-95 hover:bg-white"
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-xl border border-line bg-white/60 py-3 text-sm font-bold text-ink shadow-sm transition-all active:scale-95 hover:bg-white"
              >
                Register
              </Link>
            </div>

            <Button asChild variant="primary" className="justify-center">
              <Link href={ROUTES.join} onClick={() => setOpen(false)}>
                Join Us
              </Link>
            </Button>
          </div>
        )}

        {/* Signed-in state — Dashboard shortcut + Clerk's account menu */}
        {isSignedIn && (
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6 pb-6">
            <Link
              href={ROUTES.dashboard}
              onClick={() => setOpen(false)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line bg-white/60 py-3 text-sm font-bold text-ink shadow-sm transition-all active:scale-95 hover:bg-white"
            >
              <LayoutDashboard size={16} strokeWidth={2.4} />
              Dashboard
            </Link>

            {/* Clerk UserButton with forced styling overrides */}

<UserMenu
              avatarUrl={user?.user_metadata?.avatar_url ?? null}
              fullName={user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? "Member"}
            />
          </div>
        )}
      </div>
    </div>
  );
}