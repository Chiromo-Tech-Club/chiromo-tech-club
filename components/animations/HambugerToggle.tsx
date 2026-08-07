"use client";

interface HamburgerToggleProps {
  open: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * Animated hamburger → close-X toggle.
 * Controlled: `open` drives the visual state, `onToggle` fires on click.
 * The morph is driven by inline styles tied directly to `open` rather than
 * Tailwind's arbitrary-property / peer-checked classes — this avoids any
 * dependency on Tailwind picking those up correctly across versions/configs.
 */
export function HamburgerToggle({ open, onToggle, className }: HamburgerToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={open ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={open}
      className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink transition-colors hover:bg-cream ${className ?? ""}`}
    >
      <svg
        viewBox="0 0 32 32"
        className="h-6 w-6"
        style={{
          transform: open ? "rotate(-45deg)" : "rotate(0deg)",
          transition: "transform 600ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <path
          d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: open ? "20 300" : "12 63",
            strokeDashoffset: open ? -32.42 : 0,
            transition:
              "stroke-dasharray 600ms cubic-bezier(0.4,0,0.2,1), stroke-dashoffset 600ms cubic-bezier(0.4,0,0.2,1)",
          }}
        />
        <path
          d="M7 16 27 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}