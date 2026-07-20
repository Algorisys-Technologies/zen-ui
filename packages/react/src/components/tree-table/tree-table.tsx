import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ExpandedState,
  type Row,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { arrowStep } from "@algorisys/zen-ui-core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../data-table/table";
import { Checkbox } from "../form/checkbox/checkbox";
import { Icon } from "../icon/icon";
import { Input } from "../form/input/input";
import { Button } from "../button/button";
import { cn } from "../../lib/cn";

/**
 * TreeTable — a table whose rows form a hierarchy.
 *
 *   <TreeTable data={accounts} columns={columns} />
 *
 * This is a separate component from `DataTable` rather than a mode of it, and
 * the reason is structural rather than a matter of size. Hierarchy and grouping
 * claim the SAME three slots in a TanStack table: `subRows`, the `expanded`
 * state, and the chevron column. DataTable's grouping synthesizes its group
 * rows *as* subRows, so a table cannot carry both a real hierarchy and a
 * grouped one — the second would nest inside the first and mean nothing.
 *
 * What that buys, beyond avoiding a mutual-exclusion gate: the chevron lives
 * INSIDE the first column here, indented by depth, rather than in a leading
 * gutter column the way DataTable's `renderSubRow` toggle does. That is what
 * makes the hierarchy readable — you follow one column down the page.
 *
 * Reach for `DataTable` for flat data with grouping, virtualization, pagination
 * and inline editing; reach for this when the data is genuinely nested and the
 * nesting is the point.
 */

/** The default child accessor: a `children` array, which is what nested JSON usually calls it. */
const defaultGetSubRows = <TData,>(row: TData): TData[] | undefined =>
  (row as { children?: TData[] }).children;

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

  /* lazy children — fetch a subtree the first time it is opened */
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

  /* expansion */
  expanded?: ExpandedState;
  /** `true` expands everything on first render. */
  defaultExpanded?: ExpandedState;
  onExpandedChange?: (state: ExpandedState) => void;
  /** Show the expand-all / collapse-all control. Default true. */
  enableExpandAll?: boolean;

  /* sorting — sorts within each parent's children, never across levels */
  enableSorting?: boolean;
  sorting?: SortingState;
  onSortingChange?: (state: SortingState) => void;

  /* filtering */
  enableGlobalFilter?: boolean;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  globalFilterPlaceholder?: string;

  /* selection */
  enableRowSelection?: boolean;
  /** Selecting a parent selects its descendants. Default true. */
  enableSubRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (state: RowSelectionState) => void;

  /* presentation */
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
  className?: string;
}

