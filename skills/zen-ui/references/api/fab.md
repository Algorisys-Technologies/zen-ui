<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# fab — API (React, the parity reference)

Exports: `FAB`, `FABProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-fab>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### FAB

- `size?: "md" | "lg" | "xl" | undefined`
- `color?: "info" | "error" | "primary" | "neutral" | "success" | "warning" | null | undefined`
- `asChild?: boolean | undefined` — Render the variant styles onto the child element (Radix Slot pattern).
- `loading?: boolean | undefined` — When true, shows a spinner and disables the button.
- `variant?: "link" | "solid" | "outline" | "soft" | "ghost" | null | undefined`
- `multiline?: boolean | null | undefined`
- `iconLeft?: React.ReactNode` — Icon node placed before children.
- `iconRight?: React.ReactNode` — Icon node placed after children.
- `position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | null | undefined`
- …plus the underlying element's standard props (289 inherited).

### Types

- `FABProps` — type (see the component above)
