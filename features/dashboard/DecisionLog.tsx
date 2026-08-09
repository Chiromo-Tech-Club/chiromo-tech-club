import { ScrollText } from "lucide-react";

export interface DecisionLogRow {
  id: string;
  title: string;
  description: string;
  status: "proposed" | "approved" | "rejected";
  proposedByName: string;
  createdAt: string;
}

const STATUS_STYLES: Record<DecisionLogRow["status"], string> = {
  proposed: "bg-cream-2 text-ink-2",
  approved: "bg-green/10 text-green",
  rejected: "bg-red-50 text-red-600",
};

export function DecisionLog({ decisions }: { decisions: DecisionLogRow[] }) {
  return (
    <div className="rounded-[var(--radius-card-sm)] border border-line bg-white p-6">
      <div className="mb-1 flex items-center gap-2">
        <ScrollText size={16} className="text-green" />
        <h3 className="font-display text-sm font-bold text-ink">Decision Log</h3>
      </div>
      <p className="mb-4 text-xs text-muted">
        Official record for the minutes. Approving or rejecting a decision happens on the Chairperson&apos;s Recent
        Decisions page.
      </p>

      {decisions.length === 0 ? (
        <p className="text-sm text-muted">No decisions logged yet.</p>
      ) : (
        decisions.map((d) => (
          <div key={d.id} className="flex items-start justify-between gap-4 border-b border-line py-4 last:border-0">
            <div>
              <div className="text-sm font-semibold text-ink">{d.title}</div>
              <p className="mt-1 text-sm text-ink-2">{d.description}</p>
              <div className="mt-1.5 text-[11px] text-muted">
                Proposed by {d.proposedByName} · {new Date(d.createdAt).toLocaleDateString()}
              </div>
            </div>
            <span className={`flex-none rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${STATUS_STYLES[d.status]}`}>
              {d.status}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
