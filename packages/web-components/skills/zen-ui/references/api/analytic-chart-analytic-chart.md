<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# analytic-chart-analytic-chart — API (React, the parity reference)

Exports: `AnalyticChart`, `AnalyticChartProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-analytic-chart-analytic-chart>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### AnalyticChart

- `format?: ValueFormat | undefined` — How values read. Default `number`.
- `secondaryFormat?: ValueFormat | undefined` — How values on the secondary axis read (a combo's margin as `percent`). Default: `format`.
- `currency?: string | undefined` — ISO 4217 for `currency`. Default: the LocaleProvider's.
- `locale?: string | undefined` — BCP 47. Default: the LocaleProvider's, else the browser's.
- `onSelect?: ((selection: ChartSelection) => void) | undefined` — A click on a mark, or a table row's button. Without it nothing is clickable.
- `toolbar?: boolean | undefined` — The Chart / Table switch and the downloads. Default true.
- `view?: "table" | "chart" | undefined` — Controlled view.
- `defaultView?: "table" | "chart" | undefined`
- `onViewChange?: ((view: "chart" | "table") => void) | undefined`
- `height?: string | number | undefined` — Height of the chart (and of the table view, so switching does not reflow). Default 320.
- `renderer?: "svg" | "canvas" | undefined` — `svg` (default) or `canvas` for very large data. Read once, when the chart mounts.
- `option?: EChartsOption | undefined` — Raw ECharts settings, deep-merged over what the kind built: for what the spec does not cover.
- `fileName?: string | undefined` — Download file name, without extension. Default: the title, else "chart".
- `type: string` — A registered kind: bar, line, area, combo, pie, donut, waterfall, funnel, gauge, heatmap, scatter, treemap, or your own.
- `data: import("packages/core/src/analytic-chart").ChartRow[]`
- `x?: string | undefined` — The category / label field (the name of each slice, stage or tile).
- `series?: import("packages/core/src/analytic-chart").AnalyticSeries[] | undefined` — The value fields. Pie, donut, funnel, gauge, treemap and waterfall use the first.
- `y?: string | undefined` — A second field: heatmap's row category, scatter's y when `series` is not given.
- `stacked?: boolean | undefined` — Stack every bar / area series.
- `horizontal?: boolean | undefined` — Bars run left to right instead of bottom to top.
- `total?: string | undefined` — Waterfall: the field that marks a row as a running total (Opening, Gross profit, Closing).
- `max?: number | undefined` — Gauge: the value that fills the dial. Default 100.
- `target?: number | undefined` — Gauge: where the target sits, drawn as a mark on the dial.
- `zoom?: boolean | undefined` — Category-axis zoom: a slider under the chart, and the wheel / pinch.
- `legend?: boolean | undefined` — Default: shown when there is more than one series.
- `title?: string | undefined` — The chart's accessible name, and the table view's caption.
- `description?: string | undefined` — A sentence a screen reader gets with the name: what the chart shows.
- …plus the underlying element's standard props (278 inherited).

### Types

- `AnalyticChartProps` — type (see the component above)
