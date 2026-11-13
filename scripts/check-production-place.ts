/**
 * Placing work and lateness — contract.
 *
 *   bun run check:production-place
 *
 * The pure half of dragging work in from a backlog, and of overdue flags.
 *
 *  - Placing a job that is not on the chart yet is a MOVE of a job that did
 *    not exist: the proposal is exactly what `productionReschedule` returns for
 *    the schedule with the job added — same cascade, same conflicts. The
 *    component proposes; the caller applies (DECISION 2).
 *  - A drop snaps to 15 minutes, nearest.
 *  - "Next free start" on a work centre is after its last booking (setup
 *    included) or the given time, whichever is later — what "put it on the
 *    end of Press 4" means from a keyboard.
 *  - Late is the end past the due date, in milliseconds; on time is 0; no due
 *    date is null (not "on time" — nobody said when it was due).
 */
import { productionPlaceProposal, productionNextFreeStart, snapToMinutes, PRODUCTION_DRAG_TYPE } from "../packages/core/src/reschedule";
import { productionLateMs } from "../packages/core/src/production";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(64)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
};
const at = (h: number, m = 0) => new Date(Date.UTC(2026, 10, 16, h, m));
const H = 3_600_000;
const ops = [
  { id: "a", resourceId: "m1", start: at(6), runMinutes: 120 },
  { id: "b", resourceId: "m1", start: at(8), runMinutes: 60 },
];

console.log("\nplacing a job from the backlog");
// Capacity conflicts need the resources (as productionReschedule documents).
const RES = [{ id: "m1", name: "Press 4" }, { id: "m2", name: "Press 5" }];
const p = productionPlaceProposal(ops, [], { id: "new", runMinutes: 90 }, { resourceId: "m1", start: at(7) }, { resources: RES });
t(p.move, { operationId: "new", start: at(7), resourceId: "m1" }, "the proposal's move names the new job where it was dropped");
t(p.conflicts.some((c) => c.kind === "over-capacity"), true, "dropped onto a busy machine: the overlap is reported, not refused");
const free = productionPlaceProposal(ops, [], { id: "new", runMinutes: 90 }, { resourceId: "m2", start: at(7) }, { resources: RES });
t(free.conflicts.length, 0, "onto a free machine: no conflicts");
t(productionPlaceProposal(ops, [], { id: "a", runMinutes: 30 }, { resourceId: "m2", start: at(7) }).move.operationId, "a", "a job already on the chart is moved, not duplicated");

console.log("\nsnapping and next free start");
t(snapToMinutes(at(9, 7).getTime(), 15), at(9, 0).getTime(), "09:07 → 09:00");
t(snapToMinutes(at(9, 7).getTime() + 43_000, 15), at(9, 15).getTime(), "09:07:43 is past the half: 09:15");
t(snapToMinutes(at(9, 8).getTime(), 15), at(9, 15).getTime(), "09:08 → 09:15");
t(productionNextFreeStart(ops, "m1", at(5)), at(9), "after m1's last job (b ends 09:00)");
t(productionNextFreeStart(ops, "m1", at(11)), at(11), "or the given time, if that is later");
t(productionNextFreeStart(ops, "m9", at(5)), at(5), "an empty machine: the given time");
t(productionNextFreeStart([{ id: "s", resourceId: "m1", start: at(6), runMinutes: 60, setupMinutes: 30 }], "m1", at(0)), at(7, 30), "setup counts: 06:00 + 30 + 60");

console.log("\nlateness");
t(productionLateMs(at(14), at(12)), 2 * H, "ends 14:00, due 12:00: 2 h late");
t(productionLateMs(at(11), at(12)), 0, "ends before due: 0");
t(productionLateMs(at(12), at(12)), 0, "exactly on the due time: on time");
t(productionLateMs(at(14), undefined), null, "no due date: null, not on time");

console.log("\nthe drag payload type");
t(PRODUCTION_DRAG_TYPE, "application/x-zen-operation", "one MIME type, shared by backlog and chart");

console.log(`\n${f === 0 ? "all passed" : `${f} FAILED`}`);
process.exit(f === 0 ? 0 : 1);
