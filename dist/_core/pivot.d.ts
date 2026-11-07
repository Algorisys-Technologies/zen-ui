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
export type PivotFilterSelection = {
    kind: "include";
    values: string[];
} | {
    kind: "all";
    optionSearch?: string;
    exclude: string[];
};
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
export declare const PIVOT_ZONES: readonly PivotZone[];
export declare const PIVOT_AGGREGATIONS: readonly PivotAggregation[];
export declare const createEmptyLayout: () => PivotLayout;
export declare const fieldLabel: (fields: PivotField[], key: string) => string;
/** The human name of a zone — for menus and for announcements. */
export declare const zoneLabel: (zone: PivotZone) => string;
/**
 * Which zone a field is currently in.
 *
 * Both bindings need this and both had inlined their own chain of ternaries
 * over rows/columns/values. It is also the thing a drop handler must not try to
 * infer from a DOM id — doing that is what made dropping onto a populated zone
 * delete the field.
 */
export declare const zoneOf: (layout: PivotLayout, fieldId: string) => PivotZone;
/**
 * The default aggregation for a field.
 *
 * A measure sums; a dimension can only be counted. The old version took a field,
 * ignored it, and returned "sum" for everything — so a dimension dropped into
 * Values offered to sum a list of city names.
 */
export declare const defaultAggregationForField: (field: PivotField) => PivotAggregation;
export declare const removeFieldFromLayout: (layout: PivotLayout, fieldId: string) => PivotLayout;
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
export declare const moveFieldToZone: (layout: PivotLayout, fieldId: string, zone: PivotZone, options?: {
    index?: number;
    aggregation?: PivotAggregation;
}) => PivotLayout;
export declare const updateValueAggregation: (layout: PivotLayout, fieldId: string, aggregation: PivotAggregation) => PivotLayout;
/** The fields not placed in any zone, in the caller's original order. */
export declare const availableFields: (layout: PivotLayout, fields: PivotField[]) => PivotField[];
/** A layout can only produce a grid with something to measure and something to group by. */
export declare const isLayoutRenderable: (layout: PivotLayout) => boolean;
export declare const normalizeFilterSelection: (selection: PivotFilterSelection) => PivotFilterSelection;
/** Whether a selection actually narrows anything. */
export declare const isFilterActive: (selection: PivotFilterSelection | undefined) => boolean;
/**
 * Whether a value is currently selected.
 *
 * No selection means everything is selected — an unfiltered column shows all of
 * its values, so every checkbox is ticked.
 */
export declare const isValueSelected: (selection: PivotFilterSelection | undefined, value: string) => boolean;
export declare const hasActiveFilters: (filters: PivotFilters) => boolean;
/** How a chip should summarise its own filter. Shared, so both chips read alike. */
export declare const describeFilterSelection: (selection: PivotFilterSelection | undefined) => string;
/**
 * What to say out loud when a field moves.
 *
 * Dragging is invisible to a screen reader: the layout changes and nothing says
 * so. Both bindings feed this into an aria-live region, so the sentence is the
 * same whichever one you are using — and it is written here rather than in two
 * templates that would drift.
 */
export declare const describeMove: (fields: PivotField[], fieldId: string, to: PivotZone, index?: number) => string;
