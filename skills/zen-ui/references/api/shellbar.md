<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# shellbar — API (React, the parity reference)

Exports: `ShellBar`, `ShellBarProps`, `ShellBarItem`, `ShellBarMenuItem`, `ShellBarProfile`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-shellbar>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ShellBar

- `logo?: React.ReactNode`
- `primaryTitle?: string | undefined`
- `secondaryTitle?: string | undefined`
- `menuItems?: ShellBarMenuItem[] | undefined` — Turns the title into a product-switcher dropdown.
- `searchable?: boolean | undefined`
- `search?: React.ReactNode | ((bar: { readonly compact: boolean; }) => React.ReactNode)` — Your own search control in the bar, in place of the built-in field: a command palette's trigger, say. Laid out by the bar like its own search. Pass a function to change with the space: `compact` is true where the built-in field would have shrunk to an icon, so the control can too. Replaces `searchable`'s field when both are given. search={(bar) => <PaletteButton iconOnly={bar.compact} />}
- `onSearch?: ((value: string) => void) | undefined`
- `searchPlaceholder?: string | undefined` — Placeholder AND the search field's visually-hidden label.
- `notificationCount?: number | undefined`
- `onNotificationsClick?: (() => void) | undefined`
- `profile?: ShellBarProfile | undefined`
- `items?: ShellBarItem[] | undefined` — Custom action icons; these overflow into a menu when space runs out.
- `onLogoClick?: (() => void) | undefined`
- `overflowLabel?: string | undefined`
- `aria-label?: string | undefined` — Accessible name — a banner landmark needs one. Defaults to `primaryTitle`.
- …plus the underlying element's standard props (278 inherited).

### ShellBarItem (type)

- `id: string`
- `label: string` — Icon-only on the bar, so this is the accessible name AND the menu label.
- `icon: "file" | "search" | "filter" | "chevron-down" | "chevron-up" | "chevron-right" | "chevron-left" | "chevrons-up-down" | "arrow-right" | "arrow-left" | "arrow-up" | "arrow-down" | "external-link" | "menu" | "more" | "more-vertical" | "home" | "check" | "check-circle" | "x" | "x-circle" | "info" | "warn" | "error" | "dash" | "dot" | "pin" | "plus" | "minus" | "bell" | "calendar" | "bar-chart" | "cloc…`
- `onSelect?: (() => void) | undefined`
- `disabled?: boolean | undefined`
- `overflow?: "auto" | "never" | undefined` — `never` pins the item to the bar; anything else collapses when needed.

### ShellBarMenuItem (type)

- `id: string`
- `label: React.ReactNode`
- `icon?: "file" | "search" | "filter" | "chevron-down" | "chevron-up" | "chevron-right" | "chevron-left" | "chevrons-up-down" | "arrow-right" | "arrow-left" | "arrow-up" | "arrow-down" | "external-link" | "menu" | "more" | "more-vertical" | "home" | "check" | "check-circle" | "x" | "x-circle" | "info" | "warn" | "error" | "dash" | "dot" | "pin" | "plus" | "minus" | "bell" | "calendar" | "bar-chart" | "cloc…`
- `onSelect?: (() => void) | undefined`
- `disabled?: boolean | undefined`
- `separatorBefore?: boolean | undefined` — Renders a divider before this entry.

### ShellBarProfile (type)

- `name: string` — Accessible name of the trigger, and the menu's heading.
- `image?: string | undefined`
- `initials?: string | undefined` — Falls back to initials derived from `name`.
- `menuItems?: ShellBarMenuItem[] | undefined`
- `menu?: (() => React.ReactNode) | undefined` — The menu's own body, in place of `menuItems`: DropdownMenu parts — labels, radio groups, checkbox items — for a menu that holds settings as well as actions (appearance, density, sign out). Rendered under the name heading. A function, called when the menu opens (the Solid binding needs that to build the parts inside the menu's context; the shape is kept the same here).
- `onClick?: (() => void) | undefined`

### Types

- `ShellBarProps` — type (see the component above)
