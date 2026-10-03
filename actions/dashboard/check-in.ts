"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { cookies } from "next/headers";
import { getDb } from "@/lib/drizzle/client";
import { ensureClubTools } from "@/lib/drizzle/ensure-club-tools";
import { eventRegistrations, eventWalkIns, events } from "@/lib/drizzle/schema";
import { CHECKIN_EVENT_COOKIE, canCheckInEvents } from "@/lib/events/check-in";
import { getCurrentMember } from "@/lib/supabase/get-current-member";
import type { ActionResult } from "@/actions/membership";

function revalidateCheckIn() {
  revalidatePath("/dashboard/corporate_affairs/event-check-in");
  revalidatePath("/dashboard/membership_officer/attendance");
  revalidatePath("/verify");
}

async function requireChecker() {
  if (!(await canCheckInEvents())) {
    return { ok: false as const, error: "Only Corporate Affairs, Membership, and administrators can check people in." };
  }
  const member = await getCurrentMember();
  if (!member) return { ok: false as const, error: "Member profile not found." };
  return { ok: true as const, member };
}

export async function selectCheckInEvent(eventId: string): Promise<ActionResult> {
  const gate = await requireChecker();
  if (!gate.ok) return { success: false, error: gate.error };

  const parsed = z.string().uuid().safeParse(eventId);
  if (!parsed.success) return { success: false, error: "Choose an event." };

  await ensureClubTools();
  const [event] = await getDb()
    .select({ id: events.id })
    .from(events)
    .where(and(eq(events.id, parsed.data), isNull(events.deletedAt)))
    .limit(1);
  if (!event) return { success: false, error: "Event not found." };

  const jar = await cookies();
  jar.set(CHECKIN_EVENT_COOKIE, event.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  revalidateCheckIn();
  return { success: true };
}

export async function clearCheckInEvent(): Promise<ActionResult> {
  const gate = await requireChecker();
  if (!gate.ok) return { success: false, error: gate.error };
  const jar = await cookies();
  jar.delete(CHECKIN_EVENT_COOKIE);
  revalidateCheckIn();
  return { success: true };
}

export async function markMemberArrived(input: {
  eventId: string;
  memberId: string;
}): Promise<ActionResult & { detail?: string }> {
  const gate = await requireChecker();
  if (!gate.ok) return { success: false, error: gate.error };

  const parsed = z
    .object({ eventId: z.string().uuid(), memberId: z.string().uuid() })
    .safeParse(input);
  if (!parsed.success) return { success: false, error: "Could not read this card." };

  await ensureClubTools();
  const db = getDb();
  const [event] = await db
    .select({ id: events.id, title: events.title })
    .from(events)
    .where(and(eq(events.id, parsed.data.eventId), isNull(events.deletedAt)))
    .limit(1);
  if (!event) return { success: false, error: "That event is no longer on the calendar." };

  const now = new Date();
  const [existing] = await db
    .select({ id: eventRegistrations.id })
    .from(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.eventId, event.id),
        eq(eventRegistrations.memberId, parsed.data.memberId),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(eventRegistrations)
      .set({ attended: true, attendedAt: now })
      .where(eq(eventRegistrations.id, existing.id));
  } else {
    await db.insert(eventRegistrations).values({
      eventId: event.id,
      memberId: parsed.data.memberId,
      attended: true,
      attendedAt: now,
    });
  }

  revalidateCheckIn();
  return {
    success: true,
    detail: existing
      ? `Marked as arrived for ${event.title}. They were on the RSVP list.`
      : `Marked as arrived for ${event.title}. They had not RSVP'd, so they were added to the attendance list.`,
  };
}

const walkInSchema = z.object({
  eventId: z.string().uuid(),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  arrivedAt: z.string().min(8),
});

export async function logWalkIn(input: z.infer<typeof walkInSchema>): Promise<ActionResult> {
  const gate = await requireChecker();
  if (!gate.ok) return { success: false, error: gate.error };

  const parsed = walkInSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid details." };

  const arrivedAt = new Date(parsed.data.arrivedAt);
  if (Number.isNaN(arrivedAt.getTime())) return { success: false, error: "Enter a valid arrival time." };
  if (arrivedAt.getTime() > Date.now() + 60 * 60 * 1000) {
    return { success: false, error: "Arrival time cannot be that far in the future." };
  }

  await ensureClubTools();
  const db = getDb();
  const email = parsed.data.email.toLowerCase();

  const [existing] = await db
    .select({ id: eventWalkIns.id })
    .from(eventWalkIns)
    .where(and(eq(eventWalkIns.eventId, parsed.data.eventId), sql`lower(${eventWalkIns.email}) = ${email}`))
    .limit(1);

  if (existing) {
    await db
      .update(eventWalkIns)
      .set({
        fullName: parsed.data.fullName,
        email,
        arrivedAt,
        recordedById: gate.member.id,
      })
      .where(eq(eventWalkIns.id, existing.id));
  } else {
    await db.insert(eventWalkIns).values({
      eventId: parsed.data.eventId,
      fullName: parsed.data.fullName,
      email,
      arrivedAt,
      recordedById: gate.member.id,
    });
  }

  revalidateCheckIn();
  return { success: true };
}
