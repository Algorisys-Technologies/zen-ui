# AnalyticChart — plan

Owner's ask (2026-11-05): the business / ERP app needs many graphical elements,
charts that are **customisable and interactive**, and a design that **takes
more chart types later** without rework. Built **Solid first**; React, vanilla
and web components port from it once the Solid version is settled.

## Decisions

- **Rendering: Apache ECharts as an OPTIONAL peer** (`echarts`, Apache-2.0),
  loaded lazily the way CodeEditor loads Monaco. One renderer that is not tied
  to a framework, so the four bindings can draw the same chart from the same
  core code instead of three renderers drifting (the existing Chart already
  does: recharts in React, hand SVG in Solid and vanilla).
- **Cost, measured** (echarts 6.1.0, esbuild, minified, gzip): bar + grid +
  tooltip + legend + SVG renderer **179 kB**; every built-in kind plus both
  renderers **244 kB**. Paid only by a page that renders an AnalyticChart, after
  its first paint (dynamic import). An app that never charts pays 0, and the
  bundle budgets in `check:size` are untouched because no static import exists.
- **Additive only.** A new component, `AnalyticChart`. The existing `Chart` and
  the micro charts are unchanged.
- **Missing peer degrades to the table**, not to an error: the same rows, with a
  one-line install note. A chart whose renderer is absent still answers the
  question it was asked.

## Extensibility: chart kinds are a registry

Core owns everything that is not drawing (`@algorisys/zen-ui-core/analytic-chart`):

```ts
interface ChartKind {
  id: string;                         // "bar", "waterfall", "sankey" …
  cartesian?: boolean;                // shares the x / value axes, zoom, RTL mirroring
  modules(ec): Promise<unknown[]>;    // the ECharts parts it needs, imported on demand
  build(spec, ctx): EChartsOption;    // spec + theme + formatter -> option (pure)
  table?(spec): ChartTable;           // rows for the table view and CSV (default: x + series)
  select?(spec, params): ChartSelection | undefined; // ECharts click -> {row, index, seriesKey, value}
}
registerChartKind(kind)
```

Built-ins register themselves through the same call an app uses, so adding a
chart type is one new kind module: no change to the component, the toolbar, the
table view, export, theming or the bindings. A consumer can register their own
(e.g. a Sankey) the same way. For a one-off tweak no kind covers, the `option`
prop deep-merges raw ECharts settings over what the kind built.

## The spec (one shape for every kind)

| prop | meaning |
|---|---|
| `type` | a registered kind id |
| `data` | rows (plain objects) |
| `x` | the category / label field (name field for pie, funnel, treemap) |
| `series` | `{ key, label?, kind?: "bar"\|"line"\|"area", axis?: "primary"\|"secondary", stack?, color? }[]` |
| `y` | second field: heatmap rows, scatter's y |
| `stacked`, `horizontal` | cartesian layout |
| `format`, `secondaryFormat` | `"number" \| "currency" \| "percent" \| "compact"` or a function; locale and currency from the prop, else LocaleProvider |
| `total` | waterfall: the field that marks a running-total row |
| `max` | gauge maximum |
| `title`, `description` | the accessible name / caption (and the table's caption) |
| `onSelect` | click a mark (or a table row) -> `{ row, index, seriesKey?, value? }`: drill-down and cross-filtering |
| `zoom` | slider + wheel zoom on the category axis |
| `legend` | default: shown when there is more than one series |
| `toolbar` | Chart / Table switch, PNG, CSV (default on) |
| `height`, `renderer` (`"svg"` default, `"canvas"` for large data), `option`, `class` |

## Built-in kinds, phase 1

`bar`, `line`, `area`, `combo` (per-series bar/line, second axis), `pie`,
`donut`, `waterfall` (P&L, cash flow), `funnel` (pipeline), `gauge` (target
attainment), `heatmap` (stock by warehouse x month), `scatter`, `treemap`
(spend by category).

## Non-negotiables (zen-ui's own)

- **Theme**: series from `--zen-chart-1…8`, text and grid from `--zen-color-*`, resolved on the chart's element (so
  `data-theme` on any ancestor works), re-read when the theme changes.
- **Locale**: numbers through `Intl.NumberFormat` with the provider's locale and
  currency; words (toolbar, table, empty, install note) from the catalogue.
- **Right to left**: cartesian kinds mirror the category axis and move the value
  axis to the right.
- **Keyboard and screen readers**: ECharts cannot be operated by keyboard, so the
  table view is the accessible path, not an afterthought: a real `<table>` with
  a caption, and when `onSelect` is set each row is a button that fires the same
  event a click on the mark does. The canvas/SVG gets `role="img"` and an
  ECharts `aria` description.
- **Resize**: follows its container (ResizeObserver), not the window.

## Phases

1. **AnalyticChart** with the kinds above (this round, Solid).
2. Cross-filtering recipes: chart -> DataTable, chart -> chart; "Chart this" on
   Pivot.
3. A chart builder (pick fields and kind), saved through ViewManager; a
   dashboard grid of movable, resizable cards.

## Verification

- `check:analytic-chart` (pure, in `bun run check`): every built-in kind's
  option against fixed data; waterfall's invisible bases and totals; stacking;
  second axis; formatting in en-IN / de-DE; RTL mirroring; CSV escaping; the
  registry (duplicate id, unknown type).
- In a browser: each kind draws in every theme, a click fires `onSelect`, the
  table view's buttons fire the same, PNG / CSV download, zoom, RTL, and the
  missing-peer fallback.

## Status

- [x] core: registry, kinds, formatter, table / CSV, theme reader + check
  (`check:analytic-chart`, 92 assertions, wired into `bun run check`)
- [x] Solid: component, demo, nav (`since: "12.4.0"`), browser-verified
  2026-11-05: all 12 demo charts draw (SVG, and canvas for the zoom one);
  click-to-select on a mark and Enter on a table row both fire `onSelect`; CSV
  and PNG download; filter and drill-down; light and dark fills follow the
  theme; RTL mirrors the category axis; with echarts blocked the chart falls
  back to the table and its install note, with no page errors. tsc
  (`tsconfig.app.json`, files confirmed in the program) and eslint are clean.
- [x] Categorical palette (owner approved 2026-11-05): `--zen-chart-1…8` in
  tokens.css, one light set on `:root` and every light theme, stepped values
  in `dark`. Replaced a palette built from the semantic tokens, which painted
  plain categories danger-red. Order validated with the dataviz validator on
  #ffffff, #FDFBF6 and #0F172A: adjacent CVD ΔE ≥ 8.4, normal-vision ≥ 19.3;
  light slots 3–5 are under 3:1, relieved by the table view. Waterfall
  up / down stay semantic (`--zen-chart-positive` / `-negative`).
  Browser-verified in all five themes, plus a nested `paper` inside `dark`.
- [x] Stacked bars: a 1px background-coloured edge (2px between segments).
  Treemap: no label on a tile under 3% of the total, ellipsis on the rest.
- [x] React, vanilla, web components (2026-11-05), each driven in a browser
  with the same probe as Solid, all identical: 12 charts draw, click and
  keyboard select, CSV / PNG, filter, drill-down, themes, RTL, missing-peer
  fallback, no page errors. `check:parity` green. Found on the way and fixed
  for every binding: marks looked clickable without `onSelect` (the controller
  now takes `selectable()`, and overrides zrender's hover cursor, since ECharts
  honours a series `cursor` for only some types); and the web-components
  layer could not clear a callback property (`define.ts`).
- [ ] Phase 2: cross-filtering recipes (chart -> DataTable, chart -> chart),
  "Chart this" on Pivot.
