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

const count = (n: number | undefined) => (Number.isFinite(n) && (n as number) > 0 ? (n as number) : 0);

export function productionProgress(c: ProductionCounts): ProductionProgressResult {
  const target = count(c.target);
  const good = count(c.good);
  const scrap = count(c.scrap);
  let goodFraction = target > 0 ? good / target : 0;
  let scrapFraction = target > 0 ? scrap / target : 0;
  const sum = goodFraction + scrapFraction;
  if (sum > 1) {
    goodFraction /= sum;
    scrapFraction /= sum;
  }
  return {
    target,
    good,
    scrap,
    remaining: Math.max(0, target - good),
    over: Math.max(0, good - target),
    done: target > 0 && good >= target,
    started: good + scrap > 0,
    goodFraction,
    scrapFraction,
  };
}

/** How full each of `segments` units of `perSegment` is, for `value` made: 1, a partial fraction, or 0. */
export function segmentFill(value: number, perSegment: number, segments: number): number[] {
  const n = Math.max(0, Math.floor(count(segments)));
  const size = count(perSegment);
  const v = count(value);
  return Array.from({ length: n }, (_, i) => (size > 0 ? Math.min(1, Math.max(0, (v - i * size) / size)) : 0));
}
