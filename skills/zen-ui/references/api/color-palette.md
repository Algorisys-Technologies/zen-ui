<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# color-palette — API (React, the parity reference)

Exports: `ColorPalette`, `ColorPaletteProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-color-palette>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ColorPalette

- `colors: (string | ColorOption)[]`
- `value?: string | undefined`
- `defaultValue?: string | undefined`
- `onValueChange?: ((hex: string) => void) | undefined`
- `label?: string | undefined` — The radiogroup's accessible name.
- `size?: "sm" | "md" | "lg" | undefined` — Swatch size. Default "md".
- `disabled?: boolean | undefined`
- `className?: string | undefined`
- …plus the underlying element's standard props (277 inherited).

### Types

- `ColorPaletteProps` — type (see the component above)
