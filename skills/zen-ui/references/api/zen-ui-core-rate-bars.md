<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# zen-ui-core-rate-bars — API (React, the parity reference)

Exports: `rateBuckets`, `RateBucket`, `RateBucketsInput`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-zen-ui-core-rate-bars>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### RateBucket (type)

- `start: number`
- `end: number`
- `count: number`
- `perHour: number` — Output per hour over the time the bucket covers (elapsed only, if partial).
- `state: "running" | "idle" | "stopped" | "fault" | "waiting" | "setup" | "cleaning" | "maintenance" | "unknown"`
- `partial: boolean` — Contains now: still filling.

### RateBucketsInput (type)

- `readings: CountPoint[]`
- `segments?: { state: MachineState; start: Time; end?: Time | null; }[] | undefined`
- `from: Time`
- `to: Time`
- `bucketMs: number`
- `now: Time`

### Other exports

- `rateBuckets(i: RateBucketsInput): RateBucket[]`
