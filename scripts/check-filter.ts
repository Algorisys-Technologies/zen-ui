/**
 * FilterBuilder contract.
 *
 *   bun run check:filter
 *
 * Worked examples (the review's own: status is Overdue AND (customer is A or B
 * OR amount > 1,00,000)), then laws swept over generated rows and trees that
 * do not re-implement the evaluator: complementary operators disagree on every
 * row with a value, NOT negates exactly, a group is the AND/OR of its
 * children, between is gte and lte whichever way round, an unfinished
 * condition changes nothing wherever it is put, a JSON round trip loses
 * nothing, edits never mutate their input, and malformed input never throws.
 */
import {
  type FilterField, type FilterGroup, type FilterNode, type FilterCondition, type FilterOperator,
  operatorsFor, operatorArity, isComplete, pruneFilter, filterPredicate, describeFilter,
  newCondition, newGroup, addNode, removeNode, updateNode, changeField, changeOperator, filterDepth,
  loadFilter, toDay,
} from "../packages/core/src/filter";

let failed = 0, checked = 0;
const eq = (label: string, got: unknown, want: unknown) => {
  checked++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { failed++; if (failed <= 30) console.error(`FAIL ${label}: got ${JSON.stringify(got)?.slice(0, 220)}, want ${JSON.stringify(want)?.slice(0, 220)}`); }
};

type Inv = { no: string; status: string; customer: string | null; amount: number | null; due: string | Date | null; paid: boolean | null; tags: string[] };
const FIELDS: FilterField[] = [
  { id: "no", label: "Invoice", type: "text" },
  { id: "status", label: "Status", type: "enum", options: [{ value: "draft", label: "Draft" }, { value: "overdue", label: "Overdue" }, { value: "paid", label: "Paid" }] },
  { id: "customer", label: "Customer", type: "enum", options: [{ value: "A", label: "Acme" }, { value: "B", label: "Bharat Steels" }, { value: "C", label: "Coastal" }] },
  { id: "amount", label: "Amount", type: "number" },
  { id: "due", label: "Due", type: "date" },
  { id: "paid", label: "Paid", type: "boolean" },
  { id: "tags", label: "Tags", type: "enum" },
];
const get = (r: Inv, f: string) => (r as unknown as Record<string, unknown>)[f];
let ids = 0;
const c = (field: string, op: FilterOperator, value?: unknown, valueTo?: unknown): FilterCondition =>
  ({ kind: "condition", id: `c${++ids}`, field, op, value: value as never, ...(valueTo !== undefined ? { valueTo: valueTo as never } : {}) });
const g = (join: "and" | "or", ...children: FilterNode[]): FilterGroup => ({ kind: "group", id: `g${++ids}`, join, children });

const ROWS: Inv[] = [
  { no: "SI/26/0001", status: "overdue", customer: "A", amount: 50000, due: "2026-10-01", paid: false, tags: ["export"] },
  { no: "SI/26/0002", status: "overdue", customer: "C", amount: 250000, due: "2026-10-15", paid: false, tags: [] },
  { no: "SI/26/0003", status: "overdue", customer: "C", amount: 90000, due: new Date(2026, 9, 20, 23, 30), paid: false, tags: ["gst"] },
  { no: "SI/26/0004", status: "paid", customer: "B", amount: 400000, due: "2026-09-30T18:00:00Z", paid: true, tags: ["export", "gst"] },
  { no: "  si/26/0005 ", status: "draft", customer: null, amount: null, due: null, paid: null, tags: [] },
];
const nos = (f: FilterNode | null) => ROWS.filter(filterPredicate(f, FIELDS, get)).map((r) => r.no.trim().toUpperCase());

// The review's example.
const review = g("and", c("status", "in", ["overdue"]), g("or", c("customer", "in", ["A", "B"]), c("amount", "gt", 100000)));
eq("review example: status Overdue AND (customer A or B OR amount > 1,00,000)", nos(review), ["SI/26/0001", "SI/26/0002"]);
eq("review example in words", describeFilter(review, FIELDS, (v, f) => (f.type === "number" ? Number(v).toLocaleString("en-IN") : String(v))),
  "Status is Overdue and (Customer is one of Acme, Bharat Steels or Amount > 1,00,000)");
