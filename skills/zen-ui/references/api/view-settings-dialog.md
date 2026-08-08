<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# view-settings-dialog — API (React, the parity reference)

Exports: `ViewSettingsDialog`, `ViewSettingsDialogProps`, `ViewSettingsValue`, `ViewSettingsItem`, `ViewSettingsFilterGroup`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-view-settings-dialog>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ViewSettingsDialog

- `open: boolean`
- `onOpenChange: (open: boolean) => void`
- `title?: string | undefined`
- `description?: string | undefined` — Optional subtitle. Also the dialog's accessible description.
- `sortItems?: ViewSettingsItem[] | undefined`
- `groupItems?: ViewSettingsItem[] | undefined`
- `filterGroups?: ViewSettingsFilterGroup[] | undefined`
- `value?: ViewSettingsValue | undefined` — The settings the dialog opens with. Read when `open` becomes true.
- `onConfirm: (value: ViewSettingsValue) => void` — The only way settings escape.
- `confirmLabel?: string | undefined`
- `cancelLabel?: string | undefined`
- `resetLabel?: string | undefined`
- `sortTabLabel?: string | undefined`
- `groupTabLabel?: string | undefined`
- `filterTabLabel?: string | undefined`
- `className?: string | undefined`

### ViewSettingsValue (type)

- `sortBy?: string | null | undefined`
- `sortDescending?: boolean | undefined`
- `groupBy?: string | null | undefined`
- `groupDescending?: boolean | undefined`
- `filters?: Record<string, string[]> | undefined` — Filter group id → selected item ids.

### ViewSettingsItem (type)

- `id: string`
- `label: string`
- `description?: string | undefined` — Secondary line under the label.

### ViewSettingsFilterGroup (type)

- `id: string`
- `label: string`
- `multiple?: boolean | undefined` — Checkbox rows. Default: true — filters are usually "any of these".
- `items: ViewSettingsItem[]`

### Types

- `ViewSettingsDialogProps` — type (see the component above)
