/**
 * Rate bars — the pure half of RateBars.
 *
 *   bun run check:rate-bars
 *
 * Output in equal buckets over a window. A bucket (start, end] counts the
 * counter's rise across it — readings are step values; a reading that goes
 * DOWN is a counter reset, and counts from zero rather than as negative output.
 * Each bucket takes the machine state that covered most of it ("unknown" with
 * none). The bucket containing now is partial: its rate is over the elapsed
 * part only, and it is flagged. Nothing is produced after now.
 */
import { type MachineState } from "./machine-state";
import type { CountPoint } from "./planned-vs-actual";
type Time = number | Date;
export interface RateBucket {
    start: number;
    end: number;
    count: number;
    /** Output per hour over the time the bucket covers (elapsed only, if partial). */
    perHour: number;
    state: MachineState;
    /** Contains now: still filling. */
    partial: boolean;
}
export interface RateBucketsInput {
    readings: CountPoint[];
    segments?: {
        state: MachineState;
        start: Time;
        end?: Time | null;
    }[];
    from: Time;
    to: Time;
    bucketMs: number;
    now: Time;
}
export declare function rateBuckets(i: RateBucketsInput): RateBucket[];
export {};
