import { type JSX } from "solid-js";
/**
 * Separator — horizontal or vertical line that semantically separates
 * content. Decorative by default (screen readers skip it); pass
 * decorative={false} when the separation is meaningful for assistive tech.
 *
 * Implemented inline (one styled <div>) rather than via Kobalte, since
 * the markup is trivial and avoids pulling in a primitive for one
 * element.
 */
export type SeparatorProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "role"> & {
    orientation?: "horizontal" | "vertical";
    decorative?: boolean;
    class?: string;
};
export declare const Separator: (rawProps: SeparatorProps) => JSX.Element;
//# sourceMappingURL=divider.d.ts.map