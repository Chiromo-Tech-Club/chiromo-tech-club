"use server";

import { revalidatePath } from "next/cache";
import { and, eq, max } from "drizzle-orm";
import { z } from "zod";
import type { ActionResult } from "@/actions/membership";
import { ROUTES } from "@/constants/routes";
import { parseCalendarSrcList } from "@/lib/calendar/sources";
import { getDb } from "@/lib/drizzle/client";
import { ensureGoogleCalendarsTable } from "@/lib/drizzle/ensure-google-calendars";
import { googleCalendars } from "@/lib/drizzle/schema";
import { getAuthUserId, getCurrentRole } from "@/lib/supabase/auth-helpers";

async function requireCalendarEditor(): Promise<ActionResult | { ok: true; userId: string }> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Sign in required." };

  const role = await getCurrentRole();
  if (role !== "admin" && role !== "exec") {
    return { success: false, error: "Admin or executive access required." };
  }

  return { ok: true, userId };
}

const addSchema = z.object({
  label: z.string().trim().min(1).max(80).optional(),
  /** One or more emails / calendar IDs (comma, semicolon, or newline separated). */
  calendarSrc: z.string().trim().min(3).max(2000),
});

function revalidateCalendarPaths() {
  revalidatePath(ROUTES.adminCalendars);
  revalidatePath(ROUTES.dashboard);
  revalidatePath("/dashboard/calendar");
}

/**
 * Add one or many joint Google Calendar emails/IDs.
 * Pasting "a@x.com, b@y.com" creates separate joint sources.
 */
export async function addGoogleCalendars(input: z.infer<typeof addSchema>): Promise<ActionResult> {
  const gate = await requireCalendarEditor();
  if (!("ok" in gate)) return gate;

  const parsed = addSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const sources = parseCalendarSrcList(parsed.data.calendarSrc);
  if (sources.length === 0) {
    return { success: false, error: "Add at least one calendar email or ID." };
  }

  for (const src of sources) {
    if (!src.includes("@") && !src.includes("group.calendar.google.com") && src.length < 8) {
      return { success: false, error: `Doesn't look like a calendar email or ID: ${src}` };
    }
  }

  await ensureGoogleCalendarsTable();
  const db = getDb();

  try {
    const [{ maxOrder }] = await db.select({ maxOrder: max(googleCalendars.sortOrder) }).from(googleCalendars);
    let nextOrder = (maxOrder ?? -1) + 1;
    const baseLabel = parsed.data.label?.trim();

    for (const src of sources) {
      const label =
        sources.length === 1 && baseLabel
          ? baseLabel
          : baseLabel
            ? `${baseLabel} (${src})`
            : src;

      await db
        .insert(googleCalendars)
        .values({
          label,
          calendarSrc: src,
          sortOrder: nextOrder++,
          isActive: true,
          addedById: gate.userId,
        })
        .onConflictDoUpdate({
          target: googleCalendars.calendarSrc,
          set: {
            label,
            isActive: true,
            updatedAt: new Date(),
            addedById: gate.userId,
          },
        });
    }

    revalidateCalendarPaths();
    return { success: true };
  } catch (err) {
    console.error("addGoogleCalendars failed:", err);
    return { success: false, error: "Could not save calendar source(s)." };
  }
}

export async function setGoogleCalendarActive(id: string, isActive: boolean): Promise<ActionResult> {
  const gate = await requireCalendarEditor();
  if (!("ok" in gate)) return gate;

  await ensureGoogleCalendarsTable();
  const db = getDb();

  try {
    await db
      .update(googleCalendars)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(googleCalendars.id, id));
    revalidateCalendarPaths();
    return { success: true };
  } catch (err) {
    console.error("setGoogleCalendarActive failed:", err);
    return { success: false, error: "Could not update calendar." };
  }
}

export async function removeGoogleCalendar(id: string): Promise<ActionResult> {
  const gate = await requireCalendarEditor();
  if (!("ok" in gate)) return gate;

  await ensureGoogleCalendarsTable();
  const db = getDb();

  try {
    await db.delete(googleCalendars).where(and(eq(googleCalendars.id, id)));
    revalidateCalendarPaths();
    return { success: true };
  } catch (err) {
    console.error("removeGoogleCalendar failed:", err);
    return { success: false, error: "Could not remove calendar." };
  }
}
