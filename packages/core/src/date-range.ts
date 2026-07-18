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
export type FixedOperator =
  | "TODAY"
  | "YESTERDAY"
  | "TOMORROW"
  | "THIS_WEEK"
  | "LAST_WEEK"
  | "NEXT_WEEK"
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "NEXT_MONTH"
  | "THIS_QUARTER"
  | "LAST_QUARTER"
  | "NEXT_QUARTER"
  | "THIS_YEAR"
  | "LAST_YEAR"
  | "NEXT_YEAR"
  | "MONTH_TO_DATE"
  | "QUARTER_TO_DATE"
  | "YEAR_TO_DATE";

/** Operators that take a count: "Last 7 days", "Next 3 months". */
export type CountOperator =
  | "LAST_DAYS"
  | "NEXT_DAYS"
  | "LAST_WEEKS"
  | "NEXT_WEEKS"
  | "LAST_MONTHS"
  | "NEXT_MONTHS"
  | "LAST_QUARTERS"
  | "NEXT_QUARTERS"
  | "LAST_YEARS"
  | "NEXT_YEARS";

/** Operators that take one date. */
export type DateOperator = "DATE" | "FROM" | "TO";

export type DateRangeOperator = FixedOperator | CountOperator | DateOperator | "BETWEEN";

/**
 * A semantic range. Serialisable by construction — dates are ISO `yyyy-mm-dd`
 * strings, never Date objects.
 */
export type DateRangeValue =
  | { operator: FixedOperator }
  | {
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
    }
  | { operator: DateOperator; date: string }
  | { operator: "BETWEEN"; from: string; to: string };

export interface ResolveOptions {
  /** 0 = Sunday. Default 0, which is what both bindings' calendars draw. */
  weekStartsOn?: number;
}

// ---------------------------------------------------------------------------
// day boundaries
// ---------------------------------------------------------------------------

/**
 * Local midnight. Constructed from the parts rather than by zeroing a clone,
 * because setHours on a DST boundary can land on an hour that does not exist.
 */
const startOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * The last millisecond of the day, NOT the next midnight.
 *
 * This is the difference between a filter that includes its final day and one
 * that silently drops it: `to = midnight` excludes everything that happened
 * during the day it names, which is never what "through the 14th" means.
 */
const endOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

const addDays = (d: Date, n: number): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const startOfWeek = (d: Date, weekStartsOn: number): Date => {
  const diff = (d.getDay() - weekStartsOn + 7) % 7;
  return addDays(startOfDay(d), -diff);
};

const startOfMonth = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date): Date => endOfDay(new Date(d.getFullYear(), d.getMonth() + 1, 0));

/** Quarters are 0-3; month 0-2 is Q1. */
const quarterOf = (d: Date): number => Math.floor(d.getMonth() / 3);
const startOfQuarter = (d: Date): Date => new Date(d.getFullYear(), quarterOf(d) * 3, 1);
const endOfQuarter = (d: Date): Date =>
  endOfDay(new Date(d.getFullYear(), quarterOf(d) * 3 + 3, 0));
const addQuarters = (d: Date, n: number): Date => new Date(d.getFullYear(), d.getMonth() + n * 3, 1);

const startOfYear = (d: Date): Date => new Date(d.getFullYear(), 0, 1);
const endOfYear = (d: Date): Date => endOfDay(new Date(d.getFullYear(), 11, 31));

// ---------------------------------------------------------------------------
// ISO date strings
// ---------------------------------------------------------------------------

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parse `yyyy-mm-dd` as a LOCAL date.
 *
 * `new Date("2026-07-15")` is not this: the spec parses a bare date as UTC, so
 * anywhere west of Greenwich it is the 14th by the time you read getDate().
 * That is a real off-by-one-day bug and it only appears for half the planet,
 * which is why it survives review.
 */
export const parseISODate = (s: string): Date | null => {
  const m = ISO.exec(s);
  if (!m) return null;
  const [, y, mo, d] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d));
  // Rejects 2026-02-31, which Date would happily roll into March.
  if (date.getMonth() !== Number(mo) - 1 || date.getDate() !== Number(d)) return null;
  return date;
};

/** Format a Date as local `yyyy-mm-dd`. Not toISOString, for the reason above. */
export const toISODate = (d: Date): string => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

// ---------------------------------------------------------------------------
// resolve
// ---------------------------------------------------------------------------

