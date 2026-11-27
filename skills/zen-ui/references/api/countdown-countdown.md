<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# countdown-countdown — API (React, the parity reference)

Exports: `TimerBadge`, `TestCountdownBar`, `TimerBadgeProps`, `TestCountdownBarProps`, `CountdownLevel`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-countdown-countdown>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### TimerBadge

- `label?: React.ReactNode` — Shown before the figure — "Time left". Omit for the bare clock.
- `variant?: "soft" | "bare" | undefined` — `"soft"` (default) is a tinted pill; `"bare"` is text only, for a toolbar.
- `size?: "sm" | "md" | undefined`
- `className?: string | undefined`
- `deadline: number` — Epoch milliseconds.
- `thresholds?: readonly number[] | undefined` — Seconds remaining at which to escalate, `[warning, critical]`. Defaults to `[300, 60]`.
- `onExpire?: (() => void) | undefined` — Fires ONCE when the deadline passes. Submission is yours.
- `onThreshold?: ((seconds: number) => void) | undefined` — Fires once per threshold crossed, going down. For a toast or an announcement.
- `paused?: boolean | undefined` — Stop the clock without unmounting — for a paused or already-submitted test.

### TestCountdownBar

- `title?: React.ReactNode` — What is being timed — the test or question name.
- `children?: React.ReactNode` — Progress, question counter, anything else that belongs beside the clock.
- `actions?: React.ReactNode` — Actions on the right: submit, save, request more time.
- `sticky?: boolean | undefined` — Pin to the top of the scroll container. Default `true`.
- `className?: string | undefined`
- `deadline: number` — Epoch milliseconds.
- `thresholds?: readonly number[] | undefined` — Seconds remaining at which to escalate, `[warning, critical]`. Defaults to `[300, 60]`.
- `onExpire?: (() => void) | undefined` — Fires ONCE when the deadline passes. Submission is yours.
- `onThreshold?: ((seconds: number) => void) | undefined` — Fires once per threshold crossed, going down. For a toast or an announcement.
- `paused?: boolean | undefined` — Stop the clock without unmounting — for a paused or already-submitted test.

### Other exports

- `CountdownLevel` = `"warning" | "normal" | "critical" | "expired"`

### Types

- `TimerBadgeProps` — type (see the component above)
- `TestCountdownBarProps` — type (see the component above)
