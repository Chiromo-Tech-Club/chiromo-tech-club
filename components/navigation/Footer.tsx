import Link from "next/link";
import { SITE_CONFIG } from ".././../config/site";
import { ROUTES } from ".././../constants/routes";
import Image from "next/image";

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-4 w-4">
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 00-1.3-3.2 4.2 4.2 0 00-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 00-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 00-.1 3.2A4.6 4.6 0 004 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.1-.5 2V21" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-4 w-4">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="17.4" cy="6.6" r="1" />
    </svg>
  );
}
function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-4 w-4">
      <rect x="3" y="9" width="4" height="12" />
      <circle cx="5" cy="4.5" r="1.6" />
      <path d="M11 21v-7a3.5 3.5 0 017 0v7M11 9v12" />
    </svg>
  );
}

const EXPLORE_LINKS = [
  { label: "About Us", href: `${ROUTES.home}#who` },
  { label: "Communities", href: ROUTES.communities },
  { label: "Our Impact", href: `${ROUTES.home}#impact` },
  { label: "Get Involved", href: ROUTES.join },
  { label: "Contact", href: "mailto:hello.././..chiromotechclub.org" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Use", href: "#" },
  { label: "Code of Conduct", href: "#" },
];

export function Footer() {
  return (
    <footer className="overflow-hidden bg-cream pt-20">
      <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-10 px-8 pb-14">
        <div className="flex items-center gap-2.5">
    <div className="relative flex h-30 w-30 items-center justify-center rounded-xl  p-2.5">
      <Image
        src="/images/image.svg"
        alt={`${SITE_CONFIG.name} Logo`}
        width={80}
        height={80}
        className="h-full w-full object-contain"
      />
    </div>
        </div>

        <div className="flex flex-wrap gap-16">
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">Explore</h4>
            {EXPLORE_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="mb-2.5 block text-sm text-ink-2 hover:text-ink">
                {link.label}
              </Link>
            ))}
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">Legal</h4>
            {LEGAL_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="mb-2.5 block text-sm text-ink-2 hover:text-ink">
                {link.label}
              </Link>
            ))}
            <a href="mailto:hello.././..chiromotechclub.org" className="mt-1 block text-sm text-green">
              hello.././..chiromotechclub.org
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 border-t border-line px-8 py-6 text-xs text-muted">
        <span>© {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.</span>
        <span className="flex gap-4">
          <a href={SITE_CONFIG.socials.github} aria-label="GitHub" className="text-ink-2 hover:text-ink"><GithubIcon /></a>
          <a href={SITE_CONFIG.socials.instagram} aria-label="Instagram" className="text-ink-2 hover:text-ink"><InstagramIcon /></a>
          <a href={SITE_CONFIG.socials.linkedin} aria-label="LinkedIn" className="text-ink-2 hover:text-ink"><LinkedinIcon /></a>
        </span>
      </div>

      <div className="select-none px-4 pb-[-40px] leading-[0.75]" aria-hidden>
        <div className="-mx-4 -mb-10 text-center font-display text-[22vw] font-extrabold tracking-tighter text-ink">
          chiromo.
        </div>
      </div>
    </footer>
  );
}
