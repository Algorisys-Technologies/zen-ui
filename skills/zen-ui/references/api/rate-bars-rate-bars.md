<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# rate-bars-rate-bars — API (React, the parity reference)

Exports: `RateBars`, `RateBarsProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-rate-bars-rate-bars>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### RateBars

- `readings: CountPoint[]`
- `segments?: { state: import("packages/core/src/machine-state").MachineState; start: number | Date; end?: (number | Date) | null; }[] | undefined`
- `from: number | Date`
- `to: number | Date`
- `bucketMs?: number | undefined` — Bucket width. Default 2 minutes.
- `now?: number | Date | undefined` — Defaults to a clock that advances every 15 s.
- `target?: number | undefined` — Per hour, drawn as a line.
- `unit?: string | undefined` — Appended to rates ("pcs").
- `timeZone?: string | undefined`
- …plus the underlying element's standard props (279 inherited).

### Types

- `RateBarsProps` — type (see the component above)