const fixed = (op: FixedOperator, now: Date, weekStartsOn: number): ResolvedRange => {
  const today = startOfDay(now);
  switch (op) {
    case "TODAY":
      return { from: today, to: endOfDay(now) };
    case "YESTERDAY":
      return { from: addDays(today, -1), to: endOfDay(addDays(today, -1)) };
    case "TOMORROW":
      return { from: addDays(today, 1), to: endOfDay(addDays(today, 1)) };

    case "THIS_WEEK": {
      const s = startOfWeek(now, weekStartsOn);
      return { from: s, to: endOfDay(addDays(s, 6)) };
    }
    case "LAST_WEEK": {
      const s = addDays(startOfWeek(now, weekStartsOn), -7);
      return { from: s, to: endOfDay(addDays(s, 6)) };
    }
    case "NEXT_WEEK": {
      const s = addDays(startOfWeek(now, weekStartsOn), 7);
      return { from: s, to: endOfDay(addDays(s, 6)) };
    }

    case "THIS_MONTH":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "LAST_MONTH": {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return { from: startOfMonth(d), to: endOfMonth(d) };
    }
    case "NEXT_MONTH": {
      const d = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return { from: startOfMonth(d), to: endOfMonth(d) };
    }

    case "THIS_QUARTER":
      return { from: startOfQuarter(now), to: endOfQuarter(now) };
    case "LAST_QUARTER": {
      const d = addQuarters(startOfQuarter(now), -1);
      return { from: startOfQuarter(d), to: endOfQuarter(d) };
    }
    case "NEXT_QUARTER": {
      const d = addQuarters(startOfQuarter(now), 1);
      return { from: startOfQuarter(d), to: endOfQuarter(d) };
    }

    case "THIS_YEAR":
      return { from: startOfYear(now), to: endOfYear(now) };
    case "LAST_YEAR": {
      const d = new Date(now.getFullYear() - 1, 0, 1);
      return { from: startOfYear(d), to: endOfYear(d) };
    }
    case "NEXT_YEAR": {
      const d = new Date(now.getFullYear() + 1, 0, 1);
      return { from: startOfYear(d), to: endOfYear(d) };
    }

    // The *_TO_DATE family is the answer to "but I wanted today included":
    // period start through now, explicitly.
    case "MONTH_TO_DATE":
      return { from: startOfMonth(now), to: endOfDay(now) };
    case "QUARTER_TO_DATE":
      return { from: startOfQuarter(now), to: endOfDay(now) };
    case "YEAR_TO_DATE":
      return { from: startOfYear(now), to: endOfDay(now) };
  }
};

const counted = (
  op: CountOperator,
  count: number,
  includeCurrent: boolean,
  now: Date,
  weekStartsOn: number,
): ResolvedRange => {
  // A negative or fractional count is a caller bug, not a range. Clamping to a
  // whole number >= 0 keeps it from silently inverting from/to.
  const n = Math.max(0, Math.floor(count));
  const today = startOfDay(now);
  const back = op.startsWith("LAST");

  switch (op) {
    case "LAST_DAYS": {
      // Ends yesterday unless the current day is included. n days INCLUSIVE of
      // the end, so LAST_DAYS(1) is exactly yesterday.
      const end = includeCurrent ? today : addDays(today, -1);
      return { from: addDays(end, -(n - 1)), to: endOfDay(end) };
    }
    case "NEXT_DAYS": {
      const start = includeCurrent ? today : addDays(today, 1);
      return { from: start, to: endOfDay(addDays(start, n - 1)) };
    }

    case "LAST_WEEKS":
    case "NEXT_WEEKS": {
      const thisWeek = startOfWeek(now, weekStartsOn);
      if (back) {
        const from = addDays(thisWeek, -7 * n);
        const to = includeCurrent ? endOfDay(addDays(thisWeek, 6)) : endOfDay(addDays(thisWeek, -1));
        return { from, to };
      }
      const from = includeCurrent ? thisWeek : addDays(thisWeek, 7);
      const to = endOfDay(addDays(addDays(thisWeek, 7 * n), 6));
      return { from, to };
    }

    case "LAST_MONTHS":
    case "NEXT_MONTHS": {
      const thisMonth = startOfMonth(now);
      if (back) {
        const from = new Date(now.getFullYear(), now.getMonth() - n, 1);
        const to = includeCurrent ? endOfMonth(now) : endOfDay(addDays(thisMonth, -1));
        return { from, to };
      }
      const from = includeCurrent ? thisMonth : new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const to = endOfMonth(new Date(now.getFullYear(), now.getMonth() + n, 1));
      return { from, to };
    }

    case "LAST_QUARTERS":
    case "NEXT_QUARTERS": {
      const thisQ = startOfQuarter(now);
      if (back) {
        const from = addQuarters(thisQ, -n);
        const to = includeCurrent ? endOfQuarter(now) : endOfDay(addDays(thisQ, -1));
        return { from, to };
      }
      const from = includeCurrent ? thisQ : addQuarters(thisQ, 1);
      const to = endOfQuarter(addQuarters(thisQ, n));
      return { from, to };
    }

    case "LAST_YEARS":
    case "NEXT_YEARS": {
      const thisY = startOfYear(now);
      if (back) {
        const from = new Date(now.getFullYear() - n, 0, 1);
        const to = includeCurrent ? endOfYear(now) : endOfDay(addDays(thisY, -1));
        return { from, to };
      }
      const from = includeCurrent ? thisY : new Date(now.getFullYear() + 1, 0, 1);
      const to = endOfYear(new Date(now.getFullYear() + n, 0, 1));
      return { from, to };
    }
  }
};

