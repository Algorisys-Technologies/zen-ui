/**
 * The pivot's model: what a layout is, and every operation on one.
 *
 * Framework-agnostic, like mask.ts / color.ts / date-range.ts / chart.ts — and
 * here it earns it twice over. The two bindings cannot share a renderer (React
 * drags with @dnd-kit, Solid with @thisbeyond/solid-dnd), so without this the
 * layout rules would exist twice and drift immediately. Every question that is
 * not "what does this look like" is answered here.
 *
 * ONE NAME PER CONCEPT. The original had two parallel type systems for the same
 * things — `ZoneType`/`PivotZone` and `AggregationType`/`PivotAggregation`,
 * identical unions, both exported, used interchangeably and cast between. A
 * consumer met two names for one idea and had to guess which was canonical.
 * There is one of each now.
 */

export type PivotZone = "available" | "rows" | "columns" | "values";
export type PivotAggregation = "sum" | "count" | "avg" | "min" | "max";
export type PivotFieldType = "dimension" | "measure";

export interface PivotField {
  key: string;
  label: string;
  type: PivotFieldType;
}

export interface PivotValueField {
  id: string;
  aggregation: PivotAggregation;
}

/**
 * What a filter menu has selected.
 *
 * Two shapes because "these three" and "everything except these three" are
 * different questions, and collapsing them loses which one was asked: an
 * `include` list narrows as new data arrives, an `all` + exclude list widens.
 */
export type PivotFilterSelection =
  | { kind: "include"; values: string[] }
  | { kind: "all"; optionSearch?: string; exclude: string[] };

export type PivotFilters = Record<string, PivotFilterSelection>;

export interface PivotLayout {
  /** Field keys, outermost first. */
  rows: string[];
  columns: string[];
  values: PivotValueField[];
  /**
   * Typed, not `Record<string, unknown>`. It was the latter while
   * PivotFilterSelection sat right next to it, so every read needed a cast and
   * `filters: otherFilters as any` was load-bearing.
   */
  filters: PivotFilters;
}

/**
 * What the component asks a backend for when a filter menu opens or pages.
 *
 * These are the pivot's integration contract, so they live here with the rest of
 * the model rather than in a binding. Previously they sat in the Solid package
 * and were never exported from its root — so `loadMembers`, the single most
 * important prop, had a signature a consumer could not name.
 */
export interface PivotMembersRequest {
  fieldKey: string;
  search?: string;
  offset?: number;
  limit?: number;
  /** The other zones' filters, so members can be narrowed by them. */
  filters?: PivotFilters;
}

export interface PivotMembersResult {
  values: string[];
  hasMore: boolean;
  total?: number;
}

/** A page of filter options, as a backend returns it. */
export interface PivotFilterOptionsBody {
  values: string[];
  hasMore: boolean;
  total: number;
}

export type SortDirection = "asc" | "desc";

/** A server-side sort on a filterable column. */
export interface PivotSort {
  column: string;
  direction: SortDirection;
}

export const PIVOT_ZONES: readonly PivotZone[] = ["available", "rows", "columns", "values"];
export const PIVOT_AGGREGATIONS: readonly PivotAggregation[] = ["sum", "count", "avg", "min", "max"];

export const createEmptyLayout = (): PivotLayout => ({
  rows: [],
  columns: [],
  values: [],
  filters: {},
});

export const fieldLabel = (fields: PivotField[], key: string): string =>
  fields.find((f) => f.key === key)?.label ?? key;

/** The human name of a zone — for menus and for announcements. */
export const zoneLabel = (zone: PivotZone): string =>
  zone === "available" ? "Available fields" : zone === "rows" ? "Rows" : zone === "columns" ? "Columns" : "Values";

/**
 * Which zone a field is currently in.
 *
 * Both bindings need this and both had inlined their own chain of ternaries
 * over rows/columns/values. It is also the thing a drop handler must not try to
 * infer from a DOM id — doing that is what made dropping onto a populated zone
 * delete the field.
 */
export const zoneOf = (layout: PivotLayout, fieldId: string): PivotZone => {
  if (layout.rows.includes(fieldId)) return "rows";
  if (layout.columns.includes(fieldId)) return "columns";
  if (layout.values.some((v) => v.id === fieldId)) return "values";
  return "available";
};

/**
 * The default aggregation for a field.
 *
 * A measure sums; a dimension can only be counted. The old version took a field,
 * ignored it, and returned "sum" for everything — so a dimension dropped into
 * Values offered to sum a list of city names.
 */
export const defaultAggregationForField = (field: PivotField): PivotAggregation =>
  field.type === "measure" ? "sum" : "count";

export const removeFieldFromLayout = (layout: PivotLayout, fieldId: string): PivotLayout => ({
  ...layout,
  rows: layout.rows.filter((id) => id !== fieldId),
  columns: layout.columns.filter((id) => id !== fieldId),
  values: layout.values.filter((v) => v.id !== fieldId),
});

