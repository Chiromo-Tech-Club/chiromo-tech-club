import Link from "next/link";
import { FolderKanban, Star } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export interface CommunityProjectItem {
  slug: string;
  title: string;
  description: string;
  communitySlug: string;
  stars: number;
}

export function CommunityProjectsWidget({ projects }: { projects: CommunityProjectItem[] }) {
  return (
    <div className="rounded-[var(--radius-card-sm)] border border-line bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <FolderKanban size={16} className="text-green" />
        <h3 className="font-display text-sm font-bold text-ink">Projects in Your Communities</h3>
      </div>
      {projects.length === 0 ? (
        <p className="text-sm text-muted">No projects yet in your communities — join one to see what&apos;s being built.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {projects.map((p) => (
            <li key={p.slug} className="flex items-center justify-between border-b border-line pb-3 last:border-0 last:pb-0">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-ink">{p.title}</div>
                <div className="truncate text-xs text-muted">{p.description}</div>
              </div>
              <span className="flex flex-none items-center gap-1 pl-3 font-mono text-[11px] text-muted">
                <Star size={11} />
                {p.stars}
              </span>
            </li>
          ))}
        </ul>
      )}
      <Link href={ROUTES.communities} className="mt-4 inline-block text-xs font-semibold text-green underline underline-offset-2">
        Explore more projects
      </Link>
    </div>
  );
}
