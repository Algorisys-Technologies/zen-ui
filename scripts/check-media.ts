/**
 * Contract for the media-component math (MediaTimeline / Waveform).
 *
 * The drag clamps are the part of these components that can be WRONG rather
 * than merely ugly — an off-by-one against a neighbour lets ranges overlap,
 * and an unclamped trim reads audio that does not exist. A browser hides all
 * of it: the handle still moves, the bar still draws. So the math is pure, in
 * core, and pinned here — both bindings consume the same functions, which is
 * what keeps the two renderers' drag behaviour identical by construction.
 *
 * The range-edge cases mirror StudioX's segment-timeline.tsx (the consumer
 * contract in IMPLEMENT-media-components.md), including the deliberate
 * minDuration GAP between neighbours — start clamps to prev.end + min, not
 * prev.end, so two 12px handles never stack on one shared edge.
 */
import {
  clampBadgePct,
  dragClipEdge,
  dragRangeEdge,
  formatMediaTime,
  moveClip,
  moveRange,
  waveformPath,
  type MediaRange,
  type WaveformClip,
} from "../packages/core/src/media";

let f = 0;

/** Compare after rounding every number to 6 dp — clamp math is float sums. */
const round = (v: unknown): unknown => {
  if (typeof v === "number") return Math.round(v * 1e6) / 1e6;
  if (Array.isArray(v)) return v.map(round);
  if (v && typeof v === "object")
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, round(x)]));
  return v;
};
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(round(got)) === JSON.stringify(round(want));
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(52)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};

console.log("\nformatMediaTime — HH:MM:SS.cc, the StudioX format");
t(formatMediaTime(0), "00:00:00.00", "zero");
t(formatMediaTime(3661.25), "01:01:01.25", "hours + centiseconds");
t(formatMediaTime(59.999), "00:00:59.99", "centiseconds floor, no rounding up");
t(formatMediaTime(3600), "01:00:00.00", "exact hour");

console.log("\ndragRangeEdge — neighbour clamps with the minDuration gap");
const ranges: MediaRange[] = [
  { start: 10, end: 20 },
  { start: 30, end: 40 },
  { start: 60, end: 80 },
];
const frozen = JSON.stringify(ranges);
t(
  dragRangeEdge(ranges, 1, "start", 32, 100, 0.1),
  { ranges: [ranges[0], { start: 32, end: 40 }, ranges[2]], edgeTime: 32 },
  "free move of a start edge",
);
t(
  dragRangeEdge(ranges, 1, "start", 5, 100, 0.1).edgeTime,
  20.1,
  "start clamps to prev.end + min (the gap)",
);
t(
  dragRangeEdge(ranges, 1, "start", 39.99, 100, 0.1).edgeTime,
  39.9,
  "start clamps to own end - min",
);
t(
  dragRangeEdge(ranges, 1, "end", 70, 100, 0.1).edgeTime,
  59.9,
  "end clamps to next.start - min",
);
t(dragRangeEdge(ranges, 0, "start", -5, 100, 0.1).edgeTime, 0, "first start floors at 0");
t(dragRangeEdge(ranges, 2, "end", 150, 100, 0.1).edgeTime, 100, "last end caps at duration");
t(JSON.stringify(ranges) === frozen, true, "input array is not mutated");
t(
  dragRangeEdge(ranges, 1, "start", 32, 100, 0.1).ranges[0] === ranges[0],
  true,
  "untouched neighbours keep identity (fine-grained renderers)",
);

console.log("\ndragRangeEdge independent mode — free spans, no neighbour clamps");
// Overlay-element lanes (StudioX elements-timeline): ranges are independent
// spans that may overlap freely. Only [0, duration] and the range's own
// minimum span clamp an edge.
t(
  dragRangeEdge(ranges, 1, "start", 15, 100, 0.1, "independent").ranges[1],
  { start: 15, end: 40 },
  "a start may cross the previous range (overlap allowed)",
);
t(
  dragRangeEdge(ranges, 1, "end", 70, 100, 0.1, "independent").ranges[1],
  { start: 30, end: 70 },
  "an end may cross the next range",
);
t(
  dragRangeEdge(ranges, 1, "start", -5, 100, 0.1, "independent").edgeTime,
  0,
  "still floors at 0",
);
t(
  dragRangeEdge(ranges, 1, "end", 150, 100, 0.1, "independent").edgeTime,
  100,
  "still caps at duration",
);
t(
  dragRangeEdge(ranges, 1, "start", 39.99, 100, 0.1, "independent").edgeTime,
  39.9,
  "own minimum span still holds",
);
t(
  dragRangeEdge(ranges, 1, "start", 15, 100, 0.1).ranges[1].start,
  20.1,
  "mode defaults to partition — existing callers unchanged",
);

