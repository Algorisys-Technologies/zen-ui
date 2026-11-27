import * as React from "react";
import { type AnalyticChartSpec, type ChartSelection, type EChartsOption, type ValueFormat } from "../../_core/analytic-chart";
/**
 * AnalyticChart — the interactive chart for business screens: bar, line, area,
 * combo (two axes), pie, donut, waterfall, funnel, gauge, heatmap, scatter and
 * treemap, plus any kind an app registers (`registerChartKind`). Click a mark to
 * drill down or filter; switch to the table view; download PNG or CSV.
 *
 *   <AnalyticChart type="combo" data={months} x="month" format="currency"
 *     series={[{ key: "revenue", label: "Revenue" }, { key: "margin", label: "Margin", axis: "secondary" }]}
 *     secondaryFormat="percent" onSelect={(s) => setMonth(s.row.month)} title="Revenue and margin" />
 *
 * Drawn by ECharts, an OPTIONAL peer (`npm i echarts`) loaded when the first
 * chart mounts, so an app that does not chart pays nothing. Without it the
 * chart shows its data as the table, with a one-line note: it still answers the
 * question it was asked.
 *
 * The table view is the keyboard and screen-reader path, not an extra: ECharts
 * cannot be operated by keyboard, so with `onSelect` each table row is a button
 * that selects exactly what a click on its mark does.
 *
 * Series colours are `--zen-chart-1` … `-8`, a categorical set stepped per
 * theme (not the semantic colours, so no category reads as an error), text and
 * grid come from `--zen-color-*`, and all of it follows a theme change; numbers
 * format in the locale and currency of the prop, else the LocaleProvider; right
 * to left mirrors the axes. Everything but the drawing lives in
 * @algorisys/zen-ui-core/analytic-chart, shared by every binding.
 */
export interface AnalyticChartProps extends AnalyticChartSpec, Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "onSelect"> {
    /** How values read. Default `number`. */
    format?: ValueFormat;
    /** How values on the secondary axis read (a combo's margin as `percent`). Default: `format`. */
    secondaryFormat?: ValueFormat;
    /** ISO 4217 for `currency`. Default: the LocaleProvider's. */
    currency?: string;
    /** BCP 47. Default: the LocaleProvider's, else the browser's. */
    locale?: string;
    /** A click on a mark, or a table row's button. Without it nothing is clickable. */
    onSelect?: (selection: ChartSelection) => void;
    /** The Chart / Table switch and the downloads. Default true. */
    toolbar?: boolean;
    /** Controlled view. */
    view?: "chart" | "table";
    defaultView?: "chart" | "table";
    onViewChange?: (view: "chart" | "table") => void;
    /** Height of the chart (and of the table view, so switching does not reflow). Default 320. */
    height?: number | string;
    /** `svg` (default) or `canvas` for very large data. Read once, when the chart mounts. */
    renderer?: "svg" | "canvas";
    /** Raw ECharts settings, deep-merged over what the kind built: for what the spec does not cover. */
    option?: EChartsOption;
    /** Download file name, without extension. Default: the title, else "chart". */
    fileName?: string;
}
export declare const AnalyticChart: React.ForwardRefExoticComponent<AnalyticChartProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=analytic-chart.d.ts.map