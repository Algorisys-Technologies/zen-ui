<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# avatar — API (React, the parity reference)

Exports: `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarGroup`, `AvatarProps`, `AvatarGroupProps`, `AvatarSize`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-avatar>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Avatar

- `size?: AvatarSize | undefined`
- from `@radix-ui/react-avatar`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### AvatarImage

- from `@radix-ui/react-avatar`: `asChild?`, `onLoadingStatusChange?`
- …plus the underlying element's standard props (292 inherited).

### AvatarFallback

- from `@radix-ui/react-avatar`: `asChild?`, `delayMs?`
- …plus the underlying element's standard props (280 inherited).

### AvatarGroup

- `max?: number | undefined` — Maximum number of avatars to show. Excess collapses to "+N".
- `spacing?: "tight" | "default" | "loose" | undefined` — Spacing between stacked avatars (negative left margin on children).
- `size?: AvatarSize | undefined`
- …plus the underlying element's standard props (280 inherited).

### Other exports

- `AvatarSize` = `"sm" | "md" | "lg" | "xs" | "xl"`

### Types

- `AvatarProps` — type (see the component above)
- `AvatarGroupProps` — type (see the component above)
