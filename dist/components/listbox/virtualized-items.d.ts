import { type JSX } from "solid-js";
/**
 * VirtualizedItems — drop-in scrolling viewport that renders only the
 * visible window of a long item list. Use inside Popover / Dropdown /
 * Select content surfaces where the full list would blow up the DOM.
 *
 *   <VirtualizedItems items={hugeList} estimateSize={36}>
 *     {({ item }) => <div>{item.label}</div>}
 *   </VirtualizedItems>
 *
 * Two modes:
 *   items={[…]}                   everything is in memory
 *   totalCount={n} getItem={fn}   a server-paged list; getItem returns undefined
 *                                 for rows not yet loaded, and onVisibleRange
 *                                 says what to fetch
 *
 * For "search across 50,000 options" use <Combobox> instead — it filters
 * before rendering.
 *
 * Mirrors the React binding.
 */
interface VirtualizedItemsCommon {
    /** Estimated height of a row, in px. Defaults to 36. */
    estimateSize?: number | ((index: number) => number);
    /** Max height of the scrolling viewport in px. Defaults to 280. */
    maxHeight?: number;
    /** Number of rows to render above / below the viewport. */
    overscan?: number;
    class?: string;
}
/** Every item is in memory. */
export interface VirtualizedItemsDenseProps<T> extends VirtualizedItemsCommon {
    items: T[];
    children: (args: {
        item: T;
        index: number;
    }) => JSX.Element;
    /** Optional key extractor; defaults to index. */
    getKey?: (item: T, index: number) => string | number;
}
/**
 * The list is longer than what is loaded.
 *
 * This is the mode a server-paged list needs, and its absence is why the pivot
 * grew a second virtualizer of its own — you cannot hand a materialized array to
 * something with 40,000 values behind an API.
 */
export interface VirtualizedItemsSparseProps<T> extends VirtualizedItemsCommon {
    totalCount: number;
    getItem: (index: number) => T | undefined;
    /** Fires when the visible window changes. Fetch here. */
    onVisibleRange?: (minIndex: number, maxIndex: number) => void;
    /** `item` is undefined where the page has not loaded — render a skeleton. */
    children: (args: {
        item: T | undefined;
        index: number;
    }) => JSX.Element;
}
export type VirtualizedItemsProps<T> = VirtualizedItemsDenseProps<T> | VirtualizedItemsSparseProps<T>;
export declare function VirtualizedItems<T>(props: VirtualizedItemsDenseProps<T>): JSX.Element;
export declare function VirtualizedItems<T>(props: VirtualizedItemsSparseProps<T>): JSX.Element;
export {};
//# sourceMappingURL=virtualized-items.d.ts.map