"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { events } from "@/lib/drizzle/schema";
import { canAccessExecSection } from "@/lib/supabase/auth-helpers";
import { slugify } from "@/lib/utils/slugify";
import { uploadEventCover } from "@/services/upload";
import { ensureEventsColumns } from "@/lib/drizzle/ensure-events-columns";
import { ROUTES } from "@/constants/routes";
import type { ActionResult } from "@/actions/membership";

const fieldsSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(3).max(4000),
  startsAt: z.string().datetime(),
  location: z.string().min(2).max(200),
  capacity: z.number().int().positive().optional().nullable(),
  organizerName: z.string().max(120).optional().nullable(),
  guestSpeakerName: z.string().max(120).optional().nullable(),
});

function revalidateEventPaths(slug?: string) {
  revalidatePath("/dashboard/corporate_affairs/event-manager");
  revalidatePath("/events");
  revalidatePath(ROUTES.dashboard);
  revalidatePath("/");
  if (slug) revalidatePath(ROUTES.event(slug));
}

function parseEventFields(formData: FormData) {
  const capacityRaw = String(formData.get("capacity") ?? "").trim();
  const organizerName = String(formData.get("organizerName") ?? "").trim();
  const guestSpeakerName = String(formData.get("guestSpeakerName") ?? "").trim();
  return fieldsSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    startsAt: String(formData.get("startsAt") ?? ""),
    location: String(formData.get("location") ?? ""),
    capacity: capacityRaw ? Number(capacityRaw) : null,
    organizerName: organizerName || null,
    guestSpeakerName: guestSpeakerName || null,
  });
}

async function maybeUploadPoster(slug: string, formData: FormData): Promise<string | null | undefined> {
  const poster = formData.get("poster");
  if (!(poster instanceof File) || poster.size <= 0) return undefined;
  const uploaded = await uploadEventCover(slug, poster);
  return uploaded.publicUrl;
}

export async function createEvent(formData: FormData): Promise<ActionResult> {
  const allowed = await canAccessExecSection("corporate_affairs");
  if (!allowed) return { success: false, error: "Corporate Affairs access required." };

  const parsed = parseEventFields(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  try {
    await ensureEventsColumns();
    const slug = `${slugify(parsed.data.title)}-${Date.now().toString(36)}`;
    let coverImageUrl: string | null = null;
    try {
      const uploaded = await maybeUploadPoster(slug, formData);
      if (uploaded) coverImageUrl = uploaded;
    } catch (err) {
      console.error("Event poster upload failed:", err);
      return {
        success: false,
        error:
          'Could not upload the poster. Create a public Supabase Storage bucket named "event-covers", then try again.',
      };
    }

    await getDb()
      .insert(events)
      .values({
        slug,
        title: parsed.data.title,
        description: parsed.data.description,
        startsAt: new Date(parsed.data.startsAt),
        location: parsed.data.location,
        capacity: parsed.data.capacity || null,
        organizerName: parsed.data.organizerName ?? null,
        guestSpeakerName: parsed.data.guestSpeakerName ?? null,
        coverImageUrl,
      });
    revalidateEventPaths(slug);
    return { success: true };
  } catch (err) {
    console.error("createEvent failed:", err);
    return { success: false, error: "Could not save this event." };
  }
}

export async function updateEvent(formData: FormData): Promise<ActionResult> {
  const allowed = await canAccessExecSection("corporate_affairs");
  if (!allowed) return { success: false, error: "Corporate Affairs access required." };

  const id = String(formData.get("id") ?? "");
  if (!z.string().uuid().safeParse(id).success) {
    return { success: false, error: "Invalid event." };
  }

  const parsed = parseEventFields(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  try {
    await ensureEventsColumns();
    const db = getDb();
    const [existing] = await db
      .select({ slug: events.slug, coverImageUrl: events.coverImageUrl })
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!existing) return { success: false, error: "Event not found." };

    let coverImageUrl = existing.coverImageUrl;
    try {
      const uploaded = await maybeUploadPoster(existing.slug, formData);
      if (uploaded) coverImageUrl = uploaded;
    } catch (err) {
      console.error("Event poster upload failed:", err);
      return {
        success: false,
        error:
          'Could not upload the poster. Create a public Supabase Storage bucket named "event-covers", then try again.',
      };
    }

    const [updated] = await db
      .update(events)
      .set({
        title: parsed.data.title,
        description: parsed.data.description,
        startsAt: new Date(parsed.data.startsAt),
        location: parsed.data.location,
        capacity: parsed.data.capacity || null,
        organizerName: parsed.data.organizerName ?? null,
        guestSpeakerName: parsed.data.guestSpeakerName ?? null,
        coverImageUrl,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
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
