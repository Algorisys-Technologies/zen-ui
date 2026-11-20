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
    options?: {
        value: string;
        label: string;
    }[];
}
export type FilterOperator = "contains" | "notContains" | "equals" | "notEquals" | "starts" | "ends" | "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "between" | "in" | "notIn" | "isTrue" | "isFalse" | "empty" | "notEmpty";
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
/** The operators a field type offers, in menu order; the first is its default. */
export declare function operatorsFor(type: FilterFieldType): readonly FilterOperator[];
/** An operator as words, for a menu or a summary. Dates read as days: "is before", not "<". */
export declare function operatorLabel(op: FilterOperator, type?: FilterFieldType, t?: FilterTranslate): string;
/**
 * A message lookup (LocaleProvider's `t`): the key and its values in, the
 * sentence out. Given one, operatorLabel and describeFilter build every phrase
 * by catalogue key (`filter.*`); `bun run check:messages` asserts the English
 * reads exactly as without it.
 */
export type FilterTranslate = (key: string, values?: Record<string, string | number>) => string;
/** How many values an operator takes: 0, 1, 2 (between) or a list (in, not in). */
export declare function operatorArity(op: FilterOperator): 0 | 1 | 2 | "list";
/** Whether a condition is finished: a known field, an operator for its type, the values it needs. */
export declare function isComplete(c: FilterCondition, fields: readonly FilterField[]): boolean;
/** The filter with unfinished conditions and emptied groups taken out; null when nothing is left. */
export declare function pruneFilter(node: FilterNode, fields: readonly FilterField[]): FilterNode | null;
/** A row value as a comparable day, "YYYY-MM-DD", or null. Dates are compared by their local day. */
export declare function toDay(v: unknown): string | null;
/**
 * A predicate for rows. `get` reads a field from a row. Unfinished conditions
 * are pruned first; a filter with nothing left matches every row.
 */
export declare function filterPredicate<R>(node: FilterNode | null | undefined, fields: readonly FilterField[], get: (row: R, field: string) => unknown): (row: R) => boolean;
/**
 * The filter in words: `Status is any of Overdue and (Customer is A or Amount > 100000)`.
 * `format` spells a value (a currency, a localised date); default as stored.
 */
export declare function describeFilter(node: FilterNode | null | undefined, fields: readonly FilterField[], format?: (value: string | number, field: FilterField) => string, t?: FilterTranslate): string;
/** A fresh node id. */
export declare function filterId(): string;
/** A new condition on a field, its type's first operator, no value yet. */
export declare function newCondition(field: FilterField): FilterCondition;
export declare function newGroup(join?: "and" | "or", children?: FilterNode[]): FilterGroup;
/** Append a node to the group with `groupId`. */
export declare function addNode(root: FilterGroup, groupId: string, node: FilterNode): FilterGroup;
/** Remove a node (the root cannot be removed; it is emptied instead). */
export declare function removeNode(root: FilterGroup, id: string): FilterGroup;
/** Change a node's own properties (join, not, op, value…). */
export declare function updateNode(root: FilterGroup, id: string, patch: Partial<FilterCondition> | Partial<FilterGroup>): FilterGroup;
/**
 * Point a condition at another field. The operator is kept if the new field's
 * type offers it, and the value if it still means the same thing (same type);
 * otherwise both reset, never carrying "contains 'Acme'" over to a number.
 */
export declare function changeField(root: FilterGroup, id: string, field: FilterField, fields: readonly FilterField[]): FilterGroup;
/** Change an operator: values kept where they still fit (a single value into between's lower end, a list kept for in/not in). */
export declare function changeOperator(root: FilterGroup, id: string, op: FilterOperator): FilterGroup;
/** How deep a node's groups go: a condition is 0, a group of conditions 1. */
export declare function filterDepth(node: FilterNode): number;
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
export declare function loadFilter(input: unknown, fields: readonly FilterField[]): LoadedFilter;
