"use client";

import { useState, useTransition } from "react";
import { archiveProject } from "@/actions/admin/projects";
import { Button } from "@/components/alignui/button";
import type { Project } from "@/types/project";

interface ProjectsTableProps {
  projects: Array<Pick<Project, "id" | "title" | "communitySlug" | "stars" | "deletedAt">>;
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleArchive(id: string) {
    setPendingId(id);
    startTransition(async () => {
      await archiveProject(id);
      setPendingId(null);
    });
  }

  return (
    <table className="w-full border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-line text-xs uppercase tracking-wide text-text-3">
          <th className="py-3 font-medium">Title</th>
          <th className="py-3 font-medium">Community</th>
          <th className="py-3 font-medium">Stars</th>
          <th className="py-3 font-medium">Status</th>
          <th className="py-3" />
        </tr>
      </thead>
      <tbody>
        {projects.map((p) => (
          <tr key={p.id} className="border-b border-line text-text-2">
            <td className="py-3 text-text">{p.title}</td>
            <td className="py-3">{p.communitySlug}</td>
            <td className="py-3">{p.stars}</td>
            <td className="py-3">{p.deletedAt ? "Archived" : "Live"}</td>
            <td className="py-3 text-right">
              {!p.deletedAt && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isPending && pendingId === p.id}
                  onClick={() => handleArchive(p.id)}
                >
                  {isPending && pendingId === p.id ? "Archiving…" : "Archive"}
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}