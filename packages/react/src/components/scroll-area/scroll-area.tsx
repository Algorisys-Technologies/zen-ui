import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "../../lib/cn";

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

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("zen-relative zen-overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="zen-h-full zen-w-full zen-rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "zen-flex zen-touch-none zen-select-none zen-transition-colors",
      orientation === "vertical" && "zen-h-full zen-w-2.5 zen-border-l zen-border-l-transparent zen-p-px",
      orientation === "horizontal" && "zen-h-2.5 zen-flex-col zen-border-t zen-border-t-transparent zen-p-px",
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="zen-relative zen-flex-1 zen-rounded-zen-full zen-bg-zen-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
