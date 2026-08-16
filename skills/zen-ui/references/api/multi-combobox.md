<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# multi-combobox — API (React, the parity reference)

Exports: `MultiCombobox`, `MultiComboboxProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-multi-combobox>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### MultiCombobox

- `options?: ComboboxOption[] | undefined`
- `onSearch?: ((query: string) => Promise<ComboboxOption[]>) | undefined`
- `value?: string[] | undefined`
- `defaultValue?: string[] | undefined`
- `onValueChange?: ((value: string[], options: ComboboxOption[]) => void) | undefined`
- `placeholder?: string | undefined`
- `searchPlaceholder?: string | undefined`
- `emptyMessage?: string | undefined`
- `debounceMs?: number | undefined`
- `creatable?: boolean | undefined` — Offer to create the typed text when it matches no option's label. Needs `onCreate` to do anything.
- `onCreate?: ((label: string) => ComboboxOption | void) | undefined` — Called with the typed text when the create row is chosen. Adding the option to your list is always yours — the component cannot know where the list lives or what a new `value` should be. RETURN the new option and it is APPENDED to the selection, which is what "create a tag" almost always means. Return nothing and the selection is left alone. Mirrors Combobox, where returning selects instead of appends — the difference is the selection model, not the contract.
- `createLabel?: string | undefined` — Verb on the create row — `Create "foo"`. Default "Create".
- `width?: string | number | undefined` — Trigger button min width. Defaults to 240.
- `maxDisplayed?: number | undefined` — Cap how many chips show in the trigger before collapsing into "+N more". Default 3.
- `disabled?: boolean | undefined`
- `className?: string | undefined`
- `showClearAll?: boolean | undefined` — Show a "Clear all" button inside the popover when ≥ 1 selected. Default true.

### Types

- `MultiComboboxProps` — type (see the component above)
