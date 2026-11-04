/**
 * Column totals contract.
 *
 *   bun run check:aggregate
 *
 * Worked examples, then laws over generated columns, checked against an
 * independent oracle: amounts are generated as whole paise (integers, exact
 * in a double), so the true decimal sum is known exactly; exactSum must equal
 * it to the last digit where the naive double sum often does not. Plus: empty
 * cells are skipped everywhere, min / max are order-independent, avg is sum /
 * count of numbers.
 */
import { aggregate, exactSum, decimalsOf, numbersOf, totalPrecision, type AggregateKind } from "../packages/core/src/aggregate";

let failed = 0, checked = 0;
const eq = (label: string, got: unknown, want: unknown) => {
  checked++;
  const g = got instanceof Date ? got.toISOString() : got, w = want instanceof Date ? want.toISOString() : want;
  if (JSON.stringify(g) !== JSON.stringify(w)) { failed++; if (failed <= 30) console.error(`FAIL ${label}: got ${JSON.stringify(g)}, want ${JSON.stringify(w)}`); }
};

eq("0.1 + 0.2 is 0.3", exactSum([0.1, 0.2]), 0.3);
eq("naive doubles are not (why this exists)", 0.1 + 0.2 === 0.3, false);
eq("mixed precision", exactSum([1.005, 2.1, 3]), 6.105);
eq("negatives", exactSum([10.25, -3.1, -7.15]), 0);
eq("large amounts keep their paise", exactSum([12345678901.23, 0.07]), 12345678901.3);
eq("empty sum", exactSum([]), 0);
eq("decimals", [decimalsOf(1.25), decimalsOf(3), decimalsOf(1e-7), decimalsOf(-0.5), decimalsOf(1.5e-10), decimalsOf(NaN)], [2, 0, 7, 1, 11, 0]);
eq("numbers only", numbersOf([1, "2", null, NaN, undefined, 3.5, Infinity, ""]), [1, 3.5]);

const COL = [1250.5, null, 3000, "", 49.99, undefined, NaN, 0];
eq("sum skips empties", aggregate(COL, "sum"), 4300.49);
eq("count counts the filled cells (0 counts)", aggregate(COL, "count"), 4);
eq("avg is over the numbers", aggregate(COL, "avg"), 4300.49 / 4);
eq("min / max", [aggregate(COL, "min"), aggregate(COL, "max")], [0, 3000]);
eq("all empty: blank, not 0", [aggregate([null, "", undefined], "sum"), aggregate([], "avg"), aggregate([null], "max")], [null, null, null]);
eq("count of nothing is 0", aggregate([], "count"), 0);
const d1 = new Date(2026, 0, 5), d2 = new Date(2025, 11, 31), d3 = new Date(2026, 2, 1);
eq("min / max of Dates return the Date", [aggregate([d1, null, d2, d3], "min"), aggregate([d1, d2, d3], "max")], [d2, d3]);
eq("min / max of ISO date strings", [aggregate(["2026-01-05", "2025-12-31", ""], "min"), aggregate(["2026-01-05", "2025-12-31"], "max")], ["2025-12-31", "2026-01-05"]);
eq("min / max of names", aggregate(["Mango", "Apple", "Guava"], "min"), "Apple");
eq("mixed kinds compare within the first seen", aggregate([5, "zzz", 2], "max"), 5);
eq("…a numeric string is not compared with numbers (\"10\" > 5 would coerce)", aggregate([5, "10", 2], "max"), 5);
eq("an invalid Date is skipped", aggregate([new Date(NaN), d1], "min"), d1);
eq("precision: the column's own", [totalPrecision([1.5, 2.25, 3], "sum"), totalPrecision([1, 2], "sum"), totalPrecision([1, 2], "avg"), totalPrecision([1.123], "avg"), totalPrecision([1, 2], "count")], [2, 0, 2, 3, 0]);
eq("precision: capped", totalPrecision([1e-12], "sum"), 6);

// Laws over generated columns.
let seed = 9;
const rnd = (n: number) => ((seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) >>> 8) % n;
let naiveWrong = 0, columns = 0;
for (let c = 0; c < 400; c++) {
  columns++;
  const paise = Array.from({ length: 1 + rnd(300) }, () => (rnd(2) ? 1 : -1) * rnd(10_000_000));
  const amounts = paise.map((p) => p / 100);
  const truth = paise.reduce((a, b) => a + b, 0) / 100; // integers sum exactly; one division
  const withBlanks: unknown[] = amounts.flatMap((a) => (rnd(5) === 0 ? [a, null] : rnd(9) === 0 ? [a, ""] : [a]));
  eq(`column ${c}: sum is the exact decimal sum`, aggregate(withBlanks, "sum"), truth);
  if (amounts.reduce((a, b) => a + b, 0) !== truth) naiveWrong++;
  eq(`column ${c}: count skips the blanks`, aggregate(withBlanks, "count"), amounts.length);
  eq(`column ${c}: avg = sum / count`, aggregate(withBlanks, "avg"), truth / amounts.length);
  const shuffled = [...withBlanks].sort(() => rnd(3) - 1);
  for (const k of ["min", "max", "sum", "count"] as AggregateKind[]) eq(`column ${c}: ${k} ignores order`, aggregate(shuffled, k), aggregate(withBlanks, k));
  eq(`column ${c}: min / max are the extremes`, [aggregate(withBlanks, "min"), aggregate(withBlanks, "max")], [Math.min(...amounts), Math.max(...amounts)]);
}
eq("columns examined", columns, 400);
eq("the naive double sum really drifts on these columns (so the oracle is testing something)", naiveWrong > 50, true);

console.log(failed ? `${failed} of ${checked} FAILED` : `all passed (${checked} assertions; the naive sum was wrong on ${naiveWrong} of ${columns} columns)`);
process.exit(failed ? 1 : 0);
