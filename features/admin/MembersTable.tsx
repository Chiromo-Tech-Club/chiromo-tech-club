"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { updateMemberRole } from "@/actions/admin/members";
import { ROLE_LABELS, ROLES } from "@/constants/roles";
import { EXEC_TITLE_LABELS, EXEC_TITLES, type ExecTitle } from "@/types/exec-title";
import type { Role } from "@/types/roles";
import { cn } from "@/lib/utils/cn";

export interface MemberRow {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  execTitle: ExecTitle | null;
  communitySlugs: string[];
}

function MemberRowEditor({ member }: { member: MemberRow }) {
  const [role, setRole] = useState<Role>(member.role);
  const [execTitle, setExecTitle] = useState<ExecTitle | null>(member.execTitle);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = role !== member.role || execTitle !== member.execTitle;

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateMemberRole({
        memberId: member.id,
        role,
        execTitle: role === "exec" ? execTitle : null,
      });
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <tr className="border-b border-line last:border-0">
      <td className="py-3.5 pr-4">
        <div className="text-sm font-medium text-ink">{member.fullName}</div>
        <div className="text-xs text-muted">{member.email}</div>
      </td>
      <td className="py-3.5 pr-4">
        {member.communitySlugs.length === 0 ? (
          <span className="text-xs text-muted">—</span>
        ) : (
          <span className="text-xs text-ink-2">{member.communitySlugs.length} joined</span>
        )}
      </td>
      <td className="py-3.5 pr-4">
        <select
          value={role}
          onChange={(e) => {
            const next = e.target.value as Role;
            setRole(next);
            if (next !== "exec") setExecTitle(null);
          }}
          className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm text-ink"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </td>
      <td className="py-3.5 pr-4">
        <select
          value={execTitle ?? ""}
          disabled={role !== "exec"}
          onChange={(e) => setExecTitle((e.target.value || null) as ExecTitle | null)}
          className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          <option value="">Select seat…</option>
          {EXEC_TITLES.map((t) => (
            <option key={t} value={t}>
              {EXEC_TITLE_LABELS[t]}
            </option>
          ))}
        </select>
      </td>
      <td className="py-3.5 text-right">
        <button
          onClick={handleSave}
          disabled={!dirty || isPending || (role === "exec" && !execTitle)}
          className={cn(
            "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors",
            dirty && !isPending ? "bg-green text-white hover:bg-green/90" : "bg-cream-2 text-muted",
          )}
        >
          {isPending ? "Saving…" : saved ? <CheckCircle2 size={14} className="inline" /> : "Save"}
        </button>
        {error && <div className="mt-1 text-[11px] text-red-600">{error}</div>}
      </td>
    </tr>
  );
}

export function MembersTable({ members }: { members: MemberRow[] }) {
  if (members.length === 0) {
    return <p className="text-sm text-text-2">No members have joined yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-card-sm)] border border-line bg-white">
      <table className="w-full min-w-[720px] px-2 text-left">
        <thead>
          <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-semibold">Member</th>
            <th className="px-0 py-3 font-semibold">Communities</th>
            <th className="px-0 py-3 font-semibold">Role</th>
            <th className="px-0 py-3 font-semibold">Exec Seat</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="px-4">
          {members.map((m) => (
            <MemberRowEditor key={m.id} member={m} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
