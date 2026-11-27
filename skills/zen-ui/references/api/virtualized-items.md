<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# virtualized-items — API (React, the parity reference)

Exports: `VirtualizedItems`, `VirtualizedItemsProps`, `VirtualizedItemsDenseProps`, `VirtualizedItemsSparseProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-virtualized-items>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### VirtualizedItems

- `items: T[]`
- `children: (args: { item: T; index: number; }) => React.ReactNode`
- `getKey?: ((item: T, index: number) => string | number) | undefined` — Optional key extractor; defaults to index.
- `estimateSize?: number | ((index: number) => number) | undefined` — Estimated height of a row, in px. Defaults to 36.
- `maxHeight?: number | undefined` — Max height of the scrolling viewport in px. Defaults to 280.
- `overscan?: number | undefined` — Number of rows to render above / below the viewport for smoother scroll.
- `className?: string | undefined`

### Types

- `VirtualizedItemsProps` — type (see the component above)
- `VirtualizedItemsDenseProps` — type (see the component above)
- `VirtualizedItemsSparseProps` — type (see the component above)
