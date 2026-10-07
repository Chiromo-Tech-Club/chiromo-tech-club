import { createHash, randomBytes, randomUUID, timingSafeEqual } from "crypto";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { ensureMembersColumns } from "@/lib/drizzle/ensure-members-columns";

/** SHA-256 of the original single registration pass. The code itself is not stored. */
const LEGACY_PASS_HASH = Buffer.from("58c803ba6cb712dbf96274e036ddf8bdd865fcf565e539bbdcf78a183d090a47", "hex");

/**
 * Four one-time passes for people covered by a single M-Pesa payment.
 * Each hash is one code. They all show the same receipt, and registration
 * stores that receipt plus a short id so the four rows are not identical.
 */
const GROUP_SHARED_RECEIPT = "UHQ4X4MCCZ";

const GROUP_PASS_HASHES = [
  "a0487223b5a6518021f7915abdd4ef6343506536c7c6b55ea0c75b8629d4ea7e",
  "06cd8f4812623397c16b1c479aca6fce6f56a091922fedb2a4de66f192a378c2",
  "c28e6eb68405437bb7c4ecac5f45aa30cca69255c8c5d0a5d32f4323543bebee",
  "05f4d6997d1904ddba5400145735ed59b502b1476e93f46f4245cb7dd515d4c2",
].map((hex) => Buffer.from(hex, "hex"));

function hashCode(code: string): Buffer {
  const normalized = code.trim().toUpperCase().replace(/\s+/g, "");
  return createHash("sha256").update(normalized).digest();
}

function hashesMatch(left: Buffer, right: Buffer): boolean {
  return left.length === right.length && timingSafeEqual(left, right);
}

type PassMatch =
  | { kind: "legacy" }
  | { kind: "group"; receipt: string }
  | { kind: "closed" }
  | { kind: "none" };

function matchPass(digest: Buffer): PassMatch {
  if (hashesMatch(digest, LEGACY_PASS_HASH)) return { kind: "legacy" };
  if (!GROUP_PASS_HASHES.some((hash) => hashesMatch(digest, hash))) return { kind: "none" };
  const receipt = GROUP_SHARED_RECEIPT.trim().toUpperCase();
  if (!/^[A-Z0-9]{8,15}$/.test(receipt)) return { kind: "closed" };
  return { kind: "group", receipt };
}

function asRows(result: unknown): Record<string, unknown>[] {
  if (Array.isArray(result)) return result as Record<string, unknown>[];
  if (result && typeof result === "object" && Array.isArray((result as { rows?: unknown }).rows)) {
    return (result as { rows: Record<string, unknown>[] }).rows;
  }
  return [];
}

function firstToken(rows: unknown): string | null {
  const row = asRows(rows)[0];
  return row && typeof row.token === "string" ? row.token : null;
}

function firstText(rows: unknown, field: string): string | null {
  const row = asRows(rows)[0];
  const value = row?.[field];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Accepts a pass once. Group passes also return the shared M-Pesa receipt to show. */
export async function redeemOneTimePass(
  code: string,
): Promise<{ ok: true; token: string; receipt: string | null } | { ok: false; error: string }> {
  const digest = hashCode(code);
  const matched = matchPass(digest);
  if (matched.kind === "none") return { ok: false, error: "That code is not valid." };
  if (matched.kind === "closed") return { ok: false, error: "That code is not open yet." };
  const receiptBase = matched.kind === "group" ? matched.receipt : null;

  await ensureMembersColumns();
  const db = getDb();
  const hashHex = digest.toString("hex");
  const token = randomUUID();

  await db.execute(sql`
    INSERT INTO registration_passes (code_hash, receipt_base)
    VALUES (${hashHex}, ${receiptBase})
    ON CONFLICT (code_hash) DO UPDATE
    SET receipt_base = COALESCE(registration_passes.receipt_base, EXCLUDED.receipt_base)
  `);

  // Keep the pass open until registration is submitted. A second look at an
  // unused pass still returns the receipt. A finished registration does not.
  const rows = await db.execute(sql`
    UPDATE registration_passes
    SET redeemed_at = NULL, token = ${token}
    WHERE code_hash = ${hashHex} AND member_id IS NULL
    RETURNING token
  `);

  const saved = firstToken(rows);
  if (!saved) return { ok: false, error: "That code has already been used." };
  return { ok: true, token: saved, receipt: receiptBase };
}

/** Binds a redeemed pass to one member. A second registration cannot reuse it. */
export async function claimOneTimePass(token: string, memberId: string): Promise<boolean> {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return false;
  await ensureMembersColumns();
  const db = getDb();
  const rows = await db.execute(sql`
    UPDATE registration_passes
    SET member_id = ${memberId}::uuid, redeemed_at = now()
    WHERE token = ${token} AND member_id IS NULL
    RETURNING token
  `);
  return firstToken(rows) !== null;
}

/**
 * Receipt stored for a claimed group pass: the shared code plus a short id.
 * Legacy passes have no receipt and return null.
 */
export async function receiptStoredForPass(token: string): Promise<string | null> {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  await ensureMembersColumns();
  const db = getDb();
  const rows = await db.execute(sql`
    SELECT receipt_base, code_hash
    FROM registration_passes
    WHERE token = ${token} AND member_id IS NOT NULL
  `);
  const hashHex = firstText(rows, "code_hash");
  const fromGroup = hashHex
    ? GROUP_PASS_HASHES.some((hash) => hashesMatch(Buffer.from(hashHex, "hex"), hash))
    : false;
  const base = firstText(rows, "receipt_base") ?? (fromGroup ? GROUP_SHARED_RECEIPT : null);
  if (!base) return null;
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `${base}-${suffix}`;
}

export async function releaseOneTimePass(token: string, memberId: string): Promise<void> {
  const db = getDb();
  await db.execute(sql`
    UPDATE registration_passes
    SET member_id = NULL
    WHERE token = ${token} AND member_id = ${memberId}::uuid
  `);
}
