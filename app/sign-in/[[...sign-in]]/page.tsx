import Image from "next/image";
import Link from "next/link";
import { SignIn, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { ROUTES } from "@/constants/routes";
import { WifiLoader } from "@/components/loaders/WifiLoader";

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SignInPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-white lg:grid-cols-12">
      {/* LEFT COLUMN: AUTH FORM SECTION */}
      <div className="flex min-h-screen flex-col justify-between overflow-y-auto px-6 py-8 sm:px-12 lg:col-span-6 lg:px-16 xl:col-span-5">
        {/* Top Header: Logo & Back Link */}
        <div className="flex items-center justify-between">
          <Link href={ROUTES.home} className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-line bg-white p-1">
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

        {/* Center Auth Form */}
        <div className="my-auto py-8">
          <div className="mb-6">
            <h1 className="font-display text-title-h5 font-medium text-ink sm:text-title-h4">
              Welcome back
            </h1>
            <p className="mt-1.5 text-paragraph-sm text-ink-2">
              Sign in to access your tech track workspace and member projects.
            </p>
          </div>

          <div className="w-full max-w-md">
            {/* Clerk's own components flash blank while their JS boots — show
                the wifi loader in that gap instead of an empty box. */}
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
                      "bg-navy hover:bg-navy/90 text-label-sm font-semibold rounded-card-sm transition-colors py-2.5",
                    formFieldInput: "rounded-card-sm border-line focus:border-navy focus:ring-navy",
                  },
                }}
              />
            </ClerkLoaded>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 text-label-xs text-muted">
          <p>© {new Date().getFullYear()} Chiromo Tech Club. Secure Access Portal.</p>
        </div>
      </div>

      {/* RIGHT COLUMN: DARK PORTAL BANNER */}
      <div className="relative hidden bg-navy-deep lg:col-span-6 lg:flex lg:flex-col lg:justify-between lg:p-16 xl:col-span-7">
        {/* Shadow Image Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/images/shadow.jpg"
            alt="Chiromo Tech Club Portal"
            fill
            className="scale-105 object-cover object-center opacity-40 mix-blend-luminosity"
            priority
          />
          {/* Subtle Ambient Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/60 to-transparent" />
        </div>

        {/* Top Floating Badge */}
        <div className="relative z-10 flex justify-end">
          <span className="inline-flex items-center gap-2 rounded-pill border border-white/15 bg-white/10 px-4 py-1.5 text-label-xs font-semibold text-white backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-sky animate-pulse" />
            Member Portal
          </span>
        </div>

        {/* Bottom Hero Glass Card */}
        <div className="relative z-10 mt-auto max-w-xl">
          <div className="rounded-card border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="inline-block rounded-card-sm bg-sky/20 px-3 py-1 font-mono text-label-2xs text-sky">
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