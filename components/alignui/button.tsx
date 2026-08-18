import { cva, type VariantProps } from "class-variance-authority";
import { BaseButton, type BaseButtonProps } from ".././../components/ui/button";
import { cn } from ".././../lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center gap-2 rounded-full font-semibold text-sm px-6 py-3.5 transition-[background,border-color,transform] duration-200 ease-out disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green",
  {
    variants: {
      variant: {
        primary: "bg-green text-white hover:bg-green-dark",
        ghost: "border border-line-strong text-ink hover:border-ink bg-surface",
        dark: "bg-ink text-white hover:bg-ink/90",
      },
      size: {
        default: "",
        sm: "px-4 py-2 text-[13px]",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps extends BaseButtonProps, VariantProps<typeof buttonVariants> {}

/** The app's single Button component. Import this everywhere — never components/ui/button directly. */
export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <BaseButton className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
