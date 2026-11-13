/**
 * Measurement contract.
 *
 *   bun run check:measurement
 *
 * The pure half of MeasurementInput: a reading against its limits. Rules:
 *
 *  - Limits are inclusive: a reading exactly on the upper limit passes. The
 *    comparison allows for floating point, so 10.1 entered against a limit of
 *    10.1 computed as 10.0 + 0.1 does not fail by 2e-15.
 *  - One-sided specs exist (a minimum torque, a maximum burr height).
 *  - An optional warning band inside the limits marks a reading that passes
 *    but is drifting — the cue to act before parts fail.
 *  - A spec whose lower limit is above its upper is not silently "everything
 *    fails"; it has no verdict.
 *  - The scale is drawn from the LIMITS, not stretched to a wild reading: a
 *    typo of 1000 against 10 ± 0.1 would otherwise shrink the tolerance band to
 *    nothing. The reading is pinned to the end and marked off-scale.
 */
import { judgeMeasurement, measurementScale } from "../packages/core/src/measurement";

let f = 0;
const r6 = (_: string, v: unknown) => (typeof v === "number" ? Math.round(v * 1e6) / 1e6 : v);
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got, r6) === JSON.stringify(want, r6);
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(62)} ${ok ? "" : `got=${JSON.stringify(got, r6)} want=${JSON.stringify(want, r6)}`}`);
};

const bore = { nominal: 10, lower: 9.9, upper: 10.1, warnLower: 9.95, warnUpper: 10.05 };

console.log("\nverdict");
t(judgeMeasurement(10.02, bore), { verdict: "pass", side: null, deviation: 0.02 }, "inside the warning band: pass");
t(judgeMeasurement(10.07, bore), { verdict: "warn", side: "high", deviation: 0.07 }, "between warning and limit: warn, high");
t(judgeMeasurement(9.93, bore).verdict, "warn", "the low side warns too");
t(judgeMeasurement(10.1, bore).verdict, "warn", "exactly on the upper limit: not a fail");
t(judgeMeasurement(10.0 + 0.1, { lower: 9.9, upper: 10.1 }).verdict, "pass", "on the limit by floating-point arithmetic: still passes");
t(judgeMeasurement(10.12, bore), { verdict: "fail", side: "high", deviation: 0.12 }, "over the upper limit: fail, high");
t(judgeMeasurement(9.8, bore), { verdict: "fail", side: "low", deviation: -0.2 }, "under the lower limit: fail, low");
t(judgeMeasurement(null, bore), { verdict: null, side: null, deviation: null }, "no reading, no verdict");

console.log("\none-sided and odd specs");
t(judgeMeasurement(42, { lower: 40 }), { verdict: "pass", side: null, deviation: null }, "minimum only, no nominal: no deviation");
t(judgeMeasurement(38, { lower: 40 }).verdict, "fail", "minimum only: below fails");
t(judgeMeasurement(0.3, { upper: 0.2, nominal: 0 }).side, "high", "maximum only");
t(judgeMeasurement(5, { lower: 10, upper: 2 }).verdict, null, "lower above upper: no verdict, not 'everything fails'");
t(judgeMeasurement(5, {}).verdict, null, "no limits at all: nothing to judge against");

console.log("\nscale");
const s = measurementScale(bore, 10.02);
t([s.min, s.max], [9.85, 10.15], "the limits plus a quarter of the band each side");
t([s.lower, s.upper, s.nominal], [0.166667, 0.833333, 0.5], "limits and nominal as fractions");
t([s.value, s.offScale], [0.566667, false], "the reading placed on it");
const typo = measurementScale(bore, 1000);
t([typo.min, typo.max, typo.value, typo.offScale], [9.85, 10.15, 1, true], "a wild reading does not stretch the scale: pinned, off-scale");
t(measurementScale(bore, 9).value, 0, "pinned to the low end too");
const min = measurementScale({ lower: 40 }, 42);
t([min.lower, min.upper, min.offScale], [0.5, null, false], "one limit: centred on it, the reading on the scale");
t(measurementScale({}, null).value, null, "nothing to draw against");

console.log(`\n${f === 0 ? "all passed" : `${f} FAILED`}`);
process.exit(f === 0 ? 0 : 1);
