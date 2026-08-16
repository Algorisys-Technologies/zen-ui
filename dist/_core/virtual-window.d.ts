/**
 * Window maths for virtualized, server-paged lists.
 *
 * Framework-agnostic and, unlike the rest of the pivot, not pivot-specific:
 * page alignment, which windows are missing for a visible range, pruning what
 * has scrolled away, and picking the nearest page to fetch next. Nothing else
 * in the library does this — DataTable virtualizes rows it already has, and
 * VirtualizedItems takes a materialized array — so this is real infrastructure
 * rather than a duplicate.
 *
 * It lived in packages/solid/src/components/pivot/internal, where its own
 * doc comment said it was meant to keep "pivot grids, filter dropdowns, and
 * future large lists consistent" — a cross-cutting intent, filed somewhere
 * nothing could cross-cut to, and unreachable from React entirely.
 *
 * Pinned by scripts/check-virtual-window.ts.
 */
/** Debounce after scroll settles before fetching the next data window. */
export declare const VIRTUAL_SCROLL_FETCH_DEBOUNCE_MS = 200;
/** Default server page size for sliding row/value windows (TM1-style segments). */
export declare const VIRTUAL_SCROLL_WINDOW_PAGE_SIZE = 50;
/** Aligns an index down to the start of its page-sized window. */
export declare function alignWindowStart(minIndex: number, windowSize: number): number;
/** Page-aligned offsets that intersect `[minIndex, maxIndex]`. */
export declare function requiredWindowStarts(minIndex: number, maxIndex: number, pageSize: number): number[];
export type WindowLength = {
    startIndex: number;
    /** Number of loaded slots in this window (may be shorter than pageSize). */
    length: number;
};
/** Page offsets still needed to cover the visible index range. */
export declare function missingWindowStarts(windows: readonly WindowLength[], minIndex: number, maxIndex: number, pageSize: number): number[];
/**
 * Drops windows outside the visible range plus one page of keep buffer
 * on each side.
 */
export declare function pruneWindowsByRange<T extends WindowLength>(windows: readonly T[], minIndex: number, maxIndex: number, pageSize: number): T[];
/** Picks the missing page whose center is nearest the visible midpoint. */
export declare function pickNearestWindowStart(missing: readonly number[], mid: number, pageSize: number): number;
export type PivotFilterOptionsWindow = {
    startIndex: number;
    values: string[];
};
/** Rows before window.startIndex that may render blank while scrolling forward. */
export declare const PIVOT_FILTER_LEADING_OVERSCAN_SLACK = 4;
/** Returns whether cached windows already cover the visible index range. */
export declare function pivotFilterWindowCoversRange(windows: readonly PivotFilterOptionsWindow[], minIndex: number, maxIndex: number, pageSize: number): boolean;
/** Page offsets that still need to be fetched for the visible range. */
export declare function pivotFilterMissingWindowStarts(windows: readonly PivotFilterOptionsWindow[], minIndex: number, maxIndex: number, pageSize: number): number[];
/** Drops windows outside the visible range plus one page of keep buffer. */
export declare function prunePivotFilterWindows(windows: readonly PivotFilterOptionsWindow[], minIndex: number, maxIndex: number, pageSize: number): PivotFilterOptionsWindow[];
/** Reads a value from cached windows by global index. */
export declare function pivotFilterWindowValueAt(windows: readonly PivotFilterOptionsWindow[], index: number): string | undefined;
