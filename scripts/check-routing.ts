/**
 * Routing contract.
 *
 *   bun run check:routing
 *
 * The pure half of RoutingGraph: a process's steps and the links between them
 * ("to may start once from is done").
 *
 *  - Layers by LONGEST path from the starts, so a step sits after everything
 *    it waits for — two parallel branches line up, and a join sits after the
 *    longer branch.
 *  - With no links at all the routing is the implicit chain in step order,
 *    flagged `implicit`, so a new template never draws blank.
 *  - A link that would close a loop is refused (a step waiting for itself
 *    through others can never start); so is a link to itself, a duplicate,
 *    or one naming a step that does not exist.
 *  - A step can start when everything it waits for is done (or skipped).
 */
import { routingLayout, wouldCreateCycle, canAddLink, startableSteps, type RoutingLink } from "../packages/core/src/routing";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(62)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
};
const steps = ["cut", "bend", "drill", "deburr", "weld", "paint", "pack"].map((id) => ({ id }));
// cut → bend → weld; cut → drill → deburr → weld; weld → paint → pack
const links: RoutingLink[] = [
  { from: "cut", to: "bend" },
  { from: "cut", to: "drill" },
  { from: "drill", to: "deburr" },
  { from: "bend", to: "weld" },
  { from: "deburr", to: "weld" },
  { from: "weld", to: "paint" },
  { from: "paint", to: "pack" },
];
const layers = (l: ReturnType<typeof routingLayout>) => l.layers.map((x) => x.map((s) => s.id));

console.log("\nlayers");
const lay = routingLayout(steps, links);
t(layers(lay), [["cut"], ["bend", "drill"], ["deburr"], ["weld"], ["paint"], ["pack"]], "longest path: weld waits for the longer branch");
t([lay.implicit, lay.links.length], [false, 7], "explicit links kept");

console.log("\nthe implicit chain");
const chain = routingLayout(steps.slice(0, 3), []);
t([layers(chain), chain.implicit, chain.links], [[["cut"], ["bend"], ["drill"]], true, [{ from: "cut", to: "bend" }, { from: "bend", to: "drill" }]], "no links: step order, flagged implicit");
t(layers(routingLayout([{ id: "a" }, { id: "b" }, { id: "c" }], [{ from: "a", to: "c" }])), [["a", "b"], ["c"]], "some links: an unlinked step is a start of its own");

console.log("\nrefusing bad links");
t(wouldCreateCycle(links, "pack", "cut"), true, "pack → cut would close a loop");
t(wouldCreateCycle(links, "bend", "drill"), false, "bend → drill is fine (parallel branches)");
t(canAddLink(steps, links, "weld", "weld"), { ok: false, reason: "self" }, "a step cannot wait for itself");
t(canAddLink(steps, links, "cut", "bend"), { ok: false, reason: "duplicate" }, "a link that exists already");
t(canAddLink(steps, links, "paint", "drill"), { ok: false, reason: "cycle" }, "a loop through others");
t(canAddLink(steps, links, "cut", "ghost"), { ok: false, reason: "unknown" }, "a step that does not exist");
t(canAddLink(steps, links, "bend", "drill"), { ok: true, reason: null }, "a good link");
t(routingLayout(steps, [...links, { from: "pack", to: "cut" }, { from: "cut", to: "nope" }]).links.length, 7, "loops and dangling links in stored data are left out, not drawn");

console.log("\nwhat can start");
t(startableSteps(steps, links, new Set()), ["cut"], "nothing done: only the start");
t(startableSteps(steps, links, new Set(["cut", "bend"])), ["drill"], "bend done: weld still waits for deburr");
t(startableSteps(steps, links, new Set(["cut", "bend", "drill", "deburr"])), ["weld"], "both branches done: weld");
t(startableSteps(steps.slice(0, 3), [], new Set(["cut"])), ["bend"], "the implicit chain gates too");

console.log(`\n${f === 0 ? "all passed" : `${f} FAILED`}`);
process.exit(f === 0 ? 0 : 1);
