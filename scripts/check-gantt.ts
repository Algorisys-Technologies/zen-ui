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
  ganttConnectors,
  ganttProgress,
  ganttSpan,
  ganttTaskStatus,
  ganttVarianceDays,
  type GanttBarAnchor,
  type GanttTaskNode,
} from "../packages/core/src/gantt";

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

console.log(f === 0 ? "\nall passed\n" : `\n${f} FAILED\n`);
process.exit(f === 0 ? 0 : 1);
