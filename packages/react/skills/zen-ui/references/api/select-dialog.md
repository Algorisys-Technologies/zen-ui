<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# select-dialog — API (React, the parity reference)

Exports: `SelectDialog`, `SelectDialogProps`, `SelectDialogItem`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-select-dialog>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### SelectDialog

- `open: boolean`
- `onOpenChange: (open: boolean) => void`
- `title: string`
- `description?: string | undefined` — Optional subtitle. Also the dialog's accessible description.
- `items: SelectListItem[]`
- `multiple?: boolean | undefined` — Checkbox rows + an OK/Cancel commit step. Default: single-select.
- `selectedIds?: string[] | undefined` — The selection the dialog opens with. Read when `open` becomes true.
- `onConfirm: (ids: string[]) => void` — The only way selection escapes. Single mode passes exactly one id.
- `searchable?: boolean | undefined`
- `searchPlaceholder?: string | undefined`
- `onSearch?: ((query: string) => void) | undefined` — Take over filtering. When set, `items` is rendered as given.
- `emptyText?: string | undefined`
- `confirmLabel?: string | undefined`
- `cancelLabel?: string | undefined`
- `clearLabel?: string | undefined`
- `showClearAll?: boolean | undefined` — Multi-select only: a "Clear" action in the footer. Default: true.
- `className?: string | undefined`

### Other exports

- `SelectDialogItem` = `SelectListItem`

### Types

- `SelectDialogProps` — type (see the component above)
