"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Unlock, KeyRound, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export const VALID_REFERRAL_CODES = [
  "CTC2026",
  "CHIROMO2026",
  "CTC-ACCESS-2026",
  "JEROME2026",
  "DEVCHRIS",
  "LEADERSHIP-2026",
];

interface AuthAccessGateProps {
  isUnlocked: boolean;
  onUnlock: (unlocked: boolean) => void;
  pageType: "sign-in" | "sign-up";
}

export function AuthAccessGate({ isUnlocked, onUnlock, pageType }: AuthAccessGateProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleVerifyCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const formatted = code.trim().toUpperCase();
    if (!formatted) {
      setError("Please enter a referral or access code.");
      return;
    }

    if (VALID_REFERRAL_CODES.includes(formatted)) {
      setError(null);
      setSuccessMsg(true);
      onUnlock(true);
    } else {
      setError("Invalid referral code. Please check with an executive or register below.");
      onUnlock(false);
      setSuccessMsg(false);
    }
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Referral Code Unlock Box */}
      <div className={`rounded-2xl border p-4 transition-all duration-300 ${
        isUnlocked 
          ? "border-green/40 bg-green/5 shadow-sm" 
          : "border-amber-500/30 bg-amber-500/5 shadow-sm"
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
              isUnlocked ? "bg-green text-white" : "bg-amber-500 text-white"
            }`}>
              {isUnlocked ? <Unlock size={16} /> : <Lock size={16} />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-ink">
                {isUnlocked ? "Access Passcode Verified" : "Referral Access Verification"}
              </h4>
              <p className="text-[11px] text-muted">
                {isUnlocked
                  ? "Form inputs and buttons are now fully unlocked."
                  : "Direct access is locked. Enter an authorized code to activate fields."}
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
                  if (VALID_REFERRAL_CODES.includes(e.target.value.trim().toUpperCase())) {
                    setError(null);
                    setSuccessMsg(true);
                    onUnlock(true);
                  }
                }}
                placeholder="Enter referral code (e.g. CTC2026)"
                className="w-full rounded-xl border border-line bg-surface pl-8 pr-3 py-2 text-xs font-mono uppercase tracking-wider text-ink outline-none transition-colors focus:border-navy"
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

        {error && (
          <p className="mt-2 text-[11px] font-medium text-red-600">
            {error}
          </p>
        )}
      </div>

      {/* Official Poster / Restriction Notice */}
      <div className="rounded-2xl border-2 border-dashed border-line bg-surface/90 p-4 text-left shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
            <AlertTriangle size={16} />
          </div>
          <div className="flex-1">
            <h5 className="font-display text-xs font-bold text-ink">
              Direct {pageType === "sign-in" ? "Login" : "Sign Up"} Restricted
            </h5>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">
              Standard inputs and buttons are locked to prevent unverified entries. New and returning student developers must complete the official membership application.
            </p>
            <div className="mt-3">
              <Link
                href={ROUTES.register}
                className="inline-flex items-center gap-1.5 rounded-xl bg-green px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-green/90 active:scale-95"
              >
                <span>Register at /register instead</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
