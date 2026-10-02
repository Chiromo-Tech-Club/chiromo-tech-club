import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

/**
 * One shared client for the whole Node process, including hot reload.
 * Supabase session mode only allows a small pool (often 15). A fresh client
 * on every reload fills that pool, later queries fail, and login then looks
 * like the member row does not exist.
 */
const globalForDb = globalThis as unknown as {
  ctcDb?: PostgresJsDatabase<typeof schema>;
};

export function getDb() {
  if (globalForDb.ctcDb) return globalForDb.ctcDb;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (Supabase → Project Settings → Database → Connection string).",
    );
  }

  const client = postgres(connectionString, {
    prepare: false,
    max: 1,
    idle_timeout: 5,
    connect_timeout: 10,
  });
  globalForDb.ctcDb = drizzle(client, { schema });
  return globalForDb.ctcDb;
}

export type Database = ReturnType<typeof getDb>;
