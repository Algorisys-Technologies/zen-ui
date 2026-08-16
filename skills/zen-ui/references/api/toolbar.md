<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# toolbar — API (React, the parity reference)

Exports: `Toolbar`, `ToolbarProps`, `ToolbarAction`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-toolbar>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Toolbar

- `actions: ToolbarAction[]`
- `aria-label?: string | undefined` — Accessible name — a toolbar needs one.
- `overflowLabel?: string | undefined`
- `size?: "sm" | "md" | "lg" | "xs" | "xl" | null | undefined`
- …plus the underlying element's standard props (279 inherited).

### ToolbarAction (type)

- `id: string`
- `label: React.ReactNode`
- `icon?: "file" | "search" | "filter" | "chevron-down" | "chevron-up" | "chevron-right" | "chevron-left" | "chevrons-up-down" | "arrow-right" | "arrow-left" | "arrow-up" | "arrow-down" | "external-link" | "menu" | "more" | "more-vertical" | "home" | "check" | "check-circle" | "x" | "x-circle" | "info" | "warn" | "error" | "dash" | "dot" | "plus" | "minus" | "bell" | "calendar" | "clock" | "inbox" | "star" …`
- `onSelect?: (() => void) | undefined`
- `disabled?: boolean | undefined`
- `variant?: "link" | "solid" | "outline" | "soft" | "ghost" | null | undefined`
- `color?: "info" | "error" | "primary" | "neutral" | "success" | "warning" | null | undefined`
- `overflow?: "auto" | "never" | undefined` — `never` pins the action to the bar; anything else collapses when needed.
- `separatorBefore?: boolean | undefined` — Renders a divider before this action, in the bar and in the menu.

### Types

- `ToolbarProps` — type (see the component above)
