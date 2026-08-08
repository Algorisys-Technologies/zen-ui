/**
 * Semantic date ranges — "Last 7 Days", "This Quarter", "Year to Date".
 *
 * Framework-agnostic, so React and Solid cannot disagree about what "This
 * Quarter" means. This is pure logic with no rendering, and a copy per binding
 * is how the two drift — the same argument as mask.ts and color.ts.
 *
 * The point of this module is that the VALUE IS THE QUESTION, NOT THE ANSWER.
 * A DateRangePicker stores what a user picked: two concrete dates. Store that
 * for "Last 7 Days" and you have stored the wrong thing — a saved filter would
 * mean the seven days that were last when it was SAVED, and would keep meaning
 * them forever. So the value here is `{ operator: "LAST_DAYS", count: 7 }`, and
 * it resolves to concrete dates at the moment you ask.
 *
 * That is also why every value is a plain JSON object of strings and numbers
 * rather than Dates: it has to survive being written to a saved filter variant,
 * a URL or a database and read back. `JSON.parse(JSON.stringify(value))` is
 * the same value here; do that to a Date and you get a string back.
 *
 * `now` is always injected, never read from the clock inside a resolver. It
 * makes every function pure and testable, and it is what lets scripts/
 * check-date-range.ts assert "This Quarter" against a fixed date instead of
 * against whenever the check happened to run.
 */
/** The concrete answer. Matches the DateRange both bindings already use. */
export interface ResolvedRange {
    from?: Date;
    to?: Date;
}
/** Operators that take no argument. */
export type FixedOperator = "TODAY" | "YESTERDAY" | "TOMORROW" | "THIS_WEEK" | "LAST_WEEK" | "NEXT_WEEK" | "THIS_MONTH" | "LAST_MONTH" | "NEXT_MONTH" | "THIS_QUARTER" | "LAST_QUARTER" | "NEXT_QUARTER" | "THIS_YEAR" | "LAST_YEAR" | "NEXT_YEAR" | "MONTH_TO_DATE" | "QUARTER_TO_DATE" | "YEAR_TO_DATE";
/** Operators that take a count: "Last 7 days", "Next 3 months". */
export type CountOperator = "LAST_DAYS" | "NEXT_DAYS" | "LAST_WEEKS" | "NEXT_WEEKS" | "LAST_MONTHS" | "NEXT_MONTHS" | "LAST_QUARTERS" | "NEXT_QUARTERS" | "LAST_YEARS" | "NEXT_YEARS";
/** Operators that take one date. */
export type DateOperator = "DATE" | "FROM" | "TO";
export type DateRangeOperator = FixedOperator | CountOperator | DateOperator | "BETWEEN";
/**
 * A semantic range. Serialisable by construction — dates are ISO `yyyy-mm-dd`
 * strings, never Date objects.
 */
export type DateRangeValue = {
    operator: FixedOperator;
} | {
    operator: CountOperator;
    count: number;
    /**
     * Whether the current, incomplete period counts. Default false.
     *
     * "Last 7 days" ends YESTERDAY by default, because every other LAST_*
     * here means completed periods — LAST_WEEK is the previous whole week,
     * not a week ending today. One rule, applied everywhere.
     *
     * That is defensible but it is not what every dashboard wants, and a
     * silently-off-by-one date filter is the kind of bug nobody notices for
     * a quarter. So it is a flag rather than a decision made for you.
     */
    includeCurrent?: boolean;
} | {
    operator: DateOperator;
    date: string;
} | {
    operator: "BETWEEN";
    from: string;
    to: string;
};
export interface ResolveOptions {
    /** 0 = Sunday. Default 0, which is what both bindings' calendars draw. */
    weekStartsOn?: number;
}
/**
 * Parse `yyyy-mm-dd` as a LOCAL date.
 *
 * `new Date("2026-07-15")` is not this: the spec parses a bare date as UTC, so
 * anywhere west of Greenwich it is the 14th by the time you read getDate().
 * That is a real off-by-one-day bug and it only appears for half the planet,
 * which is why it survives review.
 */
export declare const parseISODate: (s: string) => Date | null;
/** Format a Date as local `yyyy-mm-dd`. Not toISOString, for the reason above. */
export declare const toISODate: (d: Date) => string;
/**
 * Turn a semantic value into concrete dates, as of `now`.
 *
 * Returns `{}` for a value that cannot be resolved (an unparseable date, an
 * unknown operator) rather than throwing: this runs on every render of a
 * filter bar, and a half-typed date is a normal state, not an exception.
 */
export declare const resolveDateRange: (value: DateRangeValue | null | undefined, now?: Date, options?: ResolveOptions) => ResolvedRange;
/** What extra input an operator needs. Drives which control the picker shows. */
export type OperatorArity = "none" | "count" | "date" | "range";
export interface OperatorMeta {
    operator: DateRangeOperator;
    label: string;
    arity: OperatorArity;
    /** For grouping in the UI. */
    group: "Day" | "Week" | "Month" | "Quarter" | "Year" | "Rolling" | "Fixed";
    /** Singular/plural noun for a count operator's label: "7 days". */
    unit?: string;
}
export declare const DATE_RANGE_OPERATORS: OperatorMeta[];
export declare const operatorMeta: (op: DateRangeOperator) => OperatorMeta | undefined;
export declare const isCountOperator: (op: string) => op is CountOperator;
export declare const isFixedOperator: (op: string) => op is FixedOperator;
/**
 * The human name for a value: "Last 7 days", "Between 1 Jul and 14 Jul".
 *
 * This is what the trigger shows, and it names the QUESTION rather than the
 * answer — a control that reads "1 Jul – 7 Jul" when the user chose "Last 7
 * days" has thrown away the only thing that made the choice meaningful.
 */
export declare const formatDateRangeValue: (value: DateRangeValue | null | undefined, formatDate?: (d: Date) => string) => string;
