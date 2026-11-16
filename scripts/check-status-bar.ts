/**
 * Status bar contract.
 *
 *   bun run check:status-bar
 *
 * The pure half of StatusBar: which items show, on which side, and which
 * give way when the bar is too narrow for all of them.
 *
 *  - `hidden` items never show. Items without `align` sit at the start.
 *  - When the measured widths (plus the gap between neighbours) exceed the
 *    room, the LOWEST `priority` goes first; between equals, the one later in
 *    the list — the list order is the author's order of importance.
 *  - An item whose width is not known yet is counted as 0, never hidden for it.
 *  - A bar that has not been measured (room <= 0: not in the document,
 *    display:none, server render) hides nothing.
 */
import { statusBarCollapse, statusBarSides } from "../packages/core/src/status-bar";

let f = 0, n = 0;
const t = (got: unknown, want: unknown, name: string) => {
  n++;
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(66)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
};
const ids = (xs: { id: string }[]) => xs.map((x) => x.id);

const items = [
  { id: "branch" },
  { id: "sync", align: "start" as const, priority: 1 },
  { id: "errors", align: "end" as const, priority: 5 },
  { id: "cursor", align: "end" as const },
  { id: "draft", hidden: true },
];
const sides = statusBarSides(items);
t([ids(sides.start), ids(sides.end)], [["branch", "sync"], ["errors", "cursor"]], "sides keep list order; no align is start; hidden dropped");
t(ids(statusBarSides([]).start), [], "no items: empty sides");

const W = { branch: 100, sync: 60, errors: 80, cursor: 90 };
// 4 items, 3 gaps of 8: 330 + 24 = 354.
t(statusBarCollapse(items, W, 354, 8), [], "exactly fits: nothing hidden");
t(statusBarCollapse(items, W, 353, 8), ["cursor"], "1px short: of the two priority-0 items the later goes");
// without cursor: 240 + 16 = 256
t(statusBarCollapse(items, W, 256, 8), ["cursor"], "dropping one is enough when it is enough");
t(statusBarCollapse(items, W, 255, 8), ["cursor", "branch"], "then the earlier priority-0 item");
// errors + sync: 140 + 8 = 148; errors alone 80
t(statusBarCollapse(items, W, 148, 8), ["cursor", "branch"], "priority 1 outlasts priority 0");
t(statusBarCollapse(items, W, 147, 8), ["cursor", "branch", "sync"], "then priority 1");
t(statusBarCollapse(items, W, 80, 8), ["cursor", "branch", "sync"], "the highest stays while it fits");
t(statusBarCollapse(items, W, 79, 8), ["cursor", "branch", "sync", "errors"], "nothing fits: everything goes");
t(statusBarCollapse(items, W, 0, 8), [], "unmeasured bar (0): hides nothing");
t(statusBarCollapse(items, W, -5, 8), [], "negative room: hides nothing");
t(statusBarCollapse(items, { branch: 100 }, 124, 8), [], "unknown widths count as 0; their gaps still count (100 + 3*8)");
t(statusBarCollapse(items, { ...W, draft: 500 }, 354, 8), [], "a hidden item's width is ignored");
t(statusBarCollapse([{ id: "a", priority: -1 }, { id: "b" }], { a: 50, b: 50 }, 60, 8), ["a"], "a negative priority goes before the default");
t(statusBarCollapse(items, W, 353, 0), [], "gap 0: 330 fits in 353");

console.log(`\n${f === 0 ? `all passed (${n})` : `${f} of ${n} FAILED`}`);
process.exit(f === 0 && n > 0 ? 0 : 1);
