import * as React from "react";
import { type VariantProps } from "class-variance-authority";
/**
 * Loading — animated spinner. No Radix primitive (none exists);
 * shadcn ships the same pattern as a plain SVG with `animate-spin`.
 *
 *   <Loading />                  // sr-only label, defaults to md primary
 *   <Loading size="xl" label="Submitting…" />
 *
 * `label` becomes accessible text for screen readers. Pass `label=""` to
 * keep the loader purely decorative; the surrounding context should then
 * carry the loading semantics (e.g. `aria-busy` on the parent button).
 */
declare const spinnerVariants: (props?: ({
    size?: "sm" | "md" | "lg" | "xl" | null | undefined;
    color?: "primary" | "neutral" | "info" | "success" | "warning" | "error" | "current" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface LoadingProps extends Omit<React.SVGAttributes<SVGSVGElement>, "color">, VariantProps<typeof spinnerVariants> {
    /** Accessible label (visually hidden). Default "Loading". Pass "" to mark decorative. */
    label?: string;
}
declare const Loading: React.ForwardRefExoticComponent<LoadingProps & React.RefAttributes<SVGSVGElement>>;
export { Loading, spinnerVariants };
//# sourceMappingURL=loading.d.ts.map