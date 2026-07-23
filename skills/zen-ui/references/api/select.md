<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# select — API (React, the parity reference)

Exports: `Select`, `SelectGroup`, `SelectValue`, `SelectTrigger`, `SelectContent`, `SelectLabel`, `SelectItem`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-select>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Select

- from `@radix-ui/react-select`: `children?`, `open?`, `defaultOpen?`, `onOpenChange?`, `dir?`, `name?`, `autoComplete?`, `disabled?`, `required?`, `form?`, `value?`, `defaultValue?`, `onValueChange?`

### SelectGroup

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### SelectValue

- from `@radix-ui/react-select`: `placeholder?`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### SelectTrigger

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (290 inherited).

### SelectContent

- from `@radix-ui/react-popper`: `align?`, `side?`, `sideOffset?`, `alignOffset?`, `arrowPadding?`, `avoidCollisions?`, `collisionBoundary?`, `collisionPadding?`, `sticky?`, `hideWhenDetached?`, `updatePositionStrategy?`
- from `@radix-ui/react-primitive`: `asChild?`
- from `@radix-ui/react-select`: `onEscapeKeyDown?`, `onPointerDownOutside?`, `onCloseAutoFocus?`, `position?`
- …plus the underlying element's standard props (280 inherited).

### SelectLabel

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### SelectItem

- from `@radix-ui/react-select`: `disabled?`, `value`, `textValue?`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### SelectSeparator

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### SelectScrollUpButton

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### SelectScrollDownButton

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).
