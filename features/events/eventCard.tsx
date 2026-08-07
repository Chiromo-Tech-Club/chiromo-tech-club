import { formatEventDate } from "@/lib/utils/format-date";
import type { ClubEvent } from "@/types/event";

interface EventCardProps {
  event: Pick<ClubEvent, "title" | "description" | "startsAt" | "location">;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  return (
    <div className={`rounded-[18px] border border-line bg-bg-1 p-7 ${className ?? ""}`}>
      <div className="mb-4 h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgba(139,124,246,0.45)]" />
      <div className="font-mono text-xs tracking-wide text-accent">{formatEventDate(event.startsAt)}</div>
      <h3 className="mt-3.5 text-[22px] font-medium">{event.title}</h3>
      <p className="mt-2.5 text-sm leading-[1.6] text-text-2">{event.description}</p>
      <div className="mt-3 text-xs text-text-3">{event.location}</div>
    </div>
  );
}