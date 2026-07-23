<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# icon — API (React, the parity reference)

Exports: `Icon`, `ZEN_ICON_NAMES`, `IconProps`, `IconName`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-icon>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Icon

- `name: "file" | "search" | "filter" | "chevron-down" | "chevron-up" | "chevron-right" | "chevron-left" | "chevrons-up-down" | "arrow-right" | "arrow-left" | "arrow-up" | "arrow-down" | "external-link" | "menu" | "more" | "more-vertical" | "home" | "check" | "check-circle" | "x" | "x-circle" | "info" | "warn" | "error" | "dash" | "dot" | "plus" | "minus" | "bell" | "calendar" | "clock" | "inbox" | "star" …`
- `size?: number | undefined` — Width and height in px. Default 16 — matches the inline SVGs this replaces.
- `title?: string | undefined` — Accessible name. Omit for decorative icons.
- …plus the underlying element's standard props (487 inherited).

### IconName (type)

- …plus the underlying element's standard props (50 inherited).

### Other exports

- `ZEN_ICON_NAMES: ("file" | "search" | "filter" | "chevron-down" | "chevron-up" | "chevron-right" | "chevron-left" | "chevrons-up-down" | "arrow-right" | "arrow-left" | "arrow-up" | "arrow-down" | "external-link" | "menu" | "more" | "more-vertical" | "home" | "check" | "check-circle" | "x" | "x-circle" | "info" | "warn" | "error" | "dash" | "dot" | "plus" | "minus" | "bell" | "calendar" | "clock" | "inbox" | "star"…`

### Types

- `IconProps` — type (see the component above)
