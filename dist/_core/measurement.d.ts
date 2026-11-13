/**
 * Measurement — the pure half of MeasurementInput.
 *
 *   bun run check:measurement
 *
 * A reading against its limits: inclusive limits with a floating-point
 * allowance, one-sided specs, an optional warning band inside the limits, and
 * a scale drawn from the limits (a typo of 1000 is pinned and marked
 * off-scale, not allowed to squash the tolerance band to nothing).
 */
export interface MeasurementSpec {
    nominal?: number;
    lower?: number;
    upper?: number;
    /** A warning band inside the limits: passing, but drifting toward a limit. */
    warnLower?: number;
    warnUpper?: number;
}
export type MeasurementVerdict = "pass" | "warn" | "fail";
export interface MeasurementJudgement {
    verdict: MeasurementVerdict | null;
    side: "low" | "high" | null;
    /** Reading minus nominal; null without a nominal. */
    deviation: number | null;
}
export declare function judgeMeasurement(value: number | null, spec: MeasurementSpec): MeasurementJudgement;
export interface MeasurementScale {
    min: number;
    max: number;
    /** Positions as fractions 0..1 of the scale; null when absent. */
    lower: number | null;
    upper: number | null;
    nominal: number | null;
    warnLower: number | null;
    warnUpper: number | null;
    value: number | null;
    /** The reading lies beyond the scale and is pinned to its end. */
    offScale: boolean;
}
/** A scale built from the spec's own points, padded a quarter of their span each side. */
export declare function measurementScale(spec: MeasurementSpec, value: number | null): MeasurementScale;
