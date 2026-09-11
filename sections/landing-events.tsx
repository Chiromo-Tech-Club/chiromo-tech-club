import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin, Mic2, UserRound } from "lucide-react";
import { listClubEvents } from "@/lib/events/queries";
import { formatEventDate } from "@/lib/utils/format-date";
import { ROUTES } from "@/constants/routes";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";

export async function LandingEventsBand() {
  const rows = await listClubEvents({ scope: "upcoming", limit: 6 });
  const items = rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    description: r.description,
    startsAt: r.startsAt.toISOString(),
    location: r.location,
    coverImageUrl: r.coverImageUrl,
    organizerName: r.organizerName,
    guestSpeakerName: r.guestSpeakerName,
  }));

  return (
    <section id="events" className="relative border-b border-line bg-cream/50 py-16 sm:py-20">
      <div className="mx-auto max-w-[1280px] px-6 sm:px-8">
        <RevealOnScroll className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
          <div className="max-w-xl">
            <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-sky">
              <CalendarDays size={12} />
              Upcoming events
            </div>
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-[1.05] tracking-[-0.02em] text-ink">
              What&apos;s next on the calendar
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-2 sm:text-base">
              Live from the CTC database — workshops, talks, and build sessions you can RSVP to.
            </p>
          </div>
          <Link
            href={ROUTES.events}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-sky/40 hover:text-sky"
          >
            See all events <ArrowUpRight size={14} />
          </Link>
        </RevealOnScroll>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center">
            <p className="text-sm text-muted">No upcoming events in the database yet — check back soon.</p>
            <Link href={ROUTES.events} className="mt-3 inline-block text-xs font-semibold text-sky hover:underline">
              Browse events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {items.map((e) => (
              <RevealOnScroll key={e.slug}>
                <Link
                  href={ROUTES.event(e.slug)}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky/40 hover:shadow-md"
                >
                  <div className="relative aspect-[1080/1350] w-full overflow-hidden bg-cream-2">
                    {e.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={e.coverImageUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-navy to-sky/70 text-white">
                        <CalendarDays size={24} />
                        <span className="text-xs font-semibold opacity-80">CTC Event</span>
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-navy/85 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                      {formatEventDate(e.startsAt)}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
                    <h3 className="font-display text-base font-bold leading-snug text-ink group-hover:text-sky sm:text-lg">
                      {e.title}
                    </h3>
                    <p className="line-clamp-2 text-xs leading-relaxed text-ink-2 sm:text-sm">{e.description}</p>
                    <div className="mt-auto flex flex-col gap-1.5 pt-2 text-[11px] text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={12} className="shrink-0 text-sky" /> {e.location}
                      </span>
                      {e.organizerName ? (
                        <span className="inline-flex items-center gap-1.5">
                          <UserRound size={12} className="shrink-0" /> Hosted by {e.organizerName}
                        </span>
                      ) : null}
                      {e.guestSpeakerName ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Mic2 size={12} className="shrink-0" /> {e.guestSpeakerName}
                        </span>
                      ) : null}
                    </div>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-navy">
                      RSVP / details{" "}
                      <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
