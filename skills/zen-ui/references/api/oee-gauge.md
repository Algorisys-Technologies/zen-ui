<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# oee-gauge — API (React, the parity reference)

Exports: `OeeGauge`, `OeeGaugeProps`, `OeeGaugeSize`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-oee-gauge>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### OeeGauge

- `value: number | null` — OEE as a fraction, or null when there is nothing to show.
- `factors?: OeeFactors | undefined` — Availability, Performance and Quality, listed under the gauge when given.
- `bands?: OeeBands | undefined` — Where "near" and "on target" start. Defaults to 65% and 85%.
- `label?: string | undefined` — Names the gauge, visibly and for assistive tech. Defaults to "OEE".
- `size?: OeeGaugeSize | undefined`
- …plus the underlying element's standard props (279 inherited).

### Other exports

- `OeeGaugeSize` = `"sm" | "md" | "lg"`

### Types

- `OeeGaugeProps` — type (see the component above)
