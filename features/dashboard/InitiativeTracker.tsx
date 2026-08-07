"use client";

import { useState, useTransition } from "react";
import { Rocket } from "lucide-react";
import { createInitiative, updateInitiativeStatus } from "@/actions/dashboard/initiatives";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";
import { cn } from "@/lib/utils/cn";

export interface InitiativeItem {
  id: string;
  title: string;
  description: string;
  status: "planned" | "in_progress" | "done";
  ownerName: string | null;
  dueDate: string | null;
}

const COLUMNS: { status: InitiativeItem["status"]; label: string }[] = [
  { status: "planned", label: "Planned" },
  { status: "in_progress", label: "In Progress" },
  { status: "done", label: "Done" },
];

function CreateForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createInitiative({
        title,
        description,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });
      if (result.success) {
        setTitle("");
        setDescription("");
        setDueDate("");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-card-sm)] border border-line bg-white p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">New Initiative</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
        <Input placeholder="Initiative title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      <textarea
        placeholder="What is this initiative, and what does success look like?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        rows={2}
        className="mt-3 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <Button type="submit" variant="primary" disabled={isPending} className="mt-3">
        {isPending ? "Saving…" : "Add Initiative"}
      </Button>
    </form>
  );
}

function InitiativeCard({ initiative }: { initiative: InitiativeItem }) {
  const [isPending, startTransition] = useTransition();

  function move(status: InitiativeItem["status"]) {
    startTransition(async () => {
      await updateInitiativeStatus({ id: initiative.id, status });
    });
  }

  return (
    <div className="rounded-xl border border-line bg-cream p-4">
      <div className="text-sm font-semibold text-ink">{initiative.title}</div>
      <p className="mt-1 text-xs text-ink-2">{initiative.description}</p>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
        <span>{initiative.ownerName ?? "Unassigned"}</span>
        {initiative.dueDate && <span>Due {new Date(initiative.dueDate).toLocaleDateString()}</span>}
      </div>
      <div className="mt-3 flex gap-1.5">
        {COLUMNS.map((col) => (
          <button
            key={col.status}
            onClick={() => move(col.status)}
            disabled={isPending || initiative.status === col.status}
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors",
              initiative.status === col.status ? "bg-green text-white" : "bg-white text-ink-2 hover:bg-line/30",
            )}
          >
            {col.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function InitiativeTracker({ initiatives }: { initiatives: InitiativeItem[] }) {
  return (
    <div className="flex flex-col gap-6">
      <CreateForm />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const items = initiatives.filter((i) => i.status === col.status);
          return (
            <div key={col.status} className="rounded-[var(--radius-card-sm)] border border-line bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <Rocket size={14} className="text-green" />
                <h4 className="text-xs font-bold uppercase tracking-wide text-ink-2">
                  {col.label} ({items.length})
                </h4>
              </div>
              <div className="flex flex-col gap-3">
                {items.length === 0 ? (
                  <p className="text-xs text-muted">Nothing here yet.</p>
                ) : (
                  items.map((i) => <InitiativeCard key={i.id} initiative={i} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
