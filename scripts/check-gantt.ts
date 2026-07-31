/**
 * Contract for the project-schedule maths behind Gantt.
 *
 * The axis itself is check-planning.ts's job — this file pins only what a Gantt
 * adds on top: the hierarchy projection, summary rollups, slip against a
 * baseline, and dependency routing. Every one of them fails silently. A parent
 * bar rolled up from the wrong children is a plausible date; a connector that
 * vanished when its subtree collapsed is a project that looks dependency-free; a
 * status that reads "not started" on a task a week overdue hides the one row
 * anybody needed to see.
 *
 * Dates use the local-time constructor for the same reason check-planning.ts
 * does: that is what the module reads.
 */
import {
  flattenGanttTasks,
  formatGanttVariance,
  ganttColumns,
  ganttColumnWidths,
  ganttConnectors,
  ganttProgress,
  ganttRange,
  ganttRangeLabel,
  ganttSpan,
  ganttTaskStatus,
  ganttVarianceDays,
  shiftGanttAnchor,
  type GanttBarAnchor,
  type GanttTaskNode,
  type GanttView,
} from "../packages/core/src/gantt";
import { placeAppointment } from "../packages/core/src/planning";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(58)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};

const at = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min, 0, 0);
const iso = (d: Date | undefined) =>
  d === undefined
    ? undefined
    : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
const span = (s: { start: Date; end: Date } | null) => (s ? [iso(s.start), iso(s.end)] : null);
const r3 = (n: number | null) => (n === null ? null : Number(n.toFixed(3)));

console.log("\na task's span, and a parent's rolled up from its children");
t(span(ganttSpan({ id: "a", start: at(2026, 1, 5), end: at(2026, 1, 9) })), ["2026-01-05 00:00", "2026-01-09 00:00"], "its own dates");
t(
  span(
    ganttSpan({
      id: "p",
      children: [
        { id: "c1", start: at(2026, 1, 10), end: at(2026, 1, 12) },
        { id: "c2", start: at(2026, 1, 3), end: at(2026, 1, 6) },
      ],
    }),
  ),
  ["2026-01-03 00:00", "2026-01-12 00:00"],
  "a parent with no dates spans its children, in either order",
);
t(
  span(
    ganttSpan({
      id: "p",
      start: at(2026, 1, 1),
      end: at(2026, 1, 31),
      children: [{ id: "c", start: at(2026, 1, 10), end: at(2026, 1, 12) }],
    }),
  ),
  ["2026-01-01 00:00", "2026-01-31 00:00"],
  "stated dates beat the rollup",
);
t(
  span(ganttSpan({ id: "p", children: [{ id: "c", children: [{ id: "g", start: at(2026, 2, 2), end: at(2026, 2, 4) }] }] })),
  ["2026-02-02 00:00", "2026-02-04 00:00"],
  "the rollup reaches grandchildren",
);
// Half-entered data is not a milestone: drawing a start-only task as a point
// invents an end date nobody typed.
t(ganttSpan({ id: "a", start: at(2026, 1, 5) }), null, "a start with no end is not a span");
t(ganttSpan({ id: "a" }), null, "no dates and no children is null, not today");
t(span(ganttSpan({ id: "a", children: [{ id: "c" }] })), null, "children without dates roll up to nothing");
t(
  span(ganttSpan({ id: "a", start: at(2026, 1, 9), end: at(2026, 1, 5) })),
  ["2026-01-05 00:00", "2026-01-09 00:00"],
  "inverted dates are normalised to their bounds, not swapped and believed",
);

