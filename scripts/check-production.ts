/**
 * Contract for the production-scheduling maths — tier (b).
 *
 * Everything here fails silently and plausibly. An operation packed into the
 * wrong lane is a schedule; a load bucket that forgot setup is a percentage; a
 * resource marked overloaded because two jobs overlap on a two-operator cell is
 * a red row nobody can argue with. None of it throws, and none of it looks
 * wrong on screen.
 *
 * The one that matters most is the DENOMINATOR. Load is booked ÷ available and
 * both are working-time quantities, so a wall-clock slip anywhere in the chain
 * reports a plant as comfortable on exactly the days it is not — the ones next
 * to a shutdown. Several assertions below exist only to pin that.
 *
 * Dates use the local-time constructor, for the reason check-planning.ts gives.
 */
import {
  flattenProductionResources,
  packProductionLanes,
  productionConflicts,
  productionLoad,
  productionPeakLoad,
  productionPlacement,
  type ProductionOperationNode,
  type ProductionPlacement,
  type ProductionResourceNode,
} from "../packages/core/src/production";
import { ganttColumns, type GanttCalendar } from "../packages/core/src/gantt";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(60)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};

const at = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min, 0, 0);
const iso = (d: Date | undefined) =>
  d === undefined
    ? undefined
    : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
const span = (s: { start: Date; end: Date } | null | undefined) => (s ? [iso(s.start), iso(s.end)] : null);
const hours = (ms: number) => Number((ms / 3_600_000).toFixed(3));

/* A single-shift plant: 06:00-17:00 Mon-Fri with an hour off at noon, shut at
   weekends. 2026-07-06 is a Monday, 2026-07-10 a Friday. */
const SHIFT = [
  { from: 6 * 60, to: 12 * 60 },
  { from: 13 * 60, to: 17 * 60 },
];
const PLANT: GanttCalendar = { week: [[], SHIFT, SHIFT, SHIFT, SHIFT, SHIFT, []] };

console.log("\nan operation on the clock — setup first, then the run");
t(
  span(productionPlacement({ id: "a", resourceId: "m1", start: at(2026, 7, 6, 8), runMinutes: 120 })?.run),
  ["2026-07-06 08:00", "2026-07-06 10:00"],
  "no setup, no calendar: two hours is two hours",
);
t(
  productionPlacement({ id: "a", resourceId: "m1", start: at(2026, 7, 6, 8), runMinutes: 120 })?.setup,
  null,
  "…and no setup span is null, not a zero-width one",
);
const withSetup = productionPlacement(
  { id: "a", resourceId: "m1", start: at(2026, 7, 6, 8), setupMinutes: 60, runMinutes: 120 },
  PLANT,
)!;
t(span(withSetup.setup), ["2026-07-06 08:00", "2026-07-06 09:00"], "setup claims the machine first");
t(span(withSetup.run), ["2026-07-06 09:00", "2026-07-06 11:00"], "…and the run starts where it ends");
t(span(withSetup.span), ["2026-07-06 08:00", "2026-07-06 11:00"], "the booking is both together");

/* THE ASSERTION THE WHOLE TIER RESTS ON. A 45-minute changeover starting at
   16:30 does not finish at 17:15 — the shift ends at 17:00 — and the run has
   not begun. Wall-clock arithmetic reports this job finished before anybody
   arrives the next morning. */
const lateSetup = productionPlacement(
  { id: "a", resourceId: "m1", start: at(2026, 7, 6, 16, 30), setupMinutes: 45, runMinutes: 60 },
  PLANT,
)!;
t(span(lateSetup.setup), ["2026-07-06 16:30", "2026-07-07 06:15"], "a changeover crossing the shift end lands next morning");
t(span(lateSetup.run), ["2026-07-07 06:15", "2026-07-07 07:15"], "…and the run follows it there, not before it");
// Same job with no calendar: the answer everything above exists to replace.
const naive = productionPlacement({
  id: "a",
  resourceId: "m1",
  start: at(2026, 7, 6, 16, 30),
  setupMinutes: 45,
  runMinutes: 60,
})!;
t(span(naive.run), ["2026-07-06 17:15", "2026-07-06 18:15"], "…which wall-clock puts inside a shift that has ended");

