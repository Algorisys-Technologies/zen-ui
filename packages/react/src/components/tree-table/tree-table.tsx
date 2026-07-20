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

  const table = useReactTable<TData>({
    data,
    columns: augmentedColumns as ColumnDef<TData, unknown>[],
    state: {
      expanded: expandedState,
      sorting: sortingState,
      rowSelection: selectionState,
      globalFilter: globalFilterState,
    },
    getSubRows: getSubRows ?? defaultGetSubRows,
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
      if (row.getCanExpand() && !row.getIsExpanded()) row.toggleExpanded(true);
      else if (row.getIsExpanded()) moveBy(row, 1);
    } else if (step === -1) {
      // Backward: close an open node, else climb to the parent.
      e.preventDefault();
      if (row.getIsExpanded()) row.toggleExpanded(false);
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
        row.toggleExpanded();
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
        role="treegrid"
        aria-busy={loading || undefined}
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
            rows.map((row) => {
              const info = siblingInfo.get(row.id);
              return (
                <TableRow
                  key={row.id}
                  ref={(el) => {
                    if (el) rowRefs.current.set(row.id, el);
                    else rowRefs.current.delete(row.id);
                  }}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                row.toggleExpanded();
                              }}
                              className="zen-inline-flex zen-w-4 zen-shrink-0 zen-items-center zen-justify-center zen-border-0 zen-bg-transparent zen-p-0 zen-cursor-pointer zen-text-zen-muted-fg"
                            >
                              <Icon
                                name="chevron-right"
                                size={14}
                                className={cn(
                                  "zen-transition-transform",
                                  row.getIsExpanded() && "zen-rotate-90",
                                )}
                              />
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
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
