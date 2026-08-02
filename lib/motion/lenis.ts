"use client";

import Lenis from "lenis";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/motion/register-gsap";

let lenisInstance: Lenis | null = null;

/**
 * Creates (or returns the existing) Lenis instance and syncs it to GSAP's
 * ticker so ScrollTrigger-driven animations stay in lockstep with smooth
 * scroll. Call once from a top-level client component (e.g. providers/).
 */
export function initLenis(): Lenis {
  if (lenisInstance) return lenisInstance;

  registerGsap();
  lenisInstance = new Lenis({
    duration: 1.1,
    smoothWheel: true,
  });

  lenisInstance.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenisInstance?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenisInstance;
}

export function destroyLenis() {
  lenisInstance?.destroy();
  lenisInstance = null;
}
