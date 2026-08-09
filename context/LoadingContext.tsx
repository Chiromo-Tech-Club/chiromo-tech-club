"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { PageLoader } from "@/components/loaders/PageLoader";

interface LoadingContextValue {
  isLoading: boolean;
  showLoader: (label?: string) => void;
  hideLoader: () => void;
  /** Wrap any async call — shows the loader before it runs, hides it after (even on error). */
  withLoader: <T>(fn: () => Promise<T>, label?: string) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function GlobalLoaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [label, setLabel] = useState("loading");

  const showLoader = useCallback((l = "loading") => {
    setLabel(l);
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => setIsLoading(false), []);

  const withLoader = useCallback(
    async <T,>(fn: () => Promise<T>, l = "loading"): Promise<T> => {
      showLoader(l);
      try {
        return await fn();
      } finally {
        hideLoader();
      }
    },
    [showLoader, hideLoader],
  );

  return (
    <LoadingContext.Provider value={{ isLoading, showLoader, hideLoader, withLoader }}>
      {children}
      {isLoading && <PageLoader label={label} />}
    </LoadingContext.Provider>
  );
}

export function useGlobalLoader() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useGlobalLoader must be used inside <GlobalLoaderProvider>");
  return ctx;
}