<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# media-timeline — API (React, the parity reference)

Exports: `MediaTimeline`, `MediaTimelineProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-media-timeline>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### MediaTimeline

- `duration: number` — Total media length, seconds. The track maps [0, duration] to its width.
- `ranges: MediaRange[]` — The spans. In `"partition"` mode: sorted, non-overlapping. In `"independent"` mode: free — overlap allowed, z-order is array order. The app owns the array either way (controlled).
- `rangeMode?: MediaRangeMode | undefined` — How the ranges relate: `"partition"` (a trim track — edge drags clamp against neighbours) or `"independent"` (an overlay-element lane — spans move and overlap freely, bars carry labels/colors). Default "partition".
- `activeIndex?: number | undefined` — Which range is highlighted; the remove affordance renders on it. `-1` (the DOM's own selectedIndex convention) or omitted = none. In independent mode, clicking empty track emits `onActiveIndexChange(-1)` — deselect.
- `onActiveIndexChange?: ((index: number) => void) | undefined`
- `onRangesChange?: ((ranges: MediaRange[]) => void) | undefined` — Committed edits — keyboard nudges land here.
- `onRangesInput?: ((ranges: MediaRange[]) => void) | undefined` — Per-pointermove during a drag, no history. Falls back to onRangesChange.
- `onRangesCommit?: ((ranges: MediaRange[]) => void) | undefined` — Once, when a handle drag ends — commit to history here.
- `onRangeRemove?: ((index: number) => void) | undefined` — When provided, the active range shows a remove button that calls this.
- `onSeek?: ((time: number) => void) | undefined` — Click-to-seek, and live-seek under a dragged edge.
- `onTrackDblClick?: ((time: number) => void) | undefined` — Double-click on the track. Whether that means "add a range" is the app's call.
- `thumbnails?: string[] | undefined` — Evenly-spread filmstrip images under the ranges.
- `currentTime?: number | undefined` — Playhead position, seconds. Omit to hide the playhead.
- `zoom?: number | undefined` — Track width multiplier, >= 1; the track scrolls horizontally when > 1.
- `minRangeDuration?: number | undefined` — Smallest span a drag can shrink a range to. Default 0.1s.
- `formatTime?: ((seconds: number) => string) | undefined` — Timestamp formatter for tooltips. Default formatMediaTime (HH:MM:SS.cc).
- `rangeClass?: ((index: number, active: boolean) => string) | undefined` — Colour treatment for a range. Replaces the default primary tint + ring — the positioning stays. This is the "a range is just a range" hook. Precedence: rangeClass > rangeColor > default.
- `rangeColor?: ((index: number, active: boolean) => string) | undefined` — A CSS color per range (any color — StudioX feeds hex from a palette, which class tokens cannot express). The component derives the fill (color-mix, 40% active / 25% not) and an inset ring (full color, 2px active / 1px not), and paints the edge handles with it. `rangeClass` wins if both are provided.
- `rangeLabel?: ((index: number) => React.ReactNode) | undefined` — Rendered inside the bar — element text, a clip name. Truncated, and pointer-events: none so the body-drag surface stays whole.
- `label?: string | undefined` — Names the timeline for a screen reader.
- `className?: string | undefined`
- …plus the underlying element's standard props (279 inherited).

### Types

- `MediaTimelineProps` — type (see the component above)
