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

const has = (n: number | undefined): n is number => typeof n === "number" && Number.isFinite(n);
// Tolerance for "on the limit": a few ulps at the size of the numbers involved.
const eps = (...ns: number[]) => 1e-9 * Math.max(1, ...ns.map(Math.abs));

export function judgeMeasurement(value: number | null, spec: MeasurementSpec): MeasurementJudgement {
  const none: MeasurementJudgement = { verdict: null, side: null, deviation: null };
  if (value === null || !Number.isFinite(value)) return none;
  const { lower, upper, warnLower, warnUpper, nominal } = spec;
  if (!has(lower) && !has(upper)) return none;
  if (has(lower) && has(upper) && lower > upper) return none;
  const deviation = has(nominal) ? value - nominal : null;
  const below = (limit: number) => value < limit - eps(value, limit);
  const above = (limit: number) => value > limit + eps(value, limit);
  if (has(lower) && below(lower)) return { verdict: "fail", side: "low", deviation };
  if (has(upper) && above(upper)) return { verdict: "fail", side: "high", deviation };
  if (has(warnLower) && below(warnLower)) return { verdict: "warn", side: "low", deviation };
  if (has(warnUpper) && above(warnUpper)) return { verdict: "warn", side: "high", deviation };
  return { verdict: "pass", side: null, deviation };
}

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
export function measurementScale(spec: MeasurementSpec, value: number | null): MeasurementScale {
  const points = [spec.lower, spec.upper, spec.nominal, spec.warnLower, spec.warnUpper].filter(has);
  const empty: MeasurementScale = {
    min: 0, max: 0, lower: null, upper: null, nominal: null, warnLower: null, warnUpper: null, value: null, offScale: false,
  };
  if (points.length === 0) return empty;
  let lo = Math.min(...points);
  let hi = Math.max(...points);
  // A single point (a minimum alone) has no span: take one from the reading,
  // or from the point's own size.
  let pad = (hi - lo) / 4;
  if (pad === 0) {
    const ref = value !== null && Number.isFinite(value) && value !== lo ? Math.abs(value - lo) * 2 : Math.abs(lo) * 0.1 || 1;
    pad = ref;
  }
  lo -= pad;
  hi += pad;
  const at = (n: number | undefined) => (has(n) ? (n - lo) / (hi - lo) : null);
  let v: number | null = null;
  let offScale = false;
  if (value !== null && Number.isFinite(value)) {
    const raw = (value - lo) / (hi - lo);
    offScale = raw < 0 || raw > 1;
    v = Math.min(1, Math.max(0, raw));
  }
  return {
    min: lo,
    max: hi,
    lower: at(spec.lower),
    upper: at(spec.upper),
    nominal: at(spec.nominal),
    warnLower: at(spec.warnLower),
    warnUpper: at(spec.warnUpper),
    value: v,
    offScale,
  };
}
