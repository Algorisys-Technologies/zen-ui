/**
 * DataTable row keyboard contract.
 *
 *   bun run check:row-keys
 *
 * The pure half of DataTable's keyboard navigation: which row each key lands
 * on. Every binding calls it. The invariant re-checked everywhere is that the
 * target is always a real row, for any start, count and key.
 */
import { rowKeyTarget, ownsArrowKeys, ROW_PAGE_STEP } from "../packages/core/src/row-keys";

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

if (failed) { console.error(`\ncheck:row-keys — ${failed} of ${checked} failed`); process.exit(1); }
console.log(`check:row-keys — ${checked} assertions passed (${combos} key × start × count combinations)`);
