/**
 * State timeline — a machine's state record laid out on a window of time.
 * The pure half of StateTimeline.
 *
 *   bun run check:state-timeline
 *
 * Rules, each of which a shop-floor screen has got wrong somewhere:
 *
 *  - Positions are true to duration, as fractions of the window. A 40-second
 *    stop in a shift stays 0.14% wide; rounding it away hides exactly the short
 *    stops that add up to a bad shift.
 *  - A hole in the record becomes an explicit `unknown` segment (`gap: true`),
 *    never absorbed by its neighbours. A dead collector must read as "nothing
 *    known", not as an hour of running.
 *  - The future is empty. An open segment (`end` null) runs to `now`, and
 *    nothing — not even "no data" — is laid out after `now`.
 *  - Overlapping records do not stack: the later start cuts the earlier short.
 *
 * Times are epoch milliseconds or Dates. Fractions (`left`, `width`) are of the
 * whole window, 0..1.
 */
import { type MachineState, type MachineStateTone } from "./machine-state";
import type { MessageKey } from "./messages";
type Time = Date | number;
export interface StateSegmentInput {
    /** Kept on the laid-out segment, so a click can be traced back to the record. */
    id?: string;
    state: MachineState;
    /** Overrides the state's own tone. */
    tone?: MachineStateTone;
    /** A cause or note ("Jam at infeed"); shown instead of the state's name. */
    label?: string;
    start: Time;
    /** null or omitted: still going — runs to `now`. */
    end?: Time | null;
}
export interface StateTimelineWindow {
    from: Time;
    to: Time;
    /** Defaults to the current time. Nothing is laid out after it. */
    now?: Time;
}
export interface StateSegment {
    id: string;
    state: MachineState;
    tone: MachineStateTone;
    label?: string;
    /** Clipped to the window and to now. */
    start: number;
    end: number;
    durationMs: number;
    /** Fractions of the window. */
    left: number;
    width: number;
    /** A hole in the record, filled as no data. */
    gap: boolean;
    /** Still going: its end is `now`, not a recorded end. */
    open: boolean;
}
export declare function layoutStateTimeline(segments: StateSegmentInput[], window: StateTimelineWindow): StateSegment[];
/** Time per state, in vocabulary order, states with none left out. */
export declare function stateTimelineTotals(segments: StateSegment[]): {
    state: MachineState;
    ms: number;
}[];
export interface TimelineEventInput {
    id: string;
    at: Time;
    /** What happened ("Batch 2 started"). */
    label: string;
}
export interface TimelineEvent {
    id: string;
    at: number;
    label: string;
    left: number;
}
/** Events inside the window, in time order, placed by fraction. */
export declare function layoutTimelineEvents(events: TimelineEventInput[], window: StateTimelineWindow): TimelineEvent[];
export interface TimelineTicks {
    stepMs: number;
    ticks: {
        at: number;
        left: number;
    }[];
}
/**
 * Round times along a window: the smallest step from 1 min to 24 h that leaves
 * at most `maxTicks` intervals, aligned to round times in `timeZone` (an IANA
 * name; undefined is the browser's). Both ends are included when they fall on a
 * boundary. A DST change inside the window shifts the labels after it by the
 * change — the ticks stay evenly spaced, which is what a time axis needs.
 */
export declare function timelineTicks(from: Time, to: Time, options?: {
    maxTicks?: number;
    timeZone?: string;
}): TimelineTicks;
/**
 * Which catalogue message says a duration, and with what values: "42s",
 * "5m 10s", "25m", "1h 12m", "4h". Seconds stop mattering past an hour.
 */
export declare function durationMessage(durationMs: number): {
    key: MessageKey;
    values: Record<string, number>;
};
export {};