console.log("\nmoveRange — body drag preserves length, clamps to the lane");
t(
  moveRange(ranges, 1, 50, 100),
  { ranges: [ranges[0], { start: 50, end: 60 }, ranges[2]], start: 50 },
  "free move keeps the span's length",
);
t(moveRange(ranges, 1, -5, 100).ranges[1], { start: 0, end: 10 }, "floors at 0");
t(
  moveRange(ranges, 1, 95, 100).ranges[1],
  { start: 90, end: 100 },
  "caps at duration minus length",
);
t(
  moveRange(ranges, 1, 50, 100).ranges[0] === ranges[0],
  true,
  "untouched ranges keep identity",
);
t(JSON.stringify(ranges) === frozen, true, "moveRange does not mutate its input");

console.log("\ndragClipEdge — left edge moves offset+start together, right edge fixed");
const clip: WaveformClip = { offset: 10, start: 2, end: 8 };
const bounds = { audioDuration: 30, laneDuration: 60, minDuration: 0.1 };
t(
  dragClipEdge(clip, "start", 12, bounds),
  { offset: 12, start: 4, end: 8 },
  "trim in: offset and start advance together",
);
t(
  dragClipEdge(clip, "start", 5, bounds),
  { offset: 8, start: 0, end: 8 },
  "trim in floors at start=0, offset follows",
);
t(
  dragClipEdge(clip, "start", 30, bounds),
  { offset: 15.9, start: 7.9, end: 8 },
  "trim in stops at end - min",
);
t(
  dragClipEdge(clip, "end", 20, bounds),
  { offset: 10, start: 2, end: 12 },
  "trim out: only end moves",
);
t(
  dragClipEdge(clip, "end", 40, bounds),
  { offset: 10, start: 2, end: 30 },
  "trim out caps at audioDuration",
);
t(
  dragClipEdge(clip, "end", 10.05, bounds),
  { offset: 10, start: 2, end: 2.1 },
  "trim out floors at start + min",
);
t(
  dragClipEdge({ offset: 55, start: 0, end: 5 }, "end", 70, bounds),
  { offset: 55, start: 0, end: 5 },
  "trim out cannot leave the lane",
);
t(clip, { offset: 10, start: 2, end: 8 }, "input clip is not mutated");

console.log("\nmoveClip — body drag clamped to the lane");
t(moveClip(clip, 20, 60), { offset: 20, start: 2, end: 8 }, "free move");
t(moveClip(clip, -5, 60), { offset: 0, start: 2, end: 8 }, "floors at 0");
t(moveClip(clip, 58, 60), { offset: 54, start: 2, end: 8 }, "caps at lane end minus width");

console.log("\nwaveformPath — one filled step-envelope path, viewBox 0 0 n 2");
t(waveformPath([0.5, 1]), "M0,0.5L1,0.5L1,0L2,0L2,2L1,2L1,1.5L0,1.5Z", "two bars");
t(waveformPath([]), "", "no peaks, no path");
t(waveformPath([0]), "M0,0.98L1,0.98L1,1.02L0,1.02Z", "silence keeps a visible sliver (minAmp)");
t(waveformPath([2]), "M0,0L1,0L1,2L0,2Z", "peaks clamp to 1");
t(waveformPath([1 / 3]), "M0,0.667L1,0.667L1,1.333L0,1.333Z", "coords round to 3 dp");

console.log("\nclampBadgePct — tooltips stay on the track");
t(clampBadgePct(-5), 3, "left clamp");
t(clampBadgePct(50), 50, "pass-through");
t(clampBadgePct(99), 97, "right clamp");

console.log(f ? `\n${f} FAILED\n` : "\nall passed\n");
process.exit(f ? 1 : 0);
