import { type JSX, splitProps } from "solid-js";
import * as KDialog from "@kobalte/core/dialog";
import { cn } from "../../lib/cn";

/**
 * Dialog — Solid port of the modal overlay primitive, built on
 * Kobalte Dialog.
 *
 *   <Dialog>
 *     <DialogTrigger as={Button}>Open</DialogTrigger>
 *     <DialogContent>
 *       <DialogHeader>
 *         <DialogTitle>Confirm delete</DialogTitle>
 *         <DialogDescription>This cannot be undone.</DialogDescription>
 *       </DialogHeader>
 *       <DialogFooter>
 *         <DialogClose as={Button} variant="ghost">Cancel</DialogClose>
 *         <Button color="error" onClick={onConfirm}>Delete</Button>
 *       </DialogFooter>
 *     </DialogContent>
 *   </Dialog>
 *
 * Kobalte supplies focus trap, scroll lock, Esc-to-close, click-outside
 * dismissal, portal rendering, and a11y. For confirm-style dialogs that
 * should block all dismissal until the user answers, use AlertDialog.
 *
 * Imported as a module namespace rather than via Kobalte's `Dialog` object:
 * both `dialog` and `alert-dialog` build their namespace with
 * `Object.assign(DialogRoot, …)` on the SAME root function, so importing both
 * in one bundle leaves `Dialog === AlertDialog` and whichever module evaluates
 * last owns `.Content`. That silently gave every plain Dialog here
 * role="alertdialog". The `Root`/`Content` named exports are per-module and
 * unaffected. (Kobalte 0.13.11 — re-check on upgrade.)
 */

export const Dialog = KDialog.Root;
export const DialogTrigger = KDialog.Trigger;
export const DialogPortal = KDialog.Portal;
export const DialogClose = KDialog.CloseButton;

export type DialogOverlayProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const DialogOverlay = (props: DialogOverlayProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <KDialog.Overlay
      {...rest}
      class={cn("zen-fixed zen-inset-0 zen-z-50 zen-bg-black/50", local.class)}
    >
      {local.children}
    </KDialog.Overlay>
  );
};

export type DialogContentProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
  /** Render the ✕ close affordance in the top-right corner. Default true. */
  showCloseButton?: boolean;
};

export const DialogContent = (props: DialogContentProps) => {
  const [local, rest] = splitProps(props, ["class", "children", "showCloseButton"]);
  const showClose = () => local.showCloseButton ?? true;
  return (
    <KDialog.Portal>
      <DialogOverlay />
      <KDialog.Content
        {...rest}
        class={cn(
          "zen-fixed zen-left-1/2 zen-top-1/2 zen-z-50 -zen-translate-x-1/2 -zen-translate-y-1/2",
          "zen-w-full zen-max-w-lg zen-max-h-[85vh] zen-overflow-y-auto",
          "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-p-6 zen-shadow-zen-lg",
          "focus:zen-outline-none",
          local.class,
        )}
      >
        {local.children}
        {showClose() ? (
          <KDialog.CloseButton
            aria-label="Close"
            class={cn(
              "zen-absolute zen-right-3 zen-top-3 zen-h-7 zen-w-7 zen-inline-flex zen-items-center zen-justify-center",
              "zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-zen-muted-fg",
              "hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            )}
          >
            <XIcon />
          </KDialog.CloseButton>
        ) : null}
      </KDialog.Content>
    </KDialog.Portal>
  );
};

export type DialogHeaderProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const DialogHeader = (props: DialogHeaderProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      {...rest}
      class={cn("zen-flex zen-flex-col zen-gap-1 zen-text-left zen-mb-3 zen-pr-8", local.class)}
    >
      {local.children}
    </div>
  );
};

export type DialogFooterProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const DialogFooter = (props: DialogFooterProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      {...rest}
      class={cn(
        "zen-flex zen-flex-col-reverse sm:zen-flex-row sm:zen-justify-end zen-gap-2 zen-mt-5",
        local.class,
      )}
    >
      {local.children}
    </div>
  );
};

// Kobalte's Title defaults to <h2>.
export type DialogTitleProps = Omit<
  JSX.HTMLAttributes<HTMLHeadingElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const DialogTitle = (props: DialogTitleProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <KDialog.Title
      {...rest}
      class={cn(
        "zen-text-lg zen-font-semibold zen-leading-tight zen-text-zen-foreground",
        local.class,
      )}
    >
      {local.children}
    </KDialog.Title>
  );
};

// Kobalte's Description defaults to <p>.
export type DialogDescriptionProps = Omit<
  JSX.HTMLAttributes<HTMLParagraphElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const DialogDescription = (props: DialogDescriptionProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <KDialog.Description
      {...rest}
      class={cn("zen-text-sm zen-text-zen-muted-fg zen-leading-snug", local.class)}
    >
      {local.children}
    </KDialog.Description>
  );
};

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
