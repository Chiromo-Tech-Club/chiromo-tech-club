import { cn } from ".././../lib/utils/cn";

export type BaseInputProps = React.ComponentProps<"input">;

export function BaseInput({ className, type = "text", ...props }: BaseInputProps) {
  return <input type={type} className={cn(className)} {...props} />;
}
