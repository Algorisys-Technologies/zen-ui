<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# tag-input — API (React, the parity reference)

Exports: `TagInput`, `TagInputProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-tag-input>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### TagInput

- `value?: string[] | undefined`
- `defaultValue?: string[] | undefined`
- `onValueChange?: ((next: string[]) => void) | undefined`
- `placeholder?: string | undefined`
- `disabled?: boolean | undefined`
- `max?: number | undefined` — Maximum number of tags accepted. Further commits are no-ops.
- `delimiters?: string[] | undefined` — Characters that trigger commit in addition to Enter/Tab. Default `,`
- `unique?: boolean | undefined` — Drop duplicates silently. Default true.
- `validate?: ((candidate: string) => boolean | Promise<boolean>) | undefined` — Per-tag validator. Return false / falsy-promise to reject the candidate; the input keeps the typed text so the user can fix it.
- `normalize?: ((raw: string) => string) | undefined` — Normalize before commit. Defaults to `.trim()`.
- `className?: string | undefined`
- `renderTag?: ((tag: string, remove: () => void) => React.ReactNode) | undefined` — Render override for individual chips. Default is a rounded pill.
- `inputAriaLabel?: string | undefined` — aria-label for the underlying text input.
- …plus the underlying element's standard props (2 inherited).

### Types

- `TagInputProps` — type (see the component above)
