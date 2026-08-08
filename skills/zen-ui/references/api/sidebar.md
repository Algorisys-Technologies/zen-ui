<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# sidebar — API (React, the parity reference)

Exports: `SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`, `SidebarTrigger`, `useSidebar`, `SidebarProviderProps`, `SidebarMenuButtonProps`, `SidebarMenuSubProps`, `SidebarMenuSubButtonProps`, `SidebarTriggerProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-sidebar>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### SidebarProvider

- `children: React.ReactNode`
- `defaultCollapsed?: boolean | undefined` — uncontrolled initial collapsed state (default false)
- `collapsed?: boolean | undefined` — controlled collapsed state
- `onCollapsedChange?: ((collapsed: boolean) => void) | undefined`

### Sidebar

- …plus the underlying element's standard props (280 inherited).

### SidebarHeader

- …plus the underlying element's standard props (280 inherited).

### SidebarContent

- …plus the underlying element's standard props (280 inherited).

### SidebarFooter

- …plus the underlying element's standard props (280 inherited).

### SidebarGroup

- …plus the underlying element's standard props (280 inherited).

### SidebarGroupLabel

- …plus the underlying element's standard props (280 inherited).

### SidebarMenu

- …plus the underlying element's standard props (280 inherited).

### SidebarMenuItem

- …plus the underlying element's standard props (281 inherited).

### SidebarMenuButton

- `asChild?: boolean | undefined`
- `active?: boolean | undefined` — render as the current / selected item
- …plus the underlying element's standard props (290 inherited).

### SidebarMenuSub

- `label: React.ReactNode` — The parent row's label. Doubles as the flyout heading when collapsed.
- `icon?: React.ReactNode`
- `defaultOpen?: boolean | undefined` — uncontrolled initial expanded state (default false)
- `open?: boolean | undefined` — controlled expanded state
- `onOpenChange?: ((open: boolean) => void) | undefined`
- `active?: boolean | undefined` — mark the parent row as holding the current item
- `children?: React.ReactNode`
- `className?: string | undefined`

### SidebarMenuSubItem

- …plus the underlying element's standard props (281 inherited).

### SidebarMenuSubButton

- `asChild?: boolean | undefined`
- `active?: boolean | undefined` — render as the current / selected item
- …plus the underlying element's standard props (290 inherited).

### SidebarTrigger

- `asChild?: boolean | undefined`
- …plus the underlying element's standard props (290 inherited).

### Other exports

- `useSidebar(): SidebarContextValue`

### Types

- `SidebarProviderProps` — type (see the component above)
- `SidebarMenuButtonProps` — type (see the component above)
- `SidebarMenuSubProps` — type (see the component above)
- `SidebarMenuSubButtonProps` — type (see the component above)
- `SidebarTriggerProps` — type (see the component above)
