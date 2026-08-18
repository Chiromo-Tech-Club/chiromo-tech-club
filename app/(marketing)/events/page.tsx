import Link from "next/link";
import { and, isNull, gte, lt, desc } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { events } from "@/lib/drizzle/schema";
import { ROUTES } from "@/constants/routes";
import { FadeImage } from "@/components/news/FadeImage";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  eventCoverImage,
  inferEventCategory,
  type EventCategory,
} from "@/features/events/categorize";
import type { ClubEvent } from "@/types/event";

export const metadata = { title: "Events" };

type RawEvent = Pick<ClubEvent, "slug" | "title" | "description" | "startsAt" | "location">;
type EventListItem = RawEvent & { category: EventCategory; coverImage: string };
type Scope = "upcoming" | "past";

const PER_PAGE = 12;

/* ------------------------------------------------------------------ */
/*  Seed data — used only when the DB isn't reachable                  */
/* ------------------------------------------------------------------ */

function generateMassiveEventsSeed(): RawEvent[] {
  const generated: RawEvent[] = [];
  const topics = [
    "AI & Machine Learning", "Advanced Cloud Architecture", "Cybersecurity Defense & Ops",
    "Full-Stack Web Engineering", "Mobile App Development", "DevOps & OpenInfra",
    "UI/UX Design Systems", "Blockchain & Web3 Security", "Data Engineering Pipelines",
    "Embedded Systems & IoT", "Rust Programming Masterclass", "Microservices Scalability",
  ];

  // Canonical format names — these ARE the category taxonomy, so
  // inferEventCategory() reads them straight out of the generated title.
  const formats: EventCategory[] = ["hackathon", "workshop", "buildathon", "bootcamp", "meetup"];
  const formatLabel: Record<EventCategory, string> = {
    hackathon: "Hackathon",
    workshop: "Workshop",
    buildathon: "Buildathon",
    bootcamp: "Bootcamp",
    meetup: "Community Meetup",
  };

  const locations = [
    "Nairobi Garage, Westlands", "iHub, Nairobi", "Nailab, Nairobi",
    "Strathmore University Hub", "Kigali Heights (Hybrid)", "Online Stream (Zoom/YouTube)", "LCelot Tech Space, Karen",
  ];

  const baseTimestamp = new Date("2026-08-10T09:00:00Z").getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  for (let i = 1; i <= 210; i++) {
    const eventTime = new Date(baseTimestamp + i * (dayMs * 1.5));
    const topic = topics[i % topics.length];
    const format = formats[i % formats.length];
    const location = locations[i % locations.length];

    generated.push({
      slug: `tech-community-event-2026-${i}`,
      title: `${topic}: ${formatLabel[format]} #${i}`,
      description: `Join community experts and practitioners for an intensive session exploring production use-cases, modern tooling trends, and direct peer code reviews around ${topic.toLowerCase()}.`,
      startsAt: eventTime.toISOString(),
      location,
    });
  }

  return generated;
}

const MASSIVE_EVENTS_SEED = generateMassiveEventsSeed();

/* ------------------------------------------------------------------ */
/*  Data fetching                                                      */
/* ------------------------------------------------------------------ */

async function fetchRawEvents(scope: Scope): Promise<RawEvent[]> {
  try {
    const db = getDb();
    const now = new Date();
    const rows = await db
      .select({
        slug: events.slug,
        title: events.title,
        description: events.description,
        startsAt: events.startsAt,
        location: events.location,
      })
      .from(events)
      .where(
        and(
          isNull(events.deletedAt),
          scope === "upcoming" ? gte(events.startsAt, now) : lt(events.startsAt, now),
        ),
      )
      .orderBy(scope === "upcoming" ? events.startsAt : desc(events.startsAt))
      .limit(1000); // safety cap — filtering/pagination below happens in memory

    if (rows.length === 0 && scope === "upcoming") return MASSIVE_EVENTS_SEED;

    return rows.map((row) => ({ ...row, startsAt: row.startsAt.toISOString() }));
  } catch (err) {
    console.error(`fetchRawEvents(${scope}): falling back to generated seed data —`, err);
    return scope === "upcoming" ? MASSIVE_EVENTS_SEED : [];
  }
}