console.log("\npercent complete, and how a parent averages its children");
t(ganttProgress({ id: "a", percentComplete: 40 }), 40, "its own number");
t(ganttProgress({ id: "a", percentComplete: 150 }), 100, "clamped above");
t(ganttProgress({ id: "a", percentComplete: -20 }), 0, "clamped below");
t(ganttProgress({ id: "a" }), null, "no number and no children is unknown, not zero");
// Weighted by duration: an unweighted mean lets a one-day task cancel a ten-day
// one, and a plan is not half done because half its ROWS are.
t(
  r3(
    ganttProgress({
      id: "p",
      children: [
        { id: "c1", start: at(2026, 1, 1), end: at(2026, 1, 11), percentComplete: 100 },
        { id: "c2", start: at(2026, 1, 11), end: at(2026, 1, 12), percentComplete: 0 },
      ],
    }),
  ),
  90.909,
  "ten days done and one day not is 90.9%, not 50%",
);
t(
  ganttProgress({
    id: "p",
    children: [
      { id: "c1", start: at(2026, 1, 1), end: at(2026, 1, 3), percentComplete: 100 },
      { id: "c2", start: at(2026, 1, 3), end: at(2026, 1, 5) },
    ],
  }),
  50,
  "a child that reports nothing counts as 0, not as absent",
);
t(
  ganttProgress({ id: "p", children: [{ id: "c1", start: at(2026, 1, 1), end: at(2026, 1, 3) }] }),
  null,
  "…but a subtree where NOBODY reports is unknown, which is a different thing",
);
// All-milestone children weigh zero, so the weighted mean would divide by zero.
t(
  ganttProgress({
    id: "p",
    children: [
      { id: "m1", start: at(2026, 1, 1), end: at(2026, 1, 1), percentComplete: 100 },
      { id: "m2", start: at(2026, 1, 5), end: at(2026, 1, 5), percentComplete: 0 },
    ],
  }),
  50,
  "zero-length children fall back to a plain mean",
);
t(
  ganttProgress({
    id: "p",
    percentComplete: 10,
    children: [{ id: "c", start: at(2026, 1, 1), end: at(2026, 1, 11), percentComplete: 100 }],
  }),
  10,
  "a parent that states its own number is believed over its children",
);
t(
  r3(
    ganttProgress({
      id: "root",
      children: [
        { id: "p", percentComplete: 0, children: [{ id: "c", start: at(2026, 1, 1), end: at(2026, 1, 11), percentComplete: 100 }] },
      ],
    }),
  ),
  0,
  "…and the subtree under it is not re-derived one level up either",
);

console.log("\nslip against the baseline, in whole calendar days");
t(ganttVarianceDays(at(2026, 3, 3), at(2026, 3, 1)), 2, "two days late");
t(ganttVarianceDays(at(2026, 3, 1), at(2026, 3, 4)), -3, "three days early");
// Whole calendar days, not 24-hour blocks: finishing at 18:00 instead of 09:00
// on the same date is not late, and a DST boundary must not make it 1.96.
t(ganttVarianceDays(at(2026, 3, 1, 18), at(2026, 3, 1, 9)), 0, "same date, different hours, is on time");
t(ganttVarianceDays(at(2027, 1, 1), at(2026, 1, 1)), 365, "across a year");
t(formatGanttVariance(0), "On time", "zero is words, not '+0d'");
t(formatGanttVariance(452), "+452d", "late carries a sign");
t(formatGanttVariance(-3), "-3d", "so does early");
t(formatGanttVariance(null), null, "no baseline, no chip");

console.log("\nthe status a bar is coloured by");
const NOW = at(2026, 7, 21, 12);
const status = (task: GanttTaskNode) => ganttTaskStatus(task, ganttSpan(task), ganttProgress(task), NOW);
t(status({ id: "a", status: "on-track", start: at(2026, 1, 1), end: at(2026, 1, 2) }), "on-track", "a stated status wins outright");
// Finished beats late. A task delivered two weeks after its baseline is done —
// the slip is already said by the variance chip, and painting it red leaves a
// project that shipped looking like a project on fire.
t(
  status({ id: "a", start: at(2026, 1, 1), end: at(2026, 1, 20), baselineEnd: at(2026, 1, 6), percentComplete: 100 }),
  "complete",
  "100% past its baseline is complete, not delayed",
);
t(
  status({ id: "a", start: at(2026, 8, 1), end: at(2026, 8, 20), baselineEnd: at(2026, 8, 6), percentComplete: 30 }),
  "delayed",
  "past the baseline and unfinished is delayed, even in the future",
);
t(
  status({ id: "a", start: at(2026, 6, 1), end: at(2026, 6, 20), percentComplete: 30 }),
  "delayed",
  "no baseline, but the end has passed and it is unfinished",
);
// The reading that hides the most urgent row on the chart.
t(
  status({ id: "a", start: at(2026, 6, 1), end: at(2026, 6, 20), percentComplete: 0 }),
  "delayed",
  "0% and a week overdue is delayed, NOT not-started",
);
t(status({ id: "a", start: at(2026, 8, 1), end: at(2026, 8, 20), percentComplete: 0 }), "not-started", "0% and still ahead");
t(status({ id: "a", start: at(2026, 8, 1), end: at(2026, 8, 20) }), "not-started", "unknown progress reads as not started");
t(status({ id: "a", start: at(2026, 8, 1), end: at(2026, 8, 20), percentComplete: 40 }), "on-track", "under way and not late");
t(status({ id: "a" }), "not-started", "a task with no dates at all cannot be late");

