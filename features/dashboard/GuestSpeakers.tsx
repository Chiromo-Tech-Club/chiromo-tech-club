"use client";

import { useState, useTransition } from "react";
import { Mic2, Mail } from "lucide-react";
import { addGuestSpeaker, updateSpeakerStatus } from "@/actions/dashboard/speakers";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";
import { cn } from "@/lib/utils/cn";

export interface SpeakerItem {
  id: string;
  name: string;
  topic: string;
  contactEmail: string | null;
  status: "invited" | "confirmed" | "declined";
  notes: string | null;
}

const STATUSES: { status: SpeakerItem["status"]; label: string }[] = [
  { status: "invited", label: "Invited" },
  { status: "confirmed", label: "Confirmed" },
  { status: "declined", label: "Declined" },
];

function NewSpeakerForm() {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await addGuestSpeaker({ name, topic, contactEmail });
      if (result.success) {
        setName("");
        setTopic("");
        setContactEmail("");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-card-sm)] border border-line bg-white p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">Invite a Guest Speaker</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input placeholder="Speaker name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input placeholder="Talk topic" value={topic} onChange={(e) => setTopic(e.target.value)} required />
        <Input placeholder="Contact email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <Button type="submit" variant="primary" disabled={isPending} className="mt-3">
        {isPending ? "Saving…" : "Add Speaker"}
      </Button>
    </form>
  );
}

function SpeakerCard({ speaker }: { speaker: SpeakerItem }) {
  const [isPending, startTransition] = useTransition();
  function move(status: SpeakerItem["status"]) {
    startTransition(async () => {
      await updateSpeakerStatus({ id: speaker.id, status });
    });
  }
  return (
    <div className="rounded-xl border border-line bg-cream p-4">
      <div className="text-sm font-semibold text-ink">{speaker.name}</div>
      <div className="mt-0.5 text-xs text-ink-2">{speaker.topic}</div>
      {speaker.contactEmail && (
        <a href={`mailto:${speaker.contactEmail}`} className="mt-0.5 flex items-center gap-1 text-xs text-green">
          <Mail size={11} /> {speaker.contactEmail}
        </a>
      )}
      <div className="mt-3 flex gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s.status}
            onClick={() => move(s.status)}
            disabled={isPending || speaker.status === s.status}
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors",
              speaker.status === s.status ? "bg-green text-white" : "bg-white text-ink-2 hover:bg-line/30",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function GuestSpeakers({ speakers }: { speakers: SpeakerItem[] }) {
  return (
    <div className="flex flex-col gap-6">
      <NewSpeakerForm />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {STATUSES.map((col) => {
          const items = speakers.filter((s) => s.status === col.status);
          return (
            <div key={col.status} className="rounded-[var(--radius-card-sm)] border border-line bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <Mic2 size={14} className="text-green" />
                <h4 className="text-xs font-bold uppercase tracking-wide text-ink-2">
                  {col.label} ({items.length})
                </h4>
              </div>
              <div className="flex flex-col gap-3">
                {items.length === 0 ? <p className="text-xs text-muted">Nothing here yet.</p> : items.map((s) => <SpeakerCard key={s.id} speaker={s} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
