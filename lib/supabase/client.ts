// ─────────────────────────────────────────────────────────────────────────
// OLD VERSION (commented out — plain createClient, no cookie/session sync,
// which is why sessions didn't persist correctly across server components)
// ─────────────────────────────────────────────────────────────────────────
// import { createClient, type SupabaseClient } from "@supabase/supabase-js";
//
// let browserClient: SupabaseClient | null = null;
//
// export function getSupabaseBrowserClient(): SupabaseClient {
//   if (browserClient) return browserClient;
//
//   const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
//   const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
//   if (!url || !anonKey) {
//     throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set.");
//   }
//
//   browserClient = createClient(url, anonKey);
//   return browserClient;
// }
// ─────────────────────────────────────────────────────────────────────────

import { createBrowserClient } from "@supabase/ssr";

/**
 * Client-side Supabase client using the public anon key — safe to call
 * from "use client" components. Only reads/writes allowed by RLS policies.
 *
 * NOTE: call this fresh wherever you need it instead of caching a module
 * singleton like the old version did — @supabase/ssr's browser client is
 * cheap to create and internally handles cookie sync, so a stale cached
 * instance can drift from the actual auth cookie state.
 */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set.");
  }
  return createBrowserClient(url, anonKey);
}