console.log("\nflattening the tree onto the rows that are on screen");
interface Task extends GanttTaskNode {
  name: string;
  children?: Task[];
}
const TREE: Task[] = [
  {
    id: "p1",
    name: "Phase 1",
    children: [
      { id: "t1", name: "Survey", start: at(2026, 7, 20), end: at(2026, 7, 22), percentComplete: 100 },
      {
        id: "t2",
        name: "Build",
        children: [{ id: "t2a", name: "Frame", start: at(2026, 7, 23), end: at(2026, 7, 27) }],
      },
    ],
  },
  { id: "p2", name: "Phase 2", start: at(2026, 8, 1), end: at(2026, 8, 5) },
];

const openAll = flattenGanttTasks(TREE, () => true, NOW);
t(openAll.rows.map((r) => r.task.id), ["p1", "t1", "t2", "t2a", "p2"], "depth-first, parents before children");
t(openAll.rows.map((r) => r.depth), [0, 1, 1, 2, 0], "depth is the indent");
t(openAll.rows.map((r) => r.index), [0, 1, 2, 3, 4], "index is the row's y coordinate");
t(openAll.rows.map((r) => r.parentId), [null, "p1", "p1", "t2", null], "parents are named");
t(openAll.rows.map((r) => r.hasChildren), [true, false, true, false, false], "leaves know they are leaves");
t(span(openAll.rows[0].span), ["2026-07-20 00:00", "2026-07-27 00:00"], "the root's summary bar spans its whole subtree");

const closed = flattenGanttTasks(TREE, (task) => task.id !== "t2", NOW);
t(closed.rows.map((r) => r.task.id), ["p1", "t1", "t2", "p2"], "a collapsed parent keeps its own row and drops its children");
t(closed.rows.map((r) => r.expanded), [true, false, false, false], "and reports itself closed");
// The failure this prevents: a dependency touching a hidden task silently
// vanishing, so a collapsed project looks like it has no dependencies.
t(closed.rowIndexById.get("t2a"), 2, "a hidden task points at the summary row it folded into");
t(openAll.rowIndexById.get("t2a"), 3, "…and at its own row when it is visible");
t([...flattenGanttTasks(TREE, () => false, NOW).rowIndexById.keys()].sort(), ["p1", "p2", "t1", "t2", "t2a"], "EVERY id is mapped, visible or not");
t(flattenGanttTasks(TREE, () => false, NOW).rows.map((r) => r.task.id), ["p1", "p2"], "all closed is the roots");

const asked: string[] = [];
flattenGanttTasks(TREE, (task) => {
  asked.push(task.id);
  return true;
}, NOW);
t(asked, ["p1", "t2"], "a leaf is never asked whether it is expanded");
t(flattenGanttTasks([], () => true, NOW).rows.length, 0, "no tasks, no rows");

console.log("\ndependency connectors");
const OPTS = { axisWidth: 1000, rowHeight: 40, stub: 12 };
const anchors = (entries: Array<[string, GanttBarAnchor]>) => new Map(entries);
const A: GanttBarAnchor = { rowIndex: 0, startPct: 10, widthPct: 20 }; // x 100..300, y 20
const B: GanttBarAnchor = { rowIndex: 1, startPct: 40, widthPct: 20 }; // x 400..600, y 60
const BACK: GanttBarAnchor = { rowIndex: 1, startPct: 5, widthPct: 10 }; // x 50..150, y 60

