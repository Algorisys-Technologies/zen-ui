<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# zen-ui-core-chart — API (React, the parity reference)

Exports: `Slice`, `CHART_PALETTE`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-zen-ui-core-chart>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Slice (type)

- `label: string`
- `value: number`
- `percent: number` — 0–1. Zero when the total is zero, never NaN.
- `color: string`
- `startAngle: number` — Degrees from 12 o'clock, clockwise.
- `endAngle: number`

### Other exports

- `CHART_PALETTE: string[]`
