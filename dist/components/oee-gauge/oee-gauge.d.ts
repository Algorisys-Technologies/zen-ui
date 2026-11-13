import * as React from "react";
import { type OeeBands, type OeeFactors } from "../../_core/oee";
/**
 * OeeGauge — OEE as a half-circle gauge, with its three factors underneath.
 *
 *   <OeeGauge value={0.724} />
 *   <OeeGauge value={r.oee} factors={r} />          // r = oeeFromCounts(...)
 *
 * Values are fractions (0.724, not 72.4). The number is always printed and the
 * band is always named in words ("Near target"): the arc's colour repeats them
 * and is never the only place they are. A value over 100% fills the arc and
 * prints as it is — Performance over 100% means the ideal cycle time is wrong,
 * and a gauge that clamped it would hide that.
 *
 * `null` is "no data": an empty track and a dash, never a 0, which would read as
 * the worst shift of the year for one nobody measured.
 */
export type OeeGaugeSize = "sm" | "md" | "lg";
export type OeeGaugeProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
    /** OEE as a fraction, or null when there is nothing to show. */
    value: number | null;
    /** Availability, Performance and Quality, listed under the gauge when given. */
    factors?: OeeFactors;
    /** Where "near" and "on target" start. Defaults to 65% and 85%. */
    bands?: OeeBands;
    /** Names the gauge, visibly and for assistive tech. Defaults to "OEE". */
    label?: string;
    size?: OeeGaugeSize;
};
export declare const OeeGauge: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
    /** OEE as a fraction, or null when there is nothing to show. */
    value: number | null;
    /** Availability, Performance and Quality, listed under the gauge when given. */
    factors?: OeeFactors;
    /** Where "near" and "on target" start. Defaults to 65% and 85%. */
    bands?: OeeBands;
    /** Names the gauge, visibly and for assistive tech. Defaults to "OEE". */
    label?: string;
    size?: OeeGaugeSize;
} & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=oee-gauge.d.ts.map