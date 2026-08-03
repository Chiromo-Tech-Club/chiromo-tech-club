"use client";

import { useMemo, useState } from "react";
import { COMMAND_ITEMS, type CommandItem } from "./command-items";

export function useCommandFilter() {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results: CommandItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMAND_ITEMS;
    return COMMAND_ITEMS.filter((item) => item.label.toLowerCase().includes(q));
  }, [query]);

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