/**
 * Turn a semantic value into concrete dates, as of `now`.
 *
 * Returns `{}` for a value that cannot be resolved (an unparseable date, an
 * unknown operator) rather than throwing: this runs on every render of a
 * filter bar, and a half-typed date is a normal state, not an exception.
 */
export const resolveDateRange = (
  value: DateRangeValue | null | undefined,
  now: Date = new Date(),
  options: ResolveOptions = {},
): ResolvedRange => {
  if (!value) return {};
  const weekStartsOn = options.weekStartsOn ?? 0;

  switch (value.operator) {
    case "DATE": {
      const d = parseISODate(value.date);
      return d ? { from: startOfDay(d), to: endOfDay(d) } : {};
    }
    case "FROM": {
      const d = parseISODate(value.date);
      // Open-ended on purpose — "from the 1st" has no end, and inventing one
      // would quietly drop everything after it.
      return d ? { from: startOfDay(d) } : {};
    }
    case "TO": {
      const d = parseISODate(value.date);
      return d ? { to: endOfDay(d) } : {};
    }
    case "BETWEEN": {
      const a = parseISODate(value.from);
      const b = parseISODate(value.to);
      if (!a || !b) return {};
      // Picked backwards is a range, not an error.
      const [lo, hi] = a <= b ? [a, b] : [b, a];
      return { from: startOfDay(lo), to: endOfDay(hi) };
    }
    default: {
      if (isCountOperator(value.operator)) {
        const v = value as { operator: CountOperator; count: number; includeCurrent?: boolean };
        return counted(v.operator, v.count, v.includeCurrent ?? false, now, weekStartsOn);
      }
      if (isFixedOperator(value.operator)) return fixed(value.operator, now, weekStartsOn);
      return {};
    }
  }
};

// ---------------------------------------------------------------------------
// metadata — what a UI needs to build itself
// ---------------------------------------------------------------------------

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

