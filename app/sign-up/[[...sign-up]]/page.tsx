"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Lock } from "lucide-react";
import { TextField, Label, Input, Button, Spinner } from "@heroui/react";
import { ROUTES } from "@/constants/routes";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { validateEmail, validateFullName, validateSignUpPassword } from "@/lib/utils/auth-validation";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { AuthAccessGate } from "@/components/auth/AuthAccessGate";

// ─────────────────────────────────────────────────────────────────────────
// CLERK (commented out — kept for reference / rollback)
// ─────────────────────────────────────────────────────────────────────────
// import { SignUp, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
// ─────────────────────────────────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.62H1.27a12 12 0 0 0 0 10.76l4-3.11Z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.11C6.22 6.87 8.87 4.75 12 4.75Z" />
    </svg>
  );
}

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
}

const INPUT_CLASS =
  "w-full rounded-md border border-line px-3 py-2.5 text-label-sm outline-none transition-colors focus:border-navy";
const INPUT_CLASS_ERROR =
  "w-full rounded-md border border-red-400 px-3 py-2.5 text-label-sm outline-none transition-colors focus:border-red-500";

export default function SignUpPage() {
  const router = useRouter();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<{ fullName?: boolean; email?: boolean; password?: boolean }>({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  function handleBlur(field: "fullName" | "email" | "password") {
    if (!isUnlocked) return;
    setTouched((t) => ({ ...t, [field]: true }));
    setFieldErrors((prev) => ({
      ...prev,
      fullName: field === "fullName" ? validateFullName(fullName) : prev.fullName,
      email: field === "email" ? validateEmail(email) : prev.email,
      password: field === "password" ? validateSignUpPassword(password) : prev.password,
    }));
  }

  function validateAll(): boolean {
    const errors: FieldErrors = {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      password: validateSignUpPassword(password),
    };
    setFieldErrors(errors);
    setTouched({ fullName: true, email: true, password: true });
    return !errors.fullName && !errors.email && !errors.password;
  }

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!isUnlocked) {
      setFormError("Access locked: Please enter a valid referral/access code above.");
      return;
    }
    setFormError(null);

    if (!validateAll()) return;

    setFormLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      // Supabase errors here (e.g. "User already registered") sometimes do
      // map cleanly to the email field — do that when it's obviously about
      // the address, otherwise fall back to a form-level message.
      if (/email/i.test(error.message)) {
        setFieldErrors((prev) => ({ ...prev, email: error.message }));
        setTouched((t) => ({ ...t, email: true }));
      } else {
        setFormError(error.message);
      }
      setFormLoading(false);
      return;
    }

    if (data.session) {
      router.push(ROUTES.dashboard);
      router.refresh();
    } else {
      setConfirmationSent(true);
      setFormLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    if (!isUnlocked) {
      setGoogleError("Access locked: Please enter a valid referral/access code above.");
      return;
    }
    setGoogleLoading(true);
    setGoogleError(null);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setGoogleError(error.message);
      setGoogleLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-surface lg:grid-cols-12">
      {/* LEFT COLUMN: AUTH FORM SECTION */}
      <div className="flex min-h-screen flex-col justify-between overflow-y-auto px-6 py-8 sm:px-12 lg:col-span-6 lg:px-16 xl:col-span-5">
        <div className="flex items-center justify-between">
          <Link href={ROUTES.home} className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-line bg-surface p-1">
              <Image src="/images/image.svg" alt="CTC Logo" width={32} height={32} className="h-full w-full object-contain" />
            </div>
            <span className="font-display text-label-md font-semibold text-ink">chiromo.</span>
          </Link>

          <Link
            href={ROUTES.home}
            className="group flex items-center gap-2 text-label-xs font-semibold text-ink-2 transition-colors hover:text-ink"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-line transition-transform group-hover:-translate-x-0.5">
              <ArrowLeftIcon />
            </span>
            Back to Home
          </Link>
        </div>

        <div className="my-auto py-8">
          <div className="mb-6">
            <h1 className="font-display text-title-h5 font-medium text-ink sm:text-title-h4">Create your account</h1>
            <p className="mt-1.5 text-paragraph-sm text-ink-2">
              Join the pioneer wave of student developers and builders.
            </p>
          </div>

          <div className="w-full max-w-md">
            {/* Referral / Access Gate */}
            <AuthAccessGate
              isUnlocked={isUnlocked}
              onUnlock={setIsUnlocked}
              pageType="sign-up"
            />

            {confirmationSent ? (
              <div className="rounded-md border border-line bg-cream/40 p-5 text-center">
                <p className="text-label-sm font-semibold text-ink">Check your email</p>
                <p className="mt-1.5 text-paragraph-sm text-ink-2">
                  We sent a confirmation link to <span className="font-semibold text-ink">{email}</span>.
                  Click it to activate your account, then come back and sign in.
                </p>
                <Link href={ROUTES.signIn} className="mt-4 inline-block text-label-xs font-semibold text-ink hover:underline">
                  Back to sign in
                </Link>
              </div>
            ) : (
              <>
                {/* HeroUI v3 API: TextField/Label/Input compound components */}
                <form onSubmit={handleEmailSignUp} noValidate className="flex flex-col gap-4">
                  <TextField isRequired className="flex flex-col gap-1.5">
                    <Label className="text-label-xs font-medium text-ink-2">Full name</Label>
                    <Input
                      type="text"
                      variant="primary"
                      value={fullName}
                      disabled={!isUnlocked}
                      placeholder={isUnlocked ? "Dennis Ritchie" : "Locked — enter referral code above"}
                      onChange={(e) => {
                        if (!isUnlocked) return;
                        setFullName(e.target.value);
                        if (touched.fullName) setFieldErrors((prev) => ({ ...prev, fullName: validateFullName(e.target.value) }));
                      }}
                      onBlur={() => handleBlur("fullName")}
                      aria-invalid={!!fieldErrors.fullName}
                      className={`${fieldErrors.fullName ? INPUT_CLASS_ERROR : INPUT_CLASS} rounded-md ${
                        !isUnlocked ? "cursor-not-allowed opacity-50 bg-cream/30" : ""
                      }`}
                    />
                    {fieldErrors.fullName && (
                      <p className="flex items-center gap-1 text-label-2xs text-red-500">
                        <AlertCircle size={12} /> {fieldErrors.fullName}
                      </p>
                    )}
                  </TextField>

                  <TextField isRequired className="flex flex-col gap-1.5">
                    <Label className="text-label-xs font-medium text-ink-2">Email</Label>
                    <Input
                      type="email"
                      variant="primary"
                      value={email}
                      disabled={!isUnlocked}
                      placeholder={isUnlocked ? "student@uonbi.ac.ke" : "Locked — enter referral code above"}
                      onChange={(e) => {
                        if (!isUnlocked) return;
                        setEmail(e.target.value);
                        if (touched.email) setFieldErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
                      }}
                      onBlur={() => handleBlur("email")}
                      aria-invalid={!!fieldErrors.email}
                      className={`${fieldErrors.email ? INPUT_CLASS_ERROR : INPUT_CLASS} rounded-lg ${
                        !isUnlocked ? "cursor-not-allowed opacity-50 bg-cream/30" : ""
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="flex items-center gap-1 text-label-2xs text-red-500">
                        <AlertCircle size={12} /> {fieldErrors.email}
                      </p>
                    )}
                  </TextField>

                  <TextField isRequired className="flex flex-col gap-1.5">
                    <Label className="text-label-xs font-medium text-ink-2">Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        variant="primary"
                        value={password}
                        disabled={!isUnlocked}
                        placeholder={isUnlocked ? "••••••••" : "Locked — enter referral code above"}
                        onChange={(e) => {
                          if (!isUnlocked) return;
                          setPassword(e.target.value);
                          if (touched.password) setFieldErrors((prev) => ({ ...prev, password: validateSignUpPassword(e.target.value) }));
                        }}
                        onBlur={() => handleBlur("password")}
                        aria-invalid={!!fieldErrors.password}
                        className={`${fieldErrors.password ? INPUT_CLASS_ERROR : INPUT_CLASS} pr-10 rounded-lg ${
                          !isUnlocked ? "cursor-not-allowed opacity-50 bg-cream/30" : ""
                        }`}
                      />
                      <button
                        type="button"
                        disabled={!isUnlocked}
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-2 hover:text-ink disabled:opacity-40"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {fieldErrors.password ? (
                      <p className="flex items-center gap-1 text-label-2xs text-red-500">
                        <AlertCircle size={12} /> {fieldErrors.password}
                      </p>
                    ) : (
                      <PasswordStrengthMeter password={password} />
                    )}
                  </TextField>

                  {formError && (
                    <p className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-label-xs text-red-600">
                      <AlertCircle size={14} className="flex-none" /> {formError}
                    </p>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    isDisabled={formLoading || !isUnlocked}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg bg-navy py-2.5 text-label-sm font-semibold text-white ${
                      !isUnlocked ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  >
                    {!isUnlocked ? (
                      <span className="flex items-center gap-1.5">
                        <Lock size={14} /> Account Creation Disabled
                      </span>
                    ) : formLoading ? (
                      <Spinner size="sm" color="current" />
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </form>

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-line" />
                  <span className="text-label-xs text-ink-2">or</span>
                  <div className="h-px flex-1 bg-line" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={googleLoading || !isUnlocked}
                  className={`flex w-full items-center justify-center gap-3 rounded-lg border border-line bg-surface py-2.5 text-label-sm font-semibold text-ink transition-colors hover:bg-cream-2 ${
                    !isUnlocked ? "cursor-not-allowed opacity-50" : "disabled:opacity-60"
                  }`}
                >
                  <GoogleIcon />
                  {!isUnlocked ? "Google Sign Up Disabled" : googleLoading ? "Redirecting…" : "Sign up with Google"}
                </button>

                {googleError && <p className="mt-3 text-label-xs text-red-500">{googleError}</p>}

                <p className="mt-6 text-center text-label-xs text-ink-2">
                  Already have an account?{" "}
                  <Link href={ROUTES.signIn} className="font-semibold text-ink hover:underline">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>

        <div className="pt-4 text-label-xs text-muted">
          <p>© {new Date().getFullYear()} Chiromo Tech Club. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT COLUMN: DARK PORTAL BANNER */}
      <div className="relative hidden bg-navy-deep lg:col-span-6 lg:flex lg:flex-col lg:justify-between lg:p-16 xl:col-span-7">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/images/shadow.jpg"
            alt="Chiromo Tech Club Pioneer Cohort"
            fill
            className="scale-105 object-cover object-center opacity-40 mix-blend-luminosity"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/60 to-transparent" />
        </div>

        <div className="relative z-10 flex justify-end">
          <span className="inline-flex items-center gap-2 rounded-pill border border-white/15 bg-white/10 px-4 py-1.5 text-label-xs font-semibold text-white backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-success-base animate-pulse" />
            Registration Open
          </span>
        </div>

        <div className="relative z-10 mt-auto max-w-xl">
          <div className="rounded-card border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="inline-block rounded-md bg-success-base/20 px-3 py-1 font-mono text-label-2xs text-success-base">
              PIONEER_COHORT
            </div>
            <h2 className="mt-4 font-display text-title-h5 font-bold text-white sm:text-title-h4">
              Build projects that matter from Day 1.
            </h2>
            <p className="mt-2 text-paragraph-sm text-white/70">
              Get access to active technical communities in AI, Cloud, CyberSecurity, and Web Engineering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
