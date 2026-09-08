"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Unlock, KeyRound, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export const VALID_REFERRAL_CODES = [
  "CTC2026",
  "CHIROMO2026",
  "CTC-ACCESS-2026",
  "2026",
  "DEVCHRIS",
  "LEADERSHIP-2026",
];

export const REFERRAL_COOKIE = "ctc_signup_referral";

interface AuthAccessGateProps {
  isUnlocked: boolean;
  onUnlock: (unlocked: boolean) => void;
}

function setReferralCookie(unlocked: boolean) {
  if (typeof document === "undefined") return;
  if (unlocked) {
    // 1 hour window to complete Google / email sign-up after unlocking
    document.cookie = `${REFERRAL_COOKIE}=1; path=/; max-age=3600; SameSite=Lax`;
  } else {
    document.cookie = `${REFERRAL_COOKIE}=; path=/; max-age=0`;
  }
}

export function AuthAccessGate({ isUnlocked, onUnlock }: AuthAccessGateProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const unlock = (formatted: string) => {
    if (VALID_REFERRAL_CODES.includes(formatted)) {
      setError(null);
      setReferralCookie(true);
      onUnlock(true);
      return true;
    }
    setError("Invalid referral code. Ask a CTC executive for an invite code, or register at /register.");
    setReferralCookie(false);
    onUnlock(false);
    return false;
  };

  const handleVerifyCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const formatted = code.trim().toUpperCase();
    if (!formatted) {
      setError("Please enter a referral or access code.");
      return;
    }
    unlock(formatted);
  };

  return (
    <div className="mb-6 space-y-4">
      <div
        className={`rounded-2xl border p-4 transition-all duration-300 ${
          isUnlocked ? "border-green/40 bg-green/5 shadow-sm" : "border-amber-500/30 bg-amber-500/5 shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                isUnlocked ? "bg-green text-white" : "bg-amber-500 text-white"
              }`}
            >
              {isUnlocked ? <Unlock size={16} /> : <Lock size={16} />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-ink">
                {isUnlocked ? "Referral Code Verified" : "Sign-up Requires a Referral Code"}
              </h4>
              <p className="text-[11px] text-muted">
                {isUnlocked
                  ? "You can now create an account with email or Google."
                  : "Account creation is invite-only. Enter a code from a CTC executive to unlock."}
              </p>
            </div>
          </div>

          {isUnlocked && (
            <span className="flex items-center gap-1 rounded-full bg-green/15 px-2.5 py-1 text-[10px] font-bold text-green">
              <CheckCircle2 size={12} /> Active
            </span>
          )}
        </div>

        {!isUnlocked ? (
          <form onSubmit={handleVerifyCode} className="mt-3 flex gap-2">
            <div className="relative flex-1">
              <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(null);
                  const formatted = e.target.value.trim().toUpperCase();
                  if (VALID_REFERRAL_CODES.includes(formatted)) {
                    unlock(formatted);
                  }
                }}
                placeholder="Enter referral code"
                className="w-full rounded-xl border border-line bg-surface py-2 pl-8 pr-3 font-mono text-xs uppercase tracking-wider text-ink outline-none transition-colors focus:border-navy"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-navy/90 active:scale-95"
            >
              Unlock
            </button>
          </form>
        ) : null}

        {error && <p className="mt-2 text-[11px] font-medium text-red-600">{error}</p>}
      </div>

      <div className="rounded-2xl border-2 border-dashed border-line bg-surface/90 p-4 text-left shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
            <AlertTriangle size={16} />
          </div>
          <div className="flex-1">
            <h5 className="font-display text-xs font-bold text-ink">No invite code yet?</h5>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">
              You can still apply for club membership without creating a login. Use the official registration form —
              leadership will review your application.
            </p>
            <div className="mt-3">
              <Link
                href={ROUTES.register}
                className="inline-flex items-center gap-1.5 rounded-xl bg-green px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-green/90 active:scale-95"
              >
                <span>Register at /register</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
