<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# zen-ui-core-production-progress — API (React, the parity reference)

Exports: `productionProgress`, `segmentFill`, `ProductionCounts`, `ProductionProgressResult`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-zen-ui-core-production-progress>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ProductionCounts (type)

- `target: number`
- `good: number`
- `scrap?: number | undefined`

### ProductionProgressResult (type)

- `target: number`
- `good: number`
- `scrap: number`
- `remaining: number` — Good still needed; never negative.
- `over: number` — Good beyond the target.
- `done: boolean`
- `started: boolean` — Anything made at all, good or scrap.
- `goodFraction: number` — Fractions of the bar, summing to at most 1.
- `scrapFraction: number`

### Other exports

- `productionProgress(c: ProductionCounts): ProductionProgressResult`
- `segmentFill(value: number, perSegment: number, segments: number): number[]`
