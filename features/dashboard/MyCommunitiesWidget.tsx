import Link from "next/link";
import { Users2 } from "lucide-react";
import { COMMUNITIES } from "@/data/communities";
import { ROUTES } from "@/constants/routes";

export function MyCommunitiesWidget({ communitySlugs }: { communitySlugs: string[] }) {
  const joined = COMMUNITIES.filter((c) => communitySlugs.includes(c.slug));

  return (
    <div className="rounded-[var(--radius-card-sm)] border border-line bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <Users2 size={16} className="text-green" />
        <h3 className="font-display text-sm font-bold text-ink">My Communities</h3>
      </div>
      {joined.length === 0 ? (
        <p className="text-sm text-muted">
          You haven&apos;t joined a community yet.{" "}
          <Link href={ROUTES.communities} className="text-green underline underline-offset-2">
            Browse communities
          </Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {joined.map((c) => (
            <li key={c.slug}>
              <Link
                href={ROUTES.community(c.slug)}
                className="flex items-center justify-between rounded-xl border border-line px-3.5 py-2.5 text-sm transition-colors hover:bg-cream"
              >
                <span className="font-medium text-ink">{c.name}</span>
                <span className="font-mono text-[11px] text-muted">{c.number}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {joined.length > 0 && (
        <Link href={ROUTES.communities} className="mt-4 inline-block text-xs font-semibold text-green underline underline-offset-2">
          Browse all communities
        </Link>
      )}
    </div>
  );
}