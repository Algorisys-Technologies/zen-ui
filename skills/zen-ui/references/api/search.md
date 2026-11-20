<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# search — API (React, the parity reference)

Exports: `Search`, `SearchProps`, `SearchSize`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-search>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Search

- `value?: string | undefined`
- `defaultValue?: string | undefined`
- `onValueChange?: ((value: string) => void) | undefined`
- `onClear?: (() => void) | undefined` — Fired when the clear button empties the field.
- `size?: SearchSize | undefined`
- `clearLabel?: string | undefined` — Accessible label for the clear button.
- …plus the underlying element's standard props (306 inherited).

### Other exports

- `SearchSize` = `"sm" | "md" | "lg"`

### Types

- `SearchProps` — type (see the component above)
