import Link from "next/link";
import { notFound } from "next/navigation";
import { and, count, eq } from "drizzle-orm";
import { CalendarDays } from "lucide-react";
import { getDb } from "@/lib/drizzle/client";
import { eventRegistrations } from "@/lib/drizzle/schema";
import { getClubEventBySlug } from "@/lib/events/queries";
import { formatEventDate, formatEventTime } from "@/lib/utils/format-date";
import { CATEGORY_META, inferEventCategory } from "@/features/events/categorize";
import { EventRegistrationForm } from "@/features/events/event-registration";
import { getAuthUserId } from "@/lib/supabase/auth-helpers";
import { ROUTES } from "@/constants/routes";
import type { ClubEvent } from "@/types/event";

type EventDetail = Pick<ClubEvent, "slug" | "title" | "description" | "startsAt" | "location" | "capacity"> & {
  id: string;
  coverImageUrl: string | null;
  hostInstitution: string;
  guestSpeakerName: string | null;
};

async function getEvent(slug: string): Promise<EventDetail | null> {
  const row = await getClubEventBySlug(slug);
  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    startsAt: row.startsAt.toISOString(),
    location: row.location,
    capacity: row.capacity,
    coverImageUrl: row.coverImageUrl,
    hostInstitution: row.organizerName || "Chiromo Tech Club",
    guestSpeakerName: row.guestSpeakerName,
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const category = inferEventCategory(event.title);
  const meta = CATEGORY_META[category];
  const userId = await getAuthUserId().catch(() => null);

  let alreadyRegistered = false;
  let spotsLeft: number | null = event.capacity ?? null;

  try {
    const db = getDb();
    const [agg] = await db
      .select({ value: count() })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, event.id));
    const registeredCount = agg?.value ?? 0;
    if (typeof event.capacity === "number") {
      spotsLeft = Math.max(0, event.capacity - registeredCount);
    }

    if (userId) {
      const [mine] = await db
        .select({ id: eventRegistrations.id })
        .from(eventRegistrations)
        .where(and(eq(eventRegistrations.eventId, event.id), eq(eventRegistrations.memberId, userId)))
        .limit(1);
      alreadyRegistered = Boolean(mine);
    }
  } catch (err) {
    console.warn("event registration stats failed:", err);
  }

  return (
    <main className="mx-auto max-w-[720px] px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
      <Link href={ROUTES.events} className="text-xs font-semibold text-sky hover:underline">
        ← All events
      </Link>

      <div className="relative mt-4 aspect-[1080/1350] w-full max-w-md overflow-hidden rounded-3xl border border-line sm:max-w-lg">
        {event.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.coverImageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-navy via-navy-dark to-sky/70 text-white">
            <CalendarDays size={36} />
            <span className="font-display text-xl font-bold">CTC Event</span>
          </div>
        )}
        <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${meta.tone}`}>
          {meta.label}
        </span>
      </div>

      <div className="mt-8 font-mono text-xs tracking-wide text-sky">
        {formatEventDate(event.startsAt)} · {formatEventTime(event.startsAt)}
      </div>

      <h1 className="mt-3.5 font-display text-3xl font-medium leading-[1.1] tracking-[-0.02em] text-ink sm:text-4xl">
        {event.title}
      </h1>

      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-cream-2 px-3.5 py-1 font-mono text-xs text-ink-2">
        <span>Hosted by:</span>
        <span className="font-semibold text-ink">{event.hostInstitution}</span>
      </div>

      {event.guestSpeakerName ? (
        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1 font-mono text-xs text-ink-2">
          <span>Guest speaker:</span>
          <span className="font-semibold text-ink">{event.guestSpeakerName}</span>
        </div>
      ) : null}

      <div className="mt-8 space-y-3">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-2">About this event</h2>
        <p className="whitespace-pre-wrap text-base leading-relaxed text-ink-2">{event.description}</p>
      </div>

      <div className="mt-4 font-mono text-sm text-muted">{event.location}</div>

      <div className="mt-10">
        <EventRegistrationForm
          eventSlug={event.slug}
          isSignedIn={Boolean(userId)}
          alreadyRegistered={alreadyRegistered}
          spotsLeft={spotsLeft}
        />
      </div>
    </main>
  );
}
