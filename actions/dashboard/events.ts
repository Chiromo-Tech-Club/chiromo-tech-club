"use server";

import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { events, eventRegistrations, members, memberCommunities } from "@/lib/drizzle/schema";
import { canAccessExecSection } from "@/lib/supabase/auth-helpers";
import { canAccessMemberEvents } from "@/lib/supabase/get-current-member";
import { slugify } from "@/lib/utils/slugify";
import { uploadEventCover } from "@/services/upload";
import { ensureEventsColumns } from "@/lib/drizzle/ensure-events-columns";
import { CATEGORY_ORDER, type EventCategory } from "@/features/events/categorize";
import { ROUTES } from "@/constants/routes";
import type { ActionResult } from "@/actions/membership";

const categoryEnum = z.enum(CATEGORY_ORDER as [EventCategory, ...EventCategory[]]);

const fieldsSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(3).max(4000),
  startsAt: z.string().datetime(),
  location: z.string().min(2).max(200),
  capacity: z.number().int().positive().optional().nullable(),
  organizerName: z.string().max(120).optional().nullable(),
  guestSpeakerName: z.string().max(120).optional().nullable(),
  category: categoryEnum.default("meetup"),
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
  const categoryRaw = String(formData.get("category") ?? "meetup").trim();
  return fieldsSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    startsAt: String(formData.get("startsAt") ?? ""),
    location: String(formData.get("location") ?? ""),
    capacity: capacityRaw ? Number(capacityRaw) : null,
    organizerName: organizerName || null,
    guestSpeakerName: guestSpeakerName || null,
    category: categoryRaw || "meetup",
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
        category: parsed.data.category,
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
        category: parsed.data.category,
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

/**
 * Remove RSVPs from people who never finished registration or are not approved.
 * Keeps only approved members (and exec/admin) on event attendee lists.
 */
export async function purgeIneligibleEventRsvps(): Promise<
  ActionResult<{ removed: number; names: string[] }>
> {
  const allowed = await canAccessExecSection("corporate_affairs");
  if (!allowed) return { success: false, error: "Corporate Affairs access required." };

  try {
    const db = getDb();

    const regs = await db
      .select({
        registrationId: eventRegistrations.id,
        memberId: members.id,
        fullName: members.fullName,
        email: members.email,
        role: members.role,
        membershipStatus: members.membershipStatus,
        studentId: members.studentId,
        mpesaReference: members.mpesaReference,
        phoneNumber: members.phoneNumber,
      })
      .from(eventRegistrations)
      .innerJoin(members, eq(eventRegistrations.memberId, members.id));

    if (regs.length === 0) {
      return { success: true, data: { removed: 0, names: [] } };
    }

    const memberIds = [...new Set(regs.map((r) => r.memberId))];
    const communityRows = await db
      .select({
        memberId: memberCommunities.memberId,
        communitySlug: memberCommunities.communitySlug,
      })
      .from(memberCommunities)
      .where(inArray(memberCommunities.memberId, memberIds));

    const communitiesByMember = new Map<string, string[]>();
    for (const row of communityRows) {
      const list = communitiesByMember.get(row.memberId) ?? [];
      list.push(row.communitySlug);
      communitiesByMember.set(row.memberId, list);
    }

    const toRemove: { registrationId: string; fullName: string }[] = [];
    for (const reg of regs) {
      const eligible = canAccessMemberEvents({
        role: reg.role,
        membershipStatus: reg.membershipStatus,
        studentId: reg.studentId,
        mpesaReference: reg.mpesaReference,
        phoneNumber: reg.phoneNumber,
        communitySlugs: communitiesByMember.get(reg.memberId) ?? [],
      });
      if (!eligible) {
        toRemove.push({ registrationId: reg.registrationId, fullName: reg.fullName });
      }
    }

    if (toRemove.length === 0) {
      return { success: true, data: { removed: 0, names: [] } };
    }

    const ids = toRemove.map((r) => r.registrationId);
    await db.delete(eventRegistrations).where(inArray(eventRegistrations.id, ids));

    revalidateEventPaths();
    revalidatePath("/events");
    revalidatePath(ROUTES.dashboard);

    const names = [...new Set(toRemove.map((r) => r.fullName))];
    return { success: true, data: { removed: toRemove.length, names } };
  } catch (err) {
    console.error("purgeIneligibleEventRsvps failed:", err);
    return { success: false, error: "Could not remove ineligible RSVPs." };
  }
}
