/**
 * DataTable per-column filter semantics (core/column-filter): the same
 * predicates React's and Solid's TanStack FilterFns apply, case for case, and
 * the chip text React's ActiveFilterChips shows.
 */
import { columnFilterMatches as m, describeColumnFilter as d } from "../packages/core/src/column-filter";

let f = 0;
let n = 0;
const t = (got: unknown, want: unknown, name: string) => {
  n++;
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(60)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
};

console.log("text (the default)");
t(m(undefined, "Ada Lovelace", undefined), true, "no filter passes");
t(m("text", "Ada Lovelace", "  "), true, "blank passes");
t(m("text", "Ada Lovelace", "love"), true, "a bare string is contains, case-insensitive");
t(m(undefined, "Ada Lovelace", { op: "contains", value: "ADA" }), true, "contains");
t(m("text", "Ada Lovelace", { op: "equals", value: "ada" }), false, "equals is the whole value");
t(m("text", "Ada", { op: "equals", value: " ada " }), true, "…trimmed and case-insensitive");
t(m("text", "Ada Lovelace", { op: "starts", value: "ada" }), true, "starts");
t(m("text", "Ada Lovelace", { op: "ends", value: "lace" }), true, "ends");
t(m("text", null, { op: "contains", value: "x" }), false, "a null cell matches nothing");

console.log("\nnumber");
t(m("number", 5, { op: "gt", value: null }), true, "no value passes");
t(m("number", 5, { op: "gte", value: 5 }), true, "gte");
t(m("number", 5, { op: "gt", value: 5 }), false, "gt");
t(m("number", "12", { op: "eq", value: 12 }), true, "a numeric string cell compares as a number");
t(m("number", "n/a", { op: "ne", value: 1 }), false, "a non-number cell fails any set filter");
t(m("number", 3, { op: "lte", value: 2 }), false, "lte");

console.log("\nnumberRange");
t(m("numberRange", 5, [null, null]), true, "open both ends passes");
t(m("numberRange", 5, [5, 10]), true, "inclusive ends");
t(m("numberRange", 11, [null, 10]), false, "above max");
t(m("numberRange", 4, [5, null]), false, "below min");

console.log("\nselect / boolean");
t(m("select", "Admin", ""), true, "select: empty passes");
t(m("select", 1, "1"), true, "select compares as strings");
t(m("select", "Admin", "Member"), false, "select: another value fails");
t(m("boolean", false, "any"), true, "boolean: any passes");
t(m("boolean", 1, true), true, "boolean: truthy cell is true");
t(m("boolean", 0, "true"), false, "boolean: the string true is true");

console.log("\nchips (describeColumnFilter)");
t(d(undefined), "", "nothing: no chip");
t(d([null, null]), "", "an open range: no chip");
t(d([null, 9]), "≤ 9", "max only");
t(d([3, null]), "≥ 3", "min only");
t(d([3, 9]), "3 – 9", "both ends");
t(d({ op: "gte", value: 60000 }), "≥ 60000", "number op");
t(d({ op: "contains", value: "ada" }), "≈ ada", "text op");
t(d({ op: "contains", value: "" }), "", "an op with no value: no chip");
t(d(true, { yes: "Ja", no: "Nein" }), "Ja", "boolean in the caller's words");
t(d("Admin"), "Admin", "a scalar as itself");

console.log(f ? `\n${f} FAILED (of ${n})` : `\nall ${n} passed`);
process.exit(f ? 1 : 0);
