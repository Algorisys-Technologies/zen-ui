/**
 * Capacity contract.
 *
 *   bun run check:capacity
 *
 * The pure half of CapacityHeatmap: booked hours against available hours per
 * resource and period.
 *
 *  - Load is booked ÷ available. Over capacity is strictly above 100% (a
 *    floating-point allowance, so 40 of 40 computed as 39.999… is not "over").
 *  - "High" from 85% (configurable): full but not yet broken.
 *  - Work booked where there is NO capacity (a line shut that week) is the
 *    worst case — "no-capacity", flagged like over — not a division by zero
 *    and not hidden as free.
 *  - No work and no capacity is "closed"; capacity and no work is "free".
 *  - Totals per row and per column sum hours, then divide — never average the
 *    percentages, which weights a 2-hour cell like a 120-hour one.
 */
import { capacityCell, capacityGrid } from "../packages/core/src/capacity";

let f = 0;
const r = (_: string, v: unknown) => (typeof v === "number" ? Math.round(v * 1000) / 1000 : v);
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got, r) === JSON.stringify(want, r);
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(64)} ${ok ? "" : `got=${JSON.stringify(got, r)} want=${JSON.stringify(want, r)}`}`);
};

console.log("\ncells");
t(capacityCell(30, 40), { booked: 30, available: 40, load: 0.75, status: "ok" }, "30 of 40: 75%, ok");
t(capacityCell(36, 40).status, "high", "36 of 40: 90%, high");
t(capacityCell(40, 40).status, "high", "exactly full: high, not over");
t(capacityCell(0.1 * 3 * 100 + 10, 40).status, "high", "full by floating-point arithmetic (39.99…): not over");
t(capacityCell(44, 40), { booked: 44, available: 40, load: 1.1, status: "over" }, "44 of 40: 110%, over");
t(capacityCell(0, 40), { booked: 0, available: 40, load: 0, status: "free" }, "nothing booked: free");
t(capacityCell(12, 0), { booked: 12, available: 0, load: null, status: "no-capacity" }, "work where there is no capacity: no-capacity, load null");
t(capacityCell(0, 0), { booked: 0, available: 0, load: null, status: "closed" }, "no work, no capacity: closed");
t(capacityCell(34, 40, { high: 0.8 }).status, "high", "a plant's own 'high' threshold");
t(capacityCell(-3, 40).booked, 0, "negative bookings are not a thing: 0");

console.log("\ngrid totals");
const g = capacityGrid({
  rows: [{ id: "A" }, { id: "B" }],
  periods: [{ id: "w1" }, { id: "w2" }],
  cells: [
    { row: "A", period: "w1", booked: 2, available: 2 },
    { row: "A", period: "w2", booked: 60, available: 120 },
    { row: "B", period: "w1", booked: 50, available: 40 },
  ],
});
t(g.cells.A.w1.status, "high", "cells are keyed by row then period");
t(g.cells.B.w2, { booked: 0, available: 0, load: null, status: "closed" }, "a missing cell is closed, not undefined");
t(g.rowTotals.A, { booked: 62, available: 122, load: 62 / 122, status: "ok" }, "row total sums hours (50.8%), not the mean of 100% and 50%");
t(g.periodTotals.w1, { booked: 52, available: 42, load: 52 / 42, status: "over" }, "period total");
t(g.total.load, 112 / 162, "grand total");
t(g.overCount, 1, "cells over capacity or with no capacity: counted");

console.log(`\n${f === 0 ? "all passed" : `${f} FAILED`}`);
process.exit(f === 0 ? 0 : 1);
