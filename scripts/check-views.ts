/**
 * ViewManager contract.
 *
 *   bun run check:views
 *
 * Saved views over an opaque state: drift detection that ignores key order
 * (but not array order), name rules as a person reads them, one default at
 * most, and share links that round-trip any state (UTF-8 included) and decode
 * anything else (truncated, tampered, foreign) to null without throwing.
 */
import {
  type SavedView, stableStringify, sameViewState, isViewModified, viewNameProblem, freeViewName,
  defaultView, withDefault, encodeView, decodeView,
} from "../packages/core/src/views";

let failed = 0, checked = 0;
const eq = (label: string, got: unknown, want: unknown) => {
  checked++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { failed++; if (failed <= 30) console.error(`FAIL ${label}: got ${JSON.stringify(got)?.slice(0, 200)}, want ${JSON.stringify(want)?.slice(0, 200)}`); }
};

type S = { filter?: unknown; sort?: { id: string; desc: boolean }[]; columns?: Record<string, boolean>; group?: string[] };
const v = (id: string, name: string, state: S, extra: Partial<SavedView<S>> = {}): SavedView<S> => ({ id, name, state, ...extra });
const VIEWS: SavedView<S>[] = [
  v("a", "My overdue", { sort: [{ id: "due", desc: false }], columns: { amount: true, gst: false } }),
  v("b", "Large this quarter", { sort: [{ id: "amount", desc: true }] }, { isDefault: true }),
  v("c", "Team: unpaid", { group: ["customer"] }, { shared: true, readOnly: true }),
];

// Drift.
eq("key order is not a change", sameViewState({ a: 1, b: { c: 2, d: [1, 2] } }, { b: { d: [1, 2], c: 2 }, a: 1 }), true);
eq("array order is a change (sort priority)", sameViewState({ sort: ["a", "b"] }, { sort: ["b", "a"] }), false);
eq("an undefined key is not a change", sameViewState({ a: 1, b: undefined }, { a: 1 }), true);
eq("null is a value, unlike undefined", sameViewState({ a: null }, {}), false);
eq("a nested value change is a change", sameViewState({ columns: { amount: true } }, { columns: { amount: false } }), false);
eq("modified against a view", [isViewModified(VIEWS[0].state, VIEWS[0]), isViewModified({ ...VIEWS[0].state, group: ["status"] }, VIEWS[0])], [false, true]);
eq("no view: modified only against a baseline that differs", [isViewModified({ a: 1 }, null), isViewModified({ a: 1 }, null, { a: 1 }), isViewModified({ a: 2 }, null, { a: 1 })], [false, false, true]);
eq("stable stringify sorts at every depth", stableStringify({ b: [{ z: 1, y: 2 }], a: { d: 1, c: 2 } }), '{"a":{"c":2,"d":1},"b":[{"y":2,"z":1}]}');
eq("stable stringify of undefined", stableStringify(undefined), "null");

// Generated: shuffling keys never reads as modified; changing a leaf always does.
let seed = 5;
const rnd = (n: number) => ((seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) >>> 8) % n;
const gen = (d: number): unknown => {
  const k = rnd(d > 2 ? 3 : 6);
  if (k === 0) return rnd(100);
  if (k === 1) return ["x", "é", "😀", ""][rnd(4)];
  if (k === 2) return [true, false, null][rnd(3)];
  if (k === 3) return Array.from({ length: rnd(4) }, () => gen(d + 1));
  return Object.fromEntries(Array.from({ length: 1 + rnd(4) }, (_, i) => [`k${rnd(9)}${i}`, gen(d + 1)]));
};
const shuffle = (x: unknown): unknown => {
  if (Array.isArray(x)) return x.map(shuffle);
  if (x && typeof x === "object") {
    const keys = Object.keys(x).sort(() => rnd(3) - 1);
    return Object.fromEntries(keys.map((k) => [k, shuffle((x as Record<string, unknown>)[k])]));
  }
  return x;
};
const mutateLeaf = (x: unknown): unknown => {
  if (Array.isArray(x)) return x.length ? x.map((y, i) => (i === 0 ? mutateLeaf(y) : y)) : ["added"];
  if (x && typeof x === "object") { const k = Object.keys(x)[0]; return { ...(x as object), [k]: mutateLeaf((x as Record<string, unknown>)[k]) }; }
  return typeof x === "number" ? x + 1 : typeof x === "string" ? x + "!" : x === null ? 0 : !x;
};
let samples = 0;
for (let i = 0; i < 300; i++) {
  const s = { root: gen(0) };
  samples++;
  eq(`state ${i}: shuffled keys are the same view`, sameViewState(s, shuffle(s)), true);
  eq(`state ${i}: a changed leaf is not`, sameViewState(s, mutateLeaf(s)), false);
  const link = encodeView({ name: `View ${i} — ₹ टेस्ट 😀`, state: s });
  eq(`state ${i}: share link round-trips`, decodeView(link), { name: `View ${i} — ₹ टेस्ट 😀`, state: JSON.parse(stableStringify(s)) });
  eq(`state ${i}: the link is URL-safe`, /^[A-Za-z0-9_-]+$/.test(link), true);
}
eq("states sampled", samples, 300);

