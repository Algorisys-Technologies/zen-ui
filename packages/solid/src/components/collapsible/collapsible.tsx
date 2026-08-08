import { type JSX, splitProps } from "solid-js";
import { Collapsible as KCollapsible } from "@kobalte/core/collapsible";
import { cn } from "../../lib/cn";

/**
 * Collapsible — one region that shows and hides. Solid port built on Kobalte
 * Collapsible.
 *
 *   <Collapsible defaultOpen>
 *     <CollapsibleTrigger>Advanced settings</CollapsibleTrigger>
 *     <CollapsibleContent>…</CollapsibleContent>
 *   </Collapsible>
 *
 * Accordion is the component for a SET of sections that coordinate (one open
 * at a time, or several). Collapsible is the single independent disclosure —
 * a "show more" on a card, an advanced-options block. Reaching for a
 * single-item Accordion instead brings a value prop, a heading and an item
 * wrapper for a region that has no siblings to coordinate with.
 *
 * The trigger renders unstyled by default: the disclosure surface is usually
 * the caller's own row or heading, not a button we should paint. It still gets
 * the button reset, the focus ring and the cursor.
 */

export type CollapsibleProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  class?: string;
  children?: JSX.Element;
};

export const Collapsible = (props: CollapsibleProps) => {
  const [local, rest] = splitProps(props, [
    "open",
    "defaultOpen",
    "onOpenChange",
    "disabled",
    "class",
    "children",
  ]);
  return (
    <KCollapsible
      {...rest}
      open={local.open}
      defaultOpen={local.defaultOpen}
      onOpenChange={local.onOpenChange}
      disabled={local.disabled}
      class={local.class}
    >
      {local.children}
    </KCollapsible>
  );
};

// Kobalte's Trigger renders a <button>.
export type CollapsibleTriggerProps = Omit<
  JSX.HTMLAttributes<HTMLButtonElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const CollapsibleTrigger = (props: CollapsibleTriggerProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <KCollapsible.Trigger
      {...rest}
      class={cn(
        "zen-bg-transparent zen-border-0 zen-p-0 zen-text-inherit zen-cursor-pointer",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2 zen-rounded-zen-sm",
        local.class,
      )}
    >
      {local.children}
    </KCollapsible.Trigger>
  );
};

// Kobalte's Content renders a <div>. The height keyframes read the neutral
// --zen-collapsible-content-height; Kobalte publishes the measurement under
// its own name, so this maps one onto the other exactly as Accordion does.
export type CollapsibleContentProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const CollapsibleContent = (props: CollapsibleContentProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <KCollapsible.Content
      {...rest}
      style={{
        "--zen-collapsible-content-height": "var(--kb-collapsible-content-height)",
      }}
      class={cn(
        "zen-overflow-hidden zen-text-sm",
        "data-[closed]:zen-anim-accordion-up data-[expanded]:zen-anim-accordion-down",
        local.class,
      )}
    >
      {local.children}
    </KCollapsible.Content>
  );
};
