"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { proposeDecision, updateDecisionStatus } from "@/actions/dashboard/decisions";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";
import { cn } from "@/lib/utils/cn";

export interface DecisionItem {
  id: string;
  title: string;
  description: string;
  status: "proposed" | "approved" | "rejected";
  proposedByName: string;
  createdAt: string;
}

const STATUS_STYLES: Record<DecisionItem["status"], string> = {
  proposed: "bg-cream-2 text-ink-2",
  approved: "bg-green/10 text-green",
  rejected: "bg-red-50 text-red-600",
};

function ProposeForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await proposeDecision({ title, description });
      if (result.success) {
        setTitle("");
        setDescription("");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">Propose a Decision</h3>
      <div className="flex flex-col gap-3">
        <Input placeholder="Decision title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea
          placeholder="Details — what's being decided and why"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <Button type="submit" variant="primary" disabled={isPending} className="self-start">
          {isPending ? "Saving…" : "Log Decision"}
        </Button>
      </div>
    </form>
  );
}

function DecisionRow({ decision }: { decision: DecisionItem }) {
  const [isPending, startTransition] = useTransition();

  function setStatus(status: "approved" | "rejected") {
    startTransition(async () => {
      await updateDecisionStatus({ id: decision.id, status });
    });
  }

  return (
    <div className="border-b border-line py-4 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-ink">{decision.title}</div>
          <p className="mt-1 text-sm text-ink-2">{decision.description}</p>
          <div className="mt-1.5 text-[11px] text-muted">Proposed by {decision.proposedByName}</div>
        </div>
        <span className={cn("flex-none rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize", STATUS_STYLES[decision.status])}>
          {decision.status}
        </span>
      </div>

      {decision.status === "proposed" && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setStatus("approved")}
            disabled={isPending}
            className="flex items-center gap-1 rounded-lg bg-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-green/90"
          >
            <CheckCircle2 size={13} /> Approve
          </button>
          <button
            onClick={() => setStatus("rejected")}
            disabled={isPending}
            className="flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:bg-cream"
          >
            <XCircle size={13} /> Reject
          </button>
        </div>
      )}
    </div>
  );
}

export function DecisionsBoard({ decisions }: { decisions: DecisionItem[] }) {
  const pending = decisions.filter((d) => d.status === "proposed");

  return (
    <div className="flex flex-col gap-6">
      <ProposeForm />

      <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
        <div className="mb-4 flex items-center gap-2">
          <Clock size={16} className="text-green" />
          <h3 className="font-display text-sm font-bold text-ink">
            Recent Decisions {pending.length > 0 && <span className="text-muted">({pending.length} pending)</span>}
          </h3>
        </div>
        {decisions.length === 0 ? (
          <p className="text-sm text-muted">No decisions logged yet.</p>
        ) : (
          decisions.map((d) => <DecisionRow key={d.id} decision={d} />)
        )}
      </div>
    </div>
  );
}
