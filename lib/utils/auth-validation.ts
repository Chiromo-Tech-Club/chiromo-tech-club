const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return "Email is required.";
  if (!EMAIL_RE.test(value)) return "Enter a valid email address.";
  return undefined;
}

export function validateSignInPassword(value: string): string | undefined {
  if (!value) return "Password is required.";
  return undefined;
}

export function validateSignUpPassword(value: string): string | undefined {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  return undefined;
}

export function validateFullName(value: string): string | undefined {
  if (!value.trim()) return "Full name is required.";
  if (value.trim().length < 2) return "Enter your full name.";
  return undefined;
}
