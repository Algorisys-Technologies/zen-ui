<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# button — API (React, the parity reference)

Exports: `Button`, `buttonVariants`, `ButtonProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-button>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Button

- `asChild?: boolean | undefined` — Render the variant styles onto the child element (Radix Slot pattern).
- `loading?: boolean | undefined` — When true, shows a spinner and disables the button.
- `iconLeft?: React.ReactNode` — Icon node placed before children.
- `iconRight?: React.ReactNode` — Icon node placed after children.
- `size?: "sm" | "md" | "lg" | "xs" | "xl" | null | undefined`
- `color?: "info" | "error" | "primary" | "neutral" | "success" | "warning" | null | undefined`
- `variant?: "link" | "solid" | "outline" | "soft" | "ghost" | null | undefined`
- `shape?: "circle" | "default" | "square" | "block" | null | undefined`
- `multiline?: boolean | null | undefined`
- …plus the underlying element's standard props (289 inherited).

### Other exports

- `buttonVariants(…)`

### Types

- `ButtonProps` — type (see the component above)
