import { type ColumnDef, type ExpandedState, type Row, type PaginationState, type RowSelectionState, type SortingState } from "@tanstack/solid-table";
export interface TreeTableProps<TData, TValue = unknown> {
    data: TData[];
    columns: ColumnDef<TData, TValue>[];
    /**
     * Where a row's children live. Defaults to `row.children`.
     * Return `undefined` (not `[]`) for a leaf — an empty array still reads as
     * "expandable, but empty" and renders a chevron that does nothing.
     */
    getSubRows?: (row: TData) => TData[] | undefined;
    getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;
    /**
     * Which rows can be opened before their children exist. Without this a row
     * with no children yet is indistinguishable from a leaf, so it gets no
     * chevron and can never be opened to trigger the load.
     */
    hasChildren?: (row: TData) => boolean;
    /**
     * Fetch a row's children on its first expand. Requires `getRowId` (or an
     * `id` on the row): the result is cached against that id, and an index-path
     * key would move the moment anything above it is sorted or filtered.
     */
    loadChildren?: (row: TData) => Promise<TData[]>;
    /** Called when `loadChildren` rejects. Without it the error is re-thrown. */
    onLoadChildrenError?: (error: unknown, row: TData) => void;
    expanded?: ExpandedState;
    /** `true` expands everything on first render. */
    defaultExpanded?: ExpandedState;
    onExpandedChange?: (state: ExpandedState) => void;
    /** Show the expand-all / collapse-all control. Default true. */
    enableExpandAll?: boolean;
    enableSorting?: boolean;
    sorting?: SortingState;
    onSortingChange?: (state: SortingState) => void;
    /**
     * Page the top-level rows. A page carries each root's WHOLE subtree, so
     * `pageSize` counts roots rather than rendered rows and a page's row count
     * varies with what is open. Paging the flattened list instead would cut
     * through a subtree and strand its children on the next page.
     */
    enablePagination?: boolean;
    /** Root rows per page. Default 10. */
    pageSize?: number;
    pageSizeOptions?: number[];
    onPaginationChange?: (state: PaginationState) => void;
    enableGlobalFilter?: boolean;
    globalFilter?: string;
    onGlobalFilterChange?: (value: string) => void;
    globalFilterPlaceholder?: string;
    enableRowSelection?: boolean;
    /** Selecting a parent selects its descendants. Default true. */
    enableSubRowSelection?: boolean;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: (state: RowSelectionState) => void;
    /** Which column carries the chevron. Defaults to the first visible column. */
    hierarchyColumnId?: string;
    /** Pixels of indent per level. Default 20. */
    indent?: number;
    /**
     * Render only the rows near the viewport. Requires `maxBodyHeight` — the
     * window needs a bounded scroller to be a window of anything.
     */
    enableVirtualization?: boolean;
    /** Row height estimate used before a row is measured. Default 44. */
    rowEstimatedHeight?: number;
    stickyHeader?: boolean;
    headerVariant?: "plain" | "underline" | "branded";
    maxBodyHeight?: number;
    rowClassName?: (row: Row<TData>) => string | undefined;
    onRowClick?: (row: Row<TData>) => void;
    emptyMessage?: string;
    loading?: boolean;
    class?: string;
}
export declare function TreeTable<TData, TValue = unknown>(props: TreeTableProps<TData, TValue>): import("solid-js").JSX.Element;
//# sourceMappingURL=tree-table.d.ts.map