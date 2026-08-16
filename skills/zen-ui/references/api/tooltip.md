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

- from `@radix-ui/react-tooltip`: `children?`, `open?`, `defaultOpen?`, `onOpenChange?`, `delayDuration?`, `disableHoverableContent?`

### TooltipTrigger

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (290 inherited).

### TooltipContent

- `arrow?: boolean | undefined` — Render an arrow pointing at the trigger. Default false.
- from `@radix-ui/react-tooltip`: `aria-label?`, `onEscapeKeyDown?`, `onPointerDownOutside?`, `forceMount?`
- from `@radix-ui/react-popper`: `align?`, `side?`, `sideOffset?`, `alignOffset?`, `arrowPadding?`, `avoidCollisions?`, `collisionBoundary?`, `collisionPadding?`, `sticky?`, `hideWhenDetached?`, `updatePositionStrategy?`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (279 inherited).

### TooltipProvider

- from `@radix-ui/react-tooltip`: `children`, `delayDuration?`, `skipDelayDuration?`, `disableHoverableContent?`

### TooltipPortal

- from `@radix-ui/react-tooltip`: `children?`, `container?`, `forceMount?`

### Types

- `TooltipContentProps` — type (see the component above)
