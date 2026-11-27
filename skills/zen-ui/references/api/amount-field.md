<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# amount-field — API (React, the parity reference)

Exports: `AmountField`, `QuantityField`, `AmountFieldProps`, `QuantityFieldProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-amount-field>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### AmountField

- `value?: number | null | undefined`
- `defaultValue?: number | null | undefined`
- `onValueChange?: ((value: number | null) => void) | undefined` — The number, rounded to the field's precision, or null when emptied. Not called for text that is not a number.
- `onInvalidInput?: ((text: string) => void) | undefined` — Called with the text when what was typed is not an acceptable number.
- `locale?: string | undefined` — Default: the LocaleProvider's, else the browser's.
- `min?: number | undefined`
- `max?: number | undefined`
- `shorthand?: boolean | undefined` — Read 2.5k, 2L (lakh), 1.2Cr (crore), 3M. Default true.
- `placeholder?: string | undefined`
- `invalid?: boolean | undefined` — Marked invalid by the form (the field marks text it cannot read itself).
- `disabled?: boolean | undefined`
- `readOnly?: boolean | undefined`
- `id?: string | undefined` — Lands on the input, so `<label htmlFor>` names it.
- `name?: string | undefined`
- `aria-label?: string | undefined`
- `aria-labelledby?: string | undefined`
- `width?: string | undefined` — Width of the field. Default 100%.
- `className?: string | undefined`
- `currency?: string | undefined` — ISO 4217: "INR". Default: the LocaleProvider's. Without one, no symbol, two places.
- `precision?: number | undefined` — Decimal places. Default: the currency's own (INR 2, JPY 0, KWD 3).
- `allowNegative?: boolean | undefined` — Allow amounts below zero. Default false: a negative amount is usually a mistake on a form.
- …plus the underlying element's standard props (2 inherited).

### QuantityField

- `value?: number | null | undefined`
- `defaultValue?: number | null | undefined`
- `onValueChange?: ((value: number | null) => void) | undefined` — The number, rounded to the field's precision, or null when emptied. Not called for text that is not a number.
- `onInvalidInput?: ((text: string) => void) | undefined` — Called with the text when what was typed is not an acceptable number.
- `locale?: string | undefined` — Default: the LocaleProvider's, else the browser's.
- `min?: number | undefined`
- `max?: number | undefined`
- `shorthand?: boolean | undefined` — Read 2.5k, 2L (lakh), 1.2Cr (crore), 3M. Default true.
- `placeholder?: string | undefined`
- `invalid?: boolean | undefined` — Marked invalid by the form (the field marks text it cannot read itself).
- `disabled?: boolean | undefined`
- `readOnly?: boolean | undefined`
- `id?: string | undefined` — Lands on the input, so `<label htmlFor>` names it.
- `name?: string | undefined`
- `aria-label?: string | undefined`
- `aria-labelledby?: string | undefined`
- `width?: string | undefined` — Width of the field. Default 100%.
- `className?: string | undefined`
- `unit?: string | undefined` — Shown after the number: "Kg", "Nos", "Ltr".
- `precision?: number | undefined` — Decimal places the unit counts in. Default 0 (Nos); Kg usually 3.
- `allowNegative?: boolean | undefined` — Allow quantities below zero. Default false.
- …plus the underlying element's standard props (2 inherited).

### Types

- `AmountFieldProps` — type (see the component above)
- `QuantityFieldProps` — type (see the component above)
