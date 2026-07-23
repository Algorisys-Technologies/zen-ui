import { type JSX } from "solid-js";
/**
 * Stack — a minimal flexbox layout primitive.
 *
 * A thin `div` that lays its children out in a row or column with
 * configurable alignment, wrapping, gap and padding. Useful as a generic
 * container / drop-target surface (e.g. in low-code builders) and for everyday
 * form/section layout without hand-writing flex utilities.
 *
 *   <Stack gap={16}>…</Stack>
 *   <Stack direction="row" align="center" justify="between">…</Stack>
 *
 * Solid port of the React binding's Stack. `ref` needs no forwarding here —
 * Solid passes it straight through the props spread onto the root <div>.
 */
declare const ALIGN: {
    readonly start: "zen-items-start";
    readonly center: "zen-items-center";
    readonly end: "zen-items-end";
    readonly stretch: "zen-items-stretch";
};
declare const JUSTIFY: {
    readonly start: "zen-justify-start";
    readonly center: "zen-justify-center";
    readonly end: "zen-justify-end";
    readonly between: "zen-justify-between";
};
export type StackProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "style"> & {
    /** main-axis direction (default "column") */
    direction?: "row" | "column";
    /** cross-axis alignment */
    align?: keyof typeof ALIGN;
    /** main-axis distribution */
    justify?: keyof typeof JUSTIFY;
    /** allow children to wrap (rows) */
    wrap?: boolean;
    /** gap between children — number = px, or any CSS length */
    gap?: number | string;
    /** inner padding — number = px, or any CSS length */
    padding?: number | string;
    class?: string;
    style?: JSX.CSSProperties | string;
    children?: JSX.Element;
};
export declare const Stack: (rawProps: StackProps) => JSX.Element;
export {};
//# sourceMappingURL=stack.d.ts.map