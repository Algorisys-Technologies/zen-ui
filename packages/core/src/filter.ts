/**
 * Filters as data: the pure half of FilterBuilder (and what ViewManager
 * saves), shared by every binding.
 *
 *   bun run check:filter
 *
 * A filter is a tree of AND/OR groups over conditions on fields:
 *
 *   status is Overdue AND (customer is any of A, B OR amount > 1,00,000)
 *
 * held as one plain object (JSON in, JSON out) so it can be saved, sent to a
 * server as report criteria, or evaluated here against rows. Operator names
 * are DataTable's per-column ones (contains, equals, starts, ends; eq, ne, gt,
 * gte, lt, lte), so a filter reads the same in both.
 *
 * A condition the user has not finished (no value yet) filters nothing: it is
 * pruned, not evaluated as "matches nothing". A saved filter whose field has
 * since gone is loaded without it, and says what it dropped.
 */

export type FilterFieldType = "text" | "number" | "date" | "enum" | "boolean";

export interface FilterField {
  id: string;
  label: string;
  type: FilterFieldType;
  /** For enum fields: the choices. */
  options?: { value: string; label: string }[];
}

export type FilterOperator =
  // text
  | "contains" | "notContains" | "equals" | "notEquals" | "starts" | "ends"
  // number and date
  | "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "between"
  // enum
  | "in" | "notIn"
  // boolean
  | "isTrue" | "isFalse"
  // any
  | "empty" | "notEmpty";

/** A date in a filter is "YYYY-MM-DD": a day, serialisable, with no time zone to drift. */
export type FilterValue = string | number | string[] | null;

export interface FilterCondition {
  kind: "condition";
  id: string;
  field: string;
  op: FilterOperator;
  value?: FilterValue;
  /** The upper end, for between. */
  valueTo?: FilterValue;
}

export interface FilterGroup {
  kind: "group";
  id: string;
  /** and: all of the children; or: any of them. */
  join: "and" | "or";
  /** None of / not all of: the group's result negated. */
  not?: boolean;
  children: FilterNode[];
}

export type FilterNode = FilterCondition | FilterGroup;

const OPS: Record<FilterFieldType, FilterOperator[]> = {
  text: ["contains", "notContains", "equals", "notEquals", "starts", "ends", "empty", "notEmpty"],
  number: ["eq", "ne", "gt", "gte", "lt", "lte", "between", "empty", "notEmpty"],
  date: ["eq", "ne", "gt", "gte", "lt", "lte", "between", "empty", "notEmpty"],
  enum: ["in", "notIn", "empty", "notEmpty"],
  boolean: ["isTrue", "isFalse"],
};

/** The operators a field type offers, in menu order; the first is its default. */
export function operatorsFor(type: FilterFieldType): readonly FilterOperator[] {
  return OPS[type];
}

const LABELS: Record<FilterOperator, string> = {
  contains: "contains", notContains: "does not contain", equals: "is", notEquals: "is not",
  starts: "starts with", ends: "ends with",
  eq: "=", ne: "≠", gt: ">", gte: "≥", lt: "<", lte: "≤", between: "is between",
  in: "is one of", notIn: "is none of", isTrue: "is yes", isFalse: "is no",
  empty: "is empty", notEmpty: "is not empty",
};
const DATE_LABELS: Partial<Record<FilterOperator, string>> = {
  eq: "is on", ne: "is not on", gt: "is after", gte: "is on or after", lt: "is before", lte: "is on or before",
};

/** An operator as words, for a menu or a summary. Dates read as days: "is before", not "<". */
export function operatorLabel(op: FilterOperator, type?: FilterFieldType): string {
  return (type === "date" && DATE_LABELS[op]) || LABELS[op];
}

/** How many values an operator takes: 0, 1, 2 (between) or a list (in, not in). */
export function operatorArity(op: FilterOperator): 0 | 1 | 2 | "list" {
  if (op === "empty" || op === "notEmpty" || op === "isTrue" || op === "isFalse") return 0;
  if (op === "between") return 2;
  if (op === "in" || op === "notIn") return "list";
  return 1;
}

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const hasValue = (v: FilterValue | undefined, type: FilterFieldType): boolean => {
  if (v === null || v === undefined) return false;
  if (type === "number") return typeof v === "number" && Number.isFinite(v);
  if (type === "date") return typeof v === "string" && ISO_DAY.test(v);
  if (Array.isArray(v)) return v.length > 0;
  return typeof v === "string" && v.trim() !== "";
};

/** Whether a condition is finished: a known field, an operator for its type, the values it needs. */
export function isComplete(c: FilterCondition, fields: readonly FilterField[]): boolean {
  const f = fields.find((x) => x.id === c.field);
  if (!f || !OPS[f.type].includes(c.op)) return false;
  const arity = operatorArity(c.op);
  if (arity === 0) return true;
  if (arity === "list") return Array.isArray(c.value) && c.value.length > 0;
  if (!hasValue(c.value, f.type)) return false;
  return arity === 1 || hasValue(c.valueTo, f.type);
}

/** The filter with unfinished conditions and emptied groups taken out; null when nothing is left. */
export function pruneFilter(node: FilterNode, fields: readonly FilterField[]): FilterNode | null {
  if (node.kind === "condition") return isComplete(node, fields) ? node : null;
  const children = node.children.map((c) => pruneFilter(c, fields)).filter((c): c is FilterNode => c !== null);
  return children.length ? { ...node, children } : null;
}

/** A row value as a comparable day, "YYYY-MM-DD", or null. Dates are compared by their local day. */
export function toDay(v: unknown): string | null {
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return null;
    const p = (n: number) => String(n).padStart(2, "0");
    return `${v.getFullYear()}-${p(v.getMonth() + 1)}-${p(v.getDate())}`;
  }
  if (typeof v === "string") {
    const m = /^(\d{4}-\d{2}-\d{2})/.exec(v);
    return m ? m[1] : null;
  }
  return null;
}

const isEmptyValue = (v: unknown) => v === null || v === undefined || v === "" || (Array.isArray(v) && v.length === 0);

function test(c: FilterCondition, type: FilterFieldType, raw: unknown): boolean {
  if (c.op === "empty") return isEmptyValue(raw);
  if (c.op === "notEmpty") return !isEmptyValue(raw);
  switch (type) {
    case "boolean":
      return c.op === "isTrue" ? raw === true : raw === false;
    case "enum": {
      const set = (c.value as string[]).map(String);
      const has = Array.isArray(raw) ? raw.some((r) => set.includes(String(r))) : raw != null && set.includes(String(raw));
      return c.op === "in" ? has : !has;
    }
    case "text": {
      const cell = raw == null ? "" : String(raw).toLowerCase();
      const needle = String(c.value).trim().toLowerCase();
      switch (c.op) {
        case "contains": return cell.includes(needle);
        case "notContains": return !cell.includes(needle);
        case "equals": return cell.trim() === needle;
        case "notEquals": return cell.trim() !== needle;
        case "starts": return cell.trimStart().startsWith(needle);
        case "ends": return cell.trimEnd().endsWith(needle);
        default: return false;
      }
    }
    case "number":
    case "date": {
      // Numbers compare as numbers; days compare as "YYYY-MM-DD" strings, which sort as days.
      const cell = type === "number" ? (raw === null || raw === "" || raw === undefined ? NaN : Number(raw)) : toDay(raw);
      if (cell === null || (typeof cell === "number" && Number.isNaN(cell))) return c.op === "ne";
      const a = c.value as number | string;
      switch (c.op) {
        case "eq": return cell === a;
        case "ne": return cell !== a;
        case "gt": return cell > a;
        case "gte": return cell >= a;
        case "lt": return cell < a;
        case "lte": return cell <= a;
        case "between": {
          const b = c.valueTo as number | string;
          const [lo, hi] = a <= b ? [a, b] : [b, a];
          return cell >= lo && cell <= hi;
        }
        default: return false;
      }
    }
  }
}

/**
 * A predicate for rows. `get` reads a field from a row. Unfinished conditions
 * are pruned first; a filter with nothing left matches every row.
 */
export function filterPredicate<R>(
  node: FilterNode | null | undefined,
  fields: readonly FilterField[],
  get: (row: R, field: string) => unknown,
): (row: R) => boolean {
  const pruned = node ? pruneFilter(node, fields) : null;
  if (!pruned) return () => true;
  const types = new Map(fields.map((f) => [f.id, f.type]));
  const run = (n: FilterNode, row: R): boolean => {
    if (n.kind === "condition") return test(n, types.get(n.field)!, get(row, n.field));
    const r = n.join === "and" ? n.children.every((c) => run(c, row)) : n.children.some((c) => run(c, row));
    return n.not ? !r : r;
  };
  return (row) => run(pruned, row);
}

/**
 * The filter in words: `Status is any of Overdue and (Customer is A or Amount > 100000)`.
 * `format` spells a value (a currency, a localised date); default as stored.
 */
export function describeFilter(
  node: FilterNode | null | undefined,
  fields: readonly FilterField[],
  format: (value: string | number, field: FilterField) => string = (v) => String(v),
): string {
  const pruned = node ? pruneFilter(node, fields) : null;
  if (!pruned) return "";
  const byId = new Map(fields.map((f) => [f.id, f]));
  const spell = (f: FilterField, v: string | number) => {
    if (f.type === "enum") return f.options?.find((o) => o.value === v)?.label ?? String(v);
    if (f.type === "text") return `“${String(v).trim()}”`;
    return format(v, f);
  };
  const say = (n: FilterNode, nested: boolean): string => {
    if (n.kind === "condition") {
      const f = byId.get(n.field)!;
      const op = operatorLabel(n.op, f.type);
      const arity = operatorArity(n.op);
      if (arity === 0) return `${f.label} ${op}`;
      if (arity === "list") {
        // Commas, never "or": "or" is the groups' word, and "is A or B or Amount > 5" reads two ways.
        const vs = (n.value as string[]).map((v) => spell(f, v));
        return vs.length === 1 ? `${f.label} ${n.op === "in" ? "is" : "is not"} ${vs[0]}` : `${f.label} ${op} ${vs.join(", ")}`;
      }
      if (arity === 2) return `${f.label} ${op} ${spell(f, n.value as string | number)} and ${spell(f, n.valueTo as string | number)}`;
      return `${f.label} ${op} ${spell(f, n.value as string | number)}`;
    }
    // Brackets only where a group sits beside something: alone, it needs none.
    const parts = n.children.map((c) => say(c, n.children.length > 1));
    const joined = parts.join(n.join === "and" ? " and " : " or ");
    const text = n.not ? `not (${joined})` : parts.length > 1 && nested ? `(${joined})` : joined;
    return text;
  };
  return say(pruned, false);
}

// --- Editing: every function returns a new tree --------------------------------

let seq = 0;
/** A fresh node id. */
export function filterId(): string {
  seq += 1;
  return `f${Date.now().toString(36)}${seq.toString(36)}`;
}

/** A new condition on a field, its type's first operator, no value yet. */
export function newCondition(field: FilterField): FilterCondition {
  return { kind: "condition", id: filterId(), field: field.id, op: OPS[field.type][0], value: field.type === "enum" ? [] : null };
}

export function newGroup(join: "and" | "or" = "and", children: FilterNode[] = []): FilterGroup {
  return { kind: "group", id: filterId(), join, children };
}

function mapNode(node: FilterNode, id: string, fn: (n: FilterNode) => FilterNode | null): FilterNode | null {
  if (node.id === id) return fn(node);
  if (node.kind === "condition") return node;
  const children: FilterNode[] = [];
  let changed = false;
  for (const c of node.children) {
    const next = mapNode(c, id, fn);
    if (next !== c) changed = true;
    if (next) children.push(next);
  }
  return changed ? { ...node, children } : node;
}

/** Append a node to the group with `groupId`. */
export function addNode(root: FilterGroup, groupId: string, node: FilterNode): FilterGroup {
  return mapNode(root, groupId, (g) => (g.kind === "group" ? { ...g, children: [...g.children, node] } : g)) as FilterGroup;
}

/** Remove a node (the root cannot be removed; it is emptied instead). */
export function removeNode(root: FilterGroup, id: string): FilterGroup {
  if (id === root.id) return { ...root, children: [] };
  return mapNode(root, id, () => null) as FilterGroup;
}

/** Change a node's own properties (join, not, op, value…). */
export function updateNode(root: FilterGroup, id: string, patch: Partial<FilterCondition> | Partial<FilterGroup>): FilterGroup {
  return mapNode(root, id, (n) => ({ ...n, ...patch, id: n.id, kind: n.kind }) as FilterNode) as FilterGroup;
}

/**
 * Point a condition at another field. The operator is kept if the new field's
 * type offers it, and the value if it still means the same thing (same type);
 * otherwise both reset, never carrying "contains 'Acme'" over to a number.
 */
export function changeField(root: FilterGroup, id: string, field: FilterField, fields: readonly FilterField[]): FilterGroup {
  return mapNode(root, id, (n) => {
    if (n.kind !== "condition") return n;
    const before = fields.find((f) => f.id === n.field);
    const sameType = before?.type === field.type;
    const op = OPS[field.type].includes(n.op) ? n.op : OPS[field.type][0];
    const sameEnum = sameType && field.type === "enum" && before?.id === field.id;
    return {
      ...n,
      field: field.id,
      op,
      value: sameType && (field.type !== "enum" || sameEnum) ? n.value : field.type === "enum" ? [] : null,
      valueTo: sameType && field.type !== "enum" ? n.valueTo : null,
    };
  }) as FilterGroup;
}

/** Change an operator: values kept where they still fit (a single value into between's lower end, a list kept for in/not in). */
export function changeOperator(root: FilterGroup, id: string, op: FilterOperator): FilterGroup {
  return mapNode(root, id, (n) => {
    if (n.kind !== "condition") return n;
    const from = operatorArity(n.op), to = operatorArity(op);
    if (from === to) return { ...n, op };
    if (to === 0) return { ...n, op, value: null, valueTo: null };
    if (to === "list") return { ...n, op, value: [], valueTo: null };
    if (from === "list" || from === 0) return { ...n, op, value: null, valueTo: null };
    return { ...n, op, valueTo: to === 2 ? n.valueTo ?? null : null };
  }) as FilterGroup;
}

/** How deep a node's groups go: a condition is 0, a group of conditions 1. */
export function filterDepth(node: FilterNode): number {
  return node.kind === "condition" ? 0 : 1 + Math.max(0, ...node.children.map(filterDepth));
}

// --- Loading -------------------------------------------------------------------

export interface LoadedFilter {
  filter: FilterGroup;
  /** What could not be kept, in words: "Region (no longer a field)". */
  dropped: string[];
}

/**
 * Read a saved filter (from storage, a URL, a server) against today's fields.
 * Anything malformed, any condition on a field that no longer exists or with an
 * operator its type no longer offers, is dropped and named; enum values that
 * are no longer options are dropped from their list. Never throws.
 */
export function loadFilter(input: unknown, fields: readonly FilterField[]): LoadedFilter {
  const dropped: string[] = [];
  const byId = new Map(fields.map((f) => [f.id, f]));
  const seen = new Set<string>();
  const uid = (id: unknown) => {
    const s = typeof id === "string" && id && !seen.has(id) ? id : filterId();
    seen.add(s);
    return s;
  };
  const read = (n: unknown, depth: number): FilterNode | null => {
    if (!n || typeof n !== "object" || depth > 16) {
      dropped.push("a part that was not a filter");
      return null;
    }
    const o = n as Record<string, unknown>;
    if (o.kind === "group") {
      const kids = Array.isArray(o.children) ? o.children.map((c) => read(c, depth + 1)).filter((c): c is FilterNode => c !== null) : [];
      return { kind: "group", id: uid(o.id), join: o.join === "or" ? "or" : "and", ...(o.not === true ? { not: true } : {}), children: kids };
    }
    if (o.kind === "condition") {
      const f = byId.get(String(o.field));
      if (!f) {
        dropped.push(`${String(o.field)} (no longer a field)`);
        return null;
      }
      const op = o.op as FilterOperator;
      if (!OPS[f.type].includes(op)) {
        dropped.push(`${f.label} ${String(o.op)} (not an operator for this field)`);
        return null;
      }
      const clean = (v: unknown): FilterValue => {
        if (v === null || v === undefined) return null;
        if (f.type === "number") return typeof v === "number" && Number.isFinite(v) ? v : null;
        if (f.type === "date") return typeof v === "string" && ISO_DAY.test(v) ? v : null;
        if (f.type === "enum") {
          const list = Array.isArray(v) ? v.map(String) : [];
          const known = f.options ? list.filter((x) => f.options!.some((opt) => opt.value === x)) : list;
          for (const x of list) if (!known.includes(x)) dropped.push(`${f.label}: ${x} (no longer an option)`);
          return known;
        }
        return typeof v === "string" ? v : String(v);
      };
      const c: FilterCondition = { kind: "condition", id: uid(o.id), field: f.id, op, value: clean(o.value) };
      if (operatorArity(op) === 2) c.valueTo = clean(o.valueTo);
      return c;
    }
    dropped.push("a part that was not a filter");
    return null;
  };
  const root = read(input, 0);
  if (!root) return { filter: newGroup(), dropped };
  return { filter: root.kind === "group" ? root : newGroup("and", [root]), dropped };
}
