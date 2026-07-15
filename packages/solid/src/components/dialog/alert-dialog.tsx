import { type JSX, splitProps } from "solid-js";
import * as KAlertDialog from "@kobalte/core/alert-dialog";
import { cn } from "../../lib/cn";

/**
 * AlertDialog — destructive-confirm modal built on Kobalte AlertDialog.
 *
 *   <AlertDialog>
 *     <AlertDialogTrigger as={Button} color="error">Delete</AlertDialogTrigger>
 *     <AlertDialogContent>
 *       <AlertDialogHeader>
 *         <AlertDialogTitle>Delete account?</AlertDialogTitle>
 *         <AlertDialogDescription>Removes all data permanently.</AlertDialogDescription>
 *       </AlertDialogHeader>
 *       <AlertDialogFooter>
 *         <AlertDialogCancel as={Button} variant="ghost">Cancel</AlertDialogCancel>
 *         <Button color="error" onClick={onConfirm}>Delete</Button>
 *       </AlertDialogFooter>
 *     </AlertDialogContent>
 *   </AlertDialog>
 *
 * Differs from Dialog: click-outside is blocked. Escape still closes
 * for keyboard a11y. role="alertdialog" announces immediately.
 *
 * API delta from React binding: Kobalte unifies AlertDialog.Action and
 * AlertDialog.Cancel under CloseButton — use the Action label visually
 * but wire the destructive callback via your own onClick (the Cancel
 * affordance is what we expose as <AlertDialogCancel>).
 *
 * Namespace-imported for the same reason as [dialog.tsx]: Kobalte's `Dialog`
 * and `AlertDialog` objects are one and the same (both `Object.assign` the
 * shared root), so reaching `.Content` through them is load-order roulette.
 */

export const AlertDialog = KAlertDialog.Root;
export const AlertDialogTrigger = KAlertDialog.Trigger;
export const AlertDialogPortal = KAlertDialog.Portal;
export const AlertDialogCancel = KAlertDialog.CloseButton;
export const AlertDialogAction = KAlertDialog.CloseButton;

export type AlertDialogOverlayProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const AlertDialogOverlay = (props: AlertDialogOverlayProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <KAlertDialog.Overlay
      {...rest}
      class={cn("zen-fixed zen-inset-0 zen-z-50 zen-bg-black/50", local.class)}
    >
      {local.children}
    </KAlertDialog.Overlay>
  );
};

export type AlertDialogContentProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const AlertDialogContent = (props: AlertDialogContentProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <KAlertDialog.Portal>
      <AlertDialogOverlay />
      <KAlertDialog.Content
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
      </KAlertDialog.Content>
    </KAlertDialog.Portal>
  );
};

export type AlertDialogHeaderProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const AlertDialogHeader = (props: AlertDialogHeaderProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div {...rest} class={cn("zen-flex zen-flex-col zen-gap-1 zen-text-left zen-mb-3", local.class)}>
      {local.children}
    </div>
  );
};

export type AlertDialogFooterProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const AlertDialogFooter = (props: AlertDialogFooterProps) => {
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
export type AlertDialogTitleProps = Omit<
  JSX.HTMLAttributes<HTMLHeadingElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const AlertDialogTitle = (props: AlertDialogTitleProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <KAlertDialog.Title
      {...rest}
      class={cn(
        "zen-text-lg zen-font-semibold zen-leading-tight zen-text-zen-foreground",
        local.class,
      )}
    >
      {local.children}
    </KAlertDialog.Title>
  );
};

// Kobalte's Description defaults to <p>.
export type AlertDialogDescriptionProps = Omit<
  JSX.HTMLAttributes<HTMLParagraphElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const AlertDialogDescription = (props: AlertDialogDescriptionProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <KAlertDialog.Description
      {...rest}
      class={cn("zen-text-sm zen-text-zen-muted-fg zen-leading-snug", local.class)}
    >
      {local.children}
    </KAlertDialog.Description>
  );
};
