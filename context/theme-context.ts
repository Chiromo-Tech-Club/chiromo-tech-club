"use client";

import { createContext, useContext } from "react";

export type Theme = "dark" | "light";

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

/**
 * Chiromo defaults to light mode on first landing.
 */
export const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}
