<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# checkbox — API (React, the parity reference)

Exports: `Checkbox`, `CheckboxProps`, `CheckboxSize`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-checkbox>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Checkbox

- `size?: CheckboxSize | undefined`
- from `.bun`: `checked?`, `required?`, `defaultChecked?`, `asChild?`, `onCheckedChange?`
- …plus the underlying element's standard props (289 inherited).

### Other exports

- `CheckboxSize` = `"sm" | "md" | "lg"`

### Types

- `CheckboxProps` — type (see the component above)
