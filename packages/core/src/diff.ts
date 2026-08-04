/**
 * Before/after diffing — the pure half of DiffView.
 *
 * An audit row, a revision history, a form's dirty state: two snapshots of the
 * same record, and the question is what moved. It lives in core so all four
 * renderers agree on the answer; the behaviour is pinned by
 * scripts/check-diff.ts.
 *
 * It compares ONE level of keys and reports a nested difference on the
 * top-level key that contains it. That is deliberate rather than a limitation:
 * a tree diff needs a tree to render it, and the thing a reader of an audit log
 * wants is "amount changed", not a path expression. A caller who needs the
 * inner detail passes the nested object through `format` and renders it.
 *
 * Values are assumed to be JSON-shaped — the payload came off the wire or out
 * of a database. There is no cycle detection because a cyclic value cannot
 * arrive that way, and anything that is not a plain object, array or Date
 * compares by identity.
 */

export type DiffKind = "added" | "removed" | "changed" | "unchanged";

export interface DiffRow {
  key: string;
  /** `labels[key]` when given, else the key verbatim. */
  label: string;
  kind: DiffKind;
  /** `undefined` when the key is absent from the before snapshot. */
  before: unknown;
  /** `undefined` when the key is absent from the after snapshot. */
  after: unknown;
}

export interface DiffOptions {
  /**
   * Which keys to compare, in this order. Omitted compares every key on either
   * side. An EMPTY array selects nothing — it is a filter the caller computed,
   * not a missing argument.
   */
  keys?: string[];
  /** Display names. A key with no entry renders verbatim; humanising it would be guessing at the caller's wording. */
  labels?: Record<string, string>;
  /** Default `true` — an audit entry is about what changed. */
  changedOnly?: boolean;
}

export type DiffSnapshot = Record<string, unknown> | undefined;

const has = (o: Record<string, unknown>, k: string) => Object.prototype.hasOwnProperty.call(o, k);

const isPlainObject = (v: unknown): v is Record<string, unknown> => {
  if (typeof v !== "object" || v === null) return false;
  const proto = Object.getPrototypeOf(v) as object | null;
  return proto === Object.prototype || proto === null;
};

/**
 * Deep equality as a reader of a changelog would judge it.
 *
 * Two departures from `===` and from `Object.is`, and both are about not
 * reporting a change nobody made: NaN equals itself (a numeric field that was
 * un-parseable in both snapshots did not change), and -0 equals 0 (no reader
 * has ever cared). `Object.is` gets the first right and the second wrong, which
 * is why neither operator is used alone.
 */
const equal = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (typeof a === "number" && typeof b === "number") return Number.isNaN(a) && Number.isNaN(b);

  if (a instanceof Date && b instanceof Date) {
    const [x, y] = [a.getTime(), b.getTime()];
    return x === y || (Number.isNaN(x) && Number.isNaN(y));
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((v, i) => equal(v, b[i]));
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const ak = Object.keys(a);
    /* Length first, then membership: same count with the same keys present is
       the same key set, and it avoids sorting two arrays to find that out. */
    if (ak.length !== Object.keys(b).length) return false;
    return ak.every((k) => has(b, k) && equal(a[k], b[k]));
  }

  return false;
};

/**
 * Coerce an audit payload into something comparable.
 *
 * Real audit columns are `nvarchar`, not JSON: a row holds a serialised object
 * for one action, a bare ARRAY for another, an ad-hoc map for a third, an
 * arbitrary non-JSON string for a fourth, and an empty string when there is no
 * before-side at all. The caller has not parsed any of it, and a bare
 * `JSON.parse` on the wrong row takes the whole panel down.
 *
 * Empty becomes `undefined`, which is how "there was no before" is spelled.
 * Something that does not even start like JSON is left as the text it is,
 * rather than being thrown away by a failed parse.
 */
export const parseSnapshot = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (!/^[[{]/.test(trimmed)) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

/**
 * Whether a value can be compared field by field. Anything else — an array, a
 * string, a number — has no keys to put in the left column, and gets shown
 * whole instead of being forced into a table that would misrepresent it.
 */
export const isKeyed = (value: unknown): value is Record<string, unknown> => isPlainObject(value);

const kindOf = (inBefore: boolean, inAfter: boolean, same: boolean): DiffKind => {
  if (!inBefore) return "added";
  if (!inAfter) return "removed";
  return same ? "unchanged" : "changed";
};

/**
 * Compare two snapshots and return one row per key worth showing.
 *
 * Either side may be `undefined` — a record that was just created has no
 * before, and one that was deleted has no after. Neither input is mutated.
 *
 * Key order is the before snapshot's, then keys only in the after snapshot, in
 * theirs. That keeps a record's own field order rather than imposing an
 * alphabetical one nobody wrote.
 */
export const computeDiff = (
  before: DiffSnapshot,
  after: DiffSnapshot,
  options: DiffOptions = {},
): DiffRow[] => {
  const b = before ?? {};
  const a = after ?? {};
  const changedOnly = options.changedOnly ?? true;

  const keys =
    options.keys ?? [...Object.keys(b), ...Object.keys(a).filter((k) => !has(b, k))];

  const rows: DiffRow[] = [];
  for (const key of keys) {
    const inBefore = has(b, key);
    const inAfter = has(a, key);
    /* A key the caller listed that neither snapshot carries says nothing, and a
       row reading "— -> —" is noise the reader has to decode. */
    if (!inBefore && !inAfter) continue;

    const kind = kindOf(inBefore, inAfter, equal(b[key], a[key]));
    if (changedOnly && kind === "unchanged") continue;

    rows.push({
      key,
      label: options.labels?.[key] ?? key,
      kind,
      before: inBefore ? b[key] : undefined,
      after: inAfter ? a[key] : undefined,
    });
  }

  return rows;
};
