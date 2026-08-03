export interface RepoStats {
  stars: number;
  contributorCount: number;
}

/**
 * Fetches live stats for a public repo. Used to refresh data/projects.ts-
 * style records once projects are backed by the database instead of
 * static seed data. Unauthenticated GitHub API calls are rate-limited to
 * 60/hour — pass GITHUB_TOKEN to raise that once this is called on a schedule.
 */
export async function getRepoStats(owner: string, repo: string): Promise<RepoStats> {
  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = { Accept: "application/vnd.github+json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const [repoRes, contributorsRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers, next: { revalidate: 3600 } }),
    fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1&anon=true`, {
      headers,
      next: { revalidate: 3600 },
    }),
  ]);

  if (!repoRes.ok) {
    throw new Error(`GitHub API error for ${owner}/${repo}: ${repoRes.status}`);
  }

  const repoJson = await repoRes.json();

  // Contributor *count* isn't returned directly; GitHub exposes it via the
  // Link header's last-page number when paginated one-per-page.
  let contributorCount = 0;
  const link = contributorsRes.headers.get("link");
  const lastPageMatch = link?.match(/page=(\d+)>; rel="last"/);
  contributorCount = lastPageMatch ? parseInt(lastPageMatch[1], 10) : contributorsRes.ok ? 1 : 0;

  return {
    stars: repoJson.stargazers_count ?? 0,
    contributorCount,
  };
}
