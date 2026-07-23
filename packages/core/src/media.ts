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
export const MIN_MEDIA_RANGE = 0.1;

/** `HH:MM:SS.cc` — centiseconds floored, never rounded up into the next second. */
export const formatMediaTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
};

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
export const dragRangeEdge = (
  ranges: readonly MediaRange[],
  index: number,
  edge: "start" | "end",
  time: number,
  duration: number,
  minDuration: number = MIN_MEDIA_RANGE,
  mode: MediaRangeMode = "partition",
): { ranges: MediaRange[]; edgeTime: number } => {
  // Only the dragged range gets a new object — untouched neighbours keep their
  // identity, so a fine-grained renderer re-renders one row, not the list.
  const next = ranges.slice();
  const range = next[index];
  if (!range) return { ranges: next, edgeTime: time };

  const partition = mode === "partition";
  const floor = partition && index > 0 ? next[index - 1].end + minDuration : 0;
  const ceil =
    partition && index < next.length - 1 ? next[index + 1].start - minDuration : duration;

  let edgeTime: number;
  if (edge === "start") {
    edgeTime = Math.max(floor, Math.min(time, range.end - minDuration));
    next[index] = { start: edgeTime, end: range.end };
  } else {
    edgeTime = Math.max(range.start + minDuration, Math.min(time, ceil));
    next[index] = { start: range.start, end: edgeTime };
  }
  return { ranges: next, edgeTime };
};

/**
 * Move a whole range to `newStart`, length preserved, clamped to the lane.
 * The body-drag counterpart of `dragRangeEdge` — independent-mode lanes move
 * their spans; a partition has no defined meaning for moving a range through
 * its neighbours, so the components only offer this in independent mode.
 * Returns the new array (input untouched, other ranges keep identity) plus
 * the clamped start for the drag tooltip.
 */
export const moveRange = (
  ranges: readonly MediaRange[],
  index: number,
  newStart: number,
  duration: number,
): { ranges: MediaRange[]; start: number } => {
  const next = ranges.slice();
  const range = next[index];
  if (!range) return { ranges: next, start: newStart };
  const length = range.end - range.start;
  const start = Math.max(0, Math.min(newStart, duration - length));
  next[index] = { start, end: start + length };
  return { ranges: next, start };
};

/**
 * Trim a clip by dragging one of its lane edges to `laneTime`.
 *
 * The left edge moves `offset` and `start` TOGETHER so the clip's right edge
 * stays fixed on the lane — trimming the head of a clip must not slide its
 * tail, which is how every direct-manipulation editor behaves. The right edge
 * moves only `end`, capped by the audio that exists and the lane it sits on.
 */
export const dragClipEdge = (
  clip: WaveformClip,
  edge: "start" | "end",
  laneTime: number,
  opts: { audioDuration: number; laneDuration: number; minDuration?: number },
): WaveformClip => {
  const min = opts.minDuration ?? MIN_MEDIA_RANGE;
  if (edge === "start") {
    const delta = Math.max(
      -clip.start,
      -clip.offset,
      Math.min(laneTime - clip.offset, clip.end - min - clip.start),
    );
    return { offset: clip.offset + delta, start: clip.start + delta, end: clip.end };
  }
  const rightEdge = clip.offset + (clip.end - clip.start);
  const delta = Math.max(
    clip.start + min - clip.end,
    Math.min(laneTime - rightEdge, opts.audioDuration - clip.end, opts.laneDuration - rightEdge),
  );
  return { offset: clip.offset, start: clip.start, end: clip.end + delta };
};

/** Move a whole clip to `offset`, clamped so it stays on the lane. */
export const moveClip = (clip: WaveformClip, offset: number, laneDuration: number): WaveformClip => {
  const width = clip.end - clip.start;
  return {
    offset: Math.max(0, Math.min(offset, laneDuration - width)),
    start: clip.start,
    end: clip.end,
  };
};

/**
 * A waveform as ONE filled path — a step envelope mirrored about the centre
 * line, for `viewBox="0 0 <peaks.length> 2"` with `preserveAspectRatio="none"`.
 * One path element regardless of peak count, and it stretches with zoom for
 * free instead of re-rendering bars.
 *
 * `minAmp` keeps silence visible as a hairline rather than nothing — an empty
 * lane and a silent lane are different facts.
 */
export const waveformPath = (peaks: readonly number[], minAmp = 0.02): string => {
  if (peaks.length === 0) return "";
  const amp = (p: number) => Math.max(minAmp, Math.min(1, p));
  const r = (n: number) => String(Math.round(n * 1000) / 1000);
  let top = "";
  let bottom = "";
  for (let i = 0; i < peaks.length; i++) {
    const a = amp(peaks[i]);
    top += `${i === 0 ? "M" : "L"}${i},${r(1 - a)}L${i + 1},${r(1 - a)}`;
    bottom = `L${i + 1},${r(1 + a)}L${i},${r(1 + a)}` + bottom;
  }
  return `${top}${bottom}Z`;
};

/** Clamp a tooltip/badge's left-% so it cannot overhang the track edges. */
export const clampBadgePct = (pct: number): number => Math.max(3, Math.min(97, pct));
