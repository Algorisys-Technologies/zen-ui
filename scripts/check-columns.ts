/**
 * DataTable column management's pure contract: a column's name, moving a
 * column by one place, and the keyboard resize step.
 */
import { clampColumnSize, columnLabel, columnLayout, columnResizeDelta, moveColumn, orderedColumnIds, respectsColumnSizes, columnMinWidth, columnCellClass, columnHeaderClass, withUtilityPins, withoutUtilityPins, pinnedRowOrder } from "../packages/core/src/columns";

let f = 0;
let n = 0;
const t = (got: unknown, want: unknown, name: string) => {
  n++;
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(62)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
};

console.log("columnLabel");
const fn = () => null;
t(columnLabel({ id: "posting_date", columnDef: { header: fn, meta: { label: "Posting date" } } }), "Posting date", "meta.label names a function header");
t(columnLabel({ id: "posting_date", columnDef: { header: "Date", meta: { label: "Posting date" } } }), "Posting date", "…and wins over a string header");
t(columnLabel({ id: "posting_date", columnDef: { header: "Date" } }), "Date", "a string header, without meta.label");
t(columnLabel({ id: "posting_date", columnDef: { header: fn } }), "posting_date", "a function header, no label: the id");
t(columnLabel({ id: "x", columnDef: { header: "  ", meta: { label: "" } } }), "x", "blank label and header fall through to the id");
t(columnLabel({ id: "x", columnDef: { header: "X", meta: { label: 42 } } }), "X", "a non-string label is ignored");

console.log("\nmoveColumn");
const order = ["__select__", "a", "b", "c"];
const menu = ["a", "b", "c"];
t(moveColumn(order, "b", "later", menu), ["__select__", "a", "c", "b"], "later: one place");
t(moveColumn(order, "b", "earlier", menu), ["__select__", "b", "a", "c"], "earlier: one place");
t(moveColumn(order, "a", "earlier", menu), null, "the first managed column cannot move earlier…");
t(moveColumn(order, "c", "later", menu), null, "…nor the last later");
t(moveColumn(["a", "__drag__", "b"], "a", "later", ["a", "b"]), ["__drag__", "b", "a"], "steps over a column the menu does not list");
t(moveColumn(order, "zz", "later", menu), null, "an unknown id does not move");
t(moveColumn(["a", "b"], "a", "later"), ["b", "a"], "movable defaults to every column");
t(order, ["__select__", "a", "b", "c"], "the input order is not mutated");

console.log("\ncolumnResizeDelta");
t(columnResizeDelta("ArrowRight"), 16, "ArrowRight widens (LTR)");
t(columnResizeDelta("ArrowLeft"), -16, "ArrowLeft narrows (LTR)");
t(columnResizeDelta("ArrowRight", { shift: true }), 64, "Shift takes the large step");
t(columnResizeDelta("ArrowLeft", { rtl: true }), 16, "RTL: ArrowLeft widens (the handle is on the left)");
t(columnResizeDelta("ArrowRight", { rtl: true, shift: true }), -64, "RTL: Shift+ArrowRight narrows by the large step");
t(columnResizeDelta("ArrowUp"), null, "other keys are not ours");
t(columnResizeDelta("Enter"), null, "…Enter included");

console.log("\nclampColumnSize");
t(clampColumnSize(100, 16), 116, "adds the step");
t(clampColumnSize(30, -64), 20, "stops at the default minimum");
t(clampColumnSize(30, -64, 50), 50, "…or the column's own");
t(clampColumnSize(390, 64, 20, 400), 400, "stops at the column's maximum");
t(clampColumnSize(100.4, 16), 116, "whole pixels");

console.log("\norderedColumnIds");
const ids = ["a", "b", "c", "d"];
t(orderedColumnIds(ids), ["a", "b", "c", "d"], "no order: definition order");
t(orderedColumnIds(ids, ["c", "a"]), ["c", "a", "b", "d"], "listed ids first, the rest in definition order");
t(orderedColumnIds(ids, ["zz", "b", "b"]), ["b", "a", "c", "d"], "unknown and repeated ids are dropped");

console.log("\ncolumnLayout");
t(columnLayout(ids), { left: [], center: ["a", "b", "c", "d"], right: [] }, "nothing set: all in the centre");
t(columnLayout(ids, { visibility: { b: false, c: true } }), { left: [], center: ["a", "c", "d"], right: [] }, "false hides; true and absent show");
t(columnLayout(ids, { order: ["d", "c"], pinning: { left: ["b"], right: ["a"] } }), { left: ["b"], center: ["d", "c"], right: ["a"] }, "pinned sides, the centre in column order");
t(columnLayout(ids, { pinning: { left: ["c", "a"] } }).left, ["c", "a"], "left pins keep the pin list's order");
t(columnLayout(ids, { visibility: { a: false }, pinning: { left: ["a"] } }).left, [], "a hidden pinned column is not shown");
t(columnLayout(ids, { pinning: { left: ["a"], right: ["a"] } }), { left: ["a"], center: ["b", "c", "d"], right: [] }, "pinned to both sides counts as left");
t(columnLayout(ids, { pinning: { left: ["zz"] } }).left, [], "an unknown pinned id is ignored");