eq("a list reads with commas, never \"or\"", describeFilter(c("customer", "in", ["A", "B", "C"]), FIELDS), "Customer is one of Acme, Bharat Steels, Coastal");
eq("NOT reads as not (…)", describeFilter({ ...g("or", c("paid", "isTrue"), c("amount", "empty")), not: true }, FIELDS), "not (Paid is yes or Amount is empty)");
eq("dates read as days", describeFilter(c("due", "lt", "2026-10-10"), FIELDS), "Due is before 2026-10-10");
eq("between in words", describeFilter(c("amount", "between", 1000, 5000), FIELDS), "Amount is between 1000 and 5000");
eq("text is quoted", describeFilter(c("no", "starts", " SI/26 "), FIELDS), "Invoice starts with “SI/26”");
eq("a group alone is not bracketed", describeFilter(g("and", g("or", c("paid", "isTrue"), c("amount", "empty"))), FIELDS), "Paid is yes or Amount is empty");
eq("…but beside another condition it is", describeFilter(g("and", c("no", "contains", "x"), g("or", c("paid", "isTrue"), c("amount", "empty"))), FIELDS), "Invoice contains “x” and (Paid is yes or Amount is empty)");
eq("nothing finished: no words", describeFilter(g("and", c("amount", "gt", null)), FIELDS), "");

// Operators, one by one.
eq("text contains, case and spaces ignored", nos(c("no", "contains", "si/26/000")), ["SI/26/0001", "SI/26/0002", "SI/26/0003", "SI/26/0004", "SI/26/0005"]);
eq("text equals trims the cell", nos(c("no", "equals", "si/26/0005")), ["SI/26/0005"]);
eq("text starts / ends", [nos(c("no", "starts", "SI/26/000")).length, nos(c("no", "ends", "02"))], [5, ["SI/26/0002"]]);
eq("number gt/gte/lt/lte", [nos(c("amount", "gt", 90000)), nos(c("amount", "gte", 90000)).length, nos(c("amount", "lt", 90000)), nos(c("amount", "lte", 90000)).length], [["SI/26/0002", "SI/26/0004"], 3, ["SI/26/0001"], 2]);
eq("number between, either way round", [nos(c("amount", "between", 50000, 100000)), nos(c("amount", "between", 100000, 50000))], [["SI/26/0001", "SI/26/0003"], ["SI/26/0001", "SI/26/0003"]]);
eq("date by local day: a Date late in the evening is still that day", nos(c("due", "eq", "2026-10-20")), ["SI/26/0003"]);
eq("date from an ISO timestamp is its written day", nos(c("due", "eq", "2026-09-30")), ["SI/26/0004"]);
eq("date before", nos(c("due", "lt", "2026-10-10")), ["SI/26/0001", "SI/26/0004"]);
eq("enum in / not in", [nos(c("customer", "in", ["C"])), nos(c("customer", "notIn", ["C"]))], [["SI/26/0002", "SI/26/0003"], ["SI/26/0001", "SI/26/0004", "SI/26/0005"]]);
eq("enum over a list cell: any of", nos(c("tags", "in", ["gst"])), ["SI/26/0003", "SI/26/0004"]);
eq("empty: null, blank and an empty list", [nos(c("customer", "empty")), nos(c("tags", "empty"))], [["SI/26/0005"], ["SI/26/0002", "SI/26/0005"]]);
eq("boolean: yes / no, null is neither", [nos(c("paid", "isTrue")), nos(c("paid", "isFalse"))], [["SI/26/0004"], ["SI/26/0001", "SI/26/0002", "SI/26/0003"]]);
eq("no filter: everything", [nos(null), nos(g("and"))].map((x) => x.length), [5, 5]);

