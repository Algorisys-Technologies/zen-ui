import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Table as TanStackTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import { Checkbox } from "../form/checkbox/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu/dropdown-menu";
import { Input } from "../form/input/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../form/select/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

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

  /* feature toggles */
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
   * Not compatible with `enableVirtualization` in this release —
   * absolute-positioned virtualized rows + dnd are non-trivial. The
   * grip column is silently disabled when both are on.
   */
  enableRowOrdering?: boolean;
  onRowOrderChange?: (orderedIds: string[]) => void;
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
   * Not supported alongside `enableVirtualization` in this release.
   */
  enableColumnPinning?: boolean;
  columnPinning?: ColumnPinningState;
  initialColumnPinning?: ColumnPinningState;
  onColumnPinningChange?: (state: ColumnPinningState) => void;

  /* layout / messages */
  pageSize?: number;
  pageSizeOptions?: number[];
  maxBodyHeight?: number;
  rowEstimatedHeight?: number;
  globalFilterPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;

  /* server-driven pagination */
  manualPagination?: DataTableManualPagination;

  /* controlled state (all optional) */
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

export function DataTable<TData, TValue = unknown>({
  data,
  columns,

  enableSorting = false,
  enableMultiSort = false,
  enablePagination = false,
  enableColumnFilters = false,
  enableRowSelection = false,
  enableColumnVisibility = false,
  enableVirtualization = false,
  enableColumnSeparators = false,
  enableRowOrdering = false,
  onRowOrderChange,
  enableColumnOrdering = false,
  onColumnOrderChange,
  enableColumnResizing = false,
  enablePerColumnFilters = false,
  enableExport = false,
  exportFilename = "data-table",
  exportOnlySelected = false,
  stickyHeader = false,
  enableColumnPinning = false,
  columnPinning: columnPinningProp,
  initialColumnPinning,
  onColumnPinningChange,

  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  maxBodyHeight = 480,
  rowEstimatedHeight = 44,
  globalFilterPlaceholder = "Search…",
  emptyMessage = "No results.",
  loading = false,
  className,

  manualPagination,

  sorting: sortingProp,
  onSortingChange,
  columnFilters: columnFiltersProp,
  onColumnFiltersChange,
  rowSelection: rowSelectionProp,
  onRowSelectionChange,
  columnVisibility: columnVisibilityProp,
  onColumnVisibilityChange,
  globalFilter: globalFilterProp,
  onGlobalFilterChange,
}: DataTableProps<TData, TValue>) {
  /* internal state — used when the corresponding prop isn't supplied */
  const [sortingInner, setSortingInner] = React.useState<SortingState>([]);
  const [filtersInner, setFiltersInner] = React.useState<ColumnFiltersState>([]);
  const [selectionInner, setSelectionInner] = React.useState<RowSelectionState>({});
  const [visibilityInner, setVisibilityInner] = React.useState<VisibilityState>({});
  const [globalFilterInner, setGlobalFilterInner] = React.useState("");
  const [paginationInner, setPaginationInner] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([]);
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});
  const [columnPinningInner, setColumnPinningInner] =
    React.useState<ColumnPinningState>(
      initialColumnPinning ?? { left: [], right: [] },
    );
  const columnPinning = columnPinningProp ?? columnPinningInner;

  const sorting = sortingProp ?? sortingInner;
  const filters = columnFiltersProp ?? filtersInner;
  const selection = rowSelectionProp ?? selectionInner;
  const visibility = columnVisibilityProp ?? visibilityInner;
  const globalFilter = globalFilterProp ?? globalFilterInner;

  /* Row ordering is incompatible with virtualization here (absolute-
   * positioned rows + dnd needs custom collision detection). Disable
   * the grip column when both are on. */
  const rowOrderingActive = enableRowOrdering && !enableVirtualization;

  /* Prepend leading columns: drag-grip (if enabled) then select-checkbox
   * (if enabled). Both are opt-in. */
  const augmentedColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    const leading: ColumnDef<TData, TValue>[] = [];

    if (rowOrderingActive) {
      leading.push({
        id: "__drag__",
        header: () => <span className="sr-only">Reorder</span>,
        cell: ({ row }) => <DragHandle id={row.id} />,
        enableSorting: false,
        enableHiding: false,
        size: 32,
      });
    }

    if (enableRowSelection) {
      leading.push({
        id: "__select__",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllRowsSelected()
                ? true
                : table.getIsSomeRowsSelected()
                ? "indeterminate"
                : false
            }
            onCheckedChange={(v) => table.toggleAllRowsSelected(v === true)}
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(v === true)}
            aria-label={`Select row ${row.index + 1}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 36,
      });
    }

    return [...leading, ...columns];
  }, [columns, enableRowSelection, rowOrderingActive]);

  const table = useReactTable({
    data,
    columns: augmentedColumns,
    state: {
      sorting,
      columnFilters: filters,
      rowSelection: selection,
      columnVisibility: visibility,
      globalFilter,
      columnOrder,
      columnSizing,
      columnPinning,
      ...(manualPagination
        ? {
            pagination: {
              pageIndex: manualPagination.pageIndex,
              pageSize: manualPagination.pageSize ?? pageSize,
            },
          }
        : enablePagination
        ? { pagination: paginationInner }
        : {}),
    },
    enableSorting,
    enableMultiSort: enableMultiSort,
    enableRowSelection,
    enableColumnFilters: enableColumnFilters || enablePerColumnFilters,
    enableColumnResizing,
    columnResizeMode: "onChange",
    enableColumnPinning,
    manualPagination: !!manualPagination,
    pageCount: manualPagination?.pageCount,
    onColumnOrderChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(columnOrder) : updater;
      setColumnOrder(next);
      onColumnOrderChange?.(next);
    },
    onColumnSizingChange: setColumnSizing,
    onColumnPinningChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(columnPinning) : updater;
      if (columnPinningProp === undefined) setColumnPinningInner(next);
      onColumnPinningChange?.(next);
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      if (sortingProp === undefined) setSortingInner(next);
      onSortingChange?.(next);
    },
    onColumnFiltersChange: (updater) => {
      const next = typeof updater === "function" ? updater(filters) : updater;
      if (columnFiltersProp === undefined) setFiltersInner(next);
      onColumnFiltersChange?.(next);
    },
    onRowSelectionChange: (updater) => {
      const next = typeof updater === "function" ? updater(selection) : updater;
      if (rowSelectionProp === undefined) setSelectionInner(next);
      onRowSelectionChange?.(next);
    },
    onColumnVisibilityChange: (updater) => {
      const next = typeof updater === "function" ? updater(visibility) : updater;
      if (columnVisibilityProp === undefined) setVisibilityInner(next);
      onColumnVisibilityChange?.(next);
    },
    onGlobalFilterChange: (next: string) => {
      if (globalFilterProp === undefined) setGlobalFilterInner(next);
      onGlobalFilterChange?.(next);
    },
    onPaginationChange: manualPagination
      ? (updater) => {
          const next =
            typeof updater === "function"
              ? updater({
                  pageIndex: manualPagination.pageIndex,
                  pageSize: manualPagination.pageSize ?? pageSize,
                })
              : updater;
          manualPagination.onPageChange(next.pageIndex);
        }
      : (updater) => {
          const next =
            typeof updater === "function" ? updater(paginationInner) : updater;
          setPaginationInner(next);
        },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel:
      enableColumnFilters || enablePerColumnFilters
        ? getFilteredRowModel()
        : undefined,
    getPaginationRowModel:
      enablePagination && !manualPagination ? getPaginationRowModel() : undefined,
  });

  const rows = table.getRowModel().rows;

  /* drag-and-drop wiring for row reordering */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const rowIds = React.useMemo(() => rows.map((r) => r.id), [rows]);
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = rowIds.indexOf(String(active.id));
    const newIndex = rowIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const newOrder = arrayMove(rowIds, oldIndex, newIndex);
    onRowOrderChange?.(newOrder);
  };

  /* Column separator: applied to every cell except the last */
  const sepCellClass = enableColumnSeparators
    ? "border-r border-zen-border last:border-r-0"
    : "";
  const sepHeadClass = enableColumnSeparators
    ? "[&>th]:border-r [&>th]:border-zen-border [&>th:last-child]:border-r-0"
    : "";

  /* Pin styling: sticky offsets + soft shadow on the inner edge of the
   * last/first pinned column so the freeze reads as a floating panel.
   * Returns `undefined` when pinning isn't on for this column. */
  const pinStyle = React.useCallback(
    (column: Column<TData, unknown>): React.CSSProperties | undefined => {
      if (!enableColumnPinning) return undefined;
      const pin = column.getIsPinned();
      if (!pin) return undefined;
      const isLastLeft = pin === "left" && column.getIsLastColumn("left");
      const isFirstRight = pin === "right" && column.getIsFirstColumn("right");
      return {
        position: "sticky",
        left: pin === "left" ? `${column.getStart("left")}px` : undefined,
        right: pin === "right" ? `${column.getAfter("right")}px` : undefined,
        background: "var(--zen-color-background)",
        // Body cells: z=1 so they sit above non-pinned cells while scrolling.
        // Sticky-header cells override to z=11 below.
        zIndex: 1,
        boxShadow: isLastLeft
          ? "inset -1px 0 0 var(--zen-color-border), 4px 0 6px -4px rgba(0,0,0,0.12)"
          : isFirstRight
          ? "inset 1px 0 0 var(--zen-color-border), -4px 0 6px -4px rgba(0,0,0,0.12)"
          : undefined,
      };
    },
    [enableColumnPinning],
  );

  /* Sticky header is meaningful only outside virtualized mode (the
   * virtualized body already pins its header). */
  const stickyHeaderActive = stickyHeader && !enableVirtualization;

  /* Effective column IDs in display order, for the horizontal SortableContext */
  const visibleColumnIds = React.useMemo(
    () => table.getVisibleLeafColumns().map((c) => c.id),
    // re-derive when column order or visibility changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, columnOrder, visibility],
  );

  const handleColumnDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = visibleColumnIds.indexOf(String(active.id));
    const newIndex = visibleColumnIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(visibleColumnIds, oldIndex, newIndex);
    setColumnOrder(next);
    onColumnOrderChange?.(next);
  };

  /* Per-row className used by every TableRow in TableHeader. When the
   * header is pinned to the top of the scroll viewport we lift it via
   * `sticky top-0 z-10`; a background is set on the row + cells so body
   * content doesn't bleed through. */
  const stickyRowClass = stickyHeaderActive
    ? "sticky top-0 z-10 bg-zen-background"
    : "";

  const headerRows = (
    <TableHeader>
      {table.getHeaderGroups().map((hg) => (
        <TableRow key={hg.id} className={cn(sepHeadClass, stickyRowClass)}>
          {hg.headers.map((header) => (
            <HeaderCell
              key={header.id}
              header={header}
              enableColumnResizing={enableColumnResizing}
              enableColumnOrdering={enableColumnOrdering}
              pinStyle={pinStyle(header.column)}
              stickyHeader={stickyHeaderActive}
            />
          ))}
        </TableRow>
      ))}
      {enablePerColumnFilters &&
        table.getHeaderGroups().map((hg) => (
          <TableRow
            key={`${hg.id}-filter`}
            className={cn(sepHeadClass, stickyRowClass)}
            style={stickyHeaderActive ? { top: "var(--zen-dt-header-h, 40px)" } : undefined}
          >
            {hg.headers.map((header) => {
              const pin = pinStyle(header.column);
              return (
                <TableHead
                  key={`${header.id}-filter`}
                  className="px-2 py-1"
                  style={
                    pin
                      ? { ...pin, zIndex: stickyHeaderActive ? 11 : 1 }
                      : stickyHeaderActive
                      ? { background: "var(--zen-color-background)" }
                      : undefined
                  }
                >
                  {header.column.getCanFilter() &&
                  !header.id.startsWith("__") ? (
                    <Input
                      value={(header.column.getFilterValue() as string) ?? ""}
                      onChange={(e) =>
                        header.column.setFilterValue(e.target.value)
                      }
                      placeholder="Filter…"
                      aria-label={`Filter ${header.column.id}`}
                      className="h-7 text-xs"
                    />
                  ) : null}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
    </TableHeader>
  );

  /* When sticky-header is active we shrink the Table's scroll wrapper to
   * `maxBodyHeight` so the <thead>'s `position: sticky; top: 0` has a
   * non-trivial scroll context to pin against. Without max-height the
   * wrapper would grow to fit and sticky would be a no-op. */
  const tableContainerStyle = stickyHeaderActive
    ? { maxHeight: maxBodyHeight }
    : undefined;

  const tableBody = (
    <Table containerStyle={tableContainerStyle}>
      {enableColumnOrdering ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleColumnDragEnd}
        >
          <SortableContext
            items={visibleColumnIds}
            strategy={horizontalListSortingStrategy}
          >
            {headerRows}
          </SortableContext>
        </DndContext>
      ) : (
        headerRows
      )}
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell
              colSpan={augmentedColumns.length}
              className="text-center text-zen-muted-fg py-6"
            >
              Loading…
            </TableCell>
          </TableRow>
        ) : rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={augmentedColumns.length}
              className="text-center text-zen-muted-fg py-6"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) =>
            rowOrderingActive ? (
              <SortableRow
                key={row.id}
                id={row.id}
                selected={row.getIsSelected()}
                cellClassName={sepCellClass}
              >
                {row.getVisibleCells().map((cell) => {
                  const pin = pinStyle(cell.column);
                  return (
                    <TableCell
                      key={cell.id}
                      className={sepCellClass}
                      style={pin}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </SortableRow>
            ) : (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
              >
                {row.getVisibleCells().map((cell) => {
                  const pin = pinStyle(cell.column);
                  return (
                    <TableCell
                      key={cell.id}
                      className={sepCellClass}
                      style={pin}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ),
          )
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className={cn("space-y-3", className)}>
      <Toolbar
        table={table}
        enableColumnFilters={enableColumnFilters}
        enableColumnVisibility={enableColumnVisibility}
        enableExport={enableExport}
        exportFilename={exportFilename}
        exportOnlySelected={exportOnlySelected}
        globalFilter={globalFilter}
        globalFilterPlaceholder={globalFilterPlaceholder}
        onGlobalFilterChange={(v) => {
          if (globalFilterProp === undefined) setGlobalFilterInner(v);
          onGlobalFilterChange?.(v);
        }}
      />

      <div className="rounded-zen-md border border-zen-border">
        {enableVirtualization ? (
          <VirtualizedBody
            table={table}
            maxHeight={maxBodyHeight}
            estimatedRowHeight={rowEstimatedHeight}
            emptyMessage={emptyMessage}
            loading={loading}
          />
        ) : rowOrderingActive ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
              {tableBody}
            </SortableContext>
          </DndContext>
        ) : (
          tableBody
        )}
      </div>

      {(enablePagination || manualPagination) && (
        <PaginationBar
          table={table}
          enableRowSelection={enableRowSelection}
          pageSizeOptions={pageSizeOptions}
          manual={!!manualPagination}
        />
      )}
    </div>
  );
}

/* ----------------------------- Toolbar ------------------------------- */
function Toolbar<TData>({
  table,
  enableColumnFilters,
  enableColumnVisibility,
  enableExport,
  exportFilename,
  exportOnlySelected,
  globalFilter,
  globalFilterPlaceholder,
  onGlobalFilterChange,
}: {
  table: TanStackTable<TData>;
  enableColumnFilters: boolean;
  enableColumnVisibility: boolean;
  enableExport: boolean;
  exportFilename: string;
  exportOnlySelected: boolean;
  globalFilter: string;
  globalFilterPlaceholder: string;
  onGlobalFilterChange: (v: string) => void;
}) {
  if (
    !enableColumnFilters &&
    !enableColumnVisibility &&
    !enableExport
  )
    return null;
  return (
    <div className="flex items-center gap-2">
      {enableColumnFilters && (
        <Input
          value={globalFilter}
          onChange={(e) => onGlobalFilterChange(e.target.value)}
          placeholder={globalFilterPlaceholder}
          className="max-w-xs"
        />
      )}
      <div className="ml-auto flex items-center gap-2">
        {enableExport && (
          <ExportMenu
            table={table}
            filename={exportFilename}
            onlySelected={exportOnlySelected}
          />
        )}
        {enableColumnVisibility && <ColumnsMenu table={table} />}
      </div>
    </div>
  );
}

/* ----------------------------- Export menu --------------------------- */
function ExportMenu<TData>({
  table,
  filename,
  onlySelected,
}: {
  table: TanStackTable<TData>;
  filename: string;
  onlySelected: boolean;
}) {
  const rowsForExport = React.useCallback(() => {
    const rows = onlySelected
      ? table.getSelectedRowModel().rows
      : table.getFilteredRowModel().rows;
    if (onlySelected && rows.length === 0) {
      // Fall back to filtered rows so "Export" never produces an empty file.
      return table.getFilteredRowModel().rows;
    }
    return rows;
  }, [table, onlySelected]);

  const visibleColumns = () =>
    table
      .getVisibleLeafColumns()
      .filter((c) => !c.id.startsWith("__")); // skip select / drag handle

  const exportJson = () => {
    const cols = visibleColumns();
    const rows = rowsForExport();
    const payload = rows.map((row) => {
      const out: Record<string, unknown> = {};
      cols.forEach((col) => {
        out[col.id] = row.getValue(col.id);
      });
      return out;
    });
    downloadBlob(
      new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
      `${filename}.json`,
    );
  };

  const exportCsv = () => {
    const cols = visibleColumns();
    const rows = rowsForExport();
    const header = cols.map((c) => csvEscape(headerLabel(c))).join(",");
    const body = rows
      .map((row) =>
        cols
          .map((col) => csvEscape(row.getValue(col.id)))
          .join(","),
      )
      .join("\n");
    downloadBlob(
      new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" }),
      `${filename}.csv`,
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" color="neutral" size="sm">
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>
          Export {onlySelected ? "selected" : "visible"} rows
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={exportCsv}>CSV (.csv)</DropdownMenuItem>
        <DropdownMenuItem onSelect={exportJson}>JSON (.json)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const headerLabel = (col: { id: string; columnDef: { header?: unknown } }) =>
  typeof col.columnDef.header === "string" ? col.columnDef.header : col.id;

const csvEscape = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

const downloadBlob = (blob: Blob, filename: string) => {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/* ----------------------------- Drag handle + sortable row ------------ */
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners, setActivatorNodeRef } = useSortable({ id });
  return (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label="Drag to reorder row"
      className={cn(
        "cursor-grab active:cursor-grabbing inline-flex items-center justify-center",
        "h-6 w-6 rounded-zen-sm bg-transparent border-0",
        "text-zen-muted-fg hover:text-zen-foreground hover:bg-zen-muted",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zen-ring",
      )}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <circle cx="9" cy="6" r="1.6" />
        <circle cx="15" cy="6" r="1.6" />
        <circle cx="9" cy="12" r="1.6" />
        <circle cx="15" cy="12" r="1.6" />
        <circle cx="9" cy="18" r="1.6" />
        <circle cx="15" cy="18" r="1.6" />
      </svg>
    </button>
  );
}

function SortableRow({
  id,
  selected,
  children,
}: {
  id: string;
  selected: boolean;
  cellClassName: string;
  children: React.ReactNode;
}) {
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <TableRow
      ref={setNodeRef}
      data-state={selected ? "selected" : undefined}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        position: isDragging ? "relative" : undefined,
        zIndex: isDragging ? 1 : undefined,
      }}
    >
      {children}
    </TableRow>
  );
}

function ColumnsMenu<TData>({ table }: { table: TanStackTable<TData> }) {
  const hideable = table
    .getAllColumns()
    .filter((c) => c.getCanHide());
  if (hideable.length === 0) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" color="neutral" size="sm">
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideable.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(v) => column.toggleVisibility(v === true)}
          >
            {(typeof column.columnDef.header === "string" && column.columnDef.header) ||
              column.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ----------------------------- Header cell --------------------------- */
/**
 * HeaderCell — Zen theme spec compliant:
 *   - default bg: transparent (inherits)
 *   - hover bg:   --zen-color-muted (Neutral/20)
 *   - active bg:  --zen-color-primary-soft (Primary/12%-equivalent), set
 *                 when the column is currently sorted
 *   - 4px gap between label and trailing icons (filter / sort arrow)
 *   - whole cell is the click target for sortable columns (a11y: a
 *     <button> wraps the label so screen readers still announce it
 *     as a sort button)
 */
function HeaderCell<TData, TValue>({
  header,
  enableColumnResizing,
  enableColumnOrdering,
  pinStyle,
  stickyHeader,
}: {
  header: import("@tanstack/react-table").Header<TData, TValue>;
  enableColumnResizing?: boolean;
  enableColumnOrdering?: boolean;
  pinStyle?: React.CSSProperties;
  stickyHeader?: boolean;
}) {
  if (header.isPlaceholder) return <TableHead />;
  const canSort = header.column.getCanSort();
  const sorted = header.column.getIsSorted();
  const sortLabel =
    sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none";
  const sortIndex =
    header.column.getSortIndex() >= 0 ? header.column.getSortIndex() + 1 : null;
  const isResizing = header.column.getIsResizing();

  /* Wrapped in <SortableHeader> when column-reorder is on so the cell
   * becomes a drag source. Otherwise renders a plain <TableHead>. */
  const innerContent = (
    <>
      {canSort ? (
        <button
          type="button"
          onClick={header.column.getToggleSortingHandler()}
          aria-label={`Sort by ${
            typeof header.column.columnDef.header === "string"
              ? header.column.columnDef.header
              : header.column.id
          }, currently ${sortLabel}`}
          className={cn(
            "w-full h-full px-2 py-2",
            "inline-flex items-center gap-1 text-left font-inherit text-inherit",
            "bg-transparent border-0 cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zen-ring focus-visible:ring-inset",
          )}
        >
          {flexRender(header.column.columnDef.header, header.getContext())}
          <SortIndicator state={sorted} />
          {sortIndex !== null ? (
            <span
              aria-hidden
              className="text-[1rem] font-semibold text-zen-muted-fg ml-0.5"
              title={`Sort priority ${sortIndex}`}
            >
              {sortIndex}
            </span>
          ) : null}
        </button>
      ) : (
        <span className="px-2 py-2 inline-flex items-center gap-1">
          {flexRender(header.column.columnDef.header, header.getContext())}
        </span>
      )}
      {enableColumnResizing && header.column.getCanResize() ? (
        <button
          type="button"
          aria-label={`Resize ${header.column.id}`}
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "absolute right-0 top-0 h-full w-1.5 cursor-col-resize select-none touch-none",
            "bg-transparent border-0 p-0",
            "hover:bg-zen-primary",
            isResizing && "bg-zen-primary",
          )}
        />
      ) : null}
    </>
  );

  /* Pinned headers need a higher z-index than pinned body cells (1) and
   * sticky non-pinned header cells (10) so the corner cell — pinned AND
   * sticky-to-top — sits on top of both. Background is required so
   * scrolled body content doesn't bleed through. */
  const headStyle: React.CSSProperties = {
    width: header.column.getSize(),
    ...(pinStyle ?? {}),
    ...(pinStyle ? { zIndex: stickyHeader ? 11 : 1 } : {}),
    ...(stickyHeader && !pinStyle
      ? { background: "var(--zen-color-background)" }
      : {}),
  };

  const head = (
    <TableHead
      data-active={sorted ? "true" : undefined}
      aria-sort={
        sorted === "asc"
          ? "ascending"
          : sorted === "desc"
          ? "descending"
          : undefined
      }
      className={cn(
        "p-0 transition-colors relative",
        canSort && "hover:bg-zen-muted",
        "data-[active=true]:bg-zen-primary-soft data-[active=true]:text-zen-primary-soft-fg",
      )}
      style={headStyle}
    >
      {innerContent}
    </TableHead>
  );

  return enableColumnOrdering ? (
    <SortableHeader id={header.column.id}>{head}</SortableHeader>
  ) : (
    head
  );
}

/* Wraps a TableHead in @dnd-kit sortable so the column header can be
 * dragged sideways. Activator (drag handle) is the whole cell to keep
 * a single, predictable interaction model. */
function SortableHeader({
  id,
  children,
}: {
  id: string;
  children: React.ReactElement<
    React.HTMLAttributes<HTMLTableCellElement> & {
      style?: React.CSSProperties;
    }
  >;
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const child = children;
  return React.cloneElement(child, {
    ref: setNodeRef,
    ...attributes,
    ...listeners,
    style: {
      ...(child.props.style ?? {}),
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.6 : 1,
      cursor: "grab",
      position: "relative" as const,
    },
  } as Partial<React.HTMLAttributes<HTMLTableCellElement>> & {
    ref?: React.Ref<HTMLTableCellElement>;
    style?: React.CSSProperties;
  });
}

const SortIndicator = ({ state }: { state: false | "asc" | "desc" }) => {
  if (state === "asc")
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <polyline points="18 15 12 9 6 15" />
      </svg>
    );
  if (state === "desc")
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    );
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-30" aria-hidden>
      <polyline points="8 9 12 5 16 9" />
      <polyline points="16 15 12 19 8 15" />
    </svg>
  );
};

/* ----------------------------- Virtualized body ---------------------- */
/**
 * Virtualized table — uses CSS Grid (not <table>) so header columns and
 * body columns share the exact same `grid-template-columns` string and
 * stay aligned regardless of content width. Falls back from <table>/<tr>
 * to div + role="..." so the browser doesn't apply table-layout rules
 * that fight with grid.
 *
 * Column widths:
 *  - if a column def specifies `size`, use `${size}px`
 *  - otherwise `minmax(0, 1fr)` — share remaining width equally
 *  - TanStack's internal default is 150; we treat 150 as "no explicit size".
 */
function VirtualizedBody<TData>({
  table,
  maxHeight,
  estimatedRowHeight,
  emptyMessage,
  loading,
}: {
  table: TanStackTable<TData>;
  maxHeight: number;
  estimatedRowHeight: number;
  emptyMessage: string;
  loading: boolean;
}) {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan: 8,
  });

  const visibleColumns = table.getVisibleLeafColumns();
  const gridTemplateColumns = visibleColumns
    .map((col) => {
      const size = col.getSize();
      const hasExplicit = col.columnDef.size !== undefined;
      return hasExplicit && size && size !== 150 ? `${size}px` : "minmax(0, 1fr)";
    })
    .join(" ");

  const colCount = visibleColumns.length;

  return (
    <div
      ref={parentRef}
      style={{ maxHeight, overflowY: "auto" }}
      role="table"
      aria-rowcount={rows.length + 1}
    >
      {/* Sticky header row — same grid template as body rows so columns align */}
      {table.getHeaderGroups().map((hg) => (
        <div
          key={hg.id}
          role="row"
          style={{
            display: "grid",
            gridTemplateColumns,
            position: "sticky",
            top: 0,
            zIndex: 1,
            background: "var(--zen-color-background)",
            borderBottom: "1px solid var(--zen-color-border)",
          }}
        >
          {hg.headers.map((header) => {
            const canSort = header.column.getCanSort();
            const sorted = header.column.getIsSorted();
            return (
              <div
                key={header.id}
                role="columnheader"
                data-active={sorted ? "true" : undefined}
                aria-sort={
                  sorted === "asc"
                    ? "ascending"
                    : sorted === "desc"
                    ? "descending"
                    : undefined
                }
                className={cn(
                  "text-sm font-medium text-zen-muted-fg flex items-center transition-colors",
                  canSort && "hover:bg-zen-muted",
                  "data-[active=true]:bg-zen-primary-soft data-[active=true]:text-zen-primary-soft-fg",
                )}
                style={{ minWidth: 0 }}
              >
                {header.isPlaceholder ? null : canSort ? (
                  <button
                    type="button"
                    onClick={header.column.getToggleSortingHandler()}
                    className="w-full h-full px-2 py-2 inline-flex items-center gap-1 bg-transparent border-0 cursor-pointer text-inherit font-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zen-ring focus-visible:ring-inset"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    <SortIndicator state={sorted} />
                  </button>
                ) : (
                  <span className="px-2 py-2 inline-flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Virtualized body — absolute-positioned rows, each its own grid */}
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {loading ? (
          <div
            role="row"
            style={{
              textAlign: "center",
              padding: "1.5rem",
              color: "var(--zen-color-muted-fg)",
            }}
          >
            Loading…
          </div>
        ) : rows.length === 0 ? (
          <div
            role="row"
            style={{
              textAlign: "center",
              padding: "1.5rem",
              color: "var(--zen-color-muted-fg)",
            }}
          >
            {emptyMessage}
          </div>
        ) : (
          virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <div
                key={row.id}
                role="row"
                data-state={row.getIsSelected() ? "selected" : undefined}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                  height: virtualRow.size,
                  display: "grid",
                  gridTemplateColumns,
                }}
                className={cn(
                  "border-b border-zen-border transition-[background-color,box-shadow,outline-color] duration-100",
                  "hover:bg-zen-muted/50 hover:shadow-zen-sm",
                  // selected — bg + sm shadow + 1px primary inside outline (Zen theme spec)
                  row.getIsSelected() &&
                    "bg-zen-primary-soft shadow-zen-sm outline outline-1 -outline-offset-1 outline-zen-primary",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    role="cell"
                    style={{
                      padding: "0.75rem 0.5rem",
                      display: "flex",
                      alignItems: "center",
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
      {/* Hidden helper to silence a11y linters that complain about empty <tbody> */}
      <span hidden aria-hidden>{colCount} columns</span>
    </div>
  );
}

/* ----------------------------- Pagination bar ------------------------ */
function PaginationBar<TData>({
  table,
  enableRowSelection,
  pageSizeOptions,
  manual,
}: {
  table: TanStackTable<TData>;
  enableRowSelection: boolean;
  pageSizeOptions: number[];
  manual: boolean;
}) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const selectedCount = table.getSelectedRowModel().rows.length;
  const totalCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="text-zen-muted-fg">
        {enableRowSelection ? (
          <>
            {selectedCount} of {totalCount} row(s) selected.
          </>
        ) : (
          <>
            Page {pageIndex + 1} of {Math.max(pageCount, 1)}
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        {!manual && (
          <div className="flex items-center gap-2">
            <span className="text-zen-muted-fg">Rows per page</span>
            <div style={{ width: 88 }}>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => table.setPageSize(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            color="neutral"
            size="sm"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}
            aria-label="First page"
          >
            «
          </Button>
          <Button
            variant="outline"
            color="neutral"
            size="sm"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            aria-label="Previous page"
          >
            ‹
          </Button>
          <Button
            variant="outline"
            color="neutral"
            size="sm"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            aria-label="Next page"
          >
            ›
          </Button>
          <Button
            variant="outline"
            color="neutral"
            size="sm"
            disabled={!table.getCanNextPage()}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            aria-label="Last page"
          >
            »
          </Button>
        </div>
      </div>
    </div>
  );
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./table";
