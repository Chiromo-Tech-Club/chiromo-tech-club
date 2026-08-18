"use client";

import { useState, useTransition } from "react";
import { Users } from "lucide-react";
import { createMentorship, updateMentorshipStatus } from "@/actions/dashboard/mentorships";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";
import { cn } from "@/lib/utils/cn";

export interface MentorshipItem {
  id: string;
  mentorName: string;
  menteeName: string;
  topic: string;
  status: "active" | "completed";
  notes: string | null;
}

export interface MemberOption {
  id: string;
  fullName: string;
}

function NewMentorshipForm({ memberOptions }: { memberOptions: MemberOption[] }) {
  const [mentorName, setMentorName] = useState("");
  const [menteeId, setMenteeId] = useState("");
  const [topic, setTopic] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!menteeId) {
      setError("Choose a mentee.");
      return;
    }
    startTransition(async () => {
      const result = await createMentorship({ mentorName, menteeId, topic });
      if (result.success) {
        setMentorName("");
        setMenteeId("");
        setTopic("");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">New Mentorship Pairing</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input placeholder="Mentor name" value={mentorName} onChange={(e) => setMentorName(e.target.value)} required />
        <select value={menteeId} onChange={(e) => setMenteeId(e.target.value)} className="rounded-full border border-line bg-surface px-4 py-2.5 text-sm text-ink" required>
          <option value="">Mentee…</option>
          {memberOptions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.fullName}
            </option>
          ))}
        </select>
        <Input placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} required />
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <Button type="submit" variant="primary" disabled={isPending} className="mt-3">
        {isPending ? "Saving…" : "Pair Them Up"}
      </Button>
    </form>
  );
}

export function Mentorship({ mentorships, memberOptions }: { mentorships: MentorshipItem[]; memberOptions: MemberOption[] }) {
  const [isPending, startTransition] = useTransition();

  function complete(id: string) {
    startTransition(async () => {
      await updateMentorshipStatus({ id, status: "completed" });
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <NewMentorshipForm memberOptions={memberOptions} />
      <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
        <div className="mb-4 flex items-center gap-2">
          <Users size={16} className="text-green" />
          <h3 className="font-display text-sm font-bold text-ink">Active & Past Pairings</h3>
        </div>
        {mentorships.length === 0 ? (
          <p className="text-sm text-muted">No mentorships yet.</p>
        ) : (
          mentorships.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 border-b border-line py-3.5 last:border-0">
              <div>
                <div className="text-sm font-medium text-ink">
                  {m.mentorName} → {m.menteeName}
                </div>
                <div className="text-xs text-muted">{m.topic}</div>
              </div>
              {m.status === "active" ? (
                <button onClick={() => complete(m.id)} disabled={isPending} className="flex-none rounded-full bg-cream-2 px-3 py-1 text-[11px] font-semibold text-ink-2 hover:bg-line/30">
                  Mark Completed
                </button>
              ) : (
                <span className={cn("flex-none rounded-full px-2.5 py-1 text-[11px] font-semibold", "bg-green/10 text-green")}>Completed</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
