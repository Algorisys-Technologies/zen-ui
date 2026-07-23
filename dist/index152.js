import { VIRTUAL_SCROLL_WINDOW_PAGE_SIZE as l } from "./index155.js";
import { useWindowedOptionPages as s } from "./index193.js";
function u(o) {
  const e = s({
    pageSize: l,
    // Wrapped, not passed. `isActive: props.isOpen` reads the prop ONCE and
    // captures whatever function was there at setup; if the parent ever passes
    // a different one, the hook keeps calling the old. Forwarding through an
    // arrow reads props each call, which is what a props object is for.
    isActive: () => o.isOpen(),
    getSearch: () => o.getOptionSearch(),
    loadPage: async (a, n, i) => {
      if (!o.loadOptions)
        return { values: [], hasMore: !1, total: 0 };
      const t = await o.loadOptions(o.columnKey, i, {
        offset: a,
        limit: n
      });
      return {
        values: t.values,
        hasMore: t.hasMore,
        total: t.total ?? t.values.length
      };
    }
  });
  return {
    loading: e.loading,
    loadingWindow: e.loadingWindow,
    optionsWindows: e.optionsWindows,
    totalCount: e.totalCount,
    // loadError was computed, set on failure, used to gate fetching — and then
    // dropped right here, so a filter fetch that threw rendered "No matching
    // values". A network error and an empty result are not the same answer, and
    // reporting one as the other sends people looking for missing data.
    loadError: e.loadError,
    handleVisibleRange: e.handleVisibleRange,
    scheduleFetch: (a) => e.scheduleFetch(a),
    // Takes nothing: openPanelFetch re-reads the search through getSearch(), so
    // the parameter the caller used to pass was thrown away on arrival.
    openPanelFetch: () => e.openPanelFetch()
  };
}
export {
  u as usePivotFilterOptions
};
//# sourceMappingURL=index152.js.map
