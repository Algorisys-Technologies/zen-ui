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

- from `.bun`: `children?`, `open?`, `defaultOpen?`, `onOpenChange?`, `modal?`

### PopoverTrigger

- from `.bun`: `asChild?`
- …plus the underlying element's standard props (290 inherited).

### PopoverContent

- from `.bun`: `align?`, `asChild?`, `side?`, `sideOffset?`, `alignOffset?`, `arrowPadding?`, `avoidCollisions?`, `collisionBoundary?`, `collisionPadding?`, `sticky?`, `hideWhenDetached?`, `updatePositionStrategy?`, `deferPointerDownOutside?`, `onEscapeKeyDown?`, `onPointerDownOutside?`, `onFocusOutside?`, `onInteractOutside?`, `onOpenAutoFocus?`, `onCloseAutoFocus?`, `forceMount?`
- …plus the underlying element's standard props (280 inherited).

### PopoverAnchor

- from `.bun`: `asChild?`, `virtualRef?`
- …plus the underlying element's standard props (280 inherited).
