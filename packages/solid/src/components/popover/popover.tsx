import { type JSX, splitProps } from "solid-js";
import { Popover as KPopover } from "@kobalte/core/popover";
import { cn } from "../../lib/cn";

/**
 * Popover — Solid port built on Kobalte Popover.
 *
 *   <Popover>
 *     <PopoverTrigger as={Button}>Open</PopoverTrigger>
 *     <PopoverContent>…</PopoverContent>
 *   </Popover>
 *
 * Kobalte supplies positioning (via @floating-ui), collision detection,
 * focus trap, click-outside dismissal, Escape-to-close, and ARIA.
 */

export const Popover = KPopover;
export const PopoverTrigger = KPopover.Trigger;
export const PopoverAnchor = KPopover.Anchor;
export const PopoverClose = KPopover.CloseButton;
export const PopoverPortal = KPopover.Portal;

/**
 * Everything except `class`/`children` is forwarded to Kobalte's Content, which
 * mirrors the React binding. It previously accepted only those two props and
 * silently dropped the rest, so `style` never reached the DOM — NotificationsInbox
 * could not widen the panel past the default `w-72` and its content was clipped.
 */
export type PopoverContentProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const PopoverContent = (props: PopoverContentProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <KPopover.Portal>
      <KPopover.Content
        {...rest}
        class={cn(
          "zen-z-50 zen-w-72 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-4 zen-text-zen-foreground zen-shadow-md zen-outline-none",
          local.class,
        )}
      >
        {local.children}
      </KPopover.Content>
    </KPopover.Portal>
  );
};