export const DATE_RANGE_OPERATORS: OperatorMeta[] = [
  { operator: "TODAY", label: "Today", arity: "none", group: "Day" },
  { operator: "YESTERDAY", label: "Yesterday", arity: "none", group: "Day" },
  { operator: "TOMORROW", label: "Tomorrow", arity: "none", group: "Day" },

  { operator: "THIS_WEEK", label: "This week", arity: "none", group: "Week" },
  { operator: "LAST_WEEK", label: "Last week", arity: "none", group: "Week" },
  { operator: "NEXT_WEEK", label: "Next week", arity: "none", group: "Week" },

  { operator: "THIS_MONTH", label: "This month", arity: "none", group: "Month" },
  { operator: "LAST_MONTH", label: "Last month", arity: "none", group: "Month" },
  { operator: "NEXT_MONTH", label: "Next month", arity: "none", group: "Month" },
  { operator: "MONTH_TO_DATE", label: "Month to date", arity: "none", group: "Month" },

  { operator: "THIS_QUARTER", label: "This quarter", arity: "none", group: "Quarter" },
  { operator: "LAST_QUARTER", label: "Last quarter", arity: "none", group: "Quarter" },
  { operator: "NEXT_QUARTER", label: "Next quarter", arity: "none", group: "Quarter" },
  { operator: "QUARTER_TO_DATE", label: "Quarter to date", arity: "none", group: "Quarter" },

  { operator: "THIS_YEAR", label: "This year", arity: "none", group: "Year" },
  { operator: "LAST_YEAR", label: "Last year", arity: "none", group: "Year" },
  { operator: "NEXT_YEAR", label: "Next year", arity: "none", group: "Year" },
  { operator: "YEAR_TO_DATE", label: "Year to date", arity: "none", group: "Year" },

  { operator: "LAST_DAYS", label: "Last…days", arity: "count", group: "Rolling", unit: "day" },
  { operator: "NEXT_DAYS", label: "Next…days", arity: "count", group: "Rolling", unit: "day" },
  { operator: "LAST_WEEKS", label: "Last…weeks", arity: "count", group: "Rolling", unit: "week" },
  { operator: "NEXT_WEEKS", label: "Next…weeks", arity: "count", group: "Rolling", unit: "week" },
  { operator: "LAST_MONTHS", label: "Last…months", arity: "count", group: "Rolling", unit: "month" },
  { operator: "NEXT_MONTHS", label: "Next…months", arity: "count", group: "Rolling", unit: "month" },
  { operator: "LAST_QUARTERS", label: "Last…quarters", arity: "count", group: "Rolling", unit: "quarter" },
  { operator: "NEXT_QUARTERS", label: "Next…quarters", arity: "count", group: "Rolling", unit: "quarter" },
  { operator: "LAST_YEARS", label: "Last…years", arity: "count", group: "Rolling", unit: "year" },
  { operator: "NEXT_YEARS", label: "Next…years", arity: "count", group: "Rolling", unit: "year" },

  { operator: "DATE", label: "On", arity: "date", group: "Fixed" },
  { operator: "FROM", label: "From", arity: "date", group: "Fixed" },
  { operator: "TO", label: "Until", arity: "date", group: "Fixed" },
  { operator: "BETWEEN", label: "Between", arity: "range", group: "Fixed" },
];

const META = new Map(DATE_RANGE_OPERATORS.map((o) => [o.operator, o]));

export const operatorMeta = (op: DateRangeOperator): OperatorMeta | undefined => META.get(op);

const COUNT_OPS = new Set(
  DATE_RANGE_OPERATORS.filter((o) => o.arity === "count").map((o) => o.operator),
);
const FIXED_OPS = new Set(
  DATE_RANGE_OPERATORS.filter((o) => o.arity === "none").map((o) => o.operator),
);

export const isCountOperator = (op: string): op is CountOperator => COUNT_OPS.has(op as never);
export const isFixedOperator = (op: string): op is FixedOperator => FIXED_OPS.has(op as never);

// ---------------------------------------------------------------------------
// labels
// ---------------------------------------------------------------------------

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;

/**
 * The human name for a value: "Last 7 days", "Between 1 Jul and 14 Jul".
 *
 * This is what the trigger shows, and it names the QUESTION rather than the
 * answer — a control that reads "1 Jul – 7 Jul" when the user chose "Last 7
 * days" has thrown away the only thing that made the choice meaningful.
 */
export const formatDateRangeValue = (
  value: DateRangeValue | null | undefined,
  formatDate: (d: Date) => string = (d) => d.toLocaleDateString(),
): string => {
  if (!value) return "";
  const meta = META.get(value.operator);

  if (value.operator === "BETWEEN") {
    const a = parseISODate(value.from);
    const b = parseISODate(value.to);
    if (!a || !b) return meta?.label ?? "";
    const [lo, hi] = a <= b ? [a, b] : [b, a];
    return `${formatDate(lo)} – ${formatDate(hi)}`;
  }

  if (value.operator === "DATE" || value.operator === "FROM" || value.operator === "TO") {
    const d = parseISODate(value.date);
    if (!d) return meta?.label ?? "";
    return `${meta?.label} ${formatDate(d)}`;
  }

  if (isCountOperator(value.operator)) {
    const v = value as { operator: CountOperator; count: number; includeCurrent?: boolean };
    const m = META.get(v.operator);
    const dir = v.operator.startsWith("LAST") ? "Last" : "Next";
    const base = `${dir} ${plural(Math.max(0, Math.floor(v.count)), m?.unit ?? "day")}`;
    // Surfaced in the label because it changes which dates you get, and a
    // difference you cannot see in the trigger is a difference you will not
    // notice is wrong.
    return v.includeCurrent ? `${base}, incl. current` : base;
  }

  return meta?.label ?? "";
};
