import { type JSX, type ValidComponent } from "solid-js";
import { type VariantProps } from "class-variance-authority";
import { badgeVariants } from "@algorisys/zen-ui-core/variants";
import type { PolymorphicProps } from "../../lib/polymorphic";
/**
 * Badge — shadcn-style status pill. Polymorphic via `as` so it can
 * render as <a>, <A> from @solidjs/router, etc. for clickable pills.
 */
type BadgeOwnProps = VariantProps<typeof badgeVariants> & {
    class?: string;
    children?: JSX.Element;
};
export type BadgeProps<T extends ValidComponent = "span"> = PolymorphicProps<T, BadgeOwnProps>;
export declare const Badge: <T extends ValidComponent = "span">(rawProps: BadgeProps<T>) => JSX.Element;
export { badgeVariants };
//# sourceMappingURL=badge.d.ts.map