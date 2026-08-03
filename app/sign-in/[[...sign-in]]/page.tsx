import Image from "next/image";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { ROUTES } from "@/constants/routes";

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
      <div className="flex flex-col justify-between px-6 py-8 sm:px-12 lg:col-span-6 xl:col-span-5 lg:px-16">
        
        {/* Top Header: Logo & Back Link */}
        <div className="flex items-center justify-between">
          <Link href={ROUTES.home} className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-line bg-white p-1">
              <Image src="/images/image.svg" alt="CTC Logo" width={32} height={32} className="h-full w-full object-contain" />
            </div>
            <span className="font-display text-base font-bold text-ink">chiromo.</span>
          </Link>

          <Link
            href={ROUTES.home}
            className="group flex items-center gap-2 text-xs font-semibold text-ink-2 transition-colors hover:text-ink"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-line transition-transform group-hover:-translate-x-0.5">
              <ArrowLeftIcon />
            </span>
            Back to Home
          </Link>
        </div>

        {/* Center Auth Form */}
        <div className="my-auto py-10">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-ink-2">
              Sign in to access your tech track workspace and member projects.
            </p>
          </div>

          <div className="flex justify-center sm:justify-start">
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full max-w-md",
                  card: "shadow-none border-0 p-0 bg-transparent",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  footer: "bg-transparent",
                  formButtonPrimary: "bg-navy hover:bg-navy/90 text-sm font-semibold rounded-xl transition-colors",
                }
              }}
            />
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-muted">
          <p>© {new Date().getFullYear()} Chiromo Tech Club. Secure Access Portal.</p>
        </div>
      </div>

      {/* RIGHT COLUMN: DARK PORTAL BANNER (Full Bleed Image Side) */}
      <div className="relative hidden bg-[#0B1324] lg:col-span-6 xl:col-span-7 lg:flex lg:flex-col lg:justify-between lg:p-16">
        
        {/* Shadow Image Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/images/shadow.jpg"
            alt="Chiromo Tech Club Portal"
            fill
            className="object-cover object-center opacity-40 mix-blend-luminosity scale-105"
            priority
          />
          {/* Subtle Ambient Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1324] via-[#0B1324]/60 to-transparent" />
          <div className="absolute inset-0 bg-radial-gradient from-blue-500/10 via-transparent to-transparent" />
        </div>

        {/* Top Floating Badge */}
        <div className="relative z-10 flex justify-end">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            Member Portal
          </span>
        </div>

        {/* Bottom Hero Glass Card */}
        <div className="relative z-10 mt-auto max-w-xl">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="inline-block rounded-lg bg-blue-500/20 px-3 py-1 font-mono text-xs text-blue-300">
               MEMBER_SYSTEM
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">
              &quot;Code is read much more often than it is written.&quot;
            </h2>
            <p className="mt-2 text-sm text-white/70">
              Access your club dashboard, collaborate on active repositories, and track upcoming hackathons.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}