// Names.
eq("blank", viewNameProblem("   ", VIEWS), "Give the view a name.");
eq("duplicate, ignoring case and spaces", viewNameProblem("  my   OVERDUE ", VIEWS), "There is already a view called “My overdue”.");
eq("a view may keep its own name (rename to itself)", viewNameProblem("My overdue", VIEWS, "a"), null);
eq("a fresh name is fine", viewNameProblem("Next week's dues", VIEWS), null);
eq("too long", viewNameProblem("x".repeat(81), VIEWS), "Keep the name under 80 characters.");
eq("free name: as given if free", freeViewName("Fresh", VIEWS), "Fresh");
eq("free name: numbered when taken", freeViewName("My overdue", VIEWS), "My overdue (2)");
eq("free name: copying a numbered view continues the count", freeViewName("My overdue (2)", [...VIEWS, v("d", "My overdue (2)", {})]), "My overdue (3)");
eq("free name: blank becomes View", freeViewName("  ", VIEWS), "View");

// Default: at most one, ever.
eq("default view", defaultView(VIEWS)?.id, "b");
eq("no default", defaultView(VIEWS.map(({ isDefault, ...r }) => r)), null);
const moved = withDefault(VIEWS, "a");
eq("withDefault moves the mark", moved.filter((x) => x.isDefault).map((x) => x.id), ["a"]);
eq("withDefault keeps untouched views as they were (same objects)", moved[2] === VIEWS[2], true);
eq("withDefault(null) clears it", withDefault(VIEWS, null).some((x) => x.isDefault), false);
eq("withDefault leaves no isDefault: false behind", "isDefault" in withDefault(VIEWS, "a")[1], false);
for (let i = 0; i < 200; i++) {
  let vs: SavedView<S>[] = Array.from({ length: 1 + rnd(6) }, (_, j) => v(`v${j}`, `V${j}`, {}, rnd(3) === 0 ? { isDefault: true } : {}));
  for (let k = 0; k < 5; k++) vs = withDefault(vs, rnd(4) === 0 ? null : `v${rnd(vs.length)}`);
  eq(`views ${i}: at most one default after any sequence`, vs.filter((x) => x.isDefault).length <= 1, true);
}

// Links that are not ours.
for (const junk of [null, undefined, "", "!!!", "not base64 at all", "eyJ2IjoyfQ", encodeView({ name: "x", state: 1 }).slice(0, -6), "A".repeat(70000), "e30", "W10", "bnVsbA", encodeView({ name: "ok", state: { a: 1 } }).replace(/^./, "Z")]) {
  let r: unknown = "threw";
  try { r = decodeView(junk as string); } catch { /* r stays "threw" */ }
  eq(`decode ${JSON.stringify(junk)?.slice(0, 30)}: null, never a throw`, r, null);
}
eq("a valid link with a null state still decodes (null is a state)", decodeView(encodeView({ name: "n", state: null })), { name: "n", state: null });

console.log(failed ? `${failed} of ${checked} FAILED` : `all passed (${checked} assertions)`);
process.exit(failed ? 1 : 0);
