"use client";

import { useMediaQuery } from "../hooks/use-media-query";
import { useUIStore } from "../store/ui-store";

/** True if motion should be minimized — respects OS setting unless the user explicitly overrides it. */
export function useReducedMotion(): boolean {
  const osPrefers = useMediaQuery("(prefers-reduced-motion: reduce)");
  const override = useUIStore((s) => s.reducedMotionOverride);
  return override ?? osPrefers;
}