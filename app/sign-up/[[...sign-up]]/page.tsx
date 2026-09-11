"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { TextField, Label, Input, Button, Spinner } from "@heroui/react";
import { ROUTES } from "@/constants/routes";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { validateEmail, validateFullName, validateSignUpPassword } from "@/lib/utils/auth-validation";
import { friendlyAuthError } from "@/lib/utils/friendly-error";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";

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
    setFormError(null);
    if (!validateAll()) return;

    setFormLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?intent=signup&next=${encodeURIComponent(ROUTES.dashboard)}`,
      },
    });

    if (error) {
      const friendly = friendlyAuthError(error, "Could not create your account. Please try again.");
      if (/email|already registered|already exists/i.test(error.message)) {
        setFieldErrors((prev) => ({ ...prev, email: friendly }));
        setTouched((t) => ({ ...t, email: true }));
      } else {
        setFormError(friendly);
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
    setGoogleLoading(true);
    setGoogleError(null);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?intent=signup&next=${encodeURIComponent(ROUTES.dashboard)}`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      setGoogleError(friendlyAuthError(error, "Google sign-up didn’t complete. Please try again."));
      setGoogleLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-surface lg:grid-cols-12">
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
              Create your CTC account, then open the dashboard.
            </p>
          </div>

          <div className="w-full max-w-md">
            {confirmationSent ? (
              <div className="rounded-md border border-line bg-cream/40 p-5 text-center">
                <p className="text-label-sm font-semibold text-ink">Check your email</p>
                <p className="mt-1.5 text-paragraph-sm text-ink-2">
                  We sent a confirmation link to <span className="font-semibold text-ink">{email}</span>.
                  After confirming, open your dashboard.
                </p>
                <Link href={ROUTES.dashboard} className="mt-4 inline-block text-label-xs font-semibold text-ink hover:underline">
                  Go to dashboard
                </Link>
              </div>
            ) : (
              <>
                <form onSubmit={handleEmailSignUp} noValidate className="flex flex-col gap-4">
                  <TextField isRequired className="flex flex-col gap-1.5">
                    <Label className="text-label-xs font-medium text-ink-2">Full name</Label>
                    <Input
                      type="text"
                      variant="primary"
                      value={fullName}
                      placeholder="Dennis Ritchie"
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (touched.fullName) setFieldErrors((prev) => ({ ...prev, fullName: validateFullName(e.target.value) }));
                      }}
                      onBlur={() => handleBlur("fullName")}
                      aria-invalid={!!fieldErrors.fullName}
                      className={`${fieldErrors.fullName ? INPUT_CLASS_ERROR : INPUT_CLASS} rounded-md`}
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
                      placeholder="student@uonbi.ac.ke"
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (touched.email) setFieldErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
                      }}
                      onBlur={() => handleBlur("email")}
                      aria-invalid={!!fieldErrors.email}
                      className={`${fieldErrors.email ? INPUT_CLASS_ERROR : INPUT_CLASS} rounded-lg`}
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
                        placeholder="••••••••"
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (touched.password) {
                            setFieldErrors((prev) => ({ ...prev, password: validateSignUpPassword(e.target.value) }));
                          }
                        }}
                        onBlur={() => handleBlur("password")}
                        aria-invalid={!!fieldErrors.password}
                        className={`${fieldErrors.password ? INPUT_CLASS_ERROR : INPUT_CLASS} pr-10 rounded-lg`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-2 hover:text-ink"
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
                    <p className="flex items-center gap-1 text-label-2xs text-red-500">
                      <AlertCircle size={12} /> {formError}
                    </p>
                  )}

                  <Button type="submit" isDisabled={formLoading} className="mt-1 w-full rounded-full bg-navy text-white">
                    {formLoading ? <Spinner size="sm" color="current" /> : "Create account"}
                  </Button>
                </form>

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-line" />
                  <span className="text-label-2xs text-muted">or</span>
                  <div className="h-px flex-1 bg-line" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={googleLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-label-sm font-semibold text-ink hover:bg-cream-2 disabled:opacity-60"
                >
                  <GoogleIcon />
                  {googleLoading ? "Opening Google…" : "Continue with Google"}
                </button>
                {googleError && (
                  <p className="mt-2 flex items-center gap-1 text-label-2xs text-red-500">
                    <AlertCircle size={12} /> {googleError}
                  </p>
                )}

                <p className="mt-6 text-center text-label-xs text-ink-2">
                  Already have an account?{" "}
                  <Link href={ROUTES.signIn} className="font-semibold text-sky hover:underline">
                    Sign in
                  </Link>
                </p>
                <p className="mt-2 text-center text-label-2xs text-muted">
                  Prefer the full membership form?{" "}
                  <Link href={ROUTES.register} className="font-semibold text-ink hover:underline">
                    Register for CTC
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>

        <p className="text-label-2xs text-muted">Chiromo Tech Club · University of Nairobi</p>
      </div>

      <div className="relative hidden lg:col-span-6 lg:block xl:col-span-7">
        <Image src="/images/spider.jpeg" alt="" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>
    </div>
  );
}
