/**
 * Contract for float and the critical path.
 *
 * Float is a number a planner ACTS on — it is the answer to "can I move this?"
 * — so a wrong one is worse than none. And it is wrong invisibly: every
 * quantity here is plausible, none of them throws, and the chart draws the same
 * bars either way.
 *
 * The distinction the whole module rests on, pinned repeatedly below: FREE
 * float is how far a job slips before it disturbs its immediate successor;
 * TOTAL float is how far before it moves the end. Reporting total float where
 * free was meant tells a planner they have room, and the cascade then pushes
 * six other jobs.
 */
import {
  productionCriticalPath,
  type ProductionCriticalPathOptions,
} from "../packages/core/src/critical-path";
import type { ProductionOperationNode } from "../packages/core/src/production";
import type { GanttCalendar, GanttDependency } from "../packages/core/src/gantt";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(62)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};

const at = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min, 0, 0);
const iso = (d: Date) =>
  `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

const SHIFT = [
  { from: 6 * 60, to: 12 * 60 },
  { from: 13 * 60, to: 17 * 60 },
];
const PLANT: GanttCalendar = { week: [[], SHIFT, SHIFT, SHIFT, SHIFT, SHIFT, []] };

const cp = (
  ops: ProductionOperationNode[],
  links: GanttDependency[],
  options: ProductionCriticalPathOptions = {},
) => productionCriticalPath(ops, links, { calendar: PLANT, ...options });
const floats = (r: ReturnType<typeof cp>) =>
  [...r.byOperation.values()].map((x) => `${x.operationId} free=${x.freeFloatMinutes} total=${x.totalFloatMinutes}`);

console.log("\na chain with a gap in it — where the slack actually is");
/* A (06:00-08:00) -> B (10:00-12:00) -> C (13:00-14:00), all on Monday. B sits
   two hours after A finishes, so A has two hours of room before it touches B. */
const GAP: ProductionOperationNode[] = [
  { id: "a", resourceId: "m1", start: at(2026, 7, 6, 6), runMinutes: 120 },
  { id: "b", resourceId: "m1", start: at(2026, 7, 6, 10), runMinutes: 120 },
  { id: "c", resourceId: "m1", start: at(2026, 7, 6, 13), runMinutes: 60 },
];
const CHAIN: GanttDependency[] = [
  { from: "a", to: "b" },
  { from: "b", to: "c" },
];
const gap = cp(GAP, CHAIN);
t(iso(gap.projectEnd), "07-06 14:00", "the project end defaults to the latest finish in the schedule");
t(
  floats(gap),
  ["a free=120 total=120", "b free=0 total=0", "c free=0 total=0"],
  "A has the two-hour gap; B and C are back to back and have none",
);
t(gap.critical, ["b", "c"], "…so the critical path is B then C, earliest first");
t(gap.cycles, [], "and nothing is in a cycle");
/* The reading a forward pass from zero would have given instead: it would have
   MOVED B to 08:00 and reported A as critical. The point of measuring against
   the schedule as it stands is that the gap is real and someone chose it. */
t(gap.byOperation.get("a")!.critical, false, "A is NOT critical — the gap in front of it is real");
t(iso(gap.byOperation.get("a")!.latestFinish), "07-06 10:00", "…and it may finish as late as B's start");

console.log("\nfree float and total float are different numbers");
/* Two parallel jobs into one successor. The short one can slip until it meets
   D; the long one cannot move at all. */
const JOIN: ProductionOperationNode[] = [
  { id: "long", resourceId: "m1", start: at(2026, 7, 6, 6), runMinutes: 240 },
  { id: "short", resourceId: "m2", start: at(2026, 7, 6, 6), runMinutes: 60 },
  { id: "d", resourceId: "m3", start: at(2026, 7, 6, 10), runMinutes: 60 },
];
const JOIN_LINKS: GanttDependency[] = [
  { from: "long", to: "d" },
  { from: "short", to: "d" },
];
const join = cp(JOIN, JOIN_LINKS);
t(join.byOperation.get("long")!.totalFloatMinutes, 0, "the long branch is critical");
t(join.byOperation.get("short")!.freeFloatMinutes, 180, "the short one has three hours before it touches D");
t(join.byOperation.get("short")!.totalFloatMinutes, 180, "…and the same before it moves the end");
t(join.critical, ["long", "d"], "the critical path runs through the long branch");
/* The invariant that keeps the two honest. Free float can never exceed total:
   slipping past the project end is not made acceptable by a successor
   happening to sit further out. */
t(
  [...join.byOperation.values()].every((x) => x.freeFloatMinutes <= x.totalFloatMinutes),
  true,
  "free float never exceeds total float, for any operation",
);

console.log("\n…and the case where they genuinely differ");
/* B can slip 60 minutes before it hits C, but C itself has 120 minutes of room
   before the end — so B's TOTAL float is larger than its FREE float. Telling a
   planner the total where they wanted the free is how six jobs get pushed. */
const SPLIT: ProductionOperationNode[] = [
  { id: "b", resourceId: "m1", start: at(2026, 7, 6, 6), runMinutes: 60 },
  { id: "c", resourceId: "m1", start: at(2026, 7, 6, 8), runMinutes: 60 },
  { id: "z", resourceId: "m2", start: at(2026, 7, 6, 6), runMinutes: 300 },
];
const split = cp(SPLIT, [{ from: "b", to: "c" }]);
t(iso(split.projectEnd), "07-06 11:00", "Z is the longest, so it sets the end — five working hours inside the morning shift");
t(split.byOperation.get("b")!.freeFloatMinutes, 60, "B has an hour before it touches C");
t(split.byOperation.get("b")!.totalFloatMinutes, 180, "…but three before it moves the END, because C has room too");
t(split.byOperation.get("c")!.freeFloatMinutes, 120, "C's own float is the two hours to the end");

console.log("\nfloat is WORKING time, like everything else");
/* Two hours of float at 16:00 on a single-shift plant reaches 07:00 the next
   morning. Elapsed-time float would say 18:00 and offer a planner a slot the
   plant is shut for. */
const LATE: ProductionOperationNode[] = [
  { id: "p", resourceId: "m1", start: at(2026, 7, 6, 14), runMinutes: 120 },
  { id: "q", resourceId: "m1", start: at(2026, 7, 7, 7), runMinutes: 60 },
];
const late = cp(LATE, [{ from: "p", to: "q" }]);
t(late.byOperation.get("p")!.freeFloatMinutes, 120, "P has two WORKING hours before it touches Q…");
t(iso(late.byOperation.get("p")!.latestFinish), "07-07 07:00", "…which lands at 07:00 the next morning, not at 18:00");

console.log("\na due date changes the answer, and negative float is the plant being late");
const due = cp(GAP, CHAIN, { until: at(2026, 7, 6, 12) });
/* Against a due date everything can be late at once, and that is a fact about
   the plant rather than a bug in the arithmetic. */
t(due.byOperation.get("c")!.totalFloatMinutes, -60, "C finishes an hour past the due date");
t(due.byOperation.get("c")!.critical, true, "…and negative float counts as critical");
t(due.byOperation.get("a")!.totalFloatMinutes, 60, "…while A still has room in front of it");
const generous = cp(GAP, CHAIN, { until: at(2026, 7, 7, 10) });
t(generous.critical, [], "a due date with room in it makes nothing critical");
t(generous.byOperation.get("c")!.totalFloatMinutes, 420, "…and every job gains the slack — 3h left on Monday plus 4h on Tuesday");

console.log("\nlag eats float");
t(
  cp(GAP, [{ from: "a", to: "b", lagMinutes: 60 }, { from: "b", to: "c" }]).byOperation.get("a")!.freeFloatMinutes,
  60,
  "an hour of required cooling takes an hour of A's room",
);
t(
  cp(GAP, [{ from: "a", to: "b", lagMinutes: 120 }, { from: "b", to: "c" }]).byOperation.get("a")!.freeFloatMinutes,
  0,
  "…and two hours of it takes all of it",
);
t(
  cp(GAP, [{ from: "a", to: "b", type: "start-to-start" }, { from: "b", to: "c" }]).byOperation.get("a")!
    .freeFloatMinutes,
  240,
  "a start-to-start link measures the two STARTS, so A has four hours",
);

console.log("\ndegenerate shapes");
t(cp([], []).critical, [], "no operations, no critical path");
t(cp([], []).byOperation.size, 0, "…and nothing to report");
t(cp(GAP, []).critical, ["c"], "with NO links only the last-finishing job is critical");
t(cp(GAP, []).byOperation.get("a")!.totalFloatMinutes, 300, "…and everything else floats to the end, the lunch hour excluded");
t(
  cp(GAP, [{ from: "a", to: "ghost" }]).byOperation.get("a")!.freeFloatMinutes,
  300,
  "a link naming an operation that is not there constrains nothing",
);
/* A cycle has no "latest", so it is named rather than given a number that
   happens not to crash. */
const cyclic = cp(GAP, [{ from: "a", to: "b" }, { from: "b", to: "c" }, { from: "c", to: "a" }]);
t(cyclic.cycles, ["a", "b", "c"], "a routing cycle is reported…");
t(cyclic.byOperation.size, 0, "…and given no float at all");

console.log(f === 0 ? "\nall passed\n" : `\n${f} FAILED\n`);
process.exit(f === 0 ? 0 : 1);
