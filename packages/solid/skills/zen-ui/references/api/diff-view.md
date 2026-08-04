<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# diff-view — API (React, the parity reference)

Exports: `DiffView`, `DiffViewProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-diff-view>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### DiffView

- `before?: unknown` — Either snapshot, in whatever shape your audit column actually holds: an object, a JSON string, a bare array, plain prose, or empty for "there was no before". Strings are parsed with `parse`; a string that is not JSON is kept as the text it is rather than lost to a failed parse. Two objects are compared field by field. Anything else is shown whole, side by side, because an array has no field names to put in the left column.
- `after?: unknown` — As `before`. Omit for a record that was deleted.
- `parse?: ((raw: string) => unknown) | undefined` — Override how a raw string becomes a value. Defaults to a JSON parse that never throws.
- `keys?: string[] | undefined` — Which keys to compare, in this order. Omitted compares every key on either side.
- `labels?: Record<string, string> | undefined` — Display names for keys. Unlisted keys render verbatim.
- `changedOnly?: boolean | undefined` — Default `true` — an audit entry is about what changed.
- `format?: ((value: unknown, key: string) => React.ReactNode) | undefined` — How a value becomes something to look at. The default prints strings verbatim, `null` as the literal word (a cleared field and an absent one are different events), and anything else through `JSON.stringify`.
- `headings?: { key?: string; before?: string; after?: string; } | undefined` — Column headings. Defaults to "Field" / "Before" / "After".
- `density?: "default" | "compact" | undefined` — `"compact"` tightens the rows for a Timeline slot or a popover.
- `emptyMessage?: React.ReactNode` — Shown when nothing changed — the common case in an audit log, not an error.
- `className?: string | undefined`

### Types

- `DiffViewProps` — type (see the component above)
