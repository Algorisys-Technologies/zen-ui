/**
 * Line ETA — when the current order will finish, or why there is no answer.
 *
 *   bun run check:line-eta
 *
 * Done once good reaches the target. An ETA only while running with a rate: a
 * machine that is stopped, in setup, idle or in a planned stop gets no time —
 * a promise computed from a rate it is not producing at is one nobody can keep.
 * No data is unknown, not a guess.
 */
import type { MachineState } from "./machine-state";
export type LineEta = {
    kind: "eta";
    at: number;
} | {
    kind: "done";
} | {
    kind: "not-running";
} | {
    kind: "no-rate";
} | {
    kind: "unknown";
};
export declare function lineEta(i: {
    state: MachineState;
    target: number;
    good: number;
    perHour?: number;
    now: number | Date;
}): LineEta;
