<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# date-input — API (React, the parity reference)

Exports: `DateInput`, `isTypedDate`, `DateInputProps`, `DateOrder`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-date-input>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### DateInput

- `value?: Date | null | undefined`
- `defaultValue?: Date | null | undefined`
- `onValueChange?: ((date: Date | null) => void) | undefined` — A date, or null when the field is cleared. Not called for text that is not a date.
- `onInvalidInput?: ((text: string) => void) | undefined` — Called with the text when what was typed is not an acceptable date.
- `locale?: string | undefined` — The order dates are read and shown in, from this locale. Default: the browser's.
- `order?: DateOrder | undefined` — Overrides the locale's order.
- `min?: Date | undefined` — The earliest date accepted.
- `max?: Date | undefined` — The latest date accepted.
- `isDateDisabled?: ((date: Date) => boolean) | undefined` — Dates that cannot be chosen (holidays, say).
- `placeholder?: string | undefined` — Default: the order's pattern, DD/MM/YYYY.
- `invalid?: boolean | undefined` — Marked invalid by the form (the field marks typed text that is not a date itself).
- `disabled?: boolean | undefined`
- `id?: string | undefined` — Lands on the input, so `<label htmlFor>` names it.
- `aria-label?: string | undefined`
- `aria-labelledby?: string | undefined`
- `width?: string | undefined` — Width of the field. Default: the --zen-date-input-width token.
- `className?: string | undefined`

### Other exports

- `isTypedDate(text: string, order?: DateOrder): boolean`
- `DateOrder` = `"dmy" | "mdy" | "ymd"`

### Types

- `DateInputProps` — type (see the component above)
