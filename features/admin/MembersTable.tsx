"use client";

import { useState, useTransition } from "react";
import { updateMemberRole } from "@/actions/admin/members";
import { ROLES } from "@/constants/roles";
import { EXEC_TITLES, EXEC_TITLE_LABELS, isExecTitle, type ExecTitle } from "@/types/exec-title";
import { MEMBER_STATUS_LABELS } from "@/types/member-status";
import type { Role } from "@/types/roles";
import type { MemberStatus } from "@/types/member-status";
import { Button } from "@/components/alignui/button";
import { cn } from "@/lib/utils/cn";

export interface MemberRow {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  execTitle: ExecTitle | null;
  status: MemberStatus;
}

function RoleRow({ member }: { member: MemberRow }) {
  const [role, setRole] = useState<Role>(member.role);
  const [execTitle, setExecTitle] = useState<ExecTitle | null>(member.execTitle);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const dirty = role !== member.role || execTitle !== member.execTitle;

  function save() {
    startTransition(async () => {
      const result = await updateMemberRole({ memberId: member.id, role, execTitle: role === "exec" ? execTitle : null });
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    });
  }

  return (
    <tr className="border-b border-line">
      <td className="py-3 pr-4">
        <div className="text-sm font-medium text-ink">{member.fullName}</div>
        <div className="text-xs text-muted">{member.email}</div>
      </td>
      <td className="py-3 pr-4">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold",
            member.status === "approved" && "bg-green/10 text-green",
            member.status === "pending" && "bg-cream-2 text-ink-2",
            member.status === "rejected" && "bg-pink/10 text-pink",
          )}
        >
          {MEMBER_STATUS_LABELS[member.status]}
        </span>
      </td>
      <td className="py-3 pr-4">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm text-ink"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </td>
      <td className="py-3 pr-4">
        {role === "exec" ? (
          <select
            value={execTitle ?? ""}
            onChange={(e) => setExecTitle(isExecTitle(e.target.value) ? e.target.value : null)}
            className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm text-ink"
          >
            <option value="" disabled>
              Select a title…
            </option>
            {EXEC_TITLES.map((t) => (
              <option key={t} value={t}>
                {EXEC_TITLE_LABELS[t]}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-xs text-muted">—</span>
        )}
      </td>
      <td className="py-3 text-right">
        <Button
          variant="primary"
          size="sm"
          disabled={!dirty || isPending || (role === "exec" && !execTitle)}
          onClick={save}
        >
          {isPending ? "Saving…" : saved ? "Saved" : "Save"}
        </Button>
      </td>
    </tr>
  );
}

export function MembersTable({ members }: { members: MemberRow[] }) {
  return (
    <table className="w-full border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
          <th className="py-3 pr-4 font-medium">Member</th>
          <th className="py-3 pr-4 font-medium">Status</th>
          <th className="py-3 pr-4 font-medium">Role</th>
          <th className="py-3 pr-4 font-medium">Exec Title</th>
          <th className="py-3" />
        </tr>
      </thead>
      <tbody>
        {members.map((m) => (
          <RoleRow key={m.id} member={m} />
        ))}
      </tbody>
    </table>
  );
}
