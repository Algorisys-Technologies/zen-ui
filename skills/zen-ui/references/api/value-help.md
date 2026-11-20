<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# value-help — API (React, the parity reference)

Exports: `ValueHelp`, `ValueHelpProps`, `ValueHelpCondition`, `ValueHelpOperator`, `ValueHelpResult`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-value-help>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ValueHelp

- `open: boolean`
- `onOpenChange: (open: boolean) => void`
- `title: string`
- `description?: string | undefined` — Optional subtitle. Also the dialog's accessible description.
- `items: SelectListItem[]`
- `multiple?: boolean | undefined` — Checkbox rows instead of single-pick rows. Default: single.
- `selectedIds?: string[] | undefined` — The selection the dialog opens with. Read when `open` becomes true.
- `conditions?: ValueHelpCondition[] | undefined` — The conditions the dialog opens with. Read when `open` becomes true.
- `onConfirm: (result: ValueHelpResult) => void` — The only way anything escapes. Blank-valued rules are dropped first.
- `searchable?: boolean | undefined`
- `searchPlaceholder?: string | undefined`
- `onSearch?: ((query: string) => void) | undefined` — Take over filtering. When set, `items` is rendered as given.
- `emptyText?: string | undefined`
- `confirmLabel?: string | undefined`
- `cancelLabel?: string | undefined`
- `selectTabLabel?: string | undefined`
- `conditionsTabLabel?: string | undefined`
- `addConditionLabel?: string | undefined`
- `className?: string | undefined`

### ValueHelpCondition (type)

- `id: string` — Stable row identity. Generated when a row is added.
- `exclude: boolean` — The exclude flag: the rule subtracts instead of adds.
- `operator: ValueHelpOperator`
- `value: string`
- `valueTo?: string | undefined` — Upper bound. Only meaningful for `BT`.

### ValueHelpResult (type)

- `ids: string[]`
- `conditions: ValueHelpCondition[]`

### Other exports

- `ValueHelpOperator` = `"EQ" | "Contains" | "StartsWith" | "EndsWith" | "BT" | "LT" | "LE" | "GT" | "GE"`

### Types

- `ValueHelpProps` — type (see the component above)
