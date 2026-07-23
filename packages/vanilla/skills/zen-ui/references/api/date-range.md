<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# date-range — API (React, the parity reference)

Exports: `DateRangeValue`, `DateRangeOperator`, `ResolvedRange`, `OperatorMeta`, `resolveDateRange`, `formatDateRangeValue`, `DATE_RANGE_OPERATORS`, `parseISODate`, `toISODate`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-date-range>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### DateRangeValue (type)

- `operator: FixedOperator | CountOperator | DateOperator | "BETWEEN"`

### ResolvedRange (type)

- `from?: Date | undefined`
- `to?: Date | undefined`

### OperatorMeta (type)

- `operator: DateRangeOperator`
- `label: string`
- `arity: OperatorArity`
- `group: "Day" | "Week" | "Month" | "Quarter" | "Year" | "Rolling" | "Fixed"` — For grouping in the UI.
- `unit?: string | undefined` — Singular/plural noun for a count operator's label: "7 days".

### Other exports

- `DateRangeOperator` = `FixedOperator | CountOperator | DateOperator | "BETWEEN"`
- `resolveDateRange(value: DateRangeValue | null | undefined, now?: Date, options?: ResolveOptions): ResolvedRange`
- `formatDateRangeValue(value: DateRangeValue | null | undefined, formatDate?: (d: Date) => string): string`
- `DATE_RANGE_OPERATORS: OperatorMeta[]`
- `parseISODate(s: string): Date | null`
- `toISODate(d: Date): string`
