/**
 * Chunked upload contract.
 *
 *   bun run check:chunk-upload
 *
 * The pure half of ChunkUploader: how a file is cut up, which piece goes next,
 * and when a failure is worth another attempt. No network, no DOM.
 *
 * The failure modes here are the ones that lose a candidate's interview
 * recording. The app this was built against retries a failed chunk by pushing
 * it back on the queue and breaking the loop, with no attempt limit and no
 * backoff — so a chunk that fails because the server is down is retried
 * immediately, forever, and a chunk that fails after recording stops is never
 * retried at all because nothing restarts the drain. Both are pinned below as
 * the behaviour NOT to have.
 */
import {
  planChunks,
  nextAttemptDelay,
  shouldRetry,
  uploadProgress,
  DEFAULT_CHUNK_SIZE,
  DEFAULT_MAX_ATTEMPTS,
} from "../packages/core/src/chunk-upload";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(58)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};
const MB = 1024 * 1024;

console.log("\nplanChunks — cutting the file up");
t(planChunks(0, MB), [], "an empty file has no chunks, not one empty chunk");
t(planChunks(10, 100), [{ index: 0, start: 0, end: 10 }], "smaller than one chunk is a single chunk");
t(planChunks(100, 100), [{ index: 0, start: 0, end: 100 }], "exactly one chunk is not two");
t(
  planChunks(250, 100),
  [
    { index: 0, start: 0, end: 100 },
    { index: 1, start: 100, end: 200 },
    { index: 2, start: 200, end: 250 },
  ],
  "the last chunk is the remainder, not padded",
);
t(planChunks(5, 0).length, 1, "a zero chunk size falls back rather than looping forever");
t(planChunks(5, -10).length, 1, "…and so does a negative one");
t(planChunks(-5, 100), [], "a negative size is no file");

console.log("\nplanChunks — the pieces tile the file exactly");
const plan = planChunks(1234567, 100_000);
t(plan[0]!.start, 0, "starts at zero");
t(plan[plan.length - 1]!.end, 1234567, "ends at the file's end");
t(
  plan.every((c, i) => (i === 0 ? true : c.start === plan[i - 1]!.end)),
  true,
  "no gaps and no overlaps between consecutive chunks",
);
t(
  plan.reduce((sum, c) => sum + (c.end - c.start), 0),
  1234567,
  "the chunk sizes sum to the file size",
);
t(
  plan.every((c, i) => c.index === i),
  true,
  "indices are sequential, because the server appends in order",
);
t(DEFAULT_CHUNK_SIZE, 5 * MB, "the default chunk is 5 MB");

console.log("\nshouldRetry — a failure is not always worth another go");
t(shouldRetry(1, DEFAULT_MAX_ATTEMPTS), true, "the first failure retries");
t(shouldRetry(2, 3), true, "…and the second");
t(shouldRetry(3, 3), false, "the last allowed attempt does not retry again");
t(shouldRetry(9, 3), false, "past the limit");
t(DEFAULT_MAX_ATTEMPTS, 3, "three attempts by default, not unlimited");
/* The app this replaces has NO limit — a chunk failing against a down server
   is retried forever, at full speed, which is how a browser tab locks up. */
t(shouldRetry(100, 3), false, "there is always a limit");

console.log("\nnextAttemptDelay — backoff, so a down server is not hammered");
t(nextAttemptDelay(1), 500, "the first retry waits half a second");
t(nextAttemptDelay(2), 1000, "then doubles");
t(nextAttemptDelay(3), 2000, "…and doubles again");
t(nextAttemptDelay(4), 4000, "exponential");
t(nextAttemptDelay(10) <= 30_000, true, "the wait is capped rather than growing without bound");
t(nextAttemptDelay(1, 100), 100, "the base is configurable");
t(nextAttemptDelay(0), 500, "attempt zero is treated as the first");

console.log("\nuploadProgress");
t(uploadProgress(0, 10), 0, "nothing done");
t(uploadProgress(5, 10), 50, "half");
t(uploadProgress(10, 10), 100, "all");
t(uploadProgress(0, 0), 100, "no chunks is done, not a division by zero");
t(uploadProgress(3, 7), 43, "rounded to a whole percent");
t(uploadProgress(11, 10), 100, "more than all is still 100");
t(uploadProgress(-1, 10), 0, "never negative");

console.log(f === 0 ? "\nall passed\n" : `\n${f} FAILED\n`);
process.exit(f === 0 ? 0 : 1);
