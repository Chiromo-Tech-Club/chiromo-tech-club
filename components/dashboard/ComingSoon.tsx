import { Construction } from "lucide-react";

export function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-card-sm)] border border-dashed border-line-strong bg-surface px-8 py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-2 text-muted">
        <Construction size={20} />
      </span>
      <h2 className="mt-4 font-display text-lg font-semibold text-ink">{label}</h2>
      <p className="mt-1.5 max-w-xs text-sm text-ink-2">
        This module isn&apos;t built yet — the page, route, and access control are all live, the widget itself is next.
      </p>
    </div>
  );
}
