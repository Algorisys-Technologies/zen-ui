import { type PivotFilterOptionsWindow } from "@algorisys/zen-ui-core/virtual-window";
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
    loadPage: (offset: number, limit: number, search: string) => Promise<WindowedOptionPage>;
};
/**
 * Sliding-window fetch controller for virtual option lists (column filters,
 * pivot filter members, and similar).
 */
export declare function useWindowedOptionPages(props: UseWindowedOptionPagesProps): {
    loading: import("solid-js").Accessor<boolean>;
    loadingWindow: import("solid-js").Accessor<boolean>;
    optionsWindows: import("solid-js").Accessor<PivotFilterOptionsWindow[]>;
    totalCount: import("solid-js").Accessor<number>;
    loadError: import("solid-js").Accessor<string | null>;
    handleVisibleRange: (minIndex: number, maxIndex: number) => void;
    scheduleFetch: (search: string) => void;
    openPanelFetch: () => void;
    resetListState: () => void;
    reload: () => void;
};
//# sourceMappingURL=use-windowed-option-pages.d.ts.map