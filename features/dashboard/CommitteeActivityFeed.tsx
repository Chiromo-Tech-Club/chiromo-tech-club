import { Activity } from "lucide-react";

export interface ActivityEntry {
  id: string;
  kind: "decision" | "initiative" | "minutes" | "transaction" | "sponsor" | "resource" | "task" | "document" | "announcement";
  summary: string;
  actorName: string;
  createdAt: string;
}

const KIND_LABEL: Record<ActivityEntry["kind"], string> = {
  decision: "Chairperson",
  initiative: "Vice Chairperson",
  minutes: "Secretary General",
  transaction: "Treasurer",
  sponsor: "Corporate Affairs",
  resource: "Training Coordinator",
  task: "Task List",
  document: "Documents",
  announcement: "Announcement",
};

export function CommitteeActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  const sorted = [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 30);

  return (
    <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <div className="mb-4 flex items-center gap-2">
        <Activity size={16} className="text-green" />
        <h3 className="font-display text-sm font-bold text-ink">Committee Activity Feed</h3>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted">No activity yet — once execs start using their tools, it shows up here.</p>
      ) : (
        <div className="flex flex-col">
          {sorted.map((e) => (
            <div key={`${e.kind}-${e.id}`} className="flex items-start gap-3 border-b border-line py-3 last:border-0">
              <span className="mt-0.5 flex-none rounded-full bg-cream-2 px-2 py-0.5 text-[10px] font-semibold text-ink-2">
                {KIND_LABEL[e.kind]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink">
                  <span className="font-medium">{e.actorName}</span> {e.summary}
                </p>
                <span className="text-[11px] text-muted">{new Date(e.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
