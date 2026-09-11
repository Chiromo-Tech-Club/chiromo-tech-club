"use client";

import Link from "next/link";
import { CalendarDays, CheckCircle2, MapPin, Mic2, UserRound, ExternalLink } from "lucide-react";
import { formatEventDate } from "@/lib/utils/format-date";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/alignui/button";
import { useEventRegistration } from "@/features/events/useEventRegistration";
import { ROUTES } from "@/constants/routes";

export interface UpcomingEventItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  startsAt: string;
  location: string;
  coverImageUrl?: string | null;
  organizerName?: string | null;
  guestSpeakerName?: string | null;
}

interface UpcomingEventsWidgetProps {
  events: UpcomingEventItem[];
  /** When provided, enables RSVP + Registered badge for that member. */
  registeredEventIds?: string[];
  /** Signed-in member dashboard — show RSVP buttons. */
  canRsvp?: boolean;
}

function EventRsvpButton({
  slug,
  alreadyRegistered,
}: {
  slug: string;
  alreadyRegistered: boolean;
}) {
  const { status, error, register } = useEventRegistration(slug);
  const done = alreadyRegistered || status === "success";

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green/10 px-2.5 py-1 text-[10px] font-bold text-green">
        <CheckCircle2 size={11} /> Going
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="primary"
        size="sm"
        className="rounded-full px-3 py-1.5 text-[11px]"
        disabled={status === "submitting"}
        onClick={() => void register()}
      >
        {status === "submitting" ? "…" : "RSVP"}
      </Button>
      {error ? <p className="max-w-[10rem] text-right text-[10px] text-red-600">{error}</p> : null}
    </div>
  );
}

export function UpcomingEventsWidget({
  events,
  registeredEventIds,
  canRsvp = false,
}: UpcomingEventsWidgetProps) {
  return (
    <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-green" />
          <h3 className="font-display text-sm font-bold text-ink">Upcoming Events</h3>
        </div>
        <Link href={ROUTES.events} className="text-[11px] font-semibold text-sky hover:underline">
          Find all events
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-muted">Nothing scheduled yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {events.map((e) => {
            const isRegistered = registeredEventIds?.includes(e.id);
            return (
              <li
                key={e.id}
                className="overflow-hidden rounded-2xl border border-line/80 bg-cream/20 transition-colors hover:border-sky/35"
              >
                <div className="flex flex-col gap-3 p-3 sm:flex-row sm:gap-4 sm:p-3.5">
                  <div className="relative aspect-[1080/1350] w-full shrink-0 overflow-hidden rounded-xl border border-line bg-cream-2 sm:w-[72px]">
                    {e.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.coverImageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">
                        Poster
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={ROUTES.event(e.slug)}
                          className="font-display text-sm font-bold text-ink hover:text-sky"
                        >
                          {e.title}
                        </Link>
                        <p className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-green">
                          {formatEventDate(e.startsAt)}
                        </p>
                      </div>
                      {canRsvp ? (
                        <EventRsvpButton slug={e.slug} alreadyRegistered={Boolean(isRegistered)} />
                      ) : isRegistered ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green/10 px-2 py-0.5 text-[10px] font-semibold text-green">
                          <CheckCircle2 size={10} /> Registered
                        </span>
                      ) : null}
                    </div>

                    <p className="line-clamp-2 text-xs leading-relaxed text-ink-2">{e.description}</p>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={11} /> {e.location}
                      </span>
                      {e.organizerName ? (
                        <span className="inline-flex items-center gap-1">
                          <UserRound size={11} /> Hosted by {e.organizerName}
                        </span>
                      ) : null}
                      {e.guestSpeakerName ? (
                        <span className="inline-flex items-center gap-1">
                          <Mic2 size={11} /> {e.guestSpeakerName}
                        </span>
                      ) : null}
                    </div>

                    <Link
                      href={ROUTES.event(e.slug)}
                      className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-semibold text-sky hover:underline",
                      )}
                    >
                      View details <ExternalLink size={10} />
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
