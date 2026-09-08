-- Add public username for member profiles / membership cards.
-- Run in Supabase SQL Editor if the column is missing.

ALTER TABLE "members"
  ADD COLUMN IF NOT EXISTS "username" text;

CREATE UNIQUE INDEX IF NOT EXISTS "members_username_idx" ON "members" ("username");
