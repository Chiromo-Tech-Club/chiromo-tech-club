/** Grace period before a deactivated account is permanently purged (Twitter-style). */
export const DEACTIVATION_GRACE_DAYS = 14;

export function computePurgeScheduledAt(from: Date = new Date()): Date {
  const purge = new Date(from);
  purge.setDate(purge.getDate() + DEACTIVATION_GRACE_DAYS);
  return purge;
}

export function daysUntilPurge(purgeScheduledAt: Date | string | null | undefined): number | null {
  if (!purgeScheduledAt) return null;
  const target = typeof purgeScheduledAt === "string" ? new Date(purgeScheduledAt) : purgeScheduledAt;
  const ms = target.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
