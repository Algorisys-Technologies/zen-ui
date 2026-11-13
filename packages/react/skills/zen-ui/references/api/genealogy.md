<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# genealogy — API (React, the parity reference)

Exports: `traceGenealogy`, `GenealogyEdge`, `GenealogyNodeInput`, `GenealogyTrace`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-genealogy>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### GenealogyEdge (type)

- `from: string` — The input…
- `to: string` — …and what it went into.

### GenealogyNodeInput (type)

- `id: string`

### Other exports

- `traceGenealogy<N extends GenealogyNodeInput>(nodes: readonly N[], edges: readonly GenealogyEdge[], focusId: string, options?: { maxDepth?: number; }): GenealogyTrace<N>`
- `GenealogyTrace` = `GenealogyTrace<N>`
