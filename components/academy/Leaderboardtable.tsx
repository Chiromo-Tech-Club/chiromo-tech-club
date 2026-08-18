import type { LeaderboardRow } from "@/lib/academy/queries";

const MEDAL = ["🥇", "🥈", "🥉"];

export function LeaderboardTable({ rows, currentMemberId }: { rows: LeaderboardRow[]; currentMemberId?: string }) {
  if (rows.length === 0) {
    return <p className="text-center text-paragraph-sm text-muted">No one has started a quest yet — be the first.</p>;
  }

  return (
    <ol className="mx-auto flex max-w-xl flex-col gap-2">
      {rows.map((row, i) => {
        const isMe = row.memberId === currentMemberId;
        return (
          <li
            key={row.memberId}
            className={`flex items-center gap-4 rounded-card-sm px-4 py-3 ${
              isMe ? "bg-sky/10 ring-1 ring-sky" : "bg-surface"
            }`}
          >
            <span className="w-8 text-center font-display text-label-lg text-text">{MEDAL[i] ?? i + 1}</span>
            <div className="flex-1">
              <p className="text-label-sm font-medium text-text">
                {row.fullName} {isMe && <span className="text-muted">(you)</span>}
              </p>
              <p className="text-label-xs text-muted">{row.questsCompleted} quests completed</p>
            </div>
            <span className="font-display text-label-md text-sky">{row.totalPoints} pts</span>
          </li>
        );
      })}
    </ol>
  );
}