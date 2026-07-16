import { type JSX, type ValidComponent, splitProps, mergeProps, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "@algorisys/zen-ui-core/variants";
import { cn } from "../../lib/cn";
import type { PolymorphicProps } from "../../lib/polymorphic";

/**
 * Button — shadcn-style primitive ported to Solid.
 *
 * Design notes:
 *  - Polymorphic via `as` (Solid's equivalent of Radix `asChild`). Default
 *    renders <button>; pass `as={A}` from @solidjs/router to render an
 *    <a>-flavoured link with identical styling. Anchor-specific props
 *    (`href`, `target`, …) typecheck when `as="a"` thanks to the
 *    PolymorphicProps helper.
 *  - Variants come from class-variance-authority — same package the
 *    React binding uses — so styling stays byte-identical.
 *  - Variant colours resolve through UnoCSS theme aliases (`zen-*`) that
 *    point at the `--zen-*` CSS custom properties in
 *    @algorisys/zen-ui-core/tokens.css.
 *  - No business logic (no HTTP, no form-field side effects). Use `onClick`.
 */


type ButtonOwnProps = VariantProps<typeof buttonVariants> & {
  loading?: boolean;
  iconLeft?: JSX.Element;
  iconRight?: JSX.Element;
  class?: string;
  children?: JSX.Element;
};

export type ButtonProps<T extends ValidComponent = "button"> = PolymorphicProps<
  T,
  ButtonOwnProps
>;

const Spinner = () => (
  <svg
    class="zen-animate-spin zen-h-4 zen-w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle class="zen-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
    <path class="zen-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

export const Button = <T extends ValidComponent = "button">(
  rawProps: ButtonProps<T>,
) => {
  const props = mergeProps({ as: "button" as ValidComponent, loading: false }, rawProps);
  const [local, rest] = splitProps(props as ButtonProps<"button"> & { as: ValidComponent }, [
    "as",
    "class",
    "variant",
    "color",
    "size",
    "shape",
    "multiline",
    "loading",
    "disabled",
    "iconLeft",
    "iconRight",
    "children",
    "type",
  ]);
  const isDisabled = () => local.disabled || local.loading;

  return (
    <Dynamic
      component={local.as}
      class={cn(
        buttonVariants({
          variant: local.variant,
          color: local.color,
          size: local.size,
          shape: local.shape,
          multiline: local.multiline,
        }),
        local.class,
      )}
      type={local.as === "button" ? (local.type ?? "button") : local.type}
      disabled={isDisabled() || undefined}
      aria-busy={local.loading || undefined}
      data-loading={local.loading || undefined}
      {...rest}
    >
      <Show when={local.loading} fallback={local.iconLeft}>
        <Spinner />
      </Show>
      {local.children}
      <Show when={!local.loading}>{local.iconRight}</Show>
    </Dynamic>
  );
};

export { buttonVariants };
