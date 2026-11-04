# zen-ui viz: a separate charts and graphs package

A plan, 2026-11-04. Planned and built on its own track, apart from the
component work. Solid first, as for everything else; each component's demo
goes on the site as it lands.

Decisions the owner needs to make are marked **Decide**.

## Why a separate package

- **Installed on its own.** An app that wants a dashboard should not pull in
  the whole component library, and an app that uses the component library
  should not pay for charts it never draws. Charting is also where the heavy
  code and the optional dependencies live (layouts, decimation, workers).
- **Business apps need more than today's Chart.** Solid's `Chart` is 591 lines
  of hand-built SVG with line, area, bar, pie and donut; React's draws with
  recharts, so the two share only core's pie geometry (`core/src/chart.ts`).
  The ERP review (B8) asks for stacked and grouped bars, bar + line on two axes,
  waterfall, heatmap and scatter; dashboards (B9) and analytics need more.
- **Performance is a requirement, not a polish step.** An ERP charts a year of
  daily stock movements per item, or every invoice of a quarter. SVG with one
  element per point stops being usable in the low tens of thousands of points.

Nothing here changes the existing `Chart` or `MicroChart`: they stay as they
are (no breaking changes). Once viz covers their ground, they can be
re-implemented on it, or deprecated at a major version.

## Packages

| Package | What | Published |
|---|---|---|
| `packages/viz-core` → `@algorisys/zen-ui-viz-core` | Framework-free: scales, ticks, number and date formatting, stacking, decimation, binning, layouts (treemap, sankey, force), hit-testing, the accessible description of a chart. No DOM. | No: inlined into each binding, as `core` is today (see CLAUDE.md on why `workspace:*` in `dependencies` broke installs). |
| `packages/viz-solid` → `@algorisys/zen-ui-viz-solid` | The Solid renderers: frame, axes, legend, tooltip, marks, chart components. | Yes |
| later: `viz-react`, `viz-vanilla`, `viz-web-components` | Ports, in the usual order, once Solid is settled. | Yes |

- **Independent of the component library.** `viz-solid` depends on `solid-js`
  only (a peer). It is themed through `--zen-*` custom properties, so it looks
  right next to zen-ui, and still works without it (it ships the few tokens it
  needs as fallbacks).
- **One import per chart.** Each chart is a subpath (`@algorisys/zen-ui-viz-solid/line`,
  `/bar`, `/sankey`…) with `sideEffects: false`, so a dashboard with two line
  charts does not ship the force layout. `check:size` gets a budget per entry.
- **Licence files** in each package's `files` (CLAUDE.md: npm drops an
  unlisted `LICENSE` when `files` is set).
