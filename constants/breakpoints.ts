/**
 * Breakpoints mirrored from the Tailwind v4 theme so JS-side logic
 * (useMediaQuery, canvas sizing, etc.) stays in lockstep with CSS.
 */
export const BREAKPOINTS = {
  sm: 480,
  md: 720,
  lg: 960,
  xl: 1200,
  "2xl": 1280,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export const MEDIA_QUERIES: Record<Breakpoint, string> = {
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
  "2xl": `(min-width: ${BREAKPOINTS["2xl"]}px)`,
};
