export const EXEC_TITLES = [
  "patron",
  "chairperson",
  "vice_chairperson",
  "secretary_general",
  "treasurer",
  "corporate_affairs",
  "training_coordinator",
  "membership_officer",
] as const;

export type ExecTitle = (typeof EXEC_TITLES)[number];

export function isExecTitle(value: unknown): value is ExecTitle {
  return typeof value === "string" && (EXEC_TITLES as readonly string[]).includes(value);
}

export const EXEC_TITLE_LABELS: Record<ExecTitle, string> = {
  patron: "Patron / VC & Faculty Oversight",
  chairperson: "Chairperson",
  vice_chairperson: "Vice Chairperson",
  secretary_general: "Secretary General",
  treasurer: "Treasurer",
  corporate_affairs: "Corporate Affairs",
  training_coordinator: "Training Coordinator",
  membership_officer: "Membership Officer",
};
