import { type JSX, splitProps, mergeProps } from "solid-js";
import { cn } from "../../lib/cn";

/**
 * Separator — horizontal or vertical line that semantically separates
 * content. Decorative by default (screen readers skip it); pass
 * decorative={false} when the separation is meaningful for assistive tech.
 *
 * Implemented inline (one styled <div>) rather than via Kobalte, since
 * the markup is trivial and avoids pulling in a primitive for one
 * element.
 */

export type SeparatorProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "role"> & {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
  class?: string;
};

export const Separator = (rawProps: SeparatorProps) => {
  const props = mergeProps(
    { orientation: "horizontal" as const, decorative: true },
    rawProps,
  );
  const [local, rest] = splitProps(props, ["orientation", "decorative", "class"]);
  return (
    <div
      role={local.decorative ? "none" : "separator"}
      aria-orientation={
        local.decorative ? undefined : local.orientation
      }
      data-orientation={local.orientation}
      class={cn(
        "zen-shrink-0 zen-bg-zen-border",
        local.orientation === "horizontal" ? "zen-h-px zen-w-full" : "zen-h-full zen-w-px",
        local.class,
      )}
      {...rest}
    />
  );
};
