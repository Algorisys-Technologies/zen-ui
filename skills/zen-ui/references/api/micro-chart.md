<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# micro-chart — API (React, the parity reference)

Exports: `MicroLineChart`, `MicroBarChart`, `MicroBulletChart`, `MicroDeltaChart`, `MicroRadialChart`, `MicroChartColor`, `MicroLineChartProps`, `MicroBarChartProps`, `MicroBulletChartProps`, `MicroDeltaChartProps`, `MicroRadialChartProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-micro-chart>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### MicroLineChart

- `values: number[]`
- `area?: boolean | undefined` — Fill the area under the line. Off by default — at this size it muddies it.
- `width?: number | undefined` — Pixel width. Default varies by chart.
- `height?: number | undefined` — Pixel height. Default varies by chart.
- `color?: MicroChartColor | undefined`
- `label?: string | undefined` — What the chart says, for assistive tech. Each chart derives a sensible one from its own data; override when the surrounding text does not already say what this is measuring.
- `className?: string | undefined`

### MicroBarChart

- `values: number[]`
- `width?: number | undefined` — Pixel width. Default varies by chart.
- `height?: number | undefined` — Pixel height. Default varies by chart.
- `color?: MicroChartColor | undefined`
- `label?: string | undefined` — What the chart says, for assistive tech. Each chart derives a sensible one from its own data; override when the surrounding text does not already say what this is measuring.
- `className?: string | undefined`

### MicroBulletChart

- `value: number`
- `target?: number | undefined` — The number you were aiming at; drawn as a tick, not a bar.
- `min?: number | undefined`
- `max?: number | undefined`
- `width?: number | undefined` — Pixel width. Default varies by chart.
- `height?: number | undefined` — Pixel height. Default varies by chart.
- `color?: MicroChartColor | undefined`
- `label?: string | undefined` — What the chart says, for assistive tech. Each chart derives a sensible one from its own data; override when the surrounding text does not already say what this is measuring.
- `className?: string | undefined`

### MicroDeltaChart

- `from: number`
- `to: number`
- `width?: number | undefined` — Pixel width. Default varies by chart.
- `height?: number | undefined` — Pixel height. Default varies by chart.
- `color?: MicroChartColor | undefined`
- `label?: string | undefined` — What the chart says, for assistive tech. Each chart derives a sensible one from its own data; override when the surrounding text does not already say what this is measuring.
- `className?: string | undefined`

### MicroRadialChart

- `value: number`
- `max?: number | undefined`
- `showValue?: boolean | undefined` — Print the percentage in the middle. Off below ~32px, where it cannot fit.
- `width?: number | undefined` — Pixel width. Default varies by chart.
- `height?: number | undefined` — Pixel height. Default varies by chart.
- `color?: MicroChartColor | undefined`
- `label?: string | undefined` — What the chart says, for assistive tech. Each chart derives a sensible one from its own data; override when the surrounding text does not already say what this is measuring.
- `className?: string | undefined`

### Other exports

- `MicroChartColor` = `"info" | "error" | "primary" | "success" | "warning" | "muted"`

### Types

- `MicroLineChartProps` — type (see the component above)
- `MicroBarChartProps` — type (see the component above)
- `MicroBulletChartProps` — type (see the component above)
- `MicroDeltaChartProps` — type (see the component above)
- `MicroRadialChartProps` — type (see the component above)
