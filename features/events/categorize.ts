export type EventCategory = "hackathon" | "workshop" | "buildathon" | "bootcamp" | "meetup";

export const CATEGORY_META: Record<EventCategory, { label: string; tone: string }> = {
  hackathon: { label: "Hackathon", tone: "bg-highlighted-lighter text-highlighted-dark" },
  workshop: { label: "Workshop", tone: "bg-information-lighter text-information-dark" },
  buildathon: { label: "Buildathon", tone: "bg-feature-lighter text-feature-dark" },
  bootcamp: { label: "Bootcamp", tone: "bg-success-lighter text-success-dark" },
  meetup: { label: "Meetup", tone: "bg-stable-lighter text-stable-dark" },
};

export const CATEGORY_ORDER: EventCategory[] = ["hackathon", "workshop", "buildathon", "bootcamp", "meetup"];

/**
 * Derives a category from the event title by keyword match.
 * Used as fallback when `events.category` is missing.
 */
export function inferEventCategory(title: string): EventCategory {
  const t = title.toLowerCase();
  if (t.includes("hackathon")) return "hackathon";
  if (t.includes("buildathon")) return "buildathon";
  if (t.includes("bootcamp")) return "bootcamp";
  if (t.includes("workshop")) return "workshop";
  return "meetup";
}

/**
 * Prefer a stored `events.category` value; fall back to title keyword match
 * for older rows that predate the column.
 */
export function resolveEventCategory(title: string, stored?: string | null): EventCategory {
  if (stored && CATEGORY_ORDER.includes(stored as EventCategory)) {
    return stored as EventCategory;
  }
  return inferEventCategory(title);
}

/**
 * Deterministic placeholder cover image, seeded by slug so the same event
 * always gets the same photo across renders/pages. Swap for real photography
 * (or a stored `coverImage` column) before launch — Picsum is dev-placeholder
 * quality only, not a real image of the venue or event.
 */
export function eventCoverImage(slug: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/640/400`;
}
