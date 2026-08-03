"use client";

import { useUser } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { AuthContext } from "@/context/auth-context";
import { isRole } from "@/types/roles";
import { DEFAULT_ROLE } from "@/constants/roles";

/**
 * The one place in the app that imports a Clerk client hook directly.
 * Everything else reads auth state via useAuthRole() from context/auth-context,
 * so swapping auth providers later touches this file and lib/clerk only.
 */
export function ClerkRoleProvider({ children }: { children: ReactNode }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const rawRole = user?.publicMetadata?.role;
  const role = isRole(rawRole) ? rawRole : DEFAULT_ROLE;

  return (
    <AuthContext.Provider value={{ isSignedIn: !!isSignedIn, isLoaded, role }}>{children}</AuthContext.Provider>
  );
}
