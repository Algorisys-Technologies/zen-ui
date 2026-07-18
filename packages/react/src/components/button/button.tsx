import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "@algorisys/zen-ui-core/variants";
import { cn } from "../../lib/cn";

/**
 * Button — shadcn/radix-style primitive.
 *
 * Design notes:
 *  - Forwards a ref to the underlying button element.
 *  - `asChild` renders the variant styles onto its child via Radix Slot,
 *    so consumers can compose with `<Link>`, `<a>`, etc. without losing styling
 *    and without us re-implementing each element type.
 *  - Variants come from @algorisys/zen-ui-core/variants, shared by every binding.
 *    A variant table is a design decision, not a React one, and it used to be
 *    copied per binding with nothing asserting the copies agreed. Colors and radii
 *    resolve through UnoCSS theme aliases (`zen-*`) that point at the `--zen-*`
 *    CSS custom properties in core's tokens.css. Override those vars to retheme.
 *  - No business logic (no HTTP, no form-field side effects). Use `onClick`.
 */

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    VariantProps<typeof buttonVariants> {
  /** Render the variant styles onto the child element (Radix Slot pattern). */
  asChild?: boolean;
  /** When true, shows a spinner and disables the button. */
  loading?: boolean;
  /** Icon node placed before children. */
  iconLeft?: React.ReactNode;
  /** Icon node placed after children. */
  iconRight?: React.ReactNode;
}

const Spinner = () => (
  <svg
    className="zen-animate-spin zen-h-4 zen-w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="zen-opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="zen-opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      color,
      size,
      shape,
      multiline,
      asChild = false,
      loading = false,
      disabled,
      iconLeft,
      iconRight,
      children,
      type,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, color, size, shape, multiline, className }))}
        // When rendering a real <button>, default type="button" to avoid
        // accidental form submission. When asChild, leave type to the child.
        type={asChild ? undefined : (type ?? "button")}
        disabled={asChild ? undefined : isDisabled}
        aria-disabled={asChild ? isDisabled || undefined : undefined}
        aria-busy={loading || undefined}
        data-loading={loading || undefined}
        {...props}
      >
        {/* Slottable marks `children` as the Radix Slot target when asChild
         * is true, so iconLeft / iconRight render as siblings inside the
         * slotted element rather than tripping React.Children.only(). When
         * asChild is false, Slottable is a transparent fragment.
         */}
        {loading ? <Spinner /> : iconLeft}
        <Slottable>{children}</Slottable>
        {!loading && iconRight}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
