import { VIRTUAL_SCROLL_WINDOW_PAGE_SIZE } from "@algorisys/zen-ui-core/virtual-window";
import { useWindowedOptionPages } from "./use-windowed-option-pages";
import type { PivotFilterOptionsBody } from "@algorisys/zen-ui-core/pivot";

export interface UsePivotFilterOptionsProps {
  columnKey: string;
  isOpen: () => boolean;
  getOptionSearch: () => string;
  loadOptions?: (
    columnKey: string,
    optionSearch: string,
    pagination?: { offset: number; limit: number },
  ) => Promise<PivotFilterOptionsBody>;
}

/** Fetches and window-tracks pivot filter dropdown option pages. */
export function usePivotFilterOptions(props: UsePivotFilterOptionsProps) {
  const pages = useWindowedOptionPages({
    pageSize: VIRTUAL_SCROLL_WINDOW_PAGE_SIZE,
    // Wrapped, not passed. `isActive: props.isOpen` reads the prop ONCE and
    // captures whatever function was there at setup; if the parent ever passes
    // a different one, the hook keeps calling the old. Forwarding through an
    // arrow reads props each call, which is what a props object is for.
    isActive: () => props.isOpen(),
    getSearch: () => props.getOptionSearch(),
    loadPage: async (offset, limit, search) => {
      if (!props.loadOptions) {
        return { values: [], hasMore: false, total: 0 };
      }
      const result = await props.loadOptions(props.columnKey, search, {
        offset,
        limit,
      });
      return {
        values: result.values,
        hasMore: result.hasMore,
        total: result.total ?? result.values.length,
      };
    },
  });

  return {
    loading: pages.loading,
    loadingWindow: pages.loadingWindow,
    optionsWindows: pages.optionsWindows,
    totalCount: pages.totalCount,
    // loadError was computed, set on failure, used to gate fetching — and then
    // dropped right here, so a filter fetch that threw rendered "No matching
    // values". A network error and an empty result are not the same answer, and
    // reporting one as the other sends people looking for missing data.
    loadError: pages.loadError,
    handleVisibleRange: pages.handleVisibleRange,
    scheduleFetch: (optionSearch: string) => pages.scheduleFetch(optionSearch),
    // Takes nothing: openPanelFetch re-reads the search through getSearch(), so
    // the parameter the caller used to pass was thrown away on arrival.
    openPanelFetch: () => pages.openPanelFetch(),
  };
}
