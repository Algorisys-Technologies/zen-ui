/**
 * Splitter geometry contract.
 *
 *   bun run check:splitter
 *
 * The pure half of Splitter. Radix has no splitter primitive and neither does
 * Kobalte, so there is nothing to wrap — the drag arithmetic is written once
 * here and all four bindings call it. `react-resizable-panels` was the obvious
 * React answer and was refused: it has no Solid equivalent, so the two bindings
 * would diverge in BEHAVIOUR rather than only in composition style, which is
 * the one divergence `check-parity` cannot see.
 *
 * Sizes are percentages, not pixels. A splitter whose panels are pixel-sized
 * breaks the moment the window resizes and every consumer then writes the same
 * resize observer. The invariant every case below re-checks is that they still
 * sum to 100 afterwards — including at a clamp, which is where a naive
 * implementation quietly loses or invents a percent.
 */
import {
  normalizeSizes,
  dragHandle,
  splitterKeyDelta,
  mirrorDelta,
  handleBounds,
  SPLITTER_STEP,
  SPLITTER_STEP_LARGE,
  type SplitterPanelConstraint,
} from "../packages/core/src/splitter";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(58)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};
/** Every returned layout must still describe a whole splitter. */
const sums100 = (sizes: number[], name: string) =>
  t(Math.round(sizes.reduce((a, b) => a + b, 0) * 1e6) / 1e6, 100, name);

const free: SplitterPanelConstraint[] = [{}, {}];

console.log("\nnormalizeSizes");
t(normalizeSizes(undefined, 2), [50, 50], "no sizes is an even split");
t(normalizeSizes(undefined, 4), [25, 25, 25, 25], "…for any count");
t(normalizeSizes([30, 70], 2), [30, 70], "already valid passes through");
t(normalizeSizes([1, 1], 2), [50, 50], "a proportion is scaled to 100");
t(normalizeSizes([3, 1], 2), [75, 25], "…keeping the ratio");
t(normalizeSizes([30], 2), [50, 50], "the wrong count falls back to even");
t(normalizeSizes([0, 0], 2), [50, 50], "all-zero cannot be scaled, so even");
t(normalizeSizes([-10, 110], 2), [50, 50], "a negative size is not a layout");
t(normalizeSizes(undefined, 0), [], "no panels");
t(normalizeSizes(undefined, 1), [100], "one panel is the whole thing");
sums100(normalizeSizes([17, 41, 23], 3), "a normalised three-panel layout sums to 100");

console.log("\ndragHandle — the basics");
t(dragHandle([50, 50], 0, 10, free), [60, 40], "positive delta grows the preceding panel");
t(dragHandle([50, 50], 0, -10, free), [40, 60], "negative delta shrinks it");
t(dragHandle([50, 50], 0, 0, free), [50, 50], "zero delta is identity");
sums100(dragHandle([50, 50], 0, 10, free), "after a drag");
sums100(dragHandle([50, 50], 0, 999, free), "after a drag past the end");

console.log("\ndragHandle — clamps at min and max");
const minned: SplitterPanelConstraint[] = [{ min: 20 }, { min: 30 }];
t(dragHandle([50, 50], 0, -999, minned), [20, 80], "the preceding panel stops at its own min");
t(dragHandle([50, 50], 0, 999, minned), [70, 30], "…and at the FOLLOWING panel's min");
sums100(dragHandle([50, 50], 0, -999, minned), "at a min clamp");
const maxed: SplitterPanelConstraint[] = [{ max: 60 }, {}];
t(dragHandle([50, 50], 0, 999, maxed), [60, 40], "a max on the preceding panel");
t(dragHandle([50, 50], 0, 5, minned), [55, 45], "a drag inside the bounds is untouched");

console.log("\ndragHandle — three panels: only the two neighbours move");
/* The failure this catches is a drag that "borrows" from a third panel once its
   neighbour hits a min, which silently rearranges a layout the user was not
   touching. */
const three: SplitterPanelConstraint[] = [{ min: 20 }, { min: 20 }, { min: 20 }];
t(dragHandle([40, 30, 30], 0, 10, three), [50, 20, 30], "handle 0 moves panels 0 and 1");
t(dragHandle([40, 30, 30], 1, 10, three), [40, 40, 20], "handle 1 moves panels 1 and 2");
t(dragHandle([40, 30, 30], 1, 999, three), [40, 40, 20], "…and stops at panel 2's min, not panel 0's size");
t(dragHandle([40, 30, 30], 0, -999, three)[2], 30, "the far panel is untouched by a clamped drag");
sums100(dragHandle([40, 30, 30], 1, 999, three), "three panels after a clamped drag");

console.log("\ndragHandle — collapse");
/* Collapsing is a snap, not a clamp: dragged past its min, a collapsible panel
   goes to whichever of collapsed-or-min is NEARER, rather than sitting at an
   unusable sliver. "Which did they mean" beats a fixed fraction of the min,
   which is arbitrary and asymmetric with the drag back out. */
