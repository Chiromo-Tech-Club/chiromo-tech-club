"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { events } from "@/lib/drizzle/schema";
import { canAccessExecSection } from "@/lib/supabase/auth-helpers";
import { slugify } from "@/lib/utils/slugify";
import { ROUTES } from "@/constants/routes";
import type { ActionResult } from "@/actions/membership";

const createSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(3).max(4000),
  startsAt: z.string().datetime(),
  location: z.string().min(2).max(200),
  capacity: z.number().int().positive().optional().nullable(),
});

const updateSchema = createSchema.extend({
  id: z.string().uuid(),
});

function revalidateEventPaths(slug?: string) {
  revalidatePath("/dashboard/corporate_affairs/event-manager");
  revalidatePath("/events");
  revalidatePath(ROUTES.dashboard);
  if (slug) revalidatePath(ROUTES.event(slug));
}

export async function createEvent(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("corporate_affairs");
  if (!allowed) return { success: false, error: "Corporate Affairs access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  try {
    const slug = `${slugify(parsed.data.title)}-${Date.now().toString(36)}`;
    await getDb()
      .insert(events)
      .values({
        slug,
        title: parsed.data.title,
        description: parsed.data.description,
        startsAt: new Date(parsed.data.startsAt),
        location: parsed.data.location,
        capacity: parsed.data.capacity || null,
      });
    revalidateEventPaths(slug);
    return { success: true };
  } catch (err) {
    console.error("createEvent failed:", err);
    return { success: false, error: "Could not save this event." };
  }
}

export async function updateEvent(input: z.infer<typeof updateSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("corporate_affairs");
  if (!allowed) return { success: false, error: "Corporate Affairs access required." };

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  try {
    const [updated] = await getDb()
      .update(events)
      .set({
        title: parsed.data.title,
        description: parsed.data.description,
        startsAt: new Date(parsed.data.startsAt),
        location: parsed.data.location,
        capacity: parsed.data.capacity || null,
        updatedAt: new Date(),
      })
      .where(eq(events.id, parsed.data.id))
      .returning({ slug: events.slug });

    revalidateEventPaths(updated?.slug);
    return { success: true };
  } catch (err) {
    console.error("updateEvent failed:", err);
    return { success: false, error: "Could not update this event." };
  }
}

export async function deleteEvent(eventId: string): Promise<ActionResult> {
  const allowed = await canAccessExecSection("corporate_affairs");
  if (!allowed) return { success: false, error: "Corporate Affairs access required." };

  if (!z.string().uuid().safeParse(eventId).success) {
    return { success: false, error: "Invalid event." };
  }

  try {
    const [deleted] = await getDb()
      .update(events)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(events.id, eventId))
      .returning({ slug: events.slug });

    revalidateEventPaths(deleted?.slug);
    return { success: true };
  } catch (err) {
    console.error("deleteEvent failed:", err);
    return { success: false, error: "Could not delete this event." };
  }
}
