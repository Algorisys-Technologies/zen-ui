<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# label — API (React, the parity reference)

Exports: `Label`, `labelVariants`, `LabelProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-label>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Label

- `required?: boolean | undefined` — Appends a decorative asterisk plus screen-reader-only "(required)".
- `disabled?: boolean | undefined` — Dims the label. Does not disable anything — labels take no input.
- `size?: "sm" | "md" | "lg" | null | undefined`
- …plus the underlying element's standard props (282 inherited).

### Other exports

- `labelVariants(props?: ({ size?: "sm" | "md" | "lg" | null | undefined; disabled?: boolean | null | undefined; } & import("/home/jaiprakash/jaiprakash/algorisys/code/zen-ui/node_modules/.bun/class-variance-authority@0.7.1/node_modules/class-variance-authority/dist/types").ClassProp) | undefined): string`

### Types

- `LabelProps` — type (see the component above)
