import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-[var(--radius-card-sm)] border border-line bg-white px-6 py-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
        <Icon size={16} className="text-green" />
      </div>
      <div className="mt-2 font-display text-2xl font-bold text-ink">{value}</div>
    </div>
  );
}
