"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitMemberProject } from "@/actions/projects";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";
import { COMMUNITIES } from "@/data/communities";
import { ROUTES } from "@/constants/routes";

const fieldClass =
  "mt-3 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none";

export function SubmitProjectForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [pitch, setPitch] = useState("");
  const [explanation, setExplanation] = useState("");
  const [tags, setTags] = useState("");
  const [communitySlug, setCommunitySlug] = useState(COMMUNITIES[0]?.slug ?? "");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitMemberProject({
        title,
        pitch,
        explanation,
        tags,
        communitySlug,
        websiteUrl,
        repoUrl,
      });
      if (!result.success) {
        setError(result.error ?? "Could not publish this project.");
        return;
      }
      router.push(ROUTES.projects);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <Input placeholder="Project name" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Input
        className="mt-3"
        placeholder="One line: what it does"
        value={pitch}
        onChange={(e) => setPitch(e.target.value)}
        required
      />
      <textarea
        placeholder="Explain the problem, what you built, and who it is for."
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
        required
        rows={8}
        className={fieldClass}
      />
      <Input className="mt-3" placeholder="Tags, separated by commas" value={tags} onChange={(e) => setTags(e.target.value)} />
      <select
        value={communitySlug}
        onChange={(e) => setCommunitySlug(e.target.value)}
        className="mt-3 w-full rounded-full border border-line bg-surface px-4 py-2.5 text-sm text-ink"
      >
        {COMMUNITIES.map((community) => (
          <option key={community.slug} value={community.slug}>
            {community.name}
          </option>
        ))}
      </select>
      <Input className="mt-3" placeholder="Website (optional)" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
      <Input className="mt-3" placeholder="Repository URL (optional)" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
      <Button type="submit" variant="primary" disabled={isPending} className="mt-4">
        {isPending ? "Publishing…" : "Publish project"}
      </Button>
    </form>
  );
}
