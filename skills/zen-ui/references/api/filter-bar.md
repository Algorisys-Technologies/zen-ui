<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# filter-bar — API (React, the parity reference)

Exports: `FilterBar`, `FilterBarProps`, `FilterBarField`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-filter-bar>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### FilterBar

- `fields: FilterBarField[]`
- `onGo?: (() => void) | undefined` — Run the query. Without it, the Go button is not rendered.
- `onClear?: (() => void) | undefined` — Clear the controls. Without it, the Clear button is not rendered.
- `variant?: React.ReactNode` — Slot for a variant / saved-view control.
- `visibleIds?: string[] | undefined` — Controlled visible field ids. Uncontrolled default: everything not `hiddenByDefault`.
- `onVisibleIdsChange?: ((ids: string[]) => void) | undefined`
- `adaptable?: boolean | undefined` — The Adapt filters affordance. Default: true.
- `collapsible?: boolean | undefined` — The collapse chevron. Default: true.
- `defaultExpanded?: boolean | undefined`
- `goLabel?: string | undefined`
- `clearLabel?: string | undefined`
- `adaptLabel?: string | undefined`
- `className?: string | undefined`

### FilterBarField (type)

- `id: string`
- `label: string`
- `render: () => React.ReactNode` — The control for this filter.
- `hiddenByDefault?: boolean | undefined` — Kept off the bar until the user adds it via Adapt filters.

### Types

- `FilterBarProps` — type (see the component above)
