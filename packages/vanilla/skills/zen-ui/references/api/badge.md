<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# badge — API (React, the parity reference)

Exports: `Badge`, `badgeVariants`, `BadgeProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-badge>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Badge

- `asChild?: boolean | undefined`
- `color?: "info" | "error" | "primary" | "neutral" | "success" | "warning" | null | undefined`
- `variant?: "solid" | "outline" | "soft" | null | undefined`
- …plus the underlying element's standard props (279 inherited).

### Other exports

- `badgeVariants(props?: ({ variant?: "solid" | "outline" | "soft" | null | undefined; color?: "info" | "error" | "primary" | "neutral" | "success" | "warning" | null | undefined; } & import("/home/rajesh/work/algo/zen-ui/node_modules/class-variance-authority/dist/types").ClassProp) | undefined): string`

### Types

- `BadgeProps` — type (see the component above)
