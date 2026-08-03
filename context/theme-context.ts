"use client";

import { createContext, useContext } from "react";

export type Theme = "dark" | "light";

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

/**
 * Chiromo is dark-first by brief, so this defaults to "dark" with no
 * light-mode UI built yet. The context exists now so a future toggle is
 * additive, not a refactor.
 */
export const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}
