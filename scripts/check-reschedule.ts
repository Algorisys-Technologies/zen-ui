/**
 * Contract for the reschedule cascade — DECISION 2, settled.
 *
 * This is the highest-consequence arithmetic in the schedule line, because it
 * is the only part that proposes a CHANGE. Everything else draws what it was
 * given; this decides what a planner is about to commit to an ERP. A cascade
 * that misses one successor produces a schedule nobody saw; a cascade that
 * pulls one forward moves work into a slot nobody looked at; a cascade that
 * loops on a routing cycle hangs the tab.
 *
 * The three properties the module exists to hold, each pinned below:
 *
 *   1. it PROPOSES and never applies — the inputs are unchanged afterwards;
 *   2. the cascade CONTAINS the dragged operation, first;
 *   3. conflicts are reported, and the cascade never refuses a move.
 */
import {
  productionReschedule,
  type ProductionMove,
  type ProductionProposal,
} from "../packages/core/src/reschedule";
import type { ProductionOperationNode, ProductionResourceNode } from "../packages/core/src/production";
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
const shifts = (p: ProductionProposal) =>
  p.cascade.map((s) => `${s.operationId} ${s.reason} -> ${iso(s.to.start)}`);

/* 06:00-17:00 Mon-Fri with an hour off at noon, weekends shut. 2026-07-06 is a
   Monday, 2026-07-10 a Friday. */
const SHIFT = [
  { from: 6 * 60, to: 12 * 60 },
  { from: 13 * 60, to: 17 * 60 },
];
const PLANT: GanttCalendar = { week: [[], SHIFT, SHIFT, SHIFT, SHIFT, SHIFT, []] };

const RESOURCES: ProductionResourceNode[] = [{ id: "m1" }, { id: "m2" }];
/** Three operations chained finish-to-start, back to back on one machine. */
const CHAIN: ProductionOperationNode[] = [
  { id: "a", resourceId: "m1", start: at(2026, 7, 6, 6), runMinutes: 120 },
  { id: "b", resourceId: "m1", start: at(2026, 7, 6, 8), runMinutes: 120 },
  { id: "c", resourceId: "m1", start: at(2026, 7, 6, 10), runMinutes: 60 },
];
const LINKS: GanttDependency[] = [
  { from: "a", to: "b" },
  { from: "b", to: "c" },
];
const run = (move: ProductionMove, ops = CHAIN, links = LINKS, extra = {}) =>
  productionReschedule(ops, links, move, { calendar: PLANT, resources: RESOURCES, ...extra });

console.log("\nthe cascade — what moves when you move one thing");
const later = run({ operationId: "a", start: at(2026, 7, 6, 8) });
/* Everything downstream follows, and the dragged operation is FIRST. A caller
   that persists only the dragged one produces a schedule the user never saw. */
t(shifts(later), ["a moved -> 07-06 08:00", "b pushed -> 07-06 10:00", "c pushed -> 07-06 13:00"], "pushing A two hours pushes B and C with it");
t(later.cascade[0].reason, "moved", "the dragged operation leads the cascade");
t(later.cascade.filter((s) => s.reason === "moved").length, 1, "…and it is the only one marked so");
/* C lands at 13:00 rather than 12:00: the lunch hour is not working time, so
   two hours of push across it is three hours of clock. */
t(iso(later.cascade[2].to.start), "07-06 13:00", "the push is in WORKING time — it steps over the lunch break");

console.log("\n…and what does NOT move");
const earlier = run({ operationId: "c", start: at(2026, 7, 6, 6) });
/* Dragging C earlier violates its link, which is REPORTED. A and B stay put:
   the cascade pushes later and never pulls earlier, because pulling would move
   work the planner did not ask about into a slot they have not looked at. */
t(shifts(earlier), ["c moved -> 07-06 06:00"], "dragging a successor earlier moves nothing else");
t(earlier.conflicts.filter((x) => x.kind === "sequence").length, 1, "…and the link it now breaks is reported");
const upstream = run({ operationId: "c", start: at(2026, 7, 6, 14) });
t(shifts(upstream), ["c moved -> 07-06 14:00"], "dragging the LAST operation later moves nothing upstream");
t(run({ operationId: "a", start: at(2026, 7, 6, 6) }).cascade, [], "a move to where it already is proposes nothing at all");
t(run({ operationId: "ghost", start: at(2026, 7, 6, 6) }).cascade, [], "a move naming an operation that does not exist proposes nothing");

console.log("\nit PROPOSES — the inputs are untouched");
const snapshot = JSON.stringify(CHAIN);
run({ operationId: "a", start: at(2026, 7, 8, 6) });
t(JSON.stringify(CHAIN), snapshot, "the operations array is byte-identical afterwards");
/* The property that keeps undo the caller's: with nothing mutated internally
   there is no pending state to roll back, and no second source of truth. */
t(iso(CHAIN[1].start), "07-06 08:00", "…including the ones the cascade would have pushed");

console.log("\nworking duration is preserved, not elapsed");
/* A two-hour job dragged to Friday 16:00 is still two hours of WORK, which now
   finishes Monday morning. Preserving elapsed time would silently shorten every
   job dragged across a weekend. */
const weekend = run({ operationId: "a", start: at(2026, 7, 10, 16) });
t(iso(weekend.cascade[0].to.start), "07-10 16:00", "dragged to Friday 16:00");
t(iso(weekend.cascade[0].to.end), "07-13 07:00", "…it finishes MONDAY, two working hours later");
t(
  run({ operationId: "a", start: at(2026, 7, 6, 6) }, [{ id: "a", resourceId: "m1", start: at(2026, 7, 6, 6), runMinutes: 120 }], []).cascade,
  [],
  "a lone operation with no links cascades to nothing",
);

