<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# popover — API (React, the parity reference)

Exports: `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-popover>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Popover

- from `@radix-ui/react-popover`: `children?`, `open?`, `defaultOpen?`, `onOpenChange?`, `modal?`

### PopoverTrigger

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (290 inherited).

### PopoverContent

- from `@radix-ui/react-popper`: `align?`, `side?`, `sideOffset?`, `alignOffset?`, `arrowPadding?`, `avoidCollisions?`, `collisionBoundary?`, `collisionPadding?`, `sticky?`, `hideWhenDetached?`, `updatePositionStrategy?`
- from `@radix-ui/react-primitive`: `asChild?`
- from `@radix-ui/react-dismissable-layer`: `onEscapeKeyDown?`, `onPointerDownOutside?`, `onFocusOutside?`, `onInteractOutside?`
- from `@radix-ui/react-popover`: `onOpenAutoFocus?`, `onCloseAutoFocus?`, `forceMount?`
- …plus the underlying element's standard props (280 inherited).

### PopoverAnchor

- from `@radix-ui/react-primitive`: `asChild?`
- from `@radix-ui/react-popper`: `virtualRef?`
- …plus the underlying element's standard props (280 inherited).
