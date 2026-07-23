<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# edit-cell — API (React, the parity reference)

Exports: `EditVariant`, `CellEditPayload`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-edit-cell>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### CellEditPayload (type)

- `rowId: string` — Stable row id — pass `getRowId` on your column defs for reliable identity.
- `columnId: string`
- `value: unknown` — Newly committed value. Stringified for text; number-or-null for number.

### Other exports

- `EditVariant` = `"number" | "text" | "select"`
