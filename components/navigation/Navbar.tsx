"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Search, LayoutDashboard } from "lucide-react";
// import { useAuth, UserButton } from "@clerk/nextjs"; // CLERK — kept for reference/rollback
import { useSupabaseAuth } from "@/lib/supabase/use-auth";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/alignui/button";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { NavDropdown } from "@/components/navigation/NavDropdown";
import { MobileMenu } from "@/components/navigation/MobileMenu";
import { useCommandPaletteStore } from "@/store/command-palette-store";

export function Navbar() {
  const openPalette = useCommandPaletteStore((s) => s.open);
  // const { isSignedIn } = useAuth(); // CLERK — kept for reference/rollback
  const { user, isSignedIn } = useSupabaseAuth();

  // Global Keyboard Listener: Cmd+K / Ctrl+K opens the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openPalette();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openPalette]);

  return (
    <nav className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-line/40 bg-cream/85 px-4 py-3 backdrop-blur-md transition-all sm:px-8 sm:py-4">
      
      {/* Brand */}
      <Link href={ROUTES.home} className="group flex items-center gap-3 font-display text-lg font-extrabold tracking-tight">
        <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-line/30 bg-white shadow-inner transition-transform duration-500 group-hover:rotate-12 group-hover:scale-105 sm:h-14 sm:w-14">
          <Image 
            src="/images/image.svg" 
            alt="ctc_uon logo" 
            fill 
            className="object-contain p-1.5" 
          />
        </div>
      </Link>

      {/* Desktop Links */}
      <div className="hidden items-center gap-8 md:flex">
        <NavDropdown
          label="About"
          items={[
            { label: "Who We Are", href: `${ROUTES.home}#who` },
            { label: "Our Impact", href: `${ROUTES.home}#impact` },
          ]}
        />
        <NavDropdown
          label="Programs"
          items={[
            { label: "Communities", href: ROUTES.communities },
            { label: "Discover the Team", href: `${ROUTES.home}#team` },
          ]}
        />
        <NavDropdown
          label="Get Involved"
          items={[
            { label: "Join the Club", href: ROUTES.join },
            { label: "FAQ", href: `${ROUTES.home}#faq` },
          ]}
        />
      </div>

      {/* Actions (Far Right) */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Command Palette Launcher Button */}
        <button
          type="button"
          onClick={openPalette}
          aria-label="Open Command Palette Search"
          className="group hidden items-center gap-3 rounded-full border border-line/60 bg-white/70 px-4 py-2 text-xs font-medium text-ink-2 shadow-sm backdrop-blur-md transition-all hover:border-ink/30 hover:bg-white hover:text-ink hover:shadow-md md:flex lg:w-60"
        >
          <Search size={15} strokeWidth={2.2} className="text-ink-2 transition-colors group-hover:text-ink" />
          <span className="flex-1 text-left font-sans text-xs text-ink-2/80 group-hover:text-ink">
            Search club...
          </span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded-full border border-line bg-cream-2/80 px-2 font-mono text-[10px] font-bold text-ink-2 transition-all group-hover:bg-cream group-hover:text-ink">
            ⌘K
          </kbd>
        </button>
        
        {/* Get Started Dropdown & Join Button Container — signed-out visitors only */}
        {!isSignedIn && (
          <div className="hidden items-center gap-2 sm:flex">

            {/* Hover Dropdown for Get Started */}
            <div className="group relative">
              <button className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-ink/80 transition-all hover:bg-line/20 hover:text-ink">
                Get Started
                <ChevronDown size={14} strokeWidth={3} className="transition-transform duration-300 group-hover:rotate-180" />
              </button>

              {/* Invisible hover bridge */}
              <div className="absolute right-0 top-full h-4 w-full" />

              {/* Dropdown Panel */}
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-40 pointer-events-none translate-y-2 opacity-0 transition-all duration-300 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                <div className="flex flex-col gap-1 rounded-2xl border border-line/40 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl">
                  <Link
                    href="/sign-in"
                    className="rounded-xl px-4 py-2.5 text-sm font-bold text-ink/80 transition-all hover:bg-cream hover:text-ink hover:translate-x-1"
                  >
                    Login
                  </Link>
                  <Link
                    href="/sign-up"
                    className="rounded-xl px-4 py-2.5 text-sm font-bold text-ink/80 transition-all hover:bg-cream hover:text-ink hover:translate-x-1"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>

            <MagneticButton>
              <Button asChild variant="primary" className="rounded-full px-6 shadow-md transition-transform hover:-translate-y-0.5">
                <Link href={ROUTES.join}>Join Us</Link>
              </Button>
            </MagneticButton>
          </div>
        )}

        {/* Signed-in state — Dashboard shortcut + account menu */}
        {isSignedIn && (
          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href={ROUTES.dashboard}
              className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-ink/80 transition-all hover:bg-line/20 hover:text-ink"
            >
              <LayoutDashboard size={15} strokeWidth={2.4} />
              Dashboard
            </Link>

            {/* ─────────────────────────────────────────────────────────
                CLERK (commented out — kept for reference / rollback)
               ───────────────────────────────────────────────────────── */}
            {/*
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 border border-line/50",
                  userButtonPopoverCard: "bg-white rounded-2xl border border-line/40 shadow-xl !clip-path-none !mask-none",
                  userButtonPopoverFooter: "hidden",
                }
              }}
            />
            */}
            {/* ───────────────────────────────────────────────────────── */}

            {/* Uses Google's profile data straight off the auth session —
                no DB round trip needed just to show an avatar in the navbar. */}
            <UserMenu
              avatarUrl={user?.user_metadata?.avatar_url ?? null}
              fullName={user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? "Member"}
            />
          </div>
        )}
        
        <MobileMenu />
      </div>
    </nav>
  );
}