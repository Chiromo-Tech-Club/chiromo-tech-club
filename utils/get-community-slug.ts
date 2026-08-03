import { COMMUNITIES } from "../data/communities";
import type { Community } from "../types/community";

/** Look up a community by slug, or null if it doesn't exist. Domain-aware, hence not in lib/utils. */
export function getCommunityBySlug(slug: string): Community | null {
  return COMMUNITIES.find((c) => c.slug === slug) ?? null;
}

/** True if the given slug matches a known community — used to validate join-form input. */
export function isKnownCommunitySlug(slug: string): boolean {
  return COMMUNITIES.some((c) => c.slug === slug);
}
