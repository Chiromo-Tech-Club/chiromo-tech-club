"use client";

import { useEffect, type ReactNode } from "react";
import { initLenis, destroyLenis } from "@/lib/motion/lenis";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Boots Lenis smooth-scroll for the whole app, but only when the user
 * hasn't asked for reduced motion — so this is also the single place
 * that decides whether smooth scroll runs at all.
 */
export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    initLenis();
    return () => destroyLenis();
  }, [reduced]);

  return <>{children}</>;
}
