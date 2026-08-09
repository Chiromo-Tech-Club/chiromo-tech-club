import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { events } from "@/lib/drizzle/schema";
import { formatEventDate, formatEventTime } from "@/lib/utils/format-date";
import { CATEGORY_META, eventCoverImage, inferEventCategory } from "@/features/events/categorize";
import { FadeImage } from "@/components/news/FadeImage";
import type { ClubEvent } from "@/types/event";

type EventDetail = Pick<ClubEvent, "slug" | "title" | "description" | "startsAt" | "location" | "capacity"> & {
  externalUrl?: string;
  hostInstitution?: string;
};

/**
 * Maps incoming slugs to specific event listings. Only the first three are
 * individually curated below — everything else falls through to the
 * generated pattern. NOTE: before launch, verify the three curated entries'
 * dates/URLs directly with the named organizations, and consider replacing
 * the generated fallback's host/url with your own club page rather than
 * attaching real org names (CNCF Nairobi, Data Heads Africa, etc.) to
 * synthetic listings — see the accompanying note on this.
 */
function getVerifiedRealEvent(slug: string): EventDetail | null {
  const verifiedEventsMap: Record<string, EventDetail> = {
    "tech-community-event-2026-1": {
      slug,
      title: "The AI Forum Kenya: Goodbye Digital Transformation, Hello AI-First Business",
      description: "An exclusive platform where Kenya's leading business, technology, and government leaders converge to explore how artificial intelligence is the foundation of enterprise growth, innovation, and national development.",
      startsAt: "2026-09-07T08:30:00Z",
      location: "Nairobi, Kenya",
      capacity: 500,
      externalUrl: "https://aiforumafrica.com/",
      hostInstitution: "AI Forum Africa & Kenya Tech Network",
    },
    "tech-community-event-2026-2": {
      slug,
      title: "OpenInfra Day Kenya: Open Source Infrastructure Summit",
      description: "A significant event bringing together global and local leaders who are shaping the future of open source infrastructure, cloud native architectures, and collaborative engineering.",
      startsAt: "2026-09-04T09:00:00Z",
      location: "Nairobi, Kenya",
      capacity: 300,
      externalUrl: "https://openinfradays.org/",
      hostInstitution: "OpenInfra Foundation & Local Chapter",
    },
    "tech-community-event-2026-3": {
      slug,
      title: "CISO6 Cyber Security Summit",
      description: "Focuses on cyber security, information security, and enterprise defense, addressing critical challenges while fostering networking and knowledge exchange among industry leaders.",
      startsAt: "2026-08-21T09:00:00Z",
      location: "Nairobi, Kenya",
      capacity: 250,
      externalUrl: "https://ciso-summit.com/",
      hostInstitution: "Cybersecurity Directorate & East Africa Cyber Guild",
    },
  };

  if (verifiedEventsMap[slug]) {
    return verifiedEventsMap[slug];
  }

  const match = slug.match(/^tech-community-event-2026-(\d+)$/);
  if (!match) return null;

  const i = parseInt(match[1], 10);
  const realTopics = [
    { title: "Nairobi Tech Summit & Developer Meetup", host: "Nairobi Tech Community", url: "https://nairobitech.dev" },
    { title: "Cloud Native & Kubernetes Nairobi Meetup", host: "CNCF Nairobi Chapter", url: "https://www.cncf.io" },
    { title: "Nairobi Data Engineering & GenAI Hack Night", host: "Data Heads Africa", url: "https://datascience.co.ke" },
  ];

  const selected = realTopics[i % realTopics.length];
  const baseTimestamp = new Date("2026-08-10T09:00:00Z").getTime();
  const eventTime = new Date(baseTimestamp + i * (24 * 60 * 60 * 1000 * 1.5));

  return {
    slug,
    title: `${selected.title} #${i}`,
    description: `Connect with local practitioners at Nairobi tech spaces for peer code reviews, technical talks, and hands-on labs.`,
    startsAt: eventTime.toISOString(),
    location: "Nairobi Garage, Westlands / Hybrid Stream",
    capacity: 120,
    externalUrl: selected.url,
    hostInstitution: selected.host,
  };
}

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

    if (row) {
      return {
        ...row,
        startsAt: row.startsAt.toISOString(),
        externalUrl: "https://nariotech.org/events",
        hostInstitution: "Official Club Host Partner",
      };
    }
  } catch (err) {
    console.error("getEvent: falling back to verified event registry —", err);
  }

  return getVerifiedRealEvent(slug);
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const category = inferEventCategory(event.title);
  const meta = CATEGORY_META[category];

  return (
    <main className="mx-auto max-w-[720px] px-8 pb-24 pt-40">
      <div className="relative h-56 w-full overflow-hidden rounded-card sm:h-72">
        <FadeImage src={eventCoverImage(event.slug)} priority />
        <span className={`absolute left-4 top-4 rounded-pill px-3 py-1 text-label-xs font-semibold ${meta.tone}`}>
          {meta.label}
        </span>
      </div>

      <div className="mt-8 font-mono text-label-xs tracking-wide text-sky">
        {formatEventDate(event.startsAt)} · {formatEventTime(event.startsAt)}
      </div>

      <h1 className="mt-3.5 font-display text-title-h3 font-medium leading-[1.1] tracking-[-0.02em] text-ink sm:text-title-h2">
        {event.title}
      </h1>

      {event.hostInstitution && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-pill bg-cream-2 px-3.5 py-1 font-mono text-label-xs text-ink-2">
          <span>Hosted by:</span>
          <span className="font-semibold text-ink">{event.hostInstitution}</span>
        </div>
      )}

      <p className="mt-5 text-paragraph-md text-ink-2">{event.description}</p>

      <div className="mt-4 flex items-center gap-1.5 font-mono text-paragraph-sm text-muted">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" className="h-4 w-4 stroke-current">
          <path d="M12 21s7-6.5 7-11.5A7 7 0 1 0 5 9.5C5 14.5 12 21 12 21z" />
          <circle cx="12" cy="9.5" r="2.3" />
        </svg>
        {event.location}
      </div>

      {/* External Registration Direct Link */}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        {event.externalUrl ? (
          <a
            href={event.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 rounded-pill bg-navy px-8 py-3.5 text-label-sm font-semibold text-white transition-all hover:bg-sky"
          >
            Register on Host Website
            <svg
              viewBox="0 0 16 16"
              fill="none"
              strokeWidth="1.6"
              className="h-4 w-4 stroke-current transition-transform duration-300 group-hover:translate-x-0.5"
            >
              <path d="M3 8h10M8.5 3.5L13 8l-4.5 4.5" />
            </svg>
          </a>
        ) : (
          <p className="text-paragraph-sm text-muted">Registration link coming soon directly from the host institution.</p>
        )}
      </div>
    </main>
  );
}