import { Slot } from "@radix-ui/react-slot";
import { cn } from ".././../lib/utils/cn";

export interface BaseButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

/**
 * Structural only: handles the asChild/Slot polymorphism so a button can
 * render as a Link or anchor without losing behavior. All visual styling
 * (variants, sizes, colors) lives in components/alignui/button.tsx.
 */
export function BaseButton({ className, asChild = false, ...props }: BaseButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(className)} {...props} />;
}
