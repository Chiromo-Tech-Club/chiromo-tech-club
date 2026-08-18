"use client";

import { useState, useTransition } from "react";
import { ListTodo } from "lucide-react";
import { createTask, updateTaskStatus } from "@/actions/dashboard/tasks";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";
import { cn } from "@/lib/utils/cn";

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  assigneeName: string | null;
  dueDate: string | null;
}

export interface MemberOption {
  id: string;
  fullName: string;
}

const COLUMNS: { status: TaskItem["status"]; label: string }[] = [
  { status: "todo", label: "To Do" },
  { status: "in_progress", label: "In Progress" },
  { status: "done", label: "Done" },
];

function NewTaskForm({ memberOptions }: { memberOptions: MemberOption[] }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createTask({
        title,
        description,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });
      if (result.success) {
        setTitle("");
        setDescription("");
        setAssigneeId("");
        setDueDate("");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">New Task</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr]">
        <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          className="rounded-full border border-line bg-surface px-4 py-2.5 text-sm text-ink"
        >
          <option value="">Unassigned</option>
          {memberOptions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.fullName}
            </option>
          ))}
        </select>
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
        {isPending ? "Saving…" : "Add Task"}
      </Button>
    </form>
  );
}

function TaskCard({ task }: { task: TaskItem }) {
  const [isPending, startTransition] = useTransition();

  function move(status: TaskItem["status"]) {
    startTransition(async () => {
      await updateTaskStatus({ id: task.id, status });
    });
  }

  return (
    <div className="rounded-xl border border-line bg-cream p-4">
      <div className="text-sm font-semibold text-ink">{task.title}</div>
      {task.description && <p className="mt-1 text-xs text-ink-2">{task.description}</p>}
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
        <span>{task.assigneeName ?? "Unassigned"}</span>
        {task.dueDate && <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>}
      </div>
      <div className="mt-3 flex gap-1.5">
        {COLUMNS.map((col) => (
          <button
            key={col.status}
            onClick={() => move(col.status)}
            disabled={isPending || task.status === col.status}
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors",
              task.status === col.status ? "bg-green text-white" : "bg-surface text-ink-2 hover:bg-line/30",
            )}
          >
            {col.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TaskBoard({ tasks, memberOptions }: { tasks: TaskItem[]; memberOptions: MemberOption[] }) {
  return (
    <div className="flex flex-col gap-6">
      <NewTaskForm memberOptions={memberOptions} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.status);
          return (
            <div key={col.status} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-4">
              <div className="mb-3 flex items-center gap-2">
                <ListTodo size={14} className="text-green" />
                <h4 className="text-xs font-bold uppercase tracking-wide text-ink-2">
                  {col.label} ({items.length})
                </h4>
              </div>
              <div className="flex flex-col gap-3">
                {items.length === 0 ? (
                  <p className="text-xs text-muted">Nothing here yet.</p>
                ) : (
                  items.map((t) => <TaskCard key={t.id} task={t} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
