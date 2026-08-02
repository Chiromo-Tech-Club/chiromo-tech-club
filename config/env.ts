import { z } from "zod";

/**
 * Validated, typed environment variables. Import `env` instead of touching
 * `process.env` directly so a missing/malformed var fails fast at boot
 * with a clear message instead of surfacing as a cryptic runtime error.
 *
 * Clerk / Supabase / database keys are intentionally optional here until
 * those integrations are wired up (see lib/clerk, lib/supabase, lib/drizzle) —
 * flip them to `.min(1)` / remove `.optional()` once real keys are required.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),

  // Clerk (added when lib/clerk is wired up)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),

  // Supabase (added when lib/supabase is wired up)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Database (added when lib/drizzle is wired up)
  DATABASE_URL: z.string().optional(),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables — see console output above.");
  }
  return parsed.data;
}

export const env = loadEnv();
