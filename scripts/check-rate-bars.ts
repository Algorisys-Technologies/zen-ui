/**
 * Rate bars contract.
 *
 *   bun run check:rate-bars
 *
 * The pure half of RateBars: output over the last stretch of time, in equal
 * buckets, each knowing what the machine was doing.
 *
 *  - A bucket's count is the counter's rise across it: the reading in force at
 *    its end minus the one in force at its start. Readings are step values
 *    (they hold until the next), exactly as PlannedVsActual reads them.
 *  - A bucket's state is the one that covered most of it; a bucket nobody has
 *    a state for is "unknown".
 *  - Rates are per hour, so a 2-minute bucket of 10 parts reads 300/h.
 *  - The bucket that contains now is partial: its rate is over the time
 *    elapsed, not the whole bucket, and it is flagged so it is not read as a
 *    collapse. Buckets after now are not produced at all.
 *  - A counter reset (the value goes DOWN) is not negative output: that bucket
 *    counts from the reset.
 */
import { rateBuckets } from "../packages/core/src/rate-bars";

let f = 0;
const r = (_: string, v: unknown) => (typeof v === "number" ? Math.round(v * 1000) / 1000 : v);
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got, r) === JSON.stringify(want, r);
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(64)} ${ok ? "" : `got=${JSON.stringify(got, r)} want=${JSON.stringify(want, r)}`}`);
};
const M = 60_000;
const T0 = 0;
// A reading every minute: 5 parts a minute, except a stop between 4 and 6.
const readings = Array.from({ length: 11 }, (_, i) => ({ at: T0 + i * M, value: i <= 4 ? i * 5 : i <= 6 ? 20 : 20 + (i - 6) * 5 }));
const segments = [
  { state: "running" as const, start: T0, end: T0 + 4 * M },
  { state: "stopped" as const, start: T0 + 4 * M, end: T0 + 6 * M },
  { state: "running" as const, start: T0 + 6 * M, end: null },
];

console.log("\nbuckets");
const b = rateBuckets({ readings, segments, from: T0, to: T0 + 10 * M, bucketMs: 2 * M, now: T0 + 10 * M });
t(b.map((x) => x.count), [10, 10, 0, 10, 10], "counts per 2-minute bucket");
t(b.map((x) => x.perHour), [300, 300, 0, 300, 300], "per hour");
t(b.map((x) => x.state), ["running", "running", "stopped", "running", "running"], "each bucket's state");
t(b.every((x) => !x.partial), true, "all complete when now is at the end");

console.log("\nthe bucket in progress");
const live = rateBuckets({ readings, segments, from: T0, to: T0 + 10 * M, bucketMs: 2 * M, now: T0 + 9 * M });
t(live.length, 5, "the bucket containing now is produced");
t([live[4].count, live[4].perHour, live[4].partial], [5, 300, true], "partial: 5 parts in 1 minute is still 300/h, and flagged");
t(rateBuckets({ readings, segments, from: T0, to: T0 + 10 * M, bucketMs: 2 * M, now: T0 + 5 * M }).length, 3, "no buckets after now");

console.log("\nmajority state and no state");
const mixed = rateBuckets({ readings, segments, from: T0 + 3 * M, to: T0 + 6 * M, bucketMs: 3 * M, now: T0 + 6 * M });
t(mixed[0].state, "stopped", "1 min running + 2 min stopped: stopped");
t(rateBuckets({ readings, from: T0, to: T0 + 2 * M, bucketMs: 2 * M, now: T0 + 2 * M })[0].state, "unknown", "no segments: unknown");

console.log("\ncounter reset");
const reset = [
  { at: T0, value: 980 },
  { at: T0 + M, value: 995 },
  { at: T0 + 2 * M, value: 4 },
  { at: T0 + 3 * M, value: 19 },
];
const rb = rateBuckets({ readings: reset, from: T0, to: T0 + 4 * M, bucketMs: 2 * M, now: T0 + 4 * M });
// First bucket (0, 2 min]: 980 → 995 is 15, then the counter resets and reads
// 4, which is 4 more made since the reset: 19. Second bucket: 4 → 19 is 15.
t(rb.map((x) => x.count), [19, 15], "a reset is not negative output: count from the reset");

console.log("\nedges");
t(rateBuckets({ readings: [], from: T0, to: T0 + 4 * M, bucketMs: 2 * M, now: T0 + 4 * M }).map((x) => x.count), [0, 0], "no readings: zero output");
t(rateBuckets({ readings, from: T0, to: T0 + 4 * M, bucketMs: 0, now: T0 + 4 * M }), [], "a zero bucket size: nothing, not a hang");

console.log(`\n${f === 0 ? "all passed" : `${f} FAILED`}`);
process.exit(f === 0 ? 0 : 1);
