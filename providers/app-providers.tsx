"use client";

import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "../components/providers/ThemeProvider";
import { ReducedMotionProvider } from "../components/providers/ReducedMotionProvider";
import { CommandPaletteProvider } from "../components/providers/CommandPaletteProvider";
import { ClerkRoleProvider } from "../components/providers/ClerkRoleProvider";
import { TooltipProvider } from "../components/ui/tooltip";

/**
 * Order matters: ClerkProvider must wrap ClerkRoleProvider (it needs
 * Clerk's context to call useUser()). Everything below that is
 * independent and could be reordered freely.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#8b7cf6",
          colorBackground: "#111114",
          colorForeground: "#f5f5f7",
          colorMutedForeground: "#a1a1aa",
          borderRadius: "10px",
        },
      }}
    >
      <ClerkRoleProvider>
        <ThemeProvider>
          <ReducedMotionProvider>
            <CommandPaletteProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </CommandPaletteProvider>
          </ReducedMotionProvider>
        </ThemeProvider>
      </ClerkRoleProvider>
    </ClerkProvider>
  );
}
