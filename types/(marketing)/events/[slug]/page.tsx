import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { events } from "@/lib/drizzle/schema";
import { EVENTS_SEED } from "@/data/events-seed";
import { formatEventDate, formatEventTime } from "@/lib/utils/format-date";
import { EventRegistrationForm } from "@/features/events/event-registration";
import type { ClubEvent } from "@/types/event";

type EventDetail = Pick<ClubEvent, "slug" | "title" | "description" | "startsAt" | "location" | "capacity">;

/**
 * Same DB-first, seed-fallback pattern as the events listing page —
 * see app/(marketing)/events/page.tsx and data/events-seed.ts.
 */
async function getEvent(slug: string): Promise<EventDetail | null> {
  try {
    const db = getDb();
    const [row] = await db
      .select({
        slug: events.slug,
        title: events.title,
        description: events.description,
        startsAt: events.startsAt,
        location: events.location,
        capacity: events.capacity,
      })
      .from(events)
      .where(eq(events.slug, slug))
      .limit(1);

    if (row) return { ...row, startsAt: row.startsAt.toISOString() };
  } catch (err) {
    console.error("getEvent: falling back to seed data —", err);
  }

  const seeded = EVENTS_SEED.find((e) => e.slug === slug);
  return seeded ? { ...seeded, capacity: null } : null;
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  return (
    <main className="mx-auto max-w-[720px] px-8 pb-24 pt-40">
      <div className="font-mono text-xs tracking-wide text-accent">
        {formatEventDate(event.startsAt)} · {formatEventTime(event.startsAt)}
      </div>
      <h1 className="mt-3.5 font-display text-[clamp(28px,4vw,44px)] font-medium leading-[1.1] tracking-[-0.02em]">
        {event.title}
      </h1>
      <p className="mt-5 text-[16px] leading-[1.6] text-text-2">{event.description}</p>
      <div className="mt-4 text-sm text-text-3">{event.location}</div>

      <div className="mt-10">
        <EventRegistrationForm eventSlug={event.slug} />
      </div>
    </main>
  );
}
