import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  React.ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ className, children, ...props }, ref) => (
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" />
    <Dialog.Content
      ref={ref}
      className={cn(
        "fixed right-0 top-0 z-[101] flex h-full w-full max-w-xl flex-col border-l border-border bg-background pt-[env(safe-area-inset-top)] shadow-elev3 duration-200 animate-in slide-in-from-right",
        className,
      )}
      {...props}
    >
      {children}
      <Dialog.Close className="absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring md:right-4 md:top-4">
        <X className="h-5 w-5" />
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
));
SheetContent.displayName = "SheetContent";

export const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("border-b border-border/80 p-6", className)} {...props} />
);

export const SheetTitle = React.forwardRef<
  React.ElementRef<typeof Dialog.Title>,
  React.ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className, ...props }, ref) => (
  <Dialog.Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
));
SheetTitle.displayName = "SheetTitle";