t(
  span(productionPlacement({ id: "a", resourceId: "m1", start: at(2026, 7, 6, 8), end: at(2026, 7, 6, 15) })?.run),
  ["2026-07-06 08:00", "2026-07-06 15:00"],
  "an explicit end is a statement and beats runMinutes",
);
// Setup must not eat into stated work: the end is measured from the run's start.
t(
  span(
    productionPlacement(
      { id: "a", resourceId: "m1", start: at(2026, 7, 6, 8), setupMinutes: 60, end: at(2026, 7, 6, 15) },
      PLANT,
    )?.run,
  ),
  ["2026-07-06 09:00", "2026-07-06 15:00"],
  "…and setup pushes the run's start without shortening the run's end",
);
t(productionPlacement({ id: "a", resourceId: "m1", start: at(2026, 7, 6, 8) }), null, "no duration and no end is nothing to draw");
t(productionPlacement({ id: "a", resourceId: "m1", start: at(2026, 7, 6, 8), runMinutes: 0 }), null, "…and neither is a zero-length booking");
/* Two DIFFERENT answers for a job booked on a Sunday, and the difference is the
   difference between a duration and a statement.

   A `runMinutes` job is RELOCATED: two hours of work asked for on a shut Sunday
   is two hours of work on Monday morning, which is what `ganttAddWorkingMs`
   means and what makes a plan honest. */
const sundayDuration = productionPlacement(
  { id: "a", resourceId: "m1", start: at(2026, 7, 12, 8), runMinutes: 120 },
  PLANT,
)!;
t(span(sundayDuration.span), ["2026-07-13 06:00", "2026-07-13 08:00"], "two hours asked for on a shut Sunday run on MONDAY");
t(sundayDuration.segments, null, "…as one continuous stretch, so it draws as one bar");

/* An explicit `end` is a statement and is NOT relocated — somebody typed those
   dates. The span keeps its raw bounds and draws whole against shaded ground,
   because a bar that vanished would read as data that failed to load, where a
   bar sitting on a closed plant reads as the data error it is. */
const sundayStated = productionPlacement(
  { id: "a", resourceId: "m1", start: at(2026, 7, 12, 8), end: at(2026, 7, 12, 10) },
  PLANT,
)!;
t(span(sundayStated.span), ["2026-07-12 08:00", "2026-07-12 10:00"], "a STATED Sunday booking stays on Sunday");
t(sundayStated.segments, null, "…drawn whole, because there is no working stretch to break it into");

console.log("\npeak load — how much of a resource is claimed at once");
const place = (id: string, from: Date, to: Date, load?: number): ProductionPlacement =>
  productionPlacement({ id, resourceId: "m1", start: from, end: to, load })!;
t(productionPeakLoad([]), 0, "nothing booked is no load");
t(productionPeakLoad([place("a", at(2026, 7, 6, 8), at(2026, 7, 6, 10))]), 1, "one job is one");
t(
  productionPeakLoad([
    place("a", at(2026, 7, 6, 8), at(2026, 7, 6, 10)),
    place("b", at(2026, 7, 6, 10), at(2026, 7, 6, 12)),
  ]),
  1,
  "a handover at 10:00 is NOT a double-booking",
);
t(
  productionPeakLoad([
    place("a", at(2026, 7, 6, 8), at(2026, 7, 6, 11)),
    place("b", at(2026, 7, 6, 10), at(2026, 7, 6, 12)),
  ]),
  2,
  "an hour of genuine overlap is two",
);
/* The reason this is a sweep and not a pairwise test: three jobs that overlap
   only two-at-a-time never claim more than 2, and a pairwise check would flag
   a two-operator cell that is coping perfectly well. */
