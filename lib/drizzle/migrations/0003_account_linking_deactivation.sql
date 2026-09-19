-- Account linking, deactivation grace period, secondary emails.
-- Safe to run multiple times (IF NOT EXISTS).

ALTER TABLE "members"
  ADD COLUMN IF NOT EXISTS "merged_into_id" uuid,
  ADD COLUMN IF NOT EXISTS "name_distinct_confirmed" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deactivated_at" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "purge_scheduled_at" timestamp with time zone;

CREATE TABLE IF NOT EXISTS "member_emails" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "member_id" uuid NOT NULL REFERENCES "members"("id") ON DELETE CASCADE,
  "email" text NOT NULL,
  "is_primary" boolean DEFAULT false NOT NULL,
  "linked_auth_user_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "member_emails_email_idx" ON "member_emails" ("email");
