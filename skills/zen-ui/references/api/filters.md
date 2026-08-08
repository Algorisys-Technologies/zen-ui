<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# filters — API (React, the parity reference)

Exports: `FilterVariant`, `TextOp`, `TextFilterValue`, `NumberOp`, `NumberFilterValue`, `NumberRangeFilterValue`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-filters>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### TextFilterValue (type)

- `op: TextOp`
- `value: string`

### NumberFilterValue (type)

- `op: NumberOp`
- `value: number | null`

### Other exports

- `FilterVariant` = `"number" | "boolean" | "text" | "select" | "numberRange"`
- `TextOp` = `"contains" | "equals" | "starts" | "ends"`
- `NumberOp` = `"eq" | "ne" | "gt" | "lt" | "gte" | "lte"`
- `NumberRangeFilterValue` = `[number | null, number | null]`
