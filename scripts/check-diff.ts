/**
 * Before/after diff contract.
 *
 *   bun run check:diff
 *
 * The pure half of DiffView. It lives in core so all four renderers agree on
 * what counts as a change — a row that one binding shows and another hides is
 * exactly the parity bug this split prevents.
 *
 * The cases that matter are the ones an audit log gets wrong. `null` is a value
 * (someone cleared the field) and absence is not, so they cannot collapse into
 * each other. Key order in an object is not a change. And two runs of the same
 * payload must produce no rows at all — a diff that reports phantom changes is
 * worse than no diff, because it trains the reader to ignore it.
 */
import { computeDiff, parseSnapshot, isKeyed } from "../packages/core/src/diff";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(52)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};

/** Rows compared as `key:kind`, which is what the renderer branches on. */
const shape = (rows: ReturnType<typeof computeDiff>) => rows.map((r) => `${r.key}:${r.kind}`);

console.log("\nwhat counts as a change");
t(
  shape(computeDiff({ status: "pending", amount: 1200 }, { status: "approved", amount: 1200 })),
  ["status:changed"],
  "unchanged keys drop out by default",
);
t(
  shape(
    computeDiff(
      { status: "pending", amount: 1200 },
      { status: "approved", amount: 1200 },
      { changedOnly: false },
    ),
  ),
  ["status:changed", "amount:unchanged"],
  "changedOnly:false keeps them",
);
t(shape(computeDiff({ a: 1 }, { a: 1, b: 2 })), ["b:added"], "a new key is added");
t(shape(computeDiff({ a: 1, b: 2 }, { a: 1 })), ["b:removed"], "a dropped key is removed");
t(shape(computeDiff({}, {})), [], "two empty payloads produce nothing");
t(shape(computeDiff({ a: 1 }, { a: 1 })), [], "an unchanged payload produces nothing");

console.log("\nnull is a value, absence is not");
t(shape(computeDiff({ note: "hi" }, { note: null })), ["note:changed"], "clearing to null is a change");
t(shape(computeDiff({ note: null }, {})), ["note:removed"], "null -> absent is a removal");
t(shape(computeDiff({}, { note: null })), ["note:added"], "absent -> null is an addition");
t(shape(computeDiff({ note: null }, { note: null })), [], "null -> null is not a change");
t(
  shape(computeDiff({ note: undefined }, {})),
  ["note:removed"],
  "an explicit undefined is present, so losing it is a removal",
);

console.log("\ncreation and deletion");
t(shape(computeDiff(undefined, { a: 1, b: 2 })), ["a:added", "b:added"], "no before -> all added");
t(shape(computeDiff({ a: 1, b: 2 }, undefined)), ["a:removed", "b:removed"], "no after -> all removed");
t(shape(computeDiff(undefined, undefined)), [], "neither side -> nothing");

console.log("\nequality that must not report a phantom change");
t(shape(computeDiff({ a: { x: 1, y: 2 } }, { a: { y: 2, x: 1 } })), [], "object key order is not a change");
t(shape(computeDiff({ a: [1, 2, 3] }, { a: [1, 2, 3] })), [], "equal arrays");
t(shape(computeDiff({ a: [1, 2] }, { a: [2, 1] })), ["a:changed"], "array order IS a change");
t(
  shape(computeDiff({ at: new Date("2026-01-01") }, { at: new Date("2026-01-01") })),
  [],
  "two equal Dates",
);
t(
  shape(computeDiff({ at: new Date("2026-01-01") }, { at: new Date("2026-06-01") })),
  ["at:changed"],
  "two different Dates",
);
t(shape(computeDiff({ n: NaN }, { n: NaN })), [], "NaN equals itself here");
t(shape(computeDiff({ n: 0 }, { n: -0 })), [], "0 and -0 are the same number to a reader");
t(shape(computeDiff({ n: 1 }, { n: "1" })), ["n:changed"], "1 and \"1\" are different");
t(
  shape(computeDiff({ a: { deep: { x: 1 } } }, { a: { deep: { x: 2 } } })),
  ["a:changed"],
  "nested difference surfaces on the top-level key",
);

