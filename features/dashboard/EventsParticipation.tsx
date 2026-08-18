import { Users } from "lucide-react";

export interface EventParticipationRow {
  eventId: string;
  eventTitle: string;
  startsAt: string;
  attendeeNames: string[];
}

export function EventsParticipation({ events }: { events: EventParticipationRow[] }) {
  const sorted = [...events].sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());

  return (
    <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <div className="mb-4 flex items-center gap-2">
        <Users size={16} className="text-green" />
        <h3 className="font-display text-sm font-bold text-ink">Events Participation</h3>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted">No events yet.</p>
      ) : (
        sorted.map((e) => (
          <div key={e.eventId} className="border-b border-line py-4 last:border-0">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-ink">{e.eventTitle}</div>
              <span className="text-[11px] text-muted">{new Date(e.startsAt).toLocaleDateString()}</span>
            </div>
            <div className="mt-1.5 text-xs text-ink-2">
              {e.attendeeNames.length === 0 ? (
                <span className="text-muted">No registrations yet</span>
              ) : (
                <>
                  <span className="font-semibold text-green">{e.attendeeNames.length}</span> registered ·{" "}
                  {e.attendeeNames.join(", ")}
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
