import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/**
 * Toast — transient notification on @radix-ui/react-toast.
 *
 * Usage (compound):
 *   <ToastProvider>
 *     <Toast open={open} onOpenChange={setOpen}>
 *       <div>
 *         <ToastTitle>Saved</ToastTitle>
 *         <ToastDescription>Profile updated.</ToastDescription>
 *       </div>
 *       <ToastClose />
 *     </Toast>
 *     <ToastViewport />
 *   </ToastProvider>
 *
 * For most cases the imperative `useToast()` hook + `<Toaster />`
 * (./toaster.tsx) is friendlier:
 *
 *   const { toast } = useToast();
 *   toast({ title: "Saved", description: "Profile updated." });
 *
 * Radix handles queuing, swipe-to-dismiss, hover-to-pause-the-timer,
 * keyboard focus on hot-key, ARIA live region.
 */

const ToastProvider = ToastPrimitive.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "zen-fixed zen-top-0 zen-right-0 zen-z-[100] zen-flex zen-max-h-screen zen-w-full zen-flex-col zen-p-4",
      "md:zen-max-w-sm",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

const toastVariants = cva(
  [
    "zen-group zen-pointer-events-auto zen-relative zen-flex zen-w-full zen-items-start zen-gap-3",
    "zen-overflow-hidden zen-rounded-zen-md zen-border zen-p-4 zen-shadow-zen-lg",
    "data-[swipe=cancel]:zen-translate-x-0",
    "data-[swipe=end]:zen-translate-x-[var(--radix-toast-swipe-end-x)]",
    "data-[swipe=move]:zen-translate-x-[var(--radix-toast-swipe-move-x)]",
    "data-[swipe=move]:zen-transition-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "zen-bg-zen-background zen-border-zen-border zen-text-zen-foreground",
        success:
          "zen-bg-zen-success-soft zen-border-zen-success zen-text-zen-success-soft-fg",
        warning:
          "zen-bg-zen-warning-soft zen-border-zen-warning zen-text-zen-warning-soft-fg",
        destructive:
          "zen-bg-zen-error-soft zen-border-zen-error zen-text-zen-error-soft-fg",
        info: "zen-bg-zen-info-soft zen-border-zen-info zen-text-zen-info-soft-fg",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>,
    VariantProps<typeof toastVariants> {}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastProps
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  />
));
Toast.displayName = ToastPrimitive.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      "zen-ml-auto zen-inline-flex zen-h-8 zen-shrink-0 zen-items-center zen-justify-center",
      "zen-rounded-zen-sm zen-border zen-border-current/30 zen-bg-transparent zen-px-3 zen-text-sm zen-font-medium",
      "hover:zen-bg-current/10",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitive.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    toast-close=""
    aria-label="Close"
    className={cn(
      "zen-absolute zen-right-2 zen-top-2 zen-inline-flex zen-h-6 zen-w-6 zen-items-center zen-justify-center",
      "zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer zen-opacity-70",
      "hover:zen-opacity-100 hover:zen-bg-current/10",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      className,
    )}
    {...props}
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  </ToastPrimitive.Close>
));
ToastClose.displayName = ToastPrimitive.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn("zen-text-sm zen-font-semibold zen-leading-tight", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn("zen-text-sm zen-opacity-90 zen-leading-snug", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  toastVariants,
};
