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

const ms = (t: number | Date) => (typeof t === "number" ? t : t.getTime());

/** Cumulative plan at t: 0 before the first point, linear between points, flat after the last. */
export function planAt(points: readonly CountPoint[], t: number): number {
  const p = [...points].map((x) => ({ at: ms(x.at), value: x.value })).sort((a, b) => a.at - b.at);
  if (p.length === 0) return 0;
  // Before the plan's first point nothing is planned yet.
  if (t < p[0].at) return 0;
  if (t === p[0].at) return p[0].value;
  for (let i = 1; i < p.length; i++) {
    if (t <= p[i].at) {
      const a = p[i - 1];
      const b = p[i];
      return b.at === a.at ? b.value : a.value + ((b.value - a.value) * (t - a.at)) / (b.at - a.at);
    }
  }
  return p[p.length - 1].value;
}

/** The last reading at or before t; 0 before the first. */
export function readingAt(points: readonly CountPoint[], t: number): number {
  let best: { at: number; value: number } | null = null;
  for (const x of points) {
    const at = ms(x.at);
    if (at <= t && (!best || at >= best.at)) best = { at, value: x.value };
  }
  return best?.value ?? 0;
}

export function plannedVsActual(i: PlannedVsActualInput): PlannedVsActualResult {
  const start = ms(i.start);
  const end = ms(i.end);
  const now = ms(i.now);
  const plan = i.plan ?? [
    { at: start, value: 0 },
    { at: end, value: i.planTotal ?? 0 },
  ];
  const planTotal = plan.length ? planAt(plan, Number.POSITIVE_INFINITY) : 0;
  const final = now >= end;
  const at = Math.min(Math.max(now, start), end);
  const planNow = end > start ? planAt(plan, at) : 0;
  const actualNow = readingAt(i.actual, at);
  const gap = actualNow - planNow;
  const tol = (i.tolerance ?? 0.02) * planTotal;
  const status = Math.abs(gap) <= tol ? "on" : gap > 0 ? "ahead" : "behind";
  const elapsed = at - start;
  const span = end - start;
  const projected =
    !final && span > 0 && elapsed >= span * 0.15 ? actualNow + (actualNow / elapsed) * (end - at) : null;
  return { at, planNow, actualNow, gap, status, planTotal, projected, final };
}