/**
 * Put a field in a zone, at `index` if given and at the end otherwise.
 *
 * One function rather than the previous three (addFieldToZone /
 * insertFieldIntoZone / reorderFieldInZone), which shared a body, drifted in
 * their edge cases, and of which two were never called — including the two the
 * drag handler should have been using to honour a drop position.
 *
 * Moving to "available" means leaving the layout, because that is what the
 * Available zone is: the fields not in it.
 */
export const moveFieldToZone = (
  layout: PivotLayout,
  fieldId: string,
  zone: PivotZone,
  options: { index?: number; aggregation?: PivotAggregation } = {},
): PivotLayout => {
  const at = <T,>(list: T[], item: T): T[] => {
    const next = [...list];
    // A negative or oversized index clamps rather than throwing or landing
    // somewhere surprising: a drop index comes from a pointer, not a contract.
    const i = options.index === undefined ? next.length : Math.max(0, Math.min(next.length, options.index));
    next.splice(i, 0, item);
    return next;
  };

  const clean = removeFieldFromLayout(layout, fieldId);

  switch (zone) {
    case "available":
      return clean;
    case "rows":
      return { ...clean, rows: at(clean.rows, fieldId) };
    case "columns":
      return { ...clean, columns: at(clean.columns, fieldId) };
    case "values":
      return { ...clean, values: at(clean.values, { id: fieldId, aggregation: options.aggregation ?? "sum" }) };
    default:
      // Not reachable through the type — but it IS reachable from a cast, and
      // that is exactly how the shipped bug arrived: a DOM id parsed into a
      // string was handed over as a zone. The old code's `default` returned the
      // layout with the field already stripped out, so an unrecognised zone
      // DELETED it. Returning the original is the one answer that cannot lose
      // data: the drop does nothing, visibly, and the field stays put.
      return layout;
  }
};

export const updateValueAggregation = (
  layout: PivotLayout,
  fieldId: string,
  aggregation: PivotAggregation,
): PivotLayout => ({
  ...layout,
  values: layout.values.map((v) => (v.id === fieldId ? { ...v, aggregation } : v)),
});

/** The fields not placed in any zone, in the caller's original order. */
export const availableFields = (layout: PivotLayout, fields: PivotField[]): PivotField[] =>
  fields.filter((f) => zoneOf(layout, f.key) === "available");

/** A layout can only produce a grid with something to measure and something to group by. */
export const isLayoutRenderable = (layout: PivotLayout): boolean =>
  layout.values.length > 0 && (layout.rows.length > 0 || layout.columns.length > 0);

// ---------------------------------------------------------------------------
// filter selection
// ---------------------------------------------------------------------------

const dedupe = (values: string[]): string[] => [...new Set(values.filter((v) => v !== ""))];

export const normalizeFilterSelection = (selection: PivotFilterSelection): PivotFilterSelection => {
  if (selection.kind === "include") return { kind: "include", values: dedupe(selection.values) };
  const search = selection.optionSearch?.trim();
  return {
    kind: "all",
    ...(search ? { optionSearch: search } : {}),
    exclude: dedupe(selection.exclude),
  };
};

/** Whether a selection actually narrows anything. */
export const isFilterActive = (selection: PivotFilterSelection | undefined): boolean => {
  if (!selection) return false;
  if (selection.kind === "include") return selection.values.length > 0;
  return Boolean(selection.optionSearch?.trim()) || selection.exclude.length > 0;
};

/**
 * Whether a value is currently selected.
 *
 * No selection means everything is selected — an unfiltered column shows all of
 * its values, so every checkbox is ticked.
 */
export const isValueSelected = (selection: PivotFilterSelection | undefined, value: string): boolean => {
  if (!selection) return true;
  if (selection.kind === "include") return selection.values.includes(value);
  return !selection.exclude.includes(value);
};

export const hasActiveFilters = (filters: PivotFilters): boolean =>
  Object.values(filters).some(isFilterActive);

/** How a chip should summarise its own filter. Shared, so both chips read alike. */
export const describeFilterSelection = (selection: PivotFilterSelection | undefined): string => {
  if (!isFilterActive(selection) || !selection) return "";
  if (selection.kind === "include") {
    return selection.values.length === 1 ? selection.values[0] : `${selection.values.length} selected`;
  }
  return selection.exclude.length ? `All except ${selection.exclude.length}` : "All";
};

// ---------------------------------------------------------------------------
// announcements
// ---------------------------------------------------------------------------

/**
 * What to say out loud when a field moves.
 *
 * Dragging is invisible to a screen reader: the layout changes and nothing says
 * so. Both bindings feed this into an aria-live region, so the sentence is the
 * same whichever one you are using — and it is written here rather than in two
 * templates that would drift.
 */
export const describeMove = (fields: PivotField[], fieldId: string, to: PivotZone, index?: number): string => {
  const name = fieldLabel(fields, fieldId);
  if (to === "available") return `${name} removed from the layout.`;
  const where = index === undefined ? "" : ` at position ${index + 1}`;
  return `${name} moved to ${zoneLabel(to)}${where}.`;
};
