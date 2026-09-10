"use client";

import { useState, useTransition } from "react";
import { Mic2, Mail, Phone, Pencil, Trash2 } from "lucide-react";
import {
  addGuestSpeaker,
  updateGuestSpeaker,
  deleteGuestSpeaker,
  updateSpeakerStatus,
} from "@/actions/dashboard/speakers";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";
import { cn } from "@/lib/utils/cn";

export interface SpeakerItem {
  id: string;
  name: string;
  topic: string;
  contactEmail: string | null;
  contactPhone: string | null;
  status: "invited" | "confirmed" | "declined" | "rescheduled" | "cancelled";
  notes: string | null;
}

const COLUMNS: { status: SpeakerItem["status"]; label: string }[] = [
  { status: "invited", label: "Invited" },
  { status: "confirmed", label: "Confirmed" },
  { status: "declined", label: "Declined" },
  { status: "rescheduled", label: "Rescheduled" },
  { status: "cancelled", label: "Cancelled" },
];

/** Status actions available for a card, based on its current column. */
function statusActionsFor(status: SpeakerItem["status"]): { status: SpeakerItem["status"]; label: string }[] {
  switch (status) {
    case "invited":
      return [
        { status: "invited", label: "Invited" },
        { status: "confirmed", label: "Confirmed" },
        { status: "declined", label: "Declined" },
      ];
    case "confirmed":
    case "declined":
      return [
        { status: "rescheduled", label: "Rescheduled" },
        { status: "cancelled", label: "Cancelled" },
      ];
    case "rescheduled":
      return [
        { status: "invited", label: "Invited" },
        { status: "confirmed", label: "Confirmed" },
      ];
    case "cancelled":
      return [
        { status: "invited", label: "Invited" },
        { status: "rescheduled", label: "Rescheduled" },
      ];
  }
}

function SpeakerForm({
  initial,
  onDone,
}: {
  initial?: SpeakerItem;
  onDone?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [topic, setTopic] = useState(initial?.topic ?? "");
  const [contactEmail, setContactEmail] = useState(initial?.contactEmail ?? "");
  const [contactPhone, setContactPhone] = useState(initial?.contactPhone ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const payload = {
        name,
        topic,
        contactEmail,
        contactPhone,
      };
      const result = initial
        ? await updateGuestSpeaker({ id: initial.id, ...payload })
        : await addGuestSpeaker(payload);

      if (result.success) {
        if (!initial) {
          setName("");
          setTopic("");
          setContactEmail("");
          setContactPhone("");
        }
        onDone?.();
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">
        {initial ? "Edit guest speaker" : "Invite a Guest Speaker"}
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input placeholder="Speaker name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input placeholder="Talk topic" value={topic} onChange={(e) => setTopic(e.target.value)} required />
        <Input
          placeholder="Contact email"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
        />
        <Input
          placeholder="Phone number (optional)"
          type="tel"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
        />
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? "Saving…" : initial ? "Save changes" : "Add Speaker"}
        </Button>
        {initial && onDone && (
          <Button type="button" variant="ghost" disabled={isPending} onClick={onDone}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function SpeakerCard({
  speaker,
  onEdit,
}: {
  speaker: SpeakerItem;
  onEdit: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const actions = statusActionsFor(speaker.status);

  function move(status: SpeakerItem["status"]) {
    startTransition(async () => {
      await updateSpeakerStatus({ id: speaker.id, status });
    });
  }

  function handleDelete() {
    if (!confirm(`Delete ${speaker.name}? This cannot be undone from the board.`)) return;
    startTransition(async () => {
      await deleteGuestSpeaker(speaker.id);
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
      {speaker.contactPhone && (
        <a href={`tel:${speaker.contactPhone}`} className="mt-0.5 flex items-center gap-1 text-xs text-green">
          <Phone size={11} /> {speaker.contactPhone}
        </a>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {actions.map((s) => (
          <button
            key={s.status}
            type="button"
            onClick={() => move(s.status)}
            disabled={isPending || speaker.status === s.status}
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors",
              speaker.status === s.status ? "bg-green text-white" : "bg-surface text-ink-2 hover:bg-line/30",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={onEdit}
          disabled={isPending}
          className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[10px] font-semibold text-ink-2 hover:bg-line/30 disabled:opacity-50"
        >
          <Pencil size={11} /> Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 size={11} /> Delete
        </button>
      </div>
    </div>
  );
}

export function GuestSpeakers({ speakers }: { speakers: SpeakerItem[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <SpeakerForm />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {COLUMNS.map((col) => {
          const items = speakers.filter((s) => s.status === col.status);
          return (
            <div key={col.status} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-4">
              <div className="mb-3 flex items-center gap-2">
                <Mic2 size={14} className="text-green" />
                <h4 className="text-xs font-bold uppercase tracking-wide text-ink-2">
                  {col.label} ({items.length})
                </h4>
              </div>
              <div className="flex flex-col gap-3">
                {items.length === 0 ? (
                  <p className="text-xs text-muted">Nothing here yet.</p>
                ) : (
                  items.map((s) =>
                    editingId === s.id ? (
                      <SpeakerForm key={s.id} initial={s} onDone={() => setEditingId(null)} />
                    ) : (
                      <SpeakerCard key={s.id} speaker={s} onEdit={() => setEditingId(s.id)} />
                    ),
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
