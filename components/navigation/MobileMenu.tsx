"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS } from "@/config/nav";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/alignui/button";
import { cn } from "@/lib/utils/cn";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Toggle Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile Menu Dropdown Panel */}
      <div
        className={cn(
          "absolute left-0 right-0 top-full z-50 flex min-h-[calc(100dvh-100%)] w-full flex-col justify-between overflow-y-auto bg-cream px-6 py-8 shadow-2xl transition-all duration-300 ease-in-out",
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
              className="border-b border-line py-4 font-display text-2xl font-bold text-ink"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Action Buttons: Login, Register & Join */}
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
      </div>
    </div>
  );
}