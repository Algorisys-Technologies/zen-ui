import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../../lib/cn";

/**
 * Dialog — modal overlay on @radix-ui/react-dialog.
 *
 *   <Dialog>
 *     <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
 *     <DialogContent>
 *       <DialogHeader>
 *         <DialogTitle>Confirm delete</DialogTitle>
 *         <DialogDescription>This cannot be undone.</DialogDescription>
 *       </DialogHeader>
 *       <DialogFooter>
 *         <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
 *         <Button color="error" onClick={onConfirm}>Delete</Button>
 *       </DialogFooter>
 *     </DialogContent>
 *   </Dialog>
 *
 * Radix supplies focus trap, scroll lock, Esc-to-close, click-outside
 * dismissal, portal rendering, and a11y (aria-modal, labelled/described
 * via the Title + Description).
 *
 * For confirm-style dialogs that should block all dismissal until the
 * user answers (no Esc, no click-outside), use <AlertDialog> from
 * ./alert-dialog.tsx instead.
 */

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("zen-fixed zen-inset-0 zen-z-50 zen-bg-black/50", className)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /**
   * `paper` turns the panel into a document sheet — see <Paper>. Default
   * `default`, so existing dialogs are byte-identical.
   *
   * It is not a restyle, and that is why it is a variant rather than a class
   * you could pass yourself. A document is TOP-ANCHORED: centring a long sheet
   * vertically and then scrolling it inside 85vh puts the first line somewhere
   * different on every screen, and the reader's eye has nowhere to rest. Paper
   * mode drops the vertical centring, scrolls the VIEWPORT rather than the
   * panel, and widens the cap so the measure has room to do its work.
   */
  variant?: "default" | "paper";
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, variant = "default", ...props }, ref) => {
  const paper = variant === "paper";
  const content = (
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "zen-z-50 focus:zen-outline-none",
        paper
          ? [
              /* Relative inside the scroll container, so it flows with the
                 scroll rather than being pinned to the viewport. `mx-auto`
                 centres it horizontally and `my-` is the sheet's margin on the
                 desk — which is also what makes the bottom edge visible when
                 you reach the end, instead of the document being clipped
                 against the viewport. */
              "zen-relative zen-mx-auto zen-my-12 zen-w-full zen-max-w-3xl",
              "zen-rounded-zen-sm zen-bg-zen-background zen-text-zen-foreground zen-p-12 zen-shadow-zen-xl",
            ]
          : [
              "zen-fixed zen-left-1/2 zen-top-1/2 -zen-translate-x-1/2 -zen-translate-y-1/2",
              "zen-w-full zen-max-w-lg zen-max-h-[85vh] zen-overflow-y-auto",
              // A surface that paints its own background MUST paint its own
              // foreground. This is portalled to <body>, so "inherit" means the
              // consumer's body colour, not the app's — with a dark theme the
              // panel went dark and the text stayed black, at about 1.2:1. The
              // token was right the whole time; nothing read it.
              "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-p-6 zen-shadow-zen-lg",
            ],
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        aria-label="Close"
        className={cn(
          "zen-absolute zen-end-3 zen-top-3 zen-h-7 zen-w-7 zen-inline-flex zen-items-center zen-justify-center",
          "zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-zen-muted-fg",
          "hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        )}
      >
        <XIcon />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  );

  return (
    <DialogPortal>
      <DialogOverlay />
      {/*
       * Paper mode needs a scroll CONTAINER, and it has to be a real element
       * rather than `overflow-y-auto` on the overlay: Radix, like Kobalte,
       * renders Overlay and Content as SIBLINGS, so the panel is not inside the
       * overlay and scrolling it does nothing. Measured in the Solid binding
       * before this wrapper existed — the panel had no scrollable ancestor at
       * all, so a document taller than the viewport hung off the bottom,
       * unreachable. The default branch keeps its own `max-h-[85vh]
       * overflow-y-auto` and needs no wrapper.
       */}
      {paper ? (
        <div className="zen-fixed zen-inset-0 zen-z-50 zen-overflow-y-auto">{content}</div>
      ) : (
        content
      )}
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("zen-flex zen-flex-col zen-gap-1 zen-text-start zen-mb-3 zen-pe-8", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "zen-flex zen-flex-col-reverse sm:zen-flex-row sm:zen-justify-end zen-gap-2 zen-mt-5",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "zen-text-lg zen-font-semibold zen-leading-tight zen-text-zen-foreground",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("zen-text-sm zen-text-zen-muted-fg zen-leading-snug", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
