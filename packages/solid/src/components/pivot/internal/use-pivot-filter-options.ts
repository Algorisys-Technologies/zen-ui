import { VIRTUAL_SCROLL_WINDOW_PAGE_SIZE } from "./virtual-scroll";
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
    isActive: props.isOpen,
    getSearch: props.getOptionSearch,
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
    handleVisibleRange: pages.handleVisibleRange,
    scheduleFetch: (optionSearch: string) => pages.scheduleFetch(optionSearch),
    openPanelFetch: (_optionSearch: string) => pages.openPanelFetch(),
  };
}
