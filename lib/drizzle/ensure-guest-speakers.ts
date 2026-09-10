import { sql } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";

/**
 * Idempotent: adds guest_speakers phone column and expands speaker_status
 * enum for rescheduled / cancelled. Safe to call before speaker reads/writes.
 */
let ensured = false;

export async function ensureGuestSpeakersSchema(): Promise<void> {
  if (ensured) return;

  const db = getDb();

  await db.execute(sql`
    ALTER TABLE "guest_speakers"
      ADD COLUMN IF NOT EXISTS "contact_phone" text
  `);

  // Postgres enums cannot use IF NOT EXISTS on ADD VALUE in older versions;
  // ignore duplicate_object when the value already exists.
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TYPE "speaker_status" ADD VALUE 'rescheduled';
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$
  `);

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TYPE "speaker_status" ADD VALUE 'cancelled';
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$
  `);

  ensured = true;
}
