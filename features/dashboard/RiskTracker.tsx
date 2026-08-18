"use client";

import { useState, useTransition } from "react";
import { ShieldAlert } from "lucide-react";
import { createRisk, updateRiskStatus } from "@/actions/dashboard/risks";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";
import { cn } from "@/lib/utils/cn";

export interface RiskItem {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  status: "open" | "mitigated" | "closed";
  mitigation: string | null;
}

const SEVERITY_STYLES: Record<RiskItem["severity"], string> = {
  low: "bg-cream-2 text-ink-2",
  medium: "bg-orange-50 text-orange-600",
  high: "bg-red-50 text-red-600",
};

const STATUSES: { status: RiskItem["status"]; label: string }[] = [
  { status: "open", label: "Open" },
  { status: "mitigated", label: "Mitigated" },
  { status: "closed", label: "Closed" },
];

function NewRiskForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<RiskItem["severity"]>("medium");
  const [mitigation, setMitigation] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createRisk({ title, description, severity, mitigation });
      if (result.success) {
        setTitle("");
        setDescription("");
        setMitigation("");
        setSeverity("medium");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">Log a Risk</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input placeholder="Risk title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <select value={severity} onChange={(e) => setSeverity(e.target.value as RiskItem["severity"])} className="rounded-full border border-line bg-surface px-4 py-2.5 text-sm text-ink">
          <option value="low">Low severity</option>
          <option value="medium">Medium severity</option>
          <option value="high">High severity</option>
        </select>
      </div>
      <textarea
        placeholder="What's the risk?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        rows={2}
        className="mt-3 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
      />
      <textarea
        placeholder="Mitigation plan (optional)"
        value={mitigation}
        onChange={(e) => setMitigation(e.target.value)}
        rows={2}
        className="mt-3 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <Button type="submit" variant="primary" disabled={isPending} className="mt-3">
        {isPending ? "Saving…" : "Log Risk"}
      </Button>
    </form>
  );
}

function RiskRow({ risk }: { risk: RiskItem }) {
  const [isPending, startTransition] = useTransition();
  function move(status: RiskItem["status"]) {
    startTransition(async () => {
      await updateRiskStatus({ id: risk.id, status });
    });
  }
  return (
    <div className="border-b border-line py-4 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-ink">{risk.title}</div>
          <p className="mt-1 text-sm text-ink-2">{risk.description}</p>
          {risk.mitigation && <p className="mt-1 text-xs text-muted">Mitigation: {risk.mitigation}</p>}
        </div>
        <span className={cn("flex-none rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize", SEVERITY_STYLES[risk.severity])}>{risk.severity}</span>
      </div>
      <div className="mt-3 flex gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s.status}
            onClick={() => move(s.status)}
            disabled={isPending || risk.status === s.status}
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors",
              risk.status === s.status ? "bg-green text-white" : "bg-cream text-ink-2 hover:bg-line/30",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function RiskTracker({ risks }: { risks: RiskItem[] }) {
  return (
    <div className="flex flex-col gap-6">
      <NewRiskForm />
      <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
        <div className="mb-1 flex items-center gap-2">
          <ShieldAlert size={16} className="text-green" />
          <h3 className="font-display text-sm font-bold text-ink">Risk Register</h3>
        </div>
        {risks.length === 0 ? <p className="mt-3 text-sm text-muted">No risks logged yet.</p> : risks.map((r) => <RiskRow key={r.id} risk={r} />)}
      </div>
    </div>
  );
}
