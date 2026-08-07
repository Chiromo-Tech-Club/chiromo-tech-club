"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { DashboardSidebar } from "./DashboardSidebar";
import { HamburgerToggle } from "../animations/HambugerToggle";
import type { ExecTitle } from "@/types/exec-title";

interface ExecDashboardShellProps {
  execTitle: ExecTitle | null;
  isAdmin: boolean;
  children: React.ReactNode;
}

export function ExecDashboardShell({ execTitle, isAdmin, children }: ExecDashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-cream">
      <DashboardSidebar
        execTitle={execTitle}
        isAdmin={isAdmin}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-3 sm:px-6 md:px-8 md:py-4">
          <div className="flex min-w-0 items-center gap-2">
            <HamburgerToggle open={mobileOpen} onToggle={() => setMobileOpen((v) => !v)} className="-ml-2 md:hidden" />
            <span className="truncate font-display text-sm font-semibold text-ink">Executive Portal</span>
          </div>
          <UserButton />
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}