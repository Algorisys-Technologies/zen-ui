<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# alert — API (React, the parity reference)

Exports: `Alert`, `AlertIcon`, `AlertContent`, `AlertTitle`, `AlertDescription`, `AlertActions`, `AlertClose`, `alertVariants`, `AlertProps`, `AlertCloseProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-alert>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Alert

- `color?: "info" | "primary" | "neutral" | "success" | "warning" | "destructive" | null | undefined`
- `variant?: "outline" | "soft" | null | undefined`
- …plus the underlying element's standard props (279 inherited).

### AlertIcon

- …plus the underlying element's standard props (280 inherited).

### AlertContent

- …plus the underlying element's standard props (280 inherited).

### AlertTitle

- …plus the underlying element's standard props (280 inherited).

### AlertDescription

- …plus the underlying element's standard props (280 inherited).

### AlertActions

- …plus the underlying element's standard props (280 inherited).

### AlertClose

- …plus the underlying element's standard props (290 inherited).

### Other exports

- `alertVariants(props?: ({ color?: "info" | "primary" | "neutral" | "success" | "warning" | "destructive" | null | undefined; variant?: "outline" | "soft" | null | undefined; } & import("/home/rajesh/work/algo/zen-ui/node_modules/class-variance-authority/dist/types").ClassProp) | undefined): string`

### Types

- `AlertProps` — type (see the component above)
- `AlertCloseProps` — type (see the component above)
