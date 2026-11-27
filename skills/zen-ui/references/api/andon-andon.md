<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# andon-andon — API (React, the parity reference)

Exports: `AndonBoard`, `AndonTile`, `AndonBoardProps`, `AndonItem`, `AndonTileProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-andon-andon>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### AndonBoard

- `items: AndonItem[]`
- `lastUpdated?: number | Date | undefined` — Time of the last SUCCESSFUL refresh. Without it the board cannot tell it is stale.
- `staleAfterMs?: number | undefined` — How old data may get before the board says so. Default 2 minutes.
- `sort?: boolean | undefined` — Trouble first (down, no data, setup, planned, idle, running; longest first). Default: the order given.
- `now?: number | Date | undefined` — Pins the clock, for tests and screenshots.
- `onTileClick?: ((item: AndonItem) => void) | undefined`
- `label?: string | undefined` — Names the board. Defaults to "Plant status".
- …plus the underlying element's standard props (279 inherited).

### AndonTile

- `item: AndonItem`
- `now?: number | Date | undefined` — The time the clock counts to. Defaults to a clock of the tile's own.
- `onClick?: ((item: AndonItem) => void) | undefined` — Makes the tile a button.
- …plus the underlying element's standard props (278 inherited).

### AndonItem (type)

- `id: string`
- `name: string` — The machine or station.
- `line?: string | undefined` — Where it is — a line or cell — shown under the name.
- `state: "running" | "idle" | "stopped" | "fault" | "waiting" | "setup" | "cleaning" | "maintenance" | "unknown"`
- `tone?: MachineStateTone | undefined` — Overrides the state's tone.
- `cause?: string | undefined` — Why ("Jam at infeed"). Shown under the state.
- `since?: number | Date | undefined` — When it entered this state. Drives the clock.

### Types

- `AndonBoardProps` — type (see the component above)
- `AndonTileProps` — type (see the component above)