const collapsible: SplitterPanelConstraint[] = [{ min: 20, collapsible: true }, { min: 20 }];
t(dragHandle([50, 50], 0, -45, collapsible), [0, 100], "dragged nearer 0 than to its min, it snaps shut");
t(dragHandle([50, 50], 0, -35, collapsible), [20, 80], "…past the min but nearer the min, it clamps to min");
t(dragHandle([50, 50], 0, -25, collapsible), [25, 75], "…and above the min it just resizes");
sums100(dragHandle([50, 50], 0, -45, collapsible), "after collapsing");
const railed: SplitterPanelConstraint[] = [{ min: 20, collapsible: true, collapsedSize: 5 }, {}];
t(dragHandle([50, 50], 0, -45, railed), [5, 95], "collapsedSize leaves a rail rather than nothing");
const notCollapsible: SplitterPanelConstraint[] = [{ min: 20 }, {}];
t(dragHandle([50, 50], 0, -45, notCollapsible), [20, 80], "a panel that is not collapsible only clamps");
const collapseSecond: SplitterPanelConstraint[] = [{}, { min: 20, collapsible: true }];
t(dragHandle([50, 50], 0, 45, collapseSecond), [100, 0], "the FOLLOWING panel can collapse too");

console.log("\ndragHandle — a collapsed panel reopens");
t(dragHandle([0, 100], 0, 30, collapsible), [30, 70], "dragging out of a collapse restores a real size");
t(dragHandle([0, 100], 0, 5, collapsible), [20, 80], "…and a small drag opens it to at least its min");

console.log("\ndragHandle — bad input cannot produce a bad layout");
t(dragHandle([50, 50], 5, 10, free), [50, 50], "an out-of-range handle index changes nothing");
t(dragHandle([50, 50], -1, 10, free), [50, 50], "…including a negative one");
t(dragHandle([100], 0, 10, [{}]), [100], "a single panel has no handle to drag");
t(dragHandle([], 0, 10, []), [], "no panels");
t(dragHandle([50, 50], 0, Number.NaN, free), [50, 50], "NaN is not a drag");
const input = [50, 50];
dragHandle(input, 0, 10, free);
t(input, [50, 50], "the input array is not mutated");

console.log("\nsplitterKeyDelta — 1 and 10, Home and End");
t(SPLITTER_STEP, 1, "the small step is 1%");
t(SPLITTER_STEP_LARGE, 10, "shift makes it 10%");
t(splitterKeyDelta("ArrowRight", "horizontal", false), 1, "arrow along the axis");
t(splitterKeyDelta("ArrowRight", "horizontal", true), 10, "shift + arrow");
t(splitterKeyDelta("ArrowLeft", "horizontal", false), -1, "the other way");
t(splitterKeyDelta("ArrowDown", "vertical", false), 1, "vertical uses up/down");
t(splitterKeyDelta("ArrowUp", "vertical", true), -10, "shift + vertical");
t(splitterKeyDelta("ArrowDown", "horizontal", false), null, "the cross-axis arrow is not claimed");
t(splitterKeyDelta("Home", "horizontal", false), -Infinity, "Home drives the preceding panel to its min");
t(splitterKeyDelta("End", "horizontal", false), Infinity, "End drives it to its max");
t(splitterKeyDelta("Tab", "horizontal", false), null, "Tab is never claimed");
t(splitterKeyDelta("a", "vertical", false), null, "an ordinary character is never claimed");
/* Home and End must land exactly on the bounds, which is the point of using
   infinities rather than a large number. */
t(dragHandle([50, 50], 0, splitterKeyDelta("Home", "horizontal", false)!, minned), [20, 80], "Home lands exactly on min");
t(dragHandle([50, 50], 0, splitterKeyDelta("End", "horizontal", false)!, maxed), [60, 40], "End lands exactly on max");

console.log("\nhandleBounds — what aria-valuemin/max must report");
/* Announcing a flat 0-100 tells a screen-reader user the arrows will keep
   working for twenty percent that does not exist. */
t(handleBounds([50, 50], 0, free), { min: 0, max: 100 }, "unconstrained is the whole range");
t(handleBounds([50, 50], 0, minned), { min: 20, max: 70 }, "both panels' mins narrow it");
t(handleBounds([50, 50], 0, maxed), { min: 0, max: 60 }, "a max on the preceding panel");
t(handleBounds([40, 30, 30], 1, three), { min: 20, max: 40 }, "a middle handle sees only its pair");
t(handleBounds([50, 50], 9, free), { min: 0, max: 100 }, "an out-of-range handle reports the full range");
t(handleBounds([100], 0, [{}]), { min: 0, max: 100 }, "a single panel has no boundary");
/* The announced range and the reachable range are the same function, so a
   value dragged to either end must land exactly on what was announced. */
t(dragHandle([50, 50], 0, -999, minned)[0], handleBounds([50, 50], 0, minned).min, "dragging to the floor lands on the announced min");
t(dragHandle([50, 50], 0, 999, minned)[0], handleBounds([50, 50], 0, minned).max, "…and to the ceiling on the announced max");

console.log("\nmirrorDelta — RTL flips the horizontal axis only");
t(mirrorDelta(10, "horizontal", "ltr"), 10, "horizontal LTR is unchanged");
t(mirrorDelta(10, "horizontal", "rtl"), -10, "horizontal RTL is mirrored");
t(mirrorDelta(10, "vertical", "rtl"), 10, "vertical is NOT mirrored under RTL");
t(mirrorDelta(10, "vertical", "ltr"), 10, "vertical LTR");
t(mirrorDelta(-Infinity, "horizontal", "rtl"), Infinity, "Home/End mirror too, so they stay on the visual end");

console.log(f === 0 ? "\nall passed\n" : `\n${f} FAILED\n`);
process.exit(f === 0 ? 0 : 1);
