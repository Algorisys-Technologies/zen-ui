/**
 * Production progress — the pure half of ProductionProgress.
 *
 *   bun run check:production-progress
 *
 * A work order's good and scrap counts against its target. Scrap does not count
 * toward the target; over-production is reported rather than clamped; the two
 * bar fractions are scaled down together when they would overflow, so scrap
 * stays visible beside good.
 */
export interface ProductionCounts {
    target: number;
    good: number;
    scrap?: number;
}
export interface ProductionProgressResult {
    target: number;
    good: number;
    scrap: number;
    /** Good still needed; never negative. */
    remaining: number;
    /** Good beyond the target. */
    over: number;
    done: boolean;
    /** Anything made at all, good or scrap. */
    started: boolean;
    /** Fractions of the bar, summing to at most 1. */
    goodFraction: number;
    scrapFraction: number;
}
export declare function productionProgress(c: ProductionCounts): ProductionProgressResult;
/** How full each of `segments` units of `perSegment` is, for `value` made: 1, a partial fraction, or 0. */
export declare function segmentFill(value: number, perSegment: number, segments: number): number[];
