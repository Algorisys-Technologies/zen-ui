<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# combobox — API (React, the parity reference)

Exports: `Combobox`, `ComboboxOption`, `ComboboxProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-combobox>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Combobox

- `options?: ComboboxOption[] | undefined` — Static option list (synchronous mode). Ignored if `onSearch` is provided.
- `onSearch?: ((query: string) => Promise<ComboboxOption[]>) | undefined` — Async loader (server-driven). Called on every input change, debounced.
- `value?: string | undefined` — Selected value. Pass "" / null to clear.
- `defaultValue?: string | undefined` — Defaults to "".
- `onValueChange?: ((value: string, option: ComboboxOption | null) => void) | undefined`
- `placeholder?: string | undefined` — Text shown when no value is selected.
- `searchPlaceholder?: string | undefined` — Placeholder inside the search input.
- `emptyMessage?: string | undefined` — Message when the result list is empty after filtering / search.
- `debounceMs?: number | undefined` — Async-mode: ms to wait after the last keystroke before calling onSearch.
- `creatable?: boolean | undefined` — Offer to create the typed text when it matches no option's label. Needs `onCreate` to do anything.
- `onCreate?: ((label: string) => ComboboxOption | void) | undefined` — Called with the typed text when the create row is chosen. Adding the option to your list is always yours — the component cannot know where the list lives or what a new `value` should be. RETURN the new option and it is selected for you. Return nothing and the value is left alone, so a caller who wants to select it later (after a round trip to a server, say) stays in control. Both are supported on purpose; returning is just the short path.
- `createLabel?: string | undefined` — Verb on the create row — `Create "foo"`. Default "Create".
- `width?: string | number | undefined` — Trigger button's width. Defaults to 240.
- `disabled?: boolean | undefined`
- `className?: string | undefined`

### ComboboxOption (type)

- `value: string`
- `label: string`
- `keywords?: string[] | undefined` — Optional extra text used by cmdk's fuzzy match.
- `disabled?: boolean | undefined`

### Types

- `ComboboxProps` — type (see the component above)
