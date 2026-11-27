<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# row-keys — API (React, the parity reference)

Exports: `rowKeyTarget`, `cellKeyTarget`, `ownsArrowKeys`, `ROW_PAGE_STEP`, `GridCell`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-row-keys>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### GridCell (type)

- `row: number`
- `col: number`

### Other exports

- `rowKeyTarget(key: string, index: number, count: number, page?: number): number | null`
- `cellKeyTarget(key: string, at: GridCell, rows: number, cols: number, ctrl?: boolean): GridCell | null`
- `ownsArrowKeys(target: EventTarget | null): boolean`
- `ROW_PAGE_STEP: 10`
