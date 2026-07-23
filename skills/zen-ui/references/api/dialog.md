<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# dialog — API (React, the parity reference)

Exports: `Dialog`, `DialogTrigger`, `DialogPortal`, `DialogClose`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-dialog>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Dialog

- from `@radix-ui/react-dialog`: `children?`, `open?`, `defaultOpen?`, `onOpenChange?`, `modal?`

### DialogTrigger

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (290 inherited).

### DialogPortal

- from `@radix-ui/react-dialog`: `children?`, `container?`, `forceMount?`

### DialogClose

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (290 inherited).

### DialogOverlay

- from `@radix-ui/react-primitive`: `asChild?`
- from `@radix-ui/react-dialog`: `forceMount?`
- …plus the underlying element's standard props (280 inherited).

### DialogContent

- from `@radix-ui/react-primitive`: `asChild?`
- from `@radix-ui/react-dismissable-layer`: `onEscapeKeyDown?`, `onPointerDownOutside?`, `onFocusOutside?`, `onInteractOutside?`
- from `@radix-ui/react-dialog`: `onOpenAutoFocus?`, `onCloseAutoFocus?`, `forceMount?`
- …plus the underlying element's standard props (280 inherited).

### DialogHeader

- …plus the underlying element's standard props (278 inherited).

### DialogFooter

- …plus the underlying element's standard props (278 inherited).

### DialogTitle

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### DialogDescription

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).