t(
  productionPeakLoad([
    place("a", at(2026, 7, 6, 8), at(2026, 7, 6, 10)),
    place("b", at(2026, 7, 6, 9), at(2026, 7, 6, 11)),
    place("c", at(2026, 7, 6, 10, 30), at(2026, 7, 6, 12)),
  ]),
  2,
  "three jobs overlapping only two-at-a-time peak at two, not three",
);
t(
  productionPeakLoad([place("a", at(2026, 7, 6, 8), at(2026, 7, 6, 12), 2)]),
  2,
  "a job that needs both operators counts as two on its own",
);

console.log("\nlane packing — a double-booking has to be visible");
const lanesOf = (ops: Array<[string, number, number]>, maxLanes = 3) => {
  const placements = ops.map(([id, from, to]) =>
    place(id, at(2026, 7, 6, from), at(2026, 7, 6, to)),
  );
  const packed = packProductionLanes(placements, maxLanes);
  return { lanes: packed.lanes.map((lane) => lane.map((p) => p.operation.id)), overflow: packed.overflow };
};
t(lanesOf([["a", 8, 10], ["b", 10, 12], ["c", 12, 14]]), { lanes: [["a", "b", "c"]], overflow: 0 }, "a busy day with no overlap is ONE lane");
t(lanesOf([["a", 8, 11], ["b", 10, 12]]), { lanes: [["a"], ["b"]], overflow: 0 }, "an overlap opens a second");
// First-fit, so a third job that clears the first lane goes back into it rather
// than opening a third — otherwise every row grows to its worst moment.
t(
  lanesOf([["a", 8, 11], ["b", 10, 12], ["c", 11, 13]]),
  { lanes: [["a", "c"], ["b"]], overflow: 0 },
  "…and the next job reuses the first lane once it is free",
);
t(lanesOf([["b", 10, 12], ["a", 8, 11]]), { lanes: [["a"], ["b"]], overflow: 0 }, "input order does not matter — they are sorted by start");
t(
  lanesOf([["a", 8, 14], ["b", 9, 14], ["c", 10, 14], ["d", 11, 14]], 3),
  { lanes: [["a"], ["b"], ["c"]], overflow: 1 },
  "past maxLanes the overflow is COUNTED, never silently dropped",
);

console.log("\nresource rows, and what a collapsed parent carries");
interface Res extends ProductionResourceNode {
  name: string;
  children?: Res[];
}
const CELL: Res[] = [
  {
    id: "line",
    name: "Assembly line",
    children: [
      { id: "m1", name: "CNC-3" },
      { id: "m2", name: "Press-1", capacity: 2 },
    ],
  },
];
const OPS: ProductionOperationNode[] = [
  { id: "o1", resourceId: "m1", start: at(2026, 7, 6, 8), runMinutes: 120 },
  { id: "o2", resourceId: "m1", start: at(2026, 7, 6, 13), runMinutes: 120 },
  { id: "o3", resourceId: "m2", start: at(2026, 7, 6, 8), runMinutes: 180 },
  { id: "o4", resourceId: "m2", start: at(2026, 7, 6, 9), runMinutes: 180 },
];
const open = flattenProductionResources(CELL, OPS, () => true);
t(open.rows.map((r) => r.resource.id), ["line", "m1", "m2"], "the tree flattens in order");
t(open.rows.map((r) => r.depth), [0, 1, 1], "…with depths");
t(open.rows[0].lanes.flat().length, 0, "an OPEN parent DRAWS nothing of its own — its children draw it once");
/* …but it is still responsible for the work. Answering both questions with
   `lanes` reports a busy cell as 0% loaded, which reads as an idle machine
   rather than as a row that delegates. */
t(open.rows[0].subtree.map((p) => p.operation.id).sort(), ["o1", "o2", "o3", "o4"], "…while its SUBTREE still carries everything beneath it");
/* Expansion is a view state and must not change what the schedule says is
   wrong, so overload is computed over the subtree either way. */
