<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# likert — API (React, the parity reference)

Exports: `Likert`, `LikertProps`, `LikertOption`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-likert>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Likert

- `value?: string | undefined`
- `defaultValue?: string | undefined`
- `onValueChange?: ((value: string) => void) | undefined`
- `question?: string | undefined` — Renders above the scale + becomes the accessible name.
- `options?: LikertOption[] | undefined` — Custom option set. Defaults to the 5-point Strongly disagree → Strongly agree scale.
- `layout?: "segmented" | "stacked" | "scale" | undefined` — "segmented" (default) — connected pill strip, short labels. "stacked" — vertical list, full radio + label per row. "scale" — mark above a radio dot; numeric and emoji scales.
- `minLabel?: string | undefined` — Caption anchoring the low end, e.g. "Strongly disagree". A bare numeric scale means nothing without its ends named. Rendered by layout="scale" only; a caption, not the accessible name — that still comes from `question`.
- `maxLabel?: string | undefined` — Caption anchoring the high end, e.g. "Strongly agree".
- `disabled?: boolean | undefined`
- `readOnly?: boolean | undefined`
- `className?: string | undefined`
- `name?: string | undefined` — Hidden input name for native form submission.
- …plus the underlying element's standard props (2 inherited).

### LikertOption (type)

- `value: string`
- `label: string`
- `shortLabel?: string | undefined` — Short label used by the segmented layout when the full label is too long. Falls back to label.
- `renderOption?: (() => React.ReactNode) | undefined` — Custom mark for the option — an emoji, icon or number. Replaces the option's visible text in any layout. A thunk, not a node, so the Solid binding can mirror this prop without evaluating it eagerly and losing reactivity. The output is aria-hidden and `label` stays the accessible name: a screen reader announcing "slightly smiling face" instead of "Neutral" is not the answer the respondent gave.

### Types

- `LikertProps` — type (see the component above)
