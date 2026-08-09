import { Activity, Users, Wallet, ClipboardList, Rocket } from "lucide-react";

export interface OrgHealthData {
  memberCount: number;
  eventCount: number;
  projectCount: number;
  balanceCents: number;
  pendingDecisions: number;
  activeInitiatives: number;
}

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "KES", maximumFractionDigits: 0 });
}

export function OrgHealthMetrics({ data }: { data: OrgHealthData }) {
  const cards = [
    { label: "Members", value: data.memberCount, icon: Users },
    { label: "Events", value: data.eventCount, icon: ClipboardList },
    { label: "Projects", value: data.projectCount, icon: Rocket },
    { label: "Balance", value: formatMoney(data.balanceCents), icon: Wallet },
    { label: "Pending Decisions", value: data.pendingDecisions, icon: Activity },
    { label: "Active Initiatives", value: data.activeInitiatives, icon: Rocket },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-[var(--radius-card-sm)] border border-line bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <c.icon size={14} className="text-green" /> {c.label}
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-ink">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
