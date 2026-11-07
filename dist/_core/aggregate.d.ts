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
export declare function decimalsOf(n: number): number;
/** The finite numbers among `values`, skipping empties (and anything that is not a number). */
export declare function numbersOf(values: readonly unknown[]): number[];
/**
 * The exact decimal sum of numbers: 0.1 + 0.2 is 0.3. Added as integers scaled
 * by the most decimal places among them (BigInt, so no size limit), then
 * converted back once.
 */
export declare function exactSum(numbers: readonly number[]): number;
/**
 * One aggregate over a column's values. sum and avg read numbers only; count
 * counts the non-empty values; min and max compare numbers, Dates or strings
 * (whichever the column holds) and return the value itself. Null when there is
 * nothing to aggregate (no values, or none of the right kind): an empty total
 * is blank, not 0.
 */
export declare function aggregate(values: readonly unknown[], kind: AggregateKind): unknown;
/** The decimal places to show a total at: the column's own (most among its values), capped; an average gets at least 2. */
export declare function totalPrecision(values: readonly unknown[], kind: AggregateKind, cap?: number): number;
