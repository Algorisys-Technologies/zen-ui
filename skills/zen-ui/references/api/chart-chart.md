<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# chart-chart — API (React, the parity reference)

Exports: `Chart`, `ChartProps`, `ChartSeries`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-chart-chart>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Chart

- `type?: "area" | "line" | "bar" | "pie" | "donut" | undefined`
- `data: Record<string, any>[]`
- `series: ChartSeries[]` — For line/area/bar: one entry per plotted series. For pie/donut: only the FIRST entry is read — it names the value on each row. A pie has one number per slice; a second series would be a second pie.
- `xKey: string` — key on each row used for the x-axis — or, for pie/donut, the slice label
- `colors?: string[] | undefined` — Slice colours for pie/donut, in row order, wrapping if short. Defaults to the zen palette. (Per-series `color` cannot express this: a pie is one series and many colours.)
- `height?: number | undefined`
- `className?: string | undefined`

### ChartSeries (type)

- `key: string` — key into each data row
- `label?: string | undefined` — legend / tooltip label (defaults to `key`)
- `color?: string | undefined` — override colour (any CSS colour; defaults to the zen palette)

### Types

- `ChartProps` — type (see the component above)
