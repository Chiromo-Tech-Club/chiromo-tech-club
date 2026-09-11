import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin, Mic2, UserRound } from "lucide-react";
import { listClubEvents } from "@/lib/events/queries";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  inferEventCategory,
  type EventCategory,
} from "@/features/events/categorize";
import { formatEventDate, formatEventTime } from "@/lib/utils/format-date";
import { ROUTES } from "@/constants/routes";

export const metadata = {
  title: "Events — Workshops, Hackathons & Meetups",
  description:
    "Upcoming and past Chiromo Tech Club events at the University of Nairobi: workshops, hackathons, tech talks, and community meetups at Chiromo Campus.",
};

type Scope = "upcoming" | "past";

type EventCard = {
  id: string;
  slug: string;
  title: string;
  description: string;
  startsAt: string;
  location: string;
  coverImageUrl: string | null;
  organizerName: string | null;
  guestSpeakerName: string | null;
  category: EventCategory;
};

const PER_PAGE = 9;

function buildHref(params: { scope: Scope; category?: string; page?: number }) {
  const sp = new URLSearchParams();
  if (params.scope !== "upcoming") sp.set("scope", params.scope);
  if (params.category && params.category !== "all") sp.set("category", params.category);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `${ROUTES.events}?${qs}` : ROUTES.events;
}

