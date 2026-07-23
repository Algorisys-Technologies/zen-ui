<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# alert-dialog — API (React, the parity reference)

Exports: `AlertDialog`, `AlertDialogTrigger`, `AlertDialogPortal`, `AlertDialogOverlay`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-alert-dialog>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### AlertDialog

- from `@radix-ui/react-dialog`: `children?`, `open?`, `onOpenChange?`, `defaultOpen?`

### AlertDialogTrigger

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (290 inherited).

### AlertDialogPortal

- from `@radix-ui/react-dialog`: `children?`, `container?`, `forceMount?`

### AlertDialogOverlay

- from `@radix-ui/react-primitive`: `asChild?`
- from `@radix-ui/react-dialog`: `forceMount?`
- …plus the underlying element's standard props (280 inherited).

### AlertDialogContent

- from `@radix-ui/react-primitive`: `asChild?`
- from `@radix-ui/react-dismissable-layer`: `onEscapeKeyDown?`, `onFocusOutside?`
- from `@radix-ui/react-dialog`: `onOpenAutoFocus?`, `onCloseAutoFocus?`, `forceMount?`
- …plus the underlying element's standard props (280 inherited).

### AlertDialogHeader

- …plus the underlying element's standard props (278 inherited).

### AlertDialogFooter

- …plus the underlying element's standard props (278 inherited).

### AlertDialogTitle

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### AlertDialogDescription

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### AlertDialogAction

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (290 inherited).

### AlertDialogCancel

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (290 inherited).
