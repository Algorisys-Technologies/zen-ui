/**
 * Splitter geometry — the pure half of Splitter.
 *
 * Radix has no splitter primitive and neither does Kobalte, so there is nothing
 * to wrap: the arithmetic is written once here and every binding calls it.
 * `react-resizable-panels` was the obvious React answer and was refused, because
 * it has no Solid equivalent — the two bindings would then differ in behaviour
 * rather than only in composition style, and behaviour is exactly what
 * `check-parity` cannot compare. Pinned by scripts/check-splitter.ts.
 *
 * Sizes are PERCENTAGES. A splitter whose panels are pixel-sized breaks the
 * moment the window resizes, and every consumer then writes the same resize
 * observer. A pixel `min` is more natural for some callers and can be added
 * later as `minPx` without breaking anything, which is the reason not to add it
 * now.
 *
 * The invariant, restated because it is the one that silently breaks: sizes sum
 * to 100 after every operation, including at a clamp and including a collapse.
 */

export type SplitterOrientation = "horizontal" | "vertical";

export interface SplitterPanelConstraint {
  /** Percent. Default 0. */
  min?: number;
  /** Percent. Default 100. */
  max?: number;
  /** May snap shut when dragged past the threshold. */
  collapsible?: boolean;
  /** Percent when collapsed. Default 0; non-zero leaves a rail. */
  collapsedSize?: number;
}

/** One arrow press. */
export const SPLITTER_STEP = 1;
/** Shift + arrow. */
export const SPLITTER_STEP_LARGE = 10;

const EPS = 1e-6;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round = (n: number) => Math.round(n * 1e6) / 1e6;

const even = (count: number): number[] =>
  count <= 0 ? [] : Array.from({ length: count }, () => round(100 / count));

/**
 * Coerce whatever the caller gave into a layout that sums to 100.
 *
 * A proportion is scaled rather than rejected — `[3, 1]` is a perfectly clear
 * request for 75/25, and demanding percentages that already total 100 makes
 * `defaultSizes` annoying to write by hand. Anything that cannot describe a
 * layout at all (wrong count, negative, all zero) falls back to an even split
 * instead of throwing: a splitter that renders evenly is recoverable, and one
 * that crashes on mount takes the page with it.
 */
export const normalizeSizes = (sizes: number[] | undefined, count: number): number[] => {
  if (count <= 0) return [];
  if (!sizes || sizes.length !== count) return even(count);
  if (sizes.some((s) => !Number.isFinite(s) || s < 0)) return even(count);

  const total = sizes.reduce((a, b) => a + b, 0);
  if (total <= EPS) return even(count);
  if (Math.abs(total - 100) < EPS) return sizes.map(round);

  const scaled = sizes.map((s) => round((s / total) * 100));
  /* Rounding can leave the sum a hair off 100; the last panel absorbs it so the
     invariant holds exactly rather than nearly. */
  const drift = round(100 - scaled.reduce((a, b) => a + b, 0));
  scaled[scaled.length - 1] = round(scaled[scaled.length - 1]! + drift);
  return scaled;
};

/**
 * How far the boundary at `handleIndex` can actually travel, as sizes of the
 * PRECEDING panel.
 *
 * This is what `aria-valuemin` and `aria-valuemax` must report. Hardcoding 0
 * and 100 there is a lie a screen reader repeats on every press: a panel
 * clamped to 20–70 announced as "30, minimum 0, maximum 100" tells its user
 * the arrows will keep working for another twenty percent that does not exist.
 *
 * Exported and shared with `dragHandle` rather than recomputed in each binding,
 * so the announced range and the reachable range cannot drift apart.
 */
export const handleBounds = (
  sizes: number[],
  handleIndex: number,
  constraints: SplitterPanelConstraint[],
): { min: number; max: number } => {
  if (handleIndex < 0 || handleIndex >= sizes.length - 1) return { min: 0, max: 100 };
  const pair = round((sizes[handleIndex] ?? 0) + (sizes[handleIndex + 1] ?? 0));
  const ca = constraints[handleIndex] ?? {};
  const cb = constraints[handleIndex + 1] ?? {};
  const lo = Math.max(ca.min ?? 0, pair - (cb.max ?? 100));
  const hi = Math.min(ca.max ?? 100, pair - (cb.min ?? 0));
  /* An over-constrained layout would otherwise announce max < min. */
  return lo > hi ? { min: round(lo), max: round(lo) } : { min: round(lo), max: round(hi) };
};

