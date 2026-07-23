<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# progress — API (React, the parity reference)

Exports: `Progress`, `ProgressProps`, `ProgressSize`, `ProgressColor`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-progress>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Progress

- `size?: ProgressSize | undefined`
- `color?: ProgressColor | undefined`
- from `@radix-ui/react-progress`: `max?`, `value?`, `getValueLabel?`
- from `@radix-ui/react-avatar`: `asChild?`
- …plus the underlying element's standard props (279 inherited).

### Other exports

- `ProgressSize` = `"sm" | "md" | "lg"`
- `ProgressColor` = `"info" | "error" | "primary" | "neutral" | "success" | "warning"`

### Types

- `ProgressProps` — type (see the component above)
