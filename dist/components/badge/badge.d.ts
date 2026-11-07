import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { badgeVariants } from "../../_core/variants";
/**
 * Badge — shadcn-style. Not built on a Radix primitive (Radix has no Badge);
 * it's a styled span with CVA variants. Supports `asChild` so it can render
 * as an <a>, NavLink, etc. for clickable status pills.
 */
export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">, VariantProps<typeof badgeVariants> {
    asChild?: boolean;
}
declare const Badge: React.ForwardRefExoticComponent<BadgeProps & React.RefAttributes<HTMLSpanElement>>;
export { Badge, badgeVariants };
//# sourceMappingURL=badge.d.ts.map