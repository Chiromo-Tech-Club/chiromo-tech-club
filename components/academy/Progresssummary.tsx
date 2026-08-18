export function ProgressSummary({
  totalPoints,
  questsCompleted,
  totalQuests,
  badgeCount,
}: {
  totalPoints: number;
  questsCompleted: number;
  totalQuests: number;
  badgeCount: number;
}) {
  const pct = totalQuests === 0 ? 0 : Math.round((questsCompleted / totalQuests) * 100);

  const stats = [
    { label: "Points", value: totalPoints },
    { label: "Quests done", value: `${questsCompleted}/${totalQuests}` },
    { label: "Badges", value: badgeCount },
  ];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 rounded-card bg-navy p-6 text-white shadow-custom-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-8">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="font-display text-title-h5">{s.value}</p>
            <p className="text-label-xs uppercase tracking-wide text-white/60">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="w-full sm:w-40">
        <div className="h-2 w-full overflow-hidden rounded-pill bg-white/15">
          <div className="h-full rounded-pill bg-sky transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-label-xs text-white/60">{pct}% of the academy complete</p>
      </div>
    </div>
  );
}