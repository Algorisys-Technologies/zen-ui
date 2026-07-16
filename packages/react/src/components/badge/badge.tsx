import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";
import { badgeVariants } from "@algorisys/zen-ui-core/variants";
import { cn } from "../../lib/cn";

/**
 * Badge — shadcn-style. Not built on a Radix primitive (Radix has no Badge);
 * it's a styled span with CVA variants. Supports `asChild` so it can render
 * as an <a>, NavLink, etc. for clickable status pills.
 */


export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, color, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "span";
    return (
      <Comp
        ref={ref}
        className={cn(badgeVariants({ variant, color, className }))}
        {...props}
      />
    );
  },
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
