"use client";

// New file — Clerk's useAuth() was a built-in hook backed by <ClerkProvider>.
// Supabase has no equivalent React hook, so this wraps supabase.auth's
// onAuthStateChange listener to give client components the same shape:
// { isSignedIn, user, loading }. No provider wrapping needed — each call
// to this hook sets up its own listener.

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, isSignedIn: !!user, loading };
}