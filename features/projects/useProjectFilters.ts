"use client";

import { useMemo, useState } from "react";
import { PROJECTS } from ".././../data/projects";

export function useProjectFilters() {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => Array.from(new Set(PROJECTS.flatMap((p) => p.tags))).sort(), []);

  const filtered = useMemo(
    () => (activeTag ? PROJECTS.filter((p) => p.tags.includes(activeTag)) : PROJECTS),
    [activeTag],
  );

  return { allTags, activeTag, setActiveTag, filtered };
}