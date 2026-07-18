import { createSignal, onCleanup } from "solid-js";
import {
  pivotFilterMissingWindowStarts,
  pivotFilterWindowCoversRange,
  prunePivotFilterWindows,
  type PivotFilterOptionsWindow,
} from "@algorisys/zen-ui-core/virtual-window";
import { VIRTUAL_SCROLL_FETCH_DEBOUNCE_MS } from "@algorisys/zen-ui-core/virtual-window";
import { pickNearestWindowStart } from "@algorisys/zen-ui-core/virtual-window";

const DEFAULT_SEARCH_DEBOUNCE_MS = 300;

export type WindowedOptionPage = {
  values: string[];
  hasMore: boolean;
  total: number;
};

export type UseWindowedOptionPagesProps = {
  pageSize: number;
  /** When false, visible-range flushes are skipped (e.g. closed dropdown). */
  isActive?: () => boolean;
  getSearch: () => string;
  loadPage: (
    offset: number,
    limit: number,
    search: string,
  ) => Promise<WindowedOptionPage>;
  // searchDebounceMs / resolveTotal / onError are gone. All three were
  // optional, defaulted, and passed by nobody — generalisation for a second
  // caller that does not exist. resolveTotal's doc even described it ("default
  // matches column-filter behavior"), which is how imported abstraction reads
  // once the thing it was imported for never arrives. The errors that onError
  // was for are surfaced through `loadError` instead, which the UI actually
  // reads.
};

/**
 * Sliding-window fetch controller for virtual option lists (column filters,
 * pivot filter members, and similar).
 */
