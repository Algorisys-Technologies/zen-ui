<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# lookup-field — API (React, the parity reference)

Exports: `LookupField`, `LookupFieldProps`, `LookupColumn`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-lookup-field>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### LookupField

- `columns: LookupColumn<T>[]`
- `rows?: T[] | undefined` — The rows to search here. Ignored when `onSearch` is given.
- `onSearch?: ((query: string, signal: AbortSignal) => Promise<T[]>) | undefined` — Rows from you, for what is typed: a server search. Abort on the signal; the newest query wins.
- `minQueryLength?: number | undefined` — With onSearch: the fewest characters before searching. Default 1.
- `debounce?: number | undefined` — With onSearch: milliseconds to wait after typing stops. Default 200.
- `rowKey: (row: T) => string`
- `rowLabel?: ((row: T) => string) | undefined` — The closed field's text for a row. Default: its first column.
- `value?: T | null | undefined`
- `defaultValue?: T | null | undefined`
- `onValueChange?: ((row: T | null) => void) | undefined` — The chosen row, whole, or null when the field is emptied.
- `onValueHelp?: ((query: string) => void) | undefined` — F4, or the button: open the full search (ValueHelp) with what is typed. The field shows a button when set.
- `maxRows?: number | undefined` — The most rows listed. Default 50.
- `placeholder?: string | undefined`
- `emptyMessage?: string | undefined`
- `invalid?: boolean | undefined`
- `disabled?: boolean | undefined`
- `id?: string | undefined` — Lands on the input, so `<label htmlFor>` names it.
- `aria-label?: string | undefined`
- `aria-labelledby?: string | undefined`
- `width?: string | undefined` — Width of the field. Default 100%.
- `listWidth?: string | undefined` — Width of the table under it. Default: as wide as its content needs, at least the field and the --zen-lookup-list-width token, at most the --zen-lookup-list-max-width token (and the window).
- `className?: string | undefined`

### Other exports

- `LookupColumn` = `LookupColumn<T>`

### Types

- `LookupFieldProps` — type (see the component above)
