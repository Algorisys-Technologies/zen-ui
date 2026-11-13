<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# radio-group — API (React, the parity reference)

Exports: `RadioGroup`, `RadioGroupItem`, `RadioGroupProps`, `RadioGroupItemProps`, `RadioSize`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-radio-group>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### RadioGroup

- `label?: React.ReactNode` — Names the group — the question the options answer. Wired to the group's `aria-labelledby`, so a screen reader announces it before the options.
- `description?: React.ReactNode` — Help text under the options, wired to the group's `aria-describedby`.
- from `@radix-ui/react-radio-group`: `disabled?`, `form?`, `name?`, `required?`, `value?`, `defaultValue?`, `dir?`, `onValueChange?`, `orientation?`, `loop?`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (278 inherited).

### RadioGroupItem

- `size?: RadioSize | undefined`
- `label?: React.ReactNode` — The option's text. Renders a `<label>` around the radio, so clicking the text selects it and the text becomes the radio's accessible name.
- from `@radix-ui/react-radio-group`: `checked?`, `required?`, `value`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (288 inherited).

### Other exports

- `RadioSize` = `"sm" | "md" | "lg"`

### Types

- `RadioGroupProps` — type (see the component above)
- `RadioGroupItemProps` — type (see the component above)
