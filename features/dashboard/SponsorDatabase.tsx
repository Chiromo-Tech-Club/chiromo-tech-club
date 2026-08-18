"use client";

import { useState, useTransition } from "react";
import { Handshake, Mail } from "lucide-react";
import { createSponsor, updateSponsorStatus } from "@/actions/dashboard/sponsors";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";
import { cn } from "@/lib/utils/cn";

export interface SponsorItem {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  status: "prospect" | "active" | "past";
  notes: string | null;
}

const STATUSES: { status: SponsorItem["status"]; label: string }[] = [
  { status: "prospect", label: "Prospect" },
  { status: "active", label: "Active" },
  { status: "past", label: "Past" },
];

function NewSponsorForm() {
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createSponsor({ name, contactName, contactEmail, notes });
      if (result.success) {
        setName("");
        setContactName("");
        setContactEmail("");
        setNotes("");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">Add Sponsor / Partner</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input placeholder="Organization name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input placeholder="Contact person" value={contactName} onChange={(e) => setContactName(e.target.value)} />
        <Input placeholder="Contact email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
      </div>
      <textarea
        placeholder="Notes — what have you discussed, what do they offer?"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="mt-3 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <Button type="submit" variant="primary" disabled={isPending} className="mt-3">
        {isPending ? "Saving…" : "Add Sponsor"}
      </Button>
    </form>
  );
}

function SponsorCard({ sponsor }: { sponsor: SponsorItem }) {
  const [isPending, startTransition] = useTransition();

  function move(status: SponsorItem["status"]) {
    startTransition(async () => {
      await updateSponsorStatus({ id: sponsor.id, status });
    });
  }

  return (
    <div className="rounded-xl border border-line bg-cream p-4">
      <div className="text-sm font-semibold text-ink">{sponsor.name}</div>
      {sponsor.contactName && <div className="mt-0.5 text-xs text-ink-2">{sponsor.contactName}</div>}
      {sponsor.contactEmail && (
        <a href={`mailto:${sponsor.contactEmail}`} className="mt-0.5 flex items-center gap-1 text-xs text-green">
          <Mail size={11} /> {sponsor.contactEmail}
        </a>
      )}
      {sponsor.notes && <p className="mt-2 text-xs text-muted">{sponsor.notes}</p>}
      <div className="mt-3 flex gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s.status}
            onClick={() => move(s.status)}
            disabled={isPending || sponsor.status === s.status}
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors",
              sponsor.status === s.status ? "bg-green text-white" : "bg-surface text-ink-2 hover:bg-line/30",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SponsorDatabase({ sponsors }: { sponsors: SponsorItem[] }) {
  return (
    <div className="flex flex-col gap-6">
      <NewSponsorForm />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {STATUSES.map((col) => {
          const items = sponsors.filter((s) => s.status === col.status);
          return (
            <div key={col.status} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-4">
              <div className="mb-3 flex items-center gap-2">
                <Handshake size={14} className="text-green" />
                <h4 className="text-xs font-bold uppercase tracking-wide text-ink-2">
                  {col.label} ({items.length})
                </h4>
              </div>
              <div className="flex flex-col gap-3">
                {items.length === 0 ? (
                  <p className="text-xs text-muted">Nothing here yet.</p>
                ) : (
                  items.map((s) => <SponsorCard key={s.id} sponsor={s} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
