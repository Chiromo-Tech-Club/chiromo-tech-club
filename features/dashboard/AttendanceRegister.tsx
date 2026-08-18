import { ClipboardCheck } from "lucide-react";

export interface AttendanceRow {
  name: string;
  meetingsAttended: number;
}

export function AttendanceRegister({ rows, totalMeetings }: { rows: AttendanceRow[]; totalMeetings: number }) {
  const sorted = [...rows].sort((a, b) => b.meetingsAttended - a.meetingsAttended);

  return (
    <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <div className="mb-1 flex items-center gap-2">
        <ClipboardCheck size={16} className="text-green" />
        <h3 className="font-display text-sm font-bold text-ink">Attendance Register</h3>
      </div>
      <p className="mb-4 text-xs text-muted">
        Derived from the attendee list on every recorded meeting ({totalMeetings} total).
      </p>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted">No attendance recorded yet — add attendees when creating a meeting record.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="py-2">Name</th>
              <th className="py-2 text-right">Meetings Attended</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.name} className="border-b border-line last:border-0">
                <td className="py-2.5 text-ink">{r.name}</td>
                <td className="py-2.5 text-right font-mono text-ink-2">
                  {r.meetingsAttended} / {totalMeetings}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
