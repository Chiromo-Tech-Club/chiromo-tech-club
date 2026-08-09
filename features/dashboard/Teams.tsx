"use client";

import { useState, useTransition } from "react";
import { UsersRound } from "lucide-react";
import { createTeam, addTeamMember } from "@/actions/dashboard/teams";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";

export interface TeamItem {
  id: string;
  name: string;
  description: string | null;
  leadName: string | null;
  memberNames: string[];
}

export interface MemberOption {
  id: string;
  fullName: string;
}

function NewTeamForm({ memberOptions }: { memberOptions: MemberOption[] }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [leadId, setLeadId] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createTeam({ name, description, leadId: leadId || null });
      if (result.success) {
        setName("");
        setDescription("");
        setLeadId("");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-card-sm)] border border-line bg-white p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">New Team</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input placeholder="Team name" value={name} onChange={(e) => setName(e.target.value)} required />
        <select value={leadId} onChange={(e) => setLeadId(e.target.value)} className="rounded-full border border-line bg-white px-4 py-2.5 text-sm text-ink">
          <option value="">No lead yet</option>
          {memberOptions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.fullName}
            </option>
          ))}
        </select>
      </div>
      <textarea
        placeholder="What does this team do? (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="mt-3 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <Button type="submit" variant="primary" disabled={isPending} className="mt-3">
        {isPending ? "Saving…" : "Create Team"}
      </Button>
    </form>
  );
}

function TeamCard({ team, memberOptions }: { team: TeamItem; memberOptions: MemberOption[] }) {
  const [addId, setAddId] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    if (!addId) return;
    startTransition(async () => {
      await addTeamMember({ teamId: team.id, memberId: addId });
      setAddId("");
    });
  }

  return (
    <div className="rounded-[var(--radius-card-sm)] border border-line bg-white p-5">
      <div className="text-sm font-bold text-ink">{team.name}</div>
      {team.description && <p className="mt-1 text-xs text-ink-2">{team.description}</p>}
      {team.leadName && <div className="mt-1.5 text-[11px] text-muted">Lead: {team.leadName}</div>}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {team.memberNames.length === 0 ? (
          <span className="text-xs text-muted">No members yet</span>
        ) : (
          team.memberNames.map((n) => (
            <span key={n} className="rounded-full bg-cream-2 px-2.5 py-1 text-[11px] text-ink-2">
              {n}
            </span>
          ))
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <select value={addId} onChange={(e) => setAddId(e.target.value)} className="flex-1 rounded-full border border-line bg-white px-3 py-1.5 text-xs text-ink">
          <option value="">Add member…</option>
          {memberOptions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.fullName}
            </option>
          ))}
        </select>
        <button onClick={handleAdd} disabled={isPending || !addId} className="rounded-full bg-green px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40">
          Add
        </button>
      </div>
    </div>
  );
}

export function Teams({ teams, memberOptions }: { teams: TeamItem[]; memberOptions: MemberOption[] }) {
  return (
    <div className="flex flex-col gap-6">
      <NewTeamForm memberOptions={memberOptions} />
      <div className="flex items-center gap-2">
        <UsersRound size={16} className="text-green" />
        <h3 className="font-display text-sm font-bold text-ink">Teams</h3>
      </div>
      {teams.length === 0 ? (
        <p className="text-sm text-muted">No teams yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {teams.map((t) => (
            <TeamCard key={t.id} team={t} memberOptions={memberOptions} />
          ))}
        </div>
      )}
    </div>
  );
}
