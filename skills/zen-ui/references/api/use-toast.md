<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# use-toast — API (React, the parity reference)

Exports: `useToast`, `toast`, `ToastDescriptor`, `ToastInput`, `ToastOptions`, `ToastPromiseMessages`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-use-toast>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ToastDescriptor (type)

- `id: string`
- `title?: React.ReactNode`
- `description?: React.ReactNode`
- `action?: React.ReactNode`
- `variant?: "info" | "default" | "success" | "warning" | "destructive" | null | undefined`
- `duration?: number | undefined` — Time before auto-dismiss, ms. Default 5_000. Pass `Infinity` for sticky.
- `loading?: boolean | undefined` — Work in progress — `toast.loading()`: a spinner beside the title.
- `open: boolean`
- `onOpenChange: (open: boolean) => void`

### ToastInput (type)

- `title?: React.ReactNode`
- `description?: React.ReactNode`
- `action?: React.ReactNode`
- `variant?: "info" | "default" | "success" | "warning" | "destructive" | null | undefined`
- `duration?: number | undefined`
- `loading?: boolean | undefined` — Work in progress: a spinner beside the title.

### ToastOptions (type)

- `id?: string | undefined`
- `duration?: number | undefined` — ms. Default 5_000; `toast.loading` defaults to sticky.

### Other exports

- `useToast(…)`
- `toast(input: ToastInput): ReturnType<typeof show>`
- `ToastPromiseMessages` = `ToastPromiseMessages<T>`
