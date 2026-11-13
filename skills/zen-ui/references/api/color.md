<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# color — API (React, the parity reference)

Exports: `ColorOption`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-color>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ColorOption (type)

- `value: string`
- `label?: string | undefined` — What a screen reader says. Without it the hex is read out, and "#3b82f6" tells a listener nothing — which is the whole reason this exists.
