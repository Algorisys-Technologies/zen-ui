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
export const TEXT_FILTER_OPS: readonly { value: TextOp; label: string; symbol: string }[] = [
  { value: "contains", label: "dataTable.textOp.contains", symbol: "≈" },
  { value: "equals", label: "dataTable.textOp.equals", symbol: "=" },
  { value: "starts", label: "dataTable.textOp.starts", symbol: "a…" },
  { value: "ends", label: "dataTable.textOp.ends", symbol: "…a" },
];
export const NUMBER_FILTER_OPS: readonly { value: NumberOp; label: string; symbol: string }[] = [
  { value: "eq", label: "dataTable.numberOp.eq", symbol: "=" },
  { value: "ne", label: "dataTable.numberOp.ne", symbol: "≠" },
  { value: "gt", label: "dataTable.numberOp.gt", symbol: ">" },
  { value: "lt", label: "dataTable.numberOp.lt", symbol: "<" },
  { value: "gte", label: "dataTable.numberOp.gte", symbol: "≥" },
  { value: "lte", label: "dataTable.numberOp.lte", symbol: "≤" },
];

const empty = (s: unknown): boolean => s === null || s === undefined || (typeof s === "string" && s.length === 0);

/** Does `cell` pass `filter` for a column of this variant? */
export function columnFilterMatches(variant: FilterVariant | undefined, cell: unknown, filter: unknown): boolean {
  switch (variant) {
    case "number": {
      const f = filter as NumberFilterValue | undefined;
      if (!f || empty(f.value)) return true;
      const n = Number(cell);
      if (Number.isNaN(n)) return false;
      const target = f.value as number;
      switch (f.op) {
        case "eq": return n === target;
        case "ne": return n !== target;
        case "gt": return n > target;
        case "lt": return n < target;
        case "gte": return n >= target;
        case "lte": return n <= target;
        default: return true;
      }
    }
    case "numberRange": {
      const [min, max] = (filter as NumberRangeFilterValue | undefined) ?? [null, null];
      if (empty(min) && empty(max)) return true;
      const n = Number(cell);
      if (Number.isNaN(n)) return false;
      if (!empty(min) && n < (min as number)) return false;
      if (!empty(max) && n > (max as number)) return false;
      return true;
    }
    case "select":
      if (filter === undefined || filter === null || filter === "") return true;
      return String(cell) === String(filter);
    case "boolean":
      if (filter === null || filter === undefined || filter === "any") return true;
      return Boolean(cell) === (filter === true || filter === "true");
    case "text":
    default: {
      // A bare string is "contains" (what a table without operators stores).
      const f = filter as TextFilterValue | string | undefined;
      const op: TextOp = typeof f === "object" && f ? f.op : "contains";
      const needle = String(typeof f === "object" && f ? f.value : (f ?? "")).toLowerCase().trim();
      if (!needle) return true;
      const text = String(cell ?? "").toLowerCase();
      switch (op) {
        case "equals": return text === needle;
        case "starts": return text.startsWith(needle);
        case "ends": return text.endsWith(needle);
        case "contains":
        default: return text.includes(needle);
      }
    }
  }
}

/** True when a filter value filters nothing (its chip is not shown). */
export const isEmptyColumnFilter = (value: unknown): boolean => describeColumnFilter(value) === "";

/**
 * A filter value as a chip shows it: "≥ 60000", "60000 – 200000", "≈ ada",
 * "Admin", "Yes". Empty for a value that filters nothing. `yes` / `no` are the
 * caller's words for a boolean filter.
 */
export function describeColumnFilter(value: unknown, words: { yes: string; no: string } = { yes: "Yes", no: "No" }): string {
  if (value === null || value === undefined || value === "") return "";
  if (Array.isArray(value)) {
    const [min, max] = value as (number | null)[];
    if (min == null && max == null) return "";
    if (min == null) return `≤ ${max}`;
    if (max == null) return `≥ ${min}`;
    return `${min} – ${max}`;
  }
  if (typeof value === "object") {
    const v = value as { op?: string; value?: unknown };
    if (v.op && v.value !== undefined && v.value !== null && v.value !== "") {
      const symbol = [...TEXT_FILTER_OPS, ...NUMBER_FILTER_OPS].find((o) => o.value === v.op)?.symbol ?? v.op;
      return `${symbol} ${v.value}`;
    }
    return "";
  }
  if (typeof value === "boolean") return value ? words.yes : words.no;
  return String(value);
}
