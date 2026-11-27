<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# zen-ui-core-state-timeline — API (React, the parity reference)

Exports: `durationMessage`, `layoutStateTimeline`, `layoutTimelineEvents`, `stateTimelineTotals`, `timelineTicks`, `StateSegment`, `StateSegmentInput`, `StateTimelineWindow`, `TimelineEvent`, `TimelineEventInput`, `TimelineTicks`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-zen-ui-core-state-timeline>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### StateSegment (type)

- `id: string`
- `state: "running" | "idle" | "stopped" | "fault" | "waiting" | "setup" | "cleaning" | "maintenance" | "unknown"`
- `tone: MachineStateTone`
- `label?: string | undefined`
- `start: number` — Clipped to the window and to now.
- `end: number`
- `durationMs: number`
- `left: number` — Fractions of the window.
- `width: number`
- `gap: boolean` — A hole in the record, filled as no data.
- `open: boolean` — Still going: its end is `now`, not a recorded end.

### StateSegmentInput (type)

- `id?: string | undefined` — Kept on the laid-out segment, so a click can be traced back to the record.
- `state: "running" | "idle" | "stopped" | "fault" | "waiting" | "setup" | "cleaning" | "maintenance" | "unknown"`
- `tone?: MachineStateTone | undefined` — Overrides the state's own tone.
- `label?: string | undefined` — A cause or note ("Jam at infeed"); shown instead of the state's name.
- `start: Time`
- `end?: Time | null | undefined` — null or omitted: still going — runs to `now`.

### StateTimelineWindow (type)

- `from: Time`
- `to: Time`
- `now?: Time | undefined` — Defaults to the current time. Nothing is laid out after it.

### TimelineEvent (type)

- `id: string`
- `at: number`
- `label: string`
- `left: number`

### TimelineEventInput (type)

- `id: string`
- `at: Time`
- `label: string` — What happened ("Batch 2 started").

### TimelineTicks (type)

- `stepMs: number`
- `ticks: { at: number; left: number; }[]`

### Other exports

- `durationMessage(durationMs: number): { key: MessageKey; values: Record<string, number>; }`
- `layoutStateTimeline(segments: StateSegmentInput[], window: StateTimelineWindow): StateSegment[]`
- `layoutTimelineEvents(events: TimelineEventInput[], window: StateTimelineWindow): TimelineEvent[]`
- `stateTimelineTotals(segments: StateSegment[]): { state: MachineState; ms: number; }[]`
- `timelineTicks(from: Time, to: Time, options?: { maxTicks?: number; timeZone?: string; }): TimelineTicks`
