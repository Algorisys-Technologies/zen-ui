<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# dynamic-date-range — API (React, the parity reference)

Exports: `DynamicDateRange`, `DynamicDateRangeProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-dynamic-date-range>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### DynamicDateRange

- `value?: DateRangeValue | undefined`
- `defaultValue?: DateRangeValue | undefined`
- `onValueChange?: ((value: DateRangeValue | undefined, resolved: ResolvedRange) => void) | undefined` — Hands back the value to STORE and the dates to QUERY with.
- `operators?: DateRangeOperator[] | undefined` — Restrict the operator list. Defaults to all of them.
- `weekStartsOn?: number | undefined` — 0 = Sunday, matching the calendar.
- `now?: Date | undefined` — Override "now". For tests and stories — resolution is otherwise live.
- `placeholder?: string | undefined`
- `disabled?: boolean | undefined`
- `formatDate?: ((date: Date) => string) | undefined` — Formats dates in the trigger and the preview.
- `className?: string | undefined`

### Types

- `DynamicDateRangeProps` — type (see the component above)
