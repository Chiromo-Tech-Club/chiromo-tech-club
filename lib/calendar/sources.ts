import { asc, eq } from "drizzle-orm";
import { SITE_CONFIG } from "@/config/site";
import { getDb } from "@/lib/drizzle/client";
import { googleCalendars } from "@/lib/drizzle/schema";
import { ensureGoogleCalendarsTable } from "@/lib/drizzle/ensure-google-calendars";

export type GoogleCalendarSource = {
  id: string;
  label: string;
  calendarSrc: string;
  sortOrder: number;
  isActive: boolean;
  addedById: string | null;
};

function envFallbackSources(): string[] {
  const fromEnv = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_SRC?.trim();
  if (fromEnv) {
    return fromEnv
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [SITE_CONFIG.googleCalendarSrc || SITE_CONFIG.contactEmail].filter(Boolean);
}

/** Normalize a pasted calendar email / ID (accepts joint comma-separated input). */
export function parseCalendarSrcList(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[,;\n]+/)) {
    const src = part.trim().toLowerCase();
    if (!src || seen.has(src)) continue;
    seen.add(src);
    out.push(src);
  }
  return out;
}

export function googleCalendarEmbedUrl(sources: string[]): string {
  const params = new URLSearchParams({
    ctz: "Africa/Nairobi",
    mode: "AGENDA",
    showTitle: "0",
    showNav: "1",
    showDate: "1",
    showPrint: "0",
    showTabs: "1",
    showCalendars: "1",
    showTz: "1",
  });
  for (const src of sources) {
    params.append("src", src);
  }
  return `https://calendar.google.com/calendar/embed?${params.toString()}`;
}

export async function listGoogleCalendarSources(opts?: {
  activeOnly?: boolean;
}): Promise<GoogleCalendarSource[]> {
  await ensureGoogleCalendarsTable();
  const db = getDb();

  const rows = opts?.activeOnly
    ? await db
        .select()
        .from(googleCalendars)
        .where(eq(googleCalendars.isActive, true))
        .orderBy(asc(googleCalendars.sortOrder), asc(googleCalendars.createdAt))
    : await db
        .select()
        .from(googleCalendars)
        .orderBy(asc(googleCalendars.sortOrder), asc(googleCalendars.createdAt));

  if (rows.length === 0 && opts?.activeOnly) {
    return envFallbackSources().map((calendarSrc, i) => ({
      id: `fallback-${i}`,
      label: i === 0 ? "Club calendar" : `Calendar ${i + 1}`,
      calendarSrc,
      sortOrder: i,
      isActive: true,
      addedById: null,
    }));
  }

  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    calendarSrc: r.calendarSrc,
    sortOrder: r.sortOrder,
    isActive: r.isActive,
    addedById: r.addedById,
  }));
}

export async function getActiveCalendarSrcList(): Promise<string[]> {
  const rows = await listGoogleCalendarSources({ activeOnly: true });
  const seen = new Set<string>();
  const out: string[] = [];
  for (const row of rows) {
    const src = row.calendarSrc.trim();
    if (!src || seen.has(src.toLowerCase())) continue;
    seen.add(src.toLowerCase());
    out.push(src);
  }
  return out.length > 0 ? out : envFallbackSources();
}
