<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# shift-navigator — API (React, the parity reference)

Exports: `ShiftNavigator`, `ShiftNavigatorProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-shift-navigator>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ShiftNavigator

- `shifts: ShiftDef[]`
- `timeZone?: string | undefined` — IANA zone the shifts are worked in. Defaults to the browser's.
- `value?: ShiftRef | undefined`
- `defaultValue?: ShiftRef | undefined`
- `onChange?: ((ref: ShiftRef, window: { start: number; end: number; }) => void) | undefined`
- `allowFuture?: boolean | undefined` — Let "next" go past the current shift. Default false.
- `now?: number | Date | undefined` — Pins the clock, for tests and screenshots.
- …plus the underlying element's standard props (277 inherited).

### Types

- `ShiftNavigatorProps` — type (see the component above)
