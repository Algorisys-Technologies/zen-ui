/**
 * TreeSelect contract.
 *
 *   bun run check:tree-select
 *
 * The pure half of picking from a hierarchy: the rows on screen, paths, a
 * search that keeps every match under its ancestors, and where the keys move.
 * Invariants re-checked everywhere: a filtered tree contains every match and
 * every match's ancestors, and nothing else that does not match; every key
 * from every row lands on a real row.
 */
import {
  visibleRows, pathTo, findNode, isSelectable, filterTree, treeKeyTarget,
  type TreeSelectNode,
} from "../packages/core/src/tree-select";

let failed = 0, checked = 0;
const eq = (label: string, got: unknown, want: unknown) => {
  checked++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { failed++; console.error(`FAIL ${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); }
};

const n = (id: string, label: string, children?: TreeSelectNode[], disabled?: boolean): TreeSelectNode =>
  ({ id, label, ...(children ? { children } : {}), ...(disabled ? { disabled } : {}) });

// A small chart of accounts: "Cash" twice, under two parents.
const COA: TreeSelectNode[] = [
  n("assets", "Assets", [
    n("current", "Current Assets", [n("cash-1", "Cash"), n("bank", "Bank Accounts", [n("hdfc", "HDFC Current"), n("sbi", "SBI Savings")])]),
    n("fixed", "Fixed Assets", [n("plant", "Plant & Machinery")]),
  ]),
  n("liabilities", "Liabilities", [n("cash-2", "Cash Credit"), n("loans", "Loans", [], true)]),
  n("income", "Income"),
];

/* rows */
const ids = (rows: { node: TreeSelectNode }[]) => rows.map((r) => r.node.id);
eq("collapsed: roots only", ids(visibleRows(COA, new Set())), ["assets", "liabilities", "income"]);
eq("one open", ids(visibleRows(COA, new Set(["assets"]))), ["assets", "current", "fixed", "liabilities", "income"]);
eq("a closed parent hides an open child", ids(visibleRows(COA, new Set(["current"]))), ["assets", "liabilities", "income"]);
const deep = visibleRows(COA, new Set(["assets", "current", "bank"]));
eq("levels and set positions", deep.filter((r) => r.node.id === "sbi").map((r) => [r.level, r.posInSet, r.setSize, r.parentId]), [[4, 2, 2, "bank"]]);
eq("an empty children array is a leaf", visibleRows(COA, new Set(["liabilities"])).find((r) => r.node.id === "loans")!.hasChildren, false);

/* paths */
eq("path", pathTo(COA, "hdfc")!.map((x) => x.label), ["Assets", "Current Assets", "Bank Accounts", "HDFC Current"]);
eq("no such id", pathTo(COA, "nope"), null);
eq("findNode", findNode(COA, "plant")!.label, "Plant & Machinery");
eq("selectable leaf", isSelectable(findNode(COA, "cash-1")!, true), true);
eq("a group is not, leaves only", isSelectable(findNode(COA, "bank")!, true), false);
eq("a group is, otherwise", isSelectable(findNode(COA, "bank")!, false), true);
eq("disabled never", isSelectable(findNode(COA, "loans")!, false), false);

/* filtering */
const f = filterTree(COA, "cash");
eq("matches", [...f.matches].sort(), ["cash-1", "cash-2"]);
eq("ancestors opened", [...f.expand].sort(), ["assets", "current", "liabilities"]);
eq("rows of the filtered tree, opened", ids(visibleRows(f.items, f.expand)), ["assets", "current", "cash-1", "liabilities", "cash-2"]);
eq("case and accents ignored", [...filterTree([n("a", "Café Supplies")], "CAFE").matches], ["a"]);
eq("a matching group keeps its children", ids(visibleRows(filterTree(COA, "bank").items, new Set(["assets", "current", "bank"]))), ["assets", "current", "bank", "hdfc", "sbi"]);
eq("blank query: the tree, nothing opened", [filterTree(COA, "  ").items === COA, filterTree(COA, "").expand.size], [true, 0]);
eq("no match: nothing", filterTree(COA, "zzz").items, []);
// Invariant: every match and every ancestor of a match is in the filtered tree, and every node in it is one of those.
const all = (items: TreeSelectNode[]): TreeSelectNode[] => items.flatMap((x) => [x, ...all(x.children ?? [])]);
let combos = 0;
for (const q of ["a", "as", "cash", "c", "s", "bank", "in", "e", "Current", "x", "ss", "&"]) {
  const r = filterTree(COA, q);
  const kept = new Set(all(r.items).map((x) => x.id));
  const need = new Set<string>();
  for (const m of r.matches) for (const p of pathTo(COA, m)!) need.add(p.id);
  for (const id of need) eq(`"${q}": ${id} kept`, kept.has(id), true);
  for (const id of kept) {
    const node = findNode(COA, id)!;
    const underMatch = pathTo(COA, id)!.some((p) => r.matches.has(p.id));
    eq(`"${q}": ${id} belongs`, need.has(id) || underMatch || node === undefined, true);
  }
  combos++;
}

/* keys */
const rows = visibleRows(COA, new Set(["assets"])); // assets, current, fixed, liabilities, income
eq("↓", treeKeyTarget("ArrowDown", rows, 0), { kind: "move", index: 1 });
eq("↓ at the end stays", treeKeyTarget("ArrowDown", rows, 4), { kind: "move", index: 4 });
eq("↑ at the start stays", treeKeyTarget("ArrowUp", rows, 0), { kind: "move", index: 0 });
eq("→ on a closed group opens it", treeKeyTarget("ArrowRight", rows, 1), { kind: "expand", id: "current" });
eq("→ on an open group steps in", treeKeyTarget("ArrowRight", rows, 0), { kind: "move", index: 1 });
eq("→ on a leaf does nothing", treeKeyTarget("ArrowRight", rows, 4), null);
eq("← on an open group closes it", treeKeyTarget("ArrowLeft", rows, 0), { kind: "collapse", id: "assets" });
eq("← on a child goes to its parent", treeKeyTarget("ArrowLeft", rows, 2), { kind: "move", index: 0 });
eq("← on a closed root does nothing", treeKeyTarget("ArrowLeft", rows, 3), null);
eq("other keys", treeKeyTarget("Enter", rows, 0), null);
eq("no rows", treeKeyTarget("ArrowDown", [], 0), null);
// Invariant: from every row of every expansion, a move lands on a real row and an expand/collapse names a group in view.
const groups = ["assets", "current", "bank", "fixed", "liabilities"];
for (let mask = 0; mask < 1 << groups.length; mask++) {
  const open = new Set(groups.filter((_, i) => mask & (1 << i)));
  const rs = visibleRows(COA, open);
  rs.forEach((_, i) => {
    for (const key of ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"]) {
      const t = treeKeyTarget(key, rs, i);
      if (!t) continue;
      if (t.kind === "move") eq(`${key} from ${i}: a row`, t.index >= 0 && t.index < rs.length, true);
      else eq(`${key} from ${i}: a group in view`, rs.some((r) => r.node.id === t.id && r.hasChildren), true);
    }
    combos++;
  });
}

if (failed) { console.error(`\ncheck:tree-select — ${failed} of ${checked} failed`); process.exit(1); }
console.log(`check:tree-select — ${checked} assertions passed (${combos} query and key combinations)`);
