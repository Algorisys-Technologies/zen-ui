import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
/**
 * ScrollArea — built on @radix-ui/react-scroll-area.
 *
 *   <ScrollArea className="h-72 w-48 rounded-zen-md border border-zen-border">
 *     {tonsOfContent}
 *   </ScrollArea>
 *
 * Radix renders custom scrollbars while preserving native scrolling (mouse,
 * touch, keyboard, screen readers). Use ScrollBar to control orientation
 * (auto-mounted for "vertical"; pass orientation="horizontal" for X-scroll).
 */
declare const ScrollArea: React.ForwardRefExoticComponent<Omit<ScrollAreaPrimitive.ScrollAreaProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
declare const ScrollBar: React.ForwardRefExoticComponent<Omit<ScrollAreaPrimitive.ScrollAreaScrollbarProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { ScrollArea, ScrollBar };
//# sourceMappingURL=scroll-area.d.ts.map