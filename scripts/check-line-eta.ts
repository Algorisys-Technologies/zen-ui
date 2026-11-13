/**
 * Line ETA contract.
 *
 *   bun run check:line-eta
 *
 * The pure half of LineCard's last line: when will the current order finish,
 * or why that question has no answer right now.
 *
 *  - Running with a rate: now + remaining ÷ rate.
 *  - Done (good ≥ target): done, not an ETA in the past.
 *  - Not running (down, setup, a planned stop): no ETA — a time computed from a
 *    rate the machine is not producing at would be a promise nobody can keep.
 *    The card says what it is doing instead.
 *  - Running but no rate (just started, no readings): no ETA yet.
 *  - No data: unknown, not a guess.
 */
import { lineEta } from "../packages/core/src/line-eta";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(62)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
};
const NOW = 1_000_000_000_000;
const H = 3_600_000;

t(lineEta({ state: "running", target: 500, good: 361, perHour: 278, now: NOW }), { kind: "eta", at: NOW + (139 / 278) * H }, "139 to go at 278/h: half an hour");
t(lineEta({ state: "running", target: 500, good: 500, perHour: 278, now: NOW }), { kind: "done" }, "target reached: done");
t(lineEta({ state: "stopped", target: 500, good: 361, perHour: 278, now: NOW }), { kind: "not-running" }, "stopped: no ETA, however good the old rate");
t(lineEta({ state: "setup", target: 500, good: 0, perHour: 300, now: NOW }), { kind: "not-running" }, "in setup: no ETA");
t(lineEta({ state: "maintenance", target: 500, good: 10, perHour: 300, now: NOW }), { kind: "not-running" }, "planned stop: no ETA");
t(lineEta({ state: "running", target: 500, good: 10, perHour: 0, now: NOW }), { kind: "no-rate" }, "running, no rate yet: no ETA yet");
t(lineEta({ state: "running", target: 500, good: 10, now: NOW }), { kind: "no-rate" }, "no rate given at all");
t(lineEta({ state: "unknown", target: 500, good: 10, perHour: 300, now: NOW }), { kind: "unknown" }, "no data: unknown");
t(lineEta({ state: "idle", target: 500, good: 10, perHour: 300, now: NOW }), { kind: "not-running" }, "idle with work left: not running");
t(lineEta({ state: "running", target: 0, good: 0, perHour: 300, now: NOW }).kind, "done", "a zero target is already done");

console.log(`\n${f === 0 ? "all passed" : `${f} FAILED`}`);
process.exit(f === 0 ? 0 : 1);
