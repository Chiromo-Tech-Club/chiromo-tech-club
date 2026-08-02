export type ProjectSize = "small" | "regular" | "tall";

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  size: ProjectSize;
  repoUrl: string | null;
  stars: number;
  contributorCount: number;
  coverImageUrl: string | null;
  communitySlug: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
