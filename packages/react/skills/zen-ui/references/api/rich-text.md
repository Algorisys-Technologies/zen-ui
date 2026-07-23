<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# rich-text — API (React, the parity reference)

Exports: `RichText`, `RichTextProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-rich-text>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### RichText

- `value?: string | undefined`
- `onChange?: ((html: string) => void) | undefined`
- `placeholder?: string | undefined`
- `config?: Record<string, any> | undefined` — raw Jodit config, merged over the defaults
- `className?: string | undefined`

### Types

- `RichTextProps` — type (see the component above)
