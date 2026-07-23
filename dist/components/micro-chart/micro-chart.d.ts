/**
 * Micro charts — trend marks small enough to live inside something else.
 *
 *   <MicroLineChart values={[3, 5, 2, 8, 6]} />
 *   <MicroBulletChart value={72} target={80} />
 *
 * These are not small versions of `Chart`. `Chart` answers "what happened" and
 * owns axes, a legend, a tooltip and a container to put them in. A micro chart
 * answers "up or down, and roughly how much" in the space of a table cell, and
 * everything that would explain it lives in the row or card around it. That is
 * why there is no axis, no legend and no tooltip here, and why adding them
 * would turn it into the wrong component.
 *
 * Fiori ships nine of these. Five are built: the four shapes that answer
 * genuinely different questions (a series, a series with discrete bars, one
 * value against a target, one value as a proportion) plus delta, which is a
 * comparison of exactly two. Harvey ball, comparison and stacked-bar are
 * restatements of radial and bar with fewer affordances.
 *
 * Everything is inline SVG sized in px: these sit in text flow, so a
 * percentage width would collapse in a table cell that has not been measured.
 * Colour comes from `currentColor`, so a caller can also just wrap them in
 * anything that sets a text colour.
 *
 * Tracks and ticks use `var(--zen-color-*)` directly rather than a utility.
 * `zen-fill-*` / `zen-stroke-*` do not generate under this preset — measured,
 * the bullet track came back computed black and the radial ring `none`, which
 * is invisible rather than obviously broken.
 */
export type MicroChartColor = "primary" | "success" | "warning" | "error" | "info" | "muted";
interface MicroChartBase {
    /** Pixel width. Default varies by chart. */
    width?: number;
    /** Pixel height. Default varies by chart. */
    height?: number;
    color?: MicroChartColor;
    /**
     * What the chart says, for assistive tech. Each chart derives a sensible one
     * from its own data; override when the surrounding text does not already say
     * what this is measuring.
     */
    label?: string;
    class?: string;
}
export interface MicroLineChartProps extends MicroChartBase {
    values: number[];
    /** Fill the area under the line. Off by default — at this size it muddies it. */
    area?: boolean;
}
export declare const MicroLineChart: (rawProps: MicroLineChartProps) => import("solid-js").JSX.Element;
export interface MicroBarChartProps extends MicroChartBase {
    values: number[];
}
export declare const MicroBarChart: (rawProps: MicroBarChartProps) => import("solid-js").JSX.Element;
export interface MicroBulletChartProps extends MicroChartBase {
    value: number;
    /** The number you were aiming at; drawn as a tick, not a bar. */
    target?: number;
    min?: number;
    max?: number;
}
export declare const MicroBulletChart: (rawProps: MicroBulletChartProps) => import("solid-js").JSX.Element;
export interface MicroDeltaChartProps extends MicroChartBase {
    from: number;
    to: number;
}
export declare const MicroDeltaChart: (rawProps: MicroDeltaChartProps) => import("solid-js").JSX.Element;
export interface MicroRadialChartProps extends MicroChartBase {
    value: number;
    max?: number;
    /** Print the percentage in the middle. Off below ~32px, where it cannot fit. */
    showValue?: boolean;
}
export declare const MicroRadialChart: (rawProps: MicroRadialChartProps) => import("solid-js").JSX.Element;
export {};
//# sourceMappingURL=micro-chart.d.ts.map