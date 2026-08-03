"use client";

import { useEffect, useRef, type RefObject } from "react";
import { attachMagnetic } from "../animations/magnetic";
import { useReducedMotion } from "../hooks/use-reduced-motion";

/** Attaches the magnetic-button hover effect to a ref. Respects reduced motion. */
export function useMagnetic<T extends HTMLElement>(strength = 0.3): RefObject<T | null> {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    return attachMagnetic(el, strength);
  }, [reduced, strength]);

  return ref;
}