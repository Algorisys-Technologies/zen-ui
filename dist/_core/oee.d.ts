/**
 * OEE — Overall Equipment Effectiveness, the pure half of OeeGauge.
 *
 *   bun run check:oee
 *
 *   Availability = run time ÷ planned time
 *   Performance  = (ideal cycle time × total count) ÷ run time
 *   Quality      = good count ÷ total count
 *   OEE          = good count × ideal cycle time ÷ planned time
 *
 * OEE is computed directly rather than as A × P × Q. The two are the same
 * number wherever all three factors exist, but a machine that never ran has an
 * OEE (zero) and no Performance, and the product would be NaN.
 *
 * A factor that cannot be computed is `null` — never NaN, never 0. Nothing is
 * clamped: Performance over 100% means the ideal cycle time is wrong, and good
 * over total means a counter is; both are the reader's to see.
 *
 * Every time is in one unit of the caller's choosing (minutes, seconds); only
 * the ratios matter.
 */
export interface OeeInputs {
    /** Time the machine was scheduled to produce. */
    plannedTime: number;
    /** Of that, the time it actually ran. */
    runTime: number;
    /** The fastest one part can be made, in the same unit. */
    idealCycleTime: number;
    totalCount: number;
    goodCount: number;
}
/** Each factor as a fraction (0.85, not 85), or null when it cannot be computed. */
export interface OeeFactors {
    availability: number | null;
    performance: number | null;
    quality: number | null;
}
export interface OeeResult extends OeeFactors {
    oee: number | null;
}
export declare function oeeFromCounts(i: OeeInputs): OeeResult;
export type OeeBand = "poor" | "fair" | "good";
/** Where "fair" and "good" start, as fractions. */
export interface OeeBands {
    fair: number;
    good: number;
}
/**
 * 85% is the figure usually quoted as world-class and 65% as typical; they are
 * defaults, not a standard. Pass a plant's own.
 */
export declare const DEFAULT_OEE_BANDS: OeeBands;
/** A boundary belongs to the band above it. */
export declare function oeeBand(value: number | null, bands?: OeeBands): OeeBand | null;
/**
 * Where a value sits on a half-circle gauge, in degrees from 12 o'clock
 * (clockwise positive, the convention of chart.ts's `polarPoint` / `arcPath`):
 * 0 → -90° (9 o'clock), 1 → 90° (3 o'clock). Clamped, because the arc cannot
 * go past its ends — the gauge prints the real number beside it.
 */
export declare function gaugeAngle(value: number): number;
