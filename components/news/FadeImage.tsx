"use client";

import { useState } from "react";

/**
 * Wraps an external <img> with a pulse skeleton that crossfades into the
 * real image once it loads. Hides the "pop in" jank of remote CDN images
 * (Dev.to / Medium) without needing next/image's domain allowlist, since
 * those cover images come from many different, article-specific hosts.
 */
export function FadeImage({
  src,
  alt = "",
  className = "",
  priority = false,
  fallbackClassName = "bg-cream-2 text-muted",
}: {
  src?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  /** bg + text color classes for the empty/loading state — pass a dark variant on dark backgrounds */
  fallbackClassName?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return (
      <div className={`flex h-full w-full items-center justify-center font-mono text-label-2xs ${fallbackClassName}`}>
        No preview
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden ${fallbackClassName.split(" ")[0]}`}>
      <div
        aria-hidden
        className={`absolute inset-0 ${fallbackClassName.split(" ")[0]} transition-opacity duration-500 ${
          loaded ? "opacity-0" : "opacity-100 animate-pulse"
        }`}
      />
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${className}`}
      />
    </div>
  );
}