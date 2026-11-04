<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# filter-builder — API (React, the parity reference)

Exports: `FilterBuilder`, `FilterBuilderProps`, `FilterField`, `FilterGroup`, `FilterNode`, `FilterCondition`, `FilterOperator`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-filter-builder>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### FilterBuilder

- `fields: FilterField[]`
- `value?: FilterGroup | undefined`
- `defaultValue?: FilterGroup | undefined`
- `onValueChange?: ((value: FilterGroup) => void) | undefined`
- `maxDepth?: number | undefined` — How deep groups may nest. Default 3 (the top group and two levels inside it).
- `showSummary?: boolean | undefined` — The summary in words under the builder. Default true.
- `formatValue?: ((value: string | number, field: FilterField) => string) | undefined` — Spell a value in the summary (a currency, a local date). Default: as stored.
- `aria-label?: string | undefined` — Names the whole builder for assistive tech. Default "Filter".
- `className?: string | undefined`

### FilterField (type)

- `id: string`
- `label: string`
- `type: FilterFieldType`
- `options?: { value: string; label: string; }[] | undefined` — For enum fields: the choices.

### FilterGroup (type)

- `kind: "group"`
- `id: string`
- `join: "and" | "or"` — and: all of the children; or: any of them.
- `not?: boolean | undefined` — None of / not all of: the group's result negated.
- `children: FilterNode[]`

### FilterCondition (type)

- `kind: "condition"`
- `id: string`
- `field: string`
- `op: FilterOperator`
- `value?: FilterValue | undefined`
- `valueTo?: FilterValue | undefined` — The upper end, for between.

### FilterOperator (type)

- …plus the underlying element's standard props (50 inherited).

### Other exports

- `FilterNode` = `FilterGroup | FilterCondition`

### Types

- `FilterBuilderProps` — type (see the component above)
