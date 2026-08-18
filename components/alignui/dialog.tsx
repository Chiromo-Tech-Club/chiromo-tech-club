import {
  Dialog as BaseDialog,
  DialogContent as BaseDialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";

export { DialogTrigger, DialogTitle, DialogDescription, DialogClose };
export const Dialog = BaseDialog;

export function DialogContent({ className, children, ...props }: React.ComponentProps<typeof BaseDialogContent>) {
  return (
    <BaseDialogContent
      className={cn(
        "top-[14vh] left-1/2 -translate-x-1/2 w-[560px] max-w-[90vw] max-h-[70vh] overflow-hidden",
        "rounded-[20px] border border-white/40 bg-surface/70 backdrop-blur-xl backdrop-saturate-150 shadow-[0_30px_80px_rgba(23,20,15,0.18)]",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className,
      )}
      {...props}
    >
      {children}
    </BaseDialogContent>
  );
}