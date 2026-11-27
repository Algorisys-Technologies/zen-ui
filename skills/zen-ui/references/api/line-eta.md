<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# line-eta — API (React, the parity reference)

Exports: `lineEta`, `LineEta`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-line-eta>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### LineEta (type)

- `kind: "done" | "unknown" | "eta" | "not-running" | "no-rate"`

### Other exports

- `lineEta(i: { state: MachineState; target: number; good: number; perHour?: number; now: number | Date; }): LineEta`
