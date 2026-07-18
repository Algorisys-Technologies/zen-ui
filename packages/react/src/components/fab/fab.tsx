import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { Button, type ButtonProps } from "../button/button";

/**
 * FAB — fixed-position floating action button. Wraps the new Button with
 * positioning + elevation. No Radix primitive needed (none exists);
 * shadcn's pattern is the same — a styled positioned button.
 *
 *   <FAB onClick={...} iconLeft={<PlusIcon/>} />
 *   <FAB position="bottom-left" color="error" iconLeft={<TrashIcon/>} />
 *
 * For multi-action speed-dial menus, compose FAB with DropdownMenu —
 * <DropdownMenu><DropdownMenuTrigger asChild><FAB/></...>.
 */

const fabContainer = cva("zen-fixed zen-z-40", {
  variants: {
    position: {
      "bottom-right": "zen-bottom-6 zen-right-6",
      "bottom-left": "zen-bottom-6 zen-left-6",
      "top-right": "zen-top-6 zen-right-6",
      "top-left": "zen-top-6 zen-left-6",
    },
  },
  defaultVariants: {
    position: "bottom-right",
  },
});

export interface FABProps
  extends Omit<ButtonProps, "shape" | "size">,
    VariantProps<typeof fabContainer> {
  size?: "md" | "lg" | "xl";
}

const SHAPE_BY_SIZE: Record<NonNullable<FABProps["size"]>, string> = {
  md: "zen-h-12 zen-w-12",
  lg: "zen-h-14 zen-w-14",
  xl: "zen-h-16 zen-w-16",
};

const FAB = React.forwardRef<HTMLButtonElement, FABProps>(
  ({ position, size = "lg", className, color = "primary", ...props }, ref) => (
    <div className={cn(fabContainer({ position }))}>
      <Button
        ref={ref}
        color={color}
        shape="circle"
        className={cn(
          "zen-shadow-md hover:zen-shadow-lg",
          SHAPE_BY_SIZE[size],
          className,
        )}
        {...props}
      />
    </div>
  ),
);
FAB.displayName = "FAB";

export { FAB };
