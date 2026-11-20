<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# mask-input — API (React, the parity reference)

Exports: `MaskInput`, `MaskInputProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-mask-input>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### MaskInput

- `mask: string` — The template, e.g. "99-9999".
- `rules?: MaskRules | undefined` — Extra or overriding symbols. Merged with the defaults, not replacing them.
- `placeholderChar?: string | undefined` — Builds the placeholder skeleton — "__-____". Default "_".
- `value?: string | undefined` — The masked value. Pass "" to clear.
- `defaultValue?: string | undefined`
- `onValueChange?: ((masked: string, raw: string, complete: boolean) => void) | undefined` — (masked, raw, complete) — store whichever you need.
- `className?: string | undefined`
- …plus the underlying element's standard props (306 inherited).

### Types

- `MaskInputProps` — type (see the component above)
