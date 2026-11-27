<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# measurement-input — API (React, the parity reference)

Exports: `MeasurementInput`, `MeasurementInputProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-measurement-input>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### MeasurementInput

- `spec: MeasurementSpec`
- `label: string`
- `unit?: string | undefined` — Shown after the field and the limits ("mm", "Nm").
- `precision?: number | undefined` — Decimals for the limits shown. Defaults to what the spec needs.
- `value?: number | null | undefined`
- `defaultValue?: number | null | undefined`
- `onChange?: ((value: number | null, judgement: MeasurementJudgement) => void) | undefined` — Every valid change, with its judgement; null when the field is empty or not a number.
- `disabled?: boolean | undefined`
- …plus the underlying element's standard props (277 inherited).

### Types

- `MeasurementInputProps` — type (see the component above)
