import { type JSX, splitProps, mergeProps, Show } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/**
 * Loading — animated spinner. No Kobalte primitive (none exists); same
 * pattern as shadcn — a plain SVG with `animate-spin`.
 *
 *   <Loading />                 // sr-only label, defaults to md primary
 *   <Loading size="xl" label="Submitting…" />
 *
 * `label` becomes accessible text for screen readers. Pass `label=""` to
 * keep the loader purely decorative; the surrounding context should then
 * carry the loading semantics (e.g. `aria-busy` on the parent button).
 */

const spinnerVariants = cva("zen-animate-spin", {
  variants: {
    size: {
      sm: "zen-h-3 zen-w-3",
      md: "zen-h-4 zen-w-4",
      lg: "zen-h-6 zen-w-6",
      xl: "zen-h-10 zen-w-10",
    },
    color: {
      primary: "zen-text-zen-primary",
      neutral: "zen-text-zen-foreground",
      info: "zen-text-zen-info",
      success: "zen-text-zen-success",
      warning: "zen-text-zen-warning",
      error: "zen-text-zen-error",
      current: "zen-text-current",
    },
  },
  defaultVariants: {
    size: "md",
    color: "primary",
  },
});

export type LoadingProps = VariantProps<typeof spinnerVariants> &
  Omit<JSX.SvgSVGAttributes<SVGSVGElement>, "color" | "class"> & {
    /** Accessible label (visually hidden). Default "Loading". Pass "" to mark decorative. */
    label?: string;
    class?: string;
  };

export const Loading = (rawProps: LoadingProps) => {
  const props = mergeProps({ label: "Loading" }, rawProps);
  const [local, rest] = splitProps(props, ["class", "size", "color", "label"]);
  return (
    <span style={{ display: "inline-flex", "align-items": "center", gap: "6px" }}>
      <svg
        role={local.label ? "status" : "presentation"}
        aria-label={local.label || undefined}
        aria-hidden={local.label ? undefined : true}
        viewBox="0 0 24 24"
        fill="none"
        class={cn(spinnerVariants({ size: local.size, color: local.color }), local.class)}
        {...rest}
      >
        <circle class="zen-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="zen-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <Show when={local.label}>
        <span
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0,0,0,0)",
            "white-space": "nowrap",
            border: 0,
          }}
        >
          {local.label}
        </span>
      </Show>
    </span>
  );
};

export { spinnerVariants };
