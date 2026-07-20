import { For, Show, createEffect, createMemo, createSignal, splitProps } from "solid-js";
import { createVirtualizer } from "@tanstack/solid-virtual";
import {
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type ExpandedState,
  type Row,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/solid-table";
import { arrowStep } from "@algorisys/zen-ui-core";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../data-table/table";
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
 * grouped one — the second would nest inside the first and mean nothing. Adding
 * `getSubRows` to DataTable would therefore need a fifth mutual-exclusion gate
 * on top of the four it already has for virtualization, to describe a
 * combination nobody can use.
 *
 * What that buys, beyond avoiding a gate: the chevron lives INSIDE the first
 * column here, indented by depth, rather than in a leading gutter column the
 * way DataTable's `renderSubRow` toggle does. That is what makes the hierarchy
 * readable — you follow one column down the page. A gutter of chevrons at a
 * fixed offset tells you a row expands but not what it belongs to.
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

  /* pagination — pages the ROOT rows, never the flattened list */
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
  class?: string;
}

export function TreeTable<TData, TValue = unknown>(props: TreeTableProps<TData, TValue>) {
  const [local] = splitProps(props, ["class"]);

  const [expandedInner, setExpandedInner] = createSignal<ExpandedState>(props.defaultExpanded ?? {});
  const [sortingInner, setSortingInner] = createSignal<SortingState>([]);
  const [selectionInner, setSelectionInner] = createSignal<RowSelectionState>({});
  const [globalFilterInner, setGlobalFilterInner] = createSignal("");
  const [pagination, setPagination] = createSignal<PaginationState>({
    pageIndex: 0,
    pageSize: props.pageSize ?? 10,
  });

  const expanded = () => props.expanded ?? expandedInner();
  const sorting = () => props.sorting ?? sortingInner();
  const selection = () => props.rowSelection ?? selectionInner();
  const globalFilter = () => props.globalFilter ?? globalFilterInner();

  const indent = () => props.indent ?? 20;

  /* The selection checkbox goes in its own leading column; the chevron does
   * NOT, because it belongs to the hierarchy column's text.
   *
   * eslint-disable solid/no-destructure -- same false positive DataTable
   * documents at its own `augmentedColumns`: these are TanStack ColumnDef
   * renderers destructuring a per-render context object, not Solid components
   * destructuring reactive props, and the rule cannot tell the two apart.
   */
  /* eslint-disable solid/no-destructure */
  const augmentedColumns = createMemo<ColumnDef<TData, TValue>[]>(() => {
    if (!props.enableRowSelection) return props.columns;
    const select: ColumnDef<TData, TValue> = {
      id: "__select__",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={!table.getIsAllRowsSelected() && table.getIsSomeRowsSelected()}
          onChange={(v: boolean) => table.toggleAllRowsSelected(v)}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => {
        /*
         * A parent's checkbox describes its SUBTREE, not its own row entry.
         * `getIsSelected()` alone is that entry, and TanStack never clears it
         * when a descendant is unticked — so a parent whose child you just
         * unticked would keep rendering "checked" while the row below it says
         * otherwise. Measured: tick Engineering, untick Infrastructure, and the
         * naive version leaves Engineering fully checked.
         */
        const hasChildren = () => row.subRows.length > 0;
        const checked = () =>
          hasChildren()
            ? row.getIsSelected() && row.getIsAllSubRowsSelected()
            : row.getIsSelected();
        const partial = () =>
          !checked() && (row.getIsSomeSelected() || (hasChildren() && row.getIsSelected()));
        return (
          <Checkbox
            checked={checked()}
            indeterminate={partial()}
            onChange={(v: boolean) => row.toggleSelected(v)}
            aria-label={`Select row ${row.index + 1}`}
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 36,
    };
    return [select, ...props.columns];
  });
  /* eslint-enable solid/no-destructure */

  /* ---- lazy children ---- */
  const [loadedKids, setLoadedKids] = createSignal<Record<string, TData[]>>({});
  const [loadingIds, setLoadingIds] = createSignal<ReadonlySet<string>>(new Set());
  /* Bumped after every load so the table rebuilds its row model — see `data`. */
  const [lazyVersion, setLazyVersion] = createSignal(0);

  const lazyKey = (row: TData): string | undefined =>
    props.getRowId?.(row, 0) ?? (row as { id?: string }).id;

  const baseSubRows = (row: TData) => (props.getSubRows ?? defaultGetSubRows)(row);

  /** Not yet loaded, but says it has children. */
  const canLazyLoad = (row: TData) => {
    if (!props.loadChildren || !props.hasChildren?.(row)) return false;
    const key = lazyKey(row);
    return key !== undefined && loadedKids()[key] === undefined;
  };

  const loadFor = async (row: TData) => {
    const key = lazyKey(row);
    if (key === undefined || !props.loadChildren) return;
    if (loadingIds().has(key) || loadedKids()[key] !== undefined) return;
    setLoadingIds((s) => new Set(s).add(key));
    try {
      const kids = await props.loadChildren(row);
      setLoadedKids((m) => ({ ...m, [key]: kids }));
      setLazyVersion((v) => v + 1);
    } catch (err) {
      if (props.onLoadChildrenError) props.onLoadChildrenError(err, row);
      else throw err;
    } finally {
      setLoadingIds((s) => {
        const next = new Set(s);
        next.delete(key);
        return next;
      });
    }
  };

  const isRowLoading = (row: Row<TData>) => {
    const key = lazyKey(row.original);
    return key !== undefined && loadingIds().has(key);
  };

  /**
   * One entry point for opening a row, so the chevron and the keyboard cannot
   * drift: a first open of an unloaded node fetches before it expands.
   */
  const setRowExpanded = (row: Row<TData>, open: boolean) => {
    if (open && canLazyLoad(row.original)) void loadFor(row.original);
    row.toggleExpanded(open);
  };

  const table = createSolidTable<TData>({
    get data() {
      // A fresh top-level identity is what makes TanStack rebuild the row model
      // after a lazy load; returning props.data unchanged memoizes the old one
      // and the fetched children never appear.
      return lazyVersion() > 0 ? [...(props.data ?? [])] : props.data;
    },
    get columns() {
      return augmentedColumns() as ColumnDef<TData, unknown>[];
    },
    state: {
      get expanded() {
        return expanded();
      },
      get sorting() {
        return sorting();
      },
      get rowSelection() {
        return selection();
      },
      get globalFilter() {
        return globalFilter();
      },
      get pagination() {
        return pagination();
      },
    },
    get getSubRows() {
      const loaded = loadedKids();
      return (row: TData) => {
        const key = lazyKey(row);
        if (key !== undefined && loaded[key] !== undefined) return loaded[key];
        return baseSubRows(row);
      };
    },
    /* A row that says it has children is expandable before it has any. */
    getRowCanExpand: (row) => row.subRows.length > 0 || canLazyLoad(row.original),
    get getRowId() {
      return props.getRowId;
    },
    get enableSorting() {
      return props.enableSorting ?? true;
    },
    get enableRowSelection() {
      return !!props.enableRowSelection;
    },
    get enableSubRowSelection() {
      return props.enableSubRowSelection ?? true;
    },
    /*
     * Filter from the leaves up, so a matching child keeps its ancestors on
     * screen. The default drops any row that does not match ITSELF, which for a
     * tree means a hit three levels down takes its whole path with it and the
     * user sees an empty table while the count says otherwise.
     */
    filterFromLeafRows: true,
    onExpandedChange: (updater) => {
      const next = typeof updater === "function" ? updater(expanded()) : updater;
      if (props.expanded === undefined) setExpandedInner(next);
      props.onExpandedChange?.(next);
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting()) : updater;
      if (props.sorting === undefined) setSortingInner(next);
      props.onSortingChange?.(next);
    },
    onRowSelectionChange: (updater) => {
      const next = typeof updater === "function" ? updater(selection()) : updater;
      if (props.rowSelection === undefined) setSelectionInner(next);
      props.onRowSelectionChange?.(next);
    },
    onGlobalFilterChange: (updater) => {
      const next = typeof updater === "function" ? updater(globalFilter()) : updater;
      if (props.globalFilter === undefined) setGlobalFilterInner(next);
      props.onGlobalFilterChange?.(next);
    },
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    /*
     * The whole reason pagination is coherent here. With this false, TanStack
     * pages the ROOT rows and keeps every expanded descendant on the same page
     * as its parent. Left at its default (true) it pages the flattened list,
     * which puts half a subtree on page 2 under no parent at all.
     */
    paginateExpandedRows: false,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(pagination()) : updater;
      setPagination(next);
      props.onPaginationChange?.(next);
    },
    get getPaginationRowModel() {
      return props.enablePagination ? getPaginationRowModel() : undefined;
    },
    get getSortedRowModel() {
      return (props.enableSorting ?? true) ? getSortedRowModel() : undefined;
    },
    get getFilteredRowModel() {
      return props.enableGlobalFilter ? getFilteredRowModel() : undefined;
    },
  });

  const rows = () => table.getRowModel().rows;

  /** The column the hierarchy reads down. */
  const hierarchyColumnId = () => {
    if (props.hierarchyColumnId) return props.hierarchyColumnId;
    return table.getVisibleLeafColumns().find((c) => !c.id.startsWith("__"))?.id;
  };

  /*
   * aria-posinset / aria-setsize are per-parent, not per-page: a treegrid row's
   * "set" is its siblings. TanStack's flat row model does not carry that, so it
   * is counted once per render rather than walked per row.
   */
  const siblingInfo = createMemo(() => {
    const info = new Map<string, { pos: number; size: number }>();
    const byParent = new Map<string, Row<TData>[]>();
    for (const row of rows()) {
      const key = row.parentId ?? "";
      const list = byParent.get(key);
      if (list) list.push(row);
      else byParent.set(key, [row]);
    }
    for (const list of byParent.values()) {
      list.forEach((row, i) => info.set(row.id, { pos: i + 1, size: list.length }));
    }
    return info;
  });

  /* ---- roving focus, the WAI-ARIA treegrid row pattern ---- */
  const rowRefs = new Map<string, HTMLTableRowElement>();
  const [focusedId, setFocusedId] = createSignal<string | null>(null);
  const activeId = () => focusedId() ?? rows()[0]?.id;

  const focusRow = (id: string | undefined | null) => {
    if (!id) return;
    setFocusedId(id);
    rowRefs.get(id)?.focus();
  };

  const moveBy = (from: Row<TData>, delta: number) => {
    const all = rows();
    const i = all.findIndex((r) => r.id === from.id);
    focusRow(all[i + delta]?.id);
  };

  const onRowKeyDown = (e: KeyboardEvent, row: Row<TData>) => {
    const step = arrowStep(e.key, e.currentTarget as Element);
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
      focusRow(rows()[0]?.id);
    } else if (e.key === "End") {
      e.preventDefault();
      focusRow(rows()[rows().length - 1]?.id);
    } else if (e.key === "Enter" || e.key === " ") {
      if (props.onRowClick) {
        e.preventDefault();
        props.onRowClick(row);
      } else if (row.getCanExpand()) {
        e.preventDefault();
        setRowExpanded(row, !row.getIsExpanded());
      }
    }
  };

  /* ---- virtualization ---- */
  let tableEl: HTMLTableElement | undefined;
  /*
   * Virtualizing a TREE means windowing the flattened visible rows, which is
   * exactly what `rows()` already is — expanding a node changes the count and
   * the virtualizer re-derives from it.
   *
   * Spacer rows rather than DataTable's absolutely-positioned `role="table"`
   * grid clone. That clone exists there to survive column pinning and resizing,
   * which this component does not have; and a treegrid is the one place the
   * trade would actually cost something, because leaving real <table> markup
   * would mean re-implementing every row/cell role by hand. Two <tr>s holding
   * the off-screen height keep the semantics AND the sticky header intact.
   */
  const virtualizer = createVirtualizer({
    get count() {
      return rows().length;
    },
    getScrollElement: () => tableEl?.parentElement ?? null,
    estimateSize: () => props.rowEstimatedHeight ?? 44,
    overscan: 8,
  });

  const virtualEnabled = () => !!props.enableVirtualization && !!props.maxBodyHeight;
  const virtualItems = () => virtualizer.getVirtualItems();
  const renderedRows = () =>
    virtualEnabled() ? virtualItems().map((v) => rows()[v.index]).filter(Boolean) : rows();
  const padTop = () => virtualItems()[0]?.start ?? 0;
  const padBottom = () => {
    const items = virtualItems();
    const last = items[items.length - 1];
    return last ? virtualizer.getTotalSize() - last.end : 0;
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
    props.stickyHeader
      ? props.headerVariant === "branded"
        ? "zen-sticky zen-top-0 zen-z-10"
        : "zen-sticky zen-top-0 zen-z-10 zen-bg-zen-background"
      : "";

  const showToolbar = () => props.enableGlobalFilter || (props.enableExpandAll ?? true);

  // In an effect, not at setup: the flag can be toggled after mount, and a
  // setup-time read would report the first value forever. Silently rendering
  // every row would otherwise look like the flag simply did nothing.
  createEffect(() => {
    if (props.enableVirtualization && !props.maxBodyHeight) {
      console.warn(
        "[TreeTable] `enableVirtualization` needs `maxBodyHeight` — without a bounded scroller there is no window. Rendering all rows.",
      );
    }
  });

  return (
    <div class={cn("zen-flex zen-w-full zen-flex-col zen-gap-3", local.class)}>
      <Show when={showToolbar()}>
        <div class="zen-flex zen-flex-wrap zen-items-center zen-gap-2">
          <Show when={props.enableGlobalFilter}>
            <Input
              value={globalFilter()}
              onInput={(e: { currentTarget: HTMLInputElement }) => table.setGlobalFilter(e.currentTarget.value)}
              placeholder={props.globalFilterPlaceholder ?? "Search…"}
              class="zen-max-w-xs"
              aria-label="Search"
            />
          </Show>
          <Show when={props.enableExpandAll ?? true}>
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
          </Show>
        </div>
      </Show>

      <Table
        ref={(el: HTMLTableElement) => (tableEl = el)}
        role="treegrid"
        aria-busy={props.loading || undefined}
        // With a window, the DOM no longer holds every row, so the total has to
        // be stated rather than counted.
        aria-rowcount={virtualEnabled() ? rows().length : undefined}
        containerClass={props.maxBodyHeight ? "zen-overflow-auto" : undefined}
        containerStyle={
          props.maxBodyHeight ? { "max-height": `${props.maxBodyHeight}px` } : undefined
        }
      >
        <TableHeader class={headerVariantTheadClass()}>
          <For each={table.getHeaderGroups()}>
            {(group) => (
              <TableRow class={cn(headerVariantRowClass(), stickyRowClass())}>
                <For each={group.headers}>
                  {(header) => {
                    const sorted = () => header.column.getIsSorted();
                    return (
                      <TableHead
                        style={header.column.getSize() ? { width: `${header.getSize()}px` } : undefined}
                        aria-sort={
                          sorted() === "asc"
                            ? "ascending"
                            : sorted() === "desc"
                              ? "descending"
                              : header.column.getCanSort()
                                ? "none"
                                : undefined
                        }
                      >
                        <Show when={!header.isPlaceholder}>
                          <Show
                            when={header.column.getCanSort()}
                            fallback={flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          >
                            <button
                              type="button"
                              onClick={header.column.getToggleSortingHandler()}
                              class="zen-inline-flex zen-items-center zen-gap-1 zen-border-0 zen-bg-transparent zen-p-0 zen-font-inherit zen-text-inherit zen-cursor-pointer focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              <Show when={sorted()}>
                                <Icon
                                  name={sorted() === "asc" ? "chevron-up" : "chevron-down"}
                                  size={12}
                                />
                              </Show>
                            </button>
                          </Show>
                        </Show>
                      </TableHead>
                    );
                  }}
                </For>
              </TableRow>
            )}
          </For>
        </TableHeader>

        <TableBody>
          <Show
            when={!props.loading && rows().length > 0}
            fallback={
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  class="zen-h-24 zen-text-center zen-text-zen-muted-fg"
                >
                  {props.loading ? "Loading…" : (props.emptyMessage ?? "No results.")}
                </TableCell>
              </TableRow>
            }
          >
            <Show when={virtualEnabled() && padTop() > 0}>
              <tr aria-hidden="true" style={{ height: `${padTop()}px` }} />
            </Show>
            <For each={renderedRows()}>
              {(row) => renderRow(row)}
            </For>
            <Show when={virtualEnabled() && padBottom() > 0}>
              <tr aria-hidden="true" style={{ height: `${padBottom()}px` }} />
            </Show>
          </Show>
        </TableBody>
      </Table>

      <Show when={props.enablePagination}>
        <div class="zen-flex zen-flex-wrap zen-items-center zen-justify-between zen-gap-2">
          <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
            {/* Roots, not rows: saying "rows" here would contradict what the
                user can count on screen the moment anything is expanded. */}
            Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
            {" · "}
            {table.getPreFilteredRowModel().rows.filter((r) => r.depth === 0).length} top-level rows
          </p>
          <div class="zen-flex zen-items-center zen-gap-2">
            <Show when={props.pageSizeOptions?.length}>
              <select
                class="zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-2 zen-py-1 zen-text-sm"
                aria-label="Rows per page"
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.currentTarget.value))}
              >
                <For each={props.pageSizeOptions}>
                  {(n) => <option value={n}>{n} per page</option>}
                </For>
              </select>
            </Show>
            <Button
              variant="outline"
              size="sm"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </Show>
    </div>
  );

  function renderRow(row: Row<TData>) {
                const info = () => siblingInfo().get(row.id);
                return (
                  <TableRow
                    ref={(el: HTMLTableRowElement) => {
                      rowRefs.set(row.id, el);
                      // Let real heights replace the estimate; rows are in
                      // normal flow, so this measures without a second pass.
                      if (virtualEnabled()) virtualizer.measureElement(el);
                    }}
                    data-index={virtualEnabled() ? rows().findIndex((r) => r.id === row.id) : undefined}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    data-depth={row.depth}
                    class={cn(
                      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset",
                      props.onRowClick && "zen-cursor-pointer",
                      props.rowClassName?.(row),
                    )}
                    // aria-level is 1-based; TanStack's depth is 0-based.
                    aria-level={row.depth + 1}
                    aria-expanded={row.getCanExpand() ? row.getIsExpanded() : undefined}
                    aria-rowindex={
                      virtualEnabled() ? rows().findIndex((r) => r.id === row.id) + 1 : undefined
                    }
                    aria-posinset={info()?.pos}
                    aria-setsize={info()?.size}
                    aria-selected={props.enableRowSelection ? row.getIsSelected() : undefined}
                    tabIndex={activeId() === row.id ? 0 : -1}
                    onFocus={() => setFocusedId(row.id)}
                    onKeyDown={(e) => onRowKeyDown(e, row)}
                    onClick={() => props.onRowClick?.(row)}
                  >
                    <For each={row.getVisibleCells()}>
                      {(cell) => (
                        <TableCell>
                          <Show
                            when={cell.column.id === hierarchyColumnId()}
                            fallback={flexRender(cell.column.columnDef.cell, cell.getContext())}
                          >
                            <span
                              class="zen-flex zen-items-center zen-gap-1"
                              /* Inline, not a utility: depth is unbounded, so no
                                 finite class set can express it. Same reasoning
                                 as Tree's indent. */
                              style={{ "padding-inline-start": `${row.depth * indent()}px` }}
                            >
                              <Show
                                when={row.getCanExpand()}
                                fallback={<span class="zen-inline-block zen-w-4 zen-shrink-0" />}
                              >
                                <button
                                  type="button"
                                  // The row handles arrows; this button is the
                                  // pointer affordance and must not also steal a
                                  // tab stop from the roving row focus.
                                  tabIndex={-1}
                                  aria-busy={isRowLoading(row) || undefined}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRowExpanded(row, !row.getIsExpanded());
                                  }}
                                  aria-hidden="true"
                                  class="zen-inline-flex zen-w-4 zen-shrink-0 zen-items-center zen-justify-center zen-border-0 zen-bg-transparent zen-p-0 zen-cursor-pointer zen-text-zen-muted-fg"
                                >
                                  <Show
                                    when={isRowLoading(row)}
                                    fallback={
                                      <Icon
                                        name="chevron-right"
                                        size={14}
                                        class={cn(
                                          "zen-transition-transform",
                                          row.getIsExpanded() && "zen-rotate-90",
                                        )}
                                      />
                                    }
                                  >
                                    {/* A fetch has no length the caller can predict, so the
                                        chevron itself reports it rather than the row jumping
                                        to a placeholder that may be replaced in 40ms. */}
                                    <span
                                      class="zen-inline-block zen-h-3 zen-w-3 zen-animate-spin zen-rounded-zen-full zen-border zen-border-zen-border zen-border-t-zen-primary"
                                    />
                                  </Show>
                                </button>
                              </Show>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </span>
                          </Show>
                        </TableCell>
                      )}
                    </For>
                  </TableRow>
                );
  }
}
