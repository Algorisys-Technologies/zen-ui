import * as React from "react";
import { type RateBucketsInput } from "../../_core/rate-bars";
import type { CountPoint } from "../../_core/planned-vs-actual";
/**
 * RateBars — output in equal time buckets, each bar coloured by what the
 * machine was doing.
 *
 *   <RateBars
 *     readings={counter} segments={stateRecord}
 *     from={hourAgo} to={now} bucketMs={2 * 60_000}
 *     target={300} unit="pcs"
 *   />
 *
 * A dip reads at a glance: a short green bar ran slow, a red stub stopped.
 * Every bar keeps a 3px stub in its state colour, so a bucket that made
 * nothing still says why. The bucket that contains now is still filling — it is
 * drawn hatched and its rate is over the elapsed part only, so it never reads
 * as a sudden collapse.
 *
 * The figures above the bars — the rate now (the last complete bucket), the
 * average, the target — are the accessible summary; the bars repeat them.
 */
export type RateBarsProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
    readings: CountPoint[];
    segments?: RateBucketsInput["segments"];
    from: Date | number;
    to: Date | number;
    /** Bucket width. Default 2 minutes. */
    bucketMs?: number;
    /** Defaults to a clock that advances every 15 s. */
    now?: Date | number;
    /** Per hour, drawn as a line. */
    target?: number;
    /** Appended to rates ("pcs"). */
    unit?: string;
    timeZone?: string;
};
declare const RateBars: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
    readings: CountPoint[];
    segments?: RateBucketsInput["segments"];
    from: Date | number;
    to: Date | number;
    /** Bucket width. Default 2 minutes. */
    bucketMs?: number;
    /** Defaults to a clock that advances every 15 s. */
    now?: Date | number;
    /** Per hour, drawn as a line. */
    target?: number;
    /** Appended to rates ("pcs"). */
    unit?: string;
    timeZone?: string;
} & React.RefAttributes<HTMLDivElement>>;
export { RateBars };
//# sourceMappingURL=rate-bars.d.ts.map