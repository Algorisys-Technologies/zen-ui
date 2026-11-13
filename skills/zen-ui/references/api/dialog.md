<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# dialog — API (React, the parity reference)

Exports: `Dialog`, `DialogTrigger`, `DialogPortal`, `DialogClose`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogContentProps`

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

- `variant?: "default" | "paper" | undefined` — `paper` turns the panel into a document sheet — see <Paper>. Default `default`, so existing dialogs are byte-identical. It is not a restyle, and that is why it is a variant rather than a class you could pass yourself. A document is TOP-ANCHORED: centring a long sheet vertically and then scrolling it inside 85vh puts the first line somewhere different on every screen, and the reader's eye has nowhere to rest. Paper mode drops the vertical centring, scrolls the VIEWPORT rather than the panel, and widens the cap so the measure has room to do its work.
- from `@radix-ui/react-primitive`: `asChild?`
- from `@radix-ui/react-dismissable-layer`: `deferPointerDownOutside?`, `onEscapeKeyDown?`, `onPointerDownOutside?`, `onFocusOutside?`, `onInteractOutside?`
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

### Types

- `DialogContentProps` — type (see the component above)
