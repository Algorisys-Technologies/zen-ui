<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# line-card — API (React, the parity reference)

Exports: `LineCard`, `LineCardProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-line-card>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### LineCard

- `name: string`
- `state: "running" | "idle" | "stopped" | "fault" | "waiting" | "setup" | "cleaning" | "maintenance" | "unknown"`
- `since?: number | Date | undefined` — When it entered this state.
- `cause?: string | undefined` — Why ("Jam at infeed").
- `order?: { code: string; product?: string; target: number; good: number; scrap?: number; } | undefined`
- `perHour?: number | undefined` — Current output rate, per hour, for the ETA.
- `oee?: number | null | undefined` — OEE as a fraction, shown small in the corner.
- `href?: string | undefined` — Makes the card a link to the line.
- `timeZone?: string | undefined`
- `now?: number | Date | undefined` — Pins the clock, for tests and screenshots.
- …plus the underlying element's standard props (279 inherited).

### Types

- `LineCardProps` — type (see the component above)
