import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type ExpandedState,
  type FilterFn,
  type GroupingState,
  type PaginationState,
  type Row,
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
import { FilterCell, filterFnByVariant, type FilterVariant } from "./filters";
import {
  EditableCell,
  type CellEditPayload,
  type EditingState,
} from "./edit-cell";

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
  getRowId,
  persistKey,
  rowClassName,
  renderBulkActions,
  renderSubRow,
  expanded: expandedProp,
  onExpandedChange,
  enableGrouping = false,
  grouping: groupingProp,
  initialGrouping,
  onGroupingChange,
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
  onCellEdit,
  headerVariant = "plain",

  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  maxBodyHeight = 480,
  rowEstimatedHeight = 44,
  globalFilterPlaceholder = "Search…",
  emptyMessage = "No results.",
  loading = false,
  className,

  manualPagination,
  manualSorting = false,
  manualFiltering = false,

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
  /* Read the persisted snapshot once at mount. Each piece (order /
   * sizing / visibility / pinning) seeds the corresponding useState
   * initializer below. Must come BEFORE any useState that references
   * it — JS lexical TDZ would otherwise blow up on first render. */
  const persisted = React.useMemo(
    () => loadPersistedState(persistKey),
    [persistKey],
  );

  /* internal state — used when the corresponding prop isn't supplied */
  const [sortingInner, setSortingInner] = React.useState<SortingState>([]);
  const [filtersInner, setFiltersInner] = React.useState<ColumnFiltersState>([]);
  const [selectionInner, setSelectionInner] = React.useState<RowSelectionState>({});
  const [visibilityInner, setVisibilityInner] = React.useState<VisibilityState>(
    () => persisted?.columnVisibility ?? {},
  );
  const [globalFilterInner, setGlobalFilterInner] = React.useState("");
  const [paginationInner, setPaginationInner] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(
    () => persisted?.columnOrder ?? [],
  );
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>(
    () => persisted?.columnSizing ?? {},
  );
  const [columnPinningInner, setColumnPinningInner] =
    React.useState<ColumnPinningState>(
      () =>
        persisted?.columnPinning ??
        initialColumnPinning ?? { left: [], right: [] },
    );
  const columnPinning = columnPinningProp ?? columnPinningInner;
  const [expandedInner, setExpandedInner] = React.useState<ExpandedState>({});
  const expanded = expandedProp ?? expandedInner;
  const [groupingInner, setGroupingInner] = React.useState<GroupingState>(
    () => initialGrouping ?? [],
  );
  const grouping = groupingProp ?? groupingInner;

  /* Which cell is currently being edited. Single-cell editing only —
   * starting a new edit auto-commits the previous one would be a nice
   * upgrade later but for v1 we keep it simple. */
  const [editingCell, setEditingCell] = React.useState<EditingState | null>(null);
  const startEdit = React.useCallback(
    (rowId: string, columnId: string) =>
      setEditingCell({ rowId, columnId }),
    [],
  );
  const commitEdit = React.useCallback(
    (rowId: string, columnId: string, value: unknown) => {
      setEditingCell(null);
      onCellEdit?.({ rowId, columnId, value });
    },
    [onCellEdit],
  );
  const cancelEdit = React.useCallback(() => setEditingCell(null), []);

  const sorting = sortingProp ?? sortingInner;
  const filters = columnFiltersProp ?? filtersInner;
  const selection = rowSelectionProp ?? selectionInner;
  const visibility = columnVisibilityProp ?? visibilityInner;
  const globalFilter = globalFilterProp ?? globalFilterInner;

  /* Hard-gate three features against enableVirtualization. The
   * virtualizer is fixed-size, so any feature that produces variable-
   * height rows (renderSubRow), variable row counts (enableGrouping),
   * or absolute-position-incompatible drag (enableRowOrdering) is
   * silently disabled when virt is on. Dev-mode warnings below tell
   * callers which combo was rejected. */
  const rowOrderingActive = enableRowOrdering && !enableVirtualization;
  const groupingActive = enableGrouping && !enableVirtualization;
  const subRowActive = !!renderSubRow && !enableVirtualization;
  /* renderSubRow OR grouping — both rely on getExpandedRowModel.
   * Both are already virt-gated above. */
  const expansionEnabled = subRowActive || groupingActive;

  /* One-shot dev-mode warning when an unsupported feature was paired
   * with enableVirtualization. We deliberately log instead of throwing
   * so production builds don't crash on a stale prop combo. */
  React.useEffect(() => {
    if (!enableVirtualization) return;
    /* Vite + most bundlers replace import.meta.env.DEV statically at
     * build time, so the warning block tree-shakes out of production. */
    if (!import.meta.env?.DEV) return;
    if (enableRowOrdering) {
      console.warn(
        "[DataTable] `enableRowOrdering` is not supported with `enableVirtualization`. " +
          "The drag-handle column has been hidden.",
      );
    }
    if (renderSubRow) {
      console.warn(
        "[DataTable] `renderSubRow` is not supported with `enableVirtualization`. " +
          "The expand-toggle column has been hidden and sub-rows won't render.",
      );
    }
    if (enableGrouping) {
      console.error(
        "[DataTable] `enableGrouping` is not supported with `enableVirtualization`. " +
          "Grouping has been forcibly disabled to avoid the virtualized body " +
          "rendering group-header rows as data rows (which would mis-display " +
          "aggregated values as scalars). Disable virtualization to use grouping.",
      );
    }
  }, [enableVirtualization, enableRowOrdering, renderSubRow, enableGrouping]);

  /* Prepend leading columns: drag-grip (if enabled) then select-checkbox
   * (if enabled). Both are opt-in. For user columns we also auto-attach
   * the variant-matching `filterFn` (text/number/select/…) when `meta.
   * filterVariant` is declared and the caller didn't set their own. */
  const augmentedColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    const leading: ColumnDef<TData, TValue>[] = [];

    if (rowOrderingActive) {
      leading.push({
        id: "__drag__",
        header: () => <span className="zen-sr-only">Reorder</span>,
        cell: ({ row }) => <DragHandle id={row.id} />,
        enableSorting: false,
        enableHiding: false,
        size: 32,
      });
    }

    if (expansionEnabled) {
      leading.push({
        id: "__expand__",
        header: () => <span className="zen-sr-only">Expand</span>,
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => row.toggleExpanded()}
            aria-expanded={row.getIsExpanded()}
            aria-label={
              row.getIsExpanded() ? "Collapse row" : "Expand row"
            }
            className={cn(
              "zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6",
              "zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer",
              "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
              "zen-transition-transform",
              row.getIsExpanded() && "zen-rotate-90",
            )}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        ),
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

    const withVariantFilters: ColumnDef<TData, TValue>[] = columns.map((col) => {
      const meta = col.meta as { filterVariant?: FilterVariant } | undefined;
      if (meta?.filterVariant && !col.filterFn) {
        return {
          ...col,
          // The variant filterFns are data-shape-agnostic — they read via
          // row.getValue(columnId) and compare against the filter value —
          // so widening to FilterFn<TData> is safe.
          filterFn: filterFnByVariant[
            meta.filterVariant
          ] as unknown as FilterFn<TData>,
        };
      }
      return col;
    });

    return [...leading, ...withVariantFilters];
  }, [columns, enableRowSelection, rowOrderingActive, expansionEnabled]);

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
      expanded,
      grouping,
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
    enableGrouping: groupingActive,
    getRowId,
    manualPagination: !!manualPagination,
    manualSorting,
    manualFiltering,
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
    onExpandedChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(expanded) : updater;
      if (expandedProp === undefined) setExpandedInner(next);
      onExpandedChange?.(next);
    },
    onGroupingChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(grouping) : updater;
      if (groupingProp === undefined) setGroupingInner(next);
      onGroupingChange?.(next);
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
    /* Skip the row-model functions when their corresponding manual flag
     * is set — TanStack will then trust the source data array as-is. */
    getSortedRowModel:
      enableSorting && !manualSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel:
      (enableColumnFilters || enablePerColumnFilters) && !manualFiltering
        ? getFilteredRowModel()
        : undefined,
    getPaginationRowModel:
      enablePagination && !manualPagination ? getPaginationRowModel() : undefined,
    getExpandedRowModel: expansionEnabled ? getExpandedRowModel() : undefined,
    /* groupingActive (not enableGrouping) — gated off when virtualized
     * so getGroupedRowModel doesn't produce group rows that the virt
     * body would render as misleading data rows. */
    getGroupedRowModel: groupingActive ? getGroupedRowModel() : undefined,
  });

  const rows = table.getRowModel().rows;

  /* Cell-content renderer that handles the four TanStack cell modes
   *   - grouped:     this column is the group-by key on a group-header
   *                  row → render toggle + value + sub-row count
   *   - aggregated:  this column has an aggregationFn and we're on a
   *                  group-header row → render aggregatedCell or the
   *                  default cell with the aggregated value
   *   - placeholder: the grouped column on a leaf sub-row → leave empty
   *                  (the value is shown by the group header above)
   *   - default:     regular cell, flexRender as usual
   */
  const renderCell = React.useCallback(
    (cell: import("@tanstack/react-table").Cell<TData, unknown>) => {
      if (cell.getIsGrouped()) {
        const row = cell.row;
        return (
          <div className="zen-inline-flex zen-items-center zen-gap-1.5">
            <button
              type="button"
              onClick={row.getToggleExpandedHandler()}
              aria-expanded={row.getIsExpanded()}
              aria-label={
                row.getIsExpanded() ? "Collapse group" : "Expand group"
              }
              className={cn(
                "zen-inline-flex zen-items-center zen-justify-center zen-h-5 zen-w-5 zen-rounded-zen-sm",
                "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-transition-transform",
                "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
                "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                row.getIsExpanded() && "zen-rotate-90",
              )}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>
            <span className="zen-font-medium">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </span>
            <span className="zen-text-xs zen-text-zen-muted-fg">
              ({row.subRows.length})
            </span>
          </div>
        );
      }
      if (cell.getIsAggregated()) {
        return flexRender(
          cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
          cell.getContext(),
        );
      }
      if (cell.getIsPlaceholder()) return null;
      return flexRender(cell.column.columnDef.cell, cell.getContext());
    },
    [],
  );

  /* Write the persistable snapshot back to localStorage whenever any
   * piece changes. Throttled to a microtask via useEffect; storage
   * failures are swallowed. */
  React.useEffect(() => {
    savePersistedState(persistKey, {
      columnOrder,
      columnSizing,
      columnVisibility: visibility,
      columnPinning,
    });
  }, [persistKey, columnOrder, columnSizing, visibility, columnPinning]);

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
    ? "zen-border-r zen-border-zen-border last:zen-border-r-0"
    : "";
  const sepHeadClass = enableColumnSeparators
    ? "[&>th]:zen-border-r [&>th]:zen-border-zen-border [&>th:last-child]:zen-border-r-0"
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

  /* headerVariant — brand intensity of the column-header row. Composed
   * with `stickyRowClass` below so the variant survives pinning.
   *   plain     → just the default muted-fg header text (no extras)
   *   underline → 2-px primary underline beneath the row group
   *   branded   → primary-soft fill + primary-soft-fg label text */
  const headerVariantRowClass =
    headerVariant === "branded"
      ? "zen-bg-zen-primary-soft [&>th]:zen-text-zen-primary-soft-fg [&>th]:zen-font-semibold"
      : "";
  /* underline is applied to the <thead> wrapper so it sits below *all*
   * header rows (main row + filter row) as one band edge. */
  const headerVariantThClass =
    headerVariant === "underline"
      ? "[&_tr:last-child]:zen-border-b-2 [&_tr:last-child]:zen-border-zen-primary"
      : "";
  /* CSS var that pinned/sticky header cells read for their background
   * (see HeaderCell + filter-row inline style). Falls back to the page
   * background for plain/underline, switches to primary-soft for branded
   * so the band stays consistent when the header is sticky. */
  const headerStickyBg =
    headerVariant === "branded"
      ? "var(--zen-color-primary-soft)"
      : "var(--zen-color-background)";

  /* Per-row className used by every TableRow in TableHeader. When the
   * header is pinned to the top of the scroll viewport we lift it via
   * `sticky top-0 z-10`. The branded variant carries its own background;
   * otherwise we paint with bg-zen-background so body content doesn't
   * bleed through. */
  const stickyRowClass = stickyHeaderActive
    ? headerVariant === "branded"
      ? "zen-sticky zen-top-0 zen-z-10"
      : "zen-sticky zen-top-0 zen-z-10 zen-bg-zen-background"
    : "";

  /* Header-only pin style — same offsets as the body pinStyle but with
   * the variant-aware background, so pinned header cells don't paint
   * white squares over the branded band. */
  const headerPinStyle = (
    column: Column<TData, unknown>,
  ): React.CSSProperties | undefined => {
    const ps = pinStyle(column);
    if (!ps) return undefined;
    return { ...ps, background: headerStickyBg };
  };

  const headerRows = (
    <TableHeader className={headerVariantThClass}>
      {table.getHeaderGroups().map((hg) => (
        <TableRow
          key={hg.id}
          className={cn(sepHeadClass, stickyRowClass, headerVariantRowClass)}
        >
          {hg.headers.map((header) => (
            <HeaderCell
              key={header.id}
              header={header}
              enableColumnResizing={enableColumnResizing}
              enableColumnOrdering={enableColumnOrdering}
              pinStyle={headerPinStyle(header.column)}
              stickyHeader={stickyHeaderActive}
              stickyBg={headerStickyBg}
            />
          ))}
        </TableRow>
      ))}
      {enablePerColumnFilters &&
        table.getHeaderGroups().map((hg) => (
          <TableRow
            key={`${hg.id}-filter`}
            className={cn(sepHeadClass, stickyRowClass, headerVariantRowClass)}
            style={stickyHeaderActive ? { top: "var(--zen-dt-header-h, 40px)" } : undefined}
          >
            {hg.headers.map((header) => {
              const pin = headerPinStyle(header.column);
              return (
                <TableHead
                  key={`${header.id}-filter`}
                  className="zen-px-2 zen-py-1"
                  style={
                    pin
                      ? { ...pin, zIndex: stickyHeaderActive ? 11 : 1 }
                      : stickyHeaderActive
                      ? { background: headerStickyBg }
                      : undefined
                  }
                >
                  {header.column.getCanFilter() &&
                  !header.id.startsWith("__") ? (
                    <FilterCell column={header.column} />
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
              className="zen-text-center zen-text-zen-muted-fg zen-py-6"
            >
              Loading…
            </TableCell>
          </TableRow>
        ) : rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={augmentedColumns.length}
              className="zen-text-center zen-text-zen-muted-fg zen-py-6"
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
                className={rowClassName?.(row)}
              >
                {row.getVisibleCells().map((cell) => {
                  const pin = pinStyle(cell.column);
                  const isEditing =
                    editingCell?.rowId === row.id &&
                    editingCell?.columnId === cell.column.id;
                  return (
                    <TableCell
                      key={cell.id}
                      className={sepCellClass}
                      style={pin}
                    >
                      <EditableCell
                        cell={cell}
                        editing={isEditing}
                        onStartEdit={() => startEdit(row.id, cell.column.id)}
                        onCommit={(v) => commitEdit(row.id, cell.column.id, v)}
                        onCancel={cancelEdit}
                      >
                        {renderCell(cell)}
                      </EditableCell>
                    </TableCell>
                  );
                })}
              </SortableRow>
            ) : (
              <React.Fragment key={row.id}>
                <TableRow
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  data-grouped={row.getIsGrouped() ? "true" : undefined}
                  className={cn(
                    row.getIsGrouped() && "zen-bg-zen-muted/40 zen-font-medium",
                    rowClassName?.(row),
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const pin = pinStyle(cell.column);
                    const isEditing =
                      editingCell?.rowId === row.id &&
                      editingCell?.columnId === cell.column.id;
                    /* Disable inline-edit for group-header and
                     * aggregated cells — the rendered value isn't a
                     * single row's field. */
                    const isInteractive =
                      !cell.getIsGrouped() &&
                      !cell.getIsAggregated() &&
                      !cell.getIsPlaceholder();
                    const content = renderCell(cell);
                    return (
                      <TableCell
                        key={cell.id}
                        className={sepCellClass}
                        style={pin}
                      >
                        {isInteractive ? (
                          <EditableCell
                            cell={cell}
                            editing={isEditing}
                            onStartEdit={() => startEdit(row.id, cell.column.id)}
                            onCommit={(v) => commitEdit(row.id, cell.column.id, v)}
                            onCancel={cancelEdit}
                          >
                            {content}
                          </EditableCell>
                        ) : (
                          content
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
                {/* Expanded sub-row: a single full-width <td> spanning every
                 * visible column. Renders only when the toggle is open. */}
                {expansionEnabled && row.getIsExpanded() && renderSubRow ? (
                  <TableRow data-expanded-of={row.id}>
                    <TableCell
                      colSpan={row.getVisibleCells().length}
                      className="zen-p-0 zen-bg-zen-muted/30"
                    >
                      {renderSubRow(row)}
                    </TableCell>
                  </TableRow>
                ) : null}
              </React.Fragment>
            ),
          )
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className={cn("zen-space-y-3", className)}>
      <Toolbar
        table={table}
        enableColumnFilters={enableColumnFilters}
        enableColumnVisibility={enableColumnVisibility}
        enableColumnPinning={enableColumnPinning}
        enableGrouping={groupingActive}
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

      <BulkActionBar table={table} renderBulkActions={renderBulkActions} />

      <ActiveFilterChips table={table} />

      <div
        className="zen-rounded-zen-md zen-border zen-border-zen-border"
        aria-busy={loading || undefined}
      >
        {enableVirtualization ? (
          <VirtualizedBody
            table={table}
            maxHeight={maxBodyHeight}
            estimatedRowHeight={rowEstimatedHeight}
            emptyMessage={emptyMessage}
            loading={loading}
            enableColumnPinning={enableColumnPinning}
            enableColumnResizing={enableColumnResizing}
            enableColumnOrdering={enableColumnOrdering}
            enablePerColumnFilters={enablePerColumnFilters}
            visibleColumnIds={visibleColumnIds}
            onColumnDragEnd={handleColumnDragEnd}
            sensors={sensors}
            editingCell={editingCell}
            onStartEdit={startEdit}
            onCommitEdit={commitEdit}
            onCancelEdit={cancelEdit}
            rowClassName={rowClassName}
            headerVariant={headerVariant}
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
  enableColumnPinning,
  enableGrouping,
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
  enableColumnPinning: boolean;
  enableGrouping: boolean;
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
    !enableGrouping &&
    !enableExport
  )
    return null;
  return (
    <div className="zen-flex zen-items-center zen-gap-2">
      {enableColumnFilters && (
        <Input
          value={globalFilter}
          onChange={(e) => onGlobalFilterChange(e.target.value)}
          placeholder={globalFilterPlaceholder}
          className="zen-max-w-xs"
        />
      )}
      <div className="zen-ml-auto zen-flex zen-items-center zen-gap-2">
        {enableExport && (
          <ExportMenu
            table={table}
            filename={exportFilename}
            onlySelected={exportOnlySelected}
          />
        )}
        {enableGrouping && <GroupByMenu table={table} />}
        {enableColumnVisibility && (
          <ColumnsMenu table={table} enableColumnPinning={enableColumnPinning} />
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Group-by menu ------------------------- */
/**
 * Dropdown listing every column that can be grouped (`column.getCanGroup()` —
 * true unless the column def says `enableGrouping: false`). Each item is a
 * checkbox toggling whether the column participates in the active grouping.
 * Multi-grouping is supported by the underlying model; clicks compose.
 *
 * The trigger label is "Group by" by default and switches to "Group by (N)"
 * once one or more columns are active so it's clear at a glance.
 */
function GroupByMenu<TData>({ table }: { table: TanStackTable<TData> }) {
  const groupable = table.getAllColumns().filter((c) => c.getCanGroup());
  if (groupable.length === 0) return null;
  const activeCount = table.getState().grouping.length;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" color="neutral" size="sm">
          {activeCount ? `Group by (${activeCount})` : "Group by"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="zen-min-w-44">
        <DropdownMenuLabel>Group rows by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {groupable.map((column) => {
          const label =
            (typeof column.columnDef.header === "string" &&
              column.columnDef.header) ||
            column.id;
          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsGrouped()}
              onCheckedChange={() => column.toggleGrouping()}
            >
              {label}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* --------------------------- Bulk-action bar -------------------------- */
/**
 * Contextual toolbar shown while ≥ 1 row is selected. Layout:
 *
 *   ┌────────────────────────────────────────────────────────────────┐
 *   │ ✓ 3 selected   [Select all 40 matching]   <caller actions>  ✕ │
 *   └────────────────────────────────────────────────────────────────┘
 *
 * The "Select all N matching" link appears when only the current page
 * is fully checked but more rows match the active filters (i.e. when
 * pagination has hidden additional matches behind it). Clicking it
 * extends selection to every row in `getFilteredRowModel()`.
 *
 * Auto-hides when nothing is selected or the caller didn't pass
 * `renderBulkActions`.
 */
function BulkActionBar<TData>({
  table,
  renderBulkActions,
}: {
  table: TanStackTable<TData>;
  renderBulkActions?: (ctx: {
    table: TanStackTable<TData>;
    rows: Row<TData>[];
    clear: () => void;
  }) => React.ReactNode;
}) {
  const selectedRows = table.getSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  if (selectedCount === 0 || !renderBulkActions) return null;

  const filtered = table.getFilteredRowModel().rows;
  const totalFiltered = filtered.length;
  const allFilteredSelected = selectedCount === totalFiltered;
  const allPageRowsSelected = table.getIsAllPageRowsSelected();
  const moreOffPage = totalFiltered > selectedCount;
  const showCrossPage =
    allPageRowsSelected && !allFilteredSelected && moreOffPage;

  const clear = () => table.resetRowSelection();
  const selectAllMatching = () => {
    const next: RowSelectionState = {};
    filtered.forEach((r) => {
      next[r.id] = true;
    });
    table.setRowSelection(next);
  };

  return (
    <div
      className={cn(
        "zen-flex zen-items-center zen-gap-3 zen-px-3 zen-py-2",
        "zen-rounded-zen-md zen-bg-zen-primary-soft zen-border zen-border-zen-primary-soft",
        "zen-text-zen-primary-soft-fg",
      )}
      role="toolbar"
      aria-label="Bulk actions for selected rows"
    >
      <span
        className="zen-text-sm zen-font-medium"
        aria-live="polite"
        aria-atomic="true"
      >
        {selectedCount} selected
      </span>
      {showCrossPage ? (
        <button
          type="button"
          onClick={selectAllMatching}
          className={cn(
            "zen-text-xs zen-underline zen-underline-offset-2",
            "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-inherit",
            "hover:zen-opacity-80",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
          )}
        >
          Select all {totalFiltered} matching
        </button>
      ) : null}
      <div className="zen-ml-auto zen-flex zen-items-center zen-gap-2">
        {renderBulkActions({ table, rows: selectedRows, clear })}
        <button
          type="button"
          onClick={clear}
          aria-label="Clear selection"
          className={cn(
            "zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6",
            "zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer",
            "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10",
            "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring",
          )}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* --------------------------- Active filter chips --------------------- */
/**
 * Renders a removable chip for every active column filter + the global
 * filter, plus a "Clear all" button. Auto-hides when nothing's filtered.
 *
 * Column-filter values can be:
 *   - plain string (legacy)           "abc"
 *   - text variant     { op, value }   { op: "contains", value: "abc" }
 *   - number variant   { op, value }   { op: "gte", value: 60000 }
 *   - numberRange       [min, max]      [60000, 200000]
 *   - select / boolean  scalar          "Admin" | true
 * The label tries each shape in turn and falls back to JSON.stringify.
 */
function ActiveFilterChips<TData>({
  table,
}: {
  table: TanStackTable<TData>;
}) {
  const colFilters = table.getState().columnFilters;
  const globalFilter = table.getState().globalFilter as string | undefined;
  const hasGlobal = typeof globalFilter === "string" && globalFilter.length > 0;
  if (colFilters.length === 0 && !hasGlobal) return null;

  const labelForColumn = (id: string): string => {
    const col = table.getColumn(id);
    const h = col?.columnDef.header;
    return typeof h === "string" ? h : id;
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined || value === "") return "";
    if (Array.isArray(value)) {
      const [min, max] = value as (number | null)[];
      if (min == null && max == null) return "";
      if (min == null) return `≤ ${max}`;
      if (max == null) return `≥ ${min}`;
      return `${min} – ${max}`;
    }
    if (typeof value === "object") {
      const v = value as { op?: string; value?: unknown };
      if (v.op && v.value !== undefined && v.value !== null && v.value !== "") {
        const symbols: Record<string, string> = {
          contains: "≈",
          equals: "=",
          starts: "a…",
          ends: "…a",
          eq: "=",
          ne: "≠",
          gt: ">",
          lt: "<",
          gte: "≥",
          lte: "≤",
        };
        return `${symbols[v.op] ?? v.op} ${v.value}`;
      }
      return "";
    }
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  return (
    <div
      className="zen-flex zen-flex-wrap zen-items-center zen-gap-2"
      role="group"
      aria-label="Active filters"
    >
      <span className="zen-text-xs zen-text-zen-muted-fg">Filters:</span>
      {hasGlobal ? (
        <Chip
          label={`Search: ${globalFilter}`}
          onRemove={() => table.setGlobalFilter("")}
        />
      ) : null}
      {colFilters.map((f) => {
        const formatted = formatValue(f.value);
        if (!formatted) return null;
        return (
          <Chip
            key={f.id}
            label={`${labelForColumn(f.id)}: ${formatted}`}
            onRemove={() => table.getColumn(f.id)?.setFilterValue(undefined)}
          />
        );
      })}
      <button
        type="button"
        onClick={() => {
          table.resetColumnFilters();
          table.setGlobalFilter("");
        }}
        className={cn(
          "zen-ml-1 zen-inline-flex zen-items-center zen-text-xs zen-px-2 zen-py-0.5 zen-rounded-zen-sm",
          "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
          "zen-bg-transparent zen-border-0 zen-cursor-pointer",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        )}
      >
        Clear all
      </button>
    </div>
  );
}

function Chip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span
      className={cn(
        "zen-inline-flex zen-items-center zen-gap-1 zen-px-2 zen-py-0.5",
        "zen-text-xs zen-font-medium",
        "zen-rounded-zen-full zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
        "zen-border zen-border-zen-primary-soft",
      )}
    >
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className={cn(
          "zen-inline-flex zen-items-center zen-justify-center",
          "zen-h-4 zen-w-4 zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer",
          "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10",
          "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring",
        )}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </span>
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
      <DropdownMenuContent align="end" className="zen-min-w-44">
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

/* ----------------------------- Persisted state ----------------------- */
/**
 * Shape of the on-disk snapshot. Versioned so future shape changes can
 * invalidate stale data rather than crash on a bad shape.
 */
interface PersistedState {
  v: 1;
  columnOrder?: ColumnOrderState;
  columnSizing?: ColumnSizingState;
  columnVisibility?: VisibilityState;
  columnPinning?: ColumnPinningState;
}

const persistKeyPrefix = "zen-dt:";

function loadPersistedState(key: string | undefined): PersistedState | null {
  if (!key || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(persistKeyPrefix + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed && parsed.v === 1) return parsed;
    return null;
  } catch {
    return null;
  }
}

function savePersistedState(
  key: string | undefined,
  snapshot: Omit<PersistedState, "v">,
): void {
  if (!key || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      persistKeyPrefix + key,
      JSON.stringify({ v: 1, ...snapshot } satisfies PersistedState),
    );
  } catch {
    // ignore quota / private-mode errors
  }
}

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
        "zen-cursor-grab active:zen-cursor-grabbing zen-inline-flex zen-items-center zen-justify-center",
        "zen-h-6 zen-w-6 zen-rounded-zen-sm zen-bg-transparent zen-border-0",
        "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
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
  className,
  children,
}: {
  id: string;
  selected: boolean;
  cellClassName: string;
  className?: string;
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
      className={className}
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

/**
 * ColumnsMenu — "Columns" dropdown.
 *
 * Default mode: a list of checkbox items, one per hide-able column, that
 * toggle column visibility (the historical behavior).
 *
 * When `enableColumnPinning` is on we switch from `DropdownMenuCheckboxItem`
 * to a custom row layout per column so we can fit two extra controls on
 * the right: pin-left (◀) and pin-right (▶). Each is a 3-state toggle —
 * highlighted when the column is currently pinned to that side, click to
 * pin / unpin. We `e.preventDefault()` inside the click handler so the
 * menu stays open while the user adjusts multiple columns.
 */
function ColumnsMenu<TData>({
  table,
  enableColumnPinning,
}: {
  table: TanStackTable<TData>;
  enableColumnPinning?: boolean;
}) {
  const hideable = table.getAllColumns().filter((c) => c.getCanHide());
  if (hideable.length === 0) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" color="neutral" size="sm">
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="zen-min-w-56">
        <DropdownMenuLabel>
          {enableColumnPinning ? "Manage columns" : "Toggle columns"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideable.map((column) => {
          const label =
            (typeof column.columnDef.header === "string" &&
              column.columnDef.header) ||
            column.id;
          if (!enableColumnPinning) {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(v) => column.toggleVisibility(v === true)}
              >
                {label}
              </DropdownMenuCheckboxItem>
            );
          }
          const pin = column.getIsPinned();
          return (
            <div
              key={column.id}
              className="zen-flex zen-items-center zen-gap-2 zen-px-2 zen-py-1.5 zen-text-sm"
            >
              <Checkbox
                checked={column.getIsVisible()}
                onCheckedChange={(v) => column.toggleVisibility(v === true)}
                aria-label={`Toggle visibility of ${label}`}
              />
              <span className="zen-flex-1 zen-truncate">{label}</span>
              <PinButton
                active={pin === "left"}
                side="left"
                label={label}
                onClick={(e) => {
                  e.preventDefault();
                  column.pin(pin === "left" ? false : "left");
                }}
              />
              <PinButton
                active={pin === "right"}
                side="right"
                label={label}
                onClick={(e) => {
                  e.preventDefault();
                  column.pin(pin === "right" ? false : "right");
                }}
              />
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PinButton({
  active,
  side,
  label,
  onClick,
}: {
  active: boolean;
  side: "left" | "right";
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        active ? `Unpin ${label} from ${side}` : `Pin ${label} to ${side}`
      }
      aria-pressed={active}
      title={
        active ? `Unpin from ${side}` : `Pin to ${side}`
      }
      className={cn(
        "zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6 zen-rounded-zen-sm",
        "zen-border-0 zen-cursor-pointer zen-text-xs",
        active
          ? "zen-bg-zen-primary zen-text-zen-primary-fg"
          : "zen-bg-transparent zen-text-zen-muted-fg hover:zen-bg-zen-muted hover:zen-text-zen-foreground",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      )}
    >
      {side === "left" ? "◀" : "▶"}
    </button>
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
  stickyBg,
}: {
  header: import("@tanstack/react-table").Header<TData, TValue>;
  enableColumnResizing?: boolean;
  enableColumnOrdering?: boolean;
  pinStyle?: React.CSSProperties;
  stickyHeader?: boolean;
  /** Variant-aware bg for sticky header cells (page bg or primary-soft). */
  stickyBg?: string;
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
            "zen-w-full zen-h-full zen-px-2 zen-py-2",
            "zen-inline-flex zen-items-center zen-gap-1 zen-text-left zen-font-inherit zen-text-inherit",
            "zen-bg-transparent zen-border-0 zen-cursor-pointer",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset",
          )}
        >
          {flexRender(header.column.columnDef.header, header.getContext())}
          <SortIndicator state={sorted} />
          {sortIndex !== null ? (
            <span
              aria-hidden
              className="zen-text-[1rem] zen-font-semibold zen-text-zen-muted-fg zen-ml-0.5"
              title={`Sort priority ${sortIndex}`}
            >
              {sortIndex}
            </span>
          ) : null}
        </button>
      ) : (
        <span className="zen-px-2 zen-py-2 zen-inline-flex zen-items-center zen-gap-1">
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
            "zen-absolute zen-right-0 zen-top-0 zen-h-full zen-w-1.5 zen-cursor-col-resize zen-select-none zen-touch-none",
            "zen-bg-transparent zen-border-0 zen-p-0",
            "hover:zen-bg-zen-primary",
            isResizing && "zen-bg-zen-primary",
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
      ? { background: stickyBg ?? "var(--zen-color-background)" }
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
        "zen-p-0 zen-transition-colors zen-relative",
        canSort && "hover:zen-bg-zen-muted",
        "data-[active=true]:zen-bg-zen-primary-soft data-[active=true]:zen-text-zen-primary-soft-fg",
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
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="zen-opacity-30" aria-hidden>
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
  enableColumnPinning,
  enableColumnResizing,
  enableColumnOrdering,
  enablePerColumnFilters,
  visibleColumnIds,
  onColumnDragEnd,
  sensors,
  editingCell,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
  rowClassName,
  headerVariant,
}: {
  table: TanStackTable<TData>;
  maxHeight: number;
  estimatedRowHeight: number;
  emptyMessage: string;
  loading: boolean;
  enableColumnPinning?: boolean;
  enableColumnResizing?: boolean;
  enableColumnOrdering?: boolean;
  enablePerColumnFilters?: boolean;
  visibleColumnIds: string[];
  onColumnDragEnd: (event: DragEndEvent) => void;
  sensors: ReturnType<typeof useSensors>;
  editingCell: EditingState | null;
  onStartEdit: (rowId: string, columnId: string) => void;
  onCommitEdit: (rowId: string, columnId: string, value: unknown) => void;
  onCancelEdit: () => void;
  rowClassName?: (row: Row<TData>) => string | undefined;
  headerVariant: "plain" | "underline" | "branded";
}) {
  /* Same brand-intensity machinery as the HTML-table path. The wrapper
   * <div> below paints headerStickyBg as a band; pinned + filter cells
   * inherit it via headerPinStyle so they don't repaint white over
   * the band when the variant is "branded". */
  const headerStickyBg =
    headerVariant === "branded"
      ? "var(--zen-color-primary-soft)"
      : "var(--zen-color-background)";
  /* Same pin-style algorithm as the HTML-table path. Sticky offsets read
   * from TanStack's column.getStart('left') / getAfter('right'). In
   * virtualized mode the absolute-positioned row is also the sticky
   * containing block; `position: sticky` on its children still resolves
   * scroll offsets against the parentRef (the scrollable ancestor). */
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

  /* Header-only pin style — overrides the body pinStyle's white bg with
   * the variant-aware band color so pinned header cells don't appear as
   * white squares over the "branded" primary-soft strip. */
  const headerPinStyle = React.useCallback(
    (column: Column<TData, unknown>): React.CSSProperties | undefined => {
      const ps = pinStyle(column);
      if (!ps) return undefined;
      return { ...ps, background: headerStickyBg };
    },
    [pinStyle, headerStickyBg],
  );

  const parentRef = React.useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan: 8,
  });

  const visibleColumns = table.getVisibleLeafColumns();
  /* Column width source of truth:
   *   1. live resize state (columnSizing[col.id]) overrides everything;
   *   2. column def's explicit `size` if set;
   *   3. otherwise share the remaining width via `minmax(0, 1fr)`.
   *
   * The runtime resize state has to override the columnDef, otherwise
   * dragging the resize handle wouldn't visually move the body cells in
   * virtualized mode (the grid template would keep rendering the old
   * static size). */
  const sizingState = table.getState().columnSizing;
  const gridTemplateColumns = visibleColumns
    .map((col) => {
      const stateSize = sizingState[col.id];
      if (stateSize !== undefined) return `${stateSize}px`;
      const explicit = col.columnDef.size;
      if (explicit !== undefined && explicit !== 150) return `${explicit}px`;
      return "minmax(0, 1fr)";
    })
    .join(" ");

  const colCount = visibleColumns.length;

  return (
    <div
      ref={parentRef}
      /* overflow: auto (not just overflowY) so column pinning can pin
       * against a horizontal scroll axis when columns are wider than the
       * viewport. */
      style={{ maxHeight, overflow: "auto" }}
      role="table"
      aria-rowcount={rows.length + 1}
      aria-colcount={colCount}
    >
      {/* Sticky header — wraps the actual <thead>-equivalent rows in a
       * single sticky container so they stay flush together (header +
       * per-column filter row, when on) and so the DndContext for
       * column ordering wraps both. */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          background: headerStickyBg,
          borderBottom:
            headerVariant === "underline"
              ? "2px solid var(--zen-color-primary)"
              : "1px solid var(--zen-color-border)",
        }}
      >
        {(enableColumnOrdering ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onColumnDragEnd}
          >
            <SortableContext
              items={visibleColumnIds}
              strategy={horizontalListSortingStrategy}
            >
              {table.getHeaderGroups().map((hg) => (
                <div
                  key={hg.id}
                  role="row"
                  style={{ display: "grid", gridTemplateColumns }}
                >
                  {hg.headers.map((header) => (
                    <VirtSortableHeaderCell
                      key={header.id}
                      header={header}
                      pinStyle={headerPinStyle(header.column)}
                      enableColumnResizing={enableColumnResizing}
                      branded={headerVariant === "branded"}
                    />
                  ))}
                </div>
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          table.getHeaderGroups().map((hg) => (
            <div
              key={hg.id}
              role="row"
              style={{ display: "grid", gridTemplateColumns }}
            >
              {hg.headers.map((header) => (
                <VirtHeaderCell
                  key={header.id}
                  header={header}
                  pinStyle={headerPinStyle(header.column)}
                  enableColumnResizing={enableColumnResizing}
                  branded={headerVariant === "branded"}
                />
              ))}
            </div>
          ))
        ))}

        {/* Per-column filter row — second sticky <tr>-equivalent below
         * the header row when enabled. Same grid template so columns
         * stay aligned. Pinned cells keep their offsets so the filter
         * inputs travel with their column on horizontal scroll. */}
        {enablePerColumnFilters &&
          table.getHeaderGroups().map((hg) => (
            <div
              key={`${hg.id}-filter`}
              role="row"
              style={{
                display: "grid",
                gridTemplateColumns,
                borderTop: "1px solid var(--zen-color-border)",
              }}
            >
              {hg.headers.map((header) => {
                const pin = headerPinStyle(header.column);
                return (
                  <div
                    key={`${header.id}-filter`}
                    style={{
                      padding: "var(--zen-space-1)",
                      minWidth: 0,
                      background: headerStickyBg,
                      ...(pin ?? {}),
                      ...(pin ? { zIndex: 2 } : {}),
                    }}
                  >
                    {header.column.getCanFilter() &&
                    !header.id.startsWith("__") ? (
                      <FilterCell column={header.column} />
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
      </div>

      {/* Virtualized body — absolute-positioned rows, each its own grid */}
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {loading ? (
          <div
            role="row"
            style={{
              textAlign: "center",
              padding: "var(--zen-space-4)",
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
              padding: "var(--zen-space-4)",
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
                  "zen-border-b zen-border-zen-border zen-transition-[background-color,box-shadow,outline-color] zen-duration-100",
                  "hover:zen-bg-zen-muted/50 hover:zen-shadow-zen-sm",
                  // selected — bg + sm shadow + 1px primary inside outline (Zen theme spec)
                  row.getIsSelected() &&
                    "zen-bg-zen-primary-soft zen-shadow-zen-sm zen-outline zen-outline-1 -zen-outline-offset-1 zen-outline-zen-primary",
                  rowClassName?.(row),
                )}
              >
                {row.getVisibleCells().map((cell) => {
                  const pin = pinStyle(cell.column);
                  const isEditing =
                    editingCell?.rowId === row.id &&
                    editingCell?.columnId === cell.column.id;
                  return (
                    <div
                      key={cell.id}
                      role="cell"
                      style={{
                        padding: "var(--zen-space-2) var(--zen-space-1)",
                        display: "flex",
                        alignItems: "center",
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        ...(pin ?? {}),
                      }}
                    >
                      <EditableCell
                        cell={cell}
                        editing={isEditing}
                        onStartEdit={() => onStartEdit(row.id, cell.column.id)}
                        onCommit={(v) =>
                          onCommitEdit(row.id, cell.column.id, v)
                        }
                        onCancel={onCancelEdit}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </EditableCell>
                    </div>
                  );
                })}
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

/* ----------------------------- Virt header cells --------------------- */
/**
 * Renders the inner content of a virtualized header cell: sort button +
 * sort indicator (when sortable), and an optional resize handle on the
 * right edge. Used by both VirtHeaderCell (static) and
 * VirtSortableHeaderCell (drag-to-reorder) so the cell content stays in
 * one place.
 */
function VirtHeaderCellInner<TData, TValue>({
  header,
  enableColumnResizing,
}: {
  header: import("@tanstack/react-table").Header<TData, TValue>;
  enableColumnResizing?: boolean;
}) {
  const canSort = header.column.getCanSort();
  const sorted = header.column.getIsSorted();
  const isResizing = header.column.getIsResizing();
  return (
    <>
      {header.isPlaceholder ? null : canSort ? (
        <button
          type="button"
          onClick={header.column.getToggleSortingHandler()}
          className="zen-w-full zen-h-full zen-px-2 zen-py-2 zen-inline-flex zen-items-center zen-gap-1 zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-inherit zen-font-inherit focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset"
        >
          {flexRender(header.column.columnDef.header, header.getContext())}
          <SortIndicator state={sorted} />
        </button>
      ) : (
        <span className="zen-px-2 zen-py-2 zen-inline-flex zen-items-center zen-gap-1">
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
          /* stopPropagation on pointer events too, so dragging the
           * resize handle doesn't also activate the column-reorder
           * drag listener attached to the outer cell. */
          onPointerDown={(e) => e.stopPropagation()}
          className={cn(
            "zen-absolute zen-right-0 zen-top-0 zen-h-full zen-w-1.5 zen-cursor-col-resize zen-select-none zen-touch-none",
            "zen-bg-transparent zen-border-0 zen-p-0",
            "hover:zen-bg-zen-primary",
            isResizing && "zen-bg-zen-primary",
          )}
        />
      ) : null}
    </>
  );
}

/** Non-orderable header cell. Outer <div> applies pin styling + sort
 *  hover/active state. */
function VirtHeaderCell<TData, TValue>({
  header,
  pinStyle,
  enableColumnResizing,
  branded,
}: {
  header: import("@tanstack/react-table").Header<TData, TValue>;
  pinStyle?: React.CSSProperties;
  enableColumnResizing?: boolean;
  branded?: boolean;
}) {
  const canSort = header.column.getCanSort();
  const sorted = header.column.getIsSorted();
  return (
    <div
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
        "zen-text-sm zen-flex zen-items-center zen-transition-colors zen-relative",
        branded
          ? "zen-font-semibold zen-text-zen-primary-soft-fg"
          : "zen-font-medium zen-text-zen-muted-fg",
        canSort && "hover:zen-bg-zen-muted",
        "data-[active=true]:zen-bg-zen-primary-soft data-[active=true]:zen-text-zen-primary-soft-fg",
      )}
      style={{
        minWidth: 0,
        ...(pinStyle ?? {}),
        ...(pinStyle ? { zIndex: 2 } : {}),
      }}
    >
      <VirtHeaderCellInner
        header={header}
        enableColumnResizing={enableColumnResizing}
      />
    </div>
  );
}

/** Sortable header cell. Wraps the same content as VirtHeaderCell but
 *  attaches @dnd-kit's useSortable so the column header is draggable.
 *  Must be rendered inside a <SortableContext>. */
function VirtSortableHeaderCell<TData, TValue>({
  header,
  pinStyle,
  enableColumnResizing,
  branded,
}: {
  header: import("@tanstack/react-table").Header<TData, TValue>;
  pinStyle?: React.CSSProperties;
  enableColumnResizing?: boolean;
  branded?: boolean;
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: header.column.id });
  const canSort = header.column.getCanSort();
  const sorted = header.column.getIsSorted();
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      /* role/aria explicitly after the dnd-kit spread so they win over
       * useSortable's default `role="button"`. */
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
        "zen-text-sm zen-flex zen-items-center zen-transition-colors zen-relative",
        branded
          ? "zen-font-semibold zen-text-zen-primary-soft-fg"
          : "zen-font-medium zen-text-zen-muted-fg",
        canSort && "hover:zen-bg-zen-muted",
        "data-[active=true]:zen-bg-zen-primary-soft data-[active=true]:zen-text-zen-primary-soft-fg",
      )}
      style={{
        minWidth: 0,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        cursor: "grab",
        ...(pinStyle ?? {}),
        ...(pinStyle ? { zIndex: 2 } : {}),
      }}
    >
      <VirtHeaderCellInner
        header={header}
        enableColumnResizing={enableColumnResizing}
      />
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
  /* Unique ids so multiple <DataTable>s on the same page don't collide
   * on the "Rows per page" label association. */
  const pageSizeLabelId = React.useId();

  return (
    <div className="zen-flex zen-items-center zen-justify-between zen-gap-3 zen-text-sm">
      <div className="zen-text-zen-muted-fg">
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
      <div className="zen-flex zen-items-center zen-gap-3">
        {!manual && (
          <div className="zen-flex zen-items-center zen-gap-2">
            <span id={pageSizeLabelId} className="zen-text-zen-muted-fg">
              Rows per page
            </span>
            <div style={{ width: 88 }}>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => table.setPageSize(Number(v))}
              >
                <SelectTrigger aria-labelledby={pageSizeLabelId}>
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
        <div className="zen-flex zen-items-center zen-gap-1">
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
