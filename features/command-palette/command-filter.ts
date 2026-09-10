"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { COMMAND_ITEMS, PUBLIC_COMMAND_ITEMS, type CommandItem } from "./command-items";

export function useCommandFilter() {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const pathname = usePathname();
  const onAppShell = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const catalog = onAppShell ? COMMAND_ITEMS : PUBLIC_COMMAND_ITEMS;

  const results: CommandItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((item) => item.label.toLowerCase().includes(q));
  }, [query, catalog]);

  function moveSelection(delta: number) {
    setSelectedIndex((i) => Math.min(results.length - 1, Math.max(0, i + delta)));
  }

  function reset() {
    setQuery("");
    setSelectedIndex(0);
  }

  return {
    query,
    setQuery: (q: string) => {
      setQuery(q);
      setSelectedIndex(0);
    },
    results,
    selectedIndex,
    moveSelection,
    reset,
  };
}