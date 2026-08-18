import Link from "next/link";
import type { QuestTrailItem } from "@/lib/academy/queries";

const STATUS_STYLES: Record<QuestTrailItem["status"], { node: string; ring: string; label: string }> = {
  locked: {
    node: "bg-cream-2 text-muted border border-line-strong",
    ring: "",
    label: "Locked",
  },
  available: {
    node: "bg-sky text-white shadow-[0_0_0_6px_var(--color-sky)_/_15%]",
    ring: "animate-pulse-live",
    label: "Start",
  },
  in_progress: {
    node: "bg-sky text-white shadow-[0_0_0_6px_var(--color-sky)_/_15%]",
    ring: "animate-pulse-live",
    label: "Continue",
  },
  completed: {
    node: "bg-navy text-white",
    ring: "",
    label: "Completed",
  },
};

export function QuestTrail({ trail }: { trail: QuestTrailItem[] }) {
  return (
    <div className="relative mx-auto max-w-2xl py-4">
      {/* the winding path */}
      <div
        aria-hidden
        className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-[repeating-linear-gradient(to_bottom,var(--color-sky)_0,var(--color-sky)_8px,transparent_8px,transparent_16px)] opacity-40"
      />

      <ol className="relative flex flex-col gap-10">
        {trail.map((quest, i) => {
          const isLeft = i % 2 === 0;
          const styles = STATUS_STYLES[quest.status];
          const isLocked = quest.status === "locked";

          const node = (
            <div
              className={`grid h-14 w-14 shrink-0 place-items-center rounded-full text-lg font-display font-semibold ${styles.node} ${styles.ring}`}
            >
              {quest.status === "completed" ? "✓" : quest.status === "locked" ? "🔒" : i + 1}
            </div>
          );

          const card = (
            <div className="w-full max-w-xs rounded-card bg-surface p-5 shadow-custom-sm">
              <p className="text-subheading-2xs uppercase tracking-wide text-muted">{quest.topic}</p>
              <h3 className="mt-1 font-display text-label-lg text-text">{quest.title}</h3>
              <p className="mt-1 text-paragraph-sm text-text-2">{quest.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-label-xs text-sky">{quest.pointsReward} pts</span>
                <span
                  className={`text-label-xs font-medium ${
                    isLocked ? "text-muted" : quest.status === "completed" ? "text-navy" : "text-sky"
                  }`}
                >
                  {styles.label}
                </span>
              </div>
            </div>
          );

          return (
            <li key={quest.id} className={`relative flex items-center gap-4 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
              {node}
              {isLocked ? (
                <div className="opacity-60">{card}</div>
              ) : (
                <Link href={`/academy/${quest.slug}`} className="transition-transform hover:-translate-y-0.5">
                  {card}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}