"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  getLoginNameMergeCandidates,
  confirmNameIsDistinct,
} from "@/actions/account-linking";
import { NameMatchModal } from "@/features/membership/NameMatchModal";
import type { SimilarMemberCandidate } from "@/lib/membership/name-match";

/**
 * Mounted on the dashboard shell. If the signed-in member shares a
 * case-insensitive name with another account, prompt to pick a primary email.
 */
export function LoginNameMergeGate() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<SimilarMemberCandidate | null>(null);
  const [candidates, setCandidates] = useState<SimilarMemberCandidate[]>([]);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const res = await getLoginNameMergeCandidates();
      if (!res.success || !res.data?.candidates.length || !res.data.current) return;
      setCurrent(res.data.current);
      setCandidates(res.data.candidates);
      setOpen(true);
    });
  }, []);

  if (!current || candidates.length === 0) return null;

  return (
    <NameMatchModal
      open={open}
      mode="login"
      current={{ id: current.id, fullName: current.fullName, email: current.email }}
      candidates={candidates}
      onClose={() => setOpen(false)}
      onDistinct={async () => {
        await confirmNameIsDistinct();
        setOpen(false);
      }}
      onMerged={() => {
        setOpen(false);
        router.refresh();
      }}
    />
  );
}
