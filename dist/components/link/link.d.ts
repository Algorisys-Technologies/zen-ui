import * as React from "react";
import { type VariantProps } from "class-variance-authority";
/**
 * Link — a styled anchor.
 *
 *   <Link href="/pricing">Pricing</Link>
 *   <Link href="https://www.algorisys.com" external>Algorisys</Link>
 *   <p>Read the <Link href="/docs" inline>documentation</Link> first.</p>
 *
 * The most surprising thing missing from this library: every app that used it
 * hand-rolled `<a className="text-blue-600 underline">`, which is how a design
 * system ends up with nine shades of link.
 *
 * `asChild` hands the styling to whatever you already have, so a router's Link
 * keeps its own navigation:
 *
 *   <Link asChild><RouterLink to="/pricing">Pricing</RouterLink></Link>
 */
declare const linkVariants: (props?: ({
    size?: "sm" | "md" | "lg" | null | undefined;
    inline?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "color">, Omit<VariantProps<typeof linkVariants>, "disabled"> {
    /** Opens in a new tab, says so, and renders the mark that means it. */
    external?: boolean;
    /**
     * An anchor cannot be disabled — the attribute does not exist and a
     * pointer-events trick still leaves it in the tab order. A disabled Link
     * renders a <span> instead, so there is nothing to click or focus.
     */
    disabled?: boolean;
    asChild?: boolean;
}
export declare const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>;
export { linkVariants };
//# sourceMappingURL=link.d.ts.map