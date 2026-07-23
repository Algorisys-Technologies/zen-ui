<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# nps — API (React, the parity reference)

Exports: `NPS`, `NPSProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-nps>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### NPS

- `value?: number | undefined`
- `defaultValue?: number | undefined`
- `onValueChange?: ((value: number) => void) | undefined`
- `label?: string | undefined` — Accessible name for the radiogroup. Default question copy.
- `lowLabel?: string | undefined` — Anchor label under the leftmost button. Default "Not at all likely".
- `highLabel?: string | undefined` — Anchor label under the rightmost button. Default "Extremely likely".
- `disabled?: boolean | undefined`
- `readOnly?: boolean | undefined`
- `className?: string | undefined`
- `name?: string | undefined` — Optional hidden input name for native form submission.
- `showBucket?: boolean | undefined` — Show the score-bucket caption ("You're a Promoter") under the selection. Default true.
- …plus the underlying element's standard props (2 inherited).

### Types

- `NPSProps` — type (see the component above)
