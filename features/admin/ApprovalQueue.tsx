"use client";

import { useState, useTransition } from "react";
import { approveMember, rejectMember } from "@/actions/admin/members";
import { Button } from "@/components/alignui/button";
import { formatRelative } from "@/lib/utils/format-date";

export interface PendingMember {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export function ApprovalQueue({ pendingMembers }: { pendingMembers: PendingMember[] }) {
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handle(action: "approve" | "reject", id: string) {
    setPendingId(id);
    startTransition(async () => {
      const result = action === "approve" ? await approveMember(id) : await rejectMember(id);
      if (result.success) {
        setRemovedIds((prev) => new Set(prev).add(id));
      }
      setPendingId(null);
    });
  }

  const visible = pendingMembers.filter((m) => !removedIds.has(m.id));

  if (visible.length === 0) {
    return (
      <div className="rounded-[var(--radius-card-sm)] border border-dashed border-line-strong bg-white px-8 py-16 text-center text-sm text-muted">
        No pending registrations — you&apos;re all caught up.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {visible.map((m) => (
        <div key={m.id} className="flex items-center justify-between rounded-[var(--radius-card-sm)] border border-line bg-white px-5 py-4">
          <div>
            <div className="text-sm font-medium text-ink">{m.fullName}</div>
            <div className="text-xs text-muted">
              {m.email} · applied {formatRelative(m.createdAt)}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending && pendingId === m.id}
              onClick={() => handle("reject", m.id)}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isPending && pendingId === m.id}
              onClick={() => handle("approve", m.id)}
            >
              Approve
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
