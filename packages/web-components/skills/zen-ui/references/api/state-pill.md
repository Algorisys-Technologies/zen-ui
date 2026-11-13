<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# state-pill — API (React, the parity reference)

Exports: `StatePill`, `StatePillProps`, `StatePillSize`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-state-pill>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### StatePill

- `state?: "running" | "idle" | "stopped" | "fault" | "waiting" | "setup" | "cleaning" | "maintenance" | "unknown" | undefined` — One of the shared machine states. Gives both the colour and the label.
- `tone?: MachineStateTone | undefined` — The colour, for a state outside the shared vocabulary (PackML's "Held", a plant's own "Starved"). Wins over the tone `state` would give.
- `size?: StatePillSize | undefined`
- `children?: React.ReactNode` — The label. Defaults to the state's own ("Running", "No data", …).
- …plus the underlying element's standard props (279 inherited).

### Other exports

- `StatePillSize` = `"sm" | "md"`

### Types

- `StatePillProps` — type (see the component above)
