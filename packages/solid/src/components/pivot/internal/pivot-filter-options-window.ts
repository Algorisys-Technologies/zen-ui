import {
  alignWindowStart,
  missingWindowStarts,
  pruneWindowsByRange,
  requiredWindowStarts,
} from "./virtual-window";

/** In-memory slice of server-ordered filter values for virtual scrolling. */
export type PivotFilterOptionsWindow = {
  startIndex: number;
  values: string[];
};

export const alignPivotFilterWindowStart = alignWindowStart;
export const pivotFilterRequiredWindowStarts = requiredWindowStarts;

/** Rows before window.startIndex that may render blank while scrolling forward. */
export const PIVOT_FILTER_LEADING_OVERSCAN_SLACK = 4;

function toSpans(windows: readonly PivotFilterOptionsWindow[]) {
  return windows.map((window) => ({
    startIndex: window.startIndex,
    length: window.values.length,
  }));
}

function windowCoversIndexRange(
  window: PivotFilterOptionsWindow,
  from: number,
  to: number,
): boolean {
  const windowEnd = window.startIndex + window.values.length - 1;
  if (from < window.startIndex || to > windowEnd) {
    return false;
  }
  return to - window.startIndex < window.values.length;
}

/** Returns whether cached windows already cover the visible index range. */
export function pivotFilterWindowCoversRange(
  windows: readonly PivotFilterOptionsWindow[],
  minIndex: number,
  maxIndex: number,
  pageSize: number,
): boolean {
  return (
    pivotFilterMissingWindowStarts(windows, minIndex, maxIndex, pageSize)
      .length === 0
  );
}

/** Page offsets that still need to be fetched for the visible range. */
export function pivotFilterMissingWindowStarts(
  windows: readonly PivotFilterOptionsWindow[],
  minIndex: number,
  maxIndex: number,
  pageSize: number,
): number[] {
  return missingWindowStarts(toSpans(windows), minIndex, maxIndex, pageSize).filter(
    (pageStart) => {
      const pageEnd = pageStart + pageSize - 1;
      return !isLeadingOverscanOnly(
        minIndex,
        pageStart,
        pageEnd,
        windows,
        maxIndex,
      );
    },
  );
}

function isLeadingOverscanOnly(
  minIndex: number,
  pageStart: number,
  pageEnd: number,
  windows: readonly PivotFilterOptionsWindow[],
  maxIndex: number,
): boolean {
  const segmentEnd = Math.min(maxIndex, pageEnd);
  if (segmentEnd < minIndex) {
    return false;
  }
  for (const window of windows) {
    if (window.values.length === 0 || maxIndex < window.startIndex) {
      continue;
    }
    if (window.startIndex - minIndex > PIVOT_FILTER_LEADING_OVERSCAN_SLACK) {
      continue;
    }
    const trailingEnd = Math.min(
      maxIndex,
      window.startIndex + window.values.length - 1,
    );
    if (
      segmentEnd < window.startIndex &&
      windowCoversIndexRange(window, window.startIndex, trailingEnd)
    ) {
      return true;
    }
  }
  return false;
}

/** Drops windows outside the visible range plus one page of keep buffer. */
export function prunePivotFilterWindows(
  windows: readonly PivotFilterOptionsWindow[],
  minIndex: number,
  maxIndex: number,
  pageSize: number,
): PivotFilterOptionsWindow[] {
  return pruneWindowsByRange(
    windows.map((window) => ({
      startIndex: window.startIndex,
      length: window.values.length,
      window,
    })),
    minIndex,
    maxIndex,
    pageSize,
  ).map((entry) => entry.window);
}

/** Reads a value from cached windows by global index. */
export function pivotFilterWindowValueAt(
  windows: readonly PivotFilterOptionsWindow[],
  index: number,
): string | undefined {
  for (const window of windows) {
    const localIndex = index - window.startIndex;
    if (localIndex >= 0 && localIndex < window.values.length) {
      return window.values[localIndex];
    }
  }
  return undefined;
}

/** Global row indexes to render for the current scroll position. */
export function pivotFilterVisibleIndices(
  scrollTop: number,
  viewportHeight: number,
  rowHeight: number,
  total: number,
  overscan: number,
): number[] {
  if (total <= 0 || rowHeight <= 0) {
    return [];
  }
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const end = Math.min(
    total - 1,
    Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan,
  );
  if (end < start) {
    return [];
  }
  return Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
}
