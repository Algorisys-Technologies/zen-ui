<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# context-menu — API (React, the parity reference)

Exports: `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuCheckboxItem`, `ContextMenuRadioItem`, `ContextMenuLabel`, `ContextMenuSeparator`, `ContextMenuShortcut`, `ContextMenuGroup`, `ContextMenuPortal`, `ContextMenuSub`, `ContextMenuSubContent`, `ContextMenuSubTrigger`, `ContextMenuRadioGroup`, `ContextMenuProps`, `ContextMenuTriggerProps`, `ContextMenuContentProps`, `ContextMenuItemProps`, `ContextMenuCheckboxItemProps`, `ContextMenuRadioItemProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-context-menu>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ContextMenu

- from `@radix-ui/react-context-menu`: `children?`, `open?`, `onOpenChange?`, `dir?`, `modal?`

### ContextMenuTrigger

- from `@radix-ui/react-context-menu`: `disabled?`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### ContextMenuContent

- from `@radix-ui/react-primitive`: `asChild?`
- from `@radix-ui/react-popper`: `alignOffset?`, `arrowPadding?`, `avoidCollisions?`, `collisionBoundary?`, `collisionPadding?`, `sticky?`, `hideWhenDetached?`, `updatePositionStrategy?`
- from `@radix-ui/react-menu`: `onEscapeKeyDown?`, `onPointerDownOutside?`, `onFocusOutside?`, `onInteractOutside?`, `onCloseAutoFocus?`, `forceMount?`, `loop?`
- …plus the underlying element's standard props (279 inherited).

### ContextMenuItem

- `inset?: boolean | undefined`
- `variant?: "default" | "destructive" | undefined`
- from `@radix-ui/react-menu`: `disabled?`, `onSelect?`, `textValue?`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (279 inherited).

### ContextMenuCheckboxItem

- from `@radix-ui/react-menu`: `checked?`, `disabled?`, `onSelect?`, `onCheckedChange?`, `textValue?`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (279 inherited).

### ContextMenuRadioItem

- from `@radix-ui/react-menu`: `disabled?`, `value`, `onSelect?`, `textValue?`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (279 inherited).

### ContextMenuLabel

- `inset?: boolean | undefined`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### ContextMenuSeparator

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### ContextMenuShortcut

- …plus the underlying element's standard props (278 inherited).

### ContextMenuGroup

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### ContextMenuPortal

- from `@radix-ui/react-menu`: `children?`, `container?`, `forceMount?`

### ContextMenuSub

- from `@radix-ui/react-context-menu`: `children?`, `open?`, `defaultOpen?`, `onOpenChange?`

### ContextMenuSubContent

- from `@radix-ui/react-menu`: `align?`, `onEscapeKeyDown?`, `onPointerDownOutside?`, `onFocusOutside?`, `onInteractOutside?`, `forceMount?`, `loop?`
- from `@radix-ui/react-primitive`: `asChild?`
- from `@radix-ui/react-popper`: `sideOffset?`, `alignOffset?`, `arrowPadding?`, `avoidCollisions?`, `collisionBoundary?`, `collisionPadding?`, `sticky?`, `hideWhenDetached?`, `updatePositionStrategy?`
- …plus the underlying element's standard props (279 inherited).

### ContextMenuSubTrigger

- `inset?: boolean | undefined`
- from `@radix-ui/react-menu`: `disabled?`, `textValue?`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### ContextMenuRadioGroup

- from `@radix-ui/react-menu`: `value?`, `onValueChange?`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### Types

- `ContextMenuProps` — type (see the component above)
- `ContextMenuTriggerProps` — type (see the component above)
- `ContextMenuContentProps` — type (see the component above)
- `ContextMenuItemProps` — type (see the component above)
- `ContextMenuCheckboxItemProps` — type (see the component above)
- `ContextMenuRadioItemProps` — type (see the component above)
