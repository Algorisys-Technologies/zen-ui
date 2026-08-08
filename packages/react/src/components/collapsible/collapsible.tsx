import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { cn } from "../../lib/cn";

/**
 * Collapsible — one region that shows and hides. Radix-backed.
 *
 *   <Collapsible defaultOpen>
 *     <CollapsibleTrigger>Advanced settings</CollapsibleTrigger>
 *     <CollapsibleContent>…</CollapsibleContent>
 *   </Collapsible>
 *
 * Accordion is the component for a SET of sections that coordinate (one open at
 * a time, or several). Collapsible is the single independent disclosure — a
 * "show more" on a card, an advanced-options block. Reaching for a single-item
 * Accordion instead brings a value prop, a heading and an item wrapper for a
 * region that has no siblings to coordinate with.
 *
 * The trigger renders unstyled by default: the disclosure surface is usually
 * the caller's own row or heading, not a button we should paint. It still gets
 * the button reset, the focus ring and the cursor.
 */

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Trigger
    ref={ref}
    className={cn(
      "zen-bg-transparent zen-border-0 zen-p-0 zen-text-inherit zen-cursor-pointer",
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2 zen-rounded-zen-sm",
      className,
    )}
    {...props}
  />
));
CollapsibleTrigger.displayName = CollapsiblePrimitive.Trigger.displayName;

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, style, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    /* The shared keyframes interpolate height to the neutral
     * --zen-collapsible-content-height; Radix publishes the measurement under
     * its own name. `style` spreads after so a caller can still override. */
    style={
      {
        "--zen-collapsible-content-height": "var(--radix-collapsible-content-height)",
        ...style,
      } as React.CSSProperties
    }
    className={cn(
      "zen-overflow-hidden zen-text-sm",
      "data-[state=closed]:zen-anim-accordion-up data-[state=open]:zen-anim-accordion-down",
      className,
    )}
    {...props}
  />
));
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
