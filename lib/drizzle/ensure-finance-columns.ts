import { sql } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";

/** Idempotent columns for sponsor phone + transaction party name. */
let ensured = false;

export async function ensureFinanceColumns(): Promise<void> {
  if (ensured) return;

  const db = getDb();
  await db.execute(sql`
    ALTER TABLE "sponsors"
      ADD COLUMN IF NOT EXISTS "contact_phone" text,
      ADD COLUMN IF NOT EXISTS "contact_email_secondary" text,
      ADD COLUMN IF NOT EXISTS "contact_phone_secondary" text,
      ADD COLUMN IF NOT EXISTS "contact_email_tertiary" text,
      ADD COLUMN IF NOT EXISTS "contact_phone_tertiary" text
  `);
  await db.execute(sql`
    ALTER TABLE "transactions"
      ADD COLUMN IF NOT EXISTS "party_name" text
  `);

  ensured = true;
}
