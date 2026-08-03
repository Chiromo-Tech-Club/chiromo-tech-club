"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Lightweight scroll-progress tracker for cases that don't need a full
 * ScrollTrigger instance (e.g. a simple progress bar). Returns 0 before
 * the element enters the viewport and 1 after it fully exits.
 */
export function useScrollProgress<T extends HTMLElement>(): [RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onScroll() {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height + window.innerHeight;
      const passed = window.innerHeight - rect.top;
      const pct = Math.min(1, Math.max(0, passed / total));
      setProgress(pct);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return [ref, progress];
}