/**
 * Media-component math — the pure half of MediaTimeline and Waveform.
 *
 * Everything here is renderer-agnostic drag/clamp arithmetic. It lives in core
 * for the same reason the variant tables do: both bindings consume ONE copy, so
 * the two renderers cannot disagree about where a handle stops. The behaviour
 * is pinned by scripts/check-media.ts and mirrors the consumer contract in
 * IMPLEMENT-media-components.md (StudioX's segment-timeline).
 *
 * Semantics are deliberately generic: a range is just a range. Whether it means
 * "cut this" or "keep this" — and what colour that is — belongs to the caller.
 */
/** One selected span on a media timeline, in seconds. */
export interface MediaRange {
    start: number;
    end: number;
}
/**
 * A clip window on a Waveform lane, in seconds.
 *
 * `offset` is where on the LANE the clip begins; `start`/`end` are the trim
 * points within the AUDIO the peaks describe. Lane time and audio time are
 * different axes on purpose — that is what lets an audio clip sit anywhere
 * under a video timeline.
 */
export interface WaveformClip {
    offset: number;
    start: number;
    end: number;
}
/** The default minimum span a drag can shrink a range or clip to, seconds. */
export declare const MIN_MEDIA_RANGE = 0.1;
/** `HH:MM:SS.cc` — centiseconds floored, never rounded up into the next second. */
export declare const formatMediaTime: (seconds: number) => string;
/**
 * How a timeline's ranges relate to each other.
 *
 * - `"partition"` — sorted, non-overlapping spans (a trim track): edge drags
 *   clamp against the neighbours.
 * - `"independent"` — free spans (an overlay-element lane): ranges may
 *   overlap, there is no neighbour relationship, and z-order is array order.
 */
export type MediaRangeMode = "partition" | "independent";
/**
 * Drag one edge of `ranges[index]` to `time`, clamped by the range's own
 * minimum span, the lane, and — in `"partition"` mode — the neighbours.
 * Returns the new array (input untouched) plus the clamped edge time, which
 * is what the drag tooltip and live-seek want.
 *
 * Partition neighbour clamps keep a `minDuration` GAP (start stops at
 * prev.end + min, not prev.end): two touching ranges would stack their edge
 * handles on one pixel column, and the gap is what keeps both grabbable.
 * Partition mode assumes `ranges` is sorted by start and non-overlapping —
 * the caller owns the array and the invariant, as in every controlled
 * component here. Independent mode assumes nothing: only [0, duration] and
 * the span's own minimum apply.
 */
export declare const dragRangeEdge: (ranges: readonly MediaRange[], index: number, edge: "start" | "end", time: number, duration: number, minDuration?: number, mode?: MediaRangeMode) => {
    ranges: MediaRange[];
    edgeTime: number;
};
/**
 * Move a whole range to `newStart`, length preserved, clamped to the lane.
 * The body-drag counterpart of `dragRangeEdge` — independent-mode lanes move
 * their spans; a partition has no defined meaning for moving a range through
 * its neighbours, so the components only offer this in independent mode.
 * Returns the new array (input untouched, other ranges keep identity) plus
 * the clamped start for the drag tooltip.
 */
export declare const moveRange: (ranges: readonly MediaRange[], index: number, newStart: number, duration: number) => {
    ranges: MediaRange[];
    start: number;
};
/**
 * Trim a clip by dragging one of its lane edges to `laneTime`.
 *
 * The left edge moves `offset` and `start` TOGETHER so the clip's right edge
 * stays fixed on the lane — trimming the head of a clip must not slide its
 * tail, which is how every direct-manipulation editor behaves. The right edge
 * moves only `end`, capped by the audio that exists and the lane it sits on.
 */
export declare const dragClipEdge: (clip: WaveformClip, edge: "start" | "end", laneTime: number, opts: {
    audioDuration: number;
    laneDuration: number;
    minDuration?: number;
}) => WaveformClip;
/** Move a whole clip to `offset`, clamped so it stays on the lane. */
export declare const moveClip: (clip: WaveformClip, offset: number, laneDuration: number) => WaveformClip;
/**
 * A waveform as ONE filled path — a step envelope mirrored about the centre
 * line, for `viewBox="0 0 <peaks.length> 2"` with `preserveAspectRatio="none"`.
 * One path element regardless of peak count, and it stretches with zoom for
 * free instead of re-rendering bars.
 *
 * `minAmp` keeps silence visible as a hairline rather than nothing — an empty
 * lane and a silent lane are different facts.
 */
export declare const waveformPath: (peaks: readonly number[], minAmp?: number) => string;
/** Clamp a tooltip/badge's left-% so it cannot overhang the track edges. */
export declare const clampBadgePct: (pct: number) => number;
