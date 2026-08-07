import { EXEC_TITLE_LABELS, type ExecTitle } from "@/types/exec-title";

interface WelcomeCardProps {
  fullName: string;
  execTitle: ExecTitle | null;
}

export function WelcomeCard({ fullName, execTitle }: WelcomeCardProps) {
  const firstName = fullName.split(" ")[0];
  return (
    <div className="rounded-[var(--radius-card-sm)] bg-green px-7 py-8 text-white">
      <p className="text-sm text-white/80">Welcome back,</p>
      <h1 className="mt-1 font-display text-2xl font-bold">{firstName}</h1>
      {execTitle && <p className="mt-2 text-sm text-white/85">{EXEC_TITLE_LABELS[execTitle]}</p>}
    </div>
  );
}
