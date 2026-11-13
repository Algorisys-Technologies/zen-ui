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

const ratio = (num: number, den: number): number | null =>
  Number.isFinite(num) && Number.isFinite(den) && den > 0 && num >= 0 ? num / den : null;

export function oeeFromCounts(i: OeeInputs): OeeResult {
  const hasCycle = i.idealCycleTime > 0;
  return {
    availability: ratio(i.runTime, i.plannedTime),
    performance: hasCycle ? ratio(i.idealCycleTime * i.totalCount, i.runTime) : null,
    quality: ratio(i.goodCount, i.totalCount),
    oee: hasCycle ? ratio(i.goodCount * i.idealCycleTime, i.plannedTime) : null,
  };
}

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
export const DEFAULT_OEE_BANDS: OeeBands = { fair: 0.65, good: 0.85 };

/** A boundary belongs to the band above it. */
export function oeeBand(value: number | null, bands: OeeBands = DEFAULT_OEE_BANDS): OeeBand | null {
  if (value === null || !Number.isFinite(value)) return null;
  if (value >= bands.good) return "good";
  if (value >= bands.fair) return "fair";
  return "poor";
}

/**
 * Where a value sits on a half-circle gauge, in degrees from 12 o'clock
 * (clockwise positive, the convention of chart.ts's `polarPoint` / `arcPath`):
 * 0 → -90° (9 o'clock), 1 → 90° (3 o'clock). Clamped, because the arc cannot
 * go past its ends — the gauge prints the real number beside it.
 */
export function gaugeAngle(value: number): number {
  const v = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
  return -90 + 180 * v;
}
