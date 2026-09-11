import { and, asc, desc, eq, gte, isNull, lt, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { events } from "@/lib/drizzle/schema";
import { ensureEventsColumns } from "@/lib/drizzle/ensure-events-columns";

export type ClubEventRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  startsAt: Date;
  location: string;
  capacity: number | null;
  coverImageUrl: string | null;
  organizerName: string | null;
  guestSpeakerName: string | null;
  deletedAt: Date | null;
};

export type EventScope = "upcoming" | "past" | "all";

async function ensureReady() {
  try {
    await ensureEventsColumns();
  } catch (err) {
    console.warn("ensureEventsColumns failed:", err);
  }
}

function mapCoreRow(row: {
  id: string;
  slug: string;
  title: string;
  description: string;
  startsAt: Date;
  location: string;
  capacity: number | null;
  coverImageUrl: string | null;
  deletedAt: Date | null;
}): ClubEventRow {
  return {
    ...row,
    organizerName: null,
    guestSpeakerName: null,
  };
}

/**
 * Single source of truth for club events — always reads Postgres `events`.
 * Never injects seed / placeholder calendars.
 */
export async function listClubEvents(opts?: {
  scope?: EventScope;
  limit?: number;
  /** Include soft-deleted rows (admin only). Default false. */
  includeDeleted?: boolean;
}): Promise<ClubEventRow[]> {
  await ensureReady();
  const db = getDb();
  const now = new Date();
  const scope = opts?.scope ?? "all";
  const limit = opts?.limit;

  const filters: SQL[] = [];
  if (!opts?.includeDeleted) filters.push(isNull(events.deletedAt));
  if (scope === "upcoming") filters.push(gte(events.startsAt, now));
  if (scope === "past") filters.push(lt(events.startsAt, now));

  const where = filters.length === 0 ? undefined : filters.length === 1 ? filters[0] : and(...filters);
  const order = scope === "upcoming" ? asc(events.startsAt) : desc(events.startsAt);

  try {
    const q = db
      .select({
        id: events.id,
        slug: events.slug,
        title: events.title,
        description: events.description,
        startsAt: events.startsAt,
        location: events.location,
        capacity: events.capacity,
        coverImageUrl: events.coverImageUrl,
        organizerName: events.organizerName,
        guestSpeakerName: events.guestSpeakerName,
        deletedAt: events.deletedAt,
      })
      .from(events)
      .where(where)
      .orderBy(order);

    const rows = limit ? await q.limit(limit) : await q;
    return rows;
  } catch (err) {
    console.warn("listClubEvents full select failed, retrying core columns:", err);
    try {
      const q = db
        .select({
          id: events.id,
          slug: events.slug,
          title: events.title,
          description: events.description,
          startsAt: events.startsAt,
          location: events.location,
          capacity: events.capacity,
          coverImageUrl: events.coverImageUrl,
          deletedAt: events.deletedAt,
        })
        .from(events)
        .where(where)
        .orderBy(order);

      const rows = limit ? await q.limit(limit) : await q;
      return rows.map(mapCoreRow);
    } catch (coreErr) {
      console.error("listClubEvents failed:", coreErr);
      return [];
    }
  }
}

export async function getClubEventBySlug(slug: string): Promise<ClubEventRow | null> {
  await ensureReady();
  const db = getDb();

  try {
    const [row] = await db
      .select({
        id: events.id,
        slug: events.slug,
        title: events.title,
        description: events.description,
        startsAt: events.startsAt,
        location: events.location,
        capacity: events.capacity,
        coverImageUrl: events.coverImageUrl,
        organizerName: events.organizerName,
        guestSpeakerName: events.guestSpeakerName,
        deletedAt: events.deletedAt,
      })
      .from(events)
      .where(and(eq(events.slug, slug), isNull(events.deletedAt)))
      .limit(1);
    return row ?? null;
  } catch (err) {
    console.warn("getClubEventBySlug full select failed, retrying core:", err);
    try {
      const [row] = await db
        .select({
          id: events.id,
          slug: events.slug,
          title: events.title,
          description: events.description,
          startsAt: events.startsAt,
          location: events.location,
          capacity: events.capacity,
          coverImageUrl: events.coverImageUrl,
          deletedAt: events.deletedAt,
        })
        .from(events)
        .where(and(eq(events.slug, slug), isNull(events.deletedAt)))
        .limit(1);
      return row ? mapCoreRow(row) : null;
    } catch (coreErr) {
      console.error("getClubEventBySlug failed:", coreErr);
      return null;
    }
  }
}

export function toUpcomingWidgetItem(row: ClubEventRow) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    startsAt: row.startsAt.toISOString(),
    location: row.location,
    coverImageUrl: row.coverImageUrl,
    organizerName: row.organizerName,
    guestSpeakerName: row.guestSpeakerName,
  };
}
