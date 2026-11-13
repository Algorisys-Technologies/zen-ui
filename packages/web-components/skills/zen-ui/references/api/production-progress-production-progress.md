<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# production-progress-production-progress — API (React, the parity reference)

Exports: `ProductionProgress`, `ProductionProgressProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-production-progress-production-progress>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ProductionProgress

- `target: number`
- `good: number`
- `scrap?: number | undefined`
- `label?: string | undefined` — Names the bar, visibly and for assistive tech: the work order, the step.
- `segments?: { size: number; count: number; unit: string; } | undefined` — Units the good count fills, e.g. `{ size: 12, count: 42, unit: "cartons" }`.
- `size?: "sm" | "md" | undefined`
- `hideText?: boolean | undefined` — Hide the counts line (the label and the bar's accessible text stay).
- …plus the underlying element's standard props (279 inherited).

### Types

- `ProductionProgressProps` — type (see the component above)
