import { type JSX, type ValidComponent } from "solid-js";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "@algorisys/zen-ui-core/variants";
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
export type ButtonProps<T extends ValidComponent = "button"> = PolymorphicProps<T, ButtonOwnProps>;
export declare const Button: <T extends ValidComponent = "button">(rawProps: ButtonProps<T>) => JSX.Element;
export { buttonVariants };
//# sourceMappingURL=button.d.ts.map