- **Decide:** version in lockstep with the component library (one number, as
  CLAUDE.md's release procedure requires for every published package today), or
  its own version line. Lockstep is simpler and is the repo's rule; its own line
  lets charts release without a component release. Recommendation: lockstep,
  and add the viz packages to the registry `check:release` reads.
- **Decide:** names. `zen-ui-viz-*` here; `zen-ui-charts-*` reads more plainly
  to a buyer.

## Architecture

A small grammar, not a fixed list of chart types: a chart is a **frame** that
holds **scales**, and **layers** of marks drawn against them. Chart types are
thin presets over that, so a new type is mostly composition, and a consumer can
add a layer of their own.

```tsx
// A preset: the common case in one line.
<BarChart data={sales} x="month" y={["north", "south"]} stacked />

// The same, composed: what a preset expands to, and how to go further.
<Chart data={sales}>
  <XAxis scale={band("month")} />
  <YAxis scale={linear()} format={amount("INR")} />
  <Bars x="month" y={["north", "south"]} stacked />
  <Line x="month" y="margin" axis="right" />      {/* bar + line on two axes */}
  <ReferenceLine y={target} label="Target" />
  <Tooltip shared />
  <Legend />
</Chart>
```

- **Frame**: measures itself (ResizeObserver), lays out margins from the axes'
  measured labels, provides scales and the plot area to its layers through
  context, and owns interaction state (hover, focus, zoom, selection).
- **Scales** (viz-core): linear, log, sqrt, time, band, point, ordinal, colour
  (sequential, diverging, categorical). Ticks that read well: nice numbers,
  calendar-aware time ticks (months, quarters, fiscal years), India's digit
  grouping through the locale.
- **Layers / marks**: line, area, bar, point, rect (heatmap cells), arc, rule,
  text, and custom. A layer is a component that reads the frame's context; that
  is the whole extension API, so a consumer's custom layer is a first-class
  citizen.
- **Formatting comes from the locale work (ERP review B1 and B2).** Axis ticks,
  tooltips and data labels format numbers, amounts and dates through the same
  core helpers the components use, so a chart and a table beside it never
  disagree about how ₹1,50,000 is written. That makes B1/B2 a dependency of the
  first real chart, not a nice-to-have.

**Decide:** build scales and shapes ourselves or use d3's math-only modules
(`d3-scale`, `d3-shape`, `d3-array`, `d3-hierarchy`, `d3-sankey`, `d3-force`).
They touch no DOM, tree-shake per function and are what every serious chart
library ends up rewriting. Recommendation: use them inside viz-core, wrapped,
so the public API never exposes d3 and they can be replaced one by one.

## Performance

Measured, with budgets, the way the DataTable work was: a benchmark page per
chart in the demo, driven headless, with frame times, render time and node
count, plus `check:size` per entry.

- **Renderer by size.** SVG for up to a few thousand marks: crisp, styleable
  with tokens, each mark focusable. Above that, **Canvas 2D** for the marks,
  with SVG or HTML on top for axes, labels, the tooltip and the focus ring, so
  text stays sharp and accessible. Chosen automatically by mark count, with
  `renderer="svg" | "canvas"` to override. WebGL only if a real need appears.
- **Draw less.** Line series are decimated to what the pixels can show (min/max
  per pixel column, or LTTB) and re-decimated on zoom; scatter falls back to
  density binning past a threshold; heatmaps draw to one canvas.
- **Work off the main thread.** Force layouts, large binning and sankey layout
  run in a worker when the data is large.
- **Update, do not rebuild.** Solid's fine-grained updates move a mark when its
  datum changes; appending to a streaming series costs one point, not a redraw.
- **Budgets to start from** (to be set from measurement in phase 0):
  100 000-point line rendered in under 50 ms and panned at 60 fps; 1 000 bars
  in SVG at 60 fps on hover; a line chart entry under 15 kB gzipped.

## Accessibility

- Every chart has a text description (what it shows, its range, its extremes)
  generated in viz-core, like `describeSlices` does for pies today.
- Keyboard: one tab stop per chart; arrows move between points and series,
  with the tooltip following focus. The same roving pattern as DataTable.
- "View as table": the data behind any chart, as a DataTable or a plain table.
- Colour: categorical palettes that stay distinct for colour-blind readers, and
  optional patterns. `prefers-reduced-motion` turns animation off.
- Right to left: axes and legends mirror.

## Interaction

Tooltip (nearest point or shared across series), crosshair, legend toggles,
zoom and pan (wheel, drag, keyboard), brush selection, click and keyboard
activation of a mark, charts linked by a shared cursor, annotations and
reference lines, export to PNG and SVG.

## What it draws, in phases

Each phase ends with its demos on the site and its checks in `bun run check`.

| Phase | Charts and pieces | Why first |
|---|---|---|
| **0. Foundation** | Packages and build, viz-core scales and ticks, Frame, axes, legend, tooltip, theming tokens, the accessibility skeleton, the benchmark page and size budgets. | Everything else stands on it. Needs B2's formatting. |
| **1. Business staples** | Line and area (stacked, 100%), bar and column (grouped, stacked, horizontal), bar + line on two axes, pie and donut, sparkline, bullet (actual against target). | The ERP review's B8 and every dashboard. |
| **2. Analytics** | Scatter and bubble (canvas), heatmap and calendar heatmap, histogram, box plot, waterfall (P&L bridge), funnel, gauge. | Finance and operations reporting. |
| **3. Hierarchy and flow** | Treemap, sunburst, sankey, tree and org chart, network graph (force layout in a worker). | "Graphs": relationships, not just series. |
| **4. Depth** | Zoom, pan and brush everywhere, linked charts, annotations, export, streaming data. | Turns charts into analysis tools. |

Geographic maps (choropleths) stay with the existing `Map` component until a
product needs them.

## How it will be checked

- **Pure logic in `bun run check`**: scales, ticks, formatting, stacking,
  decimation (a decimated series keeps every local extreme), layouts
  (treemap areas sum to the total; sankey flows balance), descriptions.
  Each check is proved able to fail, as `check:grid-range` was.
- **In a browser**: each demo driven headless, with counts reported (marks
  drawn, points focusable) so an empty chart cannot pass.
- **Benchmarks** against the budgets above, run on every phase.
- **Leaks**: mount, update and unmount a chart in a loop; nodes, listeners and
  heap stay flat. Canvas and worker resources are released on unmount.

## Open decisions

1. Lockstep version or its own (recommendation: lockstep).
2. Package names: `zen-ui-viz-*` or `zen-ui-charts-*`.
3. d3 math modules inside viz-core, or our own (recommendation: d3, wrapped).
4. Whether the existing `Chart` and `MicroChart` move onto viz once phase 1
   covers them (at a major version), or stay as they are.
5. How this relates to the themeless-core idea (todo.md): viz is themed only
   through tokens from the start, so it already fits a themeless core.