console.log("\nrespectsColumnSizes");
t(respectsColumnSizes({}), false, "off by default");
t(respectsColumnSizes({ enableColumnPinning: true }), true, "on with pinning");
t(respectsColumnSizes({ enableColumnResizing: true }), true, "on with resizing");
t(respectsColumnSizes({ enableColumnPinning: true, respectColumnSizes: false }), false, "an explicit false wins");
t(respectsColumnSizes({ respectColumnSizes: true }), true, "or turned on by itself");

console.log("\ncolumnMinWidth");
t(columnMinWidth(false, { size: 180, explicitSize: 180 }), undefined, "not respecting: no minimum");
t(columnMinWidth(true, { size: 150 }), undefined, "an unsized column stays automatic");
t(columnMinWidth(true, { size: 180, explicitSize: 180 }), 180, "an explicit size is the minimum");
t(columnMinWidth(true, { size: 212.6, resized: true }), 213, "a resized width, whole pixels");
t(columnMinWidth(true, { size: 150, pinned: true }), 150, "a pinned column, even unsized (its offset assumes it)");
t(columnMinWidth(true, { size: 36, explicitSize: 36 }), 36, "utility columns too (the selection checkbox)");

console.log("\ncolumn classes (meta.className / meta.headerClassName)");
t(columnCellClass({ className: "zen-text-end" }, { original: {} }), "zen-text-end", "a string applies to body cells");
t(columnCellClass({ className: "zen-text-end" }), "zen-text-end", "…and to the footer");
const neg = (r: { amount: number }) => r.amount < 0 && "zen-text-zen-error";
t(columnCellClass({ className: neg }, { original: { amount: -5 } }), "zen-text-zen-error", "a function sees the row's original data");
t(columnCellClass({ className: neg }, { original: { amount: 5 } }), undefined, "…and false means no class");
t(columnCellClass({ className: neg }), undefined, "a function is not asked about the footer");
t(columnCellClass(undefined, { original: {} }), undefined, "no meta: nothing");
t(columnHeaderClass({ headerClassName: "zen-text-end" }), "zen-text-end", "headerClassName");
t(columnHeaderClass({ className: "x" }), undefined, "className is not the header's");

console.log("\nutility columns pin with the left pins");
const util = ["__drag__", "__select__"];
t(withUtilityPins({ left: ["name"], right: ["total"] }, util), { left: ["__drag__", "__select__", "name"], right: ["total"] }, "left pins present: drag and select go first");
t(withUtilityPins({ left: [], right: ["total"] }, util), { left: [], right: ["total"] }, "nothing pinned left: utilities scroll as before");
t(withUtilityPins({}, util), { left: [], right: [] }, "an empty state");
t(withUtilityPins({ left: ["__select__", "name"] }, util), { left: ["__drag__", "__select__", "name"], right: [] }, "never duplicated, kept in display order");
t(withUtilityPins({ left: ["name"] }, []), { left: ["name"], right: [] }, "no utility columns: unchanged");
t(withoutUtilityPins({ left: ["__drag__", "__select__", "name"], right: ["total", "__expand__"] }), { left: ["name"], right: ["total"] }, "what the app is told: its own pins only");

console.log("\nrow pinning (the order vanilla renders; TanStack's in React and Solid)");
const all = ["a", "b", "c", "d", "e"].map((id) => ({ id }));
const idOf = (r: { id: string }) => r.id;
const pinOrder = (xs: { id: string }[]) => xs.map(idOf).join("");
const page = all.slice(0, 3); // a b c: the page / the filter's result
t(pinOrder(pinnedRowOrder(all, page, idOf, {}).rows), "abc", "nothing pinned: the display, untouched");
t(pinOrder(pinnedRowOrder(all, page, idOf, { top: ["c"], bottom: ["a"] }).rows), "cba", "top first, bottom last, the rest between");
t(pinOrder(pinnedRowOrder(all, page, idOf, { top: ["e"] }).rows), "eabc", "a pinned row off the page (or filtered out) still shows");
t(pinOrder(pinnedRowOrder(all, page, idOf, { top: ["d", "b"] }).rows), "dbac", "top rows keep the pin order");
t(pinOrder(pinnedRowOrder(all, page, idOf, { top: ["zz"], bottom: ["a"] }).rows), "bca", "an id that is not in the data is ignored");
const sides = pinnedRowOrder(all, page, idOf, { top: ["c"], bottom: ["a", "e"] });
t([[...sides.top], [...sides.bottom]], [["c"], ["a", "e"]], "and says which rows are top and bottom");

console.log(f ? `\n${f} FAILED (of ${n})` : `\nall ${n} passed`);
process.exit(f ? 1 : 0);
