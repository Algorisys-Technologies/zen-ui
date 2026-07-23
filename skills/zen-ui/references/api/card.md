<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# card — API (React, the parity reference)

Exports: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `cardVariants`, `CardProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-card>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Card

- `variant?: "ghost" | "elevated" | "outlined" | null | undefined`
- `padding?: "sm" | "md" | "lg" | "none" | null | undefined`
- …plus the underlying element's standard props (280 inherited).

### CardHeader

- …plus the underlying element's standard props (280 inherited).

### CardTitle

- …plus the underlying element's standard props (280 inherited).

### CardDescription

- …plus the underlying element's standard props (280 inherited).

### CardContent

- …plus the underlying element's standard props (280 inherited).

### CardFooter

- …plus the underlying element's standard props (280 inherited).

### Other exports

- `cardVariants(props?: ({ variant?: "ghost" | "elevated" | "outlined" | null | undefined; padding?: "sm" | "md" | "lg" | "none" | null | undefined; } & import("/home/rajesh/work/algo/zen-ui/node_modules/class-variance-authority/dist/types").ClassProp) | undefined): string`

### Types

- `CardProps` — type (see the component above)
