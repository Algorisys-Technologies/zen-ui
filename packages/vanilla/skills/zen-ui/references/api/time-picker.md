<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# time-picker — API (React, the parity reference)

Exports: `TimePicker`, `TimePickerProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-time-picker>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### TimePicker

- `value?: string | undefined`
- `defaultValue?: string | undefined`
- `onValueChange?: ((value: string | undefined) => void) | undefined`
- `format?: Format | undefined` — "24h" (default) or "12h" — controls what the user sees, not the emitted value.
- `showSeconds?: boolean | undefined` — Render seconds segment. Emitted value becomes "HH:MM:SS".
- `minuteStep?: number | undefined` — Step in minutes for ArrowUp/Down on the minutes segment. Default 1.
- `disabled?: boolean | undefined`
- `readOnly?: boolean | undefined`
- `name?: string | undefined` — Name for the hidden input so the value submits with native forms.
- `id?: string | undefined`
- `className?: string | undefined`
- `aria-label?: string | undefined`
- `aria-labelledby?: string | undefined`
- …plus the underlying element's standard props (2 inherited).

### Types

- `TimePickerProps` — type (see the component above)
