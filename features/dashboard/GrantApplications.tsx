"use client";

import { useState, useTransition } from "react";
import { Award } from "lucide-react";
import { createGrantApplication, updateGrantStatus } from "@/actions/dashboard/grants";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";
import { cn } from "@/lib/utils/cn";

export interface GrantItem {
  id: string;
  funderName: string;
  amountCents: number | null;
  deadline: string | null;
  status: "draft" | "submitted" | "awarded" | "rejected";
  notes: string | null;
}

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "KES", maximumFractionDigits: 0 });
}

const STATUSES: { status: GrantItem["status"]; label: string }[] = [
  { status: "draft", label: "Draft" },
  { status: "submitted", label: "Submitted" },
  { status: "awarded", label: "Awarded" },
  { status: "rejected", label: "Rejected" },
];

function NewGrantForm() {
  const [funderName, setFunderName] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createGrantApplication({
        funderName,
        amount: amount ? Number(amount) : null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        notes,
      });
      if (result.success) {
        setFunderName("");
        setAmount("");
        setDeadline("");
        setNotes("");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">New Grant Application</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input placeholder="Funder / organization" value={funderName} onChange={(e) => setFunderName(e.target.value)} required />
        <Input placeholder="Amount requested (optional)" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </div>
      <textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="mt-3 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <Button type="submit" variant="primary" disabled={isPending} className="mt-3">
        {isPending ? "Saving…" : "Add Application"}
      </Button>
    </form>
  );
}

function GrantCard({ grant }: { grant: GrantItem }) {
  const [isPending, startTransition] = useTransition();

  function move(status: GrantItem["status"]) {
    startTransition(async () => {
      await updateGrantStatus({ id: grant.id, status });
    });
  }

  return (
    <div className="rounded-xl border border-line bg-cream p-4">
      <div className="text-sm font-semibold text-ink">{grant.funderName}</div>
      {grant.amountCents != null && <div className="mt-0.5 text-xs text-ink-2">{formatMoney(grant.amountCents)}</div>}
      {grant.deadline && <div className="mt-0.5 text-[11px] text-muted">Deadline {new Date(grant.deadline).toLocaleDateString()}</div>}
      {grant.notes && <p className="mt-2 text-xs text-muted">{grant.notes}</p>}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s.status}
            onClick={() => move(s.status)}
            disabled={isPending || grant.status === s.status}
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors",
              grant.status === s.status ? "bg-green text-white" : "bg-surface text-ink-2 hover:bg-line/30",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function GrantApplications({ grants }: { grants: GrantItem[] }) {
  return (
    <div className="flex flex-col gap-6">
      <NewGrantForm />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATUSES.map((col) => {
          const items = grants.filter((g) => g.status === col.status);
          return (
            <div key={col.status} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-4">
              <div className="mb-3 flex items-center gap-2">
                <Award size={14} className="text-green" />
                <h4 className="text-xs font-bold uppercase tracking-wide text-ink-2">
                  {col.label} ({items.length})
                </h4>
              </div>
              <div className="flex flex-col gap-3">
                {items.length === 0 ? <p className="text-xs text-muted">Nothing here yet.</p> : items.map((g) => <GrantCard key={g.id} grant={g} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
