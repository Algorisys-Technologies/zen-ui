import { type PivotFilterOptionsWindow } from "../../../_core/virtual-window";
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
    loadPage: (offset: number, limit: number, search: string) => Promise<{
        values: string[];
        hasMore: boolean;
        total: number;
    }>;
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
export declare function useWindowedOptionPages(props: UseWindowedOptionPagesProps): WindowedOptionPages;
//# sourceMappingURL=use-windowed-option-pages.d.ts.map