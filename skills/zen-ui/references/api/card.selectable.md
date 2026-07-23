<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# card.selectable — API (React, the parity reference)

Exports: `SelectableCard`, `SelectableCardGroup`, `SelectableCardProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-card.selectable>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### SelectableCard

- `title?: React.ReactNode`
- `icon?: React.ReactNode`
- `badge?: React.ReactNode` — Trailing badge slot (top-right) — typically a Badge with "Most popular" / "Best value" / "5+ users" style copy.
- `children?: React.ReactNode`
- from `@radix-ui/react-radio-group`: `checked?`, `required?`, `value`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (286 inherited).

### SelectableCardGroup

- from `@radix-ui/react-radio-group`: `disabled?`, `name?`, `required?`, `value?`, `defaultValue?`, `dir?`, `onValueChange?`, `orientation?`, `loop?`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (278 inherited).

### Types

- `SelectableCardProps` — type (see the component above)
