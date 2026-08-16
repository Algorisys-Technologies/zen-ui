<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# theme-theme — API (React, the parity reference)

Exports: `Theme`, `ThemeProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-theme-theme>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Theme

- `name: ThemeName` — the theme to apply to this subtree
- `transparent?: boolean | undefined` — Render as `display: contents` so the wrapper does not become a box in the parent's layout — the children lay out as if it were not there. Off by default because `display: contents` removes the element from the layout tree, which drops any borders/background you might set on it.
- …plus the underlying element's standard props (280 inherited).

### Types

- `ThemeProps` — type (see the component above)
