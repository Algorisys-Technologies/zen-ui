<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# zen-ui-core-planned-vs-actual — API (React, the parity reference)

Exports: `planAt`, `plannedVsActual`, `readingAt`, `CountPoint`, `PlannedVsActualInput`, `PlannedVsActualResult`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-zen-ui-core-planned-vs-actual>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### CountPoint (type)

- `at: number | Date`
- `value: number` — Cumulative pieces at that moment.

### PlannedVsActualInput (type)

- `start: number | Date`
- `end: number | Date`
- `now: number | Date`
- `plan?: CountPoint[] | undefined` — Cumulative plan points. Or `planTotal`, spread evenly.
- `planTotal?: number | undefined`
- `actual: CountPoint[]` — Cumulative counter readings.
- `tolerance?: number | undefined` — "On plan" when the gap is within this fraction of the plan total. Default 0.02.

### PlannedVsActualResult (type)

- `at: number` — The moment measured: now, or the end once it has passed.
- `planNow: number`
- `actualNow: number`
- `gap: number` — actual − plan: negative is behind.
- `status: "on" | "ahead" | "behind"`
- `planTotal: number`
- `projected: number | null` — Pieces by the end at the pace so far; null too early and once final.
- `final: boolean`

### Other exports

- `planAt(points: readonly CountPoint[], t: number): number`
- `plannedVsActual(i: PlannedVsActualInput): PlannedVsActualResult`
- `readingAt(points: readonly CountPoint[], t: number): number`
