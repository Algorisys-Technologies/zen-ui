<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# sheet — API (React, the parity reference)

Exports: `Sheet`, `SheetTrigger`, `SheetClose`, `SheetPortal`, `SheetOverlay`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `sheetContentVariants`, `SheetContentProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-sheet>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Sheet

- from `.bun`: `children?`, `open?`, `defaultOpen?`, `onOpenChange?`, `modal?`

### SheetTrigger

- from `.bun`: `asChild?`
- …plus the underlying element's standard props (290 inherited).

### SheetClose

- from `.bun`: `asChild?`
- …plus the underlying element's standard props (290 inherited).

### SheetPortal

- from `.bun`: `children?`, `container?`, `forceMount?`

### SheetOverlay

- from `.bun`: `asChild?`, `forceMount?`
- …plus the underlying element's standard props (280 inherited).

### SheetContent

- `showCloseButton?: boolean | undefined` — Show a built-in close ✕ in the top-right. Default true.
- `side?: "right" | "left" | "top" | "bottom" | null | undefined`
- from `.bun`: `asChild?`, `deferPointerDownOutside?`, `onEscapeKeyDown?`, `onPointerDownOutside?`, `onFocusOutside?`, `onInteractOutside?`, `onOpenAutoFocus?`, `onCloseAutoFocus?`, `forceMount?`
- …plus the underlying element's standard props (280 inherited).

### SheetHeader

- …plus the underlying element's standard props (278 inherited).

### SheetFooter

- …plus the underlying element's standard props (278 inherited).

### SheetTitle

- from `.bun`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### SheetDescription

- from `.bun`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### Other exports

- `sheetContentVariants(props?: ({ side?: "right" | "left" | "top" | "bottom" | null | undefined; } & import("/home/jaiprakash/jaiprakash/algorisys/code/zen-ui/node_modules/.bun/class-variance-authority@0.7.1/node_modules/class-variance-authority/dist/types").ClassProp) | undefined): string`

### Types

- `SheetContentProps` — type (see the component above)
