import { type JSX, splitProps } from "solid-js";
import { Dialog as KDialog } from "@kobalte/core/dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/**
 * Sheet — slide-in side panel built on Kobalte Dialog. Use when a Dialog
 * is too modal: long-form filter panels, edit screens that need the
 * underlying list visible, KYC document review, help / onboarding tour.
 *
 *   <Sheet>
 *     <SheetTrigger as={Button}>Filters</SheetTrigger>
 *     <SheetContent side="right">
 *       <SheetHeader>
 *         <SheetTitle>Filters</SheetTitle>
 *         <SheetDescription>Narrow the dashboard.</SheetDescription>
 *       </SheetHeader>
 *       …
 *       <SheetFooter>
 *         <Button>Apply</Button>
 *         <SheetClose as={Button} variant="outline">Cancel</SheetClose>
 *       </SheetFooter>
 *     </SheetContent>
 *   </Sheet>
 */

export const Sheet = KDialog;
export const SheetTrigger = KDialog.Trigger;
export const SheetClose = KDialog.CloseButton;
export const SheetPortal = KDialog.Portal;

export type SheetOverlayProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const SheetOverlay = (props: SheetOverlayProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <KDialog.Overlay
      {...rest}
      class={cn(
        "zen-fixed zen-inset-0 zen-z-50 zen-bg-black/40",
        "data-[expanded]:zen-anim-fade-in",
        "data-[closed]:zen-anim-fade-out",
        local.class,
      )}
    >
      {local.children}
    </KDialog.Overlay>
  );
};

const sheetContentVariants = cva(
  [
    "zen-fixed zen-z-50 zen-flex zen-flex-col zen-gap-4 zen-bg-zen-background zen-p-6 zen-shadow-zen-lg",
    "zen-transition zen-ease-in-out",
    "focus-visible:zen-outline-none",
  ].join(" "),
  {
    variants: {
      side: {
        right: [
          "zen-inset-y-0 zen-right-0 zen-h-full zen-w-3/4 zen-max-w-md zen-border-l zen-border-zen-border",
          "data-[expanded]:zen-anim-slide-in-right",
          "data-[closed]:zen-anim-slide-out-right",
        ].join(" "),
        left: [
          "zen-inset-y-0 zen-left-0 zen-h-full zen-w-3/4 zen-max-w-md zen-border-r zen-border-zen-border",
          "data-[expanded]:zen-anim-slide-in-left",
          "data-[closed]:zen-anim-slide-out-left",
        ].join(" "),
        top: [
          "zen-inset-x-0 zen-top-0 zen-w-full zen-max-h-[80vh] zen-border-b zen-border-zen-border",
          "data-[expanded]:zen-anim-slide-in-top",
          "data-[closed]:zen-anim-slide-out-top",
        ].join(" "),
        bottom: [
          "zen-inset-x-0 zen-bottom-0 zen-w-full zen-max-h-[80vh] zen-border-t zen-border-zen-border",
          "zen-rounded-t-zen-lg",
          "data-[expanded]:zen-anim-slide-in-bottom",
          "data-[closed]:zen-anim-slide-out-bottom",
        ].join(" "),
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

export type SheetContentProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> &
  VariantProps<typeof sheetContentVariants> & {
    class?: string;
    children?: JSX.Element;
    /** Show a built-in close ✕ in the top-right. Default true. */
    showCloseButton?: boolean;
  };

export const SheetContent = (props: SheetContentProps) => {
  const [local, rest] = splitProps(props, ["class", "side", "showCloseButton", "children"]);
  const showClose = () => local.showCloseButton ?? true;
  return (
    <KDialog.Portal>
      <SheetOverlay />
      <KDialog.Content
        {...rest}
        class={cn(sheetContentVariants({ side: local.side }), local.class)}
      >
        {local.children}
        {showClose() ? (
          <KDialog.CloseButton
            aria-label="Close sheet"
            class={cn(
              "zen-absolute zen-top-3 zen-right-3 zen-inline-flex zen-items-center zen-justify-center",
              "zen-h-7 zen-w-7 zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer",
              "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </KDialog.CloseButton>
        ) : null}
      </KDialog.Content>
    </KDialog.Portal>
  );
};

export type SheetHeaderProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const SheetHeader = (props: SheetHeaderProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div {...rest} class={cn("zen-flex zen-flex-col zen-gap-1.5", local.class)}>
      {local.children}
    </div>
  );
};

export type SheetFooterProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const SheetFooter = (props: SheetFooterProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      {...rest}
      class={cn(
        "zen-mt-auto zen-flex zen-flex-col-reverse zen-gap-2 sm:zen-flex-row sm:zen-justify-end",
        local.class,
      )}
    >
      {local.children}
    </div>
  );
};

// Kobalte's Title defaults to <h2>.
export type SheetTitleProps = Omit<
  JSX.HTMLAttributes<HTMLHeadingElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const SheetTitle = (props: SheetTitleProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <KDialog.Title
      {...rest}
      class={cn(
        "zen-text-base zen-font-semibold zen-leading-tight zen-text-zen-foreground zen-m-0",
        local.class,
      )}
    >
      {local.children}
    </KDialog.Title>
  );
};

// Kobalte's Description defaults to <p>.
export type SheetDescriptionProps = Omit<
  JSX.HTMLAttributes<HTMLParagraphElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const SheetDescription = (props: SheetDescriptionProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <KDialog.Description {...rest} class={cn("zen-text-sm zen-text-zen-muted-fg zen-m-0", local.class)}>
      {local.children}
    </KDialog.Description>
  );
};

export { sheetContentVariants };
