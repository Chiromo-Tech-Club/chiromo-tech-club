import { sql } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";

/**
 * Idempotent: adds membership/profile columns the app expects but older
 * Supabase DBs may be missing. Safe to call before inserts that use the
 * full Drizzle `members` schema (Drizzle lists defaulted columns like
 * `username` even when the app does not set them).
 */
let ensured = false;

export async function ensureMembersColumns(): Promise<void> {
  if (ensured) return;

  const db = getDb();
  await db.execute(sql`
    ALTER TABLE "members"
      ADD COLUMN IF NOT EXISTS "username" text,
      ADD COLUMN IF NOT EXISTS "student_id" text,
      ADD COLUMN IF NOT EXISTS "campus" text DEFAULT 'Chiromo Campus',
      ADD COLUMN IF NOT EXISTS "is_chiromo" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "institution_name" text,
      ADD COLUMN IF NOT EXISTS "department" text,
      ADD COLUMN IF NOT EXISTS "course" text,
      ADD COLUMN IF NOT EXISTS "year_of_study" text,
      ADD COLUMN IF NOT EXISTS "phone_number" text,
      ADD COLUMN IF NOT EXISTS "auth_provider" text DEFAULT 'email_password',
      ADD COLUMN IF NOT EXISTS "membership_status" text DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS "membership_fee_status" text DEFAULT 'unpaid',
      ADD COLUMN IF NOT EXISTS "fee_amount_paid" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "mpesa_reference" text,
      ADD COLUMN IF NOT EXISTS "mpesa_phone_number" text,
      ADD COLUMN IF NOT EXISTS "experience_level" text,
      ADD COLUMN IF NOT EXISTS "learning_goals" text,
      ADD COLUMN IF NOT EXISTS "reviewed_by_id" uuid,
      ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp with time zone,
      ADD COLUMN IF NOT EXISTS "review_notes" text,
      ADD COLUMN IF NOT EXISTS "card_theme" text DEFAULT 'navy_gold',
      ADD COLUMN IF NOT EXISTS "merged_into_id" uuid,
      ADD COLUMN IF NOT EXISTS "name_distinct_confirmed" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "deactivated_at" timestamp with time zone,
      ADD COLUMN IF NOT EXISTS "purge_scheduled_at" timestamp with time zone
  `);

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "members_username_idx" ON "members" ("username")
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "member_emails" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "member_id" uuid NOT NULL REFERENCES "members"("id") ON DELETE CASCADE,
      "email" text NOT NULL,
      "is_primary" boolean DEFAULT false NOT NULL,
      "linked_auth_user_id" uuid,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    )
  `);

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "member_emails_email_idx" ON "member_emails" ("email")
  `);

  ensured = true;
}
