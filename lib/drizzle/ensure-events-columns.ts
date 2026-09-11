import { sql } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";

let ensured = false;

/** Idempotent: adds Luma-style event columns older DBs may be missing. */
export async function ensureEventsColumns(): Promise<void> {
  if (ensured) return;

  const db = getDb();
  await db.execute(sql`
    ALTER TABLE "events"
      ADD COLUMN IF NOT EXISTS "organizer_name" text,
      ADD COLUMN IF NOT EXISTS "guest_speaker_name" text,
      ADD COLUMN IF NOT EXISTS "cover_image_url" text,
      ADD COLUMN IF NOT EXISTS "ends_at" timestamp with time zone,
      ADD COLUMN IF NOT EXISTS "capacity" integer,
      ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone
  `);

  ensured = true;
}
