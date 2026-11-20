<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# splitter-splitter — API (React, the parity reference)

Exports: `Splitter`, `SplitterPanel`, `SplitterHandle`, `SplitterProps`, `SplitterPanelProps`, `SplitterHandleProps`, `SplitterOrientation`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-splitter-splitter>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Splitter

- `orientation?: SplitterOrientation | undefined`
- `sizes?: number[] | undefined` — Controlled. Percentages summing to 100.
- `defaultSizes?: number[] | undefined` — Uncontrolled starting layout. Defaults to an even split.
- `onSizesChange?: ((sizes: number[]) => void) | undefined` — Fires during the drag, batched to one animation frame.
- `onSizesCommit?: ((sizes: number[]) => void) | undefined` — Fires once on release. This is what to persist.
- `disabled?: boolean | undefined`
- `className?: string | undefined`
- `children?: React.ReactNode`

### SplitterPanel

- `className?: string | undefined`
- `children?: React.ReactNode`
- `min?: number | undefined` — Percent. Default 0.
- `max?: number | undefined` — Percent. Default 100.
- `collapsible?: boolean | undefined` — May snap shut when dragged past the threshold.
- `collapsedSize?: number | undefined` — Percent when collapsed. Default 0; non-zero leaves a rail.

### SplitterHandle

- `label?: string | undefined` — Required by the pattern: a separator with no name cannot be told from three others.
- `disabled?: boolean | undefined`
- `className?: string | undefined`
- `children?: React.ReactNode`

### Other exports

- `SplitterOrientation` = `"horizontal" | "vertical"`

### Types

- `SplitterProps` — type (see the component above)
- `SplitterPanelProps` — type (see the component above)
- `SplitterHandleProps` — type (see the component above)
