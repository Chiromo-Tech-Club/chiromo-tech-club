"use client";

import { useState, useTransition } from "react";
import { Megaphone } from "lucide-react";
import { createCampaign, updateCampaignStatus } from "@/actions/dashboard/campaigns";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";
import { cn } from "@/lib/utils/cn";

export interface CampaignItem {
  id: string;
  title: string;
  channel: string;
  status: "planned" | "active" | "completed";
  startDate: string | null;
  notes: string | null;
}

const STATUSES: { status: CampaignItem["status"]; label: string }[] = [
  { status: "planned", label: "Planned" },
  { status: "active", label: "Active" },
  { status: "completed", label: "Completed" },
];

function NewCampaignForm() {
  const [title, setTitle] = useState("");
  const [channel, setChannel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createCampaign({ title, channel, startDate: startDate ? new Date(startDate).toISOString() : null });
      if (result.success) {
        setTitle("");
        setChannel("");
        setStartDate("");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">New Campaign</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input placeholder="Campaign title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input placeholder="Channel (Instagram, Email...)" value={channel} onChange={(e) => setChannel(e.target.value)} required />
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <Button type="submit" variant="primary" disabled={isPending} className="mt-3">
        {isPending ? "Saving…" : "Add Campaign"}
      </Button>
    </form>
  );
}

function CampaignCard({ campaign }: { campaign: CampaignItem }) {
  const [isPending, startTransition] = useTransition();
  function move(status: CampaignItem["status"]) {
    startTransition(async () => {
      await updateCampaignStatus({ id: campaign.id, status });
    });
  }
  return (
    <div className="rounded-xl border border-line bg-cream p-4">
      <div className="text-sm font-semibold text-ink">{campaign.title}</div>
      <div className="mt-0.5 text-xs text-ink-2">{campaign.channel}</div>
      {campaign.startDate && <div className="mt-0.5 text-[11px] text-muted">Starts {new Date(campaign.startDate).toLocaleDateString()}</div>}
      <div className="mt-3 flex gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s.status}
            onClick={() => move(s.status)}
            disabled={isPending || campaign.status === s.status}
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors",
              campaign.status === s.status ? "bg-green text-white" : "bg-surface text-ink-2 hover:bg-line/30",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function MarketingCampaigns({ campaigns }: { campaigns: CampaignItem[] }) {
  return (
    <div className="flex flex-col gap-6">
      <NewCampaignForm />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {STATUSES.map((col) => {
          const items = campaigns.filter((c) => c.status === col.status);
          return (
            <div key={col.status} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-4">
              <div className="mb-3 flex items-center gap-2">
                <Megaphone size={14} className="text-green" />
                <h4 className="text-xs font-bold uppercase tracking-wide text-ink-2">
                  {col.label} ({items.length})
                </h4>
              </div>
              <div className="flex flex-col gap-3">
                {items.length === 0 ? <p className="text-xs text-muted">Nothing here yet.</p> : items.map((c) => <CampaignCard key={c.id} campaign={c} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
