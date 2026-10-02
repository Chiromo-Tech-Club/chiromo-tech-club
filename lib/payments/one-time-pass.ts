import { createHash, randomUUID, timingSafeEqual } from "crypto";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { ensureMembersColumns } from "@/lib/drizzle/ensure-members-columns";

/** SHA-256 of the single registration pass. The code itself is not stored. */
const PASS_HASH = Buffer.from("58c803ba6cb712dbf96274e036ddf8bdd865fcf565e539bbdcf78a183d090a47", "hex");

function hashCode(code: string): Buffer {
  const normalized = code.trim().toUpperCase().replace(/\s+/g, "");
  return createHash("sha256").update(normalized).digest();
}

function firstToken(rows: unknown): string | null {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const row = rows[0] as { token?: unknown };
  return typeof row.token === "string" ? row.token : null;
}

/** Accepts the pass once and returns a token the registration form must submit. */
export async function redeemOneTimePass(
  code: string,
): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  const digest = hashCode(code);
  const matches =
    digest.length === PASS_HASH.length && timingSafeEqual(digest, PASS_HASH);
  if (!matches) return { ok: false, error: "That code is not valid." };

  await ensureMembersColumns();
  const db = getDb();
  const hashHex = digest.toString("hex");
  const token = randomUUID();

  await db.execute(sql`
    INSERT INTO registration_passes (code_hash)
    VALUES (${hashHex})
    ON CONFLICT (code_hash) DO NOTHING
  `);

  const rows = await db.execute(sql`
    UPDATE registration_passes
    SET redeemed_at = now(), token = ${token}
    WHERE code_hash = ${hashHex} AND redeemed_at IS NULL
    RETURNING token
  `);

  const saved = firstToken(rows);
  if (!saved) return { ok: false, error: "That code has already been used." };
  return { ok: true, token: saved };
}

/** Binds a redeemed pass to one member. A second registration cannot reuse it. */
export async function claimOneTimePass(token: string, memberId: string): Promise<boolean> {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return false;
  await ensureMembersColumns();
  const db = getDb();
  const rows = await db.execute(sql`
    UPDATE registration_passes
    SET member_id = ${memberId}::uuid
    WHERE token = ${token} AND redeemed_at IS NOT NULL AND member_id IS NULL
    RETURNING token
  `);
  return firstToken(rows) !== null;
}

export async function releaseOneTimePass(token: string, memberId: string): Promise<void> {
  const db = getDb();
  await db.execute(sql`
    UPDATE registration_passes
    SET member_id = NULL
    WHERE token = ${token} AND member_id = ${memberId}::uuid
  `);
}
