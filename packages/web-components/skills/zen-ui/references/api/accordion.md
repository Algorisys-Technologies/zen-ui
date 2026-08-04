<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# accordion — API (React, the parity reference)

Exports: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-accordion>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Accordion

- from `.bun`: `type`, `value?`, `defaultValue?`, `onValueChange?`, `disabled?`, `orientation?`, `dir?`, `asChild?`
- …plus the underlying element's standard props (278 inherited).

### AccordionItem

- from `.bun`: `disabled?`, `value`, `asChild?`
- …plus the underlying element's standard props (280 inherited).

### AccordionTrigger

- from `.bun`: `asChild?`
- …plus the underlying element's standard props (290 inherited).

### AccordionContent

- from `.bun`: `asChild?`, `forceMount?`
- …plus the underlying element's standard props (280 inherited).
