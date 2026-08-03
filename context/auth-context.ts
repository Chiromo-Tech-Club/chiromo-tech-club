"use client";

import { createContext, useContext } from "react";
import type { Role } from "@/types/roles";

export interface AuthContextValue {
  isSignedIn: boolean;
  isLoaded: boolean;
  role: Role;
}

/**
 * Populated by components/providers/ClerkRoleProvider (which reads
 * Clerk's useUser()/publicMetadata client-side) so the rest of the app
 * can call useAuthRole() without importing Clerk hooks directly —
 * keeping the auth SDK swap boundary at one file, per lib/clerk.
 */
export const AuthContext = createContext<AuthContextValue>({
  isSignedIn: false,
  isLoaded: false,
  role: "visitor",
});

export function useAuthRole() {
  return useContext(AuthContext);
}
