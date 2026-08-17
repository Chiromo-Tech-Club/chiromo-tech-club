"use client";

export interface PasswordStrengthResult {
  score: number; // 0-4
  label: "Weak" | "Fair" | "Good" | "Strong";
  color: string;
  checks: {
    length: boolean;
    lowerUpper: boolean;
    number: boolean;
    symbol: boolean;
  };
}

export function getPasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    length: password.length >= 8,
    lowerUpper: /[a-z]/.test(password) && /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  const meta: Record<number, { label: PasswordStrengthResult["label"]; color: string }> = {
    0: { label: "Weak", color: "bg-red-500" },
    1: { label: "Weak", color: "bg-red-500" },
    2: { label: "Fair", color: "bg-orange-400" },
    3: { label: "Good", color: "bg-yellow-400" },
    4: { label: "Strong", color: "bg-green-500" },
  };

  return { score, ...meta[score], checks };
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const strength = getPasswordStrength(password);
  const segments = 4;

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i < strength.score ? strength.color : "bg-line"}`}
          />
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-label-2xs font-medium text-ink-2">
          Password strength: <span className="font-semibold">{strength.label}</span>
        </span>
      </div>
      <ul className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5">
        <li className={`text-label-2xs ${strength.checks.length ? "text-green-600" : "text-ink-2"}`}>
          {strength.checks.length ? "✓" : "•"} 8+ characters
        </li>
        <li className={`text-label-2xs ${strength.checks.lowerUpper ? "text-green-600" : "text-ink-2"}`}>
          {strength.checks.lowerUpper ? "✓" : "•"} Upper &amp; lowercase
        </li>
        <li className={`text-label-2xs ${strength.checks.number ? "text-green-600" : "text-ink-2"}`}>
          {strength.checks.number ? "✓" : "•"} A number
        </li>
        <li className={`text-label-2xs ${strength.checks.symbol ? "text-green-600" : "text-ink-2"}`}>
          {strength.checks.symbol ? "✓" : "•"} A symbol
        </li>
      </ul>
    </div>
  );
}
