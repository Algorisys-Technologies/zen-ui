<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# measurement — API (React, the parity reference)

Exports: `judgeMeasurement`, `measurementScale`, `MeasurementJudgement`, `MeasurementScale`, `MeasurementSpec`, `MeasurementVerdict`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-measurement>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### MeasurementJudgement (type)

- `verdict: MeasurementVerdict | null`
- `side: "high" | "low" | null`
- `deviation: number | null` — Reading minus nominal; null without a nominal.

### MeasurementScale (type)

- `min: number`
- `max: number`
- `lower: number | null` — Positions as fractions 0..1 of the scale; null when absent.
- `upper: number | null`
- `nominal: number | null`
- `warnLower: number | null`
- `warnUpper: number | null`
- `value: number | null`
- `offScale: boolean` — The reading lies beyond the scale and is pinned to its end.

### MeasurementSpec (type)

- `nominal?: number | undefined`
- `lower?: number | undefined`
- `upper?: number | undefined`
- `warnLower?: number | undefined` — A warning band inside the limits: passing, but drifting toward a limit.
- `warnUpper?: number | undefined`

### Other exports

- `judgeMeasurement(value: number | null, spec: MeasurementSpec): MeasurementJudgement`
- `measurementScale(spec: MeasurementSpec, value: number | null): MeasurementScale`
- `MeasurementVerdict` = `"warn" | "pass" | "fail"`
