/**
 * Contract for the pivot's model.
 *
 * This exists because the bug that shipped was a MODEL bug wearing a DOM
 * costume: a drop resolved to a zone name that was not a zone, moveFieldToZone's
 * ancestor fell through to `default: return cleanLayout`, and the field was
 * deleted instead of added. Every zone accepted exactly one field and the second
 * drop silently did nothing. No type error, no crash, no console warning — and
 * no test, which is the only thing that would have caught it.
 *
 * So: an unknown zone is asserted here, and so is every other input a drop
 * handler can actually produce.
 */
import {
  availableFields,
  createEmptyLayout,
  defaultAggregationForField,
  describeFilterSelection,
  describeMove,
  fieldLabel,
  hasActiveFilters,
  isFilterActive,
  isLayoutRenderable,
  isValueSelected,
  moveFieldToZone,
  normalizeFilterSelection,
  removeFieldFromLayout,
  updateValueAggregation,
  zoneLabel,
  zoneOf,
  type PivotField,
  type PivotLayout,
} from "../packages/core/src/pivot";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(52)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};

const FIELDS: PivotField[] = [
  { key: "country", label: "Country", type: "dimension" },
  { key: "city", label: "City", type: "dimension" },
  { key: "salary", label: "Salary", type: "measure" },
];

const empty = createEmptyLayout();

console.log("\nthe empty layout");
t(empty, { rows: [], columns: [], values: [], filters: {} }, "starts with nothing anywhere");
t(zoneOf(empty, "country"), "available", "an unplaced field is 'available'");
t(availableFields(empty, FIELDS).map((x) => x.key), ["country", "city", "salary"], "everything is available");

console.log("\nmoving fields");
const a = moveFieldToZone(empty, "country", "rows");
t(a.rows, ["country"], "into rows");
t(zoneOf(a, "country"), "rows", "…and zoneOf agrees");
const b = moveFieldToZone(a, "city", "rows");
// THE BUG: the second field into a populated zone silently did nothing.
t(b.rows, ["country", "city"], "a SECOND field into a populated zone appends");
const c = moveFieldToZone(b, "salary", "values");
t(c.values, [{ id: "salary", aggregation: "sum" }], "into values, with an aggregation");
t(availableFields(c, FIELDS).map((x) => x.key), [], "nothing left available");

console.log("\na field lives in exactly one zone");
const moved = moveFieldToZone(c, "country", "columns");
t(moved.rows, ["city"], "moving out of rows removes it from rows");
t(moved.columns, ["country"], "…and adds it to columns");
t(zoneOf(moved, "country"), "columns", "…and it is only there");

console.log("\nindexes");
const three = moveFieldToZone(moveFieldToZone(moveFieldToZone(empty, "a", "rows"), "b", "rows"), "c", "rows");
t(three.rows, ["a", "b", "c"], "appended in order");
t(moveFieldToZone(three, "c", "rows", { index: 0 }).rows, ["c", "a", "b"], "reorder to the front");
t(moveFieldToZone(three, "a", "rows", { index: 2 }).rows, ["b", "c", "a"], "reorder to the back");
t(moveFieldToZone(three, "x", "rows", { index: 1 }).rows, ["a", "x", "b", "c"], "insert in the middle");
// A drop index comes from a pointer, not a contract.
t(moveFieldToZone(three, "x", "rows", { index: 99 }).rows, ["a", "b", "c", "x"], "an oversized index clamps to the end");
t(moveFieldToZone(three, "x", "rows", { index: -5 }).rows, ["x", "a", "b", "c"], "a negative index clamps to the front");

console.log("\nleaving the layout");
t(moveFieldToZone(c, "salary", "available").values, [], "moving to 'available' means leaving");
t(removeFieldFromLayout(c, "city").rows, ["country"], "removeFieldFromLayout");
t(removeFieldFromLayout(c, "nope"), c, "removing a field that is not there changes nothing");

console.log("\nthe zone that is not a zone — the bug that shipped");
// A drop used to resolve to "country" (a FIELD key parsed out of a DOM id).
// The old code's switch hit `default: return cleanLayout` and the field
// vanished. Whatever a caller passes, a field must never disappear silently.
const bogus = moveFieldToZone(c, "country", "nonsense" as never);
t(bogus, c, "an unknown zone changes NOTHING — the layout is returned as-is");
t(zoneOf(bogus, "country"), zoneOf(c, "country"), "…the field stays exactly where it was");
// The old code stripped the field first and then fell through to a `default`
// that returned the stripped layout — so an unrecognised zone deleted it.
t(bogus.rows.includes("country") || bogus.columns.includes("country"), true, "…and is emphatically not deleted");

