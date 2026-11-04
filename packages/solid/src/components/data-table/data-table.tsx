import {
  type JSX,
  For,
  Show,
  createComputed,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  splitProps,
  useContext,
} from "solid-js";
import {
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Cell,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type ExpandedState,
  type FilterFn,
  type GroupingState,
  type Header,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Table as TanStackTable,
  type VisibilityState,
} from "@tanstack/solid-table";
import {
  createVirtualizer,
  defaultRangeExtractor,
  measureElement as measureRowElement,
  type Range,
} from "@tanstack/solid-virtual";
import {
  DragDropProvider,
  DragDropSensors,
  SortableProvider,
  closestCenter,
  createSortable,
  type DragEvent,
} from "@thisbeyond/solid-dnd";

import { ownsArrowKeys, rowKeyTarget } from "@algorisys/zen-ui-core/row-keys";
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
import { Select } from "../form/select/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { FilterCell, filterFnByVariant, type FilterVariant } from "./filters";
import {
  EditableCell,
  RowMoveContext,
  type CellEditPayload,
  type EditingState,
} from "./edit-cell";

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
  /**
   * The older virtualized body: a grid of divs, not the table, so it renders
   * differently and cannot group, expand sub-rows, reorder rows or take
   * keyboard navigation. Kept as it is for the tables already built on it;
   * new tables want `enableRowVirtualization`.
   */
  enableVirtualization?: boolean;
  /**
   * Render only the rows in view, inside the regular table: the same rows,
   * cells and features as an unvirtualized table (grouping, sub-rows,
   * keyboard navigation, editing, pinning, a sticky header, `fillHeight`),
   * for thousands of rows. Heights are measured, so group rows and expanded
   * sub-rows may differ from the rest. The rows scroll inside the table:
   * give it `fillHeight` or it is capped at `maxBodyHeight`. Columns keep
   * their widths as rows come and go (the table lays out from the header).
   * Wins over `enableVirtualization` when both are set.
   */
  enableRowVirtualization?: boolean;
  enableColumnOrdering?: boolean;
  onColumnOrderChange?: (order: string[]) => void;
  enableColumnResizing?: boolean;
  enablePerColumnFilters?: boolean;
  /**
   * Render the operator select beside each per-column text filter. Default
   * true. Turn it off when the server owns the predicate — an operator the
   * backend ignores is a control that lies about what it does.
   */
  enableFilterOperators?: boolean;
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

  /**
   * Rows take keyboard focus, with one tab stop for the whole table: ↑/↓,
   * Home/End and PageUp/PageDown move between rows (the key logic is
   * @algorisys/zen-ui-core/row-keys); Enter calls `onRowActivate`; with
   * `enableRowSelection`, Space toggles the row and Ctrl/Cmd+A every row on
   * the page. Keys with Alt are left alone (an app's own shortcuts), and so is
   * anything typed in a field, select or combobox inside a row.
   *
   * The plain body only, for now: a virtualized or row-ordering table ignores
   * it.
   */
  enableKeyboardNavigation?: boolean;
  /** Enter on a focused row. The event carries its modifiers, so Ctrl+Enter can mean something else. */
  onRowActivate?: (row: Row<TData>, event: KeyboardEvent) => void;
  /** A row's accessible name, read as focus moves onto it. */
  rowLabel?: (row: Row<TData>) => string;

  stickyHeader?: boolean;
  /**
   * Fill the parent's height: the rows scroll inside the table, under a header
   * that stays put, and the pager stays below. For a list that is the page's
   * main pane. The parent must give it a height (a flex child with min-height 0,
   * or a fixed height). Implies stickyHeader; maxBodyHeight is ignored.
   */
  fillHeight?: boolean;
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

/* ------------------------------- persisted state -------------------------- */
interface PersistedState {
  v: 1;
  columnOrder?: ColumnOrderState;
  columnSizing?: ColumnSizingState;
  columnVisibility?: VisibilityState;
  columnPinning?: ColumnPinningState;
}
const PERSIST_PREFIX = "zen-dt:";
function loadPersisted(key: string | undefined): PersistedState | null {
  if (!key || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PERSIST_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    return parsed && parsed.v === 1 ? parsed : null;
  } catch {
    return null;
  }
}
function savePersisted(key: string | undefined, snapshot: Omit<PersistedState, "v">) {
  if (!key || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PERSIST_PREFIX + key,
      JSON.stringify({ v: 1, ...snapshot } satisfies PersistedState),
    );
  } catch {
    // ignore
  }
}

/* ------------------------------- export helpers --------------------------- */
const headerLabel = (col: { id: string; columnDef: { header?: unknown } }): string =>
  typeof col.columnDef.header === "string" ? (col.columnDef.header as string) : col.id;

const csvEscape = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
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

