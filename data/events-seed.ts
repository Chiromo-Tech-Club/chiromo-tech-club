import type { ClubEvent } from "@/types/event";

/**
 * Seed data used by `npm run db:seed` (see lib/drizzle) and as a fallback
 * in local dev before Supabase is wired up. Not imported directly by pages
 * once the Events chapter reads from the database.
 */
export const EVENTS_SEED: Array<Pick<ClubEvent, "slug" | "title" | "description" | "startsAt" | "location">> = [
  {
    slug: "ai-build-night",
    title: "AI Build Night",
    description: "Ship a working AI prototype in one evening, in teams of three.",
    startsAt: "2026-08-14T17:00:00+03:00",
    location: "Chiromo Campus, iLab",
  },
  {
    slug: "cybersecurity-ctf",
    title: "Cybersecurity CTF",
    description: "Campus-wide capture the flag with regional finalists invited.",
    startsAt: "2026-08-29T09:00:00+03:00",
    location: "Chiromo Campus, LT 4",
  },
  {
    slug: "design-systems-workshop",
    title: "Design Systems Workshop",
    description: "Hands-on session building a token-based UI kit from scratch.",
    startsAt: "2026-09-12T14:00:00+03:00",
    location: "Chiromo Campus, iLab",
  },
  {
    slug: "robotics-demo-day",
    title: "Robotics Demo Day",
    description: "Members showcase semester-long hardware builds to industry judges.",
    startsAt: "2026-09-26T10:00:00+03:00",
    location: "Chiromo Campus, Quad",
  },
  {
    slug: "founders-fireside",
    title: "Founders Fireside",
    description: "Alumni founders on building African tech companies from campus.",
    startsAt: "2026-10-10T18:00:00+03:00",
    location: "Chiromo Campus, LT 1",
  },
];
