/**
 * Genealogy contract.
 *
 *   bun run check:genealogy
 *
 * The pure half of GenealogyGraph: from one lot, order or unit, trace where it
 * came from (upstream, left) and where it went (downstream, right) — the
 * question a recall or a complaint starts with.
 *
 *  - Each node sits at its SHORTEST distance from the focus, upstream as
 *    negative levels, downstream as positive.
 *  - Bad data can contain a loop; the trace still ends, and every node appears
 *    once.
 *  - Past `maxDepth` nodes are cut off, and the cut is counted per side: a
 *    trace that silently stops looks complete, which in a recall is the worst
 *    possible failure.
 *  - Within a column, nodes are ordered by the average position of their
 *    neighbours in the column nearer the focus, so lines cross less. Ties keep
 *    input order.
 *  - Only edges between kept nodes are returned.
 */
import { traceGenealogy } from "../packages/core/src/genealogy";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(62)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
};

// steel coil → blanks lot → WO-10042 → units → pallets
const nodes = ["coil", "paint", "blanks", "wo", "u1", "u2", "p1", "p2", "ship"].map((id) => ({ id }));
const edges = [
  { from: "coil", to: "blanks" },
  { from: "blanks", to: "wo" },
  { from: "paint", to: "wo" },
  { from: "wo", to: "u1" },
  { from: "wo", to: "u2" },
  { from: "u2", to: "p1" },
  { from: "u1", to: "p2" },
  { from: "p1", to: "ship" },
  { from: "p2", to: "ship" },
];
const ids = (col: { id: string }[]) => col.map((n) => n.id);

console.log("\nlevels");
const g = traceGenealogy(nodes, edges, "wo");
t(g.columns.map((c) => [c.level, ids(c.nodes)]), [
  [-2, ["coil"]],
  [-1, ["paint", "blanks"]], // both feed only wo: a tie, so input order
  [0, ["wo"]],
  [1, ["u1", "u2"]],
  [2, ["p2", "p1"]],
  [3, ["ship"]],
], "upstream left, downstream right, by shortest distance");
t(g.cut, { upstream: 0, downstream: 0 }, "nothing cut");
t(g.edges.length, 9, "every edge between kept nodes");

console.log("\nordering — fewer crossings");
t(ids(g.columns[4].nodes), ["p2", "p1"], "p2 (from u1) above p1 (from u2), following their parents");

console.log("\ndepth limit — counted, never silent");
const shallow = traceGenealogy(nodes, edges, "wo", { maxDepth: 1 });
t(shallow.columns.map((c) => c.level), [-1, 0, 1], "only one level each way");
t(shallow.cut, { upstream: 1, downstream: 3 }, "coil cut upstream; p1, p2, ship downstream");
t(shallow.edges.some((e) => e.from === "coil"), false, "edges to cut nodes are dropped");

console.log("\nloops and strays");
const loop = traceGenealogy([{ id: "a" }, { id: "b" }, { id: "c" }], [{ from: "a", to: "b" }, { from: "b", to: "c" }, { from: "c", to: "a" }], "a");
t(loop.columns.flatMap((c) => ids(c.nodes)).sort(), ["a", "b", "c"], "a loop ends, each node once");
t(traceGenealogy(nodes, edges, "nope").columns, [], "an unknown focus: nothing, not a crash");
t(traceGenealogy(nodes, [...edges, { from: "wo", to: "ghost" }], "wo").edges.some((e) => e.to === "ghost"), false, "an edge to a node that does not exist is dropped");
const both = traceGenealogy([{ id: "x" }, { id: "y" }], [{ from: "x", to: "y" }, { from: "y", to: "x" }], "x");
t(both.columns.map((c) => [c.level, ids(c.nodes)]), [[-1, ["y"]], [0, ["x"]]], "reachable both ways: placed once, upstream first");

console.log(`\n${f === 0 ? "all passed" : `${f} FAILED`}`);
process.exit(f === 0 ? 0 : 1);
