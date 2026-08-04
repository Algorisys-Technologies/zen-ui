/**
 * Keyboard reordering contract.
 *
 *   bun run check:sortable
 *
 * The pure half of SortableList. It lives in core because THREE of the four
 * bindings need a keyboard layer written by hand: `@thisbeyond/solid-dnd@0.7.5`
 * ships none at all (measured — zero files in its dist mention `keydown`), and
 * vanilla and web-components have no drag library whatsoever. Only React would
 * get one free from dnd-kit, and taking it there alone would leave React with
 * different cancel semantics and different modifier handling from the other
 * three — precisely the behavioural divergence `check-parity` cannot see.
 *
 * Reordering by keyboard is array-index arithmetic plus focus management. It
 * touches no pointer, no collision detection and no transform, so it is fully
 * separable and testable with no DOM.
 *
 * The property that keeps the two input paths honest is at the bottom: a
 * keyboard move and a pointer drop with the same from/to pair produce the same
 * array, because both call `moveItem`.
 */
import {
  moveItem,
  reduceReorder,
  keyToReorderAction,
  type PickedUp,
} from "../packages/core/src/sortable";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(56)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};

const L = ["a", "b", "c", "d"];

console.log("\nmoveItem — the one place an array is reordered");
t(moveItem(L, 0, 2), ["b", "c", "a", "d"], "forwards");
t(moveItem(L, 2, 0), ["c", "a", "b", "d"], "backwards");
t(moveItem(L, 0, 3), ["b", "c", "d", "a"], "to the end");
t(moveItem(L, 3, 0), ["d", "a", "b", "c"], "to the start");
t(moveItem(L, 1, 1), ["a", "b", "c", "d"], "to itself is identity");
t(moveItem(L, 0, 99), ["b", "c", "d", "a"], "an out-of-range target clamps");
t(moveItem(L, -5, 2), ["b", "c", "a", "d"], "an out-of-range source clamps");
t(moveItem([], 0, 1), [], "empty");
t(moveItem(["only"], 0, 0), ["only"], "single element");
/* The caller renders from its own array; mutating theirs under them is how a
   list ends up disagreeing with what was drawn. */
const src = ["a", "b", "c"];
moveItem(src, 0, 2);
t(src, ["a", "b", "c"], "the input array is not mutated");

console.log("\nround trip");
t(moveItem(moveItem(L, 0, 3), 3, 0), L, "move there and back is identity");

console.log("\nreduceReorder — pick up");
const up = reduceReorder(null, { type: "pickup", id: "b", index: 1 }, 4);
t(up.picked, { id: "b", origin: 1, index: 1 }, "pickup records where it started");
t(up.commit, null, "picking up moves nothing");

const held: PickedUp = { id: "b", origin: 1, index: 1 };

console.log("\nreduceReorder — move applies immediately");
/* Applied on each press rather than previewed until drop: a user arrowing down
   expects to SEE the row move, and a preview that only lands on Enter reads as
   a broken control. */
t(reduceReorder(held, { type: "move", delta: 1 }, 4).commit, { from: 1, to: 2 }, "one step down commits");
t(reduceReorder(held, { type: "move", delta: 1 }, 4).picked, { id: "b", origin: 1, index: 2 }, "…and tracks the new index");
t(reduceReorder(held, { type: "move", delta: -1 }, 4).commit, { from: 1, to: 0 }, "one step up commits");

console.log("\nreduceReorder — clamps at both ends, never wraps");
const atTop: PickedUp = { id: "a", origin: 0, index: 0 };
t(reduceReorder(atTop, { type: "move", delta: -1 }, 4).commit, null, "up from the top is a no-op, not a jump to the bottom");
t(reduceReorder(atTop, { type: "move", delta: -1 }, 4).picked, atTop, "…and the held item does not move");
const atEnd: PickedUp = { id: "d", origin: 3, index: 3 };
t(reduceReorder(atEnd, { type: "move", delta: 1 }, 4).commit, null, "down from the bottom is a no-op");
t(reduceReorder(held, { type: "move", delta: 99 }, 4).commit, { from: 1, to: 3 }, "a large delta clamps to the last index");
t(reduceReorder(held, { type: "move", delta: 0 }, 4).commit, null, "a zero delta commits nothing");

console.log("\nreduceReorder — moveTo, for Home and End");
t(reduceReorder(held, { type: "moveTo", index: 0 }, 4).commit, { from: 1, to: 0 }, "Home");
t(reduceReorder(held, { type: "moveTo", index: 3 }, 4).commit, { from: 1, to: 3 }, "End");
t(reduceReorder(held, { type: "moveTo", index: 99 }, 4).commit, { from: 1, to: 3 }, "past the end clamps");
t(reduceReorder(held, { type: "moveTo", index: 1 }, 4).commit, null, "moveTo the current index is a no-op");

