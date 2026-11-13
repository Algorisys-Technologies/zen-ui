/**
 * Andon — the pure half of AndonTile / AndonBoard.
 *
 *   bun run check:andon
 *
 * The clock measures trouble, not uptime: running and idle tiles show none.
 * Sorted, the tiles that need someone come first, longest in trouble first.
 * And a board that has stopped refreshing says so, because a frozen board looks
 * exactly like a calm plant.
 */
import { machineStateTone, type MachineState, type MachineStateTone } from "./machine-state";

type Time = Date | number;
const ms = (t: Time) => (typeof t === "number" ? t : t.getTime());

/** Whether a tile in this state runs a clock (time in state). */
export function andonShowsClock(state: MachineState): boolean {
  return state !== "running" && state !== "idle";
}

/** Who needs someone first. No data comes straight after down: a dead collector is trouble nobody sees. */
export const ANDON_TONE_ORDER: readonly MachineStateTone[] = ["down", "unknown", "setup", "planned", "idle", "running"];

export interface AndonSortable {
  state: MachineState;
  tone?: MachineStateTone;
  /** When the tile entered its current state. */
  since?: Time;
}

/** A sorted copy: by tone (ANDON_TONE_ORDER), then longest in state first; untimed tiles last within a tone. */
export function sortAndonTiles<T extends AndonSortable>(tiles: readonly T[]): T[] {
  const rank = (x: T) => ANDON_TONE_ORDER.indexOf(x.tone ?? machineStateTone(x.state));
  return tiles
    .map((x, i) => ({ x, i }))
    .sort((a, b) => {
      const r = rank(a.x) - rank(b.x);
      if (r) return r;
      const sa = a.x.since === undefined ? Infinity : ms(a.x.since);
      const sb = b.x.since === undefined ? Infinity : ms(b.x.since);
      return sa - sb || a.i - b.i;
    })
    .map(({ x }) => x);
}

export const DEFAULT_ANDON_STALE_MS = 120_000;

/** How old the board's data is, and whether that is too old to trust. */
export function boardFreshness(
  lastUpdated: Time | undefined,
  now: Time,
  staleAfterMs: number = DEFAULT_ANDON_STALE_MS,
): { stale: boolean; ageMs: number | null } {
  if (lastUpdated === undefined) return { stale: false, ageMs: null };
  const ageMs = Math.max(0, ms(now) - ms(lastUpdated));
  return { stale: ageMs > staleAfterMs, ageMs };
}
