import * as React from "react";
import { type ColumnDef, type ColumnFiltersState, type ColumnPinningState, type ExpandedState, type GroupingState, type Row, type RowSelectionState, type SortingState, type Table as TanStackTable, type VisibilityState } from "@tanstack/react-table";
import { type CellEditPayload } from "./edit-cell";
/**
 * DataTable — headless via @tanstack/react-table, optionally virtualized
 * via @tanstack/react-virtual, styled with the rest of the new primitives.
 *
 * Every capability is opt-in:
 *
 *   <DataTable
 *     data={rows}
 *     columns={cols}
 *     enableSorting
 *     enablePagination
 *     enableColumnFilters
 *     enableRowSelection
 *     enableColumnVisibility
 *     enableVirtualization        // when ≥ 200 rows
 *     pageSize={20}
 *     globalFilterPlaceholder="Search…"
 *     emptyMessage="No matching rows"
 *     loading={isLoading}
 *     manualPagination={{
 *       pageIndex,
 *       pageCount,
 *       onPageChange: setPageIndex,    // server-driven cursor
 *     }}
 *   />
 *
 * Notes:
 *   - When `manualPagination` is supplied, client-side pagination is
 *     bypassed and the consumer drives the page state externally.
 *   - When `enableVirtualization` is true, the table body becomes a
 *     scrolling viewport with a fixed `maxBodyHeight` (default 480 px).
 *     Pagination and virtualization can be combined, but typically one
 *     or the other is used.
 *   - Sorting / filtering / selection / column visibility states are
 *     uncontrolled by default; pass the corresponding `state` +
 *     `onXChange` props to control them.
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
    /**
     * Allow chaining multiple sort columns via Shift-click on headers.
     * Implies `enableSorting`. TanStack reads the Shift modifier from
     * the native click event automatically.
     */
    enableMultiSort?: boolean;
    enablePagination?: boolean;
    enableColumnFilters?: boolean;
    enableRowSelection?: boolean;
    enableColumnVisibility?: boolean;
    enableVirtualization?: boolean;
    /** Drag column headers sideways to reorder. Persists nothing — caller can lift onColumnOrderChange. */
    enableColumnOrdering?: boolean;
    onColumnOrderChange?: (order: string[]) => void;
    /** Drag column dividers to resize. */
    enableColumnResizing?: boolean;
    /** Render a per-column filter row under the header. Inputs are <Input>s by default. */
    enablePerColumnFilters?: boolean;
    /**
     * Render the operator select beside each per-column filter input. Default
     * true. Turn it off when the server owns the predicate — an operator the
     * backend ignores is a control that lies about what it does.
     */
    enableFilterOperators?: boolean;
    /** Show an "Export" button in the toolbar with CSV / JSON options. */
    enableExport?: boolean;
    /** Filename (without extension) for exports. Default "data-table". */
    exportFilename?: string;
    /** When true, export only selected rows (requires enableRowSelection). */
    exportOnlySelected?: boolean;
    /** Vertical 1-px dividers between columns (per Zen theme table spec, opt-in). */
    enableColumnSeparators?: boolean;
    /**
     * Drag-to-reorder rows. Adds a leading grip-handle column; on drop
     * fires `onRowOrderChange(newIdsInOrder)`. Caller owns the source
     * `data` array and is responsible for reordering it.
     *
     * For stable drag identity, the consumer should pass `getRowId` via
     * a column / table option so each row has a permanent key (otherwise
     * TanStack uses row index, which changes after a reorder).
     *
     * Forcibly disabled when `enableVirtualization` is on — the grip
     * column is hidden and `onRowOrderChange` will never fire. A dev-mode
     * `console.warn` flags the misconfig.
     */
    enableRowOrdering?: boolean;
    onRowOrderChange?: (orderedIds: string[]) => void;
    /**
     * Expandable rows. Pass a render function and DataTable prepends a
     * chevron toggle column; when a row is expanded, the function renders
     * a full-width detail panel directly beneath the row.
     *
     *   <DataTable
     *     data={orders}
     *     columns={cols}
     *     renderSubRow={(row) => (
     *       <div className="px-6 py-3">
     *         <OrderDetails id={row.original.id} />
     *       </div>
     *     )}
     *   />
     *
     * The caller controls rendering of the expanded content; DataTable
     * just manages the expand toggle + the row-below slot. Expansion
     * state can be controlled via `expanded` + `onExpandedChange` if you
     * need to drive it externally (e.g. expand-all from a button).
     *
     * Forcibly disabled when `enableVirtualization` is on — the expand
     * toggle column is hidden and sub-rows won't render. A dev-mode
     * `console.warn` flags the misconfig. Sub-rows have variable height
     * which the fixed-size virtualizer doesn't model.
     */
    renderSubRow?: (row: Row<TData>) => React.ReactNode;
    expanded?: ExpandedState;
    onExpandedChange?: (state: ExpandedState) => void;
    /**
     * Row grouping. Set `enableGrouping` and pass one or more column ids
     * via `grouping` / `initialGrouping`. Rows that share the same value
     * in a grouped column are nested under a group-header row showing
     * "▶ <value> (N)"; clicking the toggle expands/collapses the group.
     *
     *   <DataTable
     *     enableGrouping
     *     initialGrouping={["role"]}
     *     columns={[
     *       { accessorKey: "role",   header: "Role" },
     *       { accessorKey: "salary", header: "Salary",
     *         aggregationFn: "sum",
     *         aggregatedCell: (info) => `Σ ${info.getValue<number>().toLocaleString()}` },
     *       ...
     *     ]}
     *   />
     *
     * Per-column control:
     *   - `enableGrouping: false` on a column def excludes it from the
     *     GroupBy menu (the user can't group by it).
     *   - `aggregationFn` + `aggregatedCell` produce the value rendered
     *     in each non-grouped column on the group-header row.
     *
     * Grouping forces expansion on under the hood, so renderSubRow and
     * row grouping are mutually exclusive in the same table.
     *
     * **Forcibly disabled when `enableVirtualization` is on.** Mixing
     * grouping with the fixed-size virtualizer would render group-header
     * rows as plain data rows and mis-display aggregated values as
     * scalars (data-integrity risk), so DataTable hard-gates the combo
     * and emits a dev-mode `console.error`. Disable virt to use grouping.
     */
    enableGrouping?: boolean;
    grouping?: GroupingState;
    initialGrouping?: GroupingState;
    onGroupingChange?: (state: GroupingState) => void;
    /**
     * Per-row className hook. Called for each rendered body row; the
     * returned string is merged into the row's className (after the
     * built-in classes that handle hover / selected / borders). Useful
     * for status-based row tinting:
     *
     *   <DataTable
     *     rowClassName={(row) =>
     *       row.original.status === "suspended" ? "bg-zen-error-soft/50" : ""
     *     }
     *   />
     *
     * Works in regular, row-reorder, and virtualized render paths.
     */
    rowClassName?: (row: Row<TData>) => string | undefined;
    /**
     * Persist user-tweaked column state to localStorage under
     * `zen-dt:${persistKey}`. The persisted snapshot covers `columnOrder`,
     * `columnSizing`, `columnVisibility`, and `columnPinning` — anything
     * the user can manipulate via drag / resize / Columns menu. Filters,
     * sorting, selection, and pagination are deliberately left out (too
     * volatile, usually app-state not user-state).
     *
     *   <DataTable persistKey="people-table" … />
     *
     * The hydrated snapshot only applies to uncontrolled state — if you
     * also pass `columnPinning` (etc.) as a controlled prop, that wins.
     * No-op when omitted; localStorage failures (quota, private mode)
     * are swallowed.
     */
    persistKey?: string;
    /**
     * Stable row-id resolver. Defaults to the row's array index, which is
     * fine for static lists but breaks identity-tracking features the
     * moment rows reorder or get inserted: row selection by id, row
     * reorder drag-and-drop, and inline cell editing (the editingCell
     * pointer stops matching after a commit re-renders the row).
     *
     *   <DataTable data={users} getRowId={(u) => u.id} … />
     *
     * Mirrors TanStack's getRowId option signature.
     */
    getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;
    /**
     * Render a contextual toolbar when one or more rows are selected. The
     * caller decides what actions go inside (Delete, Export, Approve, …);
     * DataTable supplies the surrounding chrome — selected count, a
     * "Clear selection" button, and a "Select all N matching" affordance
     * when only the current page is checked but more rows match the
     * current filter.
     *
     *   <DataTable
     *     enableRowSelection
     *     renderBulkActions={({ rows, clear }) => (
     *       <>
     *         <Button onClick={() => mutate(rows)}>Delete</Button>
     *         <Button variant="outline" onClick={clear}>Cancel</Button>
     *       </>
     *     )}
     *   />
     *
     * Receives the table, the selected `Row<TData>[]`, and a `clear()`
     * helper that resets selection.
     */
    renderBulkActions?: (ctx: {
        table: TanStackTable<TData>;
        rows: Row<TData>[];
        clear: () => void;
    }) => React.ReactNode;
    /**
     * Inline cell editing. Declare `meta.editable: true` (or a
     * `(row) => boolean`) on any column to opt that column in. Double-click
     * (or Enter when focused) swaps the cell content for the matching input
     * — text by default, or `meta.editVariant: "number" | "select"`. Enter
     * commits, Esc cancels, blur commits.
     *
     *   <DataTable
     *     data={rows}
     *     columns={cols}
     *     onCellEdit={({ rowId, columnId, value }) =>
     *       setRows(prev => prev.map(r =>
     *         r.id === rowId ? { ...r, [columnId]: value } : r))}
     *   />
     *
     * Pass `getRowId` on the table options (via column meta or a wrapper)
     * so rowId is stable across re-renders.
     */
    onCellEdit?: (payload: CellEditPayload) => void;
    /**
     * Pin the header row to the top of a scroll viewport. In virtualized mode
     * the header is already sticky and this prop is ignored. In non-virtualized
     * mode the body is wrapped in a `maxBodyHeight` scroll container so the
     * header has something to stick against.
     */
    stickyHeader?: boolean;
    /**
     * Freeze columns to the left or right edge while the body scrolls
     * horizontally. Pinned cells get a 1-px divider and a soft shadow on
     * their inner edge so they read as floating.
     *
     *   <DataTable
     *     enableColumnPinning
     *     initialColumnPinning={{ left: ["name"], right: ["actions"] }}
     *   />
     *
     * Pass `columnPinning` + `onColumnPinningChange` for controlled mode.
     * Works in both regular and virtualized modes; in virtualized mode the
     * pinned columns should have explicit `size` on their column def so
     * the horizontal-scroll offsets are stable.
     */
    enableColumnPinning?: boolean;
    columnPinning?: ColumnPinningState;
    initialColumnPinning?: ColumnPinningState;
    onColumnPinningChange?: (state: ColumnPinningState) => void;
    /**
     * Brand intensity of the column-header row.
     *
     *   - "plain"     (default) — neutral grey chrome, brand color shows up
     *                  only on selected rows / filter chips / focus rings.
     *                  Best when the table coexists with other UI on a page.
     *   - "underline" — adds a 2-px primary underline under the header row.
     *                   Light touch; still reads as a data table, not a hero.
     *   - "branded"   — header band filled with primary-soft + dark-primary
     *                   label text. For tables that are the focal point of a
     *                   page (dashboards, single-resource lists).
     */
    headerVariant?: "plain" | "underline" | "branded";
    pageSize?: number;
    pageSizeOptions?: number[];
    maxBodyHeight?: number;
    rowEstimatedHeight?: number;
    globalFilterPlaceholder?: string;
    emptyMessage?: string;
    loading?: boolean;
    className?: string;
    manualPagination?: DataTableManualPagination;
    /**
     * Skip the client-side sort row model. The data array is taken as
     * already-sorted by the caller; sort header clicks fire
     * `onSortingChange` (or update the controlled `sorting` state) so the
     * consumer can re-fetch with the new order.
     */
    manualSorting?: boolean;
    /**
     * Skip the client-side filter row model. The data array is taken as
     * already-filtered. Filter inputs still drive `onColumnFiltersChange`
     * / `onGlobalFilterChange` so the consumer can re-fetch with the new
     * predicate.
     */
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
export declare function DataTable<TData, TValue = unknown>({ data, columns, enableSorting, enableMultiSort, enablePagination, enableColumnFilters, enableRowSelection, enableColumnVisibility, enableVirtualization, enableColumnSeparators, enableRowOrdering, onRowOrderChange, getRowId, persistKey, rowClassName, renderBulkActions, renderSubRow, expanded: expandedProp, onExpandedChange, enableGrouping, grouping: groupingProp, initialGrouping, onGroupingChange, enableColumnOrdering, onColumnOrderChange, enableColumnResizing, enablePerColumnFilters, enableFilterOperators, enableExport, exportFilename, exportOnlySelected, stickyHeader, enableColumnPinning, columnPinning: columnPinningProp, initialColumnPinning, onColumnPinningChange, onCellEdit, headerVariant, pageSize, pageSizeOptions, maxBodyHeight, rowEstimatedHeight, globalFilterPlaceholder, emptyMessage, loading, className, manualPagination, manualSorting, manualFiltering, sorting: sortingProp, onSortingChange, columnFilters: columnFiltersProp, onColumnFiltersChange, rowSelection: rowSelectionProp, onRowSelectionChange, columnVisibility: columnVisibilityProp, onColumnVisibilityChange, globalFilter: globalFilterProp, onGlobalFilterChange, }: DataTableProps<TData, TValue>): React.JSX.Element;
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./table";
//# sourceMappingURL=data-table.d.ts.map