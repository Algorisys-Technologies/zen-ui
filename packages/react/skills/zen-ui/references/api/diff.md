<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# diff — API (React, the parity reference)

Exports: `computeDiff`, `parseSnapshot`, `isKeyed`, `DiffRow`, `DiffKind`, `DiffOptions`, `DiffSnapshot`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-diff>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### DiffRow (type)

- `key: string`
- `label: string` — `labels[key]` when given, else the key verbatim.
- `kind: DiffKind`
- `before: unknown` — `undefined` when the key is absent from the before snapshot.
- `after: unknown` — `undefined` when the key is absent from the after snapshot.

### DiffOptions (type)

- `keys?: string[] | undefined` — Which keys to compare, in this order. Omitted compares every key on either side. An EMPTY array selects nothing — it is a filter the caller computed, not a missing argument.
- `labels?: Record<string, string> | undefined` — Display names. A key with no entry renders verbatim; humanising it would be guessing at the caller's wording.
- `changedOnly?: boolean | undefined` — Default `true` — an audit entry is about what changed.

### Other exports

- `computeDiff(before: DiffSnapshot, after: DiffSnapshot, options?: DiffOptions): DiffRow[]`
- `parseSnapshot(value: unknown): unknown`
- `isKeyed(value: unknown): value is Record<string, unknown>`
- `DiffKind` = `"added" | "removed" | "changed" | "unchanged"`
- `DiffSnapshot` = `Record<string, unknown> | undefined`
