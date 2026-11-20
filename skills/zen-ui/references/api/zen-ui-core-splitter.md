<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# zen-ui-core-splitter — API (React, the parity reference)

Exports: `normalizeSizes`, `dragHandle`, `handleBounds`, `splitterKeyDelta`, `mirrorDelta`, `SPLITTER_STEP`, `SPLITTER_STEP_LARGE`, `SplitterPanelConstraint`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-zen-ui-core-splitter>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### SplitterPanelConstraint (type)

- `min?: number | undefined` — Percent. Default 0.
- `max?: number | undefined` — Percent. Default 100.
- `collapsible?: boolean | undefined` — May snap shut when dragged past the threshold.
- `collapsedSize?: number | undefined` — Percent when collapsed. Default 0; non-zero leaves a rail.

### Other exports

- `normalizeSizes(sizes: number[] | undefined, count: number): number[]`
- `dragHandle(sizes: number[], handleIndex: number, delta: number, constraints: SplitterPanelConstraint[]): number[]`
- `handleBounds(sizes: number[], handleIndex: number, constraints: SplitterPanelConstraint[]): { min: number; max: number; }`
- `splitterKeyDelta(key: string, orientation: SplitterOrientation, shift: boolean): number | null`
- `mirrorDelta(delta: number, orientation: SplitterOrientation, direction: "ltr" | "rtl"): number`
- `SPLITTER_STEP: 1`
- `SPLITTER_STEP_LARGE: 10`
