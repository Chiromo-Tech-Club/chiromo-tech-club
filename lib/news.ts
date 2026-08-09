/**
 * Tech news aggregation — pulls live articles from Dev.to (real public API,
 * no key required) and Medium (per-tag RSS, proxied through rss2json since
 * Medium retired its public JSON API). Both are best-effort: a failure on
 * either source is swallowed via Promise.allSettled so the page never breaks
 * because an external feed is slow or down.
 *
 * To add another source (Hashnode, Product Hunt, etc.) later: write a
 * fetchXArticles(tags) -> Promise<NewsArticle[]> function below and merge it
 * into getTechNews(). Nothing else needs to change.
 */

export type NewsSource = "dev.to" | "medium";

export interface NewsArticle {
  id: string;
  source: NewsSource;
  title: string;
  url: string;
  description: string;
  coverImage?: string;
  author: string;
  publishedAt: string; // ISO date string
  tags: string[];
  readingTimeMinutes?: number;
}

const REVALIDATE_SECONDS = 1800; // 30 min — keep the page fast, keep the feed fresh

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstImageFromHtml(html: string): string | undefined {
  const match = html.match(/<img[^>]+src="([^">]+)"/i);
  return match?.[1];
}

async function fetchDevToArticles(tags: string[], perTag = 8): Promise<NewsArticle[]> {
  const results = await Promise.allSettled(
    tags.map(async (tag) => {
      const res = await fetch(
        `https://dev.to/api/articles?tag=${encodeURIComponent(tag)}&per_page=${perTag}&top=14`,
        { next: { revalidate: REVALIDATE_SECONDS } },
      );
      if (!res.ok) throw new Error(`dev.to fetch failed for tag "${tag}": ${res.status}`);
      const data: any[] = await res.json();
      return data.map(
        (a): NewsArticle => ({
          id: `devto-${a.id}`,
          source: "dev.to",
          title: a.title,
          url: a.url,
          description: a.description ?? "",
          coverImage: a.cover_image ?? a.social_image ?? undefined,
          author: a.user?.name ?? "DEV Community",
          publishedAt: a.published_at,
          tags: a.tag_list ?? [tag],
          readingTimeMinutes: a.reading_time_minutes,
        }),
      );
    }),
  );
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

async function fetchMediumArticles(tags: string[], perTag = 8): Promise<NewsArticle[]> {
  const results = await Promise.allSettled(
    tags.map(async (tag) => {
      const feedUrl = `https://medium.com/feed/tag/${encodeURIComponent(tag)}`;
      const res = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`,
        { next: { revalidate: REVALIDATE_SECONDS } },
      );
      if (!res.ok) throw new Error(`Medium feed failed for tag "${tag}": ${res.status}`);
      const data = await res.json();
      if (data.status !== "ok") throw new Error(`Medium feed parse error for tag "${tag}"`);
      const items: any[] = data.items ?? [];
      return items.slice(0, perTag).map(
        (item, i): NewsArticle => ({
          id: `medium-${tag}-${i}-${item.guid ?? item.link}`,
          source: "medium",
          title: item.title,
          url: item.link,
          description: stripHtml(item.description ?? "").slice(0, 180),
          coverImage: item.thumbnail || firstImageFromHtml(item.content ?? ""),
          author: item.author ?? "Medium",
          publishedAt: item.pubDate,
          tags: item.categories ?? [tag],
        }),
      );
    }),
  );
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

export async function getTechNews(
  tags: string[],
  { limit = 24 }: { limit?: number } = {},
): Promise<NewsArticle[]> {
  const [devto, medium] = await Promise.all([
    fetchDevToArticles(tags),
    fetchMediumArticles(tags),
  ]);

  const merged = [...devto, ...medium]
    .filter((a) => a.title && a.url)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  // De-dupe near-identical titles across sources
  const seen = new Set<string>();
  const deduped = merged.filter((a) => {
    const key = a.title.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return deduped.slice(0, limit);
}