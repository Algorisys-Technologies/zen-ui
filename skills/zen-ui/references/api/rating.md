<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# rating — API (React, the parity reference)

Exports: `Rating`, `RatingProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-rating>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Rating

- `value?: number | undefined`
- `defaultValue?: number | undefined`
- `onValueChange?: ((value: number) => void) | undefined`
- `max?: number | undefined` — Number of stars rendered. Default 5.
- `allowHalf?: boolean | undefined` — Allow half-star values (0.5, 1, 1.5 …). Each star becomes two options rather than each half becoming a star.
- `label?: string | undefined` — Accessible name for the radiogroup. Required for a11y.
- `showValue?: boolean | undefined` — Optional caption rendered next to the stars.
- `size?: "sm" | "md" | "lg" | undefined` — Star size. Default md (24px).
- `allowClear?: boolean | undefined` — Click on the currently-selected star clears it. Default true.
- `disabled?: boolean | undefined`
- `readOnly?: boolean | undefined` — Render without click handlers — display-only.
- `className?: string | undefined`
- `name?: string | undefined` — Name attached to a hidden input so the rating participates in native form submission.
- …plus the underlying element's standard props (2 inherited).

### Types

- `RatingProps` — type (see the component above)
