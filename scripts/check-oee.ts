/**
 * OEE contract.
 *
 *   bun run check:oee
 *
 * The pure half of OeeGauge. OEE is Availability × Performance × Quality, and
 * the ways to get it wrong are all at the edges:
 *
 *  - A machine that never ran has an OEE (zero) but no Performance — there is
 *    no run time to measure speed against. Computing OEE as A×P×Q there gives
 *    NaN; computing it as good × ideal cycle ÷ planned time gives the true 0,
 *    and is the same number everywhere A×P×Q is defined.
 *  - A factor that cannot be computed is null, never NaN and never a made-up 0:
 *    a 0 would draw as "terrible" for a shift nobody had data for.
 *  - Performance over 100% is reported as it is. It means the ideal cycle time
 *    is wrong (or the counter double-counts), and clamping it to 100% hides the
 *    one number that says so.
 */
import { oeeFromCounts, oeeBand, gaugeAngle, DEFAULT_OEE_BANDS } from "../packages/core/src/oee";

let f = 0;
const near = (a: number | null, b: number | null) =>
  a === null || b === null ? a === b : Math.abs(a - b) < 1e-9;
const t = (got: unknown, want: unknown, name: string, cmp?: (a: never, b: never) => boolean) => {
  const ok = cmp ? cmp(got as never, want as never) : JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(62)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};
const factors = (r: ReturnType<typeof oeeFromCounts>) => [r.availability, r.performance, r.quality, r.oee];
const allNear = (a: (number | null)[], b: (number | null)[]) => a.length === b.length && a.every((x, i) => near(x, b[i]));

console.log("\nthe textbook shift");
// 480 min planned, 420 min running, ideal 1 min/part, 380 made, 361 good.
const shift = oeeFromCounts({ plannedTime: 480, runTime: 420, idealCycleTime: 1, totalCount: 380, goodCount: 361 });
t(factors(shift), [420 / 480, 380 / 420, 361 / 380, 361 / 480], "A, P, Q and OEE", allNear);
t(
  shift.oee,
  (shift.availability ?? 0) * (shift.performance ?? 0) * (shift.quality ?? 0),
  "OEE equals A × P × Q wherever all three exist",
  near,
);

console.log("\nedges");
const neverRan = oeeFromCounts({ plannedTime: 480, runTime: 0, idealCycleTime: 1, totalCount: 0, goodCount: 0 });
t(factors(neverRan), [0, null, null, 0], "never ran: A 0, P and Q unknown, OEE 0 (not NaN)", allNear);
const nothingPlanned = oeeFromCounts({ plannedTime: 0, runTime: 0, idealCycleTime: 1, totalCount: 0, goodCount: 0 });
t(factors(nothingPlanned), [null, null, null, null], "nothing planned: nothing to measure", allNear);
const overspeed = oeeFromCounts({ plannedTime: 60, runTime: 60, idealCycleTime: 1, totalCount: 75, goodCount: 75 });
t(overspeed.performance, 1.25, "performance over 100% is reported, not clamped", near);
const noCycle = oeeFromCounts({ plannedTime: 60, runTime: 60, idealCycleTime: 0, totalCount: 50, goodCount: 50 });
t([noCycle.performance, noCycle.oee], [null, null], "no ideal cycle time: P and OEE unknown", allNear);
const goodOverTotal = oeeFromCounts({ plannedTime: 60, runTime: 60, idealCycleTime: 1, totalCount: 10, goodCount: 12 });
t(goodOverTotal.quality, 1.2, "good > total is reported too (a counting error, not ours to hide)", near);
const negative = oeeFromCounts({ plannedTime: 60, runTime: -5, idealCycleTime: 1, totalCount: 0, goodCount: 0 });
t(negative.availability, null, "a negative run time is not a measurement", near);

console.log("\nbands");
t(DEFAULT_OEE_BANDS, { fair: 0.65, good: 0.85 }, "defaults: fair from 65%, good from 85%");
t([0, 0.6499, 0.65, 0.8499, 0.85, 1].map((v) => oeeBand(v)), ["poor", "poor", "fair", "fair", "good", "good"], "boundaries belong to the band above");
t(oeeBand(null), null, "no value, no band");
t(oeeBand(1.3), "good", "over 100% is still good — the number itself says what is odd");
t(oeeBand(0.7, { fair: 0.5, good: 0.75 }), "fair", "a plant's own thresholds");

console.log("\ngauge angle — 0 at 9 o'clock, 1 at 3 o'clock");
t([0, 0.5, 1].map(gaugeAngle), [-90, 0, 90], "ends and middle");
t([-0.2, 1.25, Number.NaN].map(gaugeAngle), [-90, 90, -90], "clamped to the arc; NaN sits at zero");

console.log(`\n${f === 0 ? "all passed" : `${f} FAILED`}`);
process.exit(f === 0 ? 0 : 1);