console.log("\naggregations");
t(defaultAggregationForField(FIELDS[2]), "sum", "a measure sums");
// The old version ignored its argument and returned "sum" for everything, so a
// dimension in Values offered to sum a list of city names.
t(defaultAggregationForField(FIELDS[0]), "count", "a dimension counts, it cannot sum");
t(updateValueAggregation(c, "salary", "avg").values, [{ id: "salary", aggregation: "avg" }], "updateValueAggregation");
t(updateValueAggregation(c, "nope", "avg").values, c.values, "updating a field not in values changes nothing");
t(moveFieldToZone(empty, "country", "values", { aggregation: "count" }).values, [{ id: "country", aggregation: "count" }], "the aggregation can be given on the move");

console.log("\nrenderable");
t(isLayoutRenderable(empty), false, "nothing is not renderable");
t(isLayoutRenderable(moveFieldToZone(empty, "salary", "values")), false, "a measure with nothing to group by is not");
t(isLayoutRenderable(c), true, "rows + values is");
t(isLayoutRenderable(moveFieldToZone(moveFieldToZone(empty, "salary", "values"), "country", "columns")), true, "columns + values is");

console.log("\nlabels");
t(fieldLabel(FIELDS, "country"), "Country", "a known field");
t(fieldLabel(FIELDS, "unknown"), "unknown", "an unknown field falls back to its key");
t(zoneLabel("values"), "Values", "zoneLabel");
t(zoneLabel("available"), "Available fields", "zoneLabel: available");

console.log("\nfilter selection");
t(isFilterActive(undefined), false, "no selection is not a filter");
// An empty include list is the "nothing ticked" state, not a filter.
t(isFilterActive({ kind: "include", values: [] }), false, "an empty include list is not active");
t(isFilterActive({ kind: "include", values: ["a"] }), true, "an include list is active");
t(isFilterActive({ kind: "all", exclude: [] }), false, "all-with-nothing-excluded is not active");
t(isFilterActive({ kind: "all", exclude: ["a"] }), true, "all-except is active");
t(isFilterActive({ kind: "all", exclude: [], optionSearch: "x" }), true, "a search is active");
t(isFilterActive({ kind: "all", exclude: [], optionSearch: "  " }), false, "a whitespace search is not");

console.log("\nis a value selected?");
t(isValueSelected(undefined, "a"), true, "with no filter, everything is selected");
t(isValueSelected({ kind: "include", values: ["a"] }, "a"), true, "included");
t(isValueSelected({ kind: "include", values: ["a"] }, "b"), false, "not included");
t(isValueSelected({ kind: "all", exclude: ["a"] }, "a"), false, "excluded");
t(isValueSelected({ kind: "all", exclude: ["a"] }, "b"), true, "not excluded");

console.log("\nnormalising");
t(normalizeFilterSelection({ kind: "include", values: ["a", "a", "b", ""] }), { kind: "include", values: ["a", "b"] }, "dedupes and drops empties");
t(normalizeFilterSelection({ kind: "all", exclude: ["a", "a"], optionSearch: "  x  " }), { kind: "all", optionSearch: "x", exclude: ["a"] }, "trims the search");
t(normalizeFilterSelection({ kind: "all", exclude: [], optionSearch: "   " }), { kind: "all", exclude: [] }, "a blank search is dropped entirely");

console.log("\nhasActiveFilters");
t(hasActiveFilters({}), false, "none");
t(hasActiveFilters({ a: { kind: "include", values: [] } }), false, "an inactive one does not count");
t(hasActiveFilters({ a: { kind: "include", values: ["x"] } }), true, "an active one does");

console.log("\nwhat a chip says about its filter");
t(describeFilterSelection(undefined), "", "no filter, nothing to say");
t(describeFilterSelection({ kind: "include", values: ["Paris"] }), "Paris", "one value names it");
t(describeFilterSelection({ kind: "include", values: ["a", "b"] }), "2 selected", "several are counted");
t(describeFilterSelection({ kind: "all", exclude: ["a"] }), "All except 1", "all-except");
t(describeFilterSelection({ kind: "include", values: [] }), "", "an inactive filter says nothing");

console.log("\nwhat a screen reader hears when a field moves");
t(describeMove(FIELDS, "country", "rows"), "Country moved to Rows.", "a move");
t(describeMove(FIELDS, "country", "rows", 1), "Country moved to Rows at position 2.", "…with a position, 1-based");
t(describeMove(FIELDS, "country", "available"), "Country removed from the layout.", "a removal");

console.log("\nlayouts are never mutated");
// Every operation returns a new layout: the bindings hold these in signals and
// state, and mutating one in place is a re-render that never happens.
const before: PivotLayout = { rows: ["a"], columns: [], values: [], filters: {} };
const snapshot = JSON.stringify(before);
moveFieldToZone(before, "b", "rows");
removeFieldFromLayout(before, "a");
updateValueAggregation(before, "a", "avg");
t(JSON.stringify(before), snapshot, "the input is untouched by every operation");

console.log(f ? `\n${f} FAILED\n` : "\nall passed\n");
process.exit(f ? 1 : 0);
