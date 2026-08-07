import { CalendarDays, CheckCircle2 } from "lucide-react";
import { formatEventDate } from "@/lib/utils/format-date";
import { cn } from "@/lib/utils/cn";

export interface UpcomingEventItem {
  id: string;
  title: string;
  startsAt: string;
  location: string;
}

interface UpcomingEventsWidgetProps {
  events: UpcomingEventItem[];
  /** Optional — when provided, events the member is registered for get a "Registered" badge. Exec usage omits this. */
  registeredEventIds?: string[];
}

export function UpcomingEventsWidget({ events, registeredEventIds }: UpcomingEventsWidgetProps) {
  return (
    <div className="rounded-[var(--radius-card-sm)] border border-line bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays size={16} className="text-green" />
        <h3 className="font-display text-sm font-bold text-ink">Upcoming Events</h3>
      </div>
      {events.length === 0 ? (
        <p className="text-sm text-muted">Nothing scheduled yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((e) => {
            const isRegistered = registeredEventIds?.includes(e.id);
            return (
              <li key={e.id} className="flex items-center justify-between border-b border-line pb-3 last:border-0 last:pb-0">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-ink">
                    {e.title}
                    {isRegistered && (
                      <span className={cn("flex items-center gap-1 rounded-full bg-green/10 px-2 py-0.5 text-[10px] font-semibold text-green")}>
                        <CheckCircle2 size={10} />
                        Registered
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted">{e.location}</div>
                </div>
                <span className="flex-none font-mono text-[11px] text-green">{formatEventDate(e.startsAt)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