// Completeness.
eq("an operator its type does not offer is unfinished", isComplete(c("amount", "contains", "5"), FIELDS), false);
eq("an unknown field is unfinished", isComplete(c("region", "contains", "x"), FIELDS), false);
eq("a number value that is text is unfinished", isComplete(c("amount", "gt", "5" as never), FIELDS), false);
eq("a date that is not a day is unfinished", isComplete(c("due", "lt", "10/10/2026"), FIELDS), false);
eq("between needs both ends", [isComplete(c("amount", "between", 1, null), FIELDS), isComplete(c("amount", "between", 1, 2), FIELDS)], [false, true]);
eq("blank text is unfinished", isComplete(c("no", "contains", "   "), FIELDS), false);
eq("prune drops emptied groups to null", pruneFilter(g("and", g("or", c("amount", "gt", null))), FIELDS), null);
eq("every type's first operator is its default and takes the expected values",
  (["text", "number", "date", "enum", "boolean"] as const).map((t) => [operatorsFor(t)[0], operatorArity(operatorsFor(t)[0])]),
  [["contains", 1], ["eq", 1], ["eq", 1], ["in", "list"], ["isTrue", 0]]);

// --- Laws over generated rows and trees -----------------------------------------

let seed = 11;
// A 32-bit LCG. Math.imul, not *: the plain product overflows a double, loses its low bits and the sequence sticks.
const rnd = (n: number) => ((seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) >>> 8) % n;
const pick = <T,>(xs: readonly T[]) => xs[rnd(xs.length)];
const rows: Inv[] = Array.from({ length: 120 }, (_, i) => ({
  no: pick(["SI/26/", "si-", "PO/", "", "  x "]) + String(rnd(30)),
  status: pick(["draft", "overdue", "paid"]),
  customer: pick(["A", "B", "C", null]),
  amount: pick([null, 0, 50, 100, 150, 1e5, -20, rnd(300)]),
  due: pick([null, "2026-10-01", "2026-10-02", new Date(2026, 9, 1, 23, 59), "2026-10-01T23:00:00Z", "nonsense", ""]),
  paid: pick([true, false, null]),
  tags: pick([[], ["gst"], ["export"], ["gst", "export"]]),
}));
const runOn = (f: FilterNode) => rows.map(filterPredicate(f, FIELDS, get));
const VALUES: Record<string, unknown[]> = {
  no: ["si", "26/1", "x", "PO/"],
  status: [["overdue"], ["draft", "paid"]],
  customer: [["A"], ["B", "C"]],
  amount: [0, 50, 100, -20],
  due: ["2026-10-01", "2026-10-02"],
  paid: [null],
  tags: [["gst"], ["export", "gst"]],
};
const randomCondition = (): FilterCondition => {
  const f = pick(FIELDS);
  const op = pick(operatorsFor(f.type));
  const a = operatorArity(op);
  const v = a === 0 ? null : pick(VALUES[f.id]);
  return c(f.id, op, v, a === 2 ? pick(VALUES[f.id]) : undefined);
};
const randomTree = (depth: number): FilterGroup => {
  const kids = Array.from({ length: 1 + rnd(3) }, () => (depth > 0 && rnd(3) === 0 ? randomTree(depth - 1) : randomCondition()));
  return { ...g(rnd(2) ? "and" : "or", ...kids), ...(rnd(4) === 0 ? { not: true } : {}) };
};

// Complementary operators disagree on every row that has a value.
const PAIRS: [FilterOperator, FilterOperator][] = [["contains", "notContains"], ["equals", "notEquals"], ["in", "notIn"], ["empty", "notEmpty"], ["isTrue", "isFalse"], ["eq", "ne"], ["gt", "lte"], ["gte", "lt"]];
let pairRows = 0;
for (const f of FIELDS) {
  for (const [p, q] of PAIRS) {
    if (!operatorsFor(f.type).includes(p)) continue;
    for (const v of operatorArity(p) === 0 ? [null] : VALUES[f.id]) {
      const a = runOn(c(f.id, p, v)), b = runOn(c(f.id, q, v));
      rows.forEach((r, i) => {
        const raw = get(r, f.id);
        const blank = raw === null || raw === undefined || raw === "" || (f.type === "date" && toDay(raw) === null);
        if ((p === "isTrue" && raw === null) || (blank && p !== "empty" && p !== "contains" && p !== "equals" && p !== "in")) return;
        pairRows++;
        eq(`${f.id} ${p}/${q} ${JSON.stringify(v)} row ${i}: complements`, a[i] !== b[i], true);
      });
    }
  }
}
eq("complement rows examined", pairRows > 3000, true);