console.log("\nkey order and selection");
t(
  shape(computeDiff({ b: 1, a: 1 }, { b: 2, a: 2 })),
  ["b:changed", "a:changed"],
  "before's insertion order wins",
);
t(
  shape(computeDiff({ a: 1 }, { a: 2, z: 1, m: 1 })),
  ["a:changed", "z:added", "m:added"],
  "keys only in after follow, in after's order",
);
t(
  shape(computeDiff({ a: 1, b: 1, c: 1 }, { a: 2, b: 2, c: 2 }, { keys: ["c", "a"] })),
  ["c:changed", "a:changed"],
  "keys selects and orders",
);
t(
  shape(computeDiff({ a: 1 }, { a: 2 }, { keys: ["a", "nope"] })),
  ["a:changed"],
  "a listed key absent from both sides yields no row",
);
t(
  shape(computeDiff({ a: 1, b: 1 }, { a: 2, b: 2 }, { keys: [] })),
  [],
  "an empty keys array selects nothing, and is not treated as absent",
);

console.log("\nlabels");
t(
  computeDiff({ a: 1 }, { a: 2 }, { labels: { a: "Amount" } })[0]?.label,
  "Amount",
  "labels rename for display",
);
t(computeDiff({ a: 1 }, { a: 2 })[0]?.label, "a", "no label -> the key verbatim, not humanised");

console.log("\nthe values ride along untouched");
t(computeDiff({ a: 1 }, { a: 2 })[0]?.before, 1, "before value");
t(computeDiff({ a: 1 }, { a: 2 })[0]?.after, 2, "after value");
t(computeDiff({}, { a: 2 })[0]?.before, undefined, "an added row has no before");

console.log("\nthe inputs are not mutated");
const before = { a: 1, b: 2 };
const after = { a: 9 };
computeDiff(before, after);
t(before, { a: 1, b: 2 }, "before untouched");
t(after, { a: 9 }, "after untouched");

/*
 * A real audit column is nvarchar, not JSON. These are the five shapes one
 * actually holds, measured against a live schema: a serialised object, a bare
 * array, an ad-hoc map, an arbitrary non-JSON string, and empty for "there was
 * no before". A bare JSON.parse over that set throws on three of them.
 */
console.log("\nparseSnapshot — what an audit column really holds");
t(parseSnapshot('{"a":1}'), { a: 1 }, "a serialised object");
t(parseSnapshot('[1,2]'), [1, 2], "a bare array");
t(parseSnapshot('  {"a":1}  '), { a: 1 }, "leading/trailing space");
t(parseSnapshot(""), undefined, "empty string is absence, not a value");
t(parseSnapshot("   "), undefined, "whitespace only is absence");
t(parseSnapshot("cancelled by operator"), "cancelled by operator", "plain prose survives as prose");
t(parseSnapshot("{not json"), "{not json", "JSON-shaped but broken stays a string, never throws");
t(parseSnapshot({ a: 1 }), { a: 1 }, "an already-parsed object passes through");
t(parseSnapshot(undefined), undefined, "undefined passes through");
t(parseSnapshot(null), null, "null is a value and passes through");
t(parseSnapshot("42"), "42", "a bare number string is not JSON-shaped, so it stays text");

console.log("\nisKeyed — can this be compared field by field?");
t(isKeyed({ a: 1 }), true, "a plain object");
t(isKeyed([1, 2]), false, "an array has no field names for the left column");
t(isKeyed("text"), false, "a string");
t(isKeyed(null), false, "null");
t(isKeyed(undefined), false, "undefined");
t(isKeyed(new Date()), false, "a Date is a value, not a record");

console.log(f === 0 ? "\nall passed\n" : `\n${f} FAILED\n`);
process.exit(f === 0 ? 0 : 1);
