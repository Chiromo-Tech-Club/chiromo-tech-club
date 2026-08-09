"use client";

import { useMemo, useState } from "react";
import { Search, GitBranch } from "lucide-react";
import { COMMUNITIES } from "@/data/communities";

export interface DirectoryMember {
  id: string;
  fullName: string;
  email: string;
  role: string;
  execTitle: string | null;
  githubHandle: string | null;
  communitySlugs: string[];
  createdAt: string;
}

function communityNames(slugs: string[]) {
  return slugs.map((slug) => COMMUNITIES.find((c) => c.slug === slug)?.name ?? slug);
}

export function MemberDirectory({ members }: { members: DirectoryMember[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        communityNames(m.communitySlugs).some((c) => c.toLowerCase().includes(q)),
    );
  }, [members, query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[var(--radius-card-sm)] border border-line bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-ink">Member Directory</h3>
          <span className="text-xs text-muted">{members.length} total</span>
        </div>
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or community…"
            className="w-full rounded-full border border-line bg-cream py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-muted focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-[var(--radius-card-sm)] border border-line bg-white">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Member</th>
              <th className="px-0 py-3">Role</th>
              <th className="px-0 py-3">Communities</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-muted">
                  No members match &quot;{query}&quot;.
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3.5">
                    <div className="text-sm font-medium text-ink">{m.fullName}</div>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      {m.email}
                      {m.githubHandle && (
                        <a
                          href={`https://github.com/${m.githubHandle}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-0.5 text-ink-2 hover:text-green"
                        >
                          <GitBranch size={11} />
                          {m.githubHandle}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 text-sm capitalize text-ink-2">
                    {m.execTitle ? m.execTitle.replace(/_/g, " ") : m.role}
                  </td>
                  <td className="py-3.5 text-xs text-ink-2">
                    {m.communitySlugs.length === 0 ? "—" : communityNames(m.communitySlugs).join(", ")}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted">{new Date(m.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
