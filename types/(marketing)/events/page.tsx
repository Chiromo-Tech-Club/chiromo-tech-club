import Link from "next/link";
import { isNull, gte } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { events } from "@/lib/drizzle/schema";
import { EVENTS_SEED } from "@/data/events-seed";
import { EventCard } from "@/features/events/eventCard";
import { ROUTES } from "@/constants/routes";
import type { ClubEvent } from "@/types/event";

export const metadata = { title: "Events" };

type UpcomingEvent = Pick<ClubEvent, "slug" | "title" | "description" | "startsAt" | "location">;

/**
 * Reads upcoming events from the database. Falls back to the local seed
 * list if the database isn't reachable yet (e.g. DATABASE_URL not set,
 * or the table hasn't been migrated/seeded) so this page never hard-fails
 * before Supabase is fully wired up — see data/events-seed.ts.
 */
async function getUpcomingEvents(): Promise<UpcomingEvent[]> {
  try {
    const db = getDb();
    const rows = await db
      .select({
        slug: events.slug,
        title: events.title,
        description: events.description,
        startsAt: events.startsAt,
        location: events.location,
      })
      .from(events)
      .where(isNull(events.deletedAt))
      .orderBy(events.startsAt);

    if (rows.length === 0) return EVENTS_SEED;

    return rows.map((row) => ({ ...row, startsAt: row.startsAt.toISOString() }));
  } catch (err) {
    console.error("getUpcomingEvents: falling back to seed data —", err);
    return EVENTS_SEED;
  }
}

export default async function EventsPage() {
  const upcoming = await getUpcomingEvents();

  return (
    <main className="mx-auto max-w-[1280px] px-8 pb-24 pt-40">
      <h1 className="font-display text-[clamp(32px,4.4vw,52px)] font-medium leading-[1.02] tracking-[-0.02em]">
        What&apos;s next on the calendar.
      </h1>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {upcoming.map((event) => (
          <Link key={event.slug} href={ROUTES.event(event.slug)} className="block">
            <EventCard event={event} />
          </Link>
        ))}
      </div>

      {upcoming.length === 0 && (
        <p className="mt-14 text-sm text-text-2">No upcoming events right now — check back soon.</p>
      )}
    </main>
  );
}
