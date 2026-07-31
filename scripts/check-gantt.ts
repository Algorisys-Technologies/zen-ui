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
  ganttAddWorkingMs,
  ganttColumns,
  ganttColumnWidths,
  ganttConnectors,
  ganttFitRange,
  ganttFitUnit,
  ganttPaneColumns,
  ganttProgress,
  ganttRange,
  ganttRangeColumns,
  ganttRangeLabel,
  ganttRowWindow,
  ganttSpan,
  ganttSpanLabel,
  ganttIsWorking,
  ganttWorkingMs,
  ganttWorkingPeriodsOn,
  ganttWorkingSegments,
  GANTT_CALENDAR_24_7,
  GANTT_PANE_COLUMNS,
  ganttTaskStatus,
  ganttVarianceDays,
  shiftGanttAnchor,
  type GanttAnchoredView,
  type GanttBarAnchor,
  type GanttCalendar,
  type GanttTaskNode,
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
const tiles = (view: GanttAnchoredView, anchor: Date, name: string) => {
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
/* 29/30 in REAL elapsed time, not in days: a September containing a DST
   transition is 719 hours, not 720, so the naive fraction is wrong by a
   measurable amount in Santiago. The columns are duration-proportional and get
   this right; the assertion has to be too. */
const septFraction =
  (at(2026, 9, 30).getTime() - at(2026, 9, 1).getTime()) /
  (at(2026, 10, 1).getTime() - at(2026, 9, 1).getTime());
t(
  Number((((sept.startPct + sept.widthPct) / 100) * AXIS).toFixed(6)),
  Number((yearWidths.slice(0, 8).reduce((a, b) => a + b, 0) + septFraction * yearWidths[8]).toFixed(6)),
  "…and the bar's right edge is 29/30 of September, measured in elapsed time",
);
t(
  Number((((8 / 12) * AXIS)).toFixed(6)) === Number(gridlineAtSept.toFixed(6)),
  false,
  "the uniform-width answer is different, which is the bug this prevents",
);

console.log("\nfit — the axis whose range comes from the data");
/* Every one of these fails silently. A fit range that misses a child by two
   days draws a bar clipped at the edge of the ONE view that exists to show
   everything whole; a granularity chosen a band too fine is 400 columns of
   smear; a range that does not snap leaves a two-hour sliver of a first
   column that every bar is then measured against. */
const FIT_PLAN: GanttTaskNode[] = [
  {
    id: "P",
    // Its own dates, DELIBERATELY narrower than the children's. ganttSpan
    // believes a parent that states dates, so a fit range built from the roots
    // alone would cut the last child in half.
    start: at(2026, 7, 6),
    end: at(2026, 9, 1),
    children: [
      { id: "a", start: at(2026, 7, 6), end: at(2026, 7, 24) },
      { id: "b", start: at(2026, 8, 3), end: at(2026, 10, 30) },
    ],
  },
];
const fit = ganttFitRange(FIT_PLAN)!;
t(fit.start.getTime() <= at(2026, 7, 6).getTime(), true, "the fit range starts at or before the earliest task");
t(fit.end.getTime() >= at(2026, 10, 30).getTime(), true, "…and ends at or after the LATEST, child included");
/* 116 days of plan plus 4.64 either side is 125, which is the WEEK band — so
   the snap is to Mondays, not to the 1sts a reader of the label might assume.
   The granularity and the snap come from the same number, deliberately. */
t(span(fit), ["2026-06-29 00:00", "2026-11-09 00:00"], "padded, then snapped outward to whole weeks");

/* Over a year, so the band is months and the snap is to the 1st. This is the
   case `year` could never show: it crosses New Year, and no calendar year
   contains it. */
const LONG_FIT = ganttFitRange([
  { id: "L", start: at(2026, 7, 6), end: at(2027, 10, 30) },
])!;
t(span(LONG_FIT), ["2026-06-01 00:00", "2027-12-01 00:00"], "a plan crossing New Year snaps to whole months");

t(ganttFitRange([]), null, "no tasks, no range — a real state, not an error");
t(ganttFitRange([{ id: "x" }, { id: "y", children: [{ id: "z" }] }]), null, "…and neither does a plan where nothing has dates");
t(
  ganttFitRange([{ id: "half", start: at(2026, 7, 6) }]),
  null,
  "a start with no end is half-entered data, not a milestone",
);
/* A milestone is a zero-width span, and a zero-width RANGE divides by zero in
   every percentage placeAppointment computes. The padding floor is what stops
   the axis collapsing. */
const milestone = ganttFitRange([{ id: "m", start: at(2026, 7, 6), end: at(2026, 7, 6) }])!;
t(milestone.end.getTime() > milestone.start.getTime(), true, "a single milestone still gets a real axis");
t(span(milestone), ["2026-07-05 00:00", "2026-07-07 00:00"], "…one day either side, snapped to whole hours");
/* Inverted dates are normalised by ganttSpan, so the fit range must not invert
   with them — an end before its start makes every width negative. */
const inverted = ganttFitRange([{ id: "i", start: at(2026, 7, 24), end: at(2026, 7, 6) }])!;
t(inverted.end.getTime() > inverted.start.getTime(), true, "inverted task dates still yield a forward range");

console.log("\nthe granularity a fit span is drawn at — pinned, not a ternary");
const DAY = 24 * 60 * 60 * 1000;
t(ganttFitUnit(0), "hour", "a zero span is hours");
t(ganttFitUnit(2 * DAY), "hour", "two days is still hours (48 columns)");
t(ganttFitUnit(2 * DAY + 1), "day", "…and a millisecond more is days");
t(ganttFitUnit(45 * DAY), "day", "45 days is days");
t(ganttFitUnit(45 * DAY + 1), "week", "…and a millisecond more is weeks");
t(ganttFitUnit(315 * DAY), "week", "315 days is weeks");
t(ganttFitUnit(315 * DAY + 1), "month", "…and a millisecond more is months");
t(ganttFitUnit(10 * 365 * DAY), "month", "a decade is still months — there is nothing coarser");
/* The cap each threshold exists to hold. A band that can produce 400 columns is
   a band that produces a smear, and nothing in the renderer would notice — the
   axis would simply be unreadable and every check would still be green. */
for (const [unit, days, cap] of [["hour", 2, 48], ["day", 45, 46], ["week", 315, 46]] as const) {
  const start = at(2026, 1, 5);
  const range = { start, end: new Date(start.getTime() + days * DAY) };
  const cols = ganttRangeColumns(range, unit, { now: start });
  t(cols.length <= cap, true, `${days} days at ${unit} granularity is ${cols.length} columns, <= ${cap}`);
}

console.log("\ncolumns tile an ARBITRARY range too — the same invariant, unanchored");
const tilesRange = (range: { start: Date; end: Date }, unit: "hour" | "day" | "week" | "month", name: string) => {
  const cols = ganttRangeColumns(range, unit, { now: range.start });
  if (cols.length === 0) {
    t(false, true, `${name} — produced NO columns`);
    return;
  }
  t(
    [
      cols[0].start.getTime() === range.start.getTime(),
      cols.every((c, i) => i === 0 || c.start.getTime() === cols[i - 1].end.getTime()),
      cols.at(-1)!.end.getTime() === range.end.getTime(),
      cols.every((c) => c.end.getTime() > c.start.getTime()),
    ],
    [true, true, true, true],
    `${name} (${cols.length} columns)`,
  );
};
const fitOf = (tasks: GanttTaskNode[]) => ganttFitRange(tasks)!;
tilesRange(fitOf([{ id: "s", start: at(2026, 7, 6, 9), end: at(2026, 7, 6, 17) }]), "hour", "hour columns tile a same-day plan");
tilesRange(fitOf([{ id: "s", start: at(2026, 7, 6), end: at(2026, 8, 3) }]), "day", "day columns tile a four-week plan");
tilesRange(fitOf([{ id: "s", start: at(2026, 7, 6), end: at(2026, 12, 20) }]), "week", "week columns tile a half-year plan");
tilesRange(fit, "week", "week columns tile the fit range above");
tilesRange(LONG_FIT, "month", "month columns tile a plan that outlasts a year");
/* Half-open both ends: a range that starts and ends at the same instant has
   nothing in it, and a renderer looping on "while cursor < end" must agree. */
t(ganttRangeColumns({ start: at(2026, 7, 6), end: at(2026, 7, 6) }, "day").length, 0, "an empty range draws no columns");
t(ganttRangeColumns({ start: at(2026, 7, 9), end: at(2026, 7, 6) }, "day").length, 0, "…and neither does an inverted one");
// Unsnapped, deliberately: a caller can pass any range, and a partial first
// column is better than a column that starts before the range does.
const unsnapped = ganttRangeColumns({ start: at(2026, 7, 6, 13, 30), end: at(2026, 7, 9) }, "day");
t(
  [iso(unsnapped[0].start), iso(unsnapped[0].end), iso(unsnapped.at(-1)!.end)],
  ["2026-07-06 13:30", "2026-07-07 00:00", "2026-07-09 00:00"],
  "an unsnapped range still tiles exactly, with a partial first column",
);
/* The widths function is shared with the anchored views, so unequal fit columns
   get exactly the treatment 28-vs-31-day months do — which is the whole reason
   a fit axis can be trusted to put a bar on its gridline. LONG_FIT runs May 2026
   to Dec 2027: index 7 is January 2027 (31 days), index 8 February (28). */
const longCols = ganttRangeColumns(LONG_FIT, "month", { now: at(2026, 7, 6) });
const fitWidths = ganttColumnWidths(longCols, LONG_FIT, 960);
t(Number(fitWidths.reduce((a, b) => a + b, 0).toFixed(6)), 960, "fit column widths sum to the axis exactly");
t([longCols[7].label, longCols[8].label], ["Jan", "Feb"], "…over the months this next line names");
t(fitWidths[7] > fitWidths[8], true, "a 31-day January is drawn WIDER than a 28-day February");
// The year is said once at each January and once at the start, and nowhere else
// — twelve columns each carrying "2027" is noise, and none at all is a lie.
t(longCols.filter((c) => c.sublabel !== "").map((c) => `${c.label} ${c.sublabel}`), ["Jun 2026", "Jan 2027"], "the year appears at the start and at each January");

console.log("\nthe label for a range nobody anchored");
t(ganttSpanLabel({ start: at(2026, 7, 6), end: at(2026, 7, 25) }), "6 – 24 Jul 2026", "days, inside one month — and the END is exclusive");
t(ganttSpanLabel({ start: at(2026, 6, 28), end: at(2026, 7, 6) }), "28 Jun – 5 Jul 2026", "days across a month");
t(ganttSpanLabel({ start: at(2026, 12, 28), end: at(2027, 1, 6) }), "28 Dec 2026 – 5 Jan 2027", "days across a year, so the year is said twice");
t(ganttSpanLabel(fit), "Jun – Nov 2026", "months, once the span is past about two of them");
t(ganttSpanLabel({ start: at(2026, 11, 1), end: at(2027, 3, 1) }), "Nov 2026 – Feb 2027", "months across a year");
t(ganttSpanLabel({ start: at(2026, 7, 6), end: at(2026, 7, 6) }), "", "an empty range has nothing to say");

console.log("\nthe frozen pane sheds columns rather than scrolling");
const PANE = { name: 180, assignees: 96, status: 88, variance: 72 } as const;
const pane = (available: number, requested = GANTT_PANE_COLUMNS) =>
  ganttPaneColumns([...requested], { ...PANE }, available, 280);
t(pane(1292), ["name", "assignees", "status", "variance"], "a normal page keeps all four");
t(pane(0), ["name", "assignees", "status", "variance"], "UNMEASURED is not zero-width — it keeps everything");
t(pane(-1), ["name", "assignees", "status", "variance"], "…and neither is a negative reading");
t(pane(700), ["name", "assignees", "status"], "436 + 280 does not fit in 700, so Variance goes first");
t(pane(600), ["name", "assignees"], "…then Status");
t(pane(500), ["name"], "…then Assignees");
/* The rule that stops shedding being a tax with no benefit. At 100px nothing
   fits however much is dropped, so dropping three columns would cost the
   reader Assignees, Status and Variance AND still leave them dragging the
   chart sideways. Measured on the demo page before this: a month axis wanting
   1364px in a 1008px container shed everything and still scrolled 536px. */
t(pane(100), ["name", "assignees", "status", "variance"], "when NOTHING can fit, nothing is shed — the chart scrolls intact");
t(pane(459), ["name", "assignees", "status", "variance"], "…one pixel short of the name column fitting, still intact");
t(pane(460), ["name"], "…and one pixel over, shedding pays off and happens");
/* The case this whole feature was reported for: a year axis is 12 columns at
   80px, and at the app's 1292px the pane used to keep all four and scroll. */
t(ganttPaneColumns([...GANTT_PANE_COLUMNS], { ...PANE }, 1292, 960), ["name", "assignees"], "a year axis at 1292px now fits, with two pane columns");
t(pane(1292, ["name", "variance", "status"]), ["name", "variance", "status"], "a caller's order is kept");
t(pane(560, ["name", "variance", "status"]), ["name", "variance"], "…and it is a PREFERENCE order: what is listed last goes first");
t(pane(100, ["name"]), ["name"], "one column is already the floor");

console.log("\nthe row window — which rows are worth putting in the DOM");
const win = (rowCount: number, scrollTop: number, viewport: number, overscan = 6) =>
  ganttRowWindow(rowCount, 36, scrollTop, viewport, overscan);
/* The invariant that keeps the scrollbar honest: the spacers plus the mounted
   rows always add up to the full list, however the window moves. Get this wrong
   and the thumb grows or jumps as you scroll, which reads as a broken page. */
const totalHeight = (rowCount: number, scrollTop: number, viewport: number) => {
  const w = win(rowCount, scrollTop, viewport);
  return w.paddingTop + (w.endIndex - w.startIndex) * 36 + w.paddingBottom;
};
t(totalHeight(10_000, 0, 500), 360_000, "top: spacers + mounted = the whole list");
t(totalHeight(10_000, 180_000, 500), 360_000, "…and in the middle");
t(totalHeight(10_000, 359_500, 500), 360_000, "…and at the very bottom");
t(totalHeight(7, 0, 500), 252, "…and when everything fits");

t([win(10_000, 0, 500).startIndex, win(10_000, 0, 500).endIndex], [0, 20], "at the top: no rows above, a screenful plus overscan below");
t(win(10_000, 0, 500).paddingTop, 0, "…and no leading spacer");
const mid = win(10_000, 3600, 500);
t([mid.startIndex, mid.endIndex], [94, 120], "scrolled to row 100: a 26-row window, not 10,000");
t([mid.paddingTop, mid.paddingBottom], [94 * 36, (10_000 - 120) * 36], "…with the rest standing in as spacers");
// The window must never run past the ends, in either direction.
t(win(10_000, 359_640, 500).endIndex, 10_000, "the last screenful stops at the last row");
t(win(10_000, 359_640, 500).paddingBottom, 0, "…and has no trailing spacer");
t(win(10_000, 999_999, 500).endIndex <= 10_000, true, "a scrollTop past the end cannot overrun");
t(win(10_000, 999_999, 500).startIndex <= win(10_000, 999_999, 500).endIndex, true, "…and start never passes end");
// macOS rubber-band scrolls NEGATIVE. Unclamped this yields a negative
// paddingTop and the rows jump up under the header for the bounce.
t([win(10_000, -200, 500).startIndex, win(10_000, -200, 500).paddingTop], [0, 0], "a negative scrollTop from overscroll clamps to the top");
t(win(10_000, 0, -50).startIndex, 0, "a negative viewport height does not invert the window");
// Small lists must come out identical to not windowing at all, because that is
// the path every demo and every screenshot in the repo exercises.
t([win(12, 0, 500).startIndex, win(12, 0, 500).endIndex], [0, 12], "a 12-row plan mounts all 12 — the window is a no-op below a screenful");
t([win(12, 0, 500).paddingTop, win(12, 0, 500).paddingBottom], [0, 0], "…with no spacers at all");
t([win(0, 0, 500).startIndex, win(0, 0, 500).endIndex], [0, 0], "no rows, no window");
t(ganttRowWindow(10, 0, 0, 500).endIndex, 0, "a zero row height measures nothing rather than dividing by it");
t(win(10_000, 3600, 500, 0).startIndex, 100, "overscan 0 starts exactly at the first visible row");
t(win(10_000, 3600, 500, 0).endIndex, 114, "…and ends at the last");
// Mounted count must stay bounded by the viewport, not by the list.
const mounted = (n: number) => { const w = win(n, 180_000 % (n * 36), 500); return w.endIndex - w.startIndex; };
t(mounted(10_000) <= 30 && mounted(100_000) <= 30, true, "the mounted count does not grow with the list");

console.log("\nworking calendars — when work can actually happen");
const hm = (h: number, m = 0) => h * 60 + m;
/** Mon-Fri 06:00-17:00 with an hour off at noon; weekends shut. */
const SHIFT = [{ from: hm(6), to: hm(12) }, { from: hm(13), to: hm(17) }];
const PLANT: GanttCalendar = { week: [[], SHIFT, SHIFT, SHIFT, SHIFT, SHIFT, []] };
/** 2026-07-24 is a Friday, 2026-07-27 the Monday after. */
t(ganttWorkingPeriodsOn(PLANT, at(2026, 7, 24)).length, 2, "a Friday has two periods");
t(ganttWorkingPeriodsOn(PLANT, at(2026, 7, 25)).length, 0, "a Saturday has none");
const withHoliday: GanttCalendar = {
  ...PLANT,
  exceptions: [
    { date: at(2026, 7, 22), periods: [] },
    { date: at(2026, 7, 25), periods: [{ from: hm(8), to: hm(12) }] },
  ],
};
t(ganttWorkingPeriodsOn(withHoliday, at(2026, 7, 22)).length, 0, "a holiday exception closes a working day");
t(ganttWorkingPeriodsOn(withHoliday, at(2026, 7, 25)), [{ from: 480, to: 720 }], "an overtime exception opens a closed one");
t(ganttWorkingPeriodsOn(withHoliday, at(2026, 7, 23)).length, 2, "…and neither leaks onto the next day");
t(
  ganttWorkingPeriodsOn({ week: [[{ from: hm(6), to: hm(14) }, { from: hm(8), to: hm(16) }], [], [], [], [], [], []] }, at(2026, 7, 26)),
  [{ from: 360, to: 960 }],
  "overlapping periods merge rather than double-count",
);
t(
  ganttWorkingPeriodsOn({ week: [[{ from: hm(17), to: hm(9) }], [], [], [], [], [], []] }, at(2026, 7, 26)),
  [],
  "an inverted period is dropped, not reversed",
);
t(ganttIsWorking(PLANT, at(2026, 7, 24, 10)), true, "Friday 10:00 is working time");
t(ganttIsWorking(PLANT, at(2026, 7, 24, 12, 30)), false, "…the lunch break is not");
t(ganttIsWorking(PLANT, at(2026, 7, 25, 10)), false, "…and neither is Saturday");
t(ganttIsWorking(PLANT, at(2026, 7, 24, 17)), false, "17:00 exactly is outside a shift ending at 17:00");
t(ganttIsWorking(PLANT, at(2026, 7, 24, 6)), true, "…while 06:00 exactly is inside one starting at 06:00");

console.log("\nworking time between two instants");
const hours = (n: number) => n * 3_600_000;
t(ganttWorkingMs(PLANT, at(2026, 7, 24, 6), at(2026, 7, 24, 17)), hours(10), "a full day is 10 hours, not 11 — lunch is not work");
t(ganttWorkingMs(PLANT, at(2026, 7, 24, 16), at(2026, 7, 24, 22)), hours(1), "an evening stops at the shift end");
t(ganttWorkingMs(PLANT, at(2026, 7, 24, 16), at(2026, 7, 27, 8)), hours(3), "…and resumes on Monday, skipping the weekend entirely");
t(ganttWorkingMs(PLANT, at(2026, 7, 25), at(2026, 7, 27)), 0, "a whole weekend is no work at all");
t(ganttWorkingMs(PLANT, at(2026, 7, 24, 10), at(2026, 7, 24, 10)), 0, "a zero-length range is zero");
t(ganttWorkingMs(PLANT, at(2026, 7, 24, 17), at(2026, 7, 24, 10)), 0, "an inverted range is zero, not negative");
t(ganttWorkingMs(GANTT_CALENDAR_24_7, at(2026, 7, 24), at(2026, 7, 27)), 3 * 24 * 3_600_000, "24/7 counts every millisecond");

console.log("\nadding a working duration — the Friday-16:00 question");
t(
  iso(ganttAddWorkingMs(PLANT, at(2026, 7, 24, 16), hours(6))),
  "2026-07-27 11:00",
  "6 hours from Friday 16:00 finishes MONDAY, not Friday 22:00",
);
/* 6 hours exactly fills the morning period, so it ends AT 12:00 by the same
   rule as a shift end. 7 hours is the one that genuinely crosses lunch. */
t(iso(ganttAddWorkingMs(PLANT, at(2026, 7, 24, 6), hours(6))), "2026-07-24 12:00", "a duration that exactly fills the morning ends at the break");
t(iso(ganttAddWorkingMs(PLANT, at(2026, 7, 24, 6), hours(7))), "2026-07-24 14:00", "…and one that crosses lunch jumps the hour");
t(iso(ganttAddWorkingMs(PLANT, at(2026, 7, 24, 13), hours(4))), "2026-07-24 17:00", "work that exactly fills a shift ends AT the shift end");
t(iso(ganttAddWorkingMs(PLANT, at(2026, 7, 24, 20), hours(1))), "2026-07-27 07:00", "starting after hours begins at the next shift");
t(iso(ganttAddWorkingMs(PLANT, at(2026, 7, 25, 9), hours(2))), "2026-07-27 08:00", "…and starting on a closed day too");
t(iso(ganttAddWorkingMs(PLANT, at(2026, 7, 24, 10), 0)), "2026-07-24 10:00", "a zero duration does not move");
t(iso(ganttAddWorkingMs(PLANT, at(2026, 7, 25, 9), 0)), "2026-07-25 09:00", "…not even out of non-working time; a milestone is where someone put it");
t(iso(ganttAddWorkingMs(PLANT, at(2026, 7, 24, 10), -hours(3))), "2026-07-24 10:00", "a negative duration does not move either");
t(
  iso(ganttAddWorkingMs(withHoliday, at(2026, 7, 21, 13), hours(14))),
  "2026-07-23 17:00",
  "a holiday in the middle of a job pushes its finish a working day",
);
t(iso(ganttAddWorkingMs(GANTT_CALENDAR_24_7, at(2026, 7, 24, 16), hours(6))), "2026-07-24 22:00", "24/7 is plain elapsed time");
const NEVER: GanttCalendar = { week: [[], [], [], [], [], [], []] };
t(ganttAddWorkingMs(NEVER, at(2026, 7, 24), hours(1)).getTime() > at(2026, 7, 24).getTime(), true, "a calendar with no working time bails out rather than hanging");

console.log("\nsplitting a span into the stretches where work happens");
const segs = (c: GanttCalendar, a: Date, b: Date, o = {}) =>
  ganttWorkingSegments(c, a, b, o).map((sp) => [iso(sp.start), iso(sp.end)]);
t(
  segs(PLANT, at(2026, 7, 24, 16), at(2026, 7, 27, 8)),
  [["2026-07-24 16:00", "2026-07-24 17:00"], ["2026-07-27 06:00", "2026-07-27 08:00"]],
  "Friday evening + Monday morning is two segments, and the weekend is not one",
);
t(
  segs(PLANT, at(2026, 7, 24, 11), at(2026, 7, 24, 14)),
  [["2026-07-24 11:00", "2026-07-24 12:00"], ["2026-07-24 13:00", "2026-07-24 14:00"]],
  "a lunch break splits a bar mid-day",
);
t(
  segs(PLANT, at(2026, 7, 24, 11), at(2026, 7, 24, 14), { minGapMs: hours(2) }),
  [["2026-07-24 11:00", "2026-07-24 14:00"]],
  "…unless minGapMs says that gap is too small to draw",
);
t(segs(PLANT, at(2026, 7, 25), at(2026, 7, 26)), [], "a span entirely inside a shutdown has NO segments");
t(
  segs(GANTT_CALENDAR_24_7, at(2026, 7, 20), at(2026, 7, 27)),
  [["2026-07-20 00:00", "2026-07-27 00:00"]],
  "24/7 is ONE segment, not one per day — which is what makes it identical to no calendar",
);
t(
  ganttWorkingSegments(PLANT, at(2026, 1, 1), at(2026, 12, 31), { maxSegments: 10 }).length,
  1,
  "past maxSegments the span comes back whole rather than as hundreds of slivers",
);

console.log("\nthe span/segment contract — what keeps arrows on their bars");
const flatSeg = (task: GanttTaskNode, calendar?: GanttCalendar) =>
  flattenGanttTasks([task], () => true, NOW, calendar ? { calendar } : {}).rows[0];
const weekendJob = flatSeg({ id: "w", start: at(2026, 7, 25, 9), end: at(2026, 7, 27, 10) }, PLANT);
t(iso(weekendJob.span!.start), "2026-07-27 06:00", "a span starting on a closed Saturday is CLAMPED to the first working instant");
t(iso(weekendJob.span!.end), "2026-07-27 10:00", "…and its end to the last");
t(weekendJob.segments, null, "…and it is one piece, so it draws unsplit");
const split = flatSeg({ id: "s", start: at(2026, 7, 24, 16), end: at(2026, 7, 27, 8) }, PLANT);
t(split.segments?.length, 2, "a job across a weekend has two segments");
t(
  [iso(split.span!.start), iso(split.span!.end)],
  [iso(split.segments![0].start), iso(split.segments![1].end)],
  "the envelope is exactly the outer edges of the segments — they cannot disagree",
);
const shutJob = flatSeg({ id: "x", start: at(2026, 7, 25, 9), end: at(2026, 7, 25, 15) }, PLANT);
t([iso(shutJob.span!.start), iso(shutJob.span!.end)], ["2026-07-25 09:00", "2026-07-25 15:00"], "a job entirely inside a shutdown keeps its RAW span");
t(shutJob.segments, null, "…and draws whole, against shaded background");
const noCal = flatSeg({ id: "n", start: at(2026, 7, 24, 16), end: at(2026, 7, 27, 8) });
t([iso(noCal.span!.start), iso(noCal.span!.end)], ["2026-07-24 16:00", "2026-07-27 08:00"], "NO calendar leaves the span exactly as given");
t(noCal.segments, null, "…and produces no segments at all");
const cal247 = flatSeg({ id: "c", start: at(2026, 7, 24, 16), end: at(2026, 7, 27, 8) }, GANTT_CALENDAR_24_7);
t(
  [iso(cal247.span!.start), iso(cal247.span!.end), cal247.segments],
  [iso(noCal.span!.start), iso(noCal.span!.end), null],
  "a 24/7 calendar is byte-for-byte the same as no calendar — the backward-compat guarantee",
);

console.log("\ndurations from a working duration, and the columns that shade them");
t(
  iso(ganttSpan({ id: "d", start: at(2026, 7, 24, 16), workingMinutes: 360 }, PLANT)!.end),
  "2026-07-27 11:00",
  "workingMinutes derives the end through the calendar",
);
t(
  iso(ganttSpan({ id: "d", start: at(2026, 7, 24, 16), workingMinutes: 360 })!.end),
  "2026-07-24 22:00",
  "…and is plain elapsed time without one",
);
t(
  iso(ganttSpan({ id: "d", start: at(2026, 7, 24, 16), end: at(2026, 7, 24, 18), workingMinutes: 360 }, PLANT)!.end),
  "2026-07-24 18:00",
  "an explicit end beats a duration — a statement beats a derivation",
);
const dayCols2 = ganttColumns("day", at(2026, 7, 24), { now: NOW, calendar: PLANT });
t(dayCols2.filter((c) => !c.nonWorking).length, 10, "the day view lights exactly the 10 working hours");
t([dayCols2[12].nonWorking, dayCols2[13].nonWorking], [true, false], "…with the lunch hour dark and 13:00 lit again");
const weekCols3 = ganttColumns("week", at(2026, 7, 24), { now: NOW, calendar: PLANT });
t(weekCols3.filter((c) => c.nonWorking).map((c) => c.label), ["Sat 25", "Sun 26"], "the week view darkens the weekend from the CALENDAR");
t(
  ganttColumns("day", at(2026, 7, 24), { now: NOW }).filter((c) => !c.nonWorking).length,
  9,
  "without a calendar the old 9-to-18 default still decides — unchanged",
);
t(
  ganttColumns("week", at(2026, 7, 20), { now: NOW, calendar: withHoliday }).filter((c) => c.nonWorking).map((c) => c.label),
  ["Wed 22", "Sun 26"],
  "a dated holiday darkens its own column, and an overtime Saturday lights one",
);

console.log("\ndaylight saving — a working day is 23 or 25 hours long");
/* Everything here is local `Date`, so this only tests anything in a zone that
   HAS a transition. `check:gantt` runs the file twice, once under the ambient
   zone and once under Europe/London, so it is never vacuous in CI. */
{
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const nextDay = (d: Date, n = 1) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const dayHours = (d: Date) => (nextDay(d).getTime() - d.getTime()) / 3_600_000;
  /* Found by measuring day LENGTH, not by scanning UTC offsets. The offset at
     midnight changes a day late in London (the clocks move at 01:00) and on the
     day itself in Santiago (they move at midnight, so local 00:00 does not
     exist). Measuring the thing under test is the only zone-agnostic way in. */
  let short: Date | null = null;
  let long: Date | null = null;
  for (let d = 0; d < 365 && (!short || !long); d++) {
    const day = new Date(2026, 0, 1 + d);
    const h = dayHours(day);
    if (h < 24 && !short) short = day;
    if (h > 24 && !long) long = day;
  }

  if (!short && !long) {
    console.log(`  skip 5 assertions — ${zone} has no daylight saving; check:gantt reruns under Europe/London`);
  } else {
    const ALL_DAY: GanttCalendar = { week: Array.from({ length: 7 }, () => [{ from: 0, to: 1440 }]) };
    if (short) {
      t(dayHours(short) < 24, true, `${zone}: found a short day, ${dayHours(short)}h`);
      t(
        ganttWorkingMs(ALL_DAY, short, nextDay(short)) / 3_600_000,
        dayHours(short),
        "a 24-hour calendar reports the day's REAL length, not 24",
      );
      // Not implied by the above: this walks the period loop across the
      // boundary and must accumulate real elapsed time, so it lands past the
      // next midnight by exactly the hour that went missing.
      t(
        ganttAddWorkingMs(ALL_DAY, short, 24 * 3_600_000).getTime(),
        short.getTime() + 24 * 3_600_000,
        "24 working hours from a short day's start is 24 REAL hours later",
      );
      t(ganttWorkingSegments(ALL_DAY, short, nextDay(short, 2)).length, 1, "…and a continuous calendar is still ONE segment across it");
      /* The assertion that separates wall-clock periods from millisecond
         arithmetic: a shift stated as 00:00-04:00 keeps its wall-clock bounds
         and changes its real length. Guarded, because not every zone moves its
         clocks inside that window. */
      const windowHours = (new Date(short.getFullYear(), short.getMonth(), short.getDate(), 4).getTime() - short.getTime()) / 3_600_000;
      if (windowHours !== 4) {
        const SHIFTED: GanttCalendar = { week: Array.from({ length: 7 }, () => [{ from: 0, to: 240 }]) };
        t(
          ganttWorkingMs(SHIFTED, short, nextDay(short)) / 3_600_000,
          windowHours,
          `a 00:00-04:00 shift is ${windowHours}h that day — wall-clock bounds, real length`,
        );
      } else {
        console.log(`  skip 1 assertion — ${zone} moves its clocks outside 00:00-04:00`);
      }
    }
    if (long) {
      t(dayHours(long) > 24, true, `${zone}: found a long day, ${dayHours(long)}h`);
      t(
        ganttWorkingMs(ALL_DAY, long, nextDay(long)) / 3_600_000,
        dayHours(long),
        "…and the long one reports its real length too",
      );
    }
  }
}

console.log(f === 0 ? "\nall passed\n" : `\n${f} FAILED\n`);
process.exit(f === 0 ? 0 : 1);
