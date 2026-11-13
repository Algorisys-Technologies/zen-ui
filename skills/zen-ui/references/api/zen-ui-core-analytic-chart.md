<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# zen-ui-core-analytic-chart — API (React, the parity reference)

Exports: `registerChartKind`, `getChartKind`, `chartKinds`, `selectionAt`, `makeFormatter`, `cartesianFrame`, `legendOf`, `seriesOf`, `toNumber`, `AnalyticChartSpec`, `AnalyticSeries`, `ChartKind`, `ChartContext`, `ChartSelection`, `ChartTable`, `ChartTheme`, `ChartRow`, `ValueFormat`, `EChartsOption`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-zen-ui-core-analytic-chart>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### AnalyticChartSpec (type)

- `type: string` — A registered kind: bar, line, area, combo, pie, donut, waterfall, funnel, gauge, heatmap, scatter, treemap, pareto, or your own.
- `data: ChartRow[]`
- `x?: string | undefined` — The category / label field (the name of each slice, stage or tile).
- `series?: AnalyticSeries[] | undefined` — The value fields. Pie, donut, funnel, gauge, treemap and waterfall use the first.
- `y?: string | undefined` — A second field: heatmap's row category, scatter's y when `series` is not given.
- `stacked?: boolean | undefined` — Stack every bar / area series.
- `horizontal?: boolean | undefined` — Bars run left to right instead of bottom to top.
- `total?: string | undefined` — Waterfall: the field that marks a row as a running total (Opening, Gross profit, Closing).
- `max?: number | undefined` — Gauge: the value that fills the dial. Default 100.
- `target?: number | undefined` — Gauge: where the target sits, drawn as a mark on the dial.
- `threshold?: number | undefined` — Pareto: the cumulative share that ends the vital few. Default 0.8.
- `zoom?: boolean | undefined` — Category-axis zoom: a slider under the chart, and the wheel / pinch.
- `legend?: boolean | undefined` — Default: shown when there is more than one series.
- `title?: string | undefined` — The chart's accessible name, and the table view's caption.
- `description?: string | undefined` — A sentence a screen reader gets with the name: what the chart shows.

### AnalyticSeries (type)

- `key: string` — The field in each row that holds this series' value.
- `label?: string | undefined` — Shown in the legend, tooltip and table header. Default: `key`.
- `kind?: "area" | "line" | "bar" | undefined` — For `combo` (and to override bar / line / area per series): how this series draws.
- `axis?: "primary" | "secondary" | undefined` — `secondary` plots against a second value axis, with `secondaryFormat`.
- `stack?: string | undefined` — Series sharing a stack id stack on each other. `stacked` stacks every series.
- `color?: string | undefined` — Any CSS colour, `var(--zen-…)` included. Default: the theme palette, in order.

### ChartKind (type)

- `id: string`
- `modules: () => Promise<unknown[]>` — The ECharts chart / component parts this kind needs, imported when a chart of this kind is first drawn. Return them from a destructured dynamic import so a bundler keeps only those: `import("echarts/charts").then(({ BarChart }) => [BarChart])`.
- `build: (spec: AnalyticChartSpec, ctx: ChartContext) => EChartsOption` — The spec, with its theme and formatter, as an ECharts option. Pure.
- `table?: ((spec: AnalyticChartSpec, ctx: ChartContext) => ChartTable) | undefined` — The table view and CSV. Default: the x field, then one column per series.
- `select?: ((spec: AnalyticChartSpec, params: { dataIndex: number; seriesId?: string; value?: unknown; }) => ChartSelection | undefined) | undefined` — What a click on a mark selected, from ECharts' click params. Default: the row at `dataIndex`.

### ChartContext (type)

- `theme: ChartTheme`
- `format: (value: number, axis?: "primary" | "secondary") => string` — Formats a value on the given axis (the primary unless said).
- `rtl: boolean` — The page reads right to left.
- `locale?: string | undefined` — BCP 47, for the few labels a kind formats itself (Pareto's percent axis). Undefined: the browser's.
- `width?: number | undefined` — The chart's width in px, when known: lets category labels wrap instead of dropping.
- `t: (key: string, values?: Record<string, string | number>) => string` — A catalogue word (`analyticChart.*`), translated when the app supplied one.

### ChartSelection (type)

- `row: ChartRow`
- `index: number` — The row's index in `data`.
- `seriesKey?: string | undefined`
- `value?: number | undefined`

### ChartTable (type)

- `columns: { key: string; label: string; numeric?: boolean; axis?: "primary" | "secondary"; }[]`
- `rows: { cells: (string | number | null)[]; index: number; seriesKey?: string; }[]` — One entry per table row: the cells, and the `data` row it stands for (for selection).

### ChartTheme (type)

- `palette: string[]`
- `foreground: string`
- `muted: string` — Axis labels and other secondary text.
- `border: string` — Gridlines and axis lines.
- `background: string`
- `surface: string` — A filled-but-empty surface: the gauge's track, a heatmap's low end.
- `positive: string`
- `negative: string`
- `fontFamily: string`

### Other exports

- `registerChartKind(kind: ChartKind): void`
- `getChartKind(id: string): ChartKind | undefined`
- `chartKinds(): string[]`
- `selectionAt(spec: AnalyticChartSpec, index: number, seriesKey?: string): ChartSelection | undefined`
- `makeFormatter(format: ValueFormat | undefined, opts?: { locale?: string; currency?: string; }): (value: number) => string`
- `cartesianFrame(spec: AnalyticChartSpec, ctx: ChartContext, opts?: { secondary?: boolean; categories?: string[]; boundaryGap?: boolean; }): EChartsOption`
- `legendOf(spec: AnalyticChartSpec, ctx: ChartContext, count: number): EChartsOption`
- `seriesOf(spec: AnalyticChartSpec): (AnalyticSeries & { label: string; })[]`
- `toNumber(v: unknown): number | null`
- `ValueFormat` = `"number" | "currency" | "percent" | "compact" | ((value: number) => string)`

### Types

- `ChartRow` — type
- `EChartsOption` — type
