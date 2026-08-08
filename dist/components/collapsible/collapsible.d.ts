import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
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
declare const Collapsible: React.ForwardRefExoticComponent<CollapsiblePrimitive.CollapsibleProps & React.RefAttributes<HTMLDivElement>>;
declare const CollapsibleTrigger: React.ForwardRefExoticComponent<Omit<CollapsiblePrimitive.CollapsibleTriggerProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
declare const CollapsibleContent: React.ForwardRefExoticComponent<Omit<CollapsiblePrimitive.CollapsibleContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { Collapsible, CollapsibleTrigger, CollapsibleContent };
//# sourceMappingURL=collapsible.d.ts.map