/**
 * Contract for the window maths behind server-paged virtual lists.
 *
 * This is index arithmetic: page alignment, which pages a visible range is
 * missing, what to prune, which page to fetch first. Every failure mode is an
 * off-by-one that looks like a rendering glitch — a row that stays a skeleton, a
 * page fetched twice, a value read from the wrong window — and none of it throws.
 *
 * It is also now shared between two bindings that render it completely
 * differently, so this file is where the two are made to agree.
 */
import {
  PIVOT_FILTER_LEADING_OVERSCAN_SLACK,
  VIRTUAL_SCROLL_WINDOW_PAGE_SIZE,
  alignWindowStart,
  missingWindowStarts,
  pickNearestWindowStart,
  pivotFilterMissingWindowStarts,
  pivotFilterWindowCoversRange,
  pivotFilterWindowValueAt,
  pruneWindowsByRange,
  requiredWindowStarts,
  type PivotFilterOptionsWindow,
} from "../packages/core/src/virtual-window";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(50)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};

console.log("\naligning a scroll position to a page boundary");
t(alignWindowStart(0, 50), 0, "0 is already a boundary");
t(alignWindowStart(49, 50), 0, "49 belongs to the page starting at 0");
t(alignWindowStart(50, 50), 50, "50 starts the next page");
t(alignWindowStart(51, 50), 50, "51 belongs to it");
t(alignWindowStart(137, 50), 100, "137 -> 100");
// A virtualizer's overscan can ask for a negative index.
t(alignWindowStart(-5, 50), 0, "a negative index does not produce a negative page");

console.log("\nwhich pages a visible range needs");
t(requiredWindowStarts(0, 10, 50), [0], "a range inside one page needs one");
t(requiredWindowStarts(0, 49, 50), [0], "…right up to its last index");
t(requiredWindowStarts(0, 50, 50), [0, 50], "one index past it needs two");
t(requiredWindowStarts(49, 51, 50), [0, 50], "a range straddling a boundary");
t(requiredWindowStarts(120, 260, 50), [100, 150, 200, 250], "a long range needs every page it touches");
t(requiredWindowStarts(10, 5, 50), [], "an inverted range needs nothing");

console.log("\nwhich of them are missing");
/** The pivot-filter shape: {startIndex, values}. */
const have = (starts: number[], size = 50): PivotFilterOptionsWindow[] =>
  starts.map((startIndex) => ({ startIndex, values: Array.from({ length: size }, (_, i) => `v${startIndex + i}`) }));
/** The GENERIC shape: {startIndex, length}. Two shapes, two helpers — using one
 *  for both is what made a loaded page report as missing. */
const lens = (starts: number[], size = 50) => starts.map((startIndex) => ({ startIndex, length: size }));
t(missingWindowStarts([], 0, 49, 50), [0], "with nothing loaded, everything is missing");
t(missingWindowStarts(lens([0]), 0, 49, 50), [], "a covered range needs nothing");
t(missingWindowStarts(lens([0]), 0, 60, 50), [50], "…only the uncovered part");
t(missingWindowStarts(lens([0, 100]), 0, 160, 50), [50, 150], "gaps in the middle are found");

console.log("\npruning what scrolled away");
// Windows are memory. Keeping every page ever fetched is a leak on a long list.
t(pruneWindowsByRange(lens([0, 50, 100, 150]), 100, 149, 50).map((w) => w.startIndex), [50, 100, 150], "keeps the visible page and its neighbours");
t(pruneWindowsByRange(lens([0, 50]), 0, 49, 50).map((w) => w.startIndex), [0, 50], "keeps the page after the visible one");
t(pruneWindowsByRange([], 0, 49, 50), [], "nothing to prune");

console.log("\nwhich page to fetch first");
// Fetch what the user is looking at, not what happens to be first in the array.
// It compares page CENTRES to the visible midpoint, so pageSize is required —
// omitting it silently produced NaN distances and always returned missing[0].
// `bun run` does not typecheck these scripts, which is why the arity slipped.
t(pickNearestWindowStart([0, 100, 200], 100, 50), 100, "the page containing the midpoint");
t(pickNearestWindowStart([0, 100, 200], 90, 50), 100, "the nearest by centre");
t(pickNearestWindowStart([0, 200], 90, 50), 0, "…even when it is behind");
t(pickNearestWindowStart([], 50, 50), undefined, "nothing to pick");

console.log("\nreading a value by GLOBAL index");
// The windows are sparse: index 120 lives at offset 20 of the page starting at
// 100. Reading it as if the array were dense is how a list shows the wrong value
// rather than no value.
const windows = have([100]);
t(pivotFilterWindowValueAt(windows, 100), "v100", "the first index of a loaded page");
t(pivotFilterWindowValueAt(windows, 120), "v120", "an index inside it");
t(pivotFilterWindowValueAt(windows, 149), "v149", "its last index");
t(pivotFilterWindowValueAt(windows, 150), undefined, "one past the end is not loaded");
t(pivotFilterWindowValueAt(windows, 0), undefined, "an index in an unloaded page");
t(pivotFilterWindowValueAt([], 0), undefined, "nothing loaded");

console.log("\ncoverage");
t(pivotFilterWindowCoversRange(have([0]), 0, 49, 50), true, "a loaded page covers its own range");
t(pivotFilterWindowCoversRange(have([0]), 0, 60, 50), false, "…and not past it");
t(pivotFilterWindowCoversRange([], 0, 10, 50), false, "nothing covers nothing");
// The end of the list is short: the last page is not a full page.
t(pivotFilterWindowCoversRange([{ startIndex: 0, values: ["a", "b", "c"] }], 0, 2, 50), true, "a short final page still covers the list");

console.log("\nthe filter list's missing pages");
t(pivotFilterMissingWindowStarts([], 0, 10, 50), [0], "nothing loaded");
t(pivotFilterMissingWindowStarts(have([0]), 0, 10, 50), [], "already loaded");
t(PIVOT_FILTER_LEADING_OVERSCAN_SLACK, 4, "the overscan slack is a named constant");
t(VIRTUAL_SCROLL_WINDOW_PAGE_SIZE, 50, "the page size is a named constant");

console.log(f ? `\n${f} FAILED\n` : "\nall passed\n");
process.exit(f ? 1 : 0);
