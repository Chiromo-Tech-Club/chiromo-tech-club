"use client";

import { useState, useTransition } from "react";
import { Handshake, Mail, Phone, Pencil, Trash2 } from "lucide-react";
import {
  createSponsor,
  updateSponsor,
  deleteSponsor,
  updateSponsorStatus,
} from "@/actions/dashboard/sponsors";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";
import { cn } from "@/lib/utils/cn";

export interface SponsorItem {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactEmailSecondary: string | null;
  contactPhoneSecondary: string | null;
  contactEmailTertiary: string | null;
  contactPhoneTertiary: string | null;
  status: "prospect" | "active" | "past";
  notes: string | null;
}

const STATUSES: { status: SponsorItem["status"]; label: string }[] = [
  { status: "prospect", label: "Prospect" },
  { status: "active", label: "Active" },
  { status: "past", label: "Past" },
];

function SponsorForm({
  initial,
  onDone,
}: {
  initial?: SponsorItem;
  onDone?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [contactName, setContactName] = useState(initial?.contactName ?? "");
  const [contactEmail, setContactEmail] = useState(initial?.contactEmail ?? "");
  const [contactPhone, setContactPhone] = useState(initial?.contactPhone ?? "");
  const [contactEmailSecondary, setContactEmailSecondary] = useState(initial?.contactEmailSecondary ?? "");
  const [contactPhoneSecondary, setContactPhoneSecondary] = useState(initial?.contactPhoneSecondary ?? "");
  const [contactEmailTertiary, setContactEmailTertiary] = useState(initial?.contactEmailTertiary ?? "");
  const [contactPhoneTertiary, setContactPhoneTertiary] = useState(initial?.contactPhoneTertiary ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const payload = {
        name,
        contactName,
        contactEmail,
        contactPhone,
        contactEmailSecondary,
        contactPhoneSecondary,
        contactEmailTertiary,
        contactPhoneTertiary,
        notes,
      };
      const result = initial
        ? await updateSponsor({ id: initial.id, ...payload })
        : await createSponsor(payload);

      if (result.success) {
        if (!initial) {
          setName("");
          setContactName("");
          setContactEmail("");
          setContactPhone("");
          setContactEmailSecondary("");
          setContactPhoneSecondary("");
          setContactEmailTertiary("");
          setContactPhoneTertiary("");
          setNotes("");
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
        {initial ? "Edit sponsor / partner" : "Add Sponsor / Partner"}
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input placeholder="Organization name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input placeholder="Contact person name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
        <Input
          placeholder="Primary email"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
        />
        <Input
          placeholder="Primary phone number"
          type="tel"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
        />
        <Input
          placeholder="Secondary email (optional)"
          type="email"
          value={contactEmailSecondary}
          onChange={(e) => setContactEmailSecondary(e.target.value)}
        />
        <Input
          placeholder="Secondary phone number (optional)"
          type="tel"
          value={contactPhoneSecondary}
          onChange={(e) => setContactPhoneSecondary(e.target.value)}
        />
        <Input
          placeholder="Tertiary email (optional)"
          type="email"
          value={contactEmailTertiary}
          onChange={(e) => setContactEmailTertiary(e.target.value)}
        />
        <Input
          placeholder="Tertiary phone number (optional)"
          type="tel"
          value={contactPhoneTertiary}
          onChange={(e) => setContactPhoneTertiary(e.target.value)}
        />
      </div>
      <textarea
        placeholder="Notes — what have you discussed, what do they offer?"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="mt-3 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? "Saving…" : initial ? "Save changes" : "Add Sponsor"}
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

function ContactLinks({
  emails,
  phones,
}: {
  emails: Array<{ label: string; value: string | null }>;
  phones: Array<{ label: string; value: string | null }>;
}) {
  const emailItems = emails.filter((e) => e.value?.trim());
  const phoneItems = phones.filter((p) => p.value?.trim());
  if (emailItems.length === 0 && phoneItems.length === 0) return null;

  return (
    <div className="mt-1 space-y-0.5">
      {emailItems.map((e) => (
        <a
          key={`${e.label}-${e.value}`}
          href={`mailto:${e.value}`}
          className="flex items-center gap-1 text-xs text-green"
        >
          <Mail size={11} />
          <span className="text-muted">{e.label}:</span> {e.value}
        </a>
      ))}
      {phoneItems.map((p) => (
        <a
          key={`${p.label}-${p.value}`}
          href={`tel:${p.value}`}
          className="flex items-center gap-1 text-xs text-green"
        >
          <Phone size={11} />
          <span className="text-muted">{p.label}:</span> {p.value}
        </a>
      ))}
    </div>
  );
}

function SponsorCard({
  sponsor,
  onEdit,
}: {
  sponsor: SponsorItem;
  onEdit: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  function move(status: SponsorItem["status"]) {
    startTransition(async () => {
      await updateSponsorStatus({ id: sponsor.id, status });
    });
  }

  function handleDelete() {
    if (!confirm(`Delete ${sponsor.name}?`)) return;
    startTransition(async () => {
      await deleteSponsor(sponsor.id);
    });
  }

  return (
    <div className="rounded-xl border border-line bg-cream p-4">
      <div className="text-sm font-semibold text-ink">{sponsor.name}</div>
      {sponsor.contactName && <div className="mt-0.5 text-xs text-ink-2">{sponsor.contactName}</div>}
      <ContactLinks
        emails={[
          { label: "Primary", value: sponsor.contactEmail },
          { label: "Secondary", value: sponsor.contactEmailSecondary },
          { label: "Tertiary", value: sponsor.contactEmailTertiary },
        ]}
        phones={[
          { label: "Primary", value: sponsor.contactPhone },
          { label: "Secondary", value: sponsor.contactPhoneSecondary },
          { label: "Tertiary", value: sponsor.contactPhoneTertiary },
        ]}
      />
      {sponsor.notes && <p className="mt-2 text-xs text-muted">{sponsor.notes}</p>}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s.status}
            type="button"
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

export function SponsorDatabase({ sponsors }: { sponsors: SponsorItem[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <SponsorForm />

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
                  items.map((s) =>
                    editingId === s.id ? (
                      <SponsorForm key={s.id} initial={s} onDone={() => setEditingId(null)} />
                    ) : (
                      <SponsorCard key={s.id} sponsor={s} onEdit={() => setEditingId(s.id)} />
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
