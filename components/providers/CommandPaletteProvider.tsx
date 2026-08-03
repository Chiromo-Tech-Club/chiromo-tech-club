"use client";

import { useEffect, type ReactNode } from "react";
import { useCommandPaletteStore } from "@/store/command-palette-store";

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const toggle = useCommandPaletteStore((s) => s.toggle);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  return <>{children}</>;
}
