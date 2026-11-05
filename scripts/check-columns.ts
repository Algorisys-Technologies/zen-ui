/**
 * DataTable column management's pure contract: a column's name, moving a
 * column by one place, and the keyboard resize step.
 */
import { clampColumnSize, columnLabel, columnResizeDelta, moveColumn } from "../packages/core/src/columns";

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

console.log(f ? `\n${f} FAILED (of ${n})` : `\nall ${n} passed`);
process.exit(f ? 1 : 0);