function Poster({
  src,
  title,
  className = "",
}: {
  src: string | null;
  title: string;
  className?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className={`h-full w-full object-cover ${className}`} />
    );
  }
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-navy via-navy-dark to-sky/80 text-white ${className}`}
    >
      <CalendarDays size={28} className="opacity-80" />
      <span className="font-display text-2xl font-extrabold tracking-wide opacity-90">{initials || "CTC"}</span>
    </div>
  );
}

function ScopeTabs({ active, category }: { active: Scope; category: string }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-line bg-surface p-1 shadow-sm">
      {(["upcoming", "past"] as const).map((key) => (
        <Link
          key={key}
          href={buildHref({ scope: key, category, page: 1 })}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
            active === key ? "bg-navy text-white" : "text-ink-2 hover:text-ink"
          }`}
        >
          {key}
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
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              isActive ? "border-navy bg-navy text-white" : "border-line bg-surface text-ink-2 hover:border-sky/40 hover:text-sky"
            }`}
          >
            {o.label}
          </Link>
        );
      })}
    </div>
  );
}

function EventCardLink({ event }: { event: EventCard }) {
  const meta = CATEGORY_META[event.category];
  const date = new Date(event.startsAt);

  return (
    <Link
      href={ROUTES.event(event.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky/40 hover:shadow-lg"
    >
      <div className="relative aspect-[1080/1350] overflow-hidden">
        <Poster
          src={event.coverImageUrl}
          title={event.title}
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-3 pt-10">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-white/90">
            {formatEventDate(event.startsAt)} · {formatEventTime(event.startsAt)}
          </p>
        </div>
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold ${meta.tone}`}>
          {meta.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <h3 className="font-display text-lg font-bold leading-snug text-ink group-hover:text-sky">{event.title}</h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-ink-2">{event.description}</p>

        <div className="mt-auto space-y-1.5 pt-3 text-[11px] text-muted">
          <p className="inline-flex items-center gap-1.5">
            <MapPin size={12} className="text-sky" /> {event.location}
          </p>
          {event.organizerName ? (
            <p className="inline-flex items-center gap-1.5">
              <UserRound size={12} /> Hosted by {event.organizerName}
            </p>
          ) : null}
          {event.guestSpeakerName ? (
            <p className="inline-flex items-center gap-1.5">
              <Mic2 size={12} /> {event.guestSpeakerName}
            </p>
          ) : null}
          <p className="font-mono text-[10px] uppercase tracking-wide text-ink/40">
            {date.toLocaleDateString("en-KE", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <span className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-full bg-navy px-4 py-2.5 text-xs font-bold text-white transition-colors group-hover:bg-sky">
          RSVP / details <ArrowUpRight size={14} />
        </span>
      </div>
    </Link>
  );
}

interface EventsPageProps {
  searchParams: Promise<{ scope?: string; category?: string; page?: string }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const sp = await searchParams;
  const scope: Scope = sp.scope === "past" ? "past" : "upcoming";
  const categoryParam = sp.category ?? "all";
  const pageParam = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const rows = await listClubEvents({ scope });
  const all: EventCard[] = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    startsAt: r.startsAt.toISOString(),
    location: r.location,
    coverImageUrl: r.coverImageUrl,
    organizerName: r.organizerName,
    guestSpeakerName: r.guestSpeakerName,
    category: inferEventCategory(r.title),
  }));

  const filtered = categoryParam === "all" ? all : all.filter((e) => e.category === categoryParam);
  const featured = scope === "upcoming" && pageParam === 1 ? filtered[0] : undefined;
  const rest = featured ? filtered.slice(1) : filtered;
  const totalPages = Math.max(1, Math.ceil(rest.length / PER_PAGE));
  const page = Math.min(pageParam, totalPages);
  const pageItems = rest.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const featuredMeta = featured ? CATEGORY_META[featured.category] : undefined;

  return (
    <main className="relative mx-auto max-w-[1280px] overflow-hidden px-5 pb-24 pt-32 font-body sm:px-8 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -top-24 right-[-8%] h-[480px] w-[480px] rounded-full opacity-20 blur-[100px]"
          style={{ background: "radial-gradient(circle, var(--color-sky), transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 left-[-10%] h-[360px] w-[360px] rounded-full opacity-10 blur-[90px]"
          style={{ background: "radial-gradient(circle, var(--color-green), transparent 70%)" }}
        />
      </div>

      <header className="max-w-2xl">
        <p className="mb-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-sky">
          <CalendarDays size={12} /> Chiromo Tech Club
        </p>
        <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.03em] text-ink">
          Events worth showing up for
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-2 sm:text-lg">
          Real CTC workshops, talks, and build sessions — pulled live from the club calendar. RSVP in one tap.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ScopeTabs active={scope} category={categoryParam} />
          <span className="rounded-full bg-cream-2 px-3 py-1 font-mono text-[11px] font-semibold text-muted">
            {filtered.length} {scope}
          </span>
        </div>
        <CategoryFilters active={categoryParam} scope={scope} />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-line bg-surface/80 px-6 py-20 text-center">
          <CalendarDays size={32} className="mx-auto text-muted" />
          <p className="mt-4 font-display text-lg font-bold text-ink">Nothing here yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            {scope === "upcoming"
              ? "No upcoming club events in the database. Corporate Affairs can post one from the Event Manager."
              : "No past club events recorded yet."}
          </p>
        </div>
      ) : null}

      {featured ? (
        <Link
          href={ROUTES.event(featured.slug)}
          className="group relative mt-10 grid overflow-hidden rounded-[1.75rem] border border-line bg-navy text-white shadow-xl lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
        >
          <div className="relative aspect-[1080/1350] max-h-[420px] lg:aspect-auto lg:min-h-[360px]">
            <Poster src={featured.coverImageUrl} title={featured.title} />
          </div>
          <div className="relative flex flex-col justify-center gap-4 p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-sky/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-sky">
                Up next
              </span>
              {featuredMeta ? (
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${featuredMeta.tone}`}>
                  {featuredMeta.label}
                </span>
              ) : null}
            </div>
            <h2 className="font-display text-2xl font-bold leading-tight sm:text-3xl">{featured.title}</h2>
            <p className="line-clamp-3 text-sm leading-relaxed text-white/75 sm:text-base">{featured.description}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/65">
              <span>
                {formatEventDate(featured.startsAt)} · {formatEventTime(featured.startsAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} /> {featured.location}
              </span>
              {featured.organizerName ? (
                <span className="inline-flex items-center gap-1">
                  <UserRound size={12} /> {featured.organizerName}
                </span>
              ) : null}
              {featured.guestSpeakerName ? (
                <span className="inline-flex items-center gap-1">
                  <Mic2 size={12} /> {featured.guestSpeakerName}
                </span>
              ) : null}
            </div>
            <span className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-navy transition-transform group-hover:-translate-y-0.5">
              RSVP now <ArrowUpRight size={16} />
            </span>
          </div>
        </Link>
      ) : null}

      {pageItems.length > 0 ? (
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {pageItems.map((event) => (
            <EventCardLink key={event.id} event={event} />
          ))}
        </div>
      ) : null}

      {totalPages > 1 ? (
        <div className="mt-12 flex items-center justify-center gap-3">
          {page > 1 ? (
            <Link
              href={buildHref({ scope, category: categoryParam, page: page - 1 })}
              className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink hover:border-sky/40"
            >
              Previous
            </Link>
          ) : null}
          <span className="font-mono text-xs text-muted">
            Page {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={buildHref({ scope, category: categoryParam, page: page + 1 })}
              className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink hover:border-sky/40"
            >
              Next
            </Link>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
