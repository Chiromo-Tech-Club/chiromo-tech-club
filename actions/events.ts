"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { getDb } from "../lib/drizzle/client";
import { events, eventRegistrations, members } from "../lib/drizzle/schema";
import { auth } from "../lib/clerk/client";
import { sendEventReminder } from "../services/email";
import { formatEventDate } from "../lib/utils/format-date";
import { ROUTES } from "../constants/routes";
import type { ActionResult } from "../actions/membership";

export async function registerForEvent(eventSlug: string): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Sign in to register for events." };
  }

  const db = getDb();

  const [event] = await db.select().from(events).where(eq(events.slug, eventSlug)).limit(1);
  if (!event) return { success: false, error: "Event not found." };

  const [member] = await db.select().from(members).where(eq(members.clerkUserId, userId)).limit(1);
  if (!member) return { success: false, error: "Complete your club profile before registering." };

  try {
    const [existing] = await db
      .select()
      .from(eventRegistrations)
      .where(and(eq(eventRegistrations.eventId, event.id), eq(eventRegistrations.memberId, member.id)))
      .limit(1);

    if (existing) {
      return { success: false, error: "You're already registered for this event." };
    }

    if (event.capacity) {
      const [{ count }] = await db
        .select({ count: eventRegistrations.id })
        .from(eventRegistrations)
        .where(eq(eventRegistrations.eventId, event.id));
      if (Number(count) >= event.capacity) {
        return { success: false, error: "This event is full." };
      }
    }

    await db.insert(eventRegistrations).values({ eventId: event.id, memberId: member.id });

    await sendEventReminder(member.email, event.title, formatEventDate(event.startsAt.toISOString())).catch((err) =>
      console.error("Event reminder email failed:", err),
    );

    revalidatePath(ROUTES.event(eventSlug));
    return { success: true };
  } catch (err) {
    console.error("registerForEvent failed:", err);
    return { success: false, error: "Could not complete registration." };
  }
}