export function useWindowedOptionPages(props: UseWindowedOptionPagesProps) {
  const [loading, setLoading] = createSignal(false);
  const [loadingWindow, setLoadingWindow] = createSignal(false);
  const [optionsWindows, setOptionsWindows] = createSignal<
    PivotFilterOptionsWindow[]
  >([]);
  const [totalCount, setTotalCount] = createSignal(0);
  const [loadError, setLoadError] = createSignal<string | null>(null);

  let searchDebounce: ReturnType<typeof setTimeout> | undefined;
  let visibleRangeDebounce: ReturnType<typeof setTimeout> | undefined;
  let lastVisibleRange: { min: number; max: number } | null = null;
  let fetchSequence = 0;
  const inFlightWindowStarts = new Set<number>();

  const isActive = () => props.isActive?.() ?? true;


  function resetListState() {
    setOptionsWindows([]);
    setTotalCount(0);
    setLoadError(null);
    inFlightWindowStarts.clear();
    lastVisibleRange = null;
  }

  function maybePruneWindows(minIndex: number, maxIndex: number) {
    setOptionsWindows((current) => {
      const pruned = prunePivotFilterWindows(
        current,
        minIndex,
        maxIndex,
        props.pageSize,
      );
      if (
        pruned.length === current.length &&
        pruned.every(
          (window, index) => window.startIndex === current[index]?.startIndex,
        )
      ) {
        return current;
      }
      return pruned;
    });
  }

  function scheduleVisibleRangeFlush() {
    if (visibleRangeDebounce) {
      clearTimeout(visibleRangeDebounce);
    }
    visibleRangeDebounce = setTimeout(() => {
      visibleRangeDebounce = undefined;
      flushVisibleRange();
    }, VIRTUAL_SCROLL_FETCH_DEBOUNCE_MS);
  }

  function defaultResolveTotal(args: {
    startIndex: number;
    page: WindowedOptionPage;
    previousTotal: number;
  }): number {
    const { startIndex, page, previousTotal } = args;
    const reportedTotal = page.total ?? page.values.length;
    if (page.values.length === 0 && startIndex > 0) {
      return Math.min(reportedTotal > 0 ? reportedTotal : previousTotal, startIndex);
    }
    if (startIndex === 0 || reportedTotal > 0) {
      return reportedTotal;
    }
    return previousTotal;
  }

  async function fetchWindow(startIndex: number, initial = false) {
    const sequence = ++fetchSequence;
    inFlightWindowStarts.add(startIndex);
    if (initial) {
      setLoading(true);
      setLoadError(null);
    } else {
      setLoadingWindow(true);
    }
    try {
      const search = props.getSearch();
      const page = await props.loadPage(startIndex, props.pageSize, search);
      if (sequence !== fetchSequence) {
        return;
      }
      setOptionsWindows((current) => {
        const next = current.filter(
          (window) => window.startIndex !== startIndex,
        );
        return [...next, { startIndex, values: page.values }];
      });
      const resolve = defaultResolveTotal;
      setTotalCount((previousTotal) =>
        resolve({ startIndex, page, previousTotal }),
      );
      if (lastVisibleRange) {
        maybePruneWindows(lastVisibleRange.min, lastVisibleRange.max);
      }
    } catch (caught) {
      if (sequence !== fetchSequence) {
        return;
      }
      if (initial) {
        resetListState();
        const message =
          caught instanceof Error
            ? caught.message
            : "Failed to load options.";
        setLoadError(message);
      }
    } finally {
      inFlightWindowStarts.delete(startIndex);
      const isCurrent = sequence === fetchSequence;
      const noMoreInFlight = inFlightWindowStarts.size === 0;
      if (isCurrent || noMoreInFlight) {
        if (initial && isCurrent) {
          setLoading(false);
        }
        if (noMoreInFlight) {
          setLoadingWindow(false);
          scheduleVisibleRangeFlush();
        }
      }
    }
  }

  function scheduleFetch(search: string) {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    searchDebounce = setTimeout(() => {
      searchDebounce = undefined;
      resetListState();
      void fetchWindow(0, true);
    }, DEFAULT_SEARCH_DEBOUNCE_MS);
    void search;
  }

  function openPanelFetch() {
    resetListState();
    void fetchWindow(0, true);
  }

  function flushVisibleRange() {
    const range = lastVisibleRange;
    if (
      !range ||
      !isActive() ||
      loading() ||
      loadError() ||
      inFlightWindowStarts.size > 0
    ) {
      if (inFlightWindowStarts.size === 0) {
        setLoadingWindow(false);
      }
      return;
    }
    const missingStarts = pivotFilterMissingWindowStarts(
      optionsWindows(),
      range.min,
      range.max,
      props.pageSize,
    );
    if (missingStarts.length === 0) {
      maybePruneWindows(range.min, range.max);
      if (inFlightWindowStarts.size === 0) {
        setLoadingWindow(false);
      }
      return;
    }
    const desiredStart = pickNearestWindowStart(
      missingStarts,
      Math.floor((range.min + range.max) / 2),
      props.pageSize,
    );
    if (inFlightWindowStarts.has(desiredStart)) {
      return;
    }
    void fetchWindow(desiredStart);
  }

  function handleVisibleRange(minIndex: number, maxIndex: number) {
    const unchanged =
      lastVisibleRange &&
      lastVisibleRange.min === minIndex &&
      lastVisibleRange.max === maxIndex;
    lastVisibleRange = { min: minIndex, max: maxIndex };
    if (unchanged) {
      return;
    }
    if (
      !loading() &&
      !loadError() &&
      !pivotFilterWindowCoversRange(
        optionsWindows(),
        minIndex,
        maxIndex,
        props.pageSize,
      )
    ) {
      setLoadingWindow(true);
    }
    scheduleVisibleRangeFlush();
  }

  onCleanup(() => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    if (visibleRangeDebounce) {
      clearTimeout(visibleRangeDebounce);
    }
  });

  return {
    loading,
    loadingWindow,
    optionsWindows,
    totalCount,
    loadError,
    handleVisibleRange,
    scheduleFetch,
    openPanelFetch,
    resetListState,
    reload: openPanelFetch,
  };
}
