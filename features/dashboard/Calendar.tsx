import { CalendarDays, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { googleCalendarEmbedUrl, type GoogleCalendarSource } from "@/lib/calendar/sources";
import { SITE_CONFIG } from "@/config/site";
import { CalendarsManager } from "@/features/admin/CalendarsManager";

export interface CalendarEntry {
  id: string;
  title: string;
  date: string;
  kind: "event" | "meeting" | "initiative-due" | "task-due";
}

const KIND_STYLES: Record<CalendarEntry["kind"], { label: string; className: string }> = {
  event: { label: "Event", className: "bg-green/10 text-green" },
  meeting: { label: "Meeting", className: "bg-cream-2 text-ink-2" },
  "initiative-due": { label: "Initiative Due", className: "bg-pink/10 text-pink" },
  "task-due": { label: "Task Due", className: "bg-orange-50 text-orange-600" },
};

export function Calendar({
  entries,
  googleSources,
  canManage = false,
  managedSources = [],
}: {
  entries: CalendarEntry[];
  /** Active Google Calendar emails/IDs combined into one embed. */
  googleSources?: string[];
  canManage?: boolean;
  managedSources?: GoogleCalendarSource[];
}) {
  const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const sources =
    googleSources && googleSources.length > 0
      ? googleSources
      : [SITE_CONFIG.googleCalendarSrc || SITE_CONFIG.contactEmail];
  const embedUrl = googleCalendarEmbedUrl(sources);
  const primary = sources[0]!;
  const openUrl = `https://calendar.google.com/calendar/u/0?cid=${encodeURIComponent(primary)}`;

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-green" />
            <h3 className="font-display text-sm font-bold text-ink">Club Google Calendar</h3>
          </div>
          <a
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-sky hover:underline"
          >
            Open in Google <ExternalLink size={12} />
          </a>
        </div>
        <p className="mb-2 text-xs text-muted">
          Joint club calendars — combined embed for everyone. Leadership manages sources on this Calendar
          page (also under Corporate Affairs → Social Calendar).
        </p>
        <p className="mb-4 font-mono text-[11px] text-muted">
          {sources.length === 1 ? sources[0] : `${sources.length} calendars: ${sources.join(" · ")}`}
        </p>
        <div className="overflow-hidden rounded-xl border border-line bg-white">
          <iframe
            title="Chiromo Tech Club Google Calendar"
            src={embedUrl}
            className="h-[420px] w-full border-0 sm:h-[520px]"
            loading="lazy"
          />
        </div>
      </div>

      {canManage && (
        <div>
          <h3 className="mb-3 font-display text-sm font-bold text-ink">Manage joint calendar emails</h3>
          <CalendarsManager initial={managedSources} />
        </div>
      )}

      <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays size={16} className="text-green" />
          <h3 className="font-display text-sm font-bold text-ink">In-app timeline</h3>
        </div>
        <p className="mb-4 text-xs text-muted">
          Events, meeting minutes, and initiative/task due dates from the club database.
        </p>

        {sorted.length === 0 ? (
          <p className="text-sm text-muted">Nothing scheduled in the database yet.</p>
        ) : (
          <div className="flex flex-col">
            {sorted.map((entry) => (
              <div
                key={`${entry.kind}-${entry.id}`}
                className="flex items-center justify-between border-b border-line py-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                      KIND_STYLES[entry.kind].className,
                    )}
                  >
                    {KIND_STYLES[entry.kind].label}
                  </span>
                  <span className="text-sm font-medium text-ink">{entry.title}</span>
                </div>
                <span className="font-mono text-[11px] text-muted">
                  {new Date(entry.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
