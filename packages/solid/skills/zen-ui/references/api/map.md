<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# map — API (React, the parity reference)

Exports: `Map`, `MapProps`, `MapMarker`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-map>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Map

- `center: [number, number]`
- `zoom?: number | undefined`
- `markers?: MapMarker[] | undefined`
- `height?: string | number | undefined`
- `tileUrl?: string | undefined`
- `attribution?: string | undefined`
- `className?: string | undefined`

### MapMarker (type)

- `position: [number, number]`
- `label?: React.ReactNode`

### Types

- `MapProps` — type (see the component above)
