import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "../../lib/cn";

/**
 * Separator (formerly "Divider") — built on @radix-ui/react-separator.
 *
 * Horizontal or vertical line that semantically separates content.
 * Decorative by default (decorative=true) so screen readers skip it; pass
 * decorative={false} when the separation is meaningful for assistive tech.
 */

export type SeparatorProps = React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>;

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref,
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "zen-shrink-0 zen-bg-zen-border",
        orientation === "horizontal" ? "zen-h-px zen-w-full" : "zen-h-full zen-w-px",
        className,
      )}
      {...props}
    />
  ),
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
