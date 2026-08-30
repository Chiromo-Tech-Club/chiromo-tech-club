import { create } from "zustand";
import type { Theme } from "@/context/theme-context";

interface UIState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  /** User-forced reduced motion, independent of the OS-level media query. */
  reducedMotionOverride: boolean | null;
  setReducedMotionOverride: (value: boolean | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: "light",
  setTheme: (theme) => set({ theme }),
  reducedMotionOverride: null,
  setReducedMotionOverride: (value) => set({ reducedMotionOverride: value }),
}));