/* ------------------------------- main component --------------------------- */
export function DataTable<TData, TValue = unknown>(rawProps: DataTableProps<TData, TValue>) {
  const [props] = splitProps(rawProps, [
    "data",
    "columns",
    "enableSorting",
    "enableMultiSort",
    "enablePagination",
    "enableColumnFilters",
    "enableRowSelection",
    "enableKeyboardNavigation",
    "onRowActivate",
    "rowLabel",
    "enableColumnVisibility",
    "enableVirtualization",
    "enableRowVirtualization",
    "enableColumnSeparators",
    "enableRowOrdering",
    "onRowOrderChange",
    "getRowId",
    "persistKey",
    "rowClassName",
    "renderBulkActions",
    "renderSubRow",
    "expanded",
    "onExpandedChange",
    "enableGrouping",
    "grouping",
    "initialGrouping",
    "onGroupingChange",
    "enableColumnOrdering",
    "onColumnOrderChange",
    "enableColumnResizing",
    "enablePerColumnFilters",
    "enableFilterOperators",
    "enableExport",
    "exportFilename",
    "exportOnlySelected",
    "stickyHeader",
    "enableColumnPinning",
    "columnPinning",
    "initialColumnPinning",
    "onColumnPinningChange",
    "onCellEdit",
    "headerVariant",
    "pageSize",
    "pageSizeOptions",
    "maxBodyHeight",
    "fillHeight",
    "rowEstimatedHeight",
    "globalFilterPlaceholder",
    "emptyMessage",
    "loading",
    "class",
    "manualPagination",
    "manualSorting",
    "manualFiltering",
    "sorting",
    "onSortingChange",
    "columnFilters",
    "onColumnFiltersChange",
    "rowSelection",
    "onRowSelectionChange",
    "columnVisibility",
    "onColumnVisibilityChange",
    "globalFilter",
    "onGlobalFilterChange",
  ]);

  // persistKey is a storage KEY, read once to load saved state. Re-reading it
  // reactively would mean the table reloading someone else's persisted layout
  // mid-session.
  // eslint-disable-next-line solid/reactivity
  const persisted = loadPersisted(props.persistKey);

  /* internal state */
  const [sortingInner, setSortingInner] = createSignal<SortingState>([]);
  const [filtersInner, setFiltersInner] = createSignal<ColumnFiltersState>([]);
  const [selectionInner, setSelectionInner] = createSignal<RowSelectionState>({});
  const [visibilityInner, setVisibilityInner] = createSignal<VisibilityState>(
    persisted?.columnVisibility ?? {},
  );
  const [globalFilterInner, setGlobalFilterInner] = createSignal("");
  const [paginationInner, setPaginationInner] = createSignal<PaginationState>({
    pageIndex: 0,
    // Seeds the INITIAL page size; the user owns it after that via the
    // page-size selector.
    // eslint-disable-next-line solid/reactivity
    pageSize: props.pageSize ?? 10,
  });
  const [columnOrder, setColumnOrder] = createSignal<ColumnOrderState>(
    persisted?.columnOrder ?? [],
  );
  const [columnSizing, setColumnSizing] = createSignal<ColumnSizingState>(
    persisted?.columnSizing ?? {},
  );
  const [columnPinningInner, setColumnPinningInner] = createSignal<ColumnPinningState>(
    persisted?.columnPinning ??
      props.initialColumnPinning ?? { left: [], right: [] },
  );
  const [expandedInner, setExpandedInner] = createSignal<ExpandedState>({});
  const [groupingInner, setGroupingInner] = createSignal<GroupingState>(
    props.initialGrouping ?? [],
  );

  const sorting = () => props.sorting ?? sortingInner();
  const filters = () => props.columnFilters ?? filtersInner();
  const selection = () => props.rowSelection ?? selectionInner();
  const visibility = () => props.columnVisibility ?? visibilityInner();
  const globalFilter = () => props.globalFilter ?? globalFilterInner();
  const columnPinning = () => props.columnPinning ?? columnPinningInner();
  const expanded = () => props.expanded ?? expandedInner();
  const grouping = () => props.grouping ?? groupingInner();

  const [editingCell, setEditingCell] = createSignal<EditingState | null>(null);
  const startEdit = (rowId: string, columnId: string) =>
    setEditingCell({ rowId, columnId });
  const commitEdit = (rowId: string, columnId: string, value: unknown) => {
    setEditingCell(null);
    props.onCellEdit?.({ rowId, columnId, value });
  };
  const cancelEdit = () => setEditingCell(null);

  /* feature gating */
  // The older div-grid body is the one that cannot group, expand or reorder;
  // row virtualization renders the regular table and keeps them. Its rows are
  // dragged by BodyTable itself rather than solid-dnd, which can drop only on
  // a mounted row.
  const rowVirtual = () => !!props.enableRowVirtualization;
  const legacyVirtual = () => !!props.enableVirtualization && !rowVirtual();
  const rowOrderingActive = () => !!props.enableRowOrdering && !legacyVirtual();
  const virtualRowDrag = () => rowOrderingActive() && rowVirtual();
  const groupingActive = () => !!props.enableGrouping && !legacyVirtual();
  const subRowActive = () => !!props.renderSubRow && !legacyVirtual();
  const expansionEnabled = () => subRowActive() || groupingActive();

  /* augmented columns: drag handle + expand toggle + select checkbox prepended
   *
   * eslint-disable solid/no-destructure -- these are TanStack ColumnDef
   * renderers, not Solid components. `cell: ({ row }) => …` destructures
   * TanStack's cell CONTEXT — a plain object it builds per render — and the rule
   * cannot tell that from a component destructuring reactive props, because both
   * are "an arrow function taking one destructured argument and returning JSX".
   * Rewriting them as `(ctx) => … ctx.row …` would obscure the API to satisfy a
   * false positive. Scoped to this factory, and re-enabled straight after.
   */
  /* eslint-disable solid/no-destructure */
  const augmentedColumns = createMemo<ColumnDef<TData, TValue>[]>(() => {
    const leading: ColumnDef<TData, TValue>[] = [];

    if (rowOrderingActive()) {
      leading.push({
        id: "__drag__",
        header: () => <span class="zen-sr-only">Reorder</span>,
        cell: ({ row }) => <DragHandle id={row.id} />,
        enableSorting: false,
        enableHiding: false,
        size: 32,
      });
    }

    if (expansionEnabled()) {
      leading.push({
        id: "__expand__",
        header: () => <span class="zen-sr-only">Expand</span>,
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => row.toggleExpanded()}
            aria-expanded={row.getIsExpanded()}
            aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
            class={cn(
              "zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6",
              "zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer",
              "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
              "zen-transition-transform",
              row.getIsExpanded() && "zen-rotate-90",
            )}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 32,
      });
    }

    if (props.enableRowSelection) {
      leading.push({
        id: "__select__",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={!table.getIsAllRowsSelected() && table.getIsSomeRowsSelected()}
            onChange={(v) => table.toggleAllRowsSelected(v)}
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onChange={(v) => row.toggleSelected(v)}
            aria-label={`Select row ${row.index + 1}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 36,
      });
    }

    const withVariantFilters: ColumnDef<TData, TValue>[] = props.columns.map((col) => {
      const meta = col.meta as { filterVariant?: FilterVariant } | undefined;
      if (meta?.filterVariant && !col.filterFn) {
        return {
          ...col,
          filterFn: filterFnByVariant[meta.filterVariant] as unknown as FilterFn<TData>,
        };
      }
      return col;
    });

    return [...leading, ...withVariantFilters];
  });
  /* eslint-enable solid/no-destructure */

  const table = createSolidTable<TData>({
    get data() {
      return props.data;
    },
    get columns() {
      return augmentedColumns();
    },
    state: {
      get sorting() {
        return sorting();
      },
      get columnFilters() {
        return filters();
      },
      get rowSelection() {
        return selection();
      },
      get columnVisibility() {
        return visibility();
      },
      get globalFilter() {
        return globalFilter();
      },
      get columnOrder() {
        return columnOrder();
      },
      get columnSizing() {
        return columnSizing();
      },
      get columnPinning() {
        return columnPinning();
      },
      get expanded() {
        return expanded();
      },
      get grouping() {
        return grouping();
      },
      get pagination() {
        if (props.manualPagination) {
          return {
            pageIndex: props.manualPagination.pageIndex,
            pageSize: props.manualPagination.pageSize ?? props.pageSize ?? 10,
          };
        }
        if (props.enablePagination) return paginationInner();
        return { pageIndex: 0, pageSize: props.data.length || 10 };
      },
    },
    get enableSorting() {
      return !!props.enableSorting;
    },
    get enableMultiSort() {
      return !!props.enableMultiSort;
    },
    get enableRowSelection() {
      return !!props.enableRowSelection;
    },
    get enableColumnFilters() {
      return !!(props.enableColumnFilters || props.enablePerColumnFilters);
    },
    get enableColumnResizing() {
      return !!props.enableColumnResizing;
    },
    columnResizeMode: "onChange",
    get enableColumnPinning() {
      return !!props.enableColumnPinning;
    },
    get enableGrouping() {
      return groupingActive();
    },
    get getRowId() {
      return props.getRowId;
    },
    get manualPagination() {
      return !!props.manualPagination;
    },
    get manualSorting() {
      return !!props.manualSorting;
    },
    get manualFiltering() {
      return !!props.manualFiltering;
    },
    get pageCount() {
      return props.manualPagination?.pageCount;
    },
    onColumnOrderChange: (updater) => {
      const next = typeof updater === "function" ? updater(columnOrder()) : updater;
      setColumnOrder(next);
      props.onColumnOrderChange?.(next);
    },
    onColumnSizingChange: (updater) => {
      const next = typeof updater === "function" ? updater(columnSizing()) : updater;
      setColumnSizing(next);
    },
    onColumnPinningChange: (updater) => {
      const next = typeof updater === "function" ? updater(columnPinning()) : updater;
      if (props.columnPinning === undefined) setColumnPinningInner(next);
      props.onColumnPinningChange?.(next);
    },
    onExpandedChange: (updater) => {
      const next = typeof updater === "function" ? updater(expanded()) : updater;
      if (props.expanded === undefined) setExpandedInner(next);
      props.onExpandedChange?.(next);
    },
    onGroupingChange: (updater) => {
      const next = typeof updater === "function" ? updater(grouping()) : updater;
      if (props.grouping === undefined) setGroupingInner(next);
      props.onGroupingChange?.(next);
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting()) : updater;
      if (props.sorting === undefined) setSortingInner(next);
      props.onSortingChange?.(next);
    },
    onColumnFiltersChange: (updater) => {
      const next = typeof updater === "function" ? updater(filters()) : updater;
      if (props.columnFilters === undefined) setFiltersInner(next);
      props.onColumnFiltersChange?.(next);
    },
    onRowSelectionChange: (updater) => {
      const next = typeof updater === "function" ? updater(selection()) : updater;
      if (props.rowSelection === undefined) setSelectionInner(next);
      props.onRowSelectionChange?.(next);
    },
    onColumnVisibilityChange: (updater) => {
      const next = typeof updater === "function" ? updater(visibility()) : updater;
      if (props.columnVisibility === undefined) setVisibilityInner(next);
      props.onColumnVisibilityChange?.(next);
    },
    onGlobalFilterChange: (next: string) => {
      if (props.globalFilter === undefined) setGlobalFilterInner(next);
      props.onGlobalFilterChange?.(next);
    },
    onPaginationChange: (updater) => {
      if (props.manualPagination) {
        const next =
          typeof updater === "function"
            ? updater({
                pageIndex: props.manualPagination.pageIndex,
                pageSize: props.manualPagination.pageSize ?? props.pageSize ?? 10,
              })
            : updater;
        props.manualPagination.onPageChange(next.pageIndex);
      } else {
        const next = typeof updater === "function" ? updater(paginationInner()) : updater;
        setPaginationInner(next);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    get getSortedRowModel() {
      return props.enableSorting && !props.manualSorting ? getSortedRowModel() : undefined;
    },
    get getFilteredRowModel() {
      return (props.enableColumnFilters || props.enablePerColumnFilters) &&
        !props.manualFiltering
        ? getFilteredRowModel()
        : undefined;
    },
    get getPaginationRowModel() {
      return props.enablePagination && !props.manualPagination
        ? getPaginationRowModel()
        : undefined;
    },
    get getExpandedRowModel() {
      return expansionEnabled() ? getExpandedRowModel() : undefined;
    },
    get getGroupedRowModel() {
      return groupingActive() ? getGroupedRowModel() : undefined;
    },
  });

  /* persistence sync */
  createEffect(() => {
    savePersisted(props.persistKey, {
      columnOrder: columnOrder(),
      columnSizing: columnSizing(),
      columnVisibility: visibility(),
      columnPinning: columnPinning(),
    });
  });

  /* dev warnings for unsupported feature combos with virtualization */
  onMount(() => {
    if (!legacyVirtual()) return;
    if (props.enableRowOrdering) {
      console.warn(
        "[DataTable] `enableRowOrdering` is not supported with `enableVirtualization`. Drag handle column hidden.",
      );
    }
    if (props.renderSubRow) {
      console.warn(
        "[DataTable] `renderSubRow` is not supported with `enableVirtualization`. Sub-rows won't render.",
      );
    }
    if (props.enableGrouping) {
      console.error(
        "[DataTable] `enableGrouping` is not supported with `enableVirtualization`. Disable virt to use grouping.",
      );
    }
  });

  const sepCellClass = () =>
    props.enableColumnSeparators ? "zen-border-r zen-border-zen-border last:zen-border-r-0" : "";
  const sepHeadClass = () =>
    props.enableColumnSeparators
      ? "[&>th]:zen-border-r [&>th]:zen-border-zen-border [&>th:last-child]:zen-border-r-0"
      : "";
  // Row virtualization scrolls the rows inside the table, so its header sticks.
  const stickyHeaderActive = () =>
    !!(props.stickyHeader || props.fillHeight || rowVirtual()) && !legacyVirtual();

  const pinStyle = (column: Column<TData, unknown>): JSX.CSSProperties | undefined => {
    if (!props.enableColumnPinning) return undefined;
    const pin = column.getIsPinned();
    if (!pin) return undefined;
    const isLastLeft = pin === "left" && column.getIsLastColumn("left");
    const isFirstRight = pin === "right" && column.getIsFirstColumn("right");
    return {
      position: "sticky",
      left: pin === "left" ? `${column.getStart("left")}px` : undefined,
      right: pin === "right" ? `${column.getAfter("right")}px` : undefined,
      background: "var(--zen-color-background)",
      "z-index": 1,
      "box-shadow": isLastLeft
        ? "inset -1px 0 0 var(--zen-color-border), 4px 0 6px -4px rgba(0,0,0,0.12)"
        : isFirstRight
          ? "inset 1px 0 0 var(--zen-color-border), -4px 0 6px -4px rgba(0,0,0,0.12)"
          : undefined,
    };
  };

  const headerStickyBg = () =>
    props.headerVariant === "branded"
      ? "var(--zen-color-primary-soft)"
      : "var(--zen-color-background)";

  const headerPinStyle = (column: Column<TData, unknown>): JSX.CSSProperties | undefined => {
    const ps = pinStyle(column);
    if (!ps) return undefined;
    return { ...ps, background: headerStickyBg() };
  };

  const headerVariantRowClass = () =>
    props.headerVariant === "branded"
      ? "zen-bg-zen-primary-soft [&>th]:zen-text-zen-primary-soft-fg [&>th]:zen-font-semibold"
      : "";
  const headerVariantTheadClass = () =>
    props.headerVariant === "underline"
      ? "[&_tr:last-child]:zen-border-b-2 [&_tr:last-child]:zen-border-zen-primary"
      : "";
  const stickyRowClass = () =>
    stickyHeaderActive()
      ? props.headerVariant === "branded"
        ? "zen-sticky zen-top-0 zen-z-10"
        : "zen-sticky zen-top-0 zen-z-10 zen-bg-zen-background"
      : "";

  const visibleColumnIds = createMemo(() =>
    table.getVisibleLeafColumns().map((c) => c.id),
  );

  const handleColumnDragEnd = (event: DragEvent) => {
    const { draggable, droppable } = event;
    if (!droppable || draggable.id === droppable.id) return;
    const ids = visibleColumnIds();
    const oldIndex = ids.indexOf(String(draggable.id));
    const newIndex = ids.indexOf(String(droppable.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(ids, oldIndex, newIndex);
    setColumnOrder(next);
    props.onColumnOrderChange?.(next);
  };

  const handleRowDragEnd = (event: DragEvent) => {
    const { draggable, droppable } = event;
    if (!droppable || draggable.id === droppable.id) return;
    const ids = table.getRowModel().rows.map((r) => r.id);
    const oldIndex = ids.indexOf(String(draggable.id));
    const newIndex = ids.indexOf(String(droppable.id));
    if (oldIndex < 0 || newIndex < 0) return;
    props.onRowOrderChange?.(arrayMove(ids, oldIndex, newIndex));
  };
  // A virtualized drag reports positions, not a solid-dnd event.
  const handleRowMove = (from: number, to: number) => {
    const ids = table.getRowModel().rows.map((r) => r.id);
    props.onRowOrderChange?.(arrayMove(ids, from, to));
  };

  const renderCellContent = (cell: Cell<TData, unknown>): JSX.Element => {
    if (cell.getIsGrouped()) {
      const row = cell.row;
      return (
        <div class="zen-inline-flex zen-items-center zen-gap-1.5">
          <button
            type="button"
            onClick={row.getToggleExpandedHandler()}
            aria-expanded={row.getIsExpanded()}
            aria-label={row.getIsExpanded() ? "Collapse group" : "Expand group"}
            class={cn(
              "zen-inline-flex zen-items-center zen-justify-center zen-h-5 zen-w-5 zen-rounded-zen-sm",
              "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-transition-transform",
              "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
              row.getIsExpanded() && "zen-rotate-90",
            )}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
          <span class="zen-font-medium">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </span>
          <span class="zen-text-xs zen-text-zen-muted-fg">({row.subRows.length})</span>
        </div>
      );
    }
    if (cell.getIsAggregated()) {
      return flexRender(
        cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
        cell.getContext(),
      );
    }
    if (cell.getIsPlaceholder()) return null as unknown as JSX.Element;
    return flexRender(cell.column.columnDef.cell, cell.getContext());
  };

  return (
    <div
      class={cn(
        "zen-space-y-3",
        props.fillHeight && "zen-flex zen-h-full zen-min-h-0 zen-flex-col [&>*]:zen-shrink-0",
        props.class,
      )}
    >
      <Toolbar
        table={table}
        enableColumnFilters={!!props.enableColumnFilters}
        enableColumnVisibility={!!props.enableColumnVisibility}
        enableColumnPinning={!!props.enableColumnPinning}
        enableGrouping={groupingActive()}
        enableExport={!!props.enableExport}
        exportFilename={props.exportFilename ?? "data-table"}
        exportOnlySelected={!!props.exportOnlySelected}
        globalFilter={globalFilter()}
        globalFilterPlaceholder={props.globalFilterPlaceholder ?? "Search…"}
        onGlobalFilterChange={(v) => {
          if (props.globalFilter === undefined) setGlobalFilterInner(v);
          props.onGlobalFilterChange?.(v);
        }}
      />
      <BulkActionBar table={table} renderBulkActions={props.renderBulkActions} />
      <ActiveFilterChips table={table} />

      <div
        class={cn(
          "zen-rounded-zen-md zen-border zen-border-zen-border",
          props.fillHeight && "!zen-shrink zen-flex zen-min-h-0 zen-flex-1 zen-flex-col",
        )}
        aria-busy={props.loading || undefined}
      >
        <Show
          when={legacyVirtual()}
          fallback={
            <Show
              when={rowOrderingActive() && !virtualRowDrag()}
              fallback={
                <BodyTable
                  table={table}
                  loading={!!props.loading}
                  emptyMessage={props.emptyMessage ?? "No results."}
                  maxBodyHeight={props.maxBodyHeight ?? 480}
                  fillHeight={!!props.fillHeight}
                  stickyHeaderActive={stickyHeaderActive()}
                  sepHeadClass={sepHeadClass()}
                  sepCellClass={sepCellClass()}
                  stickyRowClass={stickyRowClass()}
                  headerVariantThead={headerVariantTheadClass()}
                  headerVariantRow={headerVariantRowClass()}
                  headerStickyBg={headerStickyBg()}
                  headerPinStyle={headerPinStyle}
                  pinStyle={pinStyle}
                  enableColumnResizing={!!props.enableColumnResizing}
                  enableColumnOrdering={!!props.enableColumnOrdering}
                  enablePerColumnFilters={!!props.enablePerColumnFilters}
                  filterOperators={props.enableFilterOperators !== false}
                  visibleColumnIds={visibleColumnIds()}
                  onColumnDragEnd={handleColumnDragEnd}
                  editingCell={editingCell()}
                  startEdit={startEdit}
                  commitEdit={commitEdit}
                  cancelEdit={cancelEdit}
                  rowClassName={props.rowClassName}
                  renderCell={renderCellContent}
                  expansionEnabled={virtualRowDrag() ? false : expansionEnabled()}
                  renderSubRow={virtualRowDrag() ? undefined : props.renderSubRow}
                  rowDrag={virtualRowDrag()}
                  onRowMove={handleRowMove}
                  keyboard={!!props.enableKeyboardNavigation}
                  selectable={!!props.enableRowSelection}
                  onRowActivate={props.onRowActivate}
                  rowLabel={props.rowLabel}
                  virtualize={rowVirtual()}
                  estimatedRowHeight={props.rowEstimatedHeight}
                />
              }
            >
              <DragDropProvider
                collisionDetector={closestCenter}
                onDragEnd={handleRowDragEnd}
              >
                <DragDropSensors />
                <SortableProvider ids={table.getRowModel().rows.map((r) => r.id)}>
                  <BodyTable
                    table={table}
                    loading={!!props.loading}
                    emptyMessage={props.emptyMessage ?? "No results."}
                    maxBodyHeight={props.maxBodyHeight ?? 480}
                    fillHeight={!!props.fillHeight}
                    stickyHeaderActive={stickyHeaderActive()}
                    sepHeadClass={sepHeadClass()}
                    sepCellClass={sepCellClass()}
                    stickyRowClass={stickyRowClass()}
                    headerVariantThead={headerVariantTheadClass()}
                    headerVariantRow={headerVariantRowClass()}
                    headerStickyBg={headerStickyBg()}
                    headerPinStyle={headerPinStyle}
                    pinStyle={pinStyle}
                    enableColumnResizing={!!props.enableColumnResizing}
                    enableColumnOrdering={!!props.enableColumnOrdering}
                    enablePerColumnFilters={!!props.enablePerColumnFilters}
                  filterOperators={props.enableFilterOperators !== false}
                    visibleColumnIds={visibleColumnIds()}
                    onColumnDragEnd={handleColumnDragEnd}
                    editingCell={editingCell()}
                    startEdit={startEdit}
                    commitEdit={commitEdit}
                    cancelEdit={cancelEdit}
                    rowClassName={props.rowClassName}
                    renderCell={renderCellContent}
                    expansionEnabled={false}
                    renderSubRow={undefined}
                    rowOrderingActive
                  />
                </SortableProvider>
              </DragDropProvider>
            </Show>
          }
        >
          <VirtualizedBody
            table={table}
            maxHeight={props.maxBodyHeight ?? 480}
            estimatedRowHeight={props.rowEstimatedHeight ?? 44}
            emptyMessage={props.emptyMessage ?? "No results."}
            loading={!!props.loading}
            enableColumnPinning={!!props.enableColumnPinning}
            enableColumnResizing={!!props.enableColumnResizing}
            enableColumnOrdering={!!props.enableColumnOrdering}
            enablePerColumnFilters={!!props.enablePerColumnFilters}
            filterOperators={props.enableFilterOperators !== false}
            visibleColumnIds={visibleColumnIds()}
            onColumnDragEnd={handleColumnDragEnd}
            editingCell={editingCell()}
            onStartEdit={startEdit}
            onCommitEdit={commitEdit}
            onCancelEdit={cancelEdit}
            rowClassName={props.rowClassName}
            headerVariant={props.headerVariant ?? "plain"}
            pinStyle={pinStyle}
            headerPinStyle={headerPinStyle}
            headerStickyBg={headerStickyBg()}
          />
        </Show>
      </div>

      <Show when={props.enablePagination || props.manualPagination}>
        <PaginationBar
          table={table}
          enableRowSelection={!!props.enableRowSelection}
          pageSizeOptions={props.pageSizeOptions ?? [10, 20, 50, 100]}
          manual={!!props.manualPagination}
        />
      </Show>
    </div>
  );
}

/* ------------------------------- Toolbar --------------------------------- */
function Toolbar<TData>(props: {
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
  const show = () =>
    props.enableColumnFilters ||
    props.enableColumnVisibility ||
    props.enableGrouping ||
    props.enableExport;
  return (
    <Show when={show()}>
      <div class="zen-flex zen-items-center zen-gap-2">
        <Show when={props.enableColumnFilters}>
          <Input
            value={props.globalFilter}
            onInput={(e) => props.onGlobalFilterChange(e.currentTarget.value)}
            placeholder={props.globalFilterPlaceholder}
            class="zen-max-w-xs"
          />
        </Show>
        <div class="zen-ml-auto zen-flex zen-items-center zen-gap-2">
          <Show when={props.enableExport}>
            <ExportMenu
              table={props.table}
              filename={props.exportFilename}
              onlySelected={props.exportOnlySelected}
            />
          </Show>
          <Show when={props.enableGrouping}>
            <GroupByMenu table={props.table} />
          </Show>
          <Show when={props.enableColumnVisibility}>
            <ColumnsMenu table={props.table} enableColumnPinning={props.enableColumnPinning} />
          </Show>
        </div>
      </div>
    </Show>
  );
}

/* ------------------------------- GroupByMenu ----------------------------- */
function GroupByMenu<TData>(props: { table: TanStackTable<TData> }) {
  const groupable = createMemo(() => props.table.getAllColumns().filter((c) => c.getCanGroup()));
  const activeCount = () => props.table.getState().grouping.length;
  return (
    <Show when={groupable().length > 0}>
      <DropdownMenu>
        <DropdownMenuTrigger as={Button} variant="outline" color="neutral" size="sm">
          {activeCount() ? `Group by (${activeCount()})` : "Group by"}
        </DropdownMenuTrigger>
        <DropdownMenuContent class="zen-min-w-44">
          <DropdownMenuLabel>Group rows by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <For each={groupable()}>
            {(column) => {
              const label =
                typeof column.columnDef.header === "string"
                  ? (column.columnDef.header as string)
                  : column.id;
              return (
                <DropdownMenuCheckboxItem
                  checked={column.getIsGrouped()}
                  onChange={() => column.toggleGrouping()}
                >
                  {label}
                </DropdownMenuCheckboxItem>
              );
            }}
          </For>
        </DropdownMenuContent>
      </DropdownMenu>
    </Show>
  );
}

/* ------------------------------- BulkActionBar --------------------------- */
function BulkActionBar<TData>(props: {
  table: TanStackTable<TData>;
  renderBulkActions?: (ctx: {
    table: TanStackTable<TData>;
    rows: Row<TData>[];
    clear: () => void;
  }) => JSX.Element;
}) {
  const selectedRows = () => props.table.getSelectedRowModel().rows;
  const selectedCount = () => selectedRows().length;
  return (
    <Show when={selectedCount() > 0 && props.renderBulkActions}>
      {(() => {
        const filtered = () => props.table.getFilteredRowModel().rows;
        const totalFiltered = () => filtered().length;
        const allFilteredSelected = () => selectedCount() === totalFiltered();
        const allPageRowsSelected = () => props.table.getIsAllPageRowsSelected();
        const moreOffPage = () => totalFiltered() > selectedCount();
        const showCrossPage = () =>
          allPageRowsSelected() && !allFilteredSelected() && moreOffPage();
        const clear = () => props.table.resetRowSelection();
        const selectAllMatching = () => {
          const next: RowSelectionState = {};
          filtered().forEach((r) => (next[r.id] = true));
          props.table.setRowSelection(next);
        };
        return (
          <div
            class={cn(
              "zen-flex zen-items-center zen-gap-3 zen-px-3 zen-py-2",
              "zen-rounded-zen-md zen-bg-zen-primary-soft zen-border zen-border-zen-primary-soft",
              "zen-text-zen-primary-soft-fg",
            )}
            role="toolbar"
            aria-label="Bulk actions for selected rows"
          >
            <span class="zen-text-sm zen-font-medium" aria-live="polite" aria-atomic="true">
              {selectedCount()} selected
            </span>
            <Show when={showCrossPage()}>
              <button
                type="button"
                onClick={selectAllMatching}
                class={cn(
                  "zen-text-xs zen-underline zen-underline-offset-2",
                  "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-inherit",
                  "hover:zen-opacity-80",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
                )}
              >
                Select all {totalFiltered()} matching
              </button>
            </Show>
            <div class="zen-ml-auto zen-flex zen-items-center zen-gap-2">
              {props.renderBulkActions!({ table: props.table, rows: selectedRows(), clear })}
              <button
                type="button"
                onClick={clear}
                aria-label="Clear selection"
                class={cn(
                  "zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6",
                  "zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer",
                  "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring",
                )}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        );
      })()}
    </Show>
  );
}

/* ------------------------------- ActiveFilterChips ----------------------- */
function ActiveFilterChips<TData>(props: { table: TanStackTable<TData> }) {
  const colFilters = () => props.table.getState().columnFilters;
  const globalFilter = () => (props.table.getState().globalFilter ?? "") as string;
  const hasGlobal = () => globalFilter().length > 0;
  const anyActive = () => colFilters().length > 0 || hasGlobal();

  const labelForColumn = (id: string): string => {
    const col = props.table.getColumn(id);
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
          contains: "≈", equals: "=", starts: "a…", ends: "…a",
          eq: "=", ne: "≠", gt: ">", lt: "<", gte: "≥", lte: "≤",
        };
        return `${symbols[v.op] ?? v.op} ${v.value}`;
      }
      return "";
    }
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  return (
    <Show when={anyActive()}>
      <div class="zen-flex zen-flex-wrap zen-items-center zen-gap-2" role="group" aria-label="Active filters">
        <span class="zen-text-xs zen-text-zen-muted-fg">Filters:</span>
        <Show when={hasGlobal()}>
          <Chip
            label={`Search: ${globalFilter()}`}
            onRemove={() => props.table.setGlobalFilter("")}
          />
        </Show>
        <For each={colFilters()}>
          {(f) => {
            const formatted = formatValue(f.value);
            return (
              <Show when={formatted}>
                <Chip
                  label={`${labelForColumn(f.id)}: ${formatted}`}
                  onRemove={() => props.table.getColumn(f.id)?.setFilterValue(undefined)}
                />
              </Show>
            );
          }}
        </For>
        <button
          type="button"
          onClick={() => {
            props.table.resetColumnFilters();
            props.table.setGlobalFilter("");
          }}
          class={cn(
            "zen-ml-1 zen-inline-flex zen-items-center zen-text-xs zen-px-2 zen-py-0.5 zen-rounded-zen-sm",
            "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
            "zen-bg-transparent zen-border-0 zen-cursor-pointer",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          )}
        >
          Clear all
        </button>
      </div>
    </Show>
  );
}

function Chip(props: { label: string; onRemove: () => void }) {
  return (
    <span
      class={cn(
        "zen-inline-flex zen-items-center zen-gap-1 zen-px-2 zen-py-0.5",
        "zen-text-xs zen-font-medium",
        "zen-rounded-zen-full zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
        "zen-border zen-border-zen-primary-soft",
      )}
    >
      <span>{props.label}</span>
      <button
        type="button"
        onClick={() => props.onRemove()}
        aria-label={`Remove ${props.label}`}
        class={cn(
          "zen-inline-flex zen-items-center zen-justify-center",
          "zen-h-4 zen-w-4 zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer",
          "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10",
          "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring",
        )}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </span>
  );
}

/* ------------------------------- ExportMenu ------------------------------ */
function ExportMenu<TData>(props: {
  table: TanStackTable<TData>;
  filename: string;
  onlySelected: boolean;
}) {
  const rowsForExport = () => {
    const rows = props.onlySelected
      ? props.table.getSelectedRowModel().rows
      : props.table.getFilteredRowModel().rows;
    if (props.onlySelected && rows.length === 0) {
      return props.table.getFilteredRowModel().rows;
    }
    return rows;
  };
  const visibleColumns = () =>
    props.table.getVisibleLeafColumns().filter((c) => !c.id.startsWith("__"));

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
      `${props.filename}.json`,
    );
  };

  const exportCsv = () => {
    const cols = visibleColumns();
    const rows = rowsForExport();
    const header = cols.map((c) => csvEscape(headerLabel(c))).join(",");
    const body = rows
      .map((row) => cols.map((col) => csvEscape(row.getValue(col.id))).join(","))
      .join("\n");
    downloadBlob(
      new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" }),
      `${props.filename}.csv`,
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger as={Button} variant="outline" color="neutral" size="sm">
        Export
      </DropdownMenuTrigger>
      <DropdownMenuContent class="zen-min-w-44">
        <DropdownMenuLabel>
          Export {props.onlySelected ? "selected" : "visible"} rows
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={exportCsv}>CSV (.csv)</DropdownMenuItem>
        <DropdownMenuItem onSelect={exportJson}>JSON (.json)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------- ColumnsMenu ----------------------------- */
function ColumnsMenu<TData>(props: {
  table: TanStackTable<TData>;
  enableColumnPinning?: boolean;
}) {
  const hideable = () => props.table.getAllColumns().filter((c) => c.getCanHide());
  return (
    <Show when={hideable().length > 0}>
      <DropdownMenu>
        <DropdownMenuTrigger as={Button} variant="outline" color="neutral" size="sm">
          Columns
        </DropdownMenuTrigger>
        <DropdownMenuContent class="zen-min-w-56">
          <DropdownMenuLabel>
            {props.enableColumnPinning ? "Manage columns" : "Toggle columns"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <For each={hideable()}>
            {(column) => {
              const label = () =>
                typeof column.columnDef.header === "string"
                  ? (column.columnDef.header as string)
                  : column.id;
              return (
                <Show
                  when={props.enableColumnPinning}
                  fallback={
                    <DropdownMenuCheckboxItem
                      checked={column.getIsVisible()}
                      onChange={(v) => column.toggleVisibility(v)}
                    >
                      {label()}
                    </DropdownMenuCheckboxItem>
                  }
                >
                  <div class="zen-flex zen-items-center zen-gap-2 zen-px-2 zen-py-1.5 zen-text-sm">
                    <Checkbox
                      checked={column.getIsVisible()}
                      onChange={(v) => column.toggleVisibility(v)}
                      aria-label={`Toggle visibility of ${label()}`}
                    />
                    <span class="zen-flex-1 zen-truncate">{label()}</span>
                    <PinButton
                      active={column.getIsPinned() === "left"}
                      side="left"
                      label={label()}
                      onClick={(e) => {
                        e.preventDefault();
                        column.pin(column.getIsPinned() === "left" ? false : "left");
                      }}
                    />
                    <PinButton
                      active={column.getIsPinned() === "right"}
                      side="right"
                      label={label()}
                      onClick={(e) => {
                        e.preventDefault();
                        column.pin(column.getIsPinned() === "right" ? false : "right");
                      }}
                    />
                  </div>
                </Show>
              );
            }}
          </For>
        </DropdownMenuContent>
      </DropdownMenu>
    </Show>
  );
}

function PinButton(props: {
  active: boolean;
  side: "left" | "right";
  label: string;
  onClick: (e: MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => props.onClick(e)}
      aria-label={
        props.active ? `Unpin ${props.label} from ${props.side}` : `Pin ${props.label} to ${props.side}`
      }
      aria-pressed={props.active}
      title={props.active ? `Unpin from ${props.side}` : `Pin to ${props.side}`}
      class={cn(
        "zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6 zen-rounded-zen-sm",
        "zen-border-0 zen-cursor-pointer zen-text-xs",
        props.active
          ? "zen-bg-zen-primary zen-text-zen-primary-fg"
          : "zen-bg-transparent zen-text-zen-muted-fg hover:zen-bg-zen-muted hover:zen-text-zen-foreground",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      )}
    >
      {props.side === "left" ? "◀" : "▶"}
    </button>
  );
}

/* ------------------------------- Body table (non-virt) ------------------- */
interface BodyTableProps<TData> {
  table: TanStackTable<TData>;
  loading: boolean;
  emptyMessage: string;
  maxBodyHeight: number;
  fillHeight: boolean;
  stickyHeaderActive: boolean;
  sepHeadClass: string;
  sepCellClass: string;
  stickyRowClass: string;
  headerVariantThead: string;
  headerVariantRow: string;
  headerStickyBg: string;
  headerPinStyle: (col: Column<TData, unknown>) => JSX.CSSProperties | undefined;
  pinStyle: (col: Column<TData, unknown>) => JSX.CSSProperties | undefined;
  enableColumnResizing: boolean;
  enableColumnOrdering: boolean;
  enablePerColumnFilters: boolean;
  filterOperators: boolean;
  visibleColumnIds: string[];
  onColumnDragEnd: (e: DragEvent) => void;
  editingCell: EditingState | null;
  startEdit: (rowId: string, columnId: string) => void;
  commitEdit: (rowId: string, columnId: string, value: unknown) => void;
  cancelEdit: () => void;
  rowClassName?: (row: Row<TData>) => string | undefined;
  renderCell: (cell: Cell<TData, unknown>) => JSX.Element;
  expansionEnabled: boolean;
  renderSubRow?: (row: Row<TData>) => JSX.Element;
  rowOrderingActive?: boolean;
  keyboard?: boolean;
  selectable?: boolean;
  onRowActivate?: (row: Row<TData>, event: KeyboardEvent) => void;
  rowLabel?: (row: Row<TData>) => string;
  /** Render only the rows in view (enableRowVirtualization). Fixed for the table's life. */
  virtualize?: boolean;
  estimatedRowHeight?: number;
  /** Drag rows by their handle, virtualized: see startDrag. */
  rowDrag?: boolean;
  onRowMove?: (from: number, to: number) => void;
}

/** One rendered body row when virtualized: a data row, or the panel an expanded row opens. */
interface BodyItem<TData> {
  kind: "row" | "sub";
  row: Row<TData>;
}

function BodyTable<TData>(props: BodyTableProps<TData>) {
  const rows = () => props.table.getRowModel().rows;
  const colCount = () => props.table.getAllLeafColumns().length;

  // Virtualized, the body is a flat list of items, an expanded row's panel
  // being an item of its own so it is measured on its own. The wrappers are
  // cached per Row so an unchanged row keeps its item, and its DOM, across a
  // recompute, the way <For each={rows()}> keeps it below.
  const itemCache = new WeakMap<Row<TData>, { row?: BodyItem<TData>; sub?: BodyItem<TData> }>();
  const itemFor = (kind: "row" | "sub", row: Row<TData>): BodyItem<TData> => {
    let entry = itemCache.get(row);
    if (!entry) itemCache.set(row, (entry = {}));
    return (entry[kind] ??= { kind, row });
  };
  const items = createMemo<BodyItem<TData>[]>(() => {
    if (!props.virtualize) return [];
    const out: BodyItem<TData>[] = [];
    for (const row of rows()) {
      out.push(itemFor("row", row));
      if (props.expansionEnabled && props.renderSubRow && row.getIsExpanded() && !row.getIsGrouped()) {
        out.push(itemFor("sub", row));
      }
    }
    return out;
  });
  // Where a row sits, by id: its index among the rows (the keyboard's) and
  // among the items (the virtualizer's).
  const positions = createMemo(() => {
    const rowIndex = new Map<string, number>();
    const itemIndex = new Map<string, number>();
    if (!props.virtualize) return { rowIndex, itemIndex };
    rows().forEach((r, i) => rowIndex.set(r.id, i));
    items().forEach((it, i) => it.kind === "row" && itemIndex.set(it.row.id, i));
    return { rowIndex, itemIndex };
  });
  const headerRowCount = () =>
    props.table.getHeaderGroups().length * (props.enablePerColumnFilters ? 2 : 1);
  let tableEl: HTMLTableElement | undefined;
  let virtual: VirtualRowsApi | undefined;
  /** True while VirtualRows is updating the DOM: see RowMoveContext. */
  const rowMove = { moving: false };

  // Keyboard rows: a roving tabindex, so the table is one tab stop and the
  // arrows move within it. The index is clamped when the rows change under
  // it (a new page, a filter), so there is always exactly one tab stop.
  const [focusIndex, setFocusIndex] = createSignal(0);
  const tabStop = () => Math.min(focusIndex(), Math.max(rows().length - 1, 0));
  const rowRefs = new Map<string, HTMLTableRowElement>();
  // Virtualized, the row the keys move to may not be mounted yet: it is
  // scrolled into view, and focused by its ref when it arrives.
  let pendingFocus: string | null = null;
  // Once the rows it passed are measured, the focused row may sit a little
  // off from where the jump put it: nudge the scroller (only the scroller;
  // scrollIntoView would scroll the page too) so the row is whole, below the
  // sticky header.
  const keepInView = (id: string) => {
    const el = rowRefs.get(id);
    const scroller = tableEl?.parentElement;
    if (!el || !scroller || document.activeElement !== el) return;
    const top = tableEl?.tHead?.getBoundingClientRect().bottom ?? scroller.getBoundingClientRect().top;
    const bottom = scroller.getBoundingClientRect().top + scroller.clientHeight;
    const r = el.getBoundingClientRect();
    if (r.top < top) scroller.scrollTop -= top - r.top;
    else if (r.bottom > bottom) scroller.scrollTop += r.bottom - bottom;
  };
  const focusRow = (id: string) => {
    if (!virtual) {
      rowRefs.get(id)?.focus();
      return;
    }
    const itemIndex = positions().itemIndex.get(id);
    if (itemIndex !== undefined) virtual.scrollToItem(itemIndex);
    const el = rowRefs.get(id);
    if (el) el.focus({ preventScroll: true });
    else pendingFocus = id;
    requestAnimationFrame(() => requestAnimationFrame(() => keepInView(id)));
  };
  const onRowKeyDown = (e: KeyboardEvent, row: Row<TData>, index: number) => {
    if (e.altKey || ownsArrowKeys(e.target)) return;
    const onRow = e.target === e.currentTarget;
    const to = rowKeyTarget(e.key, index, rows().length);
    if (to !== null) {
      e.preventDefault();
      const next = rows()[to];
      if (!next) return;
      setFocusIndex(to);
      focusRow(next.id);
      return;
    }
    // The rest act on the row itself: on a link or a button inside it, Enter
    // and Space are that control's.
    if (!onRow) return;
    if (e.key === "Enter" && props.onRowActivate) {
      e.preventDefault();
      props.onRowActivate(row, e);
    } else if (e.key === " " && props.selectable && row.getCanSelect()) {
      e.preventDefault();
      row.toggleSelected();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a" && props.selectable) {
      e.preventDefault();
      props.table.toggleAllPageRowsSelected(!props.table.getIsAllPageRowsSelected());
    }
  };

  // Dragging rows, virtualized. solid-dnd can drop only onto a mounted row and
  // most are not, so the drop position comes from the virtualizer's layout,
  // the table scrolls itself while the pointer is near its top or bottom edge,
  // and the dragged row stays mounted. Esc cancels. Everything a drag adds to
  // the window is removed when it ends, or when the table goes.
  const [dragId, setDragId] = createSignal<string | null>(null);
  /** Where the dragged row would land: before the row at this index (rows.length: after the last). */
  const [dropIndex, setDropIndex] = createSignal<number | null>(null);
  let stopDrag: (() => void) | undefined;
  onCleanup(() => stopDrag?.());
  const startDrag = (rowId: string, e: PointerEvent) => {
    const scroller = tableEl?.parentElement;
    if (e.button !== 0 || !virtual || !scroller) return;
    e.preventDefault(); // no text selection, no compatibility mouse events
    stopDrag?.();
    const api = virtual;
    let pointerY = e.clientY;
    let frame = 0;
    const band = () => {
      const rect = scroller.getBoundingClientRect();
      const top = tableEl?.tHead?.getBoundingClientRect().bottom ?? rect.top;
      return { rect, top, bottom: rect.top + scroller.clientHeight };
    };
    const locate = () => {
      const { rect, top, bottom } = band();
      const y = Math.min(Math.max(pointerY, top), bottom - 1);
      const offset = scroller.scrollTop + (y - rect.top);
      const hit = api.itemAt(offset);
      if (!hit) return;
      // No expanded panels while rows are dragged, so items are rows.
      setDropIndex(offset > (hit.start + hit.end) / 2 ? hit.index + 1 : hit.index);
    };
    // Near an edge the table scrolls, faster the further past it the pointer is.
    const EDGE = 40;
    const tick = () => {
      const { top, bottom } = band();
      const over =
        pointerY < top + EDGE ? pointerY - (top + EDGE) : pointerY > bottom - EDGE ? pointerY - (bottom - EDGE) : 0;
      if (over) {
        scroller.scrollTop += Math.max(-200, Math.min(200, Math.round(over / 3) || Math.sign(over)));
        locate();
      }
      frame = requestAnimationFrame(tick);
    };
    const finish = (commit: boolean) => {
      const from = positions().rowIndex.get(rowId);
      const to = dropIndex();
      stop();
      if (!commit || from === undefined || to === null) return;
      const target = to > from ? to - 1 : to;
      if (target !== from) props.onRowMove?.(from, target);
    };
    const onMove = (ev: PointerEvent) => {
      pointerY = ev.clientY;
      locate();
    };
    const onUp = () => finish(true);
    const onCancel = () => finish(false);
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key !== "Escape") return;
      ev.preventDefault();
      ev.stopPropagation();
      finish(false);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey, true);
      setDragId(null);
      setDropIndex(null);
      stopDrag = undefined;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey, true);
    stopDrag = stop;
    setDragId(rowId);
    locate();
    frame = requestAnimationFrame(tick);
  };
  const dropEdge = (index: number): "before" | "after" | undefined => {
    const at = dropIndex();
    if (at === null) return undefined;
    if (at === index) return "before";
    return at === rows().length && index === rows().length - 1 ? "after" : undefined;
  };
  const dropShadow = (index: number): JSX.CSSProperties | undefined => {
    const edge = dropEdge(index);
    if (!edge) return undefined;
    return { "box-shadow": `inset 0 ${edge === "before" ? 2 : -2}px 0 0 var(--zen-color-primary)` };
  };

  // Virtualized, some rows stay mounted wherever the scroll is: the keyboard's
  // tab stop, so the table never loses its one tab stop or the focus it holds;
  // the row being edited, so a half-typed value is not thrown away; and the
  // row being dragged.
  const keepMounted = createMemo(() => {
    if (!props.virtualize) return [];
    const { itemIndex } = positions();
    const keep: number[] = [];
    const stop = rows()[tabStop()];
    if (props.keyboard && stop) keep.push(itemIndex.get(stop.id) ?? -1);
    const editing = props.editingCell?.rowId;
    if (editing !== undefined) keep.push(itemIndex.get(editing) ?? -1);
    const dragged = dragId();
    if (dragged !== null) keep.push(itemIndex.get(dragged) ?? -1);
    return keep.filter((i) => i >= 0);
  });

  // One data row and the panel an expanded row opens, shared by the plain and
  // the virtualized body. Virtualized, each is measured and numbered.
  type VirtRow = { index: number; measure: (el: Element) => void };
  // Solid runs a ref before the row has its attributes or is in the
  // document. The virtualizer reads the index from data-index, and a row
  // measured while detached is 0px tall, which makes every row "fit" and
  // mounts them all. So the row is measured once it is in place.
  const measureRow = (el: HTMLTableRowElement, virt: VirtRow | undefined) => {
    if (!virt) return;
    queueMicrotask(() => {
      if (el.isConnected) virt.measure(el);
    });
  };
  const dataRow = (row: Row<TData>, index: () => number, virt?: VirtRow) => (
    <TableRow
      ref={(el: HTMLTableRowElement) => {
        measureRow(el, virt);
        if (!props.keyboard) return;
        rowRefs.set(row.id, el);
        onCleanup(() => { if (rowRefs.get(row.id) === el) rowRefs.delete(row.id); });
        if (pendingFocus === row.id) {
          pendingFocus = null;
          queueMicrotask(() => el.focus({ preventScroll: true }));
        }
      }}
      data-index={virt?.index}
      aria-rowindex={virt ? headerRowCount() + virt.index + 1 : undefined}
      tabIndex={props.keyboard ? (index() === tabStop() ? 0 : -1) : undefined}
      aria-label={props.keyboard ? props.rowLabel?.(row) : undefined}
      aria-selected={props.keyboard && props.selectable ? (row.getIsSelected() ? "true" : "false") : undefined}
      onKeyDown={props.keyboard ? (e: KeyboardEvent) => onRowKeyDown(e, row, index()) : undefined}
      onFocusIn={props.keyboard ? () => setFocusIndex(index()) : undefined}
      data-state={row.getIsSelected() ? "selected" : undefined}
      data-grouped={row.getIsGrouped() ? "true" : undefined}
      data-dragging={props.rowDrag && dragId() === row.id ? "true" : undefined}
      data-drop={props.rowDrag ? dropEdge(index()) : undefined}
      class={cn(
        row.getIsGrouped() && "zen-bg-zen-muted/40 zen-font-medium",
        props.rowDrag && dragId() === row.id && "zen-opacity-50",
        props.keyboard &&
          "focus-visible:zen-outline focus-visible:zen-outline-2 focus-visible:-zen-outline-offset-2 focus-visible:zen-outline-zen-ring",
        props.rowClassName?.(row),
      )}
    >
      <For each={row.getVisibleCells()}>
        {(cell) => {
          const pin = props.pinStyle(cell.column);
          const isEditing = () =>
            props.editingCell?.rowId === row.id &&
            props.editingCell?.columnId === cell.column.id;
          const isInteractive = () =>
            !cell.getIsGrouped() &&
            !cell.getIsAggregated() &&
            !cell.getIsPlaceholder();
          // The drop line is drawn on the cells: a row's own box-shadow is not
          // painted in a collapsed-border table.
          const style = () => (props.rowDrag ? { ...pin, ...dropShadow(index()) } : pin);
          return (
            <TableCell class={props.sepCellClass} style={style()}>
              <Show
                when={isInteractive()}
                fallback={props.renderCell(cell)}
              >
                <EditableCell
                  cell={cell}
                  editing={isEditing()}
                  onStartEdit={() => props.startEdit(row.id, cell.column.id)}
                  onCommit={(v) => props.commitEdit(row.id, cell.column.id, v)}
                  onCancel={props.cancelEdit}
                >
                  {props.renderCell(cell)}
                </EditableCell>
              </Show>
            </TableCell>
          );
        }}
      </For>
    </TableRow>
  );
  const subRowPanel = (row: Row<TData>, virt?: VirtRow) => (
    <TableRow
      ref={(el: HTMLTableRowElement) => measureRow(el, virt)}
      data-expanded-of={row.id}
      data-index={virt?.index}
      aria-rowindex={virt ? headerRowCount() + virt.index + 1 : undefined}
    >
      <TableCell colSpan={row.getVisibleCells().length} class="zen-p-0 zen-bg-zen-muted/30">
        {props.renderSubRow!(row)}
      </TableCell>
    </TableRow>
  );

  // HeaderRows is rendered as a sub-component (not a pre-evaluated JSX
  // expression) so its child HeaderCell → SortableHeaderTh → createSortable()
  // calls happen INSIDE the DragDropProvider context below. A previous
  // version stored this as `const headerRows = (...)` which evaluated
  // eagerly and ran createSortable outside the provider, producing the
  // "useDragDropContext is not a function or its return value is not
  // iterable" error.
  const HeaderRows = () => (
    <TableHeader class={props.headerVariantThead}>
      <For each={props.table.getHeaderGroups()}>
        {(hg) => (
          <TableRow
            class={cn(props.sepHeadClass, props.stickyRowClass, props.headerVariantRow)}
          >
            <For each={hg.headers}>
              {(header) => (
                <HeaderCell
                  header={header}
                  enableColumnResizing={props.enableColumnResizing}
                  enableColumnOrdering={props.enableColumnOrdering}
                  pinStyle={props.headerPinStyle(header.column)}
                  stickyHeader={props.stickyHeaderActive}
                  stickyBg={props.headerStickyBg}
                />
              )}
            </For>
          </TableRow>
        )}
      </For>
      <Show when={props.enablePerColumnFilters}>
        <For each={props.table.getHeaderGroups()}>
          {(hg) => (
            <TableRow
              class={cn(props.sepHeadClass, props.stickyRowClass, props.headerVariantRow)}
              style={
                props.stickyHeaderActive
                  ? { top: "var(--zen-dt-header-h, 40px)" }
                  : undefined
              }
            >
              <For each={hg.headers}>
                {(header) => {
                  const pin = props.headerPinStyle(header.column);
                  return (
                    <TableHead
                      class="zen-px-2 zen-py-1"
                      style={
                        pin
                          ? { ...pin, "z-index": props.stickyHeaderActive ? 11 : 1 }
                          : props.stickyHeaderActive
                            ? { background: props.headerStickyBg }
                            : undefined
                      }
                    >
                      <Show when={header.column.getCanFilter() && !header.id.startsWith("__")}>
                        <FilterCell column={header.column} operators={props.filterOperators} />
                      </Show>
                    </TableHead>
                  );
                }}
              </For>
            </TableRow>
          )}
        </For>
      </Show>
    </TableHeader>
  );

  return (
    <Table
      ref={tableEl}
      containerClass={props.fillHeight ? "zen-min-h-0 zen-flex-1" : undefined}
      containerStyle={props.stickyHeaderActive && !props.fillHeight ? { "max-height": `${props.maxBodyHeight}px` } : undefined}
      // Virtualized, the columns are laid out from the header, not from
      // whichever rows happen to be mounted, so they hold still as you scroll.
      class={props.virtualize ? "zen-table-fixed" : undefined}
      aria-rowcount={props.virtualize ? headerRowCount() + items().length : undefined}
    >
      <Show
        when={props.enableColumnOrdering}
        fallback={<HeaderRows />}
      >
        <DragDropProvider
          collisionDetector={closestCenter}
          onDragEnd={props.onColumnDragEnd}
        >
          <DragDropSensors />
          <SortableProvider ids={props.visibleColumnIds}>
            <HeaderRows />
          </SortableProvider>
        </DragDropProvider>
      </Show>
      <TableBody>
        <RowMoveContext.Provider value={rowMove}>
        <RowDragContext.Provider value={{ active: () => !!props.rowDrag, start: startDrag }}>
          <Show
            when={!props.loading && rows().length > 0}
            fallback={
              <TableRow>
                <TableCell
                  colSpan={colCount()}
                  class="zen-text-center zen-text-zen-muted-fg zen-py-6"
                >
                  {props.loading ? "Loading…" : props.emptyMessage}
                </TableCell>
              </TableRow>
            }
          >
            <Show
              when={props.virtualize}
              fallback={
                <For each={rows()}>
                  {(row, index) => (
                    <Show
                      when={props.rowOrderingActive}
                      fallback={
                        <>
                          {dataRow(row, index)}
                          {/* A group row expands into its rows, not into a detail panel. */}
                          <Show when={props.expansionEnabled && row.getIsExpanded() && !row.getIsGrouped() && props.renderSubRow}>
                            {subRowPanel(row)}
                          </Show>
                        </>
                      }
                    >
                      <SortableRow
                        id={row.id}
                        selected={row.getIsSelected()}
                        class={props.rowClassName?.(row)}
                      >
                        <For each={row.getVisibleCells()}>
                          {(cell) => {
                            const pin = props.pinStyle(cell.column);
                            const isEditing = () =>
                              props.editingCell?.rowId === row.id &&
                              props.editingCell?.columnId === cell.column.id;
                            return (
                              <TableCell class={props.sepCellClass} style={pin}>
                                <EditableCell
                                  cell={cell}
                                  editing={isEditing()}
                                  onStartEdit={() => props.startEdit(row.id, cell.column.id)}
                                  onCommit={(v) => props.commitEdit(row.id, cell.column.id, v)}
                                  onCancel={props.cancelEdit}
                                >
                                  {props.renderCell(cell)}
                                </EditableCell>
                              </TableCell>
                            );
                          }}
                        </For>
                      </SortableRow>
                    </Show>
                  )}
                </For>
              }
            >
              <VirtualRows
                items={items()}
                table={() => tableEl}
                estimatedRowHeight={props.estimatedRowHeight}
                colCount={colCount()}
                keep={keepMounted()}
                onReady={(api) => (virtual = api)}
              moveState={rowMove}
              >
                {(item, virt) =>
                  item.kind === "row"
                    ? // The row's index, as an accessor: dataRow reads it only in
                      // its bindings and handlers, as it does <For>'s index.
                      // eslint-disable-next-line solid/reactivity
                      dataRow(item.row, () => positions().rowIndex.get(item.row.id) ?? 0, virt)
                    : subRowPanel(item.row, virt)
                }
              </VirtualRows>
            </Show>
          </Show>
        </RowDragContext.Provider>
        </RowMoveContext.Provider>
      </TableBody>
      {/* A footer row, but only when a column actually declares one.
        * TanStack has carried `footer` on every ColumnDef since v8 and this
        * rendered none of them, so a column total had nowhere to go — the one
        * thing a financial table always needs. Rendered only when at least one
        * column defines it, so every existing table keeps its exact markup. */}
      <Show when={props.table.getAllColumns().some((c) => c.columnDef.footer !== undefined)}>
        <TableFooter>
          <For each={props.table.getFooterGroups()}>
            {(fg) => (
              <TableRow>
                <For each={fg.headers}>
                  {(header) => (
                    <TableCell colSpan={header.colSpan}>
                      <Show when={!header.isPlaceholder}>
                        {flexRender(header.column.columnDef.footer, header.getContext())}
                      </Show>
                    </TableCell>
                  )}
                </For>
              </TableRow>
            )}
          </For>
        </TableFooter>
      </Show>
    </Table>
  );
}

/* ------------------------------- VirtualRows ----------------------------- */
/** What BodyTable may ask of its VirtualRows: scroll to an item, find the item at an offset. */
interface VirtualRowsApi {
  scrollToItem: (index: number) => void;
  /** The item at a content offset in the scroller (header included), measured or estimated. */
  itemAt: (offset: number) => { index: number; start: number; end: number } | undefined;
}

// The regular table's rows, only those in view (enableRowVirtualization). The
// rows it skips are stood in for by spacer rows of their height, so the table
// stays one table: header, column widths, sticky cells and footer are the plain
// body's, and so is every row. Rows are measured as they mount, so a group row
// or an expanded panel may be taller than the rest.
function VirtualRows<TData>(props: {
  items: BodyItem<TData>[];
  table: () => HTMLTableElement | undefined;
  /** Unset: learned from the first row measured. */
  estimatedRowHeight?: number;
  colCount: number;
  /** Item indices to keep mounted wherever the scroll is. */
  keep: number[];
  onReady: (api: VirtualRowsApi) => void;
  /** Raised from just before a window update to just after it. */
  moveState: { moving: boolean };
  children: (
    item: BodyItem<TData>,
    virt: { index: number; measure: (el: Element) => void },
  ) => JSX.Element;
}) {
  // The header shares the rows' scroller but sticks at its top: the rows
  // start below it, and a row scrolled to must not land underneath it.
  const [headerHeight, setHeaderHeight] = createSignal(0);
  onMount(() => {
    const head = props.table()?.tHead;
    if (!head) return;
    setHeaderHeight(head.offsetHeight);
    const ro = new ResizeObserver(() => setHeaderHeight(head.offsetHeight));
    ro.observe(head);
    onCleanup(() => ro.disconnect());
  });

  // Rows not mounted yet are placed by an estimate. Unless the caller gives
  // one, it is the first row measured, so it follows density and theme.
  // eslint-disable-next-line solid/reactivity -- an initial value; after it, the measured one
  const [estimate, setEstimate] = createSignal(props.estimatedRowHeight ?? 40);
  // eslint-disable-next-line solid/reactivity -- read once: a given estimate is not re-learned
  let learned = props.estimatedRowHeight !== undefined;

  const virtualizer = createVirtualizer({
    get count() {
      return props.items.length;
    },
    getScrollElement: () => props.table()?.parentElement ?? null,
    estimateSize: () => estimate(),
    measureElement: (el, entry, instance) => {
      const size = measureRowElement(el, entry, instance);
      if (!learned && entry && size > 0) {
        learned = true;
        // Re-estimate every unmeasured row from it: the jump to a row far away
        // lands where that row really is.
        queueMicrotask(() => {
          setEstimate(size);
          instance.measure();
        });
      }
      return size;
    },
    // Both are new functions whenever what they read changes: the virtualizer
    // recomputes only when they change identity, and a sort keeps the count.
    get getItemKey() {
      const items = props.items;
      return (index: number) => {
        const item = items[index];
        return item ? `${item.kind}:${item.row.id}` : index;
      };
    },
    get rangeExtractor() {
      const keep = props.keep;
      return (range: Range) => {
        const base = defaultRangeExtractor(range);
        // A row may be kept for more than one reason (focused AND edited): an
        // index listed twice would mount it twice.
        const extra = [...new Set(keep)].filter((i) => i < range.count && !base.includes(i));
        return extra.length ? [...base, ...extra].sort((x, y) => x - y) : base;
      };
    },
    get scrollMargin() {
      return headerHeight();
    },
    get scrollPaddingStart() {
      return headerHeight();
    },
    overscan: 8,
  });
  // The parent's handle on scrolling, set once: the virtualizer lives as long as this.
  // eslint-disable-next-line solid/reactivity
  props.onReady({
    scrollToItem: (index) => virtualizer.scrollToIndex(index, { align: "auto" }),
    itemAt: (offset) => {
      const item = virtualizer.getVirtualItemForOffset(offset);
      return item && { index: item.index, start: item.start, end: item.end };
    },
  });

  const spacer = (height: () => number) => (
    <tr aria-hidden="true" data-virtual-spacer="">
      <td colSpan={props.colCount} style={{ height: `${height()}px`, padding: 0, border: 0 }} />
    </tr>
  );
  const virtualItems = () => virtualizer.getVirtualItems();

  // As the window shifts, Solid may MOVE a mounted row among its siblings (a
  // kept row the window catches up with), and moving a focused element drops
  // its focus, with nothing to tell that blur from a click elsewhere. So the
  // focus held in the body just before an update is put back after it, only
  // when the update is what took it: nothing else has focus.
  let heldFocus: HTMLElement | null = null;
  const trackWindow = () => {
    for (const vi of virtualItems()) void vi.index;
  };
  // The same two points bracket the update for editors (RowMoveContext): a
  // blur between them is a move, not the user leaving.
  createComputed(() => {
    trackWindow();
    props.moveState.moving = true;
    if (typeof document === "undefined") return;
    const active = document.activeElement;
    const body = props.table()?.tBodies[0];
    heldFocus = body && active instanceof HTMLElement && body.contains(active) ? active : null;
  });
  createEffect(() => {
    trackWindow();
    props.moveState.moving = false;
    const el = heldFocus;
    if (!el || !el.isConnected || document.activeElement === el) return;
    if (document.activeElement && document.activeElement !== document.body) return;
    el.focus({ preventScroll: true });
  });

  // Item starts include the header (scrollMargin); the total size does not.
  const bottomGap = () => {
    const list = virtualItems();
    const last = list[list.length - 1];
    return last ? virtualizer.getTotalSize() - (last.end - headerHeight()) : 0;
  };

  return (
    <>
      <For each={virtualItems()}>
        {(vi, position) => {
          // A gap before this item: the unmounted rows above it (more than the
          // window's edge when this is a kept row far from the rest).
          const gap = () => {
            const list = virtualItems();
            const p = position();
            return vi.start - (p === 0 ? headerHeight() : list[p - 1].end);
          };
          return (
            <>
              <Show when={gap() > 0}>{spacer(gap)}</Show>
              <Show when={props.items[vi.index]} keyed>
                {(item) =>
                  props.children(item, { index: vi.index, measure: virtualizer.measureElement })
                }
              </Show>
            </>
          );
        }}
      </For>
      <Show when={bottomGap() > 0}>{spacer(bottomGap)}</Show>
    </>
  );
}

/* ------------------------------- Drag handle + sortable row -------------- */
/** Provided by a virtualized body that drags its rows itself (see BodyTable). */
const RowDragContext = createContext<{
  active: () => boolean;
  start: (rowId: string, e: PointerEvent) => void;
}>();

const dragHandleClass = cn(
  "zen-cursor-grab active:zen-cursor-grabbing zen-inline-flex zen-items-center zen-justify-center",
  "zen-h-6 zen-w-6 zen-rounded-zen-sm zen-bg-transparent zen-border-0",
  "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
);
const GripIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="9" cy="6" r="1.6" />
    <circle cx="15" cy="6" r="1.6" />
    <circle cx="9" cy="12" r="1.6" />
    <circle cx="15" cy="12" r="1.6" />
    <circle cx="9" cy="18" r="1.6" />
    <circle cx="15" cy="18" r="1.6" />
  </svg>
);

function DragHandle(props: { id: string }) {
  const drag = useContext(RowDragContext);
  return (
    <Show when={drag?.active()} fallback={<SortableDragHandle id={props.id} />}>
      <button
        type="button"
        aria-label="Drag to reorder row"
        class={cn(dragHandleClass, "zen-touch-none")}
        onPointerDown={(e) => drag?.start(props.id, e)}
      >
        <GripIcon />
      </button>
    </Show>
  );
}

function SortableDragHandle(props: { id: string }) {
  // A drag id fixed for the row's life. CLAUDE.md names this exact case as one
  // the rule gets wrong.
  // eslint-disable-next-line solid/reactivity
  const sortable = createSortable(props.id);
  return (
    <button
      type="button"
      ref={sortable.ref}
      {...sortable.dragActivators}
      aria-label="Drag to reorder row"
      class={dragHandleClass}
    >
      <GripIcon />
    </button>
  );
}

function SortableRow(props: {
  id: string;
  selected: boolean;
  class?: string;
  children: JSX.Element;
}) {
  // A drag id fixed for this row/header's life — see DragHandle above.
  // eslint-disable-next-line solid/reactivity
  const sortable = createSortable(props.id);
  return (
    <TableRow
      ref={sortable.ref}
      data-state={props.selected ? "selected" : undefined}
      class={props.class}
      style={
        sortable.transform
          ? {
              transform: `translate3d(${sortable.transform.x}px, ${sortable.transform.y}px, 0)`,
              opacity: sortable.isActiveDraggable ? 0.6 : 1,
              position: sortable.isActiveDraggable ? "relative" : undefined,
              "z-index": sortable.isActiveDraggable ? 1 : undefined,
            }
          : undefined
      }
    >
      {props.children}
    </TableRow>
  );
}

/* ------------------------------- HeaderCell ------------------------------ */
function HeaderCell<TData, TValue>(props: {
  header: Header<TData, TValue>;
  enableColumnResizing?: boolean;
  enableColumnOrdering?: boolean;
  pinStyle?: JSX.CSSProperties;
  stickyHeader?: boolean;
  stickyBg?: string;
}) {
  const header = () => props.header;
  const canSort = () => header().column.getCanSort();
  const sorted = () => header().column.getIsSorted();
  // A priority means something only when two or more columns are sorted: a
  // lone "1" next to the only sorted column read as stray text. (Vanilla has
  // always done this.)
  const sortIndex = () =>
    header().getContext().table.getState().sorting.length > 1 &&
    header().column.getSortIndex() >= 0
      ? header().column.getSortIndex() + 1
      : null;
  const isResizing = () => header().column.getIsResizing();
  const sortLabel = () =>
    sorted() === "asc" ? "ascending" : sorted() === "desc" ? "descending" : "none";

  // A placeholder header (TanStack emits them for grouped column structures)
  // renders an empty cell. This was an early `return`, which Solid runs once —
  // correct in practice, because placeholder-ness is fixed for a header's life,
  // but the one site in this file where the rule's complaint is literally right.
  // It is a <Show> now, so nothing depends on that staying true.
  //
  // innerContent became a FUNCTION in the same change: as a const it was built
  // eagerly at setup, and moving the guard into JSX would otherwise have made
  // every placeholder header construct DOM it never shows.
  const innerContent = () => (
    <>
      <Show
        when={canSort()}
        fallback={
          <span class="zen-px-2 zen-py-2 zen-inline-flex zen-items-center zen-gap-1">
            {flexRender(header().column.columnDef.header, header().getContext())}
          </span>
        }
      >
        <button
          type="button"
          onClick={(e) => header().column.getToggleSortingHandler()?.(e)}
          aria-label={`Sort by ${
            typeof header().column.columnDef.header === "string"
              ? (header().column.columnDef.header as string)
              : header().column.id
          }, currently ${sortLabel()}`}
          class={cn(
            "zen-w-full zen-h-full zen-px-2 zen-py-2",
            "zen-inline-flex zen-items-center zen-gap-1 zen-text-start zen-font-inherit zen-text-inherit",
            "zen-bg-transparent zen-border-0 zen-cursor-pointer",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset",
          )}
        >
          {flexRender(header().column.columnDef.header, header().getContext())}
          <SortIndicator state={sorted()} />
          <Show when={sortIndex() !== null}>
            <span
              aria-hidden="true"
              class="zen-font-semibold zen-text-zen-muted-fg zen-ml-0.5"
              title={`Sort priority ${sortIndex()}`}
            >
              {sortIndex()}
            </span>
          </Show>
        </button>
      </Show>
      <Show when={props.enableColumnResizing && header().column.getCanResize()}>
        <button
          type="button"
          aria-label={`Resize ${header().column.id}`}
          onMouseDown={(e) => header().getResizeHandler()(e)}
          onTouchStart={(e) => header().getResizeHandler()(e)}
          onClick={(e) => e.stopPropagation()}
          class={cn(
            "zen-absolute zen-right-0 zen-top-0 zen-h-full zen-w-1.5 zen-cursor-col-resize zen-select-none zen-touch-none",
            "zen-bg-transparent zen-border-0 zen-p-0",
            "hover:zen-bg-zen-primary",
            isResizing() && "zen-bg-zen-primary",
          )}
        />
      </Show>
    </>
  );

  const headStyle = (): JSX.CSSProperties => ({
    width: `${header().column.getSize()}px`,
    ...(props.pinStyle ?? {}),
    ...(props.pinStyle ? { "z-index": props.stickyHeader ? 11 : 1 } : {}),
    ...(props.stickyHeader && !props.pinStyle
      ? { background: props.stickyBg ?? "var(--zen-color-background)" }
      : {}),
  });

  return (
    <Show when={!header().isPlaceholder} fallback={<TableHead />}>
    <Show
      when={props.enableColumnOrdering}
      fallback={
        <TableHead
          data-active={sorted() ? "true" : undefined}
          aria-sort={
            sorted() === "asc"
              ? "ascending"
              : sorted() === "desc"
                ? "descending"
                : undefined
          }
          class={cn(
            "zen-p-0 zen-transition-colors zen-relative",
            canSort() && "hover:zen-bg-zen-muted",
            "data-[active=true]:zen-bg-zen-primary-soft data-[active=true]:zen-text-zen-primary-soft-fg",
          )}
          style={headStyle()}
        >
          {innerContent()}
        </TableHead>
      }
    >
      <SortableHeaderTh
        id={header().column.id}
        sorted={sorted()}
        canSort={canSort()}
        style={headStyle()}
      >
        {innerContent()}
      </SortableHeaderTh>
    </Show>
    </Show>
  );
}

function SortableHeaderTh(props: {
  id: string;
  sorted: false | "asc" | "desc";
  canSort: boolean;
  style: JSX.CSSProperties;
  children: JSX.Element;
}) {
  // A drag id fixed for this row/header's life — see DragHandle above.
  // eslint-disable-next-line solid/reactivity
  const sortable = createSortable(props.id);
  const style = (): JSX.CSSProperties => ({
    ...props.style,
    ...(sortable.transform
      ? {
          transform: `translate3d(${sortable.transform.x}px, ${sortable.transform.y}px, 0)`,
          opacity: sortable.isActiveDraggable ? 0.6 : 1,
        }
      : {}),
    cursor: "grab",
    position: "relative",
  });
  return (
    <TableHead
      ref={sortable.ref}
      {...sortable.dragActivators}
      data-active={props.sorted ? "true" : undefined}
      aria-sort={
        props.sorted === "asc"
          ? "ascending"
          : props.sorted === "desc"
            ? "descending"
            : undefined
      }
      class={cn(
        "zen-p-0 zen-transition-colors",
        props.canSort && "hover:zen-bg-zen-muted",
        "data-[active=true]:zen-bg-zen-primary-soft data-[active=true]:zen-text-zen-primary-soft-fg",
      )}
      style={style()}
    >
      {props.children}
    </TableHead>
  );
}

function SortIndicator(props: { state: false | "asc" | "desc" }) {
  return (
    <Show
      when={props.state}
      fallback={
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="zen-opacity-30" aria-hidden="true">
          <polyline points="8 9 12 5 16 9" />
          <polyline points="16 15 12 19 8 15" />
        </svg>
      }
    >
      {(state) => (
        <Show
          when={state() === "asc"}
          fallback={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          }
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </Show>
      )}
    </Show>
  );
}

/* ------------------------------- VirtualizedBody ------------------------- */
function VirtualizedBody<TData>(props: {
  table: TanStackTable<TData>;
  maxHeight: number;
  estimatedRowHeight: number;
  emptyMessage: string;
  loading: boolean;
  enableColumnPinning?: boolean;
  enableColumnResizing?: boolean;
  enableColumnOrdering?: boolean;
  enablePerColumnFilters?: boolean;
  filterOperators?: boolean;
  visibleColumnIds: string[];
  onColumnDragEnd: (e: DragEvent) => void;
  editingCell: EditingState | null;
  onStartEdit: (rowId: string, columnId: string) => void;
  onCommitEdit: (rowId: string, columnId: string, value: unknown) => void;
  onCancelEdit: () => void;
  rowClassName?: (row: Row<TData>) => string | undefined;
  headerVariant: "plain" | "underline" | "branded";
  pinStyle: (col: Column<TData, unknown>) => JSX.CSSProperties | undefined;
  headerPinStyle: (col: Column<TData, unknown>) => JSX.CSSProperties | undefined;
  headerStickyBg: string;
}) {
  let parentRef: HTMLDivElement | undefined;
  const rows = () => props.table.getRowModel().rows;
  const virtualizer = createVirtualizer({
    get count() {
      return rows().length;
    },
    getScrollElement: () => parentRef ?? null,
    estimateSize: () => props.estimatedRowHeight,
    overscan: 8,
  });

  const visibleColumns = () => props.table.getVisibleLeafColumns();
  const gridTemplateColumns = createMemo(() => {
    const sizing = props.table.getState().columnSizing;
    return visibleColumns()
      .map((col) => {
        const stateSize = sizing[col.id];
        if (stateSize !== undefined) return `${stateSize}px`;
        const explicit = col.columnDef.size;
        if (explicit !== undefined && explicit !== 150) return `${explicit}px`;
        return "minmax(0, 1fr)";
      })
      .join(" ");
  });

  return (
    <div
      ref={parentRef}
      style={{ "max-height": `${props.maxHeight}px`, overflow: "auto" }}
      role="table"
      aria-rowcount={rows().length + 1}
      aria-colcount={visibleColumns().length}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          "z-index": 1,
          background: props.headerStickyBg,
          "border-bottom":
            props.headerVariant === "underline"
              ? "2px solid var(--zen-color-primary)"
              : "1px solid var(--zen-color-border)",
        }}
      >
        <Show
          when={props.enableColumnOrdering}
          fallback={
            <For each={props.table.getHeaderGroups()}>
              {(hg) => (
                <div
                  role="row"
                  style={{ display: "grid", "grid-template-columns": gridTemplateColumns() }}
                >
                  <For each={hg.headers}>
                    {(header) => (
                      <VirtHeaderCell
                        header={header}
                        pinStyle={props.headerPinStyle(header.column)}
                        enableColumnResizing={props.enableColumnResizing}
                        branded={props.headerVariant === "branded"}
                      />
                    )}
                  </For>
                </div>
              )}
            </For>
          }
        >
          <DragDropProvider
            collisionDetector={closestCenter}
            onDragEnd={props.onColumnDragEnd}
          >
            <DragDropSensors />
            <SortableProvider ids={props.visibleColumnIds}>
              <For each={props.table.getHeaderGroups()}>
                {(hg) => (
                  <div
                    role="row"
                    style={{ display: "grid", "grid-template-columns": gridTemplateColumns() }}
                  >
                    <For each={hg.headers}>
                      {(header) => (
                        <VirtSortableHeaderCell
                          header={header}
                          pinStyle={props.headerPinStyle(header.column)}
                          enableColumnResizing={props.enableColumnResizing}
                          branded={props.headerVariant === "branded"}
                        />
                      )}
                    </For>
                  </div>
                )}
              </For>
            </SortableProvider>
          </DragDropProvider>
        </Show>

        <Show when={props.enablePerColumnFilters}>
          <For each={props.table.getHeaderGroups()}>
            {(hg) => (
              <div
                role="row"
                style={{
                  display: "grid",
                  "grid-template-columns": gridTemplateColumns(),
                  "border-top": "1px solid var(--zen-color-border)",
                }}
              >
                <For each={hg.headers}>
                  {(header) => {
                    const pin = props.headerPinStyle(header.column);
                    return (
                      <div
                        style={{
                          padding: "var(--zen-space-1)",
                          "min-width": 0,
                          background: props.headerStickyBg,
                          ...(pin ?? {}),
                          ...(pin ? { "z-index": 2 } : {}),
                        }}
                      >
                        <Show when={header.column.getCanFilter() && !header.id.startsWith("__")}>
                          <FilterCell column={header.column} operators={props.filterOperators} />
                        </Show>
                      </div>
                    );
                  }}
                </For>
              </div>
            )}
          </For>
        </Show>
      </div>

      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}>
        <Show
          when={!props.loading && rows().length > 0}
          fallback={
            <div
              role="row"
              style={{
                "text-align": "center",
                padding: "var(--zen-space-4)",
                color: "var(--zen-color-muted-fg)",
              }}
            >
              {props.loading ? "Loading…" : props.emptyMessage}
            </div>
          }
        >
          <For each={virtualizer.getVirtualItems()}>
            {(virtualRow) => {
              const row = rows()[virtualRow.index];
              return (
                <div
                  role="row"
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                    height: `${virtualRow.size}px`,
                    display: "grid",
                    "grid-template-columns": gridTemplateColumns(),
                  }}
                  class={cn(
                    "zen-border-b zen-border-zen-border zen-transition-[background-color,box-shadow,outline-color] zen-duration-100",
                    "hover:zen-bg-zen-muted/50 hover:zen-shadow-zen-sm",
                    row.getIsSelected() &&
                      "zen-bg-zen-primary-soft zen-shadow-zen-sm zen-outline zen-outline-1 -zen-outline-offset-1 zen-outline-zen-primary",
                    props.rowClassName?.(row),
                  )}
                >
                  <For each={row.getVisibleCells()}>
                    {(cell) => {
                      const pin = props.pinStyle(cell.column);
                      const isEditing = () =>
                        props.editingCell?.rowId === row.id &&
                        props.editingCell?.columnId === cell.column.id;
                      return (
                        <div
                          role="cell"
                          style={{
                            padding: "var(--zen-space-2) var(--zen-space-1)",
                            display: "flex",
                            "align-items": "center",
                            "min-width": 0,
                            overflow: "hidden",
                            "text-overflow": "ellipsis",
                            "white-space": "nowrap",
                            ...(pin ?? {}),
                          }}
                        >
                          <EditableCell
                            cell={cell}
                            editing={isEditing()}
                            onStartEdit={() => props.onStartEdit(row.id, cell.column.id)}
                            onCommit={(v) => props.onCommitEdit(row.id, cell.column.id, v)}
                            onCancel={props.onCancelEdit}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </EditableCell>
                        </div>
                      );
                    }}
                  </For>
                </div>
              );
            }}
          </For>
        </Show>
      </div>
    </div>
  );
}

function VirtHeaderCellInner<TData, TValue>(props: {
  header: Header<TData, TValue>;
  enableColumnResizing?: boolean;
}) {
  const canSort = () => props.header.column.getCanSort();
  const sorted = () => props.header.column.getIsSorted();
  const isResizing = () => props.header.column.getIsResizing();
  return (
    <>
      <Show
        when={!props.header.isPlaceholder}
        fallback={null}
      >
        <Show
          when={canSort()}
          fallback={
            <span class="zen-px-2 zen-py-2 zen-inline-flex zen-items-center zen-gap-1">
              {flexRender(props.header.column.columnDef.header, props.header.getContext())}
            </span>
          }
        >
          <button
            type="button"
            onClick={(e) => props.header.column.getToggleSortingHandler()?.(e)}
            class="zen-w-full zen-h-full zen-px-2 zen-py-2 zen-inline-flex zen-items-center zen-gap-1 zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-inherit zen-font-inherit focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset"
          >
            {flexRender(props.header.column.columnDef.header, props.header.getContext())}
            <SortIndicator state={sorted()} />
          </button>
        </Show>
      </Show>
      <Show when={props.enableColumnResizing && props.header.column.getCanResize()}>
        <button
          type="button"
          aria-label={`Resize ${props.header.column.id}`}
          onMouseDown={(e) => props.header.getResizeHandler()(e)}
          onTouchStart={(e) => props.header.getResizeHandler()(e)}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          class={cn(
            "zen-absolute zen-right-0 zen-top-0 zen-h-full zen-w-1.5 zen-cursor-col-resize zen-select-none zen-touch-none",
            "zen-bg-transparent zen-border-0 zen-p-0",
            "hover:zen-bg-zen-primary",
            isResizing() && "zen-bg-zen-primary",
          )}
        />
      </Show>
    </>
  );
}

function VirtHeaderCell<TData, TValue>(props: {
  header: Header<TData, TValue>;
  pinStyle?: JSX.CSSProperties;
  enableColumnResizing?: boolean;
  branded?: boolean;
}) {
  const canSort = () => props.header.column.getCanSort();
  const sorted = () => props.header.column.getIsSorted();
  return (
    <div
      role="columnheader"
      data-active={sorted() ? "true" : undefined}
      aria-sort={
        sorted() === "asc"
          ? "ascending"
          : sorted() === "desc"
            ? "descending"
            : undefined
      }
      class={cn(
        "zen-text-sm zen-flex zen-items-center zen-transition-colors zen-relative",
        props.branded
          ? "zen-font-semibold zen-text-zen-primary-soft-fg"
          : "zen-font-medium zen-text-zen-muted-fg",
        canSort() && "hover:zen-bg-zen-muted",
        "data-[active=true]:zen-bg-zen-primary-soft data-[active=true]:zen-text-zen-primary-soft-fg",
      )}
      style={{
        "min-width": 0,
        ...(props.pinStyle ?? {}),
        ...(props.pinStyle ? { "z-index": 2 } : {}),
      }}
    >
      <VirtHeaderCellInner header={props.header} enableColumnResizing={props.enableColumnResizing} />
    </div>
  );
}

function VirtSortableHeaderCell<TData, TValue>(props: {
  header: Header<TData, TValue>;
  pinStyle?: JSX.CSSProperties;
  enableColumnResizing?: boolean;
  branded?: boolean;
}) {
  // A drag id fixed for this row/header's life — see DragHandle above.
  // eslint-disable-next-line solid/reactivity
  const sortable = createSortable(props.header.column.id);
  const canSort = () => props.header.column.getCanSort();
  const sorted = () => props.header.column.getIsSorted();
  return (
    <div
      ref={sortable.ref}
      {...sortable.dragActivators}
      role="columnheader"
      data-active={sorted() ? "true" : undefined}
      aria-sort={
        sorted() === "asc"
          ? "ascending"
          : sorted() === "desc"
            ? "descending"
            : undefined
      }
      class={cn(
        "zen-text-sm zen-flex zen-items-center zen-transition-colors zen-relative",
        props.branded
          ? "zen-font-semibold zen-text-zen-primary-soft-fg"
          : "zen-font-medium zen-text-zen-muted-fg",
        canSort() && "hover:zen-bg-zen-muted",
        "data-[active=true]:zen-bg-zen-primary-soft data-[active=true]:zen-text-zen-primary-soft-fg",
      )}
      style={{
        "min-width": 0,
        ...(sortable.transform
          ? {
              transform: `translate3d(${sortable.transform.x}px, ${sortable.transform.y}px, 0)`,
              opacity: sortable.isActiveDraggable ? 0.6 : 1,
            }
          : {}),
        cursor: "grab",
        ...(props.pinStyle ?? {}),
        ...(props.pinStyle ? { "z-index": 2 } : {}),
      }}
    >
      <VirtHeaderCellInner header={props.header} enableColumnResizing={props.enableColumnResizing} />
    </div>
  );
}

/* ------------------------------- PaginationBar --------------------------- */
function PaginationBar<TData>(props: {
  table: TanStackTable<TData>;
  enableRowSelection: boolean;
  pageSizeOptions: number[];
  manual: boolean;
}) {
  const pagination = () => props.table.getState().pagination;
  const pageCount = () => props.table.getPageCount();
  const selectedCount = () => props.table.getSelectedRowModel().rows.length;
  const totalCount = () => props.table.getFilteredRowModel().rows.length;
  return (
    <div class="zen-flex zen-items-center zen-justify-between zen-gap-3 zen-text-sm">
      <div class="zen-text-zen-muted-fg">
        <Show
          when={props.enableRowSelection}
          fallback={
            <>
              Page {pagination().pageIndex + 1} of {Math.max(pageCount(), 1)}
            </>
          }
        >
          {selectedCount()} of {totalCount()} row(s) selected.
        </Show>
      </div>
      <div class="zen-flex zen-items-center zen-gap-3">
        <Show when={!props.manual}>
          <div class="zen-flex zen-items-center zen-gap-2">
            <span class="zen-text-zen-muted-fg">Rows per page</span>
            <div style={{ width: "88px" }}>
              <Select
                options={props.pageSizeOptions.map((s) => ({
                  value: String(s),
                  label: String(s),
                }))}
                value={String(pagination().pageSize)}
                onChange={(v) => v && props.table.setPageSize(Number(v))}
              />
            </div>
          </div>
        </Show>
        <div class="zen-flex zen-items-center zen-gap-1">
          <Button
            variant="outline"
            color="neutral"
            size="sm"
            disabled={!props.table.getCanPreviousPage()}
            onClick={() => props.table.setPageIndex(0)}
            aria-label="First page"
          >
            «
          </Button>
          <Button
            variant="outline"
            color="neutral"
            size="sm"
            disabled={!props.table.getCanPreviousPage()}
            onClick={() => props.table.previousPage()}
            aria-label="Previous page"
          >
            ‹
          </Button>
          <Button
            variant="outline"
            color="neutral"
            size="sm"
            disabled={!props.table.getCanNextPage()}
            onClick={() => props.table.nextPage()}
            aria-label="Next page"
          >
            ›
          </Button>
          <Button
            variant="outline"
            color="neutral"
            size="sm"
            disabled={!props.table.getCanNextPage()}
            onClick={() => props.table.setPageIndex(props.table.getPageCount() - 1)}
            aria-label="Last page"
          >
            »
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- helpers --------------------------------- */
function arrayMove<T>(arr: readonly T[], from: number, to: number): T[] {
  const next = [...arr];
  const [removed] = next.splice(from, 1);
  next.splice(to, 0, removed);
  return next;
}
