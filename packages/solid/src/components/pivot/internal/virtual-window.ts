/**
 * Shared page-window math for virtualized sliding fetches (pivot rows/cols,
 * column-filter options).
 */

/** Aligns an index down to the start of its page-sized window. */
export function alignWindowStart(minIndex: number, windowSize: number): number {
  if (windowSize <= 0) {
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
