<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# paper — API (React, the parity reference)

Exports: `Paper`, `PaperHeader`, `PaperTitle`, `PaperDescription`, `PaperContent`, `PaperFooter`, `PaperProps`, `PaperTitleProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-paper>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Paper

- `stack?: 1 | 2 | undefined` — Draw 1 or 2 sheet edges behind this one — a pile rather than a sheet. Purely decorative: the edges are box-shadows, so nothing enters the DOM or the accessibility tree and a reader is never told the pile holds more documents than the one you rendered.
- `measure?: "prose" | "wide" | "full" | null | undefined` — Reading width. Measured in `ch` rather than px so it tracks the font: the target is a line length, not a box, and 65ch stays ~65 characters whatever the type scale does.
- `elevation?: "flat" | "raised" | "lifted" | null | undefined`
- `padding?: "sm" | "md" | "lg" | "none" | null | undefined` — Document margins. Larger than Card's throughout — that is the point.
- …plus the underlying element's standard props (280 inherited).

### PaperHeader

- …plus the underlying element's standard props (280 inherited).

### PaperTitle

- …plus the underlying element's standard props (280 inherited).

### PaperDescription

- …plus the underlying element's standard props (280 inherited).

### PaperContent

- …plus the underlying element's standard props (280 inherited).

### PaperFooter

- …plus the underlying element's standard props (280 inherited).

### Types

- `PaperProps` — type (see the component above)
- `PaperTitleProps` — type (see the component above)
