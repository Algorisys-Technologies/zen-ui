<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# date-time-picker — API (React, the parity reference)

Exports: `DateTimePicker`, `DateTimePickerProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-date-time-picker>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### DateTimePicker

- `value?: Date | undefined`
- `defaultValue?: Date | undefined`
- `onValueChange?: ((date: Date | undefined) => void) | undefined`
- `placeholder?: string | undefined`
- `disabled?: import("/home/rajesh/work/algo/zen-ui/node_modules/react-day-picker/dist/esm/index").Matcher | import("/home/rajesh/work/algo/zen-ui/node_modules/react-day-picker/dist/esm/index").Matcher[] | undefined`
- `className?: string | undefined`
- `format?: Format | undefined` — "24h" (default) or "12h" — controls only the displayed time format.
- `showSeconds?: boolean | undefined` — Show seconds segment in the time picker.
- `minuteStep?: number | undefined` — Minute stepping for ArrowUp/Down on the minutes segment. Default 1.
- `formatDate?: ((date: Date) => string) | undefined` — Render the date portion of the trigger label.
- `formatTime?: ((date: Date, format: Format) => string) | undefined` — Render the time portion of the trigger label.

### Types

- `DateTimePickerProps` — type (see the component above)
