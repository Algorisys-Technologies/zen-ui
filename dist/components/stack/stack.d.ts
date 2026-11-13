import * as React from "react";
/**
 * Stack — a minimal flexbox layout primitive.
 *
 * A thin, ref-forwarding `div` that lays its children out in a row or column
 * with configurable alignment, wrapping, gap and padding. Useful as a generic
 * container / drop-target surface (e.g. in low-code builders) and for everyday
 * form/section layout without hand-writing flex utilities.
 *
 *   <Stack gap={16}>…</Stack>
 *   <Stack direction="row" align="center" justify="between">…</Stack>
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
export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
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
}
declare const Stack: React.ForwardRefExoticComponent<StackProps & React.RefAttributes<HTMLDivElement>>;
export { Stack };
//# sourceMappingURL=stack.d.ts.map