/**
 * Move the boundary between panels `handleIndex` and `handleIndex + 1`.
 *
 * ONLY those two panels change. A drag that "borrows" from a third panel once
 * its neighbour hits a min silently rearranges a layout the user was not
 * touching, which is the bug the three-panel cases in the contract exist to
 * catch. Their combined size is therefore fixed, and the whole operation is
 * choosing where to put the boundary inside it.
 *
 * Collapse is a SNAP, not a clamp: past halfway to its min, a collapsible panel
 * shuts rather than sitting at an unusable sliver the user then has to fight
 * back open.
 */
export const dragHandle = (
  sizes: number[],
  handleIndex: number,
  delta: number,
  constraints: SplitterPanelConstraint[],
): number[] => {
  const next = sizes.map(round);
  if (handleIndex < 0 || handleIndex >= next.length - 1) return next;
  if (Number.isNaN(delta)) return next;

  const i = handleIndex;
  const a0 = next[i]!;
  const b0 = next[i + 1]!;
  const pair = round(a0 + b0);

  const ca = constraints[i] ?? {};
  const cb = constraints[i + 1] ?? {};
  const minA = ca.min ?? 0;
  const maxA = ca.max ?? 100;
  const minB = cb.min ?? 0;
  const collapsedA = ca.collapsedSize ?? 0;
  const collapsedB = cb.collapsedSize ?? 0;

  const desired = a0 + delta;

  /* The window the boundary may sit in, given BOTH panels' bounds — the same
     function the ARIA range is reported from, so the two cannot disagree. */
  const { min: lo, max: hi } = handleBounds(next, i, constraints);

  /* Dragging OUT of a collapse opens to at least the min. Without this a
     collapsed panel is a trap: every small outward drag lands nearer the
     collapsed size than the min, so it snaps shut again and the panel can only
     be recovered in code. */
  const reopeningA = ca.collapsible && Math.abs(a0 - collapsedA) < EPS && delta > 0;
  const reopeningB = cb.collapsible && Math.abs(b0 - collapsedB) < EPS && delta < 0;

  /* Past the min, snap to whichever of collapsed-or-min is NEARER. A fixed
     fraction of the min is arbitrary; "which did they mean" is not, and it
     keeps the snap symmetric with the drag back out. */
  const snapsShut = (target: number, min: number, collapsed: number) =>
    target < min - EPS && Math.abs(target - collapsed) < Math.abs(target - min);

  let a: number;
  if (reopeningA) {
    a = clamp(Math.max(desired, minA), lo, hi);
  } else if (reopeningB) {
    a = clamp(Math.min(desired, pair - minB), lo, hi);
  } else if (ca.collapsible && snapsShut(desired, minA, collapsedA)) {
    a = collapsedA;
  } else if (cb.collapsible && snapsShut(pair - desired, minB, collapsedB)) {
    a = round(pair - collapsedB);
  } else if (lo > hi) {
    /* The bounds cannot all be satisfied — an over-constrained layout. Honour
       the preceding panel's min, which is the one the user is dragging. */
    a = clamp(desired, minA, maxA);
  } else {
    a = clamp(desired, lo, hi);
  }

  next[i] = round(a);
  next[i + 1] = round(pair - a);
  return next;
};

/**
 * What a key press does to a handle, or `null` for one it does not claim.
 *
 * Home and End return infinities rather than a large number so they land
 * EXACTLY on the bound after clamping, whatever the bound happens to be. A
 * "large enough" constant is a guess that is wrong for some layout.
 */
export const splitterKeyDelta = (
  key: string,
  orientation: SplitterOrientation,
  shift: boolean,
): number | null => {
  if (key === "Home") return -Infinity;
  if (key === "End") return Infinity;

  const step = shift ? SPLITTER_STEP_LARGE : SPLITTER_STEP;
  const back = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
  const forward = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
  if (key === back) return -step;
  if (key === forward) return step;
  return null;
};

/**
 * Mirror a delta for right-to-left, horizontal only.
 *
 * Under RTL the preceding panel is on the RIGHT, so the left arrow grows it
 * rather than shrinking it. Vertical is unaffected — down is down in every
 * writing direction, and mirroring it is a bug people do ship.
 */
export const mirrorDelta = (
  delta: number,
  orientation: SplitterOrientation,
  direction: "ltr" | "rtl",
): number => (orientation === "horizontal" && direction === "rtl" ? -delta : delta);
