import Image from "next/image";
import Link from "next/link";
import { JoinForm } from "@/features/membership/JoinForm";
import { ROUTES } from "@/constants/routes";

export const metadata = { title: "Join the Club | Chiromo Tech Club" };

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function JoinPage() {
  return (
    <main className="relative min-h-screen max-w-[1280px] mx-auto px-6 pb-24 pt-16 md:pt-24 lg:px-12">
      
      {/* MOBILE-ONLY BACKGROUND LAYER */}
      <div className="fixed inset-0 -z-10 lg:hidden">
        <Image
          src="/images/spider.jpeg"
          alt="Chiromo Tech Club"
          fill
          className="object-cover object-center opacity-15"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/90 to-cream" />
      </div>

      {/* MAIN GRID CONTAINER */}
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        
        {/* DESKTOP-ONLY IMAGE CARD */}
        <div className="hidden lg:block lg:col-span-6">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] bg-cream shadow-xl">
            <Image
              src="/images/spider.jpeg"
              alt="Chiromo Tech Club Community"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <span className="inline-block rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
                Founding Cohort
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold leading-snug">
                Build, ship, and innovate alongside the sharpest minds.
              </h3>
            </div>
          </div>
        </div>

        {/* FORM CONTAINER */}
        <div className="lg:col-span-6">
          <div className="mx-auto max-w-lg lg:mx-0">
            
            {/* BACK TO HOME BUTTON */}
            <Link
              href={ROUTES.home}
              className="group mb-6 inline-flex items-center gap-2.5 text-sm font-semibold text-ink-2 transition-colors hover:text-ink"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white/80 text-ink transition-transform group-hover:-translate-x-1 lg:bg-cream">
                <ArrowLeftIcon />
              </span>
              Back to Home
            </Link>

            {/* Badge */}
            <div className="mb-4 flex items-center gap-2 self-start rounded-full border border-line bg-white/80 px-3.5 py-1 text-xs font-semibold text-ink shadow-sm backdrop-blur-md lg:bg-cream w-fit">
              <span className="h-2 w-2 rounded-full bg-green animate-pulse" />
              Open Registration
            </div>

            {/* Headline & Description */}
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Join Chiromo Tech Club
            </h1>

            <p className="mt-3 text-base leading-relaxed text-ink-2">
              No application gate — just tell us who you are and what you&apos;re into.
            </p>

            {/* Form Box */}
            <div className="mt-8 rounded-[2rem] border border-line/70 bg-white/95 p-6 shadow-xl backdrop-blur-md sm:p-8 lg:bg-white lg:shadow-sm">
              <JoinForm />
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}