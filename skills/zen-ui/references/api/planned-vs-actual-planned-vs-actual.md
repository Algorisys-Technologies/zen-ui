<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# planned-vs-actual-planned-vs-actual — API (React, the parity reference)

Exports: `PlannedVsActual`, `PlannedVsActualProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-planned-vs-actual-planned-vs-actual>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### PlannedVsActual

- `start: number | Date`
- `end: number | Date`
- `now?: number | Date | undefined` — Defaults to a clock that advances every 30 s.
- `plan?: CountPoint[] | undefined`
- `planTotal?: number | undefined`
- `actual: CountPoint[]`
- `unit?: string | undefined` — Appended to counts ("pcs", "kg").
- `tolerance?: number | undefined` — "On plan" within this fraction of the plan total. Default 0.02.
- `timeZone?: string | undefined` — IANA zone the time axis reads in.
- `hideChart?: boolean | undefined` — Hide the chart, keeping the figures (a tile, a table cell).
- …plus the underlying element's standard props (279 inherited).

### Types

- `PlannedVsActualProps` — type (see the component above)
