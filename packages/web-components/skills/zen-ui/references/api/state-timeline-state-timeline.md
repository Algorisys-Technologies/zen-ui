<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# state-timeline-state-timeline — API (React, the parity reference)

Exports: `StateTimeline`, `StateTimelineProps`, `StateTimelineSize`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-state-timeline-state-timeline>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### StateTimeline

- `label: string` — Names the strip — the machine, line or person it is the record of.
- `segments: StateSegmentInput[]`
- `from: number | Date`
- `to: number | Date`
- `now?: number | Date | undefined`
- `events?: TimelineEventInput[] | undefined` — Moments rather than stretches: a batch change, an issue raised.
- `timeZone?: string | undefined` — IANA zone the axis and times read in — the plant's. Defaults to the browser's.
- `onSegmentClick?: ((segment: StateSegment) => void) | undefined` — Makes segments buttons. Called with the laid-out segment (its `id` is the record's).
- `isSegmentClickable?: ((segment: StateSegment) => boolean) | undefined` — Which segments can be clicked. Defaults to every segment that is not a hole.
- `selectedId?: string | undefined` — The selected segment's id, drawn raised.
- `hideAxis?: boolean | undefined`
- `size?: StateTimelineSize | undefined`
- …plus the underlying element's standard props (278 inherited).

### Other exports

- `StateTimelineSize` = `"sm" | "md" | "lg"`

### Types

- `StateTimelineProps` — type (see the component above)
