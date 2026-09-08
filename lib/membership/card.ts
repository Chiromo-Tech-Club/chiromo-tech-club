/**
 * Membership ID + expiry helpers for printable CTC member cards.
 *
 * Format: CTC-{UNI}-{CODE}
 * - University of Nairobi / Chiromo campuses → CTC-UN-XXXXXX
 * - Other institutions → CTC-{initials}-XXXXXX
 */

const UON_CAMPUS_HINTS = [
  "chiromo",
  "",
  "main campus",
  "kenya science",
  "kabete",
  "parklands",
  "kikuyu",
  "uon",
  "university of nairobi",
  "nairobi",
];

export function getUniversityInitials(campus?: string | null, isChiromo?: boolean | null): string {
  if (isChiromo) return "UN";

  const raw = (campus ?? "").trim().toLowerCase();
  if (!raw) return "UN";

  if (UON_CAMPUS_HINTS.some((h) => raw.includes(h)) && !raw.includes("other") && !raw.includes("external")) {
    return "UN";
  }

  // "Other / External Institution" or free-text uni name → initials from words
  const cleaned = raw
    .replace(/other\s*\/?\s*external\s*institution/gi, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();

  if (!cleaned) return "EXT";

  const words = cleaned.split(/\s+/).filter((w) => w.length > 1 && !["of", "the", "and", "at", "campus"].includes(w));
  if (words.length === 0) return "EXT";

  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** Stable 6-char code from student ID or member UUID. */
export function getMembershipCode(studentId?: string | null, memberId?: string): string {
  const fromStudent = (studentId ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (fromStudent.length >= 4) {
    return fromStudent.slice(-6).padStart(6, "0");
  }
  const fromId = (memberId ?? "000000").replace(/-/g, "").toUpperCase();
  return fromId.slice(0, 6).padStart(6, "0");
}

export function formatMembershipId(opts: {
  campus?: string | null;
  isChiromo?: boolean | null;
  studentId?: string | null;
  memberId: string;
}): string {
  const uni = getUniversityInitials(opts.campus, opts.isChiromo);
  const code = getMembershipCode(opts.studentId, opts.memberId);
  return `CTC-${uni}-${code}`;
}

/** Parse year number from labels like "Year 2 (Sophomore)". */
export function parseYearOfStudy(yearOfStudy?: string | null): number {
  if (!yearOfStudy) return 1;
  const lower = yearOfStudy.toLowerCase();
  if (lower.includes("postgraduate") || lower.includes("masters") || lower.includes("alumni")) return 4;
  const match = yearOfStudy.match(/year\s*(\d)/i);
  if (match) return Math.min(4, Math.max(1, Number(match[1])));
  return 1;
}

/**
 * Membership expires at the end of the member's remaining academic years
 * (assuming a 4-year program), snapped to 31 July of that year (typical
 * UoN academic-year close). Semester label is derived from current month.
 */
export function getMembershipExpiry(opts: {
  yearOfStudy?: string | null;
  createdAt?: string | Date | null;
}): { expiresAt: Date; semesterLabel: string; academicYearLabel: string } {
  const now = new Date();
  const yearNum = parseYearOfStudy(opts.yearOfStudy);
  const yearsRemaining = Math.max(1, 5 - yearNum); // Year 1 → 4 years, Year 4 → 1 year

  const base = opts.createdAt ? new Date(opts.createdAt) : now;
  const expiryYear = base.getFullYear() + yearsRemaining;
  // Academic year typically closes end of July in Kenyan universities
  const expiresAt = new Date(Date.UTC(expiryYear, 6, 31, 23, 59, 59));

  const month = now.getMonth(); // 0–11
  // Rough semester: Sep–Dec Sem 1, Jan–Apr Sem 2, May–Aug break/extension
  let semesterLabel = "Semester 1";
  if (month >= 0 && month <= 3) semesterLabel = "Semester 2";
  else if (month >= 4 && month <= 7) semesterLabel = "Academic Break / Special";
  else semesterLabel = "Semester 1";

  const academicStart = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const academicYearLabel = `${academicStart}/${academicStart + 1}`;

  return { expiresAt, semesterLabel, academicYearLabel };
}

export function formatExpiryDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Short month + year for card faces (e.g. AUG 2029). */
export function formatExpiryShort(date: Date): string {
  return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" }).toUpperCase();
}
