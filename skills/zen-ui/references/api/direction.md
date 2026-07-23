<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# direction — API (React, the parity reference)

Exports: `DirectionProvider`, `Direction`, `DirectionProviderProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-direction>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### DirectionProvider

- `dir?: Direction | undefined` — Reading direction for everything inside. Omit it and the document's own `dir` is used and kept in sync — which is what an app that sets `dir` on <html> already wants, with no zen-ui code at all.
- `children?: React.ReactNode`

### Other exports

- `Direction` = `"ltr" | "rtl"`

### Types

- `DirectionProviderProps` — type (see the component above)
