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
- from `@radix-ui/react-toast`: `type?`, `onPause?`, `open?`, `onOpenChange?`, `onEscapeKeyDown?`, `forceMount?`, `defaultOpen?`, `duration?`, `onResume?`, `onSwipeStart?`, `onSwipeMove?`, `onSwipeCancel?`, `onSwipeEnd?`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### ToastProvider

- from `@radix-ui/react-toast`: `children?`, `label?`, `duration?`, `swipeDirection?`, `swipeThreshold?`

### ToastViewport

- from `@radix-ui/react-toast`: `label?`, `hotkey?`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (283 inherited).

### ToastTitle

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### ToastDescription

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### ToastAction

- from `@radix-ui/react-primitive`: `asChild?`
- from `@radix-ui/react-toast`: `altText`
- …plus the underlying element's standard props (290 inherited).

### ToastClose

- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (290 inherited).

### Other exports

- `toastVariants(props?: ({ variant?: "info" | "default" | "success" | "warning" | "destructive" | null | undefined; } & import("/home/rajesh/work/algo/zen-ui/node_modules/class-variance-authority/dist/types").ClassProp) | undefined): string`

### Types

- `ToastProps` — type (see the component above)