export function TreeTable<TData, TValue = unknown>({
  data,
  columns,
  getSubRows,
  getRowId,
  hasChildren,
  loadChildren,
  onLoadChildrenError,
  expanded,
  defaultExpanded,
  onExpandedChange,
  enableExpandAll = true,
  enableSorting = true,
  sorting,
  onSortingChange,
  enableGlobalFilter,
  globalFilter,
  onGlobalFilterChange,
  globalFilterPlaceholder,
  enableRowSelection,
  enableSubRowSelection = true,
  rowSelection,
  onRowSelectionChange,
  hierarchyColumnId,
  indent = 20,
  enableVirtualization,
  rowEstimatedHeight = 44,
  stickyHeader,
  headerVariant = "plain",
  maxBodyHeight,
  rowClassName,
  onRowClick,
  emptyMessage = "No results.",
  loading,
  className,
}: TreeTableProps<TData, TValue>) {
  const [expandedInner, setExpandedInner] = React.useState<ExpandedState>(defaultExpanded ?? {});
  const [sortingInner, setSortingInner] = React.useState<SortingState>([]);
  const [selectionInner, setSelectionInner] = React.useState<RowSelectionState>({});
  const [globalFilterInner, setGlobalFilterInner] = React.useState("");

  const expandedState = expanded ?? expandedInner;
  const sortingState = sorting ?? sortingInner;
  const selectionState = rowSelection ?? selectionInner;
  const globalFilterState = globalFilter ?? globalFilterInner;

  /* The selection checkbox goes in its own leading column; the chevron does
   * NOT, because it belongs to the hierarchy column's text. */
  const augmentedColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    if (!enableRowSelection) return columns;
    const select: ColumnDef<TData, TValue> = {
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
      cell: ({ row }) => {
        /*
         * A parent's checkbox describes its SUBTREE, not its own row entry.
         * `getIsSelected()` alone is that entry, and TanStack never clears it
         * when a descendant is unticked — so a parent whose child you just
         * unticked would keep rendering "checked" while the row below it says
         * otherwise. Measured in the Solid binding: tick Engineering, untick
         * Infrastructure, and the naive version leaves Engineering checked.
         */
        const hasChildren = row.subRows.length > 0;
        const checked = hasChildren
          ? row.getIsSelected() && row.getIsAllSubRowsSelected()
          : row.getIsSelected();
        const partial = !checked && (row.getIsSomeSelected() || (hasChildren && row.getIsSelected()));
        return (
          <Checkbox
            // Radix is natively tri-state, so unlike Solid's separate
            // `indeterminate` prop the three states collapse into one value.
            checked={checked ? true : partial ? "indeterminate" : false}
            onCheckedChange={(v) => row.toggleSelected(v === true)}
            aria-label={`Select row ${row.index + 1}`}
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 36,
    };
    return [select, ...columns];
  }, [columns, enableRowSelection]);

  /* ---- lazy children ---- */
  const [loadedKids, setLoadedKids] = React.useState<Record<string, TData[]>>({});
  const [loadingIds, setLoadingIds] = React.useState<ReadonlySet<string>>(new Set());
  const [lazyVersion, setLazyVersion] = React.useState(0);

  const lazyKey = React.useCallback(
    (row: TData): string | undefined => getRowId?.(row, 0) ?? (row as { id?: string }).id,
    [getRowId],
  );

  /** Not yet loaded, but says it has children. */
  const canLazyLoad = React.useCallback(
    (row: TData) => {
      if (!loadChildren || !hasChildren?.(row)) return false;
      const key = lazyKey(row);
      return key !== undefined && loadedKids[key] === undefined;
    },
    [loadChildren, hasChildren, lazyKey, loadedKids],
  );

  const loadFor = React.useCallback(
    async (row: TData) => {
      const key = lazyKey(row);
      if (key === undefined || !loadChildren) return;
      if (loadingIds.has(key) || loadedKids[key] !== undefined) return;
      setLoadingIds((s) => new Set(s).add(key));
      try {
        const kids = await loadChildren(row);
        setLoadedKids((m) => ({ ...m, [key]: kids }));
        setLazyVersion((v) => v + 1);
      } catch (err) {
        if (onLoadChildrenError) onLoadChildrenError(err, row);
        else throw err;
      } finally {
        setLoadingIds((s) => {
          const next = new Set(s);
          next.delete(key);
          return next;
        });
      }
    },
    [lazyKey, loadChildren, loadingIds, loadedKids, onLoadChildrenError],
  );

  /*
   * A fresh top-level identity is what makes TanStack rebuild the row model
   * after a lazy load; returning `data` unchanged memoizes the old one and the
   * fetched children never appear.
   */
  const tableData = React.useMemo(
    () => (lazyVersion > 0 ? [...data] : data),
    [data, lazyVersion],
  );

  const resolvedGetSubRows = React.useCallback(
    (row: TData): TData[] | undefined => {
      const key = lazyKey(row);
      if (key !== undefined && loadedKids[key] !== undefined) return loadedKids[key];
      return (getSubRows ?? defaultGetSubRows)(row);
    },
    [getSubRows, lazyKey, loadedKids],
  );

  const table = useReactTable<TData>({
    data: tableData,
    columns: augmentedColumns as ColumnDef<TData, unknown>[],
    state: {
      expanded: expandedState,
      sorting: sortingState,
      rowSelection: selectionState,
      globalFilter: globalFilterState,
    },
    getSubRows: resolvedGetSubRows,
    /* A row that says it has children is expandable before it has any. */
    getRowCanExpand: (row) => row.subRows.length > 0 || canLazyLoad(row.original),
    getRowId,
    enableSorting,
    enableRowSelection: !!enableRowSelection,
    enableSubRowSelection,
    /*
     * Filter from the leaves up, so a matching child keeps its ancestors on
     * screen. The default drops any row that does not match ITSELF, which for a
     * tree means a hit three levels down takes its whole path with it and the
     * user sees an empty table while the count says otherwise.
     */
    filterFromLeafRows: true,
    onExpandedChange: (updater) => {
      const next = typeof updater === "function" ? updater(expandedState) : updater;
      if (expanded === undefined) setExpandedInner(next);
      onExpandedChange?.(next);
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sortingState) : updater;
      if (sorting === undefined) setSortingInner(next);
      onSortingChange?.(next);
    },
    onRowSelectionChange: (updater) => {
      const next = typeof updater === "function" ? updater(selectionState) : updater;
      if (rowSelection === undefined) setSelectionInner(next);
      onRowSelectionChange?.(next);
    },
    onGlobalFilterChange: (updater) => {
      const next = typeof updater === "function" ? updater(globalFilterState) : updater;
      if (globalFilter === undefined) setGlobalFilterInner(next);
      onGlobalFilterChange?.(next);
    },
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableGlobalFilter ? getFilteredRowModel() : undefined,
  });

  const rows = table.getRowModel().rows;

  /** The column the hierarchy reads down. */
  const hierarchyId =
    hierarchyColumnId ?? table.getVisibleLeafColumns().find((c) => !c.id.startsWith("__"))?.id;

  /*
   * aria-posinset / aria-setsize are per-parent, not per-page: a treegrid row's
   * "set" is its siblings. TanStack's flat row model does not carry that, so it
   * is counted once per render rather than walked per row.
   */
  const siblingInfo = React.useMemo(() => {
    const info = new Map<string, { pos: number; size: number }>();
    const byParent = new Map<string, Row<TData>[]>();
    for (const row of rows) {
      const key = row.parentId ?? "";
      const list = byParent.get(key);
      if (list) list.push(row);
      else byParent.set(key, [row]);
    }
    for (const list of byParent.values()) {
      list.forEach((row, i) => info.set(row.id, { pos: i + 1, size: list.length }));
    }
    return info;
  }, [rows]);

  const isRowLoading = (row: Row<TData>) => {
    const key = lazyKey(row.original);
    return key !== undefined && loadingIds.has(key);
  };

  /**
   * One entry point for opening a row, so the chevron and the keyboard cannot
   * drift: a first open of an unloaded node fetches before it expands.
   */
  const setRowExpanded = (row: Row<TData>, open: boolean) => {
    if (open && canLazyLoad(row.original)) void loadFor(row.original);
    row.toggleExpanded(open);
  };

  /* ---- virtualization ---- */
  const tableRef = React.useRef<HTMLTableElement>(null);
  /*
   * Virtualizing a TREE means windowing the flattened visible rows, which is
   * exactly what `rows` already is — expanding a node changes the count and the
   * virtualizer re-derives from it.
   *
   * Spacer rows rather than DataTable's absolutely-positioned `role="table"`
   * grid clone. That clone exists there to survive column pinning and resizing,
   * which this component does not have; and a treegrid is the one place the
   * trade would actually cost something, because leaving real <table> markup
   * would mean re-implementing every row and cell role by hand. Two <tr>s
   * holding the off-screen height keep the semantics AND the sticky header.
   */
  const virtualEnabled = !!enableVirtualization && !!maxBodyHeight;
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableRef.current?.parentElement ?? null,
    estimateSize: () => rowEstimatedHeight,
    overscan: 8,
  });
  const virtualItems = virtualizer.getVirtualItems();
  const renderedRows = virtualEnabled
    ? virtualItems.map((v) => rows[v.index]).filter(Boolean)
    : rows;
  const padTop = virtualEnabled ? (virtualItems[0]?.start ?? 0) : 0;
  const padBottom = virtualEnabled
    ? virtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end ?? 0)
    : 0;
  /** Row index within the FULL set, for aria-rowindex. */
  const indexOf = React.useMemo(() => {
    const m = new Map<string, number>();
    rows.forEach((r, i) => m.set(r.id, i + 1));
    return m;
  }, [rows]);

  React.useEffect(() => {
    // Silently rendering every row would look like the flag simply did nothing.
    if (enableVirtualization && !maxBodyHeight) {
      console.warn(
        "[TreeTable] `enableVirtualization` needs `maxBodyHeight` — without a bounded scroller there is no window. Rendering all rows.",
      );
    }
  }, [enableVirtualization, maxBodyHeight]);

  /* ---- roving focus, the WAI-ARIA treegrid row pattern ---- */
  const rowRefs = React.useRef(new Map<string, HTMLTableRowElement>());
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const activeId = focusedId ?? rows[0]?.id;

  const focusRow = (id: string | undefined | null) => {
    if (!id) return;
    setFocusedId(id);
    rowRefs.current.get(id)?.focus();
  };

  const moveBy = (from: Row<TData>, delta: number) => {
    const i = rows.findIndex((r) => r.id === from.id);
    focusRow(rows[i + delta]?.id);
  };

  const onRowKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>, row: Row<TData>) => {
    const step = arrowStep(e.key, e.currentTarget);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveBy(row, 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveBy(row, -1);
    } else if (step === 1) {
      // Forward: open a closed node, else descend into it.
      e.preventDefault();
      if (row.getCanExpand() && !row.getIsExpanded()) setRowExpanded(row, true);
      else if (row.getIsExpanded()) moveBy(row, 1);
    } else if (step === -1) {
      // Backward: close an open node, else climb to the parent.
      e.preventDefault();
      if (row.getIsExpanded()) setRowExpanded(row, false);
      else if (row.parentId) focusRow(row.parentId);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusRow(rows[0]?.id);
    } else if (e.key === "End") {
      e.preventDefault();
      focusRow(rows[rows.length - 1]?.id);
    } else if (e.key === "Enter" || e.key === " ") {
      if (onRowClick) {
        e.preventDefault();
        onRowClick(row);
      } else if (row.getCanExpand()) {
        e.preventDefault();
        setRowExpanded(row, !row.getIsExpanded());
      }
    }
  };

  const headerVariantRowClass =
    headerVariant === "branded"
      ? "zen-bg-zen-primary-soft [&>th]:zen-text-zen-primary-soft-fg [&>th]:zen-font-semibold"
      : "";
  const headerVariantTheadClass =
    headerVariant === "underline"
      ? "[&_tr:last-child]:zen-border-b-2 [&_tr:last-child]:zen-border-zen-primary"
      : "";
  const stickyRowClass = stickyHeader
    ? headerVariant === "branded"
      ? "zen-sticky zen-top-0 zen-z-10"
      : "zen-sticky zen-top-0 zen-z-10 zen-bg-zen-background"
    : "";

  const showToolbar = enableGlobalFilter || enableExpandAll;

  return (
    <div className={cn("zen-flex zen-w-full zen-flex-col zen-gap-3", className)}>
      {showToolbar && (
        <div className="zen-flex zen-flex-wrap zen-items-center zen-gap-2">
          {enableGlobalFilter && (
            <Input
              value={globalFilterState}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              placeholder={globalFilterPlaceholder ?? "Search…"}
              className="zen-max-w-xs"
              aria-label="Search"
            />
          )}
          {enableExpandAll && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.toggleAllRowsExpanded()}
              aria-expanded={table.getIsAllRowsExpanded()}
            >
              <Icon
                name={table.getIsAllRowsExpanded() ? "chevron-down" : "chevron-right"}
                size={14}
              />
              {table.getIsAllRowsExpanded() ? "Collapse all" : "Expand all"}
            </Button>
          )}
        </div>
      )}

      <Table
        ref={tableRef}
        role="treegrid"
        aria-busy={loading || undefined}
        // With a window, the DOM no longer holds every row, so the total has to
        // be stated rather than counted.
        aria-rowcount={virtualEnabled ? rows.length : undefined}
        containerClassName={maxBodyHeight ? "zen-overflow-auto" : undefined}
        containerStyle={maxBodyHeight ? { maxHeight: `${maxBodyHeight}px` } : undefined}
      >
        <TableHeader className={headerVariantTheadClass}>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className={cn(headerVariantRowClass, stickyRowClass)}>
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                return (
                  <TableHead
                    key={header.id}
                    style={header.column.getSize() ? { width: header.getSize() } : undefined}
                    aria-sort={
                      sorted === "asc"
                        ? "ascending"
                        : sorted === "desc"
                          ? "descending"
                          : header.column.getCanSort()
                            ? "none"
                            : undefined
                    }
                  >
                    {!header.isPlaceholder &&
                      (header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="zen-inline-flex zen-items-center zen-gap-1 zen-border-0 zen-bg-transparent zen-p-0 zen-font-inherit zen-text-inherit zen-cursor-pointer focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted && (
                            <Icon name={sorted === "asc" ? "chevron-up" : "chevron-down"} size={12} />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      ))}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {loading || rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={table.getVisibleLeafColumns().length}
                className="zen-h-24 zen-text-center zen-text-zen-muted-fg"
              >
                {loading ? "Loading…" : emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            <>
              {padTop > 0 && <tr aria-hidden="true" style={{ height: padTop }} />}
              {renderedRows.map((row) => {
              const info = siblingInfo.get(row.id);
              return (
                <TableRow
                  key={row.id}
                  ref={(el) => {
                    if (el) {
                      rowRefs.current.set(row.id, el);
                      // Let real heights replace the estimate; rows are in
                      // normal flow, so this measures without a second pass.
                      if (virtualEnabled) virtualizer.measureElement(el);
                    } else rowRefs.current.delete(row.id);
                  }}
                  data-index={virtualEnabled ? (indexOf.get(row.id) ?? 1) - 1 : undefined}
                  aria-rowindex={virtualEnabled ? indexOf.get(row.id) : undefined}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  data-depth={row.depth}
                  className={cn(
                    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset",
                    onRowClick && "zen-cursor-pointer",
                    rowClassName?.(row),
                  )}
                  // aria-level is 1-based; TanStack's depth is 0-based.
                  aria-level={row.depth + 1}
                  aria-expanded={row.getCanExpand() ? row.getIsExpanded() : undefined}
                  aria-posinset={info?.pos}
                  aria-setsize={info?.size}
                  aria-selected={enableRowSelection ? row.getIsSelected() : undefined}
                  tabIndex={activeId === row.id ? 0 : -1}
                  onFocus={() => setFocusedId(row.id)}
                  onKeyDown={(e) => onRowKeyDown(e, row)}
                  onClick={() => onRowClick?.(row)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.column.id === hierarchyId ? (
                        <span
                          className="zen-flex zen-items-center zen-gap-1"
                          /* Inline, not a utility: depth is unbounded, so no
                             finite class set can express it. Same reasoning as
                             Tree's indent. */
                          style={{ paddingInlineStart: row.depth * indent }}
                        >
                          {row.getCanExpand() ? (
                            <button
                              type="button"
                              // The row handles arrows; this button is the
                              // pointer affordance and must not also steal a tab
                              // stop from the roving row focus.
                              tabIndex={-1}
                              aria-hidden="true"
                              aria-busy={isRowLoading(row) || undefined}
                              onClick={(e) => {
                                e.stopPropagation();
                                setRowExpanded(row, !row.getIsExpanded());
                              }}
                              className="zen-inline-flex zen-w-4 zen-shrink-0 zen-items-center zen-justify-center zen-border-0 zen-bg-transparent zen-p-0 zen-cursor-pointer zen-text-zen-muted-fg"
                            >
                              {isRowLoading(row) ? (
                                /* A fetch has no length the caller can predict, so the
                                   chevron itself reports it rather than the row jumping
                                   to a placeholder that may be replaced in 40ms. */
                                <span className="zen-inline-block zen-h-3 zen-w-3 zen-animate-spin zen-rounded-zen-full zen-border zen-border-zen-border zen-border-t-zen-primary" />
                              ) : (
                                <Icon
                                  name="chevron-right"
                                  size={14}
                                  className={cn(
                                    "zen-transition-transform",
                                    row.getIsExpanded() && "zen-rotate-90",
                                  )}
                                />
                              )}
                            </button>
                          ) : (
                            <span className="zen-inline-block zen-w-4 zen-shrink-0" />
                          )}
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </span>
                      ) : (
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
              })}
              {padBottom > 0 && <tr aria-hidden="true" style={{ height: padBottom }} />}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
