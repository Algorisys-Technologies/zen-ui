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

- from `.bun`: `children?`, `open?`, `defaultOpen?`, `onOpenChange?`, `modal?`

### DialogTrigger

- from `.bun`: `asChild?`
- …plus the underlying element's standard props (290 inherited).

### DialogPortal

- from `.bun`: `children?`, `container?`, `forceMount?`

### DialogClose

- from `.bun`: `asChild?`
- …plus the underlying element's standard props (290 inherited).

### DialogOverlay

- from `.bun`: `asChild?`, `forceMount?`
- …plus the underlying element's standard props (280 inherited).

### DialogContent

- from `.bun`: `asChild?`, `deferPointerDownOutside?`, `onEscapeKeyDown?`, `onPointerDownOutside?`, `onFocusOutside?`, `onInteractOutside?`, `onOpenAutoFocus?`, `onCloseAutoFocus?`, `forceMount?`
- …plus the underlying element's standard props (280 inherited).

### DialogHeader

- …plus the underlying element's standard props (278 inherited).

### DialogFooter

- …plus the underlying element's standard props (278 inherited).

### DialogTitle

- from `.bun`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### DialogDescription

- from `.bun`: `asChild?`
- …plus the underlying element's standard props (280 inherited).
