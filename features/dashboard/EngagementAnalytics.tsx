import { BarChart3 } from "lucide-react";

export interface CommunityBreakdown {
  name: string;
  memberCount: number;
}

export interface EngagementData {
  totalMembers: number;
  communityBreakdown: CommunityBreakdown[];
  totalEventRegistrations: number;
  totalTasksCompleted: number;
  totalTasks: number;
}

export function EngagementAnalytics({ data }: { data: EngagementData }) {
  const maxCount = Math.max(1, ...data.communityBreakdown.map((c) => c.memberCount));
  const taskCompletionPct = data.totalTasks === 0 ? 0 : Math.round((data.totalTasksCompleted / data.totalTasks) * 100);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">Total Members</div>
          <div className="mt-2 font-display text-2xl font-bold text-ink">{data.totalMembers}</div>
        </div>
        <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">Event Registrations</div>
          <div className="mt-2 font-display text-2xl font-bold text-ink">{data.totalEventRegistrations}</div>
        </div>
        <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">Task Completion</div>
          <div className="mt-2 font-display text-2xl font-bold text-ink">{taskCompletionPct}%</div>
        </div>
      </div>

      <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-green" />
          <h3 className="font-display text-sm font-bold text-ink">Members per Community</h3>
        </div>
        {data.communityBreakdown.length === 0 ? (
          <p className="text-sm text-muted">No community memberships yet.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {data.communityBreakdown.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="w-40 flex-none truncate text-xs text-ink-2">{c.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream-2">
                  <div className="h-2 rounded-full bg-green" style={{ width: `${(c.memberCount / maxCount) * 100}%` }} />
                </div>
                <span className="w-6 flex-none text-right text-xs font-mono text-muted">{c.memberCount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
