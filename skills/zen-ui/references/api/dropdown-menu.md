<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# dropdown-menu — API (React, the parity reference)

Exports: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuGroup`, `DropdownMenuPortal`, `DropdownMenuSub`, `DropdownMenuSubContent`, `DropdownMenuSubTrigger`, `DropdownMenuRadioGroup`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-dropdown-menu>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### DropdownMenu

- from `.bun`: `children?`, `dir?`, `open?`, `defaultOpen?`, `onOpenChange?`, `modal?`

### DropdownMenuTrigger

- from `.bun`: `asChild?`
- …plus the underlying element's standard props (290 inherited).

### DropdownMenuContent

- from `.bun`: `align?`, `asChild?`, `side?`, `sideOffset?`, `alignOffset?`, `arrowPadding?`, `avoidCollisions?`, `collisionBoundary?`, `collisionPadding?`, `sticky?`, `hideWhenDetached?`, `updatePositionStrategy?`, `onEscapeKeyDown?`, `onPointerDownOutside?`, `onFocusOutside?`, `onInteractOutside?`, `onCloseAutoFocus?`, `forceMount?`, `loop?`
- …plus the underlying element's standard props (279 inherited).

### DropdownMenuItem

- `inset?: boolean | undefined`
- `variant?: "default" | "destructive" | undefined`
- from `.bun`: `disabled?`, `onSelect?`, `asChild?`, `textValue?`
- …plus the underlying element's standard props (279 inherited).

### DropdownMenuCheckboxItem

- from `.bun`: `checked?`, `disabled?`, `onSelect?`, `asChild?`, `onCheckedChange?`, `textValue?`
- …plus the underlying element's standard props (279 inherited).

### DropdownMenuRadioItem

- from `.bun`: `disabled?`, `value`, `onSelect?`, `asChild?`, `textValue?`
- …plus the underlying element's standard props (279 inherited).

### DropdownMenuLabel

- `inset?: boolean | undefined`
- from `.bun`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### DropdownMenuSeparator

- from `.bun`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### DropdownMenuShortcut

- …plus the underlying element's standard props (278 inherited).

### DropdownMenuGroup

- from `.bun`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### DropdownMenuPortal

- from `.bun`: `children?`, `container?`, `forceMount?`

### DropdownMenuSub

- from `.bun`: `children?`, `open?`, `defaultOpen?`, `onOpenChange?`

### DropdownMenuSubContent

- from `.bun`: `align?`, `asChild?`, `sideOffset?`, `alignOffset?`, `arrowPadding?`, `avoidCollisions?`, `collisionBoundary?`, `collisionPadding?`, `sticky?`, `hideWhenDetached?`, `updatePositionStrategy?`, `onEscapeKeyDown?`, `onPointerDownOutside?`, `onFocusOutside?`, `onInteractOutside?`, `forceMount?`, `loop?`
- …plus the underlying element's standard props (279 inherited).

### DropdownMenuSubTrigger

- `inset?: boolean | undefined`
- from `.bun`: `disabled?`, `asChild?`, `textValue?`
- …plus the underlying element's standard props (280 inherited).

### DropdownMenuRadioGroup

- from `.bun`: `value?`, `onValueChange?`, `asChild?`
- …plus the underlying element's standard props (280 inherited).
