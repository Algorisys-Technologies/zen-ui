/**
 * Andon contract.
 *
 *   bun run check:andon
 *
 * The pure half of AndonTile / AndonBoard — the board above the floor, read
 * from across the room. Three rules:
 *
 *  - The clock measures trouble, not uptime. A machine running for 29 hours
 *    does not get a 29-hour counter: it would be the biggest number on a
 *    healthy tile and read as an alarm. Running and idle show no clock; every
 *    other state does, "no data" included (how long since it was last heard).
 *  - Sorted, the tiles that need someone come first: down, then no data (a dead
 *    collector is a problem nobody sees), then setup, planned stops, idle,
 *    running — and within a tone, the longest in it first.
 *  - A board that has stopped updating must say so. A frozen board is
 *    indistinguishable from a calm plant; past `staleAfterMs` without a
 *    successful refresh it is stale.
 */
import { andonShowsClock, sortAndonTiles, boardFreshness, ANDON_TONE_ORDER } from "../packages/core/src/andon";
import { MACHINE_STATES } from "../packages/core/src/machine-state";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(62)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};
const M = 60_000;
const NOW = 1_000_000_000_000;

console.log("\nclock — trouble, not uptime");
t(
  MACHINE_STATES.filter(andonShowsClock),
  ["stopped", "fault", "waiting", "setup", "cleaning", "maintenance", "unknown"],
  "every state but running and idle",
);

console.log("\nsort — who needs someone first");
t(ANDON_TONE_ORDER, ["down", "unknown", "setup", "planned", "idle", "running"], "tone order");
const tiles = [
  { id: "a", state: "running" as const, since: NOW - 300 * M },
  { id: "b", state: "stopped" as const, since: NOW - 2 * M },
  { id: "c", state: "fault" as const, since: NOW - 20 * M },
  { id: "d", state: "unknown" as const, since: NOW - 5 * M },
  { id: "e", state: "setup" as const, since: NOW - 10 * M },
  { id: "f", state: "idle" as const, since: NOW - 1 * M },
  { id: "g", state: "maintenance" as const, since: NOW - 40 * M },
];
t(sortAndonTiles(tiles).map((x) => x.id), ["c", "b", "d", "e", "g", "f", "a"], "down (longest first), no data, setup, planned, idle, running");
t(tiles.map((x) => x.id).join(""), "abcdefg", "the input is not mutated");
t(
  sortAndonTiles([
    { id: "x", state: "stopped" as const, since: NOW - M },
    { id: "y", state: "running" as const, tone: "down" as const, since: NOW - 9 * M },
  ]).map((x) => x.id),
  ["y", "x"],
  "an explicit tone sorts as that tone",
);
t(
  sortAndonTiles([
    { id: "p", state: "stopped" as const },
    { id: "q", state: "stopped" as const, since: NOW - M },
  ]).map((x) => x.id),
  ["q", "p"],
  "a tile with no `since` sorts after timed ones in its tone",
);

console.log("\nfreshness — a frozen board must say so");
t(boardFreshness(NOW - 30_000, NOW), { stale: false, ageMs: 30_000 }, "30 s old: live (default limit 2 min)");
t(boardFreshness(NOW - 2 * M, NOW), { stale: false, ageMs: 2 * M }, "exactly at the limit: still live");
t(boardFreshness(NOW - 2 * M - 1, NOW).stale, true, "past it: stale");
t(boardFreshness(NOW - 40_000, NOW, 30_000).stale, true, "a board's own limit");
t(boardFreshness(undefined, NOW), { stale: false, ageMs: null }, "never refreshed yet: not stale, age unknown");
t(boardFreshness(NOW + 5_000, NOW), { stale: false, ageMs: 0 }, "a timestamp from a fast clock is age 0, not negative");

console.log(`\n${f === 0 ? "all passed" : `${f} FAILED`}`);
process.exit(f === 0 ? 0 : 1);
