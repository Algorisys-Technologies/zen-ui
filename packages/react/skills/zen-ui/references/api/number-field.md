<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# number-field — API (React, the parity reference)

Exports: `NumberField`, `NumberFieldProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-number-field>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### NumberField

- `value?: number | null | undefined`
- `defaultValue?: number | undefined`
- `min?: number | undefined`
- `max?: number | undefined`
- `step?: number | undefined`
- `onValueChange?: ((value: number | null) => void) | undefined` — Called with the new numeric value (or null when input is cleared).
- …plus the underlying element's standard props (303 inherited).

### Types

- `NumberFieldProps` — type (see the component above)
