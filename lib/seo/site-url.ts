import { SITE_CONFIG } from "@/config/site";

/** Canonical production origin (sitemap, robots, Open Graph, JSON-LD). */
export function getSiteUrl(): string {
  return SITE_CONFIG.url.replace(/\/$/, "");
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
