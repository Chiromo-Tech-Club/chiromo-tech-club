/**
 * Motion tokens — the timing vocabulary for the whole app. Every GSAP
 * timeline should pull from here instead of inlining ad-hoc easing
 * strings, so the motion language stays consistent site-wide.
 */
export const EASE = {
  standard: "power3.out",
  entrance: "power2.out",
  exit: "power2.in",
  overshoot: "back.out(1.7)",
  elastic: "elastic.out(1,0.4)",
  linear: "none",
} as const;

export const DURATION = {
  fast: 0.3,
  base: 0.5,
  slow: 0.8,
  splash: 0.9,
} as const;
