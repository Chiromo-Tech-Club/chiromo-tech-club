/** Fixed numeric limits referenced across forms, uploads, and lists. */
export const LIMITS = {
  /** Max upload size for avatars / project media, in bytes (5 MB). */
  maxUploadBytes: 5 * 1024 * 1024,
  allowedImageTypes: ["image/png", "image/jpeg", "image/webp"] as const,
  /** Default page size for paginated admin tables and public listings. */
  pageSize: 12,
  /** Max length for free-text fields like project descriptions. */
  maxDescriptionLength: 480,
  maxNameLength: 80,
  /** Rate limit: newsletter signups per IP per hour. */
  newsletterSignupsPerHour: 5,
} as const;