console.log("\nlag travels with the cascade");
const LAGGED: GanttDependency[] = [{ from: "a", to: "b", lagMinutes: 60 }];
const lagged = run({ operationId: "a", start: at(2026, 7, 6, 6) }, CHAIN, LAGGED);
/* A already ends at 08:00 and B starts at 08:00, so an hour of required cooling
   is short by an hour even though nothing moved. */
t(shifts(lagged), ["b pushed -> 07-06 09:00"], "an unmet lag pushes the successor even with no drag");
t(
  shifts(run({ operationId: "a", start: at(2026, 7, 6, 6) }, CHAIN, [{ from: "a", to: "b", lagMinutes: -60 }])),
  [],
  "a LEAD relaxes the link, so nothing needs to move",
);
/* The four types anchor at different ends, and pushing against the wrong one
   moves a schedule that was fine. */
t(
  shifts(run({ operationId: "a", start: at(2026, 7, 6, 10) }, CHAIN, [{ from: "a", to: "b", type: "start-to-start" }])),
  ["a moved -> 07-06 10:00", "b pushed -> 07-06 10:00"],
  "start-to-start pushes the successor's START to match",
);

console.log("\na routing CYCLE is reported, not iterated");
const CYCLE: GanttDependency[] = [
  { from: "a", to: "b" },
  { from: "b", to: "c" },
  { from: "c", to: "a" },
];
const cyclic = run({ operationId: "a", start: at(2026, 7, 6, 8) }, CHAIN, CYCLE);
/* Pushing round a cycle makes the next link worse forever, so nothing is
   pushed and the operations involved are named. Iterating to a guard limit
   would produce a schedule that is merely wrong more slowly. */
t(cyclic.cycles, ["a", "b", "c"], "every operation in the cycle is named");
t(cyclic.cascade.filter((s) => s.reason === "pushed"), [], "…and none of them is pushed");
t(cyclic.cascade.map((s) => s.operationId), ["a"], "the drag itself still stands — it is the caller's call");
/* A cycle elsewhere must not stop the rest of the graph cascading. */
const MIXED: ProductionOperationNode[] = [
  ...CHAIN,
  { id: "x", resourceId: "m2", start: at(2026, 7, 6, 6), runMinutes: 60 },
  { id: "y", resourceId: "m2", start: at(2026, 7, 6, 7), runMinutes: 60 },
];
const mixed = run({ operationId: "a", start: at(2026, 7, 6, 8) }, MIXED, [
  ...LINKS,
  { from: "x", to: "y" },
  { from: "y", to: "x" },
]);
t(mixed.cycles, ["x", "y"], "a cycle in one corner is reported…");
t(shifts(mixed).filter((s) => s.startsWith("b") || s.startsWith("c")).length, 2, "…and the healthy chain still cascades");

console.log("\nconflicts are REPORTED, and the move is never refused");
const CLASH: ProductionOperationNode[] = [
  { id: "a", resourceId: "m1", start: at(2026, 7, 6, 6), runMinutes: 120 },
  { id: "z", resourceId: "m1", start: at(2026, 7, 6, 14), runMinutes: 120 },
];
/* Dragging A on top of Z double-books a one-operator machine. The proposal
   still contains the move: overtime gets authorised, and a supervisor who
   knows both jobs can run may do this deliberately. */
const clash = run({ operationId: "a", start: at(2026, 7, 6, 14) }, CLASH, []);
t(shifts(clash), ["a moved -> 07-06 14:00"], "the move is proposed…");
t(clash.conflicts.some((c) => c.kind === "over-capacity"), true, "…and the double-booking is reported alongside it");
t(
  run({ operationId: "a", start: at(2026, 7, 11, 8) }, CLASH, []).conflicts.some((c) => c.kind === "non-working"),
  false,
  "a job dragged onto a Saturday is RELOCATED by the calendar, not flagged as shut",
);

console.log("\nmoving between resources takes the new resource's calendar");
const CONTINUOUS: GanttCalendar = { week: Array.from({ length: 7 }, () => [{ from: 0, to: 1440 }]) };
const crossed = productionReschedule(
  [{ id: "a", resourceId: "m1", start: at(2026, 7, 6, 16), runMinutes: 240 }],
  [],
  { operationId: "a", start: at(2026, 7, 6, 16), resourceId: "m2" },
  { calendar: PLANT, calendarFor: (id) => (id === "m2" ? CONTINUOUS : PLANT), resources: RESOURCES },
);
/* Four hours from 16:00 on a single-shift plant runs to 07:00 the next
   morning; on a continuous furnace it is done at 20:00. Ignoring the target's
   calendar would abandon the whole working-time argument at the last step. */
t(iso(crossed.cascade[0].to.end), "07-06 20:00", "the job finishes at 20:00 on the continuous resource");
t(crossed.cascade[0].resourceId, "m2", "…and the shift records which resource it moved to");
t(
  productionReschedule(
    [{ id: "a", resourceId: "m1", start: at(2026, 7, 6, 16), runMinutes: 240 }],
    [],
    { operationId: "a", start: at(2026, 7, 6, 16) },
    { calendar: PLANT, resources: RESOURCES },
  ).cascade,
  [],
  "…while staying put on the same resource proposes nothing",
);

console.log(f === 0 ? "\nall passed\n" : `\n${f} FAILED\n`);
process.exit(f === 0 ? 0 : 1);
