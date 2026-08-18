import { ShieldAlert } from "lucide-react";

export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-card-sm)] border border-line bg-surface px-8 py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-pink/10 text-pink">
        <ShieldAlert size={20} />
      </span>
      <h2 className="mt-4 font-display text-lg font-semibold text-ink">You don&apos;t have access to this section</h2>
      <p className="mt-1.5 max-w-xs text-sm text-ink-2">This part of the dashboard is scoped to a different executive role.</p>
    </div>
  );
}
