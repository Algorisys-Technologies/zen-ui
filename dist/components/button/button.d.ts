import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "../../_core/variants";
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
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">, VariantProps<typeof buttonVariants> {
    /** Render the variant styles onto the child element (Radix Slot pattern). */
    asChild?: boolean;
    /** When true, shows a spinner and disables the button. */
    loading?: boolean;
    /** Icon node placed before children. */
    iconLeft?: React.ReactNode;
    /** Icon node placed after children. */
    iconRight?: React.ReactNode;
}
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
export { buttonVariants };
//# sourceMappingURL=button.d.ts.map