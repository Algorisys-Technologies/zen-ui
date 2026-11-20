<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# oee — API (React, the parity reference)

Exports: `DEFAULT_OEE_BANDS`, `gaugeAngle`, `oeeBand`, `oeeFromCounts`, `OeeBand`, `OeeBands`, `OeeFactors`, `OeeInputs`, `OeeResult`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-oee>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### OeeBands (type)

- `fair: number`
- `good: number`

### OeeFactors (type)

- `availability: number | null`
- `performance: number | null`
- `quality: number | null`

### OeeInputs (type)

- `plannedTime: number` — Time the machine was scheduled to produce.
- `runTime: number` — Of that, the time it actually ran.
- `idealCycleTime: number` — The fastest one part can be made, in the same unit.
- `totalCount: number`
- `goodCount: number`

### OeeResult (type)

- `oee: number | null`
- `availability: number | null`
- `performance: number | null`
- `quality: number | null`

### Other exports

- `DEFAULT_OEE_BANDS: OeeBands`
- `gaugeAngle(value: number): number`
- `oeeBand(value: number | null, bands?: OeeBands): OeeBand | null`
- `oeeFromCounts(i: OeeInputs): OeeResult`
- `OeeBand` = `"poor" | "fair" | "good"`
