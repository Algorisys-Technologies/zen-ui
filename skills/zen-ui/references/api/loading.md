<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# loading — API (React, the parity reference)

Exports: `Loading`, `spinnerVariants`, `LoadingProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-loading>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Loading

- `label?: string | undefined` — Accessible label (visually hidden). Default "Loading". Pass "" to mark decorative.
- `size?: "sm" | "md" | "lg" | "xl" | null | undefined`
- `color?: "info" | "error" | "primary" | "neutral" | "success" | "warning" | "current" | null | undefined`
- …plus the underlying element's standard props (487 inherited).

### Other exports

- `spinnerVariants(props?: ({ size?: "sm" | "md" | "lg" | "xl" | null | undefined; color?: "info" | "error" | "primary" | "neutral" | "success" | "warning" | "current" | null | undefined; } & import("/home/rajesh/work/algo/zen-ui/node_modules/class-variance-authority/dist/types").ClassProp) | undefined): string`

### Types

- `LoadingProps` — type (see the component above)
