import { create } from "zustand";

interface SplashState {
  hasPlayed: boolean;
  markPlayed: () => void;
}

/**
 * In-memory only (no persistence — see the artifact-storage restriction
 * against localStorage/sessionStorage in this environment; a real deploy
 * may back this with sessionStorage instead). Ensures the splash sequence
 * plays once per session, not on every client-side navigation.
 */
export const useSplashStore = create<SplashState>((set) => ({
  hasPlayed: false,
  markPlayed: () => set({ hasPlayed: true }),
}));
