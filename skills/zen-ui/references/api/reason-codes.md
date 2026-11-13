<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# reason-codes — API (React, the parity reference)

Exports: `filterReasons`, `reasonCategories`, `ReasonCode`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-reason-codes>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ReasonCode (type)

- `id: string`
- `label: string`
- `code?: string | undefined` — The plant's short code ("M12"). Operators who know it type it.
- `category?: string | undefined`
- `description?: string | undefined` — A longer explanation, searched but shown only where there is room.

### Other exports

- `filterReasons<R extends ReasonCode>(reasons: readonly R[], options: { category?: string; query?: string; }): R[]`
- `reasonCategories(reasons: readonly ReasonCode[]): { id: string; count: number; }[]`