t(
  [
    flattenProductionResources([{ id: "p", name: "Line", capacity: 1, children: [{ id: "c", name: "M" }] } as Res], [
      { id: "x", resourceId: "c", start: at(2026, 7, 6, 8), runMinutes: 180 },
      { id: "y", resourceId: "c", start: at(2026, 7, 6, 9), runMinutes: 180 },
    ], () => true).rows[0].overloaded,
    flattenProductionResources([{ id: "p", name: "Line", capacity: 1, children: [{ id: "c", name: "M" }] } as Res], [
      { id: "x", resourceId: "c", start: at(2026, 7, 6, 8), runMinutes: 180 },
      { id: "y", resourceId: "c", start: at(2026, 7, 6, 9), runMinutes: 180 },
    ], () => false).rows[0].overloaded,
  ],
  [true, true],
  "…and collapsing a line does not change whether it is over capacity",
);
t(open.rows[1].lanes.map((l) => l.map((p) => p.operation.id)), [["o1", "o2"]], "a machine with no overlap is one lane");
t(open.rows[2].lanes.map((l) => l.map((p) => p.operation.id)), [["o3"], ["o4"]], "…and an overlapping pair is two");

const shut = flattenProductionResources(CELL, OPS, () => false);
t(shut.rows.map((r) => r.resource.id), ["line"], "collapsed, only the parent has a row");
t(
  shut.rows[0].lanes.flat().map((p) => p.operation.id).sort(),
  ["o1", "o2", "o3", "o4"],
  "…and it carries every operation booked anywhere beneath it",
);
t(shut.rows[0].subtree.length, 4, "…and a collapsed one's subtree is the same four, however it is drawn");
t(shut.rowIndexById.get("m2"), 0, "a hidden resource maps to the row it folded into");
t(open.operationIndex.get("o4"), { rowIndex: 2, lane: 1 }, "every operation knows its row and its lane");

console.log("\ncapacity, and why overload is not the same as overlap");
t(open.rows[1].capacity, 1, "a machine with no stated capacity is 1");
t(open.rows[2].capacity, 2, "…and a stated one is believed");
t(open.rows[0].capacity, 3, "a parent with none stated sums its children, which beats defaulting to 1");
t(open.rows[2].overloaded, false, "TWO overlapping jobs on a TWO-operator cell is not an overload");
t(
  flattenProductionResources([{ id: "m2", name: "Press-1" } as Res], [OPS[2], OPS[3]], () => true).rows[0].overloaded,
  true,
  "…the same pair on a one-operator machine is",
);
t(open.rows[1].overloaded, false, "and a machine running back-to-back jobs is never overloaded");

console.log("\nload per column — booked over available, both in WORKING time");
const DAY_COLS = ganttColumns("week", at(2026, 7, 6), { now: at(2026, 7, 6), calendar: PLANT });
t(DAY_COLS.length, 7, "a week of day columns to bucket into");
const shiftHours = 10; // 06:00-12:00 plus 13:00-17:00
const loadOf = (ops: ProductionOperationNode[], capacity = 1) =>
  productionLoad(
    ops.map((o) => productionPlacement(o, PLANT)!),
    DAY_COLS,
    { calendar: PLANT, capacity },
  );

const monday = loadOf([{ id: "o", resourceId: "m1", start: at(2026, 7, 6, 8), runMinutes: 120 }])[0];
t(iso(DAY_COLS[0].start), "2026-07-06 00:00", "…the first of which is the Monday, because a week starts on one");
t(hours(monday.availableMs), shiftHours, "Monday offers the shift's ten hours, not twenty-four");
t(hours(monday.bookedMs), 2, "…and a two-hour job books two of them");
t(Number(monday.utilisation!.toFixed(3)), 0.2, "which is 20% utilised");
t(monday.overloaded, false, "…and not overloaded");

/* SETUP IS BOOKED TIME. A plant that counts only run time reports itself less
   busy than it is, by exactly the changeover — which is the number capacity
   planning turns on. */
const withChangeover = loadOf([
  { id: "o", resourceId: "m1", start: at(2026, 7, 6, 8), setupMinutes: 90, runMinutes: 120 },
])[0];
t(hours(withChangeover.bookedMs), 3.5, "a 90-minute changeover is booked time, not free time");

/* The lunch hour is not working time, so a job spanning it books its WORKING
   part only — the span is 11:00-14:00 but the plant is shut 12:00-13:00. */