const fs = ganttConnectors(anchors([["a", A], ["b", B]]), [{ from: "a", to: "b" }], OPTS);
t(fs.length, 1, "one dependency, one connector");
t(fs[0].type, "finish-to-start", "finish-to-start is the default");
t(fs[0].d, "M 300 20 L 388 20 L 388 60 L 400 60", "a forward link is three segments: out, down, in");
t(fs[0].arrow, { x: 400, y: 60, dir: 1 }, "the head lands on the successor's start, pointing right");

// A successor that begins before its predecessor ends has to double back. A
// straight line there would run through every bar in between.
const back = ganttConnectors(anchors([["a", A], ["b", BACK]]), [{ from: "a", to: "b" }], OPTS);
t(back[0].d, "M 300 20 L 312 20 L 312 40 L 38 40 L 38 60 L 50 60", "a backward link turns in the gutter between the rows");

const ss = ganttConnectors(anchors([["a", A], ["b", B]]), [{ from: "a", to: "b", type: "start-to-start" }], OPTS);
t(ss[0].d, "M 100 20 L 88 20 L 88 40 L 388 40 L 388 60 L 400 60", "start-to-start leaves the predecessor's start");
const ff = ganttConnectors(anchors([["a", A], ["b", B]]), [{ from: "a", to: "b", type: "finish-to-finish" }], OPTS);
t(ff[0].arrow, { x: 600, y: 60, dir: -1 }, "finish-to-finish arrives at the successor's END, pointing left");
const sf = ganttConnectors(
  anchors([["a", { rowIndex: 0, startPct: 40, widthPct: 20 }], ["b", { rowIndex: 1, startPct: 5, widthPct: 10 }]]),
  [{ from: "a", to: "b", type: "start-to-finish" }],
  OPTS,
);
t(sf[0].d, "M 400 20 L 162 20 L 162 60 L 150 60", "start-to-finish going leftwards is three segments too");

t(ganttConnectors(anchors([["a", A]]), [{ from: "a", to: "b" }], OPTS).length, 0, "a dependency naming a task with no bar draws nothing");
t(ganttConnectors(anchors([["a", A]]), [{ from: "a", to: "a" }], OPTS).length, 0, "a task cannot depend on itself");
// Collapse a parent and a dozen internal links all resolve to the same pair of
// summary bars. Without this they stack into one thick arrow.
t(
  ganttConnectors(anchors([["a", A], ["b", A], ["c", B]]), [{ from: "a", to: "b" }], OPTS).length,
  0,
  "both ends folded into ONE summary bar is not a link",
);
t(
  ganttConnectors(anchors([["a", A], ["b", A], ["c", B], ["d", B]]), [{ from: "a", to: "c" }, { from: "b", to: "d" }], OPTS).length,
  1,
  "two links resolving to the same two rows collapse to one",
);
t(
  ganttConnectors(anchors([["a", A], ["b", B]]), [{ from: "a", to: "b" }, { from: "a", to: "b", type: "start-to-start" }], OPTS).length,
  2,
  "…but a different TYPE between the same rows is a different link",
);
t(fs[0].id, "a->b:finish-to-start", "the id is the dependency, not the rows, so it survives a collapse");
t(ganttConnectors(anchors([["a", A], ["b", B]]), [], OPTS).length, 0, "no dependencies, no lines");

console.log("\nthe axis: quarter and year, so a multi-month plan can be seen whole");
// A calendar quarter, from any date inside it — not three months from the anchor.
t(
  [iso(ganttRange("quarter", at(2026, 8, 17)).start), iso(ganttRange("quarter", at(2026, 8, 17)).end)],
  ["2026-07-01 00:00", "2026-10-01 00:00"],
  "quarter: the 1st of Jul to the 1st of Oct, from mid-August",
);
t(iso(ganttRange("quarter", at(2026, 1, 1)).start), "2026-01-01 00:00", "January is in Q1");
t(iso(ganttRange("quarter", at(2026, 12, 31)).end), "2027-01-01 00:00", "Q4 rolls into the next YEAR");
t(
  [iso(ganttRange("year", at(2026, 8, 17)).start), iso(ganttRange("year", at(2026, 8, 17)).end)],
  ["2026-01-01 00:00", "2027-01-01 00:00"],
  "year: Jan 1 to Jan 1",
);
// Delegation is the point: the three old views must be untouched.
t(iso(ganttRange("week", at(2026, 7, 21)).start), "2026-07-20 00:00", "week still delegates to planning");
t(iso(ganttRange("month", at(2026, 7, 21)).end), "2026-08-01 00:00", "month still delegates to planning");

