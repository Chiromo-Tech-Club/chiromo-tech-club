import "dotenv/config";
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

async function main() {
  await sql`
    ALTER TABLE "members"
      ADD COLUMN IF NOT EXISTS "username" text,
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
      ADD COLUMN IF NOT EXISTS "review_notes" text
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "members_username_idx" ON "members" ("username")
  `;

  const cols = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'members'
      AND column_name IN ('username', 'student_id', 'membership_status', 'phone_number')
    ORDER BY column_name
  `;

  console.log(
    "OK columns:",
    cols.map((c) => c.column_name).join(", "),
  );
}

main()
  .then(async () => {
    await sql.end();
  })
  .catch(async (err) => {
    console.error("FAIL:", err instanceof Error ? err.message : err);
    try {
      await sql.end();
    } catch {
      /* ignore */
    }
    process.exit(1);
  });
