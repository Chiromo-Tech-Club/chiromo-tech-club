import { sql } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";

let ensured = false;

/** Columns and the walk-in table used by projects, announcements, and event check-in. */
export async function ensureClubTools(): Promise<void> {
  if (ensured) return;

  const db = getDb();
  await db.execute(sql`
    ALTER TABLE "projects"
      ADD COLUMN IF NOT EXISTS "author_id" uuid,
      ADD COLUMN IF NOT EXISTS "pitch" text,
      ADD COLUMN IF NOT EXISTS "website_url" text
  `);
  await db.execute(sql`
    ALTER TABLE "announcements"
      ADD COLUMN IF NOT EXISTS "audience" text NOT NULL DEFAULT 'members'
  `);
  await db.execute(sql`
    ALTER TABLE "event_registrations"
      ADD COLUMN IF NOT EXISTS "attended_at" timestamp with time zone
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "event_walk_ins" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "event_id" uuid NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
      "full_name" text NOT NULL,
      "email" text NOT NULL,
      "arrived_at" timestamp with time zone NOT NULL DEFAULT now(),
      "recorded_by_id" uuid NOT NULL REFERENCES "members"("id") ON DELETE CASCADE,
      "created_at" timestamp with time zone NOT NULL DEFAULT now()
    )
  `);

  ensured = true;
}
