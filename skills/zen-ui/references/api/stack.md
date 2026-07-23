<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# stack — API (React, the parity reference)

Exports: `Stack`, `StackProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-stack>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Stack

- `direction?: "row" | "column" | undefined` — main-axis direction (default "column")
- `align?: "start" | "center" | "end" | "stretch" | undefined` — cross-axis alignment
- `justify?: "start" | "center" | "end" | "between" | undefined` — main-axis distribution
- `wrap?: boolean | undefined` — allow children to wrap (rows)
- `gap?: string | number | undefined` — gap between children — number = px, or any CSS length
- `padding?: string | number | undefined` — inner padding — number = px, or any CSS length
- …plus the underlying element's standard props (280 inherited).

### Types

- `StackProps` — type (see the component above)
