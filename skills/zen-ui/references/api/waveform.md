<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# waveform — API (React, the parity reference)

Exports: `Waveform`, `WaveformProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-waveform>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Waveform

- `peaks: number[]` — Peak amplitudes, 0..1, evenly spread across `audioDuration`.
- `duration: number` — The lane's time axis, seconds — the video's length when composed.
- `audioDuration?: number | undefined` — Length of the audio behind `peaks`. Defaults to `duration`.
- `clip?: WaveformClip | undefined` — The clip window (controlled). Omit to render the whole lane as audio.
- `onClipChange?: ((clip: WaveformClip) => void) | undefined` — Committed edits — keyboard nudges land here.
- `onClipInput?: ((clip: WaveformClip) => void) | undefined` — Per-pointermove during a drag, no history. Falls back to onClipChange.
- `onClipCommit?: ((clip: WaveformClip) => void) | undefined` — Once, when a drag ends — commit to history here.
- `onSeek?: ((time: number) => void) | undefined` — Click-to-seek on the lane, in lane time.
- `currentTime?: number | undefined` — Playhead position in lane time. Omit to hide the playhead.
- `zoom?: number | undefined` — Lane width multiplier, >= 1. Match the MediaTimeline's to align lanes.
- `minClipDuration?: number | undefined` — Smallest span a trim can shrink the clip to. Default 0.1s.
- `formatTime?: ((seconds: number) => string) | undefined` — Timestamp formatter for tooltips. Default formatMediaTime (HH:MM:SS.cc).
- `clipClass?: string | undefined` — Colour treatment for the clip window. Replaces the default tint + ring.
- `label?: string | undefined` — Names the lane for a screen reader.
- `className?: string | undefined`
- …plus the underlying element's standard props (279 inherited).

### Types

- `WaveformProps` — type (see the component above)
