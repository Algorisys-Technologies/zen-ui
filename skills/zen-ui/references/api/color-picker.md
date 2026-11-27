<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# color-picker — API (React, the parity reference)

Exports: `ColorPicker`, `ColorPickerProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-color-picker>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ColorPicker

- `value?: string | undefined`
- `defaultValue?: string | undefined`
- `onValueChange?: ((hex: string) => void) | undefined`
- `colors?: (string | ColorOption)[] | undefined` — The palette inside the popover. Omit for none.
- `allowCustom?: boolean | undefined` — The hex field + the platform picker. Default true.
- `label?: string | undefined` — Accessible name for the trigger.
- `placeholder?: string | undefined` — Text when nothing is chosen yet.
- `disabled?: boolean | undefined`
- `className?: string | undefined`

### Types

- `ColorPickerProps` — type (see the component above)
