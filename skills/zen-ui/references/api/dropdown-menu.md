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

- from `@radix-ui/react-dropdown-menu`: `children?`, `dir?`, `open?`, `defaultOpen?`, `onOpenChange?`, `modal?`

### DropdownMenuTrigger

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (290 inherited).

### DropdownMenuContent

- from `@radix-ui/react-popper`: `align?`, `side?`, `sideOffset?`, `alignOffset?`, `arrowPadding?`, `avoidCollisions?`, `collisionBoundary?`, `collisionPadding?`, `sticky?`, `hideWhenDetached?`, `updatePositionStrategy?`
- from `@radix-ui/react-primitive`: `asChild?`
- from `@radix-ui/react-menu`: `onEscapeKeyDown?`, `onPointerDownOutside?`, `onFocusOutside?`, `onInteractOutside?`, `onCloseAutoFocus?`, `forceMount?`, `loop?`
- …plus the underlying element's standard props (279 inherited).

### DropdownMenuItem

- `inset?: boolean | undefined`
- `variant?: "default" | "destructive" | undefined`
- from `@radix-ui/react-menu`: `disabled?`, `onSelect?`, `textValue?`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (279 inherited).

### DropdownMenuCheckboxItem

- from `@radix-ui/react-menu`: `checked?`, `disabled?`, `onSelect?`, `onCheckedChange?`, `textValue?`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (279 inherited).

### DropdownMenuRadioItem

- from `@radix-ui/react-menu`: `disabled?`, `value`, `onSelect?`, `textValue?`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (279 inherited).

### DropdownMenuLabel

- `inset?: boolean | undefined`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### DropdownMenuSeparator

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### DropdownMenuShortcut

- …plus the underlying element's standard props (278 inherited).

### DropdownMenuGroup

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### DropdownMenuPortal

- from `@radix-ui/react-menu`: `children?`, `container?`, `forceMount?`

### DropdownMenuSub

- from `@radix-ui/react-dropdown-menu`: `children?`, `open?`, `defaultOpen?`, `onOpenChange?`

### DropdownMenuSubContent

- from `@radix-ui/react-primitive`: `asChild?`
- from `@radix-ui/react-popper`: `sideOffset?`, `alignOffset?`, `arrowPadding?`, `avoidCollisions?`, `collisionBoundary?`, `collisionPadding?`, `sticky?`, `hideWhenDetached?`, `updatePositionStrategy?`
- from `@radix-ui/react-menu`: `onEscapeKeyDown?`, `onPointerDownOutside?`, `onFocusOutside?`, `onInteractOutside?`, `forceMount?`, `loop?`
- …plus the underlying element's standard props (279 inherited).

### DropdownMenuSubTrigger

- `inset?: boolean | undefined`
- from `@radix-ui/react-menu`: `disabled?`, `textValue?`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### DropdownMenuRadioGroup

- from `@radix-ui/react-menu`: `value?`, `onValueChange?`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).