t(iso(shiftGanttAnchor("quarter", at(2026, 8, 17), 1)), "2026-10-01 00:00", "next quarter");
t(iso(shiftGanttAnchor("quarter", at(2026, 2, 5), -1)), "2025-10-01 00:00", "previous quarter crosses the year");
t(iso(shiftGanttAnchor("year", at(2026, 8, 17), 1)), "2027-01-01 00:00", "next year normalises to Jan 1");
t(iso(shiftGanttAnchor("week", at(2026, 7, 21), 1)), "2026-07-27 00:00", "week still delegates");

t(ganttRangeLabel("quarter", at(2026, 8, 17)), "Q3 2026", "a quarter names itself");
t(ganttRangeLabel("quarter", at(2026, 1, 1)), "Q1 2026", "…and counts from 1, not 0");
t(ganttRangeLabel("quarter", at(2026, 12, 31)), "Q4 2026", "Q4");
t(ganttRangeLabel("year", at(2026, 8, 17)), "2026", "a year is just the year");
t(ganttRangeLabel("month", at(2026, 7, 21)), "July 2026", "month still delegates");

console.log("\ncolumn granularity and labels");
const yearCols = ganttColumns("year", at(2026, 8, 17), { now: at(2026, 8, 17) });
t(yearCols.length, 12, "a year is 12 month columns, not 365 day ones");
t(yearCols.map((c) => c.label).slice(0, 3), ["Jan", "Feb", "Mar"], "labelled by month name — '7' means nothing when it is a month");
t(yearCols.filter((c) => c.today).length, 1, "exactly one month holds now");
t(yearCols.findIndex((c) => c.today), 7, "17 August lands in the August column");
// Q3 2026: 1 Jul is a Wednesday, so the first column is a 5-day stub.
const qCols = ganttColumns("quarter", at(2026, 8, 17), { now: at(2026, 8, 17) });
t(qCols.length, 14, "Q3 2026 is 14 week columns");
t(qCols.map((c) => c.label).slice(0, 3), ["1 Jul", "6 Jul", "13 Jul"], "labelled by the week's first date");
t(
  [iso(qCols[0].start), iso(qCols[0].end)],
  ["2026-07-01 00:00", "2026-07-06 00:00"],
  "the first week column is PARTIAL — a quarter does not start on a Monday",
);
t(iso(qCols.at(-1)!.end), "2026-10-01 00:00", "…and the last is clipped to the quarter, not run past it");
t(qCols.filter((c) => c.today).length, 1, "exactly one week holds now");
// A week or a month contains the weekend, so shading either says nothing.
t(qCols.some((c) => c.nonWorking) || yearCols.some((c) => c.nonWorking), false, "no column of weeks or months is 'non-working'");

console.log("\ncolumns TILE the range exactly — the invariant bars depend on");
/* This is the one that keeps a bar on its gridline. `placeAppointment` returns
   a percentage of the whole range, so a boundary only lines up when the columns
   partition the range with no gap and no overlap. Nothing else in the repo
   tests it, and every way it can break is invisible. */
