<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# status-bar-status-bar — API (React, the parity reference)

Exports: `StatusBar`, `StatusBarProps`, `StatusBarItem`, `StatusBarColor`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-status-bar-status-bar>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### StatusBar

- `items: StatusBarItem[]`
- `variant?: "default" | "muted" | "accent" | undefined`
- `size?: "sm" | "md" | undefined`
- `label?: string | undefined` — The bar's accessible name. Default "Status bar".
- `onCollapse?: ((ids: string[]) => void) | undefined` — Called with the ids that gave way, whenever that set changes.
- …plus the underlying element's standard props (279 inherited).

### StatusBarItem (type)

- `id: string`
- `label?: React.ReactNode`
- `icon?: "file" | "search" | "filter" | "chevron-down" | "chevron-up" | "chevron-right" | "chevron-left" | "chevrons-up-down" | "arrow-right" | "arrow-left" | "arrow-up" | "arrow-down" | "external-link" | "menu" | "more" | "more-vertical" | "home" | "check" | "check-circle" | "x" | "x-circle" | "info" | "warn" | "error" | "dash" | "dot" | "pin" | "plus" | "minus" | "bell" | "calendar" | "clock" | "inbox" |…`
- `title?: string | undefined` — Tooltip, and part of the accessible name ("Problems 2"); the whole name of an icon-only item.
- `color?: StatusBarColor | undefined` — Shows the item as a soft chip in that colour.
- `onSelect?: (() => void) | undefined` — Makes the item a button.
- `disabled?: boolean | undefined`
- `align?: StatusBarAlign | undefined` — Default "start".
- `priority?: number | undefined` — Higher stays longer when the bar is narrow. Default 0.
- `hidden?: boolean | undefined`
- `separatorBefore?: boolean | undefined` — Draws a divider before the item.
- `announce?: boolean | undefined` — Announces changes to this item's text to screen readers (a polite live region).

### Other exports

- `StatusBarColor` = `"info" | "error" | "success" | "warning"`

### Types

- `StatusBarProps` — type (see the component above)
