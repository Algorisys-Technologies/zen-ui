<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# use-toast — API (React, the parity reference)

Exports: `useToast`, `toast`, `ToastDescriptor`, `ToastInput`

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
- `open: boolean`
- `onOpenChange: (open: boolean) => void`

### ToastInput (type)

- `title?: React.ReactNode`
- `description?: React.ReactNode`
- `action?: React.ReactNode`
- `variant?: "info" | "default" | "success" | "warning" | "destructive" | null | undefined`
- `duration?: number | undefined`

### Other exports

- `useToast(): { toasts: ToastDescriptor[]; toast: (input: ToastInput) => { id: string; update: (next: ToastInput) => void; dismiss: () => void; }; dismiss: (id?: string) => void; }`
- `toast(input: ToastInput): { id: string; update: (next: ToastInput) => void; dismiss: () => void; }`
