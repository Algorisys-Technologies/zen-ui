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
import { type MachineState, type MachineStateTone } from "./machine-state";
type Time = Date | number;
/** Whether a tile in this state runs a clock (time in state). */
export declare function andonShowsClock(state: MachineState): boolean;
/** Who needs someone first. No data comes straight after down: a dead collector is trouble nobody sees. */
export declare const ANDON_TONE_ORDER: readonly MachineStateTone[];
export interface AndonSortable {
    state: MachineState;
    tone?: MachineStateTone;
    /** When the tile entered its current state. */
    since?: Time;
}
/** A sorted copy: by tone (ANDON_TONE_ORDER), then longest in state first; untimed tiles last within a tone. */
export declare function sortAndonTiles<T extends AndonSortable>(tiles: readonly T[]): T[];
export declare const DEFAULT_ANDON_STALE_MS = 120000;
/** How old the board's data is, and whether that is too old to trust. */
export declare function boardFreshness(lastUpdated: Time | undefined, now: Time, staleAfterMs?: number): {
    stale: boolean;
    ageMs: number | null;
};
export {};