const overLunch = loadOf([{ id: "o", resourceId: "m1", start: at(2026, 7, 6, 11), runMinutes: 120 }])[0];
t(hours(overLunch.bookedMs), 2, "a job across the lunch break books two hours, not three");

// A weekend column: no capacity and no work is not "0% utilised", it is not a
// question. Drawing it as an empty bar says the plant was idle.
const saturday = loadOf([{ id: "o", resourceId: "m1", start: at(2026, 7, 6, 8), runMinutes: 120 }])[5];
t([hours(saturday.availableMs), saturday.utilisation, saturday.overloaded], [0, null, false], "a shut day has no utilisation, not zero");

// Clipped per column, so a multi-day job contributes each day its own share.
const acrossDays = loadOf([{ id: "o", resourceId: "m1", start: at(2026, 7, 6, 8), runMinutes: 15 * 60 }]);
t(
  [hours(acrossDays[0].bookedMs), hours(acrossDays[1].bookedMs), hours(acrossDays[2].bookedMs)],
  [8, 7, 0],
  "a 15-hour job spreads over the days it actually runs on",
);
t(
  hours(acrossDays.reduce((sum, b) => sum + b.bookedMs, 0)),
  15,
  "…and the buckets sum to the whole job, with nothing lost or double-counted",
);

const heavy = loadOf([{ id: "o", resourceId: "m1", start: at(2026, 7, 6, 6), runMinutes: 600 }], 1);
t([hours(heavy[0].bookedMs), heavy[0].overloaded], [10, false], "a full shift is 100% and not an overload");
const doubled = loadOf(
  [
    { id: "a", resourceId: "m1", start: at(2026, 7, 6, 6), runMinutes: 600 },
    { id: "b", resourceId: "m1", start: at(2026, 7, 6, 6), runMinutes: 600 },
  ],
  1,
);
t([hours(doubled[0].bookedMs), doubled[0].overloaded], [20, true], "two full shifts on one machine is an overload");
t(loadOf([{ id: "a", resourceId: "m1", start: at(2026, 7, 6, 6), runMinutes: 600 }], 2)[0].utilisation, 0.5, "capacity 2 halves the utilisation of the same job");
t(productionLoad([], DAY_COLS, { calendar: PLANT }).every((b) => b.bookedMs === 0), true, "no operations books nothing, over 7 columns");

console.log("\nconflicts — computed and REPORTED, never enforced");
const conflictRows = flattenProductionResources(
  [{ id: "m1", name: "CNC-3" } as Res],
  [
    { id: "a", resourceId: "m1", start: at(2026, 7, 6, 8), runMinutes: 180 },
    { id: "b", resourceId: "m1", start: at(2026, 7, 6, 9), runMinutes: 180 },
    { id: "c", resourceId: "m1", start: at(2026, 7, 12, 8), end: at(2026, 7, 12, 10) },
    { id: "ghost", resourceId: "nowhere", start: at(2026, 7, 6, 8), runMinutes: 60 },
  ],
  () => true,
  { calendar: PLANT },
);
const found = productionConflicts(
  conflictRows.rows,
  [
    { id: "a", resourceId: "m1", start: at(2026, 7, 6, 8), runMinutes: 180 },
    { id: "ghost", resourceId: "nowhere", start: at(2026, 7, 6, 8), runMinutes: 60 },
  ],
  { calendar: PLANT },
);
t(found.filter((c) => c.kind === "over-capacity").length, 1, "the double-booking is reported");
t(found.filter((c) => c.kind === "non-working").map((c) => c.operationIds).flat(), ["c"], "the Sunday job is reported");
/* The one that is nearly always a bug rather than a choice: an operation naming
   a resource that does not exist is drawn NOWHERE, so without this it leaves
   the chart in silence. */
t(found.filter((c) => c.kind === "unknown-resource").map((c) => c.operationIds).flat(), ["ghost"], "…and so is work booked on a resource that does not exist");
t(conflictRows.rows[0].lanes.flat().length, 3, "the conflicting operations are still DRAWN — reported is not refused");

console.log(f === 0 ? "\nall passed\n" : `\n${f} FAILED\n`);
process.exit(f === 0 ? 0 : 1);
