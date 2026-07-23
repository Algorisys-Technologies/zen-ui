<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# page — API (React, the parity reference)

Exports: `Page`, `Bar`, `PageProps`, `BarProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-page>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Page

- `header?: React.ReactNode`
- `footer?: React.ReactNode`
- `flush?: boolean | undefined` — Removes the content padding — for a full-bleed table or map.
- …plus the underlying element's standard props (280 inherited).

### Bar

- `startContent?: React.ReactNode`
- `middleContent?: React.ReactNode` — Centred regardless of how wide start/end are — that is the point of Bar.
- `endContent?: React.ReactNode`
- `design?: "footer" | "header" | "subheader" | undefined`
- …plus the underlying element's standard props (280 inherited).

### Types

- `PageProps` — type (see the component above)
- `BarProps` — type (see the component above)
