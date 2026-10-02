const DRAFT_KEY = "ctc-registration-draft";
export const REGISTRATION_EDIT_STEP_KEY = "ctc-registration-edit-step";

export const REGISTRATION_STEPS = [
  { step: 1, title: "Personal details", detail: "Name, email, and phone" },
  { step: 2, title: "Campus and course", detail: "Student ID, campus, and year" },
  { step: 3, title: "Communities", detail: "Tracks and experience" },
  { step: 4, title: "Payment", detail: "M-Pesa prompt" },
  { step: 5, title: "Review", detail: "Check everything and submit" },
] as const;

export type RegistrationSeed = {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  githubHandle?: string;
  bio?: string;
  studentId?: string;
  campus?: string;
  isChiromo?: boolean;
  institutionName?: string;
  department?: string;
  faculty?: string;
  course?: string;
  yearOfStudy?: string;
  communitySlugs?: string[];
  experienceLevel?: "beginner" | "intermediate" | "advanced";
  learningGoals?: string;
  paymentOption?: "full_500" | "deposit_250";
  mpesaReference?: string;
  mpesaPhoneNumber?: string;
  payheroReference?: string;
  agreedToCodeOfConduct?: boolean;
};

export type RegistrationDraft = {
  step: number;
  payPhone: string;
  form: RegistrationSeed;
};

export function loadRegistrationDraft(): RegistrationDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RegistrationDraft;
    if (!parsed || typeof parsed !== "object" || !parsed.form) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveRegistrationDraft(draft: RegistrationDraft) {
  if (typeof window === "undefined") return;
  const { password: _password, promoToken: _promo, ...form } = draft.form as RegistrationSeed & {
    password?: string;
    promoToken?: string;
  };
  window.localStorage.setItem(
    DRAFT_KEY,
    JSON.stringify({ step: draft.step, payPhone: draft.payPhone, form }),
  );
}

export function clearRegistrationDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_KEY);
  window.localStorage.removeItem(REGISTRATION_EDIT_STEP_KEY);
}
