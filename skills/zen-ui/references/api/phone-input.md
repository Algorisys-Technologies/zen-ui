<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# phone-input — API (React, the parity reference)

Exports: `PhoneInput`, `PhoneInputProps`, `PhoneValue`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-phone-input>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### PhoneInput

- `value?: PhoneValue | undefined`
- `defaultValue?: PhoneValue | undefined`
- `onValueChange?: ((next: PhoneValue) => void) | undefined`
- `countries?: { dialCode: string; name: string; iso?: string; }[] | undefined` — Restrict the selectable country list. Defaults to all entries in COUNTRY_CODES.
- `placeholder?: string | undefined`
- `disabled?: boolean | undefined`
- `name?: string | undefined`
- `className?: string | undefined`
- …plus the underlying element's standard props (2 inherited).

### PhoneValue (type)

- `country: string` — Dial code with leading "+" (e.g. "+91").
- `number: string` — Local national number (no country prefix).

### Types

- `PhoneInputProps` — type (see the component above)
