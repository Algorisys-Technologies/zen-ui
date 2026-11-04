/**
 * DataTable cell range and clipboard contract.
 *
 *   bun run check:grid-range
 *
 * The pure half of DataTable's cell navigation: what a selection covers, the
 * text a copy writes, how a paste is read and where it lands. Every binding
 * calls it. The invariants re-checked everywhere: a copy pastes back to the
 * same cells, whatever they hold, and a paste never lands outside the grid.
 */
import {
  rangeRect, inRect, rectSize, clampRange, tsvCell, toTsv, parseTsv, pastePlan,
} from "../packages/core/src/grid-range";

let failed = 0, checked = 0;
const eq = (label: string, got: unknown, want: unknown) => {
  checked++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { failed++; console.error(`FAIL ${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); }
};

/* ranges */
eq("rect from a backwards drag", rangeRect({ anchor: { row: 5, col: 3 }, focus: { row: 2, col: 1 } }), { top: 2, left: 1, bottom: 5, right: 3 });
eq("single cell rect", rangeRect({ anchor: { row: 4, col: 4 }, focus: { row: 4, col: 4 } }), { top: 4, left: 4, bottom: 4, right: 4 });
eq("inRect corner", inRect({ top: 2, left: 1, bottom: 5, right: 3 }, 5, 3), true);
eq("inRect outside", inRect({ top: 2, left: 1, bottom: 5, right: 3 }, 6, 3), false);
eq("rect size", rectSize({ top: 2, left: 1, bottom: 5, right: 3 }), { rows: 4, cols: 3 });
eq("clamp after rows went", clampRange({ anchor: { row: 9, col: 1 }, focus: { row: 12, col: 7 } }, 5, 4), { anchor: { row: 4, col: 1 }, focus: { row: 4, col: 3 } });
eq("clamp, empty grid", clampRange({ anchor: { row: 0, col: 0 }, focus: { row: 0, col: 0 } }, 0, 4), null);

/* writing */
eq("plain cell", tsvCell("Pune"), "Pune");
eq("tab is quoted", tsvCell("a\tb"), '"a\tb"');
eq("newline is quoted", tsvCell("line 1\nline 2"), '"line 1\nline 2"');
eq("quote is doubled", tsvCell('5" pipe'), '"5"" pipe"');
eq("rows and cells", toTsv([["a", "b"], ["c", "d"]]), "a\tb\r\nc\td");

/* reading what spreadsheets write */
eq("excel's trailing newline", parseTsv("a\tb\r\nc\td\r\n"), [["a", "b"], ["c", "d"]]);
eq("LF line ends", parseTsv("a\tb\nc\td\n"), [["a", "b"], ["c", "d"]]);
eq("no trailing newline", parseTsv("a\tb"), [["a", "b"]]);
eq("one value", parseTsv("42"), [["42"]]);
eq("empty cells kept", parseTsv("a\t\tc\r\n\tb\t\r\n"), [["a", "", "c"], ["", "b", ""]]);
eq("an empty row", parseTsv("a\r\n\r\nb\r\n"), [["a"], [""], ["b"]]);
eq("quoted cell with a newline", parseTsv('"line 1\nline 2"\tx\r\n'), [["line 1\nline 2", "x"]]);
eq("quoted cell with a tab", parseTsv('"a\tb"\tc'), [["a\tb", "c"]]);
eq("doubled quotes", parseTsv('"5"" pipe"'), [['5" pipe']]);
eq("a quote that does not open a cell", parseTsv('5" pipe\t3'), [['5" pipe', "3"]]);
eq("an unclosed quote is text", parseTsv('"abc\tdef'), [['"abc', "def"]]);
eq("nothing", parseTsv(""), []);

/* round trip: any cell text survives copy then paste */
const nasty = ["", "plain", "a\tb", "line 1\nline 2", "crlf\r\ninside", '"quoted"', '5" pipe', '""', " spaced ", "\t", "\n", "\"\t\n\"", "₹ 1,50,000", "x\r"];
let combos = 0;
for (const a of nasty) for (const b of nasty) {
  const grid = [[a, b], [b, a]];
  eq(`round trip ${JSON.stringify([a, b])}`, parseTsv(toTsv(grid) + "\r\n"), grid);
  combos++;
}

/* paste plan */
const sel = (top: number, left: number, bottom = top, right = left) => ({ top, left, bottom, right });
eq("block from the active cell", pastePlan([["1", "2"], ["3", "4"]], sel(1, 1), 10, 10), [
  { row: 1, col: 1, value: "1" }, { row: 1, col: 2, value: "2" }, { row: 2, col: 1, value: "3" }, { row: 2, col: 2, value: "4" },
]);
eq("clipped at the right edge", pastePlan([["1", "2", "3"]], sel(0, 3), 5, 4), [{ row: 0, col: 3, value: "1" }]);
eq("clipped at the bottom", pastePlan([["1"], ["2"], ["3"]], sel(4, 0), 5, 2), [{ row: 4, col: 0, value: "1" }]);
eq("one value fills a selection", pastePlan([["x"]], sel(0, 0, 1, 1), 5, 5), [
  { row: 0, col: 0, value: "x" }, { row: 0, col: 1, value: "x" }, { row: 1, col: 0, value: "x" }, { row: 1, col: 1, value: "x" },
]);
eq("a block ignores the selection's size", pastePlan([["1", "2"]], sel(0, 0, 3, 3), 5, 5), [{ row: 0, col: 0, value: "1" }, { row: 0, col: 1, value: "2" }]);
eq("nothing to paste", pastePlan([], sel(0, 0), 5, 5), []);
// Never outside the grid, for any block at any origin.
for (let rows = 1; rows <= 6; rows++) for (let cols = 1; cols <= 6; cols++)
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const plan = pastePlan([["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"]], sel(r, c), rows, cols);
    const outside = plan.filter((t) => t.row < 0 || t.row >= rows || t.col < 0 || t.col >= cols);
    eq(`paste at ${r},${c} in ${rows}x${cols} stays inside`, outside.length, 0);
    eq(`paste at ${r},${c} in ${rows}x${cols} fills what fits`, plan.length, Math.min(3, rows - r) * Math.min(3, cols - c));
    combos++;
  }

if (failed) { console.error(`\ncheck:grid-range — ${failed} of ${checked} failed`); process.exit(1); }
console.log(`check:grid-range — ${checked} assertions passed (${combos} round-trip and paste combinations)`);
