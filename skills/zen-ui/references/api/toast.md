<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# toast — API (React, the parity reference)

Exports: `Toast`, `ToastProvider`, `ToastViewport`, `ToastTitle`, `ToastDescription`, `ToastAction`, `ToastClose`, `toastVariants`, `ToastProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-toast>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Toast

- `variant?: "info" | "default" | "success" | "warning" | "destructive" | null | undefined`
- from `.bun`: `type?`, `onPause?`, `open?`, `onOpenChange?`, `duration?`, `asChild?`, `onEscapeKeyDown?`, `forceMount?`, `defaultOpen?`, `onResume?`, `onSwipeStart?`, `onSwipeMove?`, `onSwipeCancel?`, `onSwipeEnd?`
- …plus the underlying element's standard props (280 inherited).

### ToastProvider

- from `.bun`: `children?`, `label?`, `duration?`, `swipeDirection?`, `swipeThreshold?`, `announcerContainer?`

### ToastViewport

- from `.bun`: `label?`, `asChild?`, `hotkey?`
- …plus the underlying element's standard props (283 inherited).

### ToastTitle

- from `.bun`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### ToastDescription

- from `.bun`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### ToastAction

- from `.bun`: `asChild?`, `altText`
- …plus the underlying element's standard props (290 inherited).

### ToastClose

- from `.bun`: `asChild?`
- …plus the underlying element's standard props (290 inherited).

### Other exports

- `toastVariants(props?: ({ variant?: "info" | "default" | "success" | "warning" | "destructive" | null | undefined; } & import("/home/rajesh/work/algo/zen-ui/node_modules/.bun/class-variance-authority@0.7.1/node_modules/class-variance-authority/dist/types").ClassProp) | undefined): string`

### Types

- `ToastProps` — type (see the component above)
