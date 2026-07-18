import { splitProps, mergeProps } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { Button, type ButtonProps } from "../button/button";

/**
 * FAB — fixed-position floating action button. Wraps the Button primitive
 * with positioning + elevation. No Kobalte primitive needed; shadcn's
 * pattern is the same — a styled positioned button.
 *
 *   <FAB onClick={...} iconLeft={<PlusIcon/>} />
 *   <FAB position="bottom-left" color="error" iconLeft={<TrashIcon/>} />
 *
 * For multi-action speed-dial menus, compose FAB inside Kobalte's
 * DropdownMenu trigger — Solid's `as` prop makes this clean.
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

export type FABProps = Omit<ButtonProps, "shape" | "size"> &
  VariantProps<typeof fabContainer> & {
    size?: "md" | "lg" | "xl";
  };

const SHAPE_BY_SIZE: Record<NonNullable<FABProps["size"]>, string> = {
  md: "zen-h-12 zen-w-12",
  lg: "zen-h-14 zen-w-14",
  xl: "zen-h-16 zen-w-16",
};

export const FAB = (rawProps: FABProps) => {
  const props = mergeProps({ size: "lg" as const, color: "primary" as const }, rawProps);
  const [local, rest] = splitProps(props, ["position", "size", "class", "color"]);
  return (
    <div class={cn(fabContainer({ position: local.position }))}>
      <Button
        color={local.color}
        shape="circle"
        class={cn("zen-shadow-md hover:zen-shadow-lg", SHAPE_BY_SIZE[local.size], local.class)}
        {...rest}
      />
    </div>
  );
};
