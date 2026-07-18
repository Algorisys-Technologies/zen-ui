/**
 * Contract for the pie/donut maths.
 *
 * Charts are the worst case for "it looked right": a wrong slice is still a
 * slice, a 270° wedge drawn as 90° is a perfectly convincing chart of something
 * else, and a NaN reaches the DOM as a path that simply does not draw — no
 * error, no warning, just a gap where a category was.
 *
 * This matters more than the other check scripts because the two bindings share
 * no renderer at all: React draws with recharts, Solid with hand-built SVG. This
 * file is the only thing they have in common, so it is the only place the two
 * can be made to agree.
 */
import {
  CHART_PALETTE,
  arcPath,
  describeSlices,
  formatPercent,
  polarPoint,
  sliceTotal,
  toSlices,
} from "../packages/core/src/chart";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(50)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};

const ROWS = [
  { name: "Agree", n: 50 },
  { name: "Neutral", n: 30 },
  { name: "Disagree", n: 20 },
];

console.log("\nslices — the shape of the answer");
const s = toSlices(ROWS, "name", "n");
t(s.map((x) => x.label), ["Agree", "Neutral", "Disagree"], "labels come from labelKey");
t(s.map((x) => x.value), [50, 30, 20], "values come from valueKey");
t(s.map((x) => x.percent), [0.5, 0.3, 0.2], "percentages");
t(sliceTotal(s), 100, "total");

console.log("\nangles — contiguous, clockwise, 12 o'clock to 12 o'clock");
t(s.map((x) => [x.startAngle, x.endAngle]), [[0, 180], [180, 288], [288, 360]], "each slice starts where the last ended");
t(s[0].startAngle, 0, "the first starts at 12 o'clock");
t(s[s.length - 1].endAngle, 360, "the last ends at 360 — no gap, no overlap");

console.log("\ncolours");
t(s.map((x) => x.color), CHART_PALETTE.slice(0, 3), "palette by index");
t(toSlices(ROWS, "name", "n", ["#f00", "#0f0"]).map((x) => x.color), ["#f00", "#0f0", "#f00"], "a short custom palette wraps");

console.log("\nthe values a real dataset actually contains");
// Every one of these renders something WRONG rather than failing.
t(toSlices([{ k: "a", n: 5 }, { k: "b", n: undefined }], "k", "n").map((x) => x.value), [5, 0], "a missing value is 0, not NaN");
t(toSlices([{ k: "a", n: 5 }, { k: "b", n: "x" }], "k", "n").map((x) => x.value), [5, 0], "a non-numeric value is 0");
t(toSlices([{ k: "a", n: 5 }, { k: "b", n: NaN }], "k", "n").map((x) => x.value), [5, 0], "an explicit NaN is 0");
// One NaN would otherwise poison the total and every percentage with it.
t(toSlices([{ k: "a", n: 5 }, { k: "b", n: NaN }], "k", "n").map((x) => x.percent), [1, 0], "…and does not poison the other percentages");
// abs() would show -5 of 10 as half the circle. It is not half of anything.
t(toSlices([{ k: "a", n: 10 }, { k: "b", n: -5 }], "k", "n").map((x) => x.label), ["a"], "a negative value is dropped, not abs()'d");
t(toSlices([{ k: "a", n: 0 }, { k: "b", n: 0 }], "k", "n").map((x) => x.percent), [0, 0], "a zero total gives 0%, not NaN");
t(toSlices([], "k", "n"), [], "no rows");
t(toSlices([{ n: 5 }], "k", "n").map((x) => x.label), [""], "a missing label is empty, not 'undefined'");

console.log("\npolar points — 12 o'clock, clockwise, in SVG's flipped y");
const p = (a: number) => polarPoint(0, 0, 10, a).map((n) => Math.round(n * 100) / 100);
t(p(0), [0, -10], "0° is straight up (SVG y grows down)");
t(p(90), [10, 0], "90° is right — clockwise, not anticlockwise");
t(p(180), [0, 10], "180° is down");
t(p(270), [-10, 0], "270° is left");

console.log("\narcs");
const wedge = arcPath(50, 50, 40, 0, 0, 90);
t(wedge.startsWith("M 50 50"), true, "a pie wedge starts at the centre");
t(wedge.includes("Z"), true, "…and closes");
t(arcPath(50, 50, 40, 20, 0, 90).startsWith("M 50 10"), true, "a donut segment starts on the outer edge");
t(arcPath(50, 50, 40, 0, 90, 90), "", "a zero-width slice draws nothing at all");
t(arcPath(50, 50, 40, 0, 90, 0), "", "a backwards slice draws nothing");

console.log("\nthe large-arc flag — a 270° slice drawn as 90° is a convincing lie");
const flag = (path: string) => /A \d+ \d+ 0 (\d)/.exec(path)?.[1];
t(flag(arcPath(50, 50, 40, 0, 0, 90)), "0", "90° takes the short way");
t(flag(arcPath(50, 50, 40, 0, 0, 180)), "0", "exactly 180° is still short");
t(flag(arcPath(50, 50, 40, 0, 0, 181)), "1", "181° takes the long way");
t(flag(arcPath(50, 50, 40, 0, 0, 270)), "1", "270° takes the long way");

console.log("\n100% — one category, which is a real answer");
// start === end, so a single arc's two points coincide and SVG draws NOTHING.
// A survey where everyone agreed would render an empty box.
const full = arcPath(50, 50, 40, 0, 0, 360);
t(full !== "", true, "a full-circle pie draws something");
t((full.match(/A /g) ?? []).length, 2, "…as two arcs, because one cannot close a circle");
const fullDonut = arcPath(50, 50, 40, 20, 0, 360);
t((fullDonut.match(/A /g) ?? []).length, 4, "a full-circle donut draws four arcs (outer + hole)");
t((fullDonut.match(/Z/g) ?? []).length, 2, "…as two closed subpaths, so the hole is punched");
// The single-slice case end-to-end: one row -> one 360° slice -> a real path.
const one = toSlices([{ k: "Agree", n: 7 }], "k", "n");
t(one[0].percent, 1, "a single row is 100%");
t(arcPath(50, 50, 40, 0, one[0].startAngle, one[0].endAngle) !== "", true, "…and its path is not empty");

console.log("\npercent labels");
t(formatPercent(0.5), "50%", "a whole percent has no decimal");
t(formatPercent(1), "100%", "100%");
t(formatPercent(0), "0%", "0%");
t(formatPercent(1 / 3), "33.3%", "a third gets one decimal");
t(formatPercent(0.005), "0.5%", "a half percent survives");

console.log("\nthe screen-reader summary");
t(describeSlices(s), "Pie chart: Agree 50%, Neutral 30%, Disagree 20%", "names every slice and its share");
t(describeSlices([], "Donut"), "Donut: no data", "empty");

console.log(f ? `\n${f} FAILED\n` : "\nall passed\n");
process.exit(f ? 1 : 0);
