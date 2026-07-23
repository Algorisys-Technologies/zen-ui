import { type JSX, type ValidComponent } from "solid-js";
import { type VariantProps } from "class-variance-authority";
/**
 * Link — a styled anchor.
 *
 *   <Link href="/pricing">Pricing</Link>
 *   <Link href="https://www.algorisys.com" external>Algorisys</Link>
 *   <p>Read the <Link href="/docs" inline>documentation</Link> first.</p>
 *
 * Polymorphic via `as`, mirroring this binding's Button and BreadcrumbLink —
 * React reaches the same place with `asChild`. That is the one deliberate
 * divergence between the bindings, and it predates this component:
 *
 *   <Link as={A} href="/pricing">Pricing</Link>   // @solidjs/router
 *
 * Mirrors the React binding's API otherwise.
 */
declare const linkVariants: (props?: ({
    size?: "sm" | "md" | "lg" | null | undefined;
    inline?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type LinkProps<T extends ValidComponent = "a"> = {
    as?: T;
    href?: string;
    target?: string;
    rel?: string;
    /** Opens in a new tab, says so, and renders the mark that means it. */
    external?: boolean;
    /**
     * An anchor cannot be disabled — the attribute does not exist and a
     * pointer-events trick still leaves it in the tab order. A disabled Link
     * renders a <span> instead, so there is nothing to click or focus.
     */
    disabled?: boolean;
    class?: string;
    children?: JSX.Element;
    /**
     * Declared here rather than inherited: a disabled Link renders a <span>, so
     * an anchor-typed ref does not narrow. HTMLElement is the honest signature —
     * the caller cannot know which element they will get either.
     */
    ref?: (el: HTMLElement) => void;
} & Omit<VariantProps<typeof linkVariants>, "disabled"> & Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, "class" | "children" | "href" | "target" | "rel" | "ref">;
export declare const Link: <T extends ValidComponent = "a">(rawProps: LinkProps<T>) => JSX.Element;
export { linkVariants };
//# sourceMappingURL=link.d.ts.map