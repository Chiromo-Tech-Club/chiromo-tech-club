import { sql } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { SITE_CONFIG } from "@/config/site";

/** Idempotent: creates joint Google Calendar table and seeds the club default. */
let ensured = false;

export async function ensureGoogleCalendarsTable(): Promise<void> {
  if (ensured) return;

  try {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "google_calendars" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "label" text NOT NULL,
        "calendar_src" text NOT NULL,
        "sort_order" integer DEFAULT 0 NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "added_by_id" uuid,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS "google_calendars_src_idx"
      ON "google_calendars" ("calendar_src")
    `);

    const defaultSrc =
      process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_SRC?.trim() ||
      SITE_CONFIG.googleCalendarSrc ||
      SITE_CONFIG.contactEmail;

    if (defaultSrc) {
      await db.execute(sql`
        INSERT INTO "google_calendars" ("label", "calendar_src", "sort_order", "is_active")
        VALUES ('Club calendar', ${defaultSrc}, 0, true)
        ON CONFLICT ("calendar_src") DO NOTHING
      `);
    }

    ensured = true;
  } catch (err) {
    console.error("[ensureGoogleCalendarsTable]", err);
    // Leave ensured=false so a later request can retry after DB is ready.
  }
}
