<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# radio-group — API (React, the parity reference)

Exports: `RadioGroup`, `RadioGroupItem`, `RadioGroupItemProps`, `RadioSize`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-radio-group>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### RadioGroup

- from `.bun`: `disabled?`, `form?`, `name?`, `required?`, `value?`, `defaultValue?`, `dir?`, `onValueChange?`, `asChild?`, `orientation?`, `loop?`
- …plus the underlying element's standard props (278 inherited).

### RadioGroupItem

- `size?: RadioSize | undefined`
- from `.bun`: `checked?`, `required?`, `value`, `asChild?`
- …plus the underlying element's standard props (288 inherited).

### Other exports

- `RadioSize` = `"sm" | "md" | "lg"`

### Types

- `RadioGroupItemProps` — type (see the component above)
