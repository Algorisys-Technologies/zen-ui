import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/**
 * Sheet — slide-in side panel built on Radix Dialog. Use when a Dialog
 * is too modal for the task: long-form filter panels, edit screens that
 * need the underlying list visible as reference, KYC document review,
 * help / onboarding tour content. Slides in from any edge.
 *
 *   <Sheet>
 *     <SheetTrigger asChild>
 *       <Button>Filters</Button>
 *     </SheetTrigger>
 *     <SheetContent side="right">
 *       <SheetHeader>
 *         <SheetTitle>Filters</SheetTitle>
 *         <SheetDescription>Narrow the dashboard.</SheetDescription>
 *       </SheetHeader>
 *       …
 *       <SheetFooter>
 *         <Button>Apply</Button>
 *         <SheetClose asChild><Button variant="outline">Cancel</Button></SheetClose>
 *       </SheetFooter>
 *     </SheetContent>
 *   </Sheet>
 *
 * `side` controls which edge the panel slides from:
 *   - right (default) — desktop filters / details / edit forms
 *   - left — secondary navigation drawer
 *   - top — banner-style notifications, command palettes
 *   - bottom — mobile bottom-sheet (responsive: pair with media-query
 *     prop on the consumer side)
 *
 * Differences from Dialog:
 *   - Slides instead of fading + scaling.
 *   - The overlay still dims the rest of the page (Dialog semantics) so
 *     the user knows the sheet is the focus. For a non-modal slide-in
 *     panel that lets the page stay interactive, use Popover instead.
 */

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "zen-fixed zen-inset-0 zen-z-50 zen-bg-black/40",
      "data-[state=open]:zen-anim-fade-in",
      "data-[state=closed]:zen-anim-fade-out",
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const sheetContentVariants = cva(
  [
    "zen-fixed zen-z-50 zen-flex zen-flex-col zen-gap-4 zen-bg-zen-background zen-text-zen-foreground zen-p-6 zen-shadow-zen-lg",
    "zen-transition zen-ease-in-out",
    "focus-visible:zen-outline-none",
  ].join(" "),
  {
    variants: {
      side: {
        right: [
          "zen-inset-y-0 zen-right-0 zen-h-full zen-w-3/4 zen-max-w-md zen-border-l zen-border-zen-border",
          "data-[state=open]:zen-anim-slide-in-right",
          "data-[state=closed]:zen-anim-slide-out-right",
        ].join(" "),
        left: [
          "zen-inset-y-0 zen-left-0 zen-h-full zen-w-3/4 zen-max-w-md zen-border-r zen-border-zen-border",
          "data-[state=open]:zen-anim-slide-in-left",
          "data-[state=closed]:zen-anim-slide-out-left",
        ].join(" "),
        top: [
          "zen-inset-x-0 zen-top-0 zen-w-full zen-max-h-[80vh] zen-border-b zen-border-zen-border",
          "data-[state=open]:zen-anim-slide-in-top",
          "data-[state=closed]:zen-anim-slide-out-top",
        ].join(" "),
        bottom: [
          "zen-inset-x-0 zen-bottom-0 zen-w-full zen-max-h-[80vh] zen-border-t zen-border-zen-border",
          "zen-rounded-t-zen-lg",
          "data-[state=open]:zen-anim-slide-in-bottom",
          "data-[state=closed]:zen-anim-slide-out-bottom",
        ].join(" "),
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetContentVariants> {
  /** Show a built-in close ✕ in the top-right. Default true. */
  showCloseButton?: boolean;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ className, side = "right", showCloseButton = true, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(sheetContentVariants({ side }), className)}
      {...props}
    >
      {children}
      {showCloseButton ? (
        <DialogPrimitive.Close
          aria-label="Close sheet"
          className={cn(
            "zen-absolute zen-top-3 zen-right-3 zen-inline-flex zen-items-center zen-justify-center",
            "zen-h-7 zen-w-7 zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer",
            "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          )}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </DialogPrimitive.Close>
      ) : null}
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("zen-flex zen-flex-col zen-gap-1.5", className)}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "zen-mt-auto zen-flex zen-flex-col-reverse zen-gap-2 sm:zen-flex-row sm:zen-justify-end",
      className,
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "zen-text-base zen-font-semibold zen-leading-tight zen-text-zen-foreground zen-m-0",
      className,
    )}
    {...props}
  />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("zen-text-sm zen-text-zen-muted-fg zen-m-0", className)}
    {...props}
  />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  sheetContentVariants,
};
