-- =============================================================================
-- RUN THIS IN SUPABASE → SQL Editor → New query → Run
-- Guest speakers: phone number + rescheduled / cancelled statuses
-- =============================================================================

ALTER TABLE "guest_speakers"
  ADD COLUMN IF NOT EXISTS "contact_phone" text;

DO $$ BEGIN
  ALTER TYPE "speaker_status" ADD VALUE 'rescheduled';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE "speaker_status" ADD VALUE 'cancelled';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
