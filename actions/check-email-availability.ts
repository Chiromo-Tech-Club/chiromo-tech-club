"use server";

import { and, isNull, sql } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { ensureMembersColumns } from "@/lib/drizzle/ensure-members-columns";
import { members, memberEmails } from "@/lib/drizzle/schema";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type EmailAvailabilityResult = {
  available: boolean;
  /** Human message for invalid / taken — UI uses red border, no X icon. */
  message?: string;
};

/**
 * Any legitimate email is allowed (not UoNBI-only).
 * Unavailable when the address already exists on a live member, a linked
 * secondary email, or Supabase auth.users.
 */
export async function checkEmailAvailability(rawEmail: string): Promise<EmailAvailabilityResult> {
  const email = rawEmail.trim().toLowerCase();

  if (!email) {
    return { available: false, message: "Email is required." };
  }
  if (!EMAIL_RE.test(email)) {
    return { available: false, message: "Enter a valid email address." };
  }

  try {
    await ensureMembersColumns();
  } catch {
    // continue
  }

  const db = getDb();

  try {
    const [existingMember] = await db
      .select({ id: members.id })
      .from(members)
      .where(
        and(
          sql`lower(${members.email}) = ${email}`,
          isNull(members.deletedAt),
          isNull(members.mergedIntoId),
        ),
      )
      .limit(1);

    if (existingMember) {
      return {
        available: false,
        message: "This email is already registered. Sign in instead.",
      };
    }
  } catch (err) {
    console.warn("checkEmailAvailability members lookup failed:", err);
  }

  try {
    const [linked] = await db
      .select({ id: memberEmails.id })
      .from(memberEmails)
      .where(sql`lower(${memberEmails.email}) = ${email}`)
      .limit(1);

    if (linked) {
      return {
        available: false,
        message: "This email is already linked to a club account. Sign in instead.",
      };
    }
  } catch {
    // member_emails may not exist yet
  }

  try {
    // auth.users is owned by Supabase; service-role DATABASE_URL can read it.
    const authHit = await db.execute(
      sql`select id from auth.users where lower(email) = ${email} limit 1`,
    );
    const rows = Array.isArray(authHit)
      ? authHit
      : ((authHit as { rows?: unknown[] })?.rows ?? []);
    if (rows.length > 0) {
      return {
        available: false,
        message: "This email is already registered. Sign in instead.",
      };
    }
  } catch (err) {
    console.warn("checkEmailAvailability auth.users lookup skipped:", err);
  }

  return { available: true };
}
