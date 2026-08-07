"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { memberDraftSchema, type MemberDraftInput } from "@/lib/validations/membership";
import { joinClub } from "@/actions/membership";
import { COMMUNITIES } from "@/data/communities";
import { Input } from "@/components/alignui/input";
import { Button } from "@/components/alignui/button";

export function JoinForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MemberDraftInput>({
    resolver: zodResolver(memberDraftSchema),
    defaultValues: { communitySlugs: [] },
  });

  async function onSubmit(data: MemberDraftInput) {
    setStatus("submitting");
    setServerError(null);
    const result = await joinClub(data);
    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setServerError(result.error ?? "Something went wrong.");
    }
  }

  if (status === "success") {
    return <p className="text-sm text-text-2">You&apos;re in — check your email for a confirmation.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-xs text-text-3">
          Full name
        </label>
        <Input id="fullName" {...register("fullName")} aria-invalid={!!errors.fullName} />
        {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs text-text-3">
          Email
        </label>
        <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
      </div>

      <fieldset>
  <legend className="mb-2 text-xs text-text-3">Communities</legend>
  
  <div className="grid grid-cols-2 gap-3">
    {COMMUNITIES.map((c) => {
      const inputId = `community-${c.slug}`;

      return (
        <div key={c.slug} className="flex items-center gap-2.5">
          <div className="relative inline-flex items-center justify-center">
            {/* Hidden Input tied to React Hook Form */}
            <input
              type="checkbox"
              id={inputId}
              value={c.slug}
              {...register("communitySlugs")}
              className="custom-cbx-input hidden"
            />
            
            {/* Animated SVG Checkbox Label */}
            <label htmlFor={inputId} className="check">
              <svg width="18px" height="18px" viewBox="0 0 18 18">
                <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z" />
                <polyline points="1 9 7 14 15 4" />
              </svg>
            </label>
          </div>

          {/* Text Label */}
          <label htmlFor={inputId} className="cursor-pointer text-sm text-text-2 select-none">
            {c.name}
          </label>
        </div>
      );
    })}
  </div>

  {errors.communitySlugs && (
    <p className="mt-1.5 text-xs text-red-400">{errors.communitySlugs.message}</p>
  )}
</fieldset>
      <div>
        <label htmlFor="githubHandle" className="mb-1.5 block text-xs text-text-3">
          GitHub handle (optional)
        </label>
        <Input id="githubHandle" {...register("githubHandle")} aria-invalid={!!errors.githubHandle} />
        {errors.githubHandle && <p className="mt-1 text-xs text-red-400">{errors.githubHandle.message}</p>}
      </div>

      {serverError && <p className="text-sm text-red-400">{serverError}</p>}

      <Button type="submit" variant="primary" disabled={status === "submitting"}>
        {status === "submitting" ? "Joining…" : "Join the Club"}
      </Button>
    </form>
  );
}