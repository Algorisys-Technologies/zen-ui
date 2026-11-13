/**
 * Planned vs actual contract.
 *
 *   bun run check:planned-vs-actual
 *
 * The pure half of PlannedVsActual: pieces made against the plan, at now.
 *
 *  - The plan is cumulative and linear between its points; a flat plan total
 *    spreads evenly over the window. A plan with a flat stretch (a break) is
 *    just two points at the same value.
 *  - Actual counts are readings: a reading holds until the next one, it is NOT
 *    interpolated forward — the counter said 300 at 09:00, and nothing says 310
 *    at 09:01.
 *  - "On plan" within a tolerance (default 2% of the plan total), so a gap of
 *    one piece does not flip the headline between ahead and behind.
 *  - No projection until 15% of the window has passed: ten minutes in, any
 *    pace is noise. The projection extends the pace so far to the end.
 *  - After the window ends, the result is final: no projection, gap at the end.
 */
import { plannedVsActual } from "../packages/core/src/planned-vs-actual";

let f = 0;
const r = (_: string, v: unknown) => (typeof v === "number" ? Math.round(v * 1000) / 1000 : v);
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got, r) === JSON.stringify(want, r);
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(64)} ${ok ? "" : `got=${JSON.stringify(got, r)} want=${JSON.stringify(want, r)}`}`);
};
const H = 3_600_000;
const S = 0; // shift start
const E = 8 * H;
const actual = [
  { at: S + 1 * H, value: 220 },
  { at: S + 2 * H, value: 470 },
  { at: S + 3 * H, value: 700 },
  { at: S + 4 * H, value: 821 },
];

console.log("\nthe headline at now");
const mid = plannedVsActual({ start: S, end: E, now: S + 4.5 * H, planTotal: 2000, actual });
t([mid.planNow, mid.actualNow, mid.gap, mid.status], [1125, 821, -304, "behind"], "4h30 in: plan 1,125, actual 821 (last reading), 304 behind");
t(mid.projected, 821 + (821 / (4.5 * H)) * (3.5 * H), "projection: the pace so far, to the end");
t(mid.final, false, "not final while the shift runs");

console.log("\non plan, and ahead");
t(plannedVsActual({ start: S, end: E, now: S + 4 * H, planTotal: 2000, actual: [{ at: S + 4 * H, value: 990 }] }).status, "on", "10 short of 1,000 is within 2% of 2,000: on plan");
t(plannedVsActual({ start: S, end: E, now: S + 4 * H, planTotal: 2000, actual: [{ at: S + 4 * H, value: 1100 }] }).status, "ahead", "100 over: ahead");
t(plannedVsActual({ start: S, end: E, now: S + 4 * H, planTotal: 2000, tolerance: 0, actual: [{ at: S + 4 * H, value: 999 }] }).status, "behind", "a plant's own tolerance of 0");

console.log("\nreadings are not interpolated");
t(plannedVsActual({ start: S, end: E, now: S + 2.9 * H, planTotal: 2000, actual }).actualNow, 470, "between readings: the last one, not a guess");
t(plannedVsActual({ start: S, end: E, now: S + 0.5 * H, planTotal: 2000, actual }).actualNow, 0, "before the first reading: 0");
t(plannedVsActual({ start: S, end: E, now: S + 2 * H, planTotal: 2000, actual: [...actual].reverse() }).actualNow, 470, "readings in any order");

console.log("\na plan with a break");
const plan = [
  { at: S, value: 0 },
  { at: S + 4 * H, value: 1000 },
  { at: S + 4.5 * H, value: 1000 },
  { at: E, value: 1875 },
];
const br = plannedVsActual({ start: S, end: E, now: S + 4.25 * H, plan, actual });
t(br.planNow, 1000, "during the break the plan stands still");
t(br.planTotal, 1875, "the plan total is its last point");
t(plannedVsActual({ start: S, end: E, now: S + 6 * H, plan, actual }).planNow, 1375, "after it, linear again");

console.log("\nearly, late and empty");
t(plannedVsActual({ start: S, end: E, now: S + 1 * H, planTotal: 2000, actual }).projected, null, "an hour in (12.5%): no projection yet");
const done = plannedVsActual({ start: S, end: E, now: E + H, planTotal: 2000, actual: [...actual, { at: E, value: 1880 }] });
t([done.final, done.planNow, done.actualNow, done.gap, done.projected], [true, 2000, 1880, -120, null], "after the end: final, measured at the end");
const none = plannedVsActual({ start: S, end: E, now: S + 3 * H, planTotal: 0, actual: [] });
t([none.planNow, none.actualNow, none.status], [0, 0, "on"], "no plan and nothing made: on plan, not a division by zero");
t(plannedVsActual({ start: S, end: S, now: S, planTotal: 10, actual: [] }).planNow, 0, "an empty window: plan 0, no NaN");

console.log(`\n${f === 0 ? "all passed" : `${f} FAILED`}`);
process.exit(f === 0 ? 0 : 1);