console.log("\nreduceReorder — drop and cancel");
t(reduceReorder({ id: "b", origin: 1, index: 3 }, { type: "drop" }, 4).picked, null, "drop releases");
t(
  reduceReorder({ id: "b", origin: 1, index: 3 }, { type: "drop" }, 4).commit,
  null,
  "drop commits nothing — every move already did",
);
t(
  reduceReorder({ id: "b", origin: 1, index: 3 }, { type: "cancel" }, 4).commit,
  { from: 3, to: 1 },
  "cancel puts it back where it started",
);
t(reduceReorder({ id: "b", origin: 1, index: 3 }, { type: "cancel" }, 4).picked, null, "cancel releases");
t(
  reduceReorder({ id: "b", origin: 1, index: 1 }, { type: "cancel" }, 4).commit,
  null,
  "cancel after no movement commits nothing",
);

console.log("\nreduceReorder — nothing held");
t(reduceReorder(null, { type: "move", delta: 1 }, 4), { picked: null, commit: null }, "move with nothing held does nothing");
t(reduceReorder(null, { type: "drop" }, 4), { picked: null, commit: null }, "drop with nothing held does nothing");
t(reduceReorder(null, { type: "cancel" }, 4), { picked: null, commit: null }, "cancel with nothing held does nothing");

console.log("\nkeyToReorderAction — vertical");
const V = (k: string, held: boolean) => keyToReorderAction(k, "vertical", held, 4);
t(V(" ", false), { type: "pickup" }, "Space picks up");
t(V("Enter", false), { type: "pickup" }, "Enter picks up");
t(V(" ", true), { type: "drop" }, "Space drops");
t(V("ArrowDown", true), { type: "move", delta: 1 }, "ArrowDown moves down");
t(V("ArrowUp", true), { type: "move", delta: -1 }, "ArrowUp moves up");
t(V("Home", true), { type: "moveTo", index: 0 }, "Home");
t(V("End", true), { type: "moveTo", index: 3 }, "End uses total - 1");
t(V("Escape", true), { type: "cancel" }, "Escape cancels while held");

console.log("\nkeyToReorderAction — keys it must NOT claim");
/* A sortable list inside a dialog that swallows Escape is a dialog that stops
   closing, and the arrows belong to the page until something is picked up. */
t(V("Escape", false), null, "Escape with nothing held bubbles, so a dialog can close");
t(V("ArrowDown", false), null, "arrows with nothing held bubble");
t(V("ArrowLeft", true), null, "the cross-axis arrow is not claimed in a vertical list");
t(V("Home", false), null, "Home with nothing held bubbles");
t(V("Tab", true), null, "Tab is never claimed");
t(V("a", true), null, "an ordinary character is never claimed");

console.log("\nkeyToReorderAction — horizontal swaps the axis");
const H = (k: string, held: boolean) => keyToReorderAction(k, "horizontal", held, 4);
t(H("ArrowRight", true), { type: "move", delta: 1 }, "ArrowRight moves forward");
t(H("ArrowLeft", true), { type: "move", delta: -1 }, "ArrowLeft moves back");
t(H("ArrowDown", true), null, "the cross-axis arrow is not claimed in a horizontal list");

console.log("\nthe property that keeps keyboard and pointer honest");
/* Both paths end in moveItem with the same from/to, so they cannot drift. */
let same = 0;
let differ = 0;
for (let from = 0; from < L.length; from++) {
  for (let to = 0; to < L.length; to++) {
    const byPointer = moveItem(L, from, to);
    // The keyboard walks there one step at a time, committing as it goes.
    let arr = [...L];
    let picked: PickedUp | null = { id: L[from]!, origin: from, index: from };
    const step = to > from ? 1 : -1;
    while (picked && picked.index !== to) {
      const r = reduceReorder(picked, { type: "move", delta: step }, L.length);
      if (r.commit) arr = moveItem(arr, r.commit.from, r.commit.to);
      picked = r.picked;
    }
    JSON.stringify(arr) === JSON.stringify(byPointer) ? same++ : differ++;
  }
}
t([same, differ], [L.length * L.length, 0], `all ${L.length * L.length} from/to pairs agree between the two paths`);

console.log(f === 0 ? "\nall passed\n" : `\n${f} FAILED\n`);
process.exit(f === 0 ? 0 : 1);