// between == gte lo and lte hi, either way round.
for (const f of FIELDS.filter((x) => x.type === "number" || x.type === "date")) {
  for (const lo of VALUES[f.id]) for (const hi of VALUES[f.id]) {
    const [a, b] = (lo as number) <= (hi as number) ? [lo, hi] : [hi, lo];
    eq(`${f.id} between ${lo} ${hi}`, runOn(c(f.id, "between", lo, hi)), runOn(g("and", c(f.id, "gte", a), c(f.id, "lte", b))));
  }
}

/** Key order is not meaning: compare objects with their keys sorted. */
const canon = (v: unknown): unknown => (Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon((v as Record<string, unknown>)[k])])) : v);
let trees = 0;
const joins: string[] = [], nots: boolean[] = [];
for (let t = 0; t < 400; t++) {
  const tree = randomTree(3);
  trees++;
  joins.push(tree.join); nots.push(!!tree.not);
  const base = runOn(tree);
  // A group is the AND/OR of its children; NOT negates.
  const kids = tree.children.map(runOn);
  const combined = rows.map((_, i) => {
    const r = tree.join === "and" ? kids.every((k) => k[i]) : kids.some((k) => k[i]);
    return tree.not ? !r : r;
  });
  eq(`tree ${t}: a group is its children combined`, base, combined);
  eq(`tree ${t}: not negates exactly`, runOn({ ...tree, not: !tree.not }), base.map((x) => !x));
  // An unfinished condition changes nothing, wherever it goes.
  // (Not a boolean field: "is yes" needs no value, so a new one is already finished.)
  const unfinished = { ...newCondition(pick(FIELDS.filter((f) => f.type !== "boolean"))), id: "unfinished" };
  const target = (function find(n: FilterGroup): FilterGroup { const sub = n.children.filter((x): x is FilterGroup => x.kind === "group"); return sub.length && rnd(2) ? find(pick(sub)) : n; })(tree);
  const isRoot = target === tree;
  const widened = addNode(tree, target.id, unfinished);
  // (A group left with only the unfinished condition is pruned away, which under OR changes the result; so only test groups with finished content.)
  if (isRoot || pruneFilter(target, FIELDS)) eq(`tree ${t}: an unfinished condition changes nothing`, runOn(widened), base);
  // JSON round trip through the loader keeps it exactly.
  const loaded = loadFilter(JSON.parse(JSON.stringify(tree)), FIELDS);
  eq(`tree ${t}: JSON round trip`, [canon(loaded.filter), loaded.dropped], [canon(tree), []]);
}
eq("trees examined", trees, 400);
eq("the generated trees vary (both joins, with and without not)", [new Set(joins).size, new Set(nots).size], [2, 2]);

