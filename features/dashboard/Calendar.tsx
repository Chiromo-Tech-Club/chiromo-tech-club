import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils/cn";

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

export function Calendar({ entries }: { entries: CalendarEntry[] }) {
  const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays size={16} className="text-green" />
        <h3 className="font-display text-sm font-bold text-ink">Calendar</h3>
      </div>
      <p className="mb-4 text-xs text-muted">
        Everything with a date on it — club events, meeting minutes, and initiative/task due dates — in one timeline.
      </p>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted">Nothing scheduled.</p>
      ) : (
        <div className="flex flex-col">
          {sorted.map((entry) => (
            <div key={`${entry.kind}-${entry.id}`} className="flex items-center justify-between border-b border-line py-3 last:border-0">
              <div className="flex items-center gap-3">
                <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", KIND_STYLES[entry.kind].className)}>
                  {KIND_STYLES[entry.kind].label}
                </span>
                <span className="text-sm font-medium text-ink">{entry.title}</span>
              </div>
              <span className="font-mono text-[11px] text-muted">
                {new Date(entry.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
