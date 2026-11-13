/**
 * DataTable per-column filters: what a filter value means, and how a chip
 * describes it. Pure, so the hand-written vanilla grid shares React's and
 * Solid's semantics instead of keeping a third copy (they still carry theirs
 * as TanStack FilterFns in filters.tsx; this is the same logic, value for
 * value, and the check pins it).
 *
 *   bun run check:column-filter
 *
 * A filter is "pass everything" when it is empty: no value, an empty string,
 * a range with neither end, "any". That is what lets a filter row of blank
 * inputs leave every row in.
 */
/** `meta.filterVariant`: which input a column's filter cell shows. Default text. */
export type FilterVariant = "text" | "number" | "numberRange" | "select" | "boolean";
export type TextOp = "contains" | "equals" | "starts" | "ends";
export interface TextFilterValue {
    op: TextOp;
    value: string;
}
export type NumberOp = "eq" | "ne" | "gt" | "lt" | "gte" | "lte";
export interface NumberFilterValue {
    op: NumberOp;
    value: number | null;
}
export type NumberRangeFilterValue = [number | null, number | null];
/** The operator selects' options: the message key that names each, and its symbol. */
export declare const TEXT_FILTER_OPS: readonly {
    value: TextOp;
    label: string;
    symbol: string;
}[];
export declare const NUMBER_FILTER_OPS: readonly {
    value: NumberOp;
    label: string;
    symbol: string;
}[];
/** Does `cell` pass `filter` for a column of this variant? */
export declare function columnFilterMatches(variant: FilterVariant | undefined, cell: unknown, filter: unknown): boolean;
/** True when a filter value filters nothing (its chip is not shown). */
export declare const isEmptyColumnFilter: (value: unknown) => boolean;
/**
 * A filter value as a chip shows it: "≥ 60000", "60000 – 200000", "≈ ada",
 * "Admin", "Yes". Empty for a value that filters nothing. `yes` / `no` are the
 * caller's words for a boolean filter.
 */
export declare function describeColumnFilter(value: unknown, words?: {
    yes: string;
    no: string;
}): string;
