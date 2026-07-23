<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# tree — API (React, the parity reference)

Exports: `Tree`, `TreeProps`, `TreeNode`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-tree>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Tree

- `items: TreeNode[]`
- `expanded?: string[] | undefined` — Controlled expanded ids.
- `defaultExpanded?: string[] | undefined`
- `onExpandedChange?: ((ids: string[]) => void) | undefined`
- `selected?: string | null | undefined` — Controlled selected id.
- `defaultSelected?: string | null | undefined`
- `onSelectedChange?: ((id: string) => void) | undefined`
- `aria-label?: string | undefined` — Accessible name — a tree must have one.
- …plus the underlying element's standard props (278 inherited).

### TreeNode (type)

- `id: string`
- `label: React.ReactNode`
- `icon?: "file" | "search" | "filter" | "chevron-down" | "chevron-up" | "chevron-right" | "chevron-left" | "chevrons-up-down" | "arrow-right" | "arrow-left" | "arrow-up" | "arrow-down" | "external-link" | "menu" | "more" | "more-vertical" | "home" | "check" | "check-circle" | "x" | "x-circle" | "info" | "warn" | "error" | "dash" | "dot" | "plus" | "minus" | "bell" | "calendar" | "clock" | "inbox" | "star" …`
- `children?: TreeNode[] | undefined`
- `disabled?: boolean | undefined`

### Types

- `TreeProps` — type (see the component above)
