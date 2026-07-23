/**
 * Chart — line / area / bar chart rendered as plain SVG. No dependency.
 *
 * The React binding wraps `recharts`, which is React-only. Rather than pull a
 * React runtime into the Solid binding, this renders the same chart types from
 * the same public props with hand-built SVG, so `Chart` works out of the box
 * with nothing to install.
 *
 * That means the two bindings share no renderer at all, which is exactly why
 * the pie/donut maths lives in @algorisys/zen-ui-core/chart rather than here:
 * it is the only thing the two can agree about a percentage through.
 *
 *   <Chart
 *     type="line"
 *     data={rows}
 *     xKey="month"
 *     series={[{ key: "spend", label: "Spend" }, { key: "budget" }]}
 *   />
 */
export interface ChartSeries {
    /** key into each data row */
    key: string;
    /** legend / tooltip label (defaults to `key`) */
    label?: string;
    /** override colour (any CSS colour; defaults to the zen palette) */
    color?: string;
}
export interface ChartProps {
    type?: "line" | "area" | "bar" | "pie" | "donut";
    data: Array<Record<string, any>>;
    /**
     * For line/area/bar: one entry per plotted series.
     *
     * For pie/donut: only the FIRST entry is read — it names the value on each
     * row. A pie has one number per slice; a second series would be a second pie.
     */
    series: ChartSeries[];
    /** key on each row used for the x-axis — or, for pie/donut, the slice label */
    xKey: string;
    /**
     * Slice colours for pie/donut, in row order, wrapping if short. Defaults to
     * the zen palette. (Per-series `color` cannot express this: a pie is one
     * series and many colours.)
     */
    colors?: string[];
    height?: number;
    class?: string;
}
export declare const Chart: {
    (props: ChartProps): import("solid-js").JSX.Element;
    displayName: string;
};
//# sourceMappingURL=chart.d.ts.map