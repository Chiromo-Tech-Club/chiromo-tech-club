import { notFound } from "next/navigation";
import { and, count, eq } from "drizzle-orm";
import Image from "next/image";
import { CalendarDays, MapPin, Mic2 } from "lucide-react";
import { getDb } from "@/lib/drizzle/client";
import { eventRegistrations } from "@/lib/drizzle/schema";
import { getClubEventBySlug } from "@/lib/events/queries";
import { formatEventDate, formatEventTime } from "@/lib/utils/format-date";
import {
  effectiveRegistrationDeadline,
  rsvpClosureMessage,
} from "@/lib/events/registration-deadline";
import { CATEGORY_META, resolveEventCategory } from "@/features/events/categorize";
import { EventRegistrationForm } from "@/features/events/event-registration";
import { EventPageNav } from "@/features/events/EventPageNav";
import { getAuthUserId } from "@/lib/supabase/auth-helpers";
import {
  getCurrentMember,
  canAccessMemberEvents,
  hasCompletedClubRegistration,
} from "@/lib/supabase/get-current-member";
import type { ClubEvent } from "@/types/event";

type EventDetail = Pick<ClubEvent, "slug" | "title" | "description" | "startsAt" | "location" | "capacity"> & {
  id: string;
  coverImageUrl: string | null;
  hostInstitution: string;
  guestSpeakerName: string | null;
  category: string | null;
  registrationDeadline: string | null;
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
    category: row.category,
    registrationDeadline: row.registrationDeadline ? row.registrationDeadline.toISOString() : null,
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const category = resolveEventCategory(event.title, event.category);
  const meta = CATEGORY_META[category];
  const userId = await getAuthUserId().catch(() => null);
  const member = userId
    ? await getCurrentMember({ createIfMissing: false }).catch(() => null)
    : null;

  const registrationDeadline = effectiveRegistrationDeadline(
    new Date(event.startsAt),
    event.registrationDeadline,
  ).toISOString();
  const registrationClosedMessage = rsvpClosureMessage(event.startsAt, event.registrationDeadline);
  const canRsvp = canAccessMemberEvents(member);
  let eligibilityMessage: string | null = null;
  if (userId && !canRsvp) {
    if (!member || !hasCompletedClubRegistration(member)) {
      eligibilityMessage =
        "Finish your CTC membership registration before you can RSVP for events.";
    } else {
      eligibilityMessage =
        "Only approved club members can RSVP. Your application is still pending leadership review.";
    }
  }

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

  const starts = new Date(event.startsAt);
  const month = starts.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = starts.toLocaleDateString("en-US", { day: "numeric" });
  const weekday = starts.toLocaleDateString("en-US", { weekday: "long" });

  return (
    <main className="mx-auto max-w-[1080px] px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
      <EventPageNav variant="detail" />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-12">
        <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[28px] border border-line bg-cream shadow-[0_20px_60px_rgba(23,20,15,0.08)] lg:sticky lg:top-28 lg:mx-0">
          <div className="aspect-[4/5]">
            {event.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.coverImageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-navy via-navy-dark to-sky/70 text-white">
                <CalendarDays size={36} />
                <span className="font-display text-xl font-bold">CTC Event</span>
              </div>
            )}
          </div>
          <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${meta.tone}`}>
            {meta.label}
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <div className="flex w-16 shrink-0 flex-col items-center overflow-hidden rounded-2xl border border-line bg-surface text-center shadow-sm">
              <span className="w-full bg-navy py-1 font-mono text-[10px] font-bold tracking-wider text-white">
                {month}
              </span>
              <span className="py-1.5 font-display text-2xl font-extrabold leading-none text-ink">{day}</span>
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="font-mono text-xs text-sky">
                {weekday} · {formatEventTime(event.startsAt)}
              </p>
              <h1 className="mt-1 font-display text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-ink sm:text-4xl">
                {event.title}
              </h1>
            </div>
          </div>

          <div className="mt-6 space-y-3 rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-ink">
                <CalendarDays size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{formatEventDate(event.startsAt)}</p>
                <p className="text-xs text-muted">{formatEventTime(event.startsAt)}</p>
                <p className="mt-1 text-xs text-muted">
                  RSVP closes {formatEventDate(registrationDeadline)} · {formatEventTime(registrationDeadline)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-ink">
                <MapPin size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{event.location}</p>
                <p className="text-xs text-muted">In person</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              {/chiromo tech club/i.test(event.hostInstitution) ? (
                <span className="relative mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-full border border-line bg-surface">
                  <Image
                    src="/images/image.svg"
                    alt="Chiromo Tech Club logo"
                    fill
                    className="object-contain p-1"
                  />
                </span>
              ) : (
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                  {event.hostInstitution.slice(0, 1).toUpperCase()}
                </span>
              )}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Hosted by</p>
                <p className="text-sm font-semibold text-ink">{event.hostInstitution}</p>
              </div>
            </div>
            {event.guestSpeakerName ? (
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-ink">
                  <Mic2 size={16} />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Guest</p>
                  <p className="text-sm font-semibold text-ink">{event.guestSpeakerName}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-5">
            <EventRegistrationForm
              eventSlug={event.slug}
              isSignedIn={Boolean(userId)}
              alreadyRegistered={alreadyRegistered}
              spotsLeft={spotsLeft}
              canRsvp={canRsvp}
              eligibilityMessage={eligibilityMessage}
              registrationClosedMessage={registrationClosedMessage}
            />
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-ink">About this event</h2>
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-2">{event.description}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
