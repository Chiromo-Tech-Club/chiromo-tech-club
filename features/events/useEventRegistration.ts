"use client";

import { useState } from "react";
import { registerForEvent } from ".././../actions/events";

export function useEventRegistration(eventSlug: string) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function register() {
    setStatus("submitting");
    setError(null);
    const result = await registerForEvent(eventSlug);
    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setError(result.error ?? "Could not register.");
    }
  }

  return { status, error, register };
}