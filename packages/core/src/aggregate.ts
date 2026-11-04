/**
 * Column totals: the pure half of DataTable's `meta.aggregate`, shared by
 * every binding.
 *
 *   bun run check:aggregate
 *
 * An invoice's lines, a ledger, a report: each wants a total under its amount
 * column and a subtotal per group. Summing amounts as doubles drifts
 * (0.1 + 0.2 is 0.30000000000000004, and a ledger of thousands of lines
 * accumulates it), so a sum here is exact in decimal: values are added as
 * scaled integers at the most decimal places any of them has. Empty cells
 * (null, undefined, "", NaN) are skipped by every aggregate, so a blank rate
 * is not a zero rate in an average.
 */

export type AggregateKind = "sum" | "count" | "avg" | "min" | "max";

/** Decimal places in a number's shortest form: 1.25 -> 2, 3 -> 0, 1e-7 -> 7. */
export function decimalsOf(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const s = String(Math.abs(n));
  const e = s.indexOf("e");
  if (e >= 0) {
    const mant = s.slice(0, e);
    const exp = Number(s.slice(e + 1));
    const frac = mant.includes(".") ? mant.split(".")[1].length : 0;
    return Math.max(0, frac - exp);
  }
  return s.includes(".") ? s.split(".")[1].length : 0;
}

const isEmpty = (v: unknown) => v === null || v === undefined || v === "" || (typeof v === "number" && Number.isNaN(v));

/** The finite numbers among `values`, skipping empties (and anything that is not a number). */
export function numbersOf(values: readonly unknown[]): number[] {
  const out: number[] = [];
  for (const v of values) if (typeof v === "number" && Number.isFinite(v)) out.push(v);
  return out;
}

/**
 * The exact decimal sum of numbers: 0.1 + 0.2 is 0.3. Added as integers scaled
 * by the most decimal places among them (BigInt, so no size limit), then
 * converted back once.
 */
export function exactSum(numbers: readonly number[]): number {
  if (numbers.length === 0) return 0;
  // Beyond 1e21 toFixed switches to exponent form, and such sums have no cents to protect.
  if (numbers.some((n) => Math.abs(n) >= 1e21)) return numbers.reduce((a, b) => a + b, 0);
  const d = Math.min(20, Math.max(...numbers.map(decimalsOf)));
  let total = 0n;
  for (const n of numbers) total += BigInt(n.toFixed(d).replace(".", ""));
  if (d === 0) return Number(total);
  const neg = total < 0n;
  const digits = (neg ? -total : total).toString().padStart(d + 1, "0");
  return Number(`${neg ? "-" : ""}${digits.slice(0, -d)}.${digits.slice(-d)}`);
}

/** Comparable form for min / max: numbers, Dates (by time), and strings (ISO dates sort as strings). */
const rank = (v: unknown): number | string | null => {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v.getTime();
  if (typeof v === "string") return v === "" ? null : v;
  return null;
};

/**
 * One aggregate over a column's values. sum and avg read numbers only; count
 * counts the non-empty values; min and max compare numbers, Dates or strings
 * (whichever the column holds) and return the value itself. Null when there is
 * nothing to aggregate (no values, or none of the right kind): an empty total
 * is blank, not 0.
 */
export function aggregate(values: readonly unknown[], kind: AggregateKind): unknown {
  switch (kind) {
    case "count":
      return values.filter((v) => !isEmpty(v)).length;
    case "sum": {
      const ns = numbersOf(values);
      return ns.length ? exactSum(ns) : null;
    }
    case "avg": {
      const ns = numbersOf(values);
      return ns.length ? exactSum(ns) / ns.length : null;
    }
    case "min":
    case "max": {
      let best: unknown = null;
      let bestRank: number | string | null = null;
      for (const v of values) {
        const r = rank(v);
        if (r === null) continue;
        // Mixed kinds (numbers and strings in one column) compare within the first kind seen.
        if (bestRank !== null && typeof r !== typeof bestRank) continue;
        if (bestRank === null || (kind === "min" ? r < bestRank : r > bestRank)) {
          best = v;
          bestRank = r;
        }
      }
      return best;
    }
  }
}

/** The decimal places to show a total at: the column's own (most among its values), capped; an average gets at least 2. */
export function totalPrecision(values: readonly unknown[], kind: AggregateKind, cap = 6): number {
  if (kind === "count") return 0;
  const d = Math.min(cap, Math.max(0, ...numbersOf(values).map(decimalsOf)));
  return kind === "avg" ? Math.max(2, d) : d;
}
