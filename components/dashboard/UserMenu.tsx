"use client";

// Minimal account menu: avatar, edit profile, sign-out.

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ROUTES } from "@/constants/routes";

interface UserMenuProps {
  avatarUrl: string | null;
  fullName: string;
}

export function UserMenu({ avatarUrl, fullName }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  const initial = fullName?.trim()?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-line"
        aria-label="Account menu"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-navy text-xs font-semibold text-white">
            {initial}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-48 rounded-card-sm border border-line bg-surface p-1 shadow-lg">
            <div className="truncate px-3 py-2 text-label-xs font-medium text-ink-2">{fullName}</div>
            <Link
              href={ROUTES.dashboardProfile}
              onClick={() => setOpen(false)}
              className="block w-full rounded-card-sm px-3 py-2 text-left text-label-sm text-ink transition-colors hover:bg-cream-2"
            >
              Edit profile
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full rounded-card-sm px-3 py-2 text-left text-label-sm text-ink transition-colors hover:bg-cream-2 disabled:opacity-60"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
