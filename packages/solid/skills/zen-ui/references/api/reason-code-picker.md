<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# reason-code-picker — API (React, the parity reference)

Exports: `ReasonCodePicker`, `ReasonCodePickerProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-reason-code-picker>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ReasonCodePicker

- `reasons: R[]`
- `value?: string | undefined`
- `defaultValue?: string | undefined`
- `onChange?: ((id: string, reason: R) => void) | undefined`
- `label?: string | undefined` — Names the list — the question it answers. Defaults to "Reason".
- `searchable?: boolean | undefined` — Show the search box. Defaults to on once there are more than 12 reasons.
- `showCategories?: boolean | undefined` — Show category chips. Defaults to on when there is more than one category.
- `ref?: React.Ref<HTMLDivElement> | undefined`
- …plus the underlying element's standard props (275 inherited).

### Types

- `ReasonCodePickerProps` — type (see the component above)
