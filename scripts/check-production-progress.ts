/**
 * Production progress contract.
 *
 *   bun run check:production-progress
 *
 * The pure half of ProductionProgress: a work order's good and scrap counts
 * against its target. What must hold:
 *
 *  - Scrap is shown, not hidden inside "made": 480 made of 500 with 40 scrap
 *    is 440 good, 60 to go — not 20.
 *  - Over-production is reported, not clamped away: good past the target is a
 *    number someone has to account for.
 *  - Remaining never goes negative.
 *  - Bar fractions never exceed the bar: if good + scrap pass the target the
 *    two are scaled down together, so scrap is still visible beside good.
 *  - Segments (cartons, pallets, trays) fill whole, partly or not at all, and
 *    the partial one says how far.
 */
import { productionProgress, segmentFill } from "../packages/core/src/production-progress";

let f = 0;
const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;
const t = (got: unknown, want: unknown, name: string) => {
  const ok =
    typeof got === "number" && typeof want === "number"
      ? near(got, want)
      : JSON.stringify(got, (_, v) => (typeof v === "number" ? Math.round(v * 1e6) / 1e6 : v)) ===
        JSON.stringify(want, (_, v) => (typeof v === "number" ? Math.round(v * 1e6) / 1e6 : v));
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(62)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};

console.log("\nproductionProgress");
t(
  productionProgress({ target: 500, good: 361, scrap: 19 }),
  { target: 500, good: 361, scrap: 19, remaining: 139, over: 0, done: false, started: true, goodFraction: 0.722, scrapFraction: 0.038 },
  "the usual case",
);
t(productionProgress({ target: 500, good: 440, scrap: 40 }).remaining, 60, "scrap does not count toward the target");
const over = productionProgress({ target: 500, good: 512, scrap: 8 });
t([over.done, over.over, over.remaining], [true, 12, 0], "over-production is reported; remaining stops at 0");
t(over.goodFraction + over.scrapFraction, 1, "fractions never exceed the bar");
t(over.scrapFraction > 0, true, "and scrap is still visible beside good");
t(productionProgress({ target: 500, good: 0, scrap: 0 }).started, false, "nothing made: not started");
t(productionProgress({ target: 500, good: 0, scrap: 3 }).started, true, "scrap alone means work has started");
t(productionProgress({ target: 0, good: 5 }).goodFraction, 0, "no target: no fraction, not Infinity");
t(productionProgress({ target: 100, good: -4, scrap: Number.NaN }), productionProgress({ target: 100, good: 0, scrap: 0 }), "negative and NaN counts are treated as 0");

console.log("\nsegmentFill");
t(segmentFill(30, 12, 4), [1, 1, 0.5, 0], "30 units in cartons of 12, four planned: two full, one half");
t(segmentFill(48, 12, 4), [1, 1, 1, 1], "exactly full");
t(segmentFill(60, 12, 4), [1, 1, 1, 1], "more than planned: every segment full, none invented");
t(segmentFill(0, 12, 3), [0, 0, 0], "nothing yet");
t(segmentFill(5, 0, 3), [0, 0, 0], "a zero segment size fills nothing");
t(segmentFill(5, 12, 0), [], "no segments: an empty list");
console.log(`\n${f === 0 ? "all passed" : `${f} FAILED`}`);
process.exit(f === 0 ? 0 : 1);