const tiles = (view: GanttView, anchor: Date, name: string) => {
  const range = ganttRange(view, anchor);
  const cols = ganttColumns(view, anchor, { now: anchor });
  const startsAtRangeStart = cols[0].start.getTime() === range.start.getTime();
  const endsAtRangeEnd = cols.at(-1)!.end.getTime() === range.end.getTime();
  const contiguous = cols.every((c, i) => i === 0 || c.start.getTime() === cols[i - 1].end.getTime());
  const forward = cols.every((c) => c.end.getTime() > c.start.getTime());
  t([startsAtRangeStart, contiguous, endsAtRangeEnd, forward], [true, true, true, true], name);
};
tiles("day", at(2026, 7, 21), "day columns tile the day");
tiles("week", at(2026, 7, 21), "week columns tile the week");
tiles("month", at(2026, 7, 21), "month columns tile the month");
tiles("month", at(2026, 2, 10), "…including a 28-day February");
tiles("quarter", at(2026, 8, 17), "week columns tile the quarter, partial ends included");
tiles("quarter", at(2026, 4, 15), "…in a quarter that starts on a Wednesday too");
tiles("year", at(2026, 8, 17), "month columns tile the year");
tiles("year", at(2024, 3, 1), "…including a leap year");

console.log("\ncolumn widths come from duration, not from the column count");
const yearRange = ganttRange("year", at(2026, 8, 17));
const yearWidths = ganttColumnWidths(yearCols, yearRange, 1200);
t(Number(yearWidths.reduce((a, b) => a + b, 0).toFixed(6)), 1200, "the widths sum to the axis exactly");
// 31 days vs 28 at 1200px over 365: the naive uniform answer is 100 for both,
// and that is the bug — a bar in December would sit ~3 days off its gridline.
t(Number(yearWidths[0].toFixed(4)), Number(((31 / 365) * 1200).toFixed(4)), "January gets its 31 days' worth");
t(Number(yearWidths[1].toFixed(4)), Number(((28 / 365) * 1200).toFixed(4)), "February gets its 28");
t(yearWidths[0] > yearWidths[1], true, "…so a 31-day month is WIDER than a 28-day one");
t(Number((yearWidths.length ? 1200 / 12 : 0).toFixed(4)) === Number(yearWidths[0].toFixed(4)), false, "which is not what uniform widths would give");
// The old uniform maths and the new one must agree wherever durations are equal,
// or day/week/month would shift by a pixel for no reason.
const weekCols2 = ganttColumns("week", at(2026, 7, 21), { now: at(2026, 7, 21) });
const weekWidths = ganttColumnWidths(weekCols2, ganttRange("week", at(2026, 7, 21)), 7 * 128);
t(weekWidths.map((w) => Number(w.toFixed(6))), new Array(7).fill(128), "equal-duration columns are unchanged to the pixel");
t(ganttColumnWidths([], yearRange, 1200), [], "no columns, no widths");
t(ganttColumnWidths(yearCols, { start: yearRange.end, end: yearRange.start }, 1200).every((w) => w === 0), true, "an inverted range measures nothing rather than NaN");

console.log("\na bar's edge lands exactly on the column boundary it shares");
/* The acceptance test for the whole change, as arithmetic: place a task that
   starts on 1 September and confirm its left edge is the cumulative width of
   Jan..Aug, which is where the September gridline is drawn. Uniform columns
   put the gridline at 8/12 of the axis and the bar at 243/365 — a visible,
   entirely plausible-looking error. */
const AXIS = 1200;
const sept = placeAppointment({ start: at(2026, 9, 1), end: at(2026, 9, 30) }, yearRange)!;
const gridlineAtSept = yearWidths.slice(0, 8).reduce((a, b) => a + b, 0);
t(
  Number(((sept.startPct / 100) * AXIS).toFixed(6)),
  Number(gridlineAtSept.toFixed(6)),
  "1 September sits on the September gridline",
);
t(
  Number((((sept.startPct + sept.widthPct) / 100) * AXIS).toFixed(6)),
  Number((yearWidths.slice(0, 8).reduce((a, b) => a + b, 0) + (29 / 30) * yearWidths[8]).toFixed(6)),
  "…and the bar's right edge is 29/30 of the way through September",
);
t(
  Number((((8 / 12) * AXIS)).toFixed(6)) === Number(gridlineAtSept.toFixed(6)),
  false,
  "the uniform-width answer is different, which is the bug this prevents",
);

console.log(f === 0 ? "\nall passed\n" : `\n${f} FAILED\n`);
process.exit(f === 0 ? 0 : 1);
