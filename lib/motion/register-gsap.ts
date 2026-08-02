"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/**
 * Registers GSAP plugins exactly once, client-side only. Call this at the
 * top of any component that uses ScrollTrigger, before creating timelines.
 * Actual timeline *content* (what animates, with what easing) belongs in
 * top-level animations/, not here — this file is plumbing only.
 */
export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export { gsap, ScrollTrigger };
