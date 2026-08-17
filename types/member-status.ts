export const MEMBER_STATUSES = ["pending", "approved", "rejected"] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export function isMemberStatus(value: unknown): value is MemberStatus {
  return typeof value === "string" && (MEMBER_STATUSES as readonly string[]).includes(value);
}

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
};
