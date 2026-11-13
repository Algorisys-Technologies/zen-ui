/**
 * Column mapper contract.
 *
 *   bun run check:column-mapper
 *
 * The pure half of ColumnMapper: a file's columns onto an app's fields.
 *
 *  - Parsing handles what real exports contain: quoted fields with the
 *    delimiter or a newline inside, doubled quotes, a byte-order mark, CRLF.
 *    The delimiter is detected (",", ";", tab, "|") by which one splits every
 *    line into the same number of columns — European Excel writes ";".
 *  - Auto-mapping matches exactly on a field's id, label or aliases, ignoring
 *    case, accents and punctuation. It never fuzzy-guesses: a wrong guess
 *    imports bad data silently, an unmapped column is merely visible.
 *  - Validation names every problem with its row and column: a required field
 *    nobody mapped, two columns onto one field, an empty required cell, a
 *    number or date that does not parse.
 */
import { parseDelimited, detectDelimiter, autoMap, validateMapping, type MapperField } from "../packages/core/src/column-mapper";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(64)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
};

console.log("\nparsing");
t(parseDelimited("a,b\n1,2"), [["a", "b"], ["1", "2"]], "plain CSV");
t(parseDelimited('name,note\n"Smith, J","said ""hi"""'), [["name", "note"], ["Smith, J", 'said "hi"']], "quoted delimiter and doubled quotes");
t(parseDelimited('a,b\n"line one\nline two",x'), [["a", "b"], ["line one\nline two", "x"]], "a newline inside quotes stays in the field");
t(parseDelimited("﻿a,b\r\n1,2\r\n"), [["a", "b"], ["1", "2"]], "BOM stripped, CRLF handled, trailing newline ignored");
t(parseDelimited("a;b\n1,5;2", { delimiter: ";" }), [["a", "b"], ["1,5", "2"]], "a given delimiter");
t(parseDelimited("a,b\n\n1,2\n"), [["a", "b"], ["1", "2"]], "blank lines skipped");

console.log("\ndelimiter detection");
t(detectDelimiter("sku;qty;price\nA1;5;1,50\nB2;7;2,25"), ";", "European export: ';' (the commas are decimals)");
t(detectDelimiter("sku,qty\nA1,5\nB2,7"), ",", "comma");
t(detectDelimiter("sku\tqty\nA1\t5"), "\t", "tab");
t(detectDelimiter('a|b\n"x|y"|z'), "|", "pipe, ignoring one inside quotes");
t(detectDelimiter("just one column\nvalue"), ",", "nothing splits: comma by default");

console.log("\nauto-mapping");
const fields: MapperField[] = [
  { id: "sku", label: "SKU", required: true, aliases: ["item code", "material"] },
  { id: "qty", label: "Quantity", type: "number", required: true },
  { id: "due", label: "Due date", type: "date" },
  { id: "note", label: "Note" },
];
t(
  autoMap(["Item Code", "QUANTITY", "Due-Date", "Remarks", "Fällig"], fields),
  { "Item Code": "sku", QUANTITY: "qty", "Due-Date": "due" },
  "id, label and alias match; case and punctuation ignored; no guessing",
);
t(autoMap(["Material", "material"], fields), { Material: "sku" }, "a field is auto-mapped once, to the first match");
t(autoMap(["Quantité"], [{ id: "quantite", label: "Quantité" }]), { "Quantité": "quantite" }, "accents ignored");

console.log("\nvalidation");
const rows = [
  ["Item Code", "QUANTITY", "Due-Date"],
  ["A1", "5", "2026-11-20"],
  ["", "7", "next week"],
  ["B2", "five", ""],
];
const v = validateMapping({ "Item Code": "sku", QUANTITY: "qty", "Due-Date": "due" }, fields, rows);
t(v.missing, [], "nothing required is unmapped");
t(v.duplicates, [], "no field mapped twice");
t(
  v.cellErrors.map((e) => `${e.row}:${e.column}:${e.kind}`),
  ["2:Item Code:required", "2:Due-Date:date", "3:QUANTITY:number"],
  "each bad cell with its row (1-based, header excluded) and column",
);
t([v.validRows, v.totalRows, v.ok], [1, 3, false], "1 of 3 rows clean; not ok");
const m2 = validateMapping({ "Item Code": "sku", Other: "sku" }, fields, [["Item Code", "Other"], ["A", "B"]]);
t([m2.missing, m2.duplicates], [["qty"], ["sku"]], "a required field unmapped, and one mapped twice");
t(validateMapping({ "Item Code": "sku", QUANTITY: "qty" }, fields, [["Item Code", "QUANTITY"], ["A", "1.5"], ["B", "1,200"]]).cellErrors.length, 0, "1.5 and 1,200 both read as numbers (en)");
t(validateMapping({ a: "qty" }, [{ id: "qty", label: "Qty", type: "number" }], [["a"], ["1,5"]], { locale: "de-DE" }).cellErrors.length, 0, "1,5 is a number in German");

console.log(`\n${f === 0 ? "all passed" : `${f} FAILED`}`);
process.exit(f === 0 ? 0 : 1);
