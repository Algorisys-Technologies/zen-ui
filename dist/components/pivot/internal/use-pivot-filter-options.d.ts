import type { PivotFilterOptionsBody } from "@algorisys/zen-ui-core/pivot";
export interface UsePivotFilterOptionsProps {
    columnKey: string;
    isOpen: () => boolean;
    getOptionSearch: () => string;
    loadOptions?: (columnKey: string, optionSearch: string, pagination?: {
        offset: number;
        limit: number;
    }) => Promise<PivotFilterOptionsBody>;
}
/** Fetches and window-tracks pivot filter dropdown option pages. */
export declare function usePivotFilterOptions(props: UsePivotFilterOptionsProps): {
    loading: import("solid-js").Accessor<boolean>;
    loadingWindow: import("solid-js").Accessor<boolean>;
    optionsWindows: import("solid-js").Accessor<import("@algorisys/zen-ui-core").PivotFilterOptionsWindow[]>;
    totalCount: import("solid-js").Accessor<number>;
    loadError: import("solid-js").Accessor<string | null>;
    handleVisibleRange: (minIndex: number, maxIndex: number) => void;
    scheduleFetch: (optionSearch: string) => void;
    openPanelFetch: () => void;
};
//# sourceMappingURL=use-pivot-filter-options.d.ts.map