async function getEvents(scope: Scope): Promise<EventListItem[]> {
  const raw = await fetchRawEvents(scope);
  return raw.map((e) => ({
    ...e,
    category: inferEventCategory(e.title),
    coverImage: eventCoverImage(e.slug),
  }));
}

/* ------------------------------------------------------------------ */
/*  Date + URL helpers                                                 */
/* ------------------------------------------------------------------ */

function monthKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}`;
}
function monthLabel(d: Date) {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
function groupByMonth(list: EventListItem[]) {
  const groups = new Map<string, { label: string; events: EventListItem[] }>();
  for (const event of list) {
    const d = new Date(event.startsAt);
    const key = monthKey(d);
    if (!groups.has(key)) groups.set(key, { label: monthLabel(d), events: [] });
    groups.get(key)!.events.push(event);
  }
  return Array.from(groups.values());
}

function buildHref(params: { scope: Scope; category?: string; page?: number }) {
  const sp = new URLSearchParams();
  if (params.scope !== "upcoming") sp.set("scope", params.scope);
  if (params.category && params.category !== "all") sp.set("category", params.category);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `${ROUTES.events}?${qs}` : ROUTES.events;
}

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

function DateBlock({ date, tone = "light" }: { date: Date; tone?: "light" | "dark" }) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const dark = tone === "dark";
  return (
    <div
      className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-card-sm font-mono ${
        dark ? "bg-white/10 text-white" : "bg-cream-2 text-ink"
      }`}
    >
      <span className={`text-label-2xs uppercase ${dark ? "text-white/60" : "text-muted"}`}>{month}</span>
      <span className="text-title-h6 leading-none">{day}</span>
      <span className={`text-label-2xs uppercase ${dark ? "text-white/60" : "text-muted"}`}>{weekday}</span>
    </div>
  );
}

function EventRow({ event }: { event: EventListItem }) {
  const date = new Date(event.startsAt);
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const meta = CATEGORY_META[event.category];

  return (
    <Link
      href={ROUTES.event(event.slug)}
      className="group flex flex-col gap-4 rounded-card border border-line bg-surface p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky/40 hover:shadow-custom-md sm:flex-row sm:items-center sm:gap-5 sm:p-5"
    >
      <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-card-sm sm:h-20 sm:w-28">
        <FadeImage src={event.coverImage} priority={false} />
        <span className="absolute left-2 top-2 rounded-pill bg-navy/85 px-2 py-1 font-mono text-label-2xs text-white backdrop-blur-sm">
          {day} {month}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <span className={`inline-block rounded-pill px-2.5 py-0.5 text-label-2xs font-semibold ${meta.tone}`}>
          {meta.label}
        </span>
        <h3 className="mt-1.5 truncate text-label-lg text-ink">{event.title}</h3>
        <p className="mt-1 line-clamp-1 text-paragraph-sm text-ink-2">{event.description}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-label-2xs text-muted">
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" className="h-3.5 w-3.5 stroke-current">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3.5 2" />
            </svg>
            {time}
          </span>
          {event.location && (
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" className="h-3.5 w-3.5 stroke-current">
                <path d="M12 21s7-6.5 7-11.5A7 7 0 1 0 5 9.5C5 14.5 12 21 12 21z" />
                <circle cx="12" cy="9.5" r="2.3" />
              </svg>
              {event.location}
            </span>
          )}
        </div>
      </div>

      <span className="hidden shrink-0 items-center gap-1.5 rounded-pill border border-line px-4 py-2 text-label-sm text-ink-2 transition-colors group-hover:border-sky/40 group-hover:text-sky sm:flex">
        RSVP
        <svg viewBox="0 0 16 16" fill="none" strokeWidth="1.6" className="h-3.5 w-3.5 stroke-current transition-transform duration-300 group-hover:translate-x-0.5">
          <path d="M3 8h10M8.5 3.5L13 8l-4.5 4.5" />
        </svg>
      </span>
    </Link>
  );
}

