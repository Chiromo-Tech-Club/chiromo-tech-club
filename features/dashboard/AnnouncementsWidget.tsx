import { Megaphone } from "lucide-react";
import { formatRelative } from "@/lib/utils/format-date";

export interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
}

export function AnnouncementsWidget({ announcements }: { announcements: AnnouncementItem[] }) {
  return (
    <div className="rounded-[var(--radius-card-sm)] border border-line bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <Megaphone size={16} className="text-green" />
        <h3 className="font-display text-sm font-bold text-ink">Recent Announcements</h3>
      </div>
      {announcements.length === 0 ? (
        <p className="text-sm text-muted">No announcements yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {announcements.map((a) => (
            <li key={a.id}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink">{a.title}</span>
                <span className="text-[11px] text-muted">{formatRelative(a.createdAt)}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-ink-2">{a.body}</p>
              <p className="mt-1 text-[11px] text-muted">— {a.authorName}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
