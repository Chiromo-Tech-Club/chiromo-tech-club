import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin, Mic2, UserRound } from "lucide-react";
import { listClubEvents } from "@/lib/events/queries";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  resolveEventCategory,
  type EventCategory,
} from "@/features/events/categorize";
import { formatEventDate, formatEventTime } from "@/lib/utils/format-date";
import { EventPageNav } from "@/features/events/EventPageNav";
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
  const starts = new Date(event.startsAt);
  const month = starts.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = starts.toLocaleDateString("en-US", { day: "numeric" });

  return (
    <Link
      href={ROUTES.event(event.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-surface shadow-[0_8px_30px_rgba(23,20,15,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(23,20,15,0.08)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-cream">
        <Poster
          src={event.coverImageUrl}
          title={event.title}
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm ${meta.tone}`}>
          {meta.label}
        </span>
      </div>

      <div className="flex flex-1 gap-3 p-4">
        <div className="flex w-12 shrink-0 flex-col items-center overflow-hidden rounded-xl border border-line bg-cream text-center">
          <span className="w-full bg-navy py-0.5 font-mono text-[9px] font-bold tracking-wider text-white">{month}</span>
          <span className="py-1 font-display text-lg font-extrabold leading-none text-ink">{day}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-ink group-hover:text-sky">
            {event.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-2">{event.description}</p>
          <div className="mt-2 space-y-1 text-[11px] text-muted">
            <p className="inline-flex items-center gap-1.5">
              <MapPin size={11} /> {event.location}
            </p>
            {event.organizerName ? (
              <p className="flex items-center gap-1.5">
                <UserRound size={11} /> {event.organizerName}
              </p>
            ) : null}
            {event.guestSpeakerName ? (
              <p className="flex items-center gap-1.5">
                <Mic2 size={11} /> {event.guestSpeakerName}
              </p>
            ) : null}
            <p className="font-mono text-[10px] text-ink/45">{formatEventTime(event.startsAt)}</p>
          </div>
        </div>
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
    category: resolveEventCategory(r.title, r.category),
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

      <EventPageNav
        variant="list"
        filtered={scope !== "upcoming" || categoryParam !== "all" || pageParam > 1}
      />

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
          className="group relative mt-10 grid overflow-hidden rounded-[28px] border border-line bg-surface shadow-[0_16px_50px_rgba(23,20,15,0.06)] lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]"
        >
          <div className="relative aspect-[4/5] max-h-[460px] bg-cream lg:aspect-auto lg:max-h-none lg:min-h-[380px]">
            <Poster src={featured.coverImageUrl} title={featured.title} />
          </div>
          <div className="relative flex flex-col justify-center gap-4 p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-navy px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                Up next
              </span>
              {featuredMeta ? (
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${featuredMeta.tone}`}>
                  {featuredMeta.label}
                </span>
              ) : null}
            </div>
            <h2 className="font-display text-2xl font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-3xl">
              {featured.title}
            </h2>
            <p className="line-clamp-3 text-sm leading-relaxed text-ink-2 sm:text-base">{featured.description}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
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
            <span className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white transition-transform group-hover:-translate-y-0.5 group-hover:bg-sky">
              View event <ArrowUpRight size={16} />
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
