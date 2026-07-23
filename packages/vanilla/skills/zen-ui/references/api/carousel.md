<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# carousel — API (React, the parity reference)

Exports: `Carousel`, `CarouselProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-carousel>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Carousel

- `label?: string | undefined` — Names the carousel for a screen reader.
- `arrows?: boolean | undefined` — Previous / next buttons. Default true.
- `dots?: boolean | undefined` — The dots. Default true.
- `perView?: number | undefined` — Slides visible at once. Default 1.
- `className?: string | undefined`
- `children: React.ReactNode`
- …plus the underlying element's standard props (277 inherited).

### Types

- `CarouselProps` — type (see the component above)
