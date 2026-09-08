-- =============================================================================
-- RUN THIS IN SUPABASE → SQL Editor → New query → Run
-- Fixes: column "username" of relation "members" does not exist (42703)
-- Also ensures earlier membership columns exist (safe IF NOT EXISTS).
-- =============================================================================

-- Membership / registration fields (from 0001)
ALTER TABLE "members"
  ADD COLUMN IF NOT EXISTS "student_id" text,
  ADD COLUMN IF NOT EXISTS "campus" text DEFAULT 'Chiromo Campus',
  ADD COLUMN IF NOT EXISTS "is_chiromo" boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS "course" text,
  ADD COLUMN IF NOT EXISTS "year_of_study" text,
  ADD COLUMN IF NOT EXISTS "phone_number" text,
  ADD COLUMN IF NOT EXISTS "auth_provider" text DEFAULT 'email_password',
  ADD COLUMN IF NOT EXISTS "membership_status" text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "membership_fee_status" text DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS "fee_amount_paid" integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "mpesa_reference" text,
  ADD COLUMN IF NOT EXISTS "reviewed_by_id" uuid,
  ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "review_notes" text;

-- Profile username (from 0002) — required by current app schema
ALTER TABLE "members"
  ADD COLUMN IF NOT EXISTS "username" text;

-- Card color theme preference
ALTER TABLE "members"
  ADD COLUMN IF NOT EXISTS "card_theme" text DEFAULT 'navy_gold';

-- Unique when set; multiple NULLs are allowed in Postgres
CREATE UNIQUE INDEX IF NOT EXISTS "members_username_idx" ON "members" ("username");

-- Verify (optional): should list username among columns
-- SELECT column_name FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'members'
-- ORDER BY column_name;
