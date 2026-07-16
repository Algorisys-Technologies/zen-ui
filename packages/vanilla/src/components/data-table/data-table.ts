import { cn } from "../../lib/cn";
import {
  Disposer,
  toNodes,
  type AnyZenComponent,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import { Checkbox } from "../form/checkbox/checkbox";
import { Button } from "../button/button";
import { Input, type InputHandle } from "../form/input/input";
import { Select } from "../form/select/select";
import { VirtualizedItems } from "../listbox/virtualized-items";

/**
 * DataTable — the headless data grid, hand-written for the vanilla binding.
 *
 * React backs this with `@tanstack/react-table` + `@tanstack/react-virtual` and a
 * pile of Radix primitives. There is no TanStack here and no new runtime dep is
 * allowed, so the data layer — column access, sorting, client pagination, row
 * selection, and the windowing maths — lives in this file. That is the honest cost
 * of the port, the same way `focus-trap` / `dismissable` are.
 *
 * It stays data-driven rather than compound: instead of React's `ColumnDef` objects
 * from a library it can't import, callers pass a `DataTableColumn[]` describing each
 * column (`accessorKey`, `header`, an optional `cell` render fn). Every capability is
 * opt-in via a flag, mirroring React's public API:
 *
 *   const table = DataTable({
 *     data: people,
 *     columns: [
 *       { accessorKey: "name",  header: "Name" },
 *       { accessorKey: "role",  header: "Role" },
 *       { accessorKey: "status", header: "Status",
 *         cell: ({ row }) => Badge({ children: row.status }) },
 *     ],
 *     enableSorting: true,
 *     enablePagination: true,
 *     enableRowSelection: true,
 *   });
 *   document.body.append(table.el);
 *
 * There is no render loop: state changes are DOM writes made on purpose. A sort
 * click / page change / selection toggle recomputes the processed rows and repaints
 * the body. In virtualized mode the body is a `VirtualizedItems` viewport that
 * mounts only the rows on screen, so 2 000 rows cost the ~15 that are visible.
 *
 * Deliberately NOT ported (they lean on Radix DropdownMenu / dnd-kit / inline
 * editing that this binding does not ship): column visibility menu, per-column
 * filters, grouping, pinning, resizing, column/row drag reorder, inline cell edit,
 * export menu, and expandable sub-rows. The core grid — columns, rows, sorting,
 * pagination, selection, virtualization — is complete.
 */

/* ------------------------------------------------------------------ types */

export interface DataTableCellContext<TData> {
  /** The original row datum. */
  row: TData;
  /** `row[accessorKey]`, or undefined when the column has no accessor. */
  value: unknown;
  /** The row's index in the source `data` array. */
  index: number;
}

export interface DataTableColumn<TData> {
  /** Stable column id. Defaults to `accessorKey`. */
  id?: string;
  /** Key on the row datum this column reads. */
  accessorKey?: string;
  /** Header label. */
  header?: string;
  /** Custom cell renderer. Defaults to the accessor value as text. */
  cell?: (info: DataTableCellContext<TData>) => Child;
  /** Per-column sorting opt-out. Sorting must also be enabled table-wide. */
  enableSorting?: boolean;
  /** Explicit px width. In virtualized mode a column without `size` shares the remaining width. */
  size?: number;
  /** Custom comparator for this column. Defaults to numeric / locale-string compare of the accessor value. */
  sortingFn?: (a: TData, b: TData) => number;
}

export interface SortingColumn {
  id: string;
  desc: boolean;
}
export type SortingState = SortingColumn[];

export interface DataTableManualPagination {
  pageIndex: number;
  pageCount: number;
  pageSize?: number;
  onPageChange: (next: number) => void;
}

export interface DataTableProps<TData> {
  data: TData[];
  columns: DataTableColumn<TData>[];

  /* feature toggles */
  enableSorting?: boolean;
  /** Shift-click a second header to chain sorts. Implies `enableSorting`. */
  enableMultiSort?: boolean;
  enablePagination?: boolean;
  /** Show a global search box in the toolbar. */
  enableColumnFilters?: boolean;
  enableRowSelection?: boolean;
  enableVirtualization?: boolean;
  /** 1-px vertical dividers between columns (Zen theme table spec, opt-in). */
  enableColumnSeparators?: boolean;

  /** Brand intensity of the header row. */
  headerVariant?: "plain" | "underline" | "branded";
  /** Pin the header to the top of a `maxBodyHeight` scroll viewport (non-virtualized only). */
  stickyHeader?: boolean;

  /* layout / messages */
  pageSize?: number;
  pageSizeOptions?: number[];
  maxBodyHeight?: number;
  rowEstimatedHeight?: number;
  globalFilterPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;

  /** Stable row-id resolver. Defaults to the row's array index. */
  getRowId?: (row: TData, index: number) => string;
  /** Per-row class hook; merged after the built-in row classes. */
  rowClassName?: (row: TData, index: number) => string | undefined;

  /* server-driven pagination */
  manualPagination?: DataTableManualPagination;

  /* controlled state (all optional) */
  sorting?: SortingState;
  onSortingChange?: (state: SortingState) => void;
  /** Controlled selection, as an array of row ids. */
  rowSelection?: string[];
  onRowSelectionChange?: (selectedIds: string[]) => void;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;

  class?: string;
  id?: string;
}

/* ------------------------------------------------------------- shared classes */

const TABLE_ROW_CLASS = cn(
  "zen-border-b zen-border-zen-border",
  "zen-transition-[background-color,box-shadow,outline-color] zen-duration-100",
  "hover:zen-bg-zen-muted/50 hover:zen-shadow-zen-sm",
  "data-[state=selected]:zen-bg-zen-primary-soft",
  "data-[state=selected]:zen-[box-shadow:0_4px_12px_0_var(--zen-color-primary-soft)]",
  "data-[state=selected]:zen-outline data-[state=selected]:zen-outline-1 data-[state=selected]:-zen-outline-offset-1 data-[state=selected]:zen-outline-zen-primary",
);
const TABLE_HEAD_CLASS =
  "zen-h-10 zen-px-2 zen-py-2 zen-text-left zen-align-middle zen-font-medium zen-text-xs zen-text-zen-muted-fg";
const TABLE_CELL_CLASS =
  "zen-px-2 zen-py-3 zen-align-middle zen-text-sm zen-text-zen-foreground";
const VIRT_CELL_CLASS =
  "zen-px-2 zen-py-3 zen-flex zen-items-center zen-text-sm zen-text-zen-foreground zen-min-w-0 zen-overflow-hidden";
const VIRT_HEAD_CLASS =
  "zen-h-10 zen-flex zen-items-center zen-text-xs zen-font-medium zen-text-zen-muted-fg zen-relative";

const SORT_BTN_CLASS = cn(
  "zen-w-full zen-h-full zen-px-2 zen-py-2",
  "zen-inline-flex zen-items-center zen-gap-1 zen-text-left zen-font-inherit zen-text-inherit",
  "zen-bg-transparent zen-border-0 zen-cursor-pointer",
  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset",
);

/* ------------------------------------------------------------------ helpers */

function h(tag: string, className?: string): HTMLElement {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

// Our own trusted SVG markup — the one innerHTML exception PORTING.md names.
function svgNode(markup: string): SVGElement {
  const t = document.createElement("template");
  t.innerHTML = markup;
  return t.content.firstElementChild as SVGElement;
}

const SORT_ASC = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>`;
const SORT_DESC = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;
const SORT_NONE = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="zen-opacity-30" aria-hidden="true"><polyline points="8 9 12 5 16 9"/><polyline points="16 15 12 19 8 15"/></svg>`;

const sortIndicator = (state: false | "asc" | "desc"): SVGElement =>
  svgNode(state === "asc" ? SORT_ASC : state === "desc" ? SORT_DESC : SORT_NONE);

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

/* ----------------------------------------------------------------- factory */

export function DataTable<TData>(
  props: DataTableProps<TData>,
): ZenComponent<DataTableProps<TData>> {
  let current: DataTableProps<TData> = { ...props };

  /* internal (uncontrolled) state */
  let sortingInner: SortingState = current.sorting ? [...current.sorting] : [];
  let selectionInner = new Set<string>(current.rowSelection ?? []);
  let globalFilterInner = current.globalFilter ?? "";
  let pageIndexInner = 0;
  let pageSizeInner = current.pageSize ?? 10;

  const disposer = new Disposer();
  /* ZenComponents this file creates directly (header + non-virt body checkboxes,
   * pagination controls). Cleared and rebuilt on every sync. Virtualized-body row
   * checkboxes are owned by VirtualizedItems, not tracked here. */
  let mounted: AnyZenComponent[] = [];
  const clearMounted = () => {
    for (const c of mounted) c.destroy();
    mounted = [];
  };

  let virt: ZenComponent<{ items: DisplayRow[] }> | null = null;
  let builtMode: "virt" | "table" | null = null;
  let virtHeaderEl: HTMLElement | null = null;

  interface DisplayRow {
    row: TData;
    index: number;
  }

  /* ----- structure ----- */
  const el = h("div", cn("zen-space-y-3", current.class));
  if (current.id) el.id = current.id;

  const toolbarEl = h("div", "zen-flex zen-items-center zen-gap-2");
  const containerEl = h("div", "zen-rounded-zen-md zen-border zen-border-zen-border");
  const paginationEl = h(
    "div",
    "zen-flex zen-items-center zen-justify-between zen-gap-3 zen-text-sm",
  );

  /* Persistent global-filter input — created ONCE so typing keeps focus across the
   * body repaints its onInput triggers. */
  let filterInput: InputHandle | null = null;
  if (current.enableColumnFilters) {
    filterInput = Input({
      value: globalFilterInner,
      placeholder: current.globalFilterPlaceholder ?? "Search…",
      class: "zen-max-w-xs",
      onInput: (e) => {
        const v = (e.target as HTMLInputElement).value;
        if (current.globalFilter === undefined) globalFilterInner = v;
        current.onGlobalFilterChange?.(v);
        pageIndexInner = 0;
        sync();
      },
    });
    disposer.add(() => filterInput?.destroy());
    toolbarEl.append(filterInput.el);
    el.append(toolbarEl);
  }
  el.append(containerEl);
  disposer.add(() => {
    if (virt) virt.destroy();
    clearMounted();
  });

  /* ----- derived reads ----- */
  const effSorting = (): SortingState => current.sorting ?? sortingInner;
  const effSelection = (): Set<string> =>
    current.rowSelection ? new Set(current.rowSelection) : selectionInner;
  const effGlobalFilter = (): string => current.globalFilter ?? globalFilterInner;
  const isVirt = (): boolean => !!current.enableVirtualization;
  const rowHeight = (): number => current.rowEstimatedHeight ?? 44;
  const bodyHeight = (): number => current.maxBodyHeight ?? 480;

  const leafColumns = (): DataTableColumn<TData>[] => current.columns;
  const colId = (col: DataTableColumn<TData>): string =>
    col.id ?? col.accessorKey ?? "";
  const colById = (id: string): DataTableColumn<TData> | undefined =>
    current.columns.find((c) => colId(c) === id);
  const headerText = (col: DataTableColumn<TData>): string =>
    col.header ?? colId(col);
  const getValue = (col: DataTableColumn<TData> | undefined, row: TData): unknown =>
    col?.accessorKey ? (row as Record<string, unknown>)[col.accessorKey] : undefined;
  const rowIdOf = (row: TData, index: number): string =>
    current.getRowId ? current.getRowId(row, index) : String(index);
  const canSort = (col: DataTableColumn<TData>): boolean =>
    !!current.enableSorting && col.enableSorting !== false && !!col.accessorKey;

  const renderCell = (
    col: DataTableColumn<TData>,
    row: TData,
    index: number,
  ): Child => {
    const value = getValue(col, row);
    if (col.cell) return col.cell({ row, value, index });
    return value == null ? "" : String(value);
  };

  /* ----- row pipeline ----- */
  function processRows(): DisplayRow[] {
    let rows: DisplayRow[] = current.data.map((row, index) => ({ row, index }));

    if (current.enableColumnFilters) {
      const q = effGlobalFilter().trim().toLowerCase();
      if (q) {
        rows = rows.filter((r) =>
          leafColumns().some((c) =>
            String(getValue(c, r.row) ?? "")
              .toLowerCase()
              .includes(q),
          ),
        );
      }
    }

    const sorting = effSorting();
    if (current.enableSorting && sorting.length) {
      rows = [...rows].sort((a, b) => {
        for (const s of sorting) {
          const col = colById(s.id);
          const cmp = col?.sortingFn
            ? col.sortingFn(a.row, b.row)
            : compareValues(getValue(col, a.row), getValue(col, b.row));
          if (cmp !== 0) return s.desc ? -cmp : cmp;
        }
        return 0;
      });
    }
    return rows;
  }

  const effPageSize = (): number =>
    current.manualPagination
      ? current.manualPagination.pageSize ?? current.pageSize ?? 10
      : pageSizeInner;
  const effPageIndex = (): number =>
    current.manualPagination ? current.manualPagination.pageIndex : pageIndexInner;
  const pageCountOf = (processed: DisplayRow[]): number =>
    current.manualPagination
      ? current.manualPagination.pageCount
      : Math.max(1, Math.ceil(processed.length / Math.max(1, effPageSize())));

  const paginationActive = (): boolean =>
    (!!current.enablePagination && !isVirt()) || !!current.manualPagination;

  function computeDisplay(processed: DisplayRow[]): DisplayRow[] {
    if (current.manualPagination) return processed; // caller already sliced
    if (current.enablePagination && !isVirt()) {
      const size = effPageSize();
      const start = effPageIndex() * size;
      return processed.slice(start, start + size);
    }
    return processed;
  }

  /* ----- sorting ----- */
  function handleSort(id: string, additive: boolean): void {
    const cur = effSorting();
    const existing = cur.find((s) => s.id === id);
    const multi = !!current.enableMultiSort && additive;
    let next: SortingState;
    if (!multi) {
      if (!existing) next = [{ id, desc: false }];
      else if (!existing.desc) next = [{ id, desc: true }];
      else next = [];
    } else if (!existing) {
      next = [...cur, { id, desc: false }];
    } else if (!existing.desc) {
      next = cur.map((s) => (s.id === id ? { id, desc: true } : s));
    } else {
      next = cur.filter((s) => s.id !== id);
    }
    if (current.sorting === undefined) sortingInner = next;
    current.onSortingChange?.(next);
    sync();
  }

  const sortStateOf = (id: string): false | "asc" | "desc" => {
    const s = effSorting().find((x) => x.id === id);
    return s ? (s.desc ? "desc" : "asc") : false;
  };
  const sortIndexOf = (id: string): number | null => {
    if (!current.enableMultiSort) return null;
    const s = effSorting();
    if (s.length <= 1) return null;
    const i = s.findIndex((x) => x.id === id);
    return i >= 0 ? i + 1 : null;
  };

  /* ----- selection ----- */
  function commitSelection(sel: Set<string>): void {
    if (current.rowSelection === undefined) selectionInner = sel;
    current.onRowSelectionChange?.([...sel]);
    sync();
  }
  function toggleRow(id: string): void {
    const sel = new Set(effSelection());
    if (sel.has(id)) sel.delete(id);
    else sel.add(id);
    commitSelection(sel);
  }
  function toggleAll(processed: DisplayRow[]): void {
    const ids = processed.map((r) => rowIdOf(r.row, r.index));
    const sel = new Set(effSelection());
    const allSelected = ids.length > 0 && ids.every((i) => sel.has(i));
    if (allSelected) ids.forEach((i) => sel.delete(i));
    else ids.forEach((i) => sel.add(i));
    commitSelection(sel);
  }
  function headerCheckState(
    processed: DisplayRow[],
  ): boolean | "indeterminate" {
    const ids = processed.map((r) => rowIdOf(r.row, r.index));
    if (ids.length === 0) return false;
    const sel = effSelection();
    const n = ids.filter((i) => sel.has(i)).length;
    return n === 0 ? false : n === ids.length ? true : "indeterminate";
  }

  /* ----- header building blocks ----- */
  function sortButton(col: DataTableColumn<TData>): HTMLElement {
    const id = colId(col);
    const sorted = sortStateOf(id);
    const btn = h("button", SORT_BTN_CLASS);
    (btn as HTMLButtonElement).type = "button";
    const label =
      sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none";
    btn.setAttribute(
      "aria-label",
      `Sort by ${headerText(col)}, currently ${label}`,
    );
    btn.append(document.createTextNode(headerText(col)), sortIndicator(sorted));
    const idx = sortIndexOf(id);
    if (idx !== null) {
      const badge = h(
        "span",
        "zen-text-[1rem] zen-font-semibold zen-text-zen-muted-fg zen-ml-0.5",
      );
      badge.setAttribute("aria-hidden", "true");
      badge.title = `Sort priority ${idx}`;
      badge.textContent = String(idx);
      btn.append(badge);
    }
    btn.addEventListener("click", (e) =>
      handleSort(id, (e as MouseEvent).shiftKey),
    );
    return btn;
  }
  function plainHeaderSpan(col: DataTableColumn<TData>): HTMLElement {
    const span = h(
      "span",
      "zen-px-2 zen-py-2 zen-inline-flex zen-items-center zen-gap-1",
    );
    span.textContent = headerText(col);
    return span;
  }

  /* ----- headerVariant machinery ----- */
  const headerStickyBg = (): string =>
    current.headerVariant === "branded"
      ? "var(--zen-color-primary-soft)"
      : "var(--zen-color-background)";
  const headerVariantRowClass = (): string =>
    current.headerVariant === "branded"
      ? "zen-bg-zen-primary-soft [&>th]:zen-text-zen-primary-soft-fg [&>th]:zen-font-semibold"
      : "";
  const headerVariantTheadClass = (): string =>
    current.headerVariant === "underline"
      ? "[&_tr:last-child]:zen-border-b-2 [&_tr:last-child]:zen-border-zen-primary"
      : "";
  const brandedCellClass = (): string =>
    current.headerVariant === "branded"
      ? "zen-text-zen-primary-soft-fg zen-font-semibold"
      : "";

  const sepCellClass = (): string =>
    current.enableColumnSeparators
      ? "zen-border-r zen-border-zen-border last:zen-border-r-0"
      : "";
  const sepHeadClass = (): string =>
    current.enableColumnSeparators
      ? "[&>th]:zen-border-r [&>th]:zen-border-zen-border [&>th:last-child]:zen-border-r-0"
      : "";

  /* ----- non-virtualized table ----- */
  function totalColumnCount(): number {
    return leafColumns().length + (current.enableRowSelection ? 1 : 0);
  }

  function messageRow(text: string): HTMLElement {
    const tr = h("tr");
    const td = h("td", "zen-text-center zen-text-zen-muted-fg zen-py-6");
    td.setAttribute("colspan", String(totalColumnCount()));
    td.textContent = text;
    tr.append(td);
    return tr;
  }

  function buildTable(processed: DisplayRow[], display: DisplayRow[]): HTMLElement {
    const stickyActive = !!current.stickyHeader && !isVirt();
    const wrapper = h("div", "zen-relative zen-w-full zen-overflow-auto");
    if (stickyActive) wrapper.style.maxHeight = `${bodyHeight()}px`;

    const table = h(
      "table",
      "zen-w-full zen-caption-bottom zen-text-sm zen-border-collapse",
    );

    /* thead */
    const thead = h(
      "thead",
      cn(
        "[&_tr]:zen-border-b [&_tr]:zen-border-zen-border",
        headerVariantTheadClass(),
      ),
    );
    const stickyRowClass = stickyActive
      ? current.headerVariant === "branded"
        ? "zen-sticky zen-top-0 zen-z-10"
        : "zen-sticky zen-top-0 zen-z-10 zen-bg-zen-background"
      : "";
    const htr = h(
      "tr",
      cn(sepHeadClass(), stickyRowClass, headerVariantRowClass()),
    );

    if (current.enableRowSelection) {
      const th = h("th", cn(TABLE_HEAD_CLASS, "zen-w-9"));
      const cb = Checkbox({
        checked: headerCheckState(processed),
        onCheckedChange: () => toggleAll(processed),
        "aria-label": "Select all rows",
      });
      mounted.push(cb);
      th.append(cb.el);
      htr.append(th);
    }

    for (const col of leafColumns()) {
      const sortable = canSort(col);
      const sorted = sortStateOf(colId(col));
      const th = h(
        "th",
        cn(
          TABLE_HEAD_CLASS,
          "zen-p-0 zen-transition-colors zen-relative",
          sortable && "hover:zen-bg-zen-muted",
          "data-[active=true]:zen-bg-zen-primary-soft data-[active=true]:zen-text-zen-primary-soft-fg",
        ),
      );
      if (col.size) th.style.width = `${col.size}px`;
      if (sorted) {
        th.setAttribute("data-active", "true");
        th.setAttribute(
          "aria-sort",
          sorted === "asc" ? "ascending" : "descending",
        );
      }
      th.append(sortable ? sortButton(col) : plainHeaderSpan(col));
      htr.append(th);
    }
    thead.append(htr);

    /* tbody */
    const tbody = h("tbody", "[&_tr:last-child]:zen-border-0");
    if (current.loading) {
      tbody.append(messageRow("Loading…"));
    } else if (display.length === 0) {
      tbody.append(messageRow(current.emptyMessage ?? "No results."));
    } else {
      for (const r of display) {
        const id = rowIdOf(r.row, r.index);
        const selected = effSelection().has(id);
        const tr = h(
          "tr",
          cn(TABLE_ROW_CLASS, current.rowClassName?.(r.row, r.index)),
        );
        if (selected) tr.setAttribute("data-state", "selected");

        if (current.enableRowSelection) {
          const td = h("td", cn(TABLE_CELL_CLASS, sepCellClass()));
          const cb = Checkbox({
            checked: selected,
            onCheckedChange: () => toggleRow(id),
            "aria-label": `Select row ${r.index + 1}`,
          });
          mounted.push(cb);
          td.append(cb.el);
          tr.append(td);
        }

        for (const col of leafColumns()) {
          const td = h("td", cn(TABLE_CELL_CLASS, sepCellClass()));
          const content = renderCell(col, r.row, r.index);
          collectInto(content, mounted);
          td.append(...toNodes(content));
          tr.append(td);
        }
        tbody.append(tr);
      }
    }

    table.append(thead, tbody);
    wrapper.append(table);
    return wrapper;
  }

  /* ----- virtualized body ----- */
  function gridTemplate(): string {
    const parts: string[] = [];
    if (current.enableRowSelection) parts.push("36px");
    for (const col of leafColumns()) {
      parts.push(col.size ? `${col.size}px` : "minmax(0, 1fr)");
    }
    return parts.join(" ");
  }

  function paintVirtHeader(processed: DisplayRow[]): void {
    if (!virtHeaderEl) return;
    virtHeaderEl.replaceChildren();
    virtHeaderEl.style.display = "grid";
    virtHeaderEl.style.gridTemplateColumns = gridTemplate();
    virtHeaderEl.style.background = headerStickyBg();
    virtHeaderEl.style.borderBottom =
      current.headerVariant === "underline"
        ? "2px solid var(--zen-color-primary)"
        : "1px solid var(--zen-color-border)";

    if (current.enableRowSelection) {
      const cell = h("div", "zen-flex zen-items-center zen-justify-center zen-px-2");
      const cb = Checkbox({
        checked: headerCheckState(processed),
        onCheckedChange: () => toggleAll(processed),
        "aria-label": "Select all rows",
      });
      mounted.push(cb);
      cell.append(cb.el);
      virtHeaderEl.append(cell);
    }

    for (const col of leafColumns()) {
      const sortable = canSort(col);
      const sorted = sortStateOf(colId(col));
      const cell = h(
        "div",
        cn(
          VIRT_HEAD_CLASS,
          brandedCellClass(),
          sorted &&
            "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
        ),
      );
      if (sorted) {
        cell.setAttribute("data-active", "true");
        cell.setAttribute(
          "aria-sort",
          sorted === "asc" ? "ascending" : "descending",
        );
      }
      cell.append(sortable ? sortButton(col) : plainHeaderSpan(col));
      virtHeaderEl.append(cell);
    }
  }

  function renderVirtRow(args: { item: DisplayRow; index: number }): Node {
    const { row, index } = args.item;
    const id = rowIdOf(row, index);
    const selected = effSelection().has(id);
    const rowEl = h(
      "div",
      cn(TABLE_ROW_CLASS, current.rowClassName?.(row, index)),
    );
    rowEl.style.display = "grid";
    rowEl.style.gridTemplateColumns = gridTemplate();
    rowEl.style.height = "100%";
    if (selected) rowEl.setAttribute("data-state", "selected");

    if (current.enableRowSelection) {
      const cell = h("div", "zen-flex zen-items-center zen-justify-center zen-px-2");
      // Owned by VirtualizedItems' collectComponents (Checkbox exposes el + destroy).
      cell.append(
        Checkbox({
          checked: selected,
          onCheckedChange: () => toggleRow(id),
          "aria-label": `Select row ${index + 1}`,
        }).el,
      );
      rowEl.append(cell);
    }

    for (const col of leafColumns()) {
      const cell = h("div", cn(VIRT_CELL_CLASS, sepCellClass()));
      cell.append(...toNodes(renderCell(col, row, index)));
      rowEl.append(cell);
    }
    return rowEl;
  }

  /* ----- pagination bar ----- */
  function paintPagination(processed: DisplayRow[]): void {
    paginationEl.replaceChildren();
    if (!paginationActive()) {
      paginationEl.remove();
      return;
    }
    if (!paginationEl.isConnected) el.append(paginationEl);

    const pageIndex = effPageIndex();
    const pageCount = pageCountOf(processed);
    const manual = !!current.manualPagination;
    const selectedCount = effSelection().size;
    const totalCount = processed.length;

    const info = h("div", "zen-text-zen-muted-fg");
    info.textContent = current.enableRowSelection
      ? `${selectedCount} of ${totalCount} row(s) selected.`
      : `Page ${pageIndex + 1} of ${Math.max(pageCount, 1)}`;

    const right = h("div", "zen-flex zen-items-center zen-gap-3");

    if (!manual) {
      const group = h("div", "zen-flex zen-items-center zen-gap-2");
      const lbl = h("span", "zen-text-zen-muted-fg");
      lbl.textContent = "Rows per page";
      const selWrap = h("div");
      selWrap.style.width = "88px";
      const opts = current.pageSizeOptions ?? [10, 20, 50, 100];
      const sel = Select({
        options: opts.map((s) => ({ value: String(s), label: String(s) })),
        value: String(effPageSize()),
        onValueChange: (v) => {
          pageSizeInner = Number(v);
          pageIndexInner = 0;
          sync();
        },
      });
      mounted.push(sel);
      selWrap.append(sel.el);
      group.append(lbl, selWrap);
      right.append(group);
    }

    const setPage = (i: number): void => {
      const clamped = Math.max(0, Math.min(i, pageCount - 1));
      if (manual) current.manualPagination!.onPageChange(clamped);
      else pageIndexInner = clamped;
      sync();
    };
    const canPrev = pageIndex > 0;
    const canNext = pageIndex < pageCount - 1;

    const nav = h("div", "zen-flex zen-items-center zen-gap-1");
    const navBtn = (
      label: string,
      aria: string,
      disabled: boolean,
      onClick: () => void,
    ): void => {
      const b = Button({
        variant: "outline",
        color: "neutral",
        size: "sm",
        disabled,
        "aria-label": aria,
        children: label,
        onClick,
      });
      mounted.push(b);
      nav.append(b.el);
    };
    navBtn("«", "First page", !canPrev, () => setPage(0));
    navBtn("‹", "Previous page", !canPrev, () => setPage(pageIndex - 1));
    navBtn("›", "Next page", !canNext, () => setPage(pageIndex + 1));
    navBtn("»", "Last page", !canNext, () => setPage(pageCount - 1));
    right.append(nav);

    paginationEl.append(info, right);
  }

  /* ----- the single render pass ----- */
  function sync(): void {
    clearMounted();
    const processed = processRows();
    const display = computeDisplay(processed);

    const mode: "virt" | "table" = isVirt() ? "virt" : "table";
    if (mode !== builtMode) {
      if (virt) {
        virt.destroy();
        virt = null;
      }
      containerEl.replaceChildren();
      builtMode = mode;
      if (mode === "virt") {
        virtHeaderEl = h("div");
        containerEl.append(virtHeaderEl);
        virt = VirtualizedItems<DisplayRow>({
          items: display,
          estimateSize: rowHeight(),
          maxHeight: bodyHeight(),
          overscan: 8,
          children: renderVirtRow,
        }) as ZenComponent<{ items: DisplayRow[] }>;
        containerEl.append(virt.el);
      }
    }

    if (mode === "table") {
      containerEl.replaceChildren(buildTable(processed, display));
    } else {
      paintVirtHeader(processed);
      virt!.update({
        items: display,
        estimateSize: rowHeight(),
        maxHeight: bodyHeight(),
      } as Partial<{ items: DisplayRow[] }>);
    }

    if (current.loading) containerEl.setAttribute("aria-busy", "true");
    else containerEl.removeAttribute("aria-busy");

    paintPagination(processed);
  }

  sync();

  return {
    el,
    update(next: Partial<DataTableProps<TData>>) {
      current = { ...current, ...next };
      if (next.class !== undefined) el.className = cn("zen-space-y-3", current.class);
      if (next.id !== undefined) el.id = current.id ?? "";
      if (next.globalFilter !== undefined && filterInput) {
        filterInput.update({ value: current.globalFilter });
      }
      sync();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

/** Recursively pull ZenComponents out of a render result so they can be destroyed. */
function collectInto(child: Child, acc: AnyZenComponent[]): void {
  if (child === null || child === undefined || child === false) return;
  if (Array.isArray(child)) {
    for (const c of child) collectInto(c, acc);
    return;
  }
  if (
    typeof child === "object" &&
    "el" in child &&
    typeof (child as AnyZenComponent).destroy === "function" &&
    (child as AnyZenComponent).el instanceof Element
  ) {
    acc.push(child as AnyZenComponent);
  }
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./table";
