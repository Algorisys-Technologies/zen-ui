<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# tooltip — API (React, the parity reference)

Exports: `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`, `TooltipPortal`, `TooltipContentProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-tooltip>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Tooltip

- from `.bun`: `children?`, `open?`, `defaultOpen?`, `onOpenChange?`, `delayDuration?`, `disableHoverableContent?`

### TooltipTrigger

- from `.bun`: `asChild?`
- …plus the underlying element's standard props (290 inherited).

### TooltipContent

- `arrow?: boolean | undefined` — Render an arrow pointing at the trigger. Default false.
- from `.bun`: `aria-label?`, `align?`, `asChild?`, `side?`, `sideOffset?`, `alignOffset?`, `arrowPadding?`, `avoidCollisions?`, `collisionBoundary?`, `collisionPadding?`, `sticky?`, `hideWhenDetached?`, `updatePositionStrategy?`, `onEscapeKeyDown?`, `onPointerDownOutside?`, `forceMount?`
- …plus the underlying element's standard props (279 inherited).

### TooltipProvider

- from `.bun`: `children`, `delayDuration?`, `skipDelayDuration?`, `disableHoverableContent?`

### TooltipPortal

- from `.bun`: `children?`, `container?`, `forceMount?`

### Types

- `TooltipContentProps` — type (see the component above)
