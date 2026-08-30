/**
 * Central route strings. Import these instead of hardcoding paths so a
 * URL change is a one-line edit instead of a grep-and-replace.
 */
export const ROUTES = {
  home: "/",
  whoWeAre: "/#who",
  communities: "/communities",
  community: (slug: string) => `/communities/${slug}`,
  projects: "/projects",
  project: (slug: string) => `/projects/${slug}`,
  events: "/events",
  event: (slug: string) => `/events/${slug}`,
  leadership: "/#leadership",
  blog: "/blog",
  post: (slug: string) => `/blog/${slug}`,
  join: "/join",
  register: "/register",
  dashboard: "/dashboard",
  dashboardSection: (execTitle: string, slug: string) => `/dashboard/${execTitle}/${slug}`,
  admin: "/admin",
  adminProjects: "/admin/projects",
  adminEvents: "/admin/events",
  adminMembers: "/admin/members",
  signIn: "/sign-in",
  signUp: "/sign-up",
  academy: "/academy",
  academyQuest: (slug: string) => `/academy/quests/${slug}`,
  academyQuestStep: (questSlug: string, stepOrder: number) => `/academy/quests/${questSlug}/steps/${stepOrder}`,
} as const;

/** Route prefixes that require an authenticated session. */
export const PROTECTED_PREFIXES = ["/dashboard", "/admin"] as const;

/** Route prefixes that require the "admin" role specifically. */
export const ADMIN_ONLY_PREFIXES = ["/admin"] as const;
