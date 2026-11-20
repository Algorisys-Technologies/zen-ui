<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# genealogy-graph — API (React, the parity reference)

Exports: `GenealogyGraph`, `GenealogyGraphProps`, `GenealogyNode`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-genealogy-graph>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### GenealogyGraph

- `nodes: GenealogyNode[]`
- `edges: GenealogyEdge[]`
- `focus?: string | undefined`
- `defaultFocus?: string | undefined`
- `onFocusChange?: ((id: string) => void) | undefined`
- `maxDepth?: number | undefined` — Levels each way. Default 3.
- …plus the underlying element's standard props (279 inherited).

### GenealogyNode (type)

- `id: string`
- `label: string`
- `kind?: string | undefined` — What it is: "Material lot", "Work order", "Pallet".
- `detail?: string | undefined` — A second line: a quantity, a date, a status.

### Types

- `GenealogyGraphProps` — type (see the component above)