function ScopeTabs({ active, category }: { active: Scope; category: string }) {
  const tabs: { key: Scope; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
  ];
  return (
    <div className="inline-flex items-center gap-1 rounded-pill border border-line bg-surface p-1">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={buildHref({ scope: t.key, category, page: 1 })}
          className={`rounded-pill px-4 py-1.5 text-label-sm transition-colors ${
            active === t.key ? "bg-navy text-white" : "text-ink-2 hover:text-ink"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

function CategoryFilters({ active, scope }: { active: string; scope: Scope }) {
  const options = [{ key: "all", label: "All" }, ...CATEGORY_ORDER.map((c) => ({ key: c, label: CATEGORY_META[c].label }))];
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const isActive = active === o.key;
        return (
          <Link
            key={o.key}
            href={buildHref({ scope, category: o.key, page: 1 })}
            className={`rounded-pill border px-3.5 py-1.5 text-label-xs transition-colors ${
              isActive ? "border-navy bg-navy text-white" : "border-line text-ink-2 hover:border-sky/40 hover:text-sky"
            }`}
          >
            {o.label}
          </Link>
        );
      })}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  scope,
  category,
}: {
  page: number;
  totalPages: number;
  scope: Scope;
  category: string;
}) {
  if (totalPages <= 1) return null;
  const arrowClasses =
    "flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-2 transition-colors hover:border-sky/40 hover:text-sky";
  const disabledClasses = "flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-2/30";

  return (
    <div className="mt-10 flex items-center justify-center gap-3">
      {page > 1 ? (
        <Link href={buildHref({ scope, category, page: page - 1 })} className={arrowClasses} aria-label="Previous page">
          ‹
        </Link>
      ) : (
        <span className={disabledClasses} aria-hidden>
          ‹
        </span>
      )}
      <span className="font-mono text-label-xs text-muted">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={buildHref({ scope, category, page: page + 1 })} className={arrowClasses} aria-label="Next page">
          ›
        </Link>
      ) : (
        <span className={disabledClasses} aria-hidden>
          ›
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

interface EventsPageProps {
  searchParams: Promise<{ scope?: string; category?: string; page?: string }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const sp = await searchParams;
  const scope: Scope = sp.scope === "past" ? "past" : "upcoming";
  const categoryParam = sp.category ?? "all";
  const pageParam = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const all = await getEvents(scope);
  const filtered = categoryParam === "all" ? all : all.filter((e) => e.category === categoryParam);

  const featured = scope === "upcoming" && pageParam === 1 ? filtered[0] : undefined;
  const rest = featured ? filtered.slice(1) : filtered;

  const totalPages = Math.max(1, Math.ceil(rest.length / PER_PAGE));
  const page = Math.min(pageParam, totalPages);
  const pageItems = rest.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const months = groupByMonth(pageItems);

  const featuredMeta = featured ? CATEGORY_META[featured.category] : undefined;

  return (
    <main className="relative mx-auto max-w-[1280px] overflow-hidden px-8 pb-24 pt-40 font-body">
      {/* Ambient background — matches the rest of the site */}
      <div className="pointer-events-none absolute inset-0 -z-10 text-ink">
        <div
          className="absolute -top-24 right-[-10%] h-[520px] w-[520px] rounded-full opacity-[0.16] blur-[110px]"
          style={{ background: "radial-gradient(circle, var(--color-sky), transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "linear-gradient(to bottom, black, transparent 80%)",
          }}
        />
      </div>

      {/* ---------------- Hero ---------------- */}
      <div className="relative max-w-[640px]">
        <div className="mb-5 flex items-center gap-2.5 font-mono text-subheading-xs uppercase text-sky">
          <span className="h-px w-4 bg-sky" />
          Events
        </div>
        <h1 className="font-display text-title-h2 font-medium leading-[1.05] tracking-[-0.02em] text-ink md:text-title-h1">
          What&apos;s next on the calendar.
        </h1>
        <p className="mt-4.5 max-w-[520px] text-paragraph-lg text-ink-2">
          Hackathons, workshops, buildathons, and bootcamps from every community — one calendar, no digging through group chats.
        </p>
      </div>

      {/* ---------------- Tabs + filters + count ---------------- */}
      <div className="mt-10 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ScopeTabs active={scope} category={categoryParam} />
          <span className="font-mono text-label-xs text-muted">
            {String(filtered.length).padStart(2, "0")} {scope} event{filtered.length === 1 ? "" : "s"}
          </span>
        </div>
        <CategoryFilters active={categoryParam} scope={scope} />
      </div>

      {/* ---------------- Empty state ---------------- */}
      {filtered.length === 0 && (
        <div className="mt-8 rounded-card border border-dashed border-line bg-cream-2 px-6 py-16 text-center">
          <p className="text-paragraph-sm text-muted">
            {scope === "upcoming"
              ? categoryParam === "all"
                ? "Nothing on the calendar yet — check back soon."
                : `No upcoming ${CATEGORY_META[categoryParam as EventCategory]?.label.toLowerCase() ?? "events"} right now.`
              : "No past events on record."}
          </p>
        </div>
      )}

      {/* ---------------- Featured next event ---------------- */}
      {featured && (
        <div className="relative mt-8 overflow-hidden rounded-card bg-navy p-8 text-white sm:p-10">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={featured.coverImage}
              alt=""
              className="h-full w-full scale-105 object-cover opacity-30 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/75 to-navy/50" />
          </div>
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="relative z-[1] flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-5">
              <DateBlock date={new Date(featured.startsAt)} tone="dark" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-label-2xs uppercase tracking-wide text-sky">Up Next</span>
                  {featuredMeta && (
                    <span className={`rounded-pill px-2 py-0.5 text-label-2xs font-semibold ${featuredMeta.tone}`}>
                      {featuredMeta.label}
                    </span>
                  )}
                </div>
                <h2 className="mt-1.5 text-title-h6 leading-snug text-white sm:text-title-h5">{featured.title}</h2>
                <p className="mt-2 max-w-lg text-paragraph-sm text-white/75">{featured.description}</p>
                {featured.location && (
                  <p className="mt-2 flex items-center gap-1.5 font-mono text-label-xs text-white/60">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" className="h-3.5 w-3.5 stroke-current">
                      <path d="M12 21s7-6.5 7-11.5A7 7 0 1 0 5 9.5C5 14.5 12 21 12 21z" />
                      <circle cx="12" cy="9.5" r="2.3" />
                    </svg>
                    {featured.location}
                  </p>
                )}
              </div>
            </div>
            <Link
              href={ROUTES.event(featured.slug)}
              className="group/cta inline-flex shrink-0 items-center gap-1.5 self-start rounded-pill bg-surface px-5 py-2.5 text-label-sm font-semibold text-navy transition-transform duration-300 hover:-translate-y-0.5 sm:self-auto"
            >
              RSVP
              <svg viewBox="0 0 16 16" fill="none" strokeWidth="1.6" className="h-3.5 w-3.5 stroke-current transition-transform duration-300 group-hover/cta:translate-x-1">
                <path d="M3 8h10M8.5 3.5L13 8l-4.5 4.5" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* ---------------- Month-grouped list ---------------- */}
      {months.length > 0 && (
        <div className="mt-14 flex flex-col gap-10">
          {months.map((group) => (
            <div key={group.label}>
              <h2 className="mb-4 text-label-lg text-ink">{group.label}</h2>
              <div className="flex flex-col gap-3">
                {group.events.map((event) => (
                  <EventRow key={event.slug} event={event} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} scope={scope} category={categoryParam} />
    </main>
  );
}