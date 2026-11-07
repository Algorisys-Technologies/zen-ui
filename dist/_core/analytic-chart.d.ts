/**
 * AnalyticChart's framework-agnostic half: everything about a chart that is not
 * drawing it. The spec, the chart-kind registry, number formatting, the table
 * view and its CSV, and the ECharts option each kind builds.
 *
 * WHY A REGISTRY. A business app wants more chart types than any release ships,
 * so a chart type is a module (`ChartKind`), not a branch in a component. Each
 * kind says which ECharts parts it needs (imported only when a chart of that
 * kind is drawn), how a spec becomes an ECharts option, and, if the default
 * does not fit, how its data reads as a table and what a click selected. The
 * built-ins register themselves through `registerChartKind`, the same call an
 * app uses for its own (a Sankey, a radar), so adding one touches no component,
 * no binding, and none of the toolbar, table view, export or theming.
 *
 * WHY HERE. The four bindings draw with the same renderer (ECharts) from this
 * one file, so they cannot disagree about what a waterfall's bars are, the way
 * the older Chart already does (recharts in React, hand-drawn SVG elsewhere).
 * Everything in this file is pure: `bun run check:analytic-chart` pins it
 * without a browser. The DOM half (mounting, resizing, theme changes) is
 * `analytic-chart-echarts.ts`.
 *
 * Options are typed loosely (`EChartsOption` is a plain record) on purpose: core
 * must not depend on echarts' types at runtime, and the option is ECharts' own
 * documented shape, which the `option` prop lets a caller extend.
 */
export type ChartRow = Record<string, unknown>;
/** An ECharts option object. ECharts' own documented shape; kept loose here. */
export type EChartsOption = Record<string, any>;
/** How values read: a preset, or your own function. */
export type ValueFormat = "number" | "currency" | "percent" | "compact" | ((value: number) => string);
export interface AnalyticSeries {
    /** The field in each row that holds this series' value. */
    key: string;
    /** Shown in the legend, tooltip and table header. Default: `key`. */
    label?: string;
    /** For `combo` (and to override bar / line / area per series): how this series draws. */
    kind?: "bar" | "line" | "area";
    /** `secondary` plots against a second value axis, with `secondaryFormat`. */
    axis?: "primary" | "secondary";
    /** Series sharing a stack id stack on each other. `stacked` stacks every series. */
    stack?: string;
    /** Any CSS colour, `var(--zen-…)` included. Default: the theme palette, in order. */
    color?: string;
}
export interface AnalyticChartSpec {
    /** A registered kind: bar, line, area, combo, pie, donut, waterfall, funnel, gauge, heatmap, scatter, treemap, or your own. */
    type: string;
    data: ChartRow[];
    /** The category / label field (the name of each slice, stage or tile). */
    x?: string;
    /** The value fields. Pie, donut, funnel, gauge, treemap and waterfall use the first. */
    series?: AnalyticSeries[];
    /** A second field: heatmap's row category, scatter's y when `series` is not given. */
    y?: string;
    /** Stack every bar / area series. */
    stacked?: boolean;
    /** Bars run left to right instead of bottom to top. */
    horizontal?: boolean;
    /** Waterfall: the field that marks a row as a running total (Opening, Gross profit, Closing). */
    total?: string;
    /** Gauge: the value that fills the dial. Default 100. */
    max?: number;
    /** Gauge: where the target sits, drawn as a mark on the dial. */
    target?: number;
    /** Category-axis zoom: a slider under the chart, and the wheel / pinch. */
    zoom?: boolean;
    /** Default: shown when there is more than one series. */
    legend?: boolean;
    /** The chart's accessible name, and the table view's caption. */
    title?: string;
    /** A sentence a screen reader gets with the name: what the chart shows. */
    description?: string;
}
/** The colours and type a chart draws in, read from the `--zen-*` tokens. */
export interface ChartTheme {
    palette: string[];
    foreground: string;
    /** Axis labels and other secondary text. */
    muted: string;
    /** Gridlines and axis lines. */
    border: string;
    background: string;
    /** A filled-but-empty surface: the gauge's track, a heatmap's low end. */
    surface: string;
    positive: string;
    negative: string;
    fontFamily: string;
}
/** What a kind builds with, beyond the spec. */
export interface ChartContext {
    theme: ChartTheme;
    /** Formats a value on the given axis (the primary unless said). */
    format: (value: number, axis?: "primary" | "secondary") => string;
    /** The page reads right to left. */
    rtl: boolean;
    /** The chart's width in px, when known: lets category labels wrap instead of dropping. */
    width?: number;
    /** A catalogue word (`analyticChart.*`), translated when the app supplied one. */
    t: (key: string, values?: Record<string, string | number>) => string;
}
/** What a click (on a mark or a table row) selected. */
export interface ChartSelection {
    row: ChartRow;
    /** The row's index in `data`. */
    index: number;
    seriesKey?: string;
    value?: number;
}
export interface ChartTable {
    columns: {
        key: string;
        label: string;
        numeric?: boolean;
        axis?: "primary" | "secondary";
    }[];
    /** One entry per table row: the cells, and the `data` row it stands for (for selection). */
    rows: {
        cells: (string | number | null)[];
        index: number;
        seriesKey?: string;
    }[];
}
/** The ECharts module namespaces a kind picks its parts from. */
export interface EChartsModules {
    charts: () => Promise<Record<string, unknown>>;
    components: () => Promise<Record<string, unknown>>;
}
export interface ChartKind {
    id: string;
    /**
     * The ECharts chart / component parts this kind needs, imported when a chart
     * of this kind is first drawn. Return them from a destructured dynamic import
     * so a bundler keeps only those: `import("echarts/charts").then(({ BarChart }) => [BarChart])`.
     */
    modules: () => Promise<unknown[]>;
    /** The spec, with its theme and formatter, as an ECharts option. Pure. */
    build: (spec: AnalyticChartSpec, ctx: ChartContext) => EChartsOption;
    /** The table view and CSV. Default: the x field, then one column per series. */
    table?: (spec: AnalyticChartSpec, ctx: ChartContext) => ChartTable;
    /** What a click on a mark selected, from ECharts' click params. Default: the row at `dataIndex`. */
    select?: (spec: AnalyticChartSpec, params: {
        dataIndex: number;
        seriesId?: string;
        value?: unknown;
    }) => ChartSelection | undefined;
}
/**
 * Add a chart type, or replace one: the built-ins come in through here too. An
 * app's own kind is drawn, themed, tabulated, exported and selected exactly as
 * a built-in is.
 */
export declare function registerChartKind(kind: ChartKind): void;
export declare function getChartKind(id: string): ChartKind | undefined;
/** Every registered kind's id, in registration order. */
export declare function chartKinds(): string[];
/** A cell as a number, or null when it is not one (a gap, not a zero). */
export declare function toNumber(v: unknown): number | null;
/**
 * A formatter for one axis. `percent` takes a ratio (0.25 reads 25%), as
 * Intl does; `compact` reads 1.2M / 12 lakh by locale; `currency` needs a
 * currency (the prop's, else the provider's) and falls back to `number`.
 */
export declare function makeFormatter(format: ValueFormat | undefined, opts?: {
    locale?: string;
    currency?: string;
}): (value: number) => string;
/** The series a spec draws, with labels filled in. */
export declare function seriesOf(spec: AnalyticChartSpec): (AnalyticSeries & {
    label: string;
})[];
/**
 * What selecting row `index` (of series `seriesKey`) means for this spec: the
 * kind's own answer (a waterfall's change), else the row and that series'
 * value. One function for a click on a mark AND a table row's button, so the
 * two cannot report different things.
 */
export declare function selectionAt(spec: AnalyticChartSpec, index: number, seriesKey?: string): ChartSelection | undefined;
/** The default table: the x field, then one column per series. */
export declare function defaultTable(spec: AnalyticChartSpec): ChartTable;
/** The table a spec reads as: its kind's, else the default. */
export declare function chartTable(spec: AnalyticChartSpec, ctx: ChartContext): ChartTable;
/**
 * The table as CSV: RFC 4180 quoting, raw numbers (a spreadsheet formats them;
 * a pre-formatted "₹1,25,000.00" would arrive as text), CRLF line ends, and a
 * leading quote on a cell a spreadsheet would run as a formula (=, +, -, @).
 */
export declare function tableToCsv(table: ChartTable): string;
/**
 * `extra` deep-merged over `base`: objects merge key by key, anything else
 * (arrays included) replaces. ECharts' own `setOption` merge is by component
 * index and would keep stale series; this one is what the caller wrote.
 */
export declare function mergeOption(base: EChartsOption, extra: EChartsOption | undefined): EChartsOption;
/**
 * The full option for a spec: the theme's text, palette, tooltip and
 * accessibility description, then what the kind built, then the caller's
 * `option` over both. Throws on an unregistered type, naming the ones that are.
 */
export declare function buildChartOption(spec: AnalyticChartSpec, ctx: ChartContext, extra?: EChartsOption): EChartsOption;
/** The legend, on top, aligned to the reading start. */
export declare function legendOf(spec: AnalyticChartSpec, ctx: ChartContext, count: number): EChartsOption;
/**
 * Category + value axes, grid and zoom for the cartesian kinds. Right to left
 * mirrors the category axis and moves the primary value axis to the right; a
 * horizontal chart swaps the two axes.
 */
export declare function cartesianFrame(spec: AnalyticChartSpec, ctx: ChartContext, opts?: {
    secondary?: boolean;
    categories?: string[];
    boundaryGap?: boolean;
}): EChartsOption;
/** Waterfall arithmetic, exported for the check: per row its base, height, running total and sign. */
export declare function waterfallBars(spec: AnalyticChartSpec): {
    base: number;
    height: number;
    running: number;
    change: number | null;
    kind: "up" | "down" | "total";
}[];
/** Treemap tiles below this share of the total draw without a label. */
export declare const TREEMAP_LABEL_MIN_SHARE = 0.03;
/**
 * Black or white, whichever reads on `colour` (#rgb, #rrggbb, rgb()/rgba()):
 * by relative luminance, the WCAG measure. An unparseable colour gets white.
 */
export declare function readableOn(colour: string): string;
/** Colour stops that paint only a sliver of a dial at `target`. */
export declare function targetStops(target: number, max: number, colour: string): [number, string][];
