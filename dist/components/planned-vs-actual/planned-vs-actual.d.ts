import * as React from "react";
import { type CountPoint } from "../../_core/planned-vs-actual";
/**
 * PlannedVsActual — pieces made this shift against the plan.
 *
 *   <PlannedVsActual
 *     start={shift.start} end={shift.end}
 *     planTotal={2000}                 // or plan={[{ at, value }, …]} with breaks
 *     actual={counterReadings}          // cumulative readings
 *     unit="pcs" timeZone="Asia/Kolkata"
 *   />
 *
 * The headline is the gap in words — "304 pcs behind plan" — with what was
 * made against what was planned so far, and, once 15% of the shift has run,
 * where the pace so far will end up. Under it a chart: the plan dashed over
 * the whole shift, the actual as steps up to now (a counter reading holds until
 * the next one; nothing is drawn after now), and the gap marked at now.
 *
 * "On plan" within `tolerance` of the plan total (default 2%), so one piece
 * does not flip the headline. After the shift ends the figures are final.
 * The chart is drawn in plain SVG — no chart library to load for a board.
 */
export type PlannedVsActualProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
    start: Date | number;
    end: Date | number;
    /** Defaults to a clock that advances every 30 s. */
    now?: Date | number;
    plan?: CountPoint[];
    planTotal?: number;
    actual: CountPoint[];
    /** Appended to counts ("pcs", "kg"). */
    unit?: string;
    /** "On plan" within this fraction of the plan total. Default 0.02. */
    tolerance?: number;
    /** IANA zone the time axis reads in. */
    timeZone?: string;
    /** Hide the chart, keeping the figures (a tile, a table cell). */
    hideChart?: boolean;
};
declare const PlannedVsActual: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
    start: Date | number;
    end: Date | number;
    /** Defaults to a clock that advances every 30 s. */
    now?: Date | number;
    plan?: CountPoint[];
    planTotal?: number;
    actual: CountPoint[];
    /** Appended to counts ("pcs", "kg"). */
    unit?: string;
    /** "On plan" within this fraction of the plan total. Default 0.02. */
    tolerance?: number;
    /** IANA zone the time axis reads in. */
    timeZone?: string;
    /** Hide the chart, keeping the figures (a tile, a table cell). */
    hideChart?: boolean;
} & React.RefAttributes<HTMLDivElement>>;
export { PlannedVsActual };
//# sourceMappingURL=planned-vs-actual.d.ts.map