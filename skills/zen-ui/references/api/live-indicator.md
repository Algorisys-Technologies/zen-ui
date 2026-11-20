<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# live-indicator — API (React, the parity reference)

Exports: `LiveIndicator`, `LiveIndicatorProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-live-indicator>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### LiveIndicator

- `lastUpdated?: number | Date | undefined`
- `staleAfterMs?: number | undefined` — How old data may get before it is stale. Default 2 minutes.
- `connected?: boolean | undefined` — false: the app knows the connection is down.
- `now?: number | Date | undefined` — Pins the clock, for tests and screenshots.
- `size?: "sm" | "md" | undefined`
- …plus the underlying element's standard props (279 inherited).

### Types

- `LiveIndicatorProps` — type (see the component above)
