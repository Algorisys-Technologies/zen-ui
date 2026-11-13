/**
 * Live-data state contract.
 *
 *   bun run check:live
 *
 * The pure half of LiveIndicator: is what this screen shows current?
 *
 *  - A connection the app says is down is "offline", whatever the timestamps
 *    say: the last update may be seconds old, but nothing new can arrive.
 *  - No update yet is "waiting", not "stale": a page that has just opened has
 *    nothing to be late about.
 *  - Past `staleAfterMs` since the last SUCCESSFUL update it is "stale".
 *  - Otherwise "live". The age is reported with every state that has one.
 */
import { liveState } from "../packages/core/src/live";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(62)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
};
const NOW = 1_000_000_000_000;

t(liveState({ lastUpdated: NOW - 10_000, now: NOW }), { state: "live", ageMs: 10_000 }, "10 s old: live");
t(liveState({ lastUpdated: NOW - 120_000, now: NOW }).state, "live", "exactly at the default limit (2 min): live");
t(liveState({ lastUpdated: NOW - 120_001, now: NOW }), { state: "stale", ageMs: 120_001 }, "past it: stale");
t(liveState({ lastUpdated: NOW - 40_000, now: NOW, staleAfterMs: 30_000 }).state, "stale", "a screen's own limit");
t(liveState({ now: NOW }), { state: "waiting", ageMs: null }, "nothing yet: waiting, not stale");
t(liveState({ lastUpdated: NOW - 1_000, now: NOW, connected: false }), { state: "offline", ageMs: 1_000 }, "disconnected: offline, however recent");
t(liveState({ now: NOW, connected: false }), { state: "offline", ageMs: null }, "disconnected before anything arrived");
t(liveState({ lastUpdated: NOW + 3_000, now: NOW }), { state: "live", ageMs: 0 }, "a timestamp from a fast clock: age 0");
t(liveState({ lastUpdated: new Date(NOW - 5_000), now: new Date(NOW) }).ageMs, 5_000, "Dates work as well as numbers");

console.log(`\n${f === 0 ? "all passed" : `${f} FAILED`}`);
process.exit(f === 0 ? 0 : 1);
