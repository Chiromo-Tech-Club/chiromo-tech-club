import { BaseInput, type BaseInputProps } from ".././../components/ui/input";
import { cn } from ".././../lib/utils/cn";

export function Input({ className, ...props }: BaseInputProps) {
  return (
    <BaseInput
      className={cn(
        "w-full rounded-full border border-line bg-white px-[18px] py-[13px] text-sm text-ink placeholder:text-muted",
        "focus:outline-none focus:border-green transition-colors",
        className,
      )}
      {...props}
    />
  );
}
