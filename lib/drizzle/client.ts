import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

/**
 * Lazily-constructed singleton. Importing this module never touches the
 * network or throws — the connection is only opened the first time
 * `getDb()` is actually called, so pages/build steps that don't query the
 * database stay unaffected by a missing DATABASE_URL.
 */
let dbInstance: PostgresJsDatabase<typeof schema> | null = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (Supabase → Project Settings → Database → Connection string).",
    );
  }

  const client = postgres(connectionString, { prepare: false });
  dbInstance = drizzle(client, { schema });
  return dbInstance;
}

export type Database = ReturnType<typeof getDb>;
