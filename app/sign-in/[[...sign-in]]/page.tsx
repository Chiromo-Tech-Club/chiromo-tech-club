"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { TextField, Label, Input, Button, Spinner } from "@heroui/react";
import { ROUTES } from "@/constants/routes";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { validateEmail, validateSignInPassword } from "@/lib/utils/auth-validation";

// ─────────────────────────────────────────────────────────────────────────
// CLERK (commented out — kept for reference / rollback)
// ─────────────────────────────────────────────────────────────────────────
// import { SignIn, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
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
  email?: string;
  password?: string;
}

const INPUT_CLASS =
  "w-full rounded-md border border-line px-3 py-2.5 text-label-sm outline-none transition-colors focus:border-navy";
const INPUT_CLASS_ERROR =
  "w-full rounded-md border border-red-400 px-3 py-2.5 text-label-sm outline-none transition-colors focus:border-red-500";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formLoading, setFormLoading] = useState(false);
  // Errors that aren't about a specific field — e.g. "invalid credentials" from Supabase.
  const [formError, setFormError] = useState<string | null>(null);

  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  function handleBlur(field: "email" | "password") {
    setTouched((t) => ({ ...t, [field]: true }));
    setFieldErrors((prev) => ({
      ...prev,
      email: field === "email" ? validateEmail(email) : prev.email,
      password: field === "password" ? validateSignInPassword(password) : prev.password,
    }));
  }

  function validateAll(): boolean {
    const errors: FieldErrors = {
      email: validateEmail(email),
      password: validateSignInPassword(password),
    };
    setFieldErrors(errors);
    setTouched({ email: true, password: true });
    return !errors.email && !errors.password;
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!validateAll()) return;

    setFormLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Supabase's own message ("Invalid login credentials") doesn't point at
      // one field, so it stays a form-level error rather than forcing it
      // onto email or password specifically.
      setFormError(error.message);
      setFormLoading(false);
      return;
    }

    router.push(ROUTES.dashboard);
    router.refresh();
  }

  async function handleGoogleSignIn() {
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
            <h1 className="font-display text-title-h5 font-medium text-ink sm:text-title-h4">Welcome back</h1>
            <p className="mt-1.5 text-paragraph-sm text-ink-2">
              Sign in to access your tech track workspace and member projects.
            </p>
          </div>

          <div className="w-full max-w-md">
            {/* ───────────────────────────────────────────────────────────
                CLERK (commented out — kept for reference / rollback)
               ─────────────────────────────────────────────────────────── */}
            {/*
            <ClerkLoading>
              <div className="flex min-h-[340px] flex-col items-center justify-center gap-10">
                <WifiLoader label="loading" />
              </div>
            </ClerkLoading>

            <ClerkLoaded>
              <SignIn
                appearance={{
                  elements: {
                    rootBox: "w-full max-w-md",
                    cardBox: "w-full shadow-none border-0 bg-transparent rounded-none",
                    card: "w-full shadow-none border-0 p-0 bg-transparent rounded-none",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    footer: "bg-transparent",
                    formButtonPrimary:
                      "bg-navy hover:bg-navy/90 text-label-sm font-semibold rounded-md transition-colors py-2.5",
                    formFieldInput: "rounded-md border-line focus:border-navy focus:ring-navy",
                  },
                }}
              />
            </ClerkLoaded>
            */}
            {/* ─────────────────────────────────────────────────────────── */}

            {/* Email / password form — HeroUI v3 API: TextField/Label/Input
                compound components, variant is "primary" | "secondary" only,
                no startContent/endContent (password toggle is placed
                manually in a relative-positioned wrapper below).
                Requires the Email provider enabled in Supabase.
                Inline, per-field validation (Clerk-style): errors surface
                on blur and again on submit, right under the field they
                belong to — never as one generic message. */}
            <form onSubmit={handleEmailSignIn} noValidate className="flex flex-col gap-4">
              <TextField isRequired className="flex flex-col gap-1.5">
                <Label className="text-label-xs font-medium text-ink-2">Email</Label>
                <Input
                  type="email"
                  variant="primary"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) setFieldErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
                  }}
                  onBlur={() => handleBlur("email")}
                  aria-invalid={!!fieldErrors.email}
                  className={`${fieldErrors.email ? INPUT_CLASS_ERROR : INPUT_CLASS} rounded-md`}
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
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password) setFieldErrors((prev) => ({ ...prev, password: validateSignInPassword(e.target.value) }));
                    }}
                    onBlur={() => handleBlur("password")}
                    aria-invalid={!!fieldErrors.password}
                    className={`${fieldErrors.password ? INPUT_CLASS_ERROR : INPUT_CLASS} pr-10 rounded-md`}
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
                {fieldErrors.password && (
                  <p className="flex items-center gap-1 text-label-2xs text-red-500">
                    <AlertCircle size={12} /> {fieldErrors.password}
                  </p>
                )}
              </TextField>

              {formError && (
                <p className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-label-xs text-red-600">
                  <AlertCircle size={14} className="flex-none" /> {formError}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                isDisabled={formLoading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-navy py-2.5 text-label-sm font-semibold text-white"
              >
                {formLoading ? <Spinner size="sm" color="current" /> : "Sign in"}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-line" />
              <span className="text-label-xs text-ink-2">or</span>
              <div className="h-px flex-1 bg-line" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-md border border-line bg-surface py-2.5 text-label-sm font-semibold text-ink transition-colors hover:bg-cream-2 disabled:opacity-60"
            >
              <GoogleIcon />
              {googleLoading ? "Redirecting…" : "Continue with Google"}
            </button>

            {googleError && <p className="mt-3 text-label-xs text-red-500">{googleError}</p>}

            <p className="mt-6 text-center text-label-xs text-ink-2">
              Don&apos;t have an account?{" "}
              <Link href={ROUTES.signUp} className="font-semibold text-ink hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="pt-4 text-label-xs text-muted">
          <p>© {new Date().getFullYear()} Chiromo Tech Club. Secure Access Portal.</p>
        </div>
      </div>

      {/* RIGHT COLUMN: DARK PORTAL BANNER */}
      <div className="relative hidden bg-navy-deep lg:col-span-6 lg:flex lg:flex-col lg:justify-between lg:p-16 xl:col-span-7">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/images/shadow.jpg"
            alt="Chiromo Tech Club Portal"
            fill
            className="scale-105 object-cover object-center opacity-40 mix-blend-luminosity"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/60 to-transparent" />
        </div>

        <div className="relative z-10 flex justify-end">
          <span className="inline-flex items-center gap-2 rounded-pill border border-white/15 bg-white/10 px-4 py-1.5 text-label-xs font-semibold text-white backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-sky animate-pulse" />
            Member Portal
          </span>
        </div>

        <div className="relative z-10 mt-auto max-w-xl">
          <div className="rounded-card border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="inline-block rounded-md bg-sky/20 px-3 py-1 font-mono text-label-2xs text-sky">
              MEMBER_SYSTEM
            </div>
            <h2 className="mt-4 font-display text-title-h5 font-bold text-white sm:text-title-h4">
              &quot;Code is read much more often than it is written.&quot;
            </h2>
            <p className="mt-2 text-paragraph-sm text-white/70">
              Access your club dashboard, collaborate on active repositories, and track upcoming hackathons.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
