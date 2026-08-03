import { gsap, ScrollTrigger, registerGsap } from "../lib/motion/register-gsap";
import { EASE, DURATION } from "../animations/easings";

export interface RevealOptions {
  y?: number;
  delay?: number;
  stagger?: number;
  start?: string;
}

/**
 * Applies the app's single scroll-reveal treatment (fade + rise) to one
 * or more elements, once. Every "reveal on scroll" moment in the app
 * should call this rather than hand-rolling a new fromTo/ScrollTrigger pair.
 */
export function revealOnScroll(targets: Element | Element[], options: RevealOptions = {}) {
  registerGsap();
  const { y = 24, delay = 0, stagger = 0.08, start = "top 88%" } = options;
  const els = Array.isArray(targets) ? targets : [targets];

  gsap.set(els, { opacity: 0, y });
  ScrollTrigger.batch(els, {
    start,
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { opacity: 1, y: 0, duration: DURATION.slow, ease: EASE.standard, delay, stagger }),
  });
}
