"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/alignui/dialog";
import { useCommandPaletteStore } from "@/store/command-palette-store";
import { useCommandFilter } from "@/features/command-palette/command-filter";
import { cn } from "@/lib/utils/cn";

export function CommandPalette() {
  const isOpen = useCommandPaletteStore((s) => s.isOpen);
  const close = useCommandPaletteStore((s) => s.close);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, results, selectedIndex, moveSelection, reset } = useCommandFilter();

  useEffect(() => {
    if (isOpen) {
      reset();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function go(href: string) {
    close();
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveSelection(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveSelection(-1);
    } else if (e.key === "Enter" && results[selectedIndex]) {
      go(results[selectedIndex].href);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle className="sr-only">Jump to a section</DialogTitle>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Jump to a section…"
          autoComplete="off"
          className="w-full border-b border-line bg-transparent px-5 py-4.5 text-[15px] text-ink placeholder:text-muted focus:outline-none"
        />
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && <div className="px-3.5 py-3 text-sm text-ink-2">No results</div>}
          {results.map((item, i) => (
            <button
              key={item.id}
              onClick={() => go(item.href)}
              onMouseEnter={() => moveSelection(i - selectedIndex)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3.5 py-3 text-left text-sm text-ink-2 transition-colors",
                i === selectedIndex ? "bg-cream text-ink" : "hover:bg-cream hover:text-ink",
              )}
            >
              <span>{item.label}</span>
              <span className="font-mono text-[10px] text-muted">↵</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}