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
export const VIRTUAL_SCROLL_FETCH_DEBOUNCE_MS = 200;

/** Default server page size for sliding row/value windows (TM1-style segments). */
export const VIRTUAL_SCROLL_WINDOW_PAGE_SIZE = 50;

/** Aligns an index down to the start of its page-sized window. */
export function alignWindowStart(minIndex: number, windowSize: number): number {
  if (windowSize <= 0) {
    return 0;
  }
  // Clamped at 0: Math.floor(-5 / 50) * 50 is -50, and a negative page start
  // becomes `offset: -50` in a fetch — which a server answers with a 400 or,
  // worse, with something. A virtualizer's overscan subtracts from the first
  // visible index, so a negative arrives here the moment anyone scrolls to the
  // top of a list without clamping first.
  if (minIndex <= 0) {
    return 0;
  }
  return Math.floor(minIndex / windowSize) * windowSize;
}

/** Page-aligned offsets that intersect `[minIndex, maxIndex]`. */
export function requiredWindowStarts(
  minIndex: number,
  maxIndex: number,
  pageSize: number,
): number[] {
  // An inverted range is not a range. It used to return page 0 and fetch it for
  // nothing, because both ends aligned to the same place.
  if (maxIndex < minIndex) {
    return [];
  }
  const start = alignWindowStart(minIndex, pageSize);
  const end = alignWindowStart(maxIndex, pageSize);
  const starts: number[] = [];
  for (let offset = start; offset <= end; offset += pageSize) {
    starts.push(offset);
  }
  return starts;
}

export type WindowLength = {
  startIndex: number;
  /** Number of loaded slots in this window (may be shorter than pageSize). */
  length: number;
};

function findWindowAt(
  windows: readonly WindowLength[],
  startIndex: number,
): WindowLength | undefined {
  return windows.find((window) => window.startIndex === startIndex);
}

function windowCoversLocalRange(
  window: WindowLength,
  from: number,
  to: number,
): boolean {
  const windowEnd = window.startIndex + window.length - 1;
  return from >= window.startIndex && to <= windowEnd;
}

/** Page offsets still needed to cover the visible index range. */
export function missingWindowStarts(
  windows: readonly WindowLength[],
  minIndex: number,
  maxIndex: number,
  pageSize: number,
): number[] {
  const required = requiredWindowStarts(minIndex, maxIndex, pageSize);
  const missing: number[] = [];
  for (const pageStart of required) {
    const pageEnd = pageStart + pageSize - 1;
    const segmentStart = Math.max(minIndex, pageStart);
    const segmentEnd = Math.min(maxIndex, pageEnd);
    const window = findWindowAt(windows, pageStart);
    if (
      window &&
      window.length > 0 &&
      windowCoversLocalRange(window, segmentStart, segmentEnd)
    ) {
      continue;
    }
    missing.push(pageStart);
  }
  return missing;
}

/**
 * Drops windows outside the visible range plus one page of keep buffer
 * on each side.
 */
export function pruneWindowsByRange<T extends WindowLength>(
  windows: readonly T[],
  minIndex: number,
  maxIndex: number,
  pageSize: number,
): T[] {
  if (pageSize <= 0 || windows.length === 0) {
    return [...windows];
  }
  const keepMin = Math.max(0, alignWindowStart(minIndex, pageSize) - pageSize);
  const keepMaxEnd =
    alignWindowStart(maxIndex, pageSize) + pageSize * 2 - 1;
  return windows.filter((window) => {
    const windowEnd = window.startIndex + Math.max(window.length, 1) - 1;
    return windowEnd >= keepMin && window.startIndex <= keepMaxEnd;
  });
}

/** Picks the missing page whose center is nearest the visible midpoint. */
export function pickNearestWindowStart(
  missing: readonly number[],
  mid: number,
  pageSize: number,
): number {
  let best = missing[0];
  let bestDist = Math.abs(best + pageSize / 2 - mid);
  for (let i = 1; i < missing.length; i++) {
    const start = missing[i];
    const dist = Math.abs(start + pageSize / 2 - mid);
    if (dist < bestDist) {
      best = start;
      bestDist = dist;
    }
  }
  return best;
}

export type PivotFilterOptionsWindow = {
  startIndex: number;
  values: string[];
};


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
      return !isLeadingOverscanOnly(minIndex, pageEnd, windows, maxIndex);
    },
  );
}

function isLeadingOverscanOnly(
  minIndex: number,
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

