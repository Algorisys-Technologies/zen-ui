<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# zen-ui-core-countdown — API (React, the parity reference)

Exports: `remainingMs`, `formatCountdown`, `countdownLevel`, `crossedThresholds`, `DEFAULT_COUNTDOWN_THRESHOLDS`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-zen-ui-core-countdown>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Other exports

- `remainingMs(deadline: number, now: number): number`
- `formatCountdown(ms: number): string`
- `countdownLevel(ms: number, thresholds?: readonly number[]): CountdownLevel`
- `crossedThresholds(previousMs: number, currentMs: number, thresholds?: readonly number[]): number[]`
- `DEFAULT_COUNTDOWN_THRESHOLDS: readonly number[]`
