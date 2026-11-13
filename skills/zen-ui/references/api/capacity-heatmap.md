<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# capacity-heatmap — API (React, the parity reference)

Exports: `CapacityHeatmap`, `CapacityHeatmapProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-capacity-heatmap>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### CapacityHeatmap

- `rows: { id: string; label?: string; }[]`
- `periods: { id: string; label?: string; }[]`
- `cells: { row: string; period: string; booked: number; available: number; }[]`
- `high?: number | undefined` — Where "high" starts. Default 0.85.
- `label?: string | undefined` — Names the table. Defaults to "Capacity".
- `showTotals?: boolean | undefined` — Row and column totals. Default true.
- `onCellClick?: ((row: string, period: string, cell: CapacityCell) => void) | undefined`
- …plus the underlying element's standard props (279 inherited).

### Types

- `CapacityHeatmapProps` — type (see the component above)
