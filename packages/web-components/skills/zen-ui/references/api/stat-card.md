<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# stat-card — API (React, the parity reference)

Exports: `StatCard`, `StatCardProps`, `StatCardTrend`, `StatCardColor`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-stat-card>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### StatCard

- `label: React.ReactNode`
- `value: React.ReactNode`
- `icon?: React.ReactNode` — Rendered bare, tinted by `color`. Decorative: `label` is the meaning.
- `color?: StatCardColor | undefined` — Default "neutral" — a statistic is not an alert.
- `trend?: StatCardTrend | undefined`
- `onClick?: (() => void) | undefined` — Renders the card as a button.
- `href?: string | undefined` — Renders the card as a link. Takes precedence over onClick.
- `loading?: boolean | undefined` — Swaps the figure for a skeleton and marks the card busy.
- `className?: string | undefined`
- …plus the underlying element's standard props (277 inherited).

### StatCardTrend (type)

- `value: React.ReactNode`
- `direction: "flat" | "up" | "down"`
- `color?: StatCardColor | undefined` — Overrides the direction's default colour. Up is not universally good — churn, cost, error rate and response time all read the other way — so the caller, who knows what the number means, gets the last word.

### Other exports

- `StatCardColor` = `"info" | "error" | "primary" | "neutral" | "success" | "warning"`

### Types

- `StatCardProps` — type (see the component above)