// Edits never mutate their input, and do what they say.
const deepFreeze = <T,>(o: T): T => { if (o && typeof o === "object") { Object.freeze(o); for (const v of Object.values(o)) deepFreeze(v); } return o; };
{
  const root = deepFreeze(g("and", c("amount", "gt", 5), g("or", c("no", "contains", "si"))));
  const sub = root.children[1] as FilterGroup;
  const added = addNode(root, sub.id, c("paid", "isTrue"));
  eq("addNode appends into the group", (added.children[1] as FilterGroup).children.length, 2);
  eq("removeNode removes", removeNode(root, root.children[0].id).children.length, 1);
  eq("removeNode on the root empties it", removeNode(root, root.id).children, []);
  eq("updateNode changes a join", (updateNode(root, sub.id, { join: "and" }).children[1] as FilterGroup).join, "and");
  eq("updateNode cannot change kind or id", (() => { const u = updateNode(root, sub.id, { kind: "condition", id: "x" } as never).children[1]; return [u.kind, u.id]; })(), ["group", sub.id]);
  const cf = changeField(root, root.children[0].id, FIELDS.find((f) => f.id === "no")!, FIELDS).children[0] as FilterCondition;
  eq("changeField to another type resets op and value", [cf.field, cf.op, cf.value], ["no", "contains", null]);
  const cf2 = changeField(root, root.children[0].id, FIELDS.find((f) => f.id === "due")!, FIELDS).children[0] as FilterCondition;
  eq("changeField number→date keeps a shared operator, not the value", [cf2.op, cf2.value], ["gt", null]);
  const amount2: FilterField[] = [...FIELDS, { id: "tax", label: "Tax", type: "number" }];
  const cf3 = changeField(root, root.children[0].id, amount2[7], amount2).children[0] as FilterCondition;
  eq("changeField to a field of the same type keeps op and value", [cf3.field, cf3.op, cf3.value], ["tax", "gt", 5]);
  const co = changeOperator(root, root.children[0].id, "between").children[0] as FilterCondition;
  eq("changeOperator to between keeps the value as the lower end", [co.op, co.value, co.valueTo], ["between", 5, null]);
  eq("changeOperator to empty clears the values", (changeOperator(root, root.children[0].id, "empty").children[0] as FilterCondition).value, null);
  eq("depth", [filterDepth(c("no", "contains", "x")), filterDepth(root), filterDepth(g("and", g("or", g("and"))))], [0, 2, 3]);
  eq("newCondition starts at the type's first operator, values empty", (({ field, op, value }) => [field, op, value])(newCondition(FIELDS[1])), ["status", "in", []]);
  eq("fresh ids are unique", new Set(Array.from({ length: 500 }, () => newGroup().id)).size, 500);
}

// Loading what storage hands back.
{
  const stale = {
    kind: "group", join: "or", children: [
      { kind: "condition", field: "region", op: "in", value: ["west"] },
      { kind: "condition", field: "amount", op: "contains", value: "5" },
      { kind: "condition", field: "status", op: "in", value: ["overdue", "disputed"] },
      { kind: "condition", field: "due", op: "lt", value: "10/10/2026" },
      42,
      { kind: "group", join: "sideways", children: "nope" },
    ],
  };
  const r = loadFilter(stale, FIELDS);
  eq("stale filter: kept what still means something", r.filter.children.map((n) => (n.kind === "condition" ? [n.field, n.op, n.value] : [n.kind, n.join, n.children.length])),
    [["status", "in", ["overdue"]], ["due", "lt", null], ["group", "and", 0]]);
  eq("…and named what it dropped", r.dropped, ["region (no longer a field)", "Amount contains (not an operator for this field)", "Status: disputed (no longer an option)", "a part that was not a filter"]);
  eq("a bare condition is wrapped in a group", loadFilter({ kind: "condition", field: "paid", op: "isTrue" }, FIELDS).filter.kind, "group");
  for (const junk of [null, undefined, 3, "x", [], {}, { kind: "group" }, { kind: "group", children: [null, [], { kind: "condition" }] }]) {
    let ok = true;
    try { const l = loadFilter(junk, FIELDS); ok = l.filter.kind === "group" && Array.isArray(l.filter.children); } catch { ok = false; }
    eq(`loading ${JSON.stringify(junk)} never throws`, ok, true);
  }
  const dup = loadFilter({ kind: "group", id: "x", children: [{ kind: "condition", id: "x", field: "paid", op: "isTrue" }] }, FIELDS);
  eq("duplicate ids are made unique", new Set([dup.filter.id, dup.filter.children[0].id]).size, 2);
  let deep: unknown = { kind: "condition", field: "paid", op: "isTrue" };
  for (let i = 0; i < 40; i++) deep = { kind: "group", children: [deep] };
  eq("absurd nesting is cut off, not a stack overflow", loadFilter(deep, FIELDS).dropped.includes("a part that was not a filter"), true);
}

console.log(failed ? `${failed} of ${checked} FAILED` : `all passed (${checked} assertions)`);
process.exit(failed ? 1 : 0);
