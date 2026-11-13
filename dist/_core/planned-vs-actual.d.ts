/**
 * Planned vs actual — the pure half of PlannedVsActual.
 *
 *   bun run check:planned-vs-actual
 *
 * The plan is cumulative and linear between its points (`planTotal` spreads
 * evenly over the window). Actual counts are readings that hold until the next
 * one — never interpolated forward. "On plan" within a tolerance of the plan
 * total. No projection before 15% of the window has passed, and none once it
 * has ended (the result is then final, measured at the end).
 */
export interface CountPoint {
    at: number | Date;
    /** Cumulative pieces at that moment. */
    value: number;
}
export interface PlannedVsActualInput {
    start: number | Date;
    end: number | Date;
    now: number | Date;
    /** Cumulative plan points. Or `planTotal`, spread evenly. */
    plan?: CountPoint[];
    planTotal?: number;
    /** Cumulative counter readings. */
    actual: CountPoint[];
    /** "On plan" when the gap is within this fraction of the plan total. Default 0.02. */
    tolerance?: number;
}
export interface PlannedVsActualResult {
    /** The moment measured: now, or the end once it has passed. */
    at: number;
    planNow: number;
    actualNow: number;
    /** actual − plan: negative is behind. */
    gap: number;
    status: "ahead" | "on" | "behind";
    planTotal: number;
    /** Pieces by the end at the pace so far; null too early and once final. */
    projected: number | null;
    final: boolean;
}
/** Cumulative plan at t: 0 before the first point, linear between points, flat after the last. */
export declare function planAt(points: readonly CountPoint[], t: number): number;
/** The last reading at or before t; 0 before the first. */
export declare function readingAt(points: readonly CountPoint[], t: number): number;
export declare function plannedVsActual(i: PlannedVsActualInput): PlannedVsActualResult;
