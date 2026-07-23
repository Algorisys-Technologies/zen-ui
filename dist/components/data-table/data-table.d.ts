import { type JSX } from "solid-js";
import { type ColumnDef, type ColumnFiltersState, type ColumnPinningState, type ExpandedState, type GroupingState, type Row, type RowSelectionState, type SortingState, type Table as TanStackTable, type VisibilityState } from "@tanstack/solid-table";
import { type CellEditPayload } from "./edit-cell";
/**
 * DataTable — Solid port at full feature parity with the React binding.
 * Headless via @tanstack/solid-table, optionally virtualized via
 * @tanstack/solid-virtual, column / row reordering via
 * @thisbeyond/solid-dnd.
 *
 * Every capability is opt-in via a flag. See the React binding's
 * data-table.tsx jsdoc for the full feature matrix.
 */
export interface DataTableManualPagination {
    pageIndex: number;
    pageCount: number;
    pageSize?: number;
    onPageChange: (next: number) => void;
}
export interface DataTableProps<TData, TValue = unknown> {
    data: TData[];
    columns: ColumnDef<TData, TValue>[];
    enableSorting?: boolean;
    enableMultiSort?: boolean;
    enablePagination?: boolean;
    enableColumnFilters?: boolean;
    enableRowSelection?: boolean;
    enableColumnVisibility?: boolean;
    enableVirtualization?: boolean;
    enableColumnOrdering?: boolean;
    onColumnOrderChange?: (order: string[]) => void;
    enableColumnResizing?: boolean;
    enablePerColumnFilters?: boolean;
    enableExport?: boolean;
    exportFilename?: string;
    exportOnlySelected?: boolean;
    enableColumnSeparators?: boolean;
    enableRowOrdering?: boolean;
    onRowOrderChange?: (orderedIds: string[]) => void;
    renderSubRow?: (row: Row<TData>) => JSX.Element;
    expanded?: ExpandedState;
    onExpandedChange?: (state: ExpandedState) => void;
    enableGrouping?: boolean;
    grouping?: GroupingState;
    initialGrouping?: GroupingState;
    onGroupingChange?: (state: GroupingState) => void;
    rowClassName?: (row: Row<TData>) => string | undefined;
    persistKey?: string;
    getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;
    renderBulkActions?: (ctx: {
        table: TanStackTable<TData>;
        rows: Row<TData>[];
        clear: () => void;
    }) => JSX.Element;
    onCellEdit?: (payload: CellEditPayload) => void;
    stickyHeader?: boolean;
    enableColumnPinning?: boolean;
    columnPinning?: ColumnPinningState;
    initialColumnPinning?: ColumnPinningState;
    onColumnPinningChange?: (state: ColumnPinningState) => void;
    headerVariant?: "plain" | "underline" | "branded";
    pageSize?: number;
    pageSizeOptions?: number[];
    maxBodyHeight?: number;
    rowEstimatedHeight?: number;
    globalFilterPlaceholder?: string;
    emptyMessage?: string;
    loading?: boolean;
    class?: string;
    manualPagination?: DataTableManualPagination;
    manualSorting?: boolean;
    manualFiltering?: boolean;
    sorting?: SortingState;
    onSortingChange?: (state: SortingState) => void;
    columnFilters?: ColumnFiltersState;
    onColumnFiltersChange?: (state: ColumnFiltersState) => void;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: (state: RowSelectionState) => void;
    columnVisibility?: VisibilityState;
    onColumnVisibilityChange?: (state: VisibilityState) => void;
    globalFilter?: string;
    onGlobalFilterChange?: (value: string) => void;
}
export declare function DataTable<TData, TValue = unknown>(rawProps: DataTableProps<TData, TValue>): JSX.Element;
//# sourceMappingURL=data-table.d.ts.map