/**
 * Case-insensitive name matching for duplicate-account detection.
 * Collapses whitespace and ignores punctuation so "Jane Doe" ≈ "jane  doe".
 */

export function normalizeMemberName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function namesMatchCaseInsensitive(a: string, b: string): boolean {
  const na = normalizeMemberName(a);
  const nb = normalizeMemberName(b);
  if (!na || !nb) return false;
  return na === nb;
}

export type SimilarMemberCandidate = {
  id: string;
  fullName: string;
  email: string;
  membershipStatus: string | null;
  /** Masked for display before the user confirms ownership. */
  emailDisplay: string;
};

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(1, local.length - visible.length))}@${domain}`;
}
