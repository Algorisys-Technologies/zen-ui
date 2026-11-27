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
export declare const SPLITTER_STEP = 1;
/** Shift + arrow. */
export declare const SPLITTER_STEP_LARGE = 10;
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
export declare const normalizeSizes: (sizes: number[] | undefined, count: number) => number[];
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
export declare const handleBounds: (sizes: number[], handleIndex: number, constraints: SplitterPanelConstraint[]) => {
    min: number;
    max: number;
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
export declare const dragHandle: (sizes: number[], handleIndex: number, delta: number, constraints: SplitterPanelConstraint[]) => number[];
/**
 * What a key press does to a handle, or `null` for one it does not claim.
 *
 * Home and End return infinities rather than a large number so they land
 * EXACTLY on the bound after clamping, whatever the bound happens to be. A
 * "large enough" constant is a guess that is wrong for some layout.
 */
export declare const splitterKeyDelta: (key: string, orientation: SplitterOrientation, shift: boolean) => number | null;
/**
 * Mirror a delta for right-to-left, horizontal only.
 *
 * Under RTL the preceding panel is on the RIGHT, so the left arrow grows it
 * rather than shrinking it. Vertical is unaffected — down is down in every
 * writing direction, and mirroring it is a bug people do ship.
 */
export declare const mirrorDelta: (delta: number, orientation: SplitterOrientation, direction: "ltr" | "rtl") => number;
