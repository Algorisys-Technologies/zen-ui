import { type JSX, type ValidComponent, splitProps, mergeProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { type VariantProps } from "class-variance-authority";
import { badgeVariants } from "@algorisys/zen-ui-core/variants";
import { cn } from "../../lib/cn";
import type { PolymorphicProps } from "../../lib/polymorphic";

/**
 * Badge — shadcn-style status pill. Polymorphic via `as` so it can
 * render as <a>, <A> from @solidjs/router, etc. for clickable pills.
 */


type BadgeOwnProps = VariantProps<typeof badgeVariants> & {
  class?: string;
  children?: JSX.Element;
};

export type BadgeProps<T extends ValidComponent = "span"> = PolymorphicProps<
  T,
  BadgeOwnProps
>;

export const Badge = <T extends ValidComponent = "span">(rawProps: BadgeProps<T>) => {
  const props = mergeProps({ as: "span" as ValidComponent }, rawProps);
  const [local, rest] = splitProps(props as BadgeProps<"span"> & { as: ValidComponent }, [
    "as",
    "class",
    "variant",
    "color",
    "children",
  ]);
  return (
    <Dynamic
      component={local.as}
      class={cn(
        badgeVariants({ variant: local.variant, color: local.color }),
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </Dynamic>
  );
};

export { badgeVariants };
