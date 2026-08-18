"use client";

import { useState, useTransition } from "react";
import { NotebookPen } from "lucide-react";
import { createAssignment } from "@/actions/dashboard/assignments";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";

export interface AssignmentItem {
  id: string;
  title: string;
  description: string | null;
  topic: string;
  dueDate: string | null;
}

function NewAssignmentForm() {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createAssignment({ title, topic, description, dueDate: dueDate ? new Date(dueDate).toISOString() : null });
      if (result.success) {
        setTitle("");
        setTopic("");
        setDescription("");
        setDueDate("");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">New Assignment</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input placeholder="Assignment title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} required />
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      <textarea
        placeholder="Details (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="mt-3 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <Button type="submit" variant="primary" disabled={isPending} className="mt-3">
        {isPending ? "Saving…" : "Add Assignment"}
      </Button>
    </form>
  );
}

export function Assignments({ assignments }: { assignments: AssignmentItem[] }) {
  return (
    <div className="flex flex-col gap-6">
      <NewAssignmentForm />
      <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
        <div className="mb-4 flex items-center gap-2">
          <NotebookPen size={16} className="text-green" />
          <h3 className="font-display text-sm font-bold text-ink">All Assignments</h3>
        </div>
        {assignments.length === 0 ? (
          <p className="text-sm text-muted">No assignments posted yet.</p>
        ) : (
          assignments.map((a) => (
            <div key={a.id} className="border-b border-line py-3.5 last:border-0">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-ink">{a.title}</div>
                {a.dueDate && <span className="text-[11px] text-green">Due {new Date(a.dueDate).toLocaleDateString()}</span>}
              </div>
              <div className="mt-0.5 text-xs text-muted">{a.topic}</div>
              {a.description && <p className="mt-1 text-xs text-ink-2">{a.description}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
