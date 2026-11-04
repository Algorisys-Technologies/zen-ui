/**
 * DataTable row keyboard contract.
 *
 *   bun run check:row-keys
 *
 * The pure half of DataTable's keyboard navigation: which row each key lands
 * on. Every binding calls it. The invariant re-checked everywhere is that the
 * target is always a real row, for any start, count and key.
 */
import { rowKeyTarget, ownsArrowKeys, cellKeyTarget, ROW_PAGE_STEP } from "../packages/core/src/row-keys";

let failed = 0, checked = 0;
const eq = (label: string, got: unknown, want: unknown) => {
  checked++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { failed++; console.error(`FAIL ${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); }
};

eq("down", rowKeyTarget("ArrowDown", 3, 20), 4);
eq("up", rowKeyTarget("ArrowUp", 3, 20), 2);
eq("down at the end stays", rowKeyTarget("ArrowDown", 19, 20), 19);
eq("up at the start stays", rowKeyTarget("ArrowUp", 0, 20), 0);
eq("home", rowKeyTarget("Home", 7, 20), 0);
eq("end", rowKeyTarget("End", 7, 20), 19);
eq("page down", rowKeyTarget("PageDown", 3, 20), 3 + ROW_PAGE_STEP);
eq("page down clamps", rowKeyTarget("PageDown", 15, 20), 19);
eq("page up clamps", rowKeyTarget("PageUp", 4, 20), 0);
eq("page step given", rowKeyTarget("PageDown", 0, 20, 5), 5);
eq("not a movement key", rowKeyTarget("Enter", 3, 20), null);
eq("letters are not movement", rowKeyTarget("a", 3, 20), null);
eq("no rows", rowKeyTarget("ArrowDown", 0, 0), null);
eq("index past the end (rows shrank) is clamped first", rowKeyTarget("ArrowUp", 30, 5), 3);
eq("negative index (nothing focused yet)", rowKeyTarget("ArrowDown", -1, 5), 1);

// For any start, count and key: a real row.
let combos = 0;
for (const key of ["ArrowDown", "ArrowUp", "Home", "End", "PageDown", "PageUp"]) {
  for (let count = 1; count <= 25; count++) {
    for (let index = -2; index <= count + 2; index++) {
      const t = rowKeyTarget(key, index, count);
      combos++;
      if (t === null || t < 0 || t >= count || !Number.isInteger(t)) eq(`${key} from ${index} of ${count} is a row`, t, "a row");
    }
  }
}
checked += combos;

const el = (tag: string, role?: string, editable = false) =>
  ({ tagName: tag, isContentEditable: editable, getAttribute: (n: string) => (n === "role" ? role ?? null : null) }) as unknown as Element;
eq("input owns arrows", ownsArrowKeys(el("INPUT")), true);
eq("textarea owns arrows", ownsArrowKeys(el("TEXTAREA")), true);
eq("select owns arrows", ownsArrowKeys(el("SELECT")), true);
eq("contenteditable owns arrows", ownsArrowKeys(el("DIV", undefined, true)), true);
eq("combobox owns arrows", ownsArrowKeys(el("BUTTON", "combobox")), true);
eq("a row does not", ownsArrowKeys(el("TR")), false);
eq("a link does not", ownsArrowKeys(el("A")), false);
eq("a checkbox button does not", ownsArrowKeys(el("BUTTON", "checkbox")), false);
eq("nothing", ownsArrowKeys(null), false);

// --- grid cells
const c = (row: number, col: number) => ({ row, col });
eq("cell down", cellKeyTarget("ArrowDown", c(1, 2), 5, 4), c(2, 2));
eq("cell up at top stays", cellKeyTarget("ArrowUp", c(0, 2), 5, 4), c(0, 2));
eq("cell right", cellKeyTarget("ArrowRight", c(1, 2), 5, 4), c(1, 3));
eq("cell right at the edge stays (no wrap)", cellKeyTarget("ArrowRight", c(1, 3), 5, 4), c(1, 3));
eq("cell left at the edge stays", cellKeyTarget("ArrowLeft", c(1, 0), 5, 4), c(1, 0));
eq("home: row start", cellKeyTarget("Home", c(3, 2), 5, 4), c(3, 0));
eq("end: row end", cellKeyTarget("End", c(3, 1), 5, 4), c(3, 3));
eq("ctrl+home: first cell", cellKeyTarget("Home", c(3, 2), 5, 4, true), c(0, 0));
eq("ctrl+end: last cell", cellKeyTarget("End", c(1, 1), 5, 4, true), c(4, 3));
eq("page down clamps", cellKeyTarget("PageDown", c(1, 1), 5, 4), c(4, 1));
eq("enter is not movement", cellKeyTarget("Enter", c(1, 1), 5, 4), null);
eq("empty grid", cellKeyTarget("ArrowDown", c(0, 0), 0, 4), null);
eq("a row removed under focus is clamped", cellKeyTarget("ArrowUp", c(9, 1), 3, 4), c(1, 1));
let cells = 0;
for (const key of ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End", "PageDown", "PageUp"]) {
  for (const ctrl of [false, true]) for (let rows = 1; rows <= 6; rows++) for (let cols = 1; cols <= 5; cols++) {
    for (let r = -1; r <= rows; r++) for (let k = -1; k <= cols; k++) {
      const t = cellKeyTarget(key, c(r, k), rows, cols, ctrl);
      cells++;
      if (!t || t.row < 0 || t.row >= rows || t.col < 0 || t.col >= cols) eq(`${key} ${ctrl} from ${r},${k} in ${rows}x${cols} is a cell`, t, "a cell");
    }
  }
}
checked += cells;
combos += cells;

if (failed) { console.error(`\ncheck:row-keys — ${failed} of ${checked} failed`); process.exit(1); }
console.log(`check:row-keys — ${checked} assertions passed (${combos} key × start × count combinations)`);
