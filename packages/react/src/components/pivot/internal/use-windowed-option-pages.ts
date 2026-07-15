import * as React from "react";
import {
  PIVOT_FILTER_LEADING_OVERSCAN_SLACK,
  VIRTUAL_SCROLL_FETCH_DEBOUNCE_MS,
  alignWindowStart,
  pickNearestWindowStart,
  pivotFilterMissingWindowStarts,
  prunePivotFilterWindows,
  type PivotFilterOptionsWindow,
} from "@algorisys/zen-ui-core/virtual-window";

/**
 * Fetches pages of options as a list scrolls, and keeps only the ones near the
 * viewport.
 *
 * The index arithmetic — alignment, which pages are missing, what to prune,
 * which to fetch first — is all in @algorisys/zen-ui-core/virtual-window, shared
 * with the Solid binding and pinned by scripts/check-virtual-window.ts. What is
 * left here is the part that cannot be shared: the state machine, in React's
 * idiom rather than Solid's signals.
 *
 * The three things that make it not a for-loop:
 *  - a fetch is debounced, because scrolling produces a range per frame
 *  - a fetch can be overtaken, so responses carry a sequence number and stale
 *    ones are dropped rather than painted over fresh data
 *  - the same page must never be in flight twice
 */

export interface UseWindowedOptionPagesProps {
  pageSize: number;
  /** Fetch nothing while the panel is closed. */
  isActive: boolean;
  search: string;
  loadPage: (offset: number, limit: number, search: string) => Promise<{ values: string[]; hasMore: boolean; total: number }>;
}

export interface WindowedOptionPages {
  loading: boolean;
  loadingWindow: boolean;
  optionsWindows: PivotFilterOptionsWindow[];
  totalCount: number;
  loadError: boolean;
  handleVisibleRange: (minIndex: number, maxIndex: number) => void;
  scheduleFetch: () => void;
  openPanelFetch: () => void;
}

export function useWindowedOptionPages(props: UseWindowedOptionPagesProps): WindowedOptionPages {
  const [optionsWindows, setOptionsWindows] = React.useState<PivotFilterOptionsWindow[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [loadingWindow, setLoadingWindow] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);

  // Refs, not state: none of these paint, and every one of them is read inside
  // an async callback that must see the CURRENT value rather than the value
  // captured when the fetch started.
  const seq = React.useRef(0);
  const inFlight = React.useRef(new Set<number>());
  const range = React.useRef({ minIndex: 0, maxIndex: 0 });
  const debounce = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // The props a fetch needs, read at fetch time. Without this the debounced
  // callback closes over the first render's props and searches for whatever was
  // typed when the component mounted.
  const latest = React.useRef(props);
  latest.current = props;

  const reset = React.useCallback(() => {
    seq.current += 1; // orphan anything in flight
    inFlight.current.clear();
    setOptionsWindows([]);
    setTotalCount(0);
    setLoadError(false);
  }, []);

  const fetchWindow = React.useCallback(async (start: number, isFirstPage: boolean) => {
    const { pageSize, loadPage, search } = latest.current;
    if (inFlight.current.has(start)) return;
    inFlight.current.add(start);

    const mySeq = seq.current;
    if (isFirstPage) setLoading(true);
    else setLoadingWindow(true);

    try {
      const res = await loadPage(start, pageSize, search);
      // Overtaken: the search changed, or the panel closed and reopened. Painting
      // this would show the previous question's answers.
      if (mySeq !== seq.current) return;

      setLoadError(false);
      setTotalCount(res.total);
      setOptionsWindows((prev) => {
        const next = prev.filter((w) => w.startIndex !== start).concat({ startIndex: start, values: res.values });
        next.sort((a, b) => a.startIndex - b.startIndex);
        // Windows are memory: a long list scrolled end to end would otherwise
        // hold every page it ever showed.
        return prunePivotFilterWindows(next, range.current.minIndex, range.current.maxIndex, pageSize);
      });
    } catch {
      if (mySeq !== seq.current) return;
      // Reported, not swallowed. This was computed and dropped, so a failed
      // fetch rendered as "No matching values".
      setLoadError(true);
    } finally {
      inFlight.current.delete(start);
      if (mySeq === seq.current) {
        if (isFirstPage) setLoading(false);
        else setLoadingWindow(false);
      }
    }
  }, []);

  const fetchMissing = React.useCallback(() => {
    const { pageSize, isActive } = latest.current;
    if (!isActive) return;
    const { minIndex, maxIndex } = range.current;

    setOptionsWindows((current) => {
      const missing = pivotFilterMissingWindowStarts(current, minIndex, maxIndex, pageSize).filter(
        (s) => !inFlight.current.has(s),
      );
      if (missing.length) {
        // Nearest to what the user is actually looking at, not first in the
        // array: at the bottom of a long list, page 0 is the least useful thing
        // to fetch.
        const mid = (minIndex + maxIndex) / 2;
        const next = pickNearestWindowStart(missing, mid, pageSize);
        if (next !== undefined) void fetchWindow(next, current.length === 0);
      }
      return current; // read-only pass
    });
  }, [fetchWindow]);

  const scheduleFetch = React.useCallback(() => {
    if (debounce.current) clearTimeout(debounce.current);
    // Scrolling produces a visible range every frame. Without this, so would the
    // fetches.
    debounce.current = setTimeout(fetchMissing, VIRTUAL_SCROLL_FETCH_DEBOUNCE_MS);
  }, [fetchMissing]);

  const handleVisibleRange = React.useCallback(
    (minIndex: number, maxIndex: number) => {
      // Slack, so a one-row scroll does not re-fetch the page you are on.
      range.current = {
        minIndex: Math.max(0, minIndex - PIVOT_FILTER_LEADING_OVERSCAN_SLACK),
        maxIndex: maxIndex + PIVOT_FILTER_LEADING_OVERSCAN_SLACK,
      };
      scheduleFetch();
    },
    [scheduleFetch],
  );

  const openPanelFetch = React.useCallback(() => {
    reset();
    range.current = { minIndex: 0, maxIndex: latest.current.pageSize - 1 };
    void fetchWindow(alignWindowStart(0, latest.current.pageSize), true);
  }, [reset, fetchWindow]);

  // A new question needs new answers: the search changed, so everything loaded
  // is about the previous one.
  React.useEffect(() => {
    if (!props.isActive) return;
    reset();
    const id = setTimeout(() => {
      range.current = { minIndex: 0, maxIndex: props.pageSize - 1 };
      void fetchWindow(0, true);
    }, VIRTUAL_SCROLL_FETCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [props.search, props.isActive, props.pageSize, reset, fetchWindow]);

  React.useEffect(
    () => () => {
      if (debounce.current) clearTimeout(debounce.current);
    },
    [],
  );

  return { loading, loadingWindow, optionsWindows, totalCount, loadError, handleVisibleRange, scheduleFetch, openPanelFetch };
}
