import { type JSX } from "solid-js";
import { type VariantProps } from "class-variance-authority";
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
declare const spinnerVariants: (props?: ({
    size?: "sm" | "md" | "lg" | "xl" | null | undefined;
    color?: "error" | "primary" | "neutral" | "info" | "success" | "warning" | "current" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type LoadingProps = VariantProps<typeof spinnerVariants> & Omit<JSX.SvgSVGAttributes<SVGSVGElement>, "color" | "class"> & {
    /** Accessible label (visually hidden). Default "Loading". Pass "" to mark decorative. */
    label?: string;
    class?: string;
};
export declare const Loading: (rawProps: LoadingProps) => JSX.Element;
export { spinnerVariants };
//# sourceMappingURL=loading.d.ts.map