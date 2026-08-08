<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# date-range-picker — API (React, the parity reference)

Exports: `DateRangePicker`, `DateRangePickerProps`, `DateRange`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-date-range-picker>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### DateRangePicker

- `value?: DateRange | undefined`
- `defaultValue?: DateRange | undefined`
- `onValueChange?: ((range: DateRange | undefined) => void) | undefined`
- `placeholder?: string | undefined`
- `disabled?: import("/home/jaiprakash/jaiprakash/algorisys/code/zen-ui/node_modules/.bun/react-day-picker@10.0.1+e14d3f224186685e/node_modules/react-day-picker/dist/esm/index").Matcher | import("/home/jaiprakash/jaiprakash/algorisys/code/zen-ui/node_modules/.bun/react-day-picker@10.0.1+e14d3f224186685e/node_modules/react-day-picker/dist/esm/index").Matcher[] | undefined`
- `className?: string | undefined`
- `numberOfMonths?: number | undefined` — How many months to show side-by-side. Default 2.
- `formatDate?: ((date: Date) => string) | undefined` — Format used in the trigger label for each side. Defaults to toLocaleDateString().
- `cancelLabel?: string | undefined` — Label for the cancel action in the popover footer.
- `doneLabel?: string | undefined` — Label for the apply action in the popover footer.

### DateRange (type)

- from `.bun`: `from`, `to?`

### Types

- `DateRangePickerProps` — type (see the component above)
