import * as React from "react";
/**
 * Chart — thin wrapper over `recharts` (an OPTIONAL peer dependency). Lazy-loads
 * recharts on first render so it never weighs on consumers who don't chart.
 * Install `recharts` to use it.
 *
 *   <Chart
 *     type="line"
 *     data={rows}
 *     xKey="month"
 *     series={[{ key: "spend", label: "Spend" }, { key: "budget" }]}
 *   />
 *
 * `pie` and `donut` ask a different question from the other three — every row is
 * a slice rather than a point on an axis — but they need no new props for it:
 * `xKey` already names the label and the first series already names the value.
 *
 *   <Chart type="donut" data={rows} xKey="answer" series={[{ key: "count" }]} />
 *
 * The slice maths lives in @algorisys/zen-ui-core/chart, shared with the Solid
 * binding. That sharing is load-bearing here: the two bindings have no renderer
 * in common (recharts vs hand-built SVG), so it is the only place they can be
 * made to agree about what a percentage is.
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
    className?: string;
}
export declare const Chart: {
    ({ type, data, series, xKey, colors, height, className, }: ChartProps): React.JSX.Element;
    displayName: string;
};
//# sourceMappingURL=chart.d.ts.map