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
export declare const parseSnapshot: (value: unknown) => unknown;
/**
 * Whether a value can be compared field by field. Anything else — an array, a
 * string, a number — has no keys to put in the left column, and gets shown
 * whole instead of being forced into a table that would misrepresent it.
 */
export declare const isKeyed: (value: unknown) => value is Record<string, unknown>;
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
export declare const computeDiff: (before: DiffSnapshot, after: DiffSnapshot, options?: DiffOptions) => DiffRow[];
