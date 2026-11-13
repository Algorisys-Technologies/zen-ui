<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# capacity — API (React, the parity reference)

Exports: `capacityCell`, `capacityGrid`, `CapacityCell`, `CapacityGrid`, `CapacityGridInput`, `CapacityStatus`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-capacity>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### CapacityCell (type)

- `booked: number`
- `available: number`
- `load: number | null` — booked ÷ available; null without capacity.
- `status: CapacityStatus`

### CapacityGrid (type)

- `cells: Record<string, Record<string, CapacityCell>>`
- `rowTotals: Record<string, CapacityCell>`
- `periodTotals: Record<string, CapacityCell>`
- `total: CapacityCell`
- `overCount: number` — Cells over capacity or with work and no capacity.

### CapacityGridInput (type)

- `rows: { id: string; }[]`
- `periods: { id: string; }[]`
- `cells: { row: string; period: string; booked: number; available: number; }[]`
- `high?: number | undefined`

### Other exports

- `capacityCell(booked: number, available: number, options?: { high?: number; }): CapacityCell`
- `capacityGrid(i: CapacityGridInput): CapacityGrid`
- `CapacityStatus` = `"high" | "free" | "ok" | "over" | "no-capacity" | "closed"`
