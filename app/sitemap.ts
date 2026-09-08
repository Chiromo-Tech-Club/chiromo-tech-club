import type { MetadataRoute } from "next";
import { isNull } from "drizzle-orm";
import { COMMUNITIES } from "@/data/communities";
import { getSiteUrl } from "@/lib/seo/site-url";
import { getDb } from "@/lib/drizzle/client";
import { events } from "@/lib/drizzle/schema";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/communities`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/events`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/join`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/academy/leaderboard`, lastModified: now, changeFrequency: "daily", priority: 0.5 },
  ];

  const communityRoutes: MetadataRoute.Sitemap = COMMUNITIES.map((c) => ({
    url: `${base}/communities/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  let eventRoutes: MetadataRoute.Sitemap = [];
  try {
    const db = getDb();
    const rows = await db
      .select({ slug: events.slug, updatedAt: events.updatedAt })
      .from(events)
      .where(isNull(events.deletedAt));

    eventRoutes = rows.map((e) => ({
      url: `${base}/events/${e.slug}`,
      lastModified: e.updatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.warn("sitemap: could not load events from DB:", err);
  }

  return [...staticRoutes, ...communityRoutes, ...eventRoutes];
}
