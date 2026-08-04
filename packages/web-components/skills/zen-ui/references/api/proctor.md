<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# proctor — API (React, the parity reference)

Exports: `ProctorStreamGrid`, `ProctorFlagOverlay`, `ProctorStreamGridProps`, `ProctorFlagOverlayProps`, `ProctorParticipant`, `ProctorFlag`, `ProctorFlagLevel`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-proctor>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ProctorStreamGrid

- `participants: ProctorParticipant[]`
- `minTileWidth?: string | undefined` — Minimum tile width; the grid fits as many as will go. Default `"14rem"`.
- `max?: number | undefined` — Render at most this many tiles. There is no virtualisation here — a live `<video>` costs a decoder, and a hundred of them is a browser problem no layout fixes. The remainder is reported rather than silently dropped.
- `onSelect?: ((participant: ProctorParticipant) => void) | undefined`
- `renderActions?: ((participant: ProctorParticipant) => React.ReactNode) | undefined` — Per-tile actions — mute, chat, open the log.
- `emptyMessage?: React.ReactNode`
- `className?: string | undefined`

### ProctorFlagOverlay

- `flags: ProctorFlag[]`
- `max?: number | undefined` — How many chips before "+n more". Default 2 — a tile is small.
- `className?: string | undefined`

### ProctorParticipant (type)

- `id: string`
- `name: React.ReactNode`
- `detail?: React.ReactNode` — Under the name — an email, a candidate number.
- `stream?: MediaStream | null | undefined` — Live video. Omit for someone who has not connected yet.
- `poster?: string | undefined` — Poster/thumbnail when there is no stream.
- `status?: "left" | "live" | "connecting" | undefined`
- `flags?: ProctorFlag[] | undefined` — Newest first is the caller's job; the overlay shows the first few.
- `muted?: boolean | undefined`

### ProctorFlag (type)

- `id: string`
- `label: React.ReactNode` — Short — it renders as a chip. "Multiple faces", "Tab switch".
- `level?: ProctorFlagLevel | undefined`
- `at?: string | undefined` — Display string, as everywhere else in zen-ui — formatting is yours.

### Other exports

- `ProctorFlagLevel` = `"info" | "error" | "warning"`

### Types

- `ProctorStreamGridProps` — type (see the component above)
- `ProctorFlagOverlayProps` — type (see the component above)
