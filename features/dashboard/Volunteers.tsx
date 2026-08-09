"use client";

import { useState, useTransition } from "react";
import { HeartHandshake } from "lucide-react";
import { logVolunteerHours } from "@/actions/dashboard/volunteers";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";

export interface VolunteerLogItem {
  id: string;
  memberName: string;
  activity: string;
  hours: number;
  loggedDate: string;
}

export interface MemberOption {
  id: string;
  fullName: string;
}

function NewLogForm({ memberOptions }: { memberOptions: MemberOption[] }) {
  const [memberId, setMemberId] = useState("");
  const [activity, setActivity] = useState("");
  const [hours, setHours] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsedHours = Number(hours);
    if (!memberId || !parsedHours || parsedHours <= 0) {
      setError("Choose a member and enter hours greater than 0.");
      return;
    }
    startTransition(async () => {
      const result = await logVolunteerHours({ memberId, activity, hours: parsedHours });
      if (result.success) {
        setMemberId("");
        setActivity("");
        setHours("");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-card-sm)] border border-line bg-white p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">Log Volunteer Hours</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className="rounded-full border border-line bg-white px-4 py-2.5 text-sm text-ink" required>
          <option value="">Member…</option>
          {memberOptions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.fullName}
            </option>
          ))}
        </select>
        <Input placeholder="Activity" value={activity} onChange={(e) => setActivity(e.target.value)} required />
        <Input placeholder="Hours" type="number" min="1" value={hours} onChange={(e) => setHours(e.target.value)} required />
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <Button type="submit" variant="primary" disabled={isPending} className="mt-3">
        {isPending ? "Saving…" : "Log Hours"}
      </Button>
    </form>
  );
}

export function Volunteers({ logs, memberOptions }: { logs: VolunteerLogItem[]; memberOptions: MemberOption[] }) {
  return (
    <div className="flex flex-col gap-6">
      <NewLogForm memberOptions={memberOptions} />
      <div className="rounded-[var(--radius-card-sm)] border border-line bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <HeartHandshake size={16} className="text-green" />
          <h3 className="font-display text-sm font-bold text-ink">Volunteer Log</h3>
        </div>
        {logs.length === 0 ? (
          <p className="text-sm text-muted">No volunteer hours logged yet.</p>
        ) : (
          logs.map((l) => (
            <div key={l.id} className="flex items-center justify-between border-b border-line py-2.5 last:border-0">
              <div>
                <span className="text-sm font-medium text-ink">{l.memberName}</span>
                <span className="ml-2 text-xs text-muted">{l.activity}</span>
              </div>
              <span className="font-mono text-xs text-green">{l.hours}h</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
