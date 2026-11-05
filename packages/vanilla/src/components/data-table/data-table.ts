import { cn } from "../../lib/cn";
import {
  Disposer,
  toNodes,
  type AnyZenComponent,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import { Checkbox } from "../form/checkbox/checkbox";
import { Button, type ButtonProps } from "../button/button";
import { Input, type InputHandle } from "../form/input/input";
import { Select } from "../form/select/select";
import { NumberField } from "../form/number-field/number-field";
import { VirtualizedItems } from "../listbox/virtualized-items";
import { useLocale, type MessageKey } from "../locale/locale";
import { cellKeyTarget, ownsArrowKeys, rowKeyTarget, type GridCell } from "@algorisys/zen-ui-core/row-keys";
import {
  columnFilterMatches,
  describeColumnFilter,
  NUMBER_FILTER_OPS,
  TEXT_FILTER_OPS,
  type FilterVariant,
  type NumberFilterValue,
  type NumberRangeFilterValue,
  type TextFilterValue,
} from "@algorisys/zen-ui-core/column-filter";
import {
  clampColumnSize,
  columnLayout,
  columnResizeDelta,
  moveColumn,
  orderedColumnIds,
} from "@algorisys/zen-ui-core/columns";
import {
  clampRange,
  inRect,
  parseTsv,
  pastePlan,
  rangeRect,
  toTsv,
  type CellRange,
  type CellRect,
} from "@algorisys/zen-ui-core/grid-range";
import {
  createCellEditor,
  seededValue,
  type CellEditor,
  type CellEditPayload,
  type EditOption,
  type EditVariant,
} from "./edit-cell";
import { aggregate as aggregateValues, totalPrecision, type AggregateKind } from "@algorisys/zen-ui-core/aggregate";
import { formatNumber, validLocale } from "@algorisys/zen-ui-core/number-format";
import {
  buildExportRequest,
  EXPORT_FILE,
  type ExportColumn,
  type ExportColumnFormat,
  type ExportFormat,
  type ExportRequest,
} from "@algorisys/zen-ui-core/export-request";
import { DropdownMenu, type DropdownMenuHandle, type DropdownMenuItemSpec } from "../dropdown-menu/dropdown-menu";
import { ContextMenu, type ContextMenuHandle } from "../context-menu/context-menu";

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
 * Inline editing (`meta.editable` + `onCellEdit`), cell navigation
 * (`enableCellNavigation`) and row virtualization inside the regular table
 * (`enableRowVirtualization`) are here, as in React. Deliberately NOT ported
 * yet (they lean on Radix DropdownMenu / dnd-kit that this binding does not
 * ship): column visibility menu, per-column filters, grouping, pinning,
 * resizing, column/row drag reorder, the client export menu, and expandable
 * sub-rows.
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

/**
 * Per-column extras, React's `columnDef.meta` in this binding's shape.
 */
export interface DataTableColumnMeta<TData = unknown> {
  /** Which input the per-column filter row shows for this column. Default text. */
  filterVariant?: FilterVariant;
  /** Options for the `select` variant. */
  filterOptions?: { label: string; value: string }[];
  /**
   * Inline editing: the cell becomes editable (a function decides per row).
   * Double-click it, or focus it and press Enter or Space; with
   * enableCellNavigation, Enter, F2 or typing. Enter or blur commits through
   * the table's `onCellEdit`, Esc cancels.
   */
  editable?: boolean | ((row: TData) => boolean);
  /** The editor: "text" (default), "number" (a NumberField) or "select" (from `editOptions`). */
  editVariant?: EditVariant;
  /** The choices of the "select" editor. */
  editOptions?: EditOption[];
  /**
   * A total for this column, computed by the table: "sum", "count", "avg",
   * "min", "max" (exact in decimal, @algorisys/zen-ui-core/aggregate), or your
   * own function of the column's values and rows. The table gets a footer with
   * the total (right-aligned, kept in view while the rows scroll in a
   * stickyHeader / fillHeight table) and "Total" in the first column that has
   * no total and no footer of its own. A hand-written `footer` is kept.
   */
  aggregate?: AggregateKind | ((values: unknown[], rows: unknown[]) => unknown);
  /** How the total reads. Default: the locale's number, at the precision of the values. */
  formatTotal?: (value: unknown) => Child;
  /**
   * How a server export writes this column (`onExport`'s ExportRequest).
   * Default: a number for a column with a total, text otherwise.
   */
  exportFormat?: ExportColumnFormat;
}

export interface DataTableColumn<TData> {
  /** Stable column id. Defaults to `accessorKey`. */
  id?: string;
  /** Key on the row datum this column reads. */
  accessorKey?: string;
  /** A computed value instead of a key (an amount from quantity and rate): React's `accessorFn`. */
  accessorFn?: (row: TData, index: number) => unknown;
  /** Header label. */
  header?: string;
  /** Custom cell renderer. Defaults to the accessor value as text. */
  cell?: (info: DataTableCellContext<TData>) => Child;
  /** Per-column sorting opt-out. Sorting must also be enabled table-wide. */
  enableSorting?: boolean;
  /** Explicit px width. In virtualized mode a column without `size` shares the remaining width. */
  size?: number;
  /** Resizing limits, px. Default 20 / none (TanStack's). */
  minSize?: number;
  maxSize?: number;
  /** `false` keeps the column out of the Columns menu (always shown). */
  enableHiding?: boolean;
  /** `false`: no filter cell for this column in the per-column filter row. */
  enableColumnFilter?: boolean;
  /** `false` keeps the column out of the Group by menu. */
  enableGrouping?: boolean;
  /** `false`: no resize handle on this column. */
  enableResizing?: boolean;
  /** Custom comparator for this column. Defaults to numeric / locale-string compare of the accessor value. */
  sortingFn?: (a: TData, b: TData) => number;
  /**
   * Footer cell for this column — a column total, typically.
   *
   * Declaring it on ANY column gives the table a <tfoot>; columns without one
   * render an empty cell so the row stays aligned. Receives the rows currently
   * in the table so the total reflects filtering.
   */
  footer?: (rows: TData[]) => Child;
  /** Per-column extras: totals (`aggregate`, `formatTotal`), server export (`exportFormat`), inline editing (`editable`, `editVariant`, `editOptions`). */
  meta?: DataTableColumnMeta<TData>;
}

/** What a DataTable context menu is for: see DataTableProps.contextMenu. */
export interface DataTableMenuTarget<TData> {
  /** The row right-clicked, or focused when the menu key was pressed. */
  row: TData;
  /** The cell's column, when a cell was the target. */
  column?: DataTableColumn<TData>;
  /** The rows the action is for: the selected rows when the target row is selected, else just the row. */
  selection: TData[];
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
  /**
   * A filter row under the header: one input per column, chosen by
   * `meta.filterVariant` (text, number, numberRange, select, boolean). Active
   * filters show as chips above the table, each removable, with Clear all.
   */
  enablePerColumnFilters?: boolean;
  /**
   * The operator select beside text and number filters. Default true. Turn it
   * off when the server owns the predicate: an operator the backend ignores is
   * a control that lies about what it does (text filters are then bare strings).
   */
  enableFilterOperators?: boolean;
  /** Controlled per-column filters: `[{ id: "role", value: "Admin" }]`. */
  columnFilters?: { id: string; value: unknown }[];
  onColumnFiltersChange?: (filters: { id: string; value: unknown }[]) => void;
  /**
   * The server filters: `data` is taken as already filtered. The search box
   * and filter inputs still report through onGlobalFilterChange /
   * onColumnFiltersChange so you can re-fetch.
   */
  manualFiltering?: boolean;
  /** The server sorts: `data` is taken as already sorted; onSortingChange still reports. */
  manualSorting?: boolean;
  /**
   * Expandable rows: a chevron column toggles a full-width detail row under
   * each row, rendered by this function. Not with `enableVirtualization`.
   *
   *   renderSubRow: ({ row }) => OrderDetails(row.id)
   */
  renderSubRow?: (ctx: { row: TData; index: number; id: string }) => Child;
  /**
   * Row grouping: rows sharing a grouped column's value nest under a group
   * row, "value (N)", that expands and collapses; columns with
   * `meta.aggregate` show the group's subtotal there. A "Group by" menu adds
   * and removes grouped columns (a column opts out with `enableGrouping: false`).
   */
  enableGrouping?: boolean;
  /** Controlled grouping: column ids, outermost first. */
  grouping?: string[];
  /** Grouping to start with (uncontrolled). */
  initialGrouping?: string[];
  onGroupingChange?: (grouping: string[]) => void;
  /** Controlled expansion: `true` expands every row, or `{ [rowId]: true }`. */
  expanded?: true | Record<string, boolean>;
  onExpandedChange?: (expanded: true | Record<string, boolean>) => void;
  enableRowSelection?: boolean;
  /**
   * Where the toolbar's menu buttons sit (here: Export). `"top"` (default):
   * their own row above the table. `"pagination"`: in the pager row, beside
   * the page buttons, so a toolbar of one button does not spend a row. The
   * search box stays above the table. Without a pager they stay on top.
   */
  toolbarPlacement?: "top" | "pagination";
  /**
   * A Columns menu in the toolbar: show and hide columns, Reset columns, and
   * (with `enableColumnOrdering`) Alt+ArrowUp / Alt+ArrowDown on a column to
   * move it. Columns opt out with `enableHiding: false`.
   */
  enableColumnVisibility?: boolean;
  /** Controlled visibility: `{ [columnId]: false }` hides a column. */
  columnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;
  /** Drag a header sideways to move its column; Alt+Arrow keys in the Columns menu. */
  enableColumnOrdering?: boolean;
  onColumnOrderChange?: (order: string[]) => void;
  /**
   * A resize handle on each header's end edge: drag it, or Tab to it and use
   * the arrow keys (16px, Shift 64px). A column opts out with `enableResizing: false`.
   */
  enableColumnResizing?: boolean;
  /** Freeze columns to the left or right edge while the table scrolls sideways. */
  enableColumnPinning?: boolean;
  /** Controlled pinning: `{ left: ["name"], right: ["actions"] }`. */
  columnPinning?: { left?: string[]; right?: string[] };
  /** Pinning to start with (uncontrolled). Also what Reset columns returns to. */
  initialColumnPinning?: { left?: string[]; right?: string[] };
  onColumnPinningChange?: (pinning: { left: string[]; right: string[] }) => void;
  /**
   * Remember column order, widths, visibility and pinning in localStorage
   * under `zen-dt:<persistKey>`, the same entry React and Solid write, so a
   * layout survives a reload (and a change of binding). Read once, when built.
   */
  persistKey?: string;
  /**
   * The older virtualized body: a grid of divs, not the table, so it renders
   * differently and takes no keyboard navigation, context menu or editing.
   * Kept as it is for the tables already built on it; new tables want
   * `enableRowVirtualization`.
   */
  enableVirtualization?: boolean;
  /**
   * Render only the rows in view, inside the regular table: the same rows,
   * cells and features as an unvirtualized table (keyboard rows, cell
   * navigation, editing, selection, a context menu, totals, a sticky header,
   * `fillHeight`), for thousands of rows. Heights are measured, so a taller
   * row is placed where it really is. The rows scroll inside the table: give
   * it `fillHeight` or it is capped at `maxBodyHeight`. Columns keep their
   * widths as rows come and go (the table lays out from the header). Wins
   * over `enableVirtualization` when both are set.
   */
  enableRowVirtualization?: boolean;
  /** 1-px vertical dividers between columns (Zen theme table spec, opt-in). */
  enableColumnSeparators?: boolean;

  /** Brand intensity of the header row. */
  headerVariant?: "plain" | "underline" | "branded";
  /** Pin the header to the top of a `maxBodyHeight` scroll viewport (non-virtualized only). */
  stickyHeader?: boolean;
  /**
   * Fill the parent's height: the rows scroll inside the table, under a header
   * that stays put, and the pager stays below. For a list that is the page's
   * main pane. The parent must give it a height (a flex child with min-height 0,
   * or a fixed height). Implies stickyHeader; maxBodyHeight is ignored.
   */
  fillHeight?: boolean;

  /* layout / messages */
  pageSize?: number;
  pageSizeOptions?: number[];
  maxBodyHeight?: number;
  /**
   * A row's height before it is measured: enableVirtualization's fixed row
   * height (default 44), and enableRowVirtualization's estimate (unset: the
   * first row measured).
   */
  rowEstimatedHeight?: number;
  globalFilterPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;

  /**
   * Rows take keyboard focus, with one tab stop for the whole table: ↑/↓,
   * Home/End and PageUp/PageDown move between rows (the key logic is
   * @algorisys/zen-ui-core/row-keys); Enter calls `onRowActivate`; with
   * `enableRowSelection`, Space toggles the row and Ctrl/Cmd+A every row on
   * the page. Keys with Alt are left alone (an app's own shortcuts), and so is
   * anything typed in a field, select or combobox inside a row.
   *
   * The plain body only: the `enableVirtualization` grid ignores it.
   */
  enableKeyboardNavigation?: boolean;
  /** Enter on a focused row. The event carries its modifiers, so Ctrl+Enter can mean something else. */
  onRowActivate?: (row: TData, event: KeyboardEvent) => void;
  /** A row's accessible name, read as focus moves onto it. */
  rowLabel?: (row: TData, index: number) => string;

  /**
   * Export on the SERVER: for data too large to be in the browser (a table
   * showing one page of a million rows). The toolbar gets an Export menu that
   * offers `exportFormats` and hands your server an ExportRequest
   * (@algorisys/zen-ui-core/export-request): exactly what the user is looking
   * at (the columns in order with header, width, format and total; search and
   * sort; locale; all matching rows, or the selected ids, even ones on pages
   * never loaded). Your endpoint queries the full data and renders the file.
   * Return a Blob (downloaded as `exportFilename`), a `{ url }` (opened as a
   * download), or nothing (you handled it). A rejected Promise is shown as the
   * reason.
   */
  onExport?: (
    format: ExportFormat,
    request: ExportRequest,
  ) =>
    | void
    | Blob
    | { url: string; filename?: string }
    | Promise<void | Blob | { url: string; filename?: string }>;
  /** The formats the server export offers, in menu order. Default xlsx, pdf, csv. */
  exportFormats?: ExportFormat[];
  /** Extra state for the server (a FilterBuilder tree, a saved view's id): sent as `request.context`. */
  exportContext?: Record<string, unknown>;
  /** A title for the exported document (a report heading). */
  exportTitle?: string;
  /** Filename (without extension) for exports. Default "data-table". */
  exportFilename?: string;
  /**
   * An Export menu in the toolbar (CSV, JSON) of the filtered rows, in data
   * order, the visible columns. `onExport` (the server builds the file) wins.
   */
  enableExport?: boolean;
  /** Export only the selected rows (all filtered rows when none is selected). */
  exportOnlySelected?: boolean;
  /**
   * A bar above the table while rows are selected: "N selected", "Select all
   * N matching" when a whole page is selected, your actions, and a clear
   * button. Gets the selected rows (data order), their ids, and `clear()`.
   */
  renderBulkActions?: (ctx: { rows: TData[]; ids: string[]; clear: () => void }) => Child;

  /**
   * Which rows a column's `meta.aggregate` totals: every row the filters let
   * through, across pages (default), or the rows on this page.
   */
  totalsOver?: "filtered" | "page";

  /**
   * A right-click menu for the rows: return ContextMenu items (the specs
   * DropdownMenu and ContextMenu take) for the target: the row, the cell's
   * column, and the selection it acts on. Right-clicking a row focuses it (with
   * enableKeyboardNavigation), as on a desktop; the menu key and Shift+F10 open
   * the menu for the focused row; focus returns there when it closes. Outside
   * the rows (the header, the footer) the browser keeps its own menu.
   *
   *   contextMenu: ({ row, selection }) => [
   *     { label: "Open in new tab", onSelect: () => openInNewTab(row) },
   *     { label: "Delete…", variant: "destructive", onSelect: () => remove(selection) },
   *   ],
   *
   * The plain body only: the `enableVirtualization` grid ignores it.
   */
  contextMenu?: (target: DataTableMenuTarget<TData>) => DropdownMenuItemSpec[];

  /**
   * Inline cell editing: a column opts in with `meta.editable`. Called once
   * per commit, after the editor has closed; the table does not change
   * `data`, you do (then `update({ data })`).
   *
   *   onCellEdit: ({ rowId, columnId, value }) => {
   *     rows = rows.map((r) => (r.id === rowId ? { ...r, [columnId]: value } : r));
   *     table.update({ data: rows });
   *   },
   *
   * Pass `getRowId` so `rowId` survives a sort.
   */
  onCellEdit?: (payload: CellEditPayload) => void;
  /**
   * Several cells changed at once: a paste, or Delete over a selection, with
   * enableCellNavigation. Without it each change goes to onCellEdit.
   */
  onCellsEdit?: (edits: CellEditPayload[]) => void;
  /**
   * Work in the table cell by cell, as in a spreadsheet. One tab stop for the
   * table; the arrows, PageUp/PageDown, Home/End and Ctrl+Home/End move
   * between cells (the arithmetic is @algorisys/zen-ui-core/row-keys'
   * cellKeyTarget, and ← → follow the text direction). Enter or F2 edits an
   * editable cell, typing starts editing with what was typed, Esc returns to
   * the cell, and Enter in an editor moves down, Tab across. Shift with the
   * arrows, Shift+click or a drag selects a range; Ctrl+A selects every cell.
   * Copy writes the range as a spreadsheet does (tab-separated), paste fills
   * editable cells from the active one (from Excel, Sheets or this table),
   * and Delete clears them; see onCellsEdit. Replaces
   * enableKeyboardNavigation's row focus when both are set. Not with the
   * older enableVirtualization.
   */
  enableCellNavigation?: boolean;

  /**
   * Drag rows by a grip in a leading column to reorder them; on a drop,
   * `onRowOrderChange` gets the row ids in their new order and you
   * re-arrange `data`. The table drags its rows itself: to anywhere in it
   * (it scrolls near its top and bottom edges, a line shows where the row
   * will land, Esc cancels), virtualized or not. Not with the older
   * enableVirtualization.
   */
  enableRowOrdering?: boolean;
  onRowOrderChange?: (orderedIds: string[]) => void;

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
  // --zen-table-row-hover (core tokens.css), default the muted colour this
  // always drew; the old "/50" generated no CSS of its own over a var().
  "hover:zen-[background-color:var(--zen-table-row-hover)] hover:zen-shadow-zen-sm",
  "data-[state=selected]:zen-bg-zen-primary-soft",
  "data-[state=selected]:zen-[box-shadow:0_4px_12px_0_var(--zen-color-primary-soft)]",
  "data-[state=selected]:zen-outline data-[state=selected]:zen-outline-1 data-[state=selected]:-zen-outline-offset-1 data-[state=selected]:zen-outline-zen-primary",
);
const ROW_FOCUS_CLASS = [
  "focus-visible:zen-outline",
  "focus-visible:zen-outline-2",
  "focus-visible:-zen-outline-offset-2",
  "focus-visible:zen-outline-zen-ring",
];
const TABLE_HEAD_CLASS =
  "zen-h-zen-head zen-[padding-inline:var(--zen-table-cell-padding-x)] zen-py-2 zen-text-start zen-align-middle zen-[font-size:var(--zen-table-head-font-size)] zen-[line-height:var(--zen-line-height-xs)] zen-[font-weight:var(--zen-table-head-font-weight)] zen-[text-transform:var(--zen-table-head-text-transform)] zen-[letter-spacing:var(--zen-table-head-letter-spacing)] zen-text-zen-muted-fg";
const TABLE_CELL_CLASS =
  "zen-[padding-inline:var(--zen-table-cell-padding-x)] zen-py-zen-cell-y zen-align-middle zen-text-sm zen-text-zen-foreground";
const VIRT_CELL_CLASS =
  "zen-[padding-inline:var(--zen-table-cell-padding-x)] zen-py-zen-cell-y zen-flex zen-items-center zen-text-sm zen-text-zen-foreground zen-min-w-0 zen-overflow-hidden";
const VIRT_HEAD_CLASS =
  "zen-h-zen-head zen-flex zen-items-center zen-text-xs zen-font-medium zen-text-zen-muted-fg zen-relative";

const SORT_BTN_CLASS = cn(
  "zen-w-full zen-h-full zen-[padding-inline:var(--zen-table-cell-padding-x)] zen-py-2",
  // A <button> resets text-transform and letter-spacing in the UA stylesheet,
  // so without the two inherits the head tokens (uppercase, tracking) stopped
  // at the label.
  "zen-inline-flex zen-items-center zen-gap-1 zen-text-start zen-font-inherit zen-text-inherit zen-[text-transform:inherit] zen-[letter-spacing:inherit]",
  "zen-bg-transparent zen-border-0 zen-cursor-pointer",
  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset",
);

/* ------------------------------------------------------------------ helpers */

/* ----- column layout persistence: the same entry React and Solid write ----- */
const PERSIST_PREFIX = "zen-dt:";
interface PersistedState {
  v: 1;
  columnOrder: string[];
  columnSizing: Record<string, number>;
  columnVisibility: Record<string, boolean>;
  columnPinning: { left?: string[]; right?: string[] };
}
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
function savePersisted(key: string | undefined, snapshot: Omit<PersistedState, "v">): void {
  if (!key || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PERSIST_PREFIX + key, JSON.stringify({ v: 1, ...snapshot }));
  } catch {
    // Storage full or blocked: the layout simply is not remembered.
  }
}
const normalisePinning = (p?: { left?: string[]; right?: string[] }): { left: string[]; right: string[] } => ({
  left: [...(p?.left ?? [])],
  right: [...(p?.right ?? [])],
});

const csvEscape = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

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

const EXPAND_CHEVRON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>`;
const GROUP_CHEVRON = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>`;
const CHIP_X = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
const OP_SELECT_CLASS =
  "zen-h-7 zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background zen-px-1 zen-text-xs zen-cursor-pointer focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring";
const SORT_ASC = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>`;
const SORT_DESC = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;
const SORT_NONE = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="zen-opacity-30" aria-hidden="true"><polyline points="8 9 12 5 16 9"/><polyline points="16 15 12 19 8 15"/></svg>`;

const sortIndicator = (state: false | "asc" | "desc"): SVGElement =>
  svgNode(state === "asc" ? SORT_ASC : state === "desc" ? SORT_DESC : SORT_NONE);

const ORIGIN: GridCell = { row: 0, col: 0 };
const cellKey = (rowId: string, colId: string): string => `${rowId}\u0000${colId}`;
const NAV_CELL_FOCUS_CLASS = [
  "focus:zen-outline",
  "focus:zen-outline-2",
  "focus:-zen-outline-offset-2",
  "focus:zen-outline-zen-ring",
];
const EDIT_BUTTON_CLASS = cn(
  "zen-w-full zen-h-full zen-inline-flex zen-items-center zen-cursor-text",
  "zen-rounded-zen-sm",
  "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring",
);
const EDIT_NAV_CLASS = "zen-w-full zen-h-full zen-inline-flex zen-items-center zen-cursor-text";
const DRAG_HANDLE_CLASS = cn(
  "zen-cursor-grab active:zen-cursor-grabbing zen-inline-flex zen-items-center zen-justify-center",
  "zen-h-6 zen-w-6 zen-rounded-zen-sm zen-bg-transparent zen-border-0",
  "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
  "zen-touch-none",
);
const GRIP = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>`;

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
  // The LocaleProvider building this table, read now (see locale.ts).
  const loc = useLocale();

  /* internal (uncontrolled) state */
  let sortingInner: SortingState = current.sorting ? [...current.sorting] : [];
  let selectionInner = new Set<string>(current.rowSelection ?? []);
  let globalFilterInner = current.globalFilter ?? "";
  let pageIndexInner = 0;
  let pageSizeInner = current.pageSize ?? 10;

  /* Column layout: order, widths, visibility, pinning. Seeded from persistKey
   * (read once: re-reading it would load another table's layout mid-session),
   * in the format React and Solid write. */
  const persisted = loadPersisted(current.persistKey);
  let columnOrderInner: string[] = persisted?.columnOrder ?? [];
  let columnSizingInner: Record<string, number> = persisted?.columnSizing ?? {};
  let visibilityInner: Record<string, boolean> = persisted?.columnVisibility ?? {};
  let columnFiltersInner: { id: string; value: unknown }[] = [];
  let expandedInner: true | Record<string, boolean> = {};
  let groupingInner: string[] = [...(current.initialGrouping ?? [])];
  /* With grouping, the page is a mix of group rows and rows; the rest of the
   * table (keyboard, selection, export) still sees only the rows on it. */
  let pageItems: BodyItem[] | null = null;
  let pagingLength: number | null = null;
  let pinningInner: { left: string[]; right: string[] } = normalisePinning(
    persisted?.columnPinning ?? current.initialColumnPinning,
  );

  /* Keyboard rows: a roving tabindex, so the table is one tab stop and the
   * arrows move within it. The index is clamped to the rows on screen when
   * they change under it (a new page, a filter), so there is always exactly
   * one tab stop. */
  let focusIndex = 0;
  /* The body rows mounted now, by row id, with their place among the rows on
   * screen (lastDisplay), so a key moves focus without a repaint and a repaint
   * can put focus back where it was. Virtualized, only the rows in view are
   * mounted; the rest are in lastDisplay alone. */
  let rowElById = new Map<string, HTMLElement>();
  let displayById = new Map<string, DisplayRow>();
  let displayIndexById = new Map<string, number>();
  const rowIdOfEl = new WeakMap<Element, string>();
  /* What each mounted body row created (checkboxes, cell content), so a row
   * leaving the window releases it. */
  let rowComps = new Map<string, AnyZenComponent[]>();
  /* The data cells mounted now, by cellKey(rowId, columnId), and the
   * components inside each (so one cell can be repainted on its own). */
  let cellEls = new Map<string, HTMLTableCellElement>();
  const cellComps = new Map<string, AnyZenComponent[]>();

  /* Inline editing: the one cell being edited, and its editor. The editor
   * outlives a repaint (it is moved into the rebuilt cell, `moving` telling it
   * that the blur this causes is not the user leaving it), so a half-typed
   * value survives new data arriving. */
  let editing: { rowId: string; columnId: string; seed?: string } | null = null;
  let editor: { comp: CellEditor; rowId: string; columnId: string } | null = null;
  let moving = false;

  /* Cell navigation: the active cell (the table's one tab stop) and the
   * selection, a rectangle from an anchor to a focus (core grid-range). */
  let activeCell: GridCell = ORIGIN;
  let cellSel: CellRange = { anchor: ORIGIN, focus: ORIGIN };
  /* The pointer drag of a cell selection in progress: its release. */
  let stopCellDrag: (() => void) | undefined;

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
  /** A group row (enableGrouping): its rows are `leaves`, its "(N)" `children`. */
  interface GroupItem {
    kind: "group";
    id: string;
    depth: number;
    columnId: string;
    key: unknown;
    leaves: DisplayRow[];
    children: number;
  }
  type BodyItem = GroupItem | { kind: "row"; r: DisplayRow };

  /* ----- structure ----- */
  const rootClass = () =>
    cn(
      "zen-space-y-3",
      current.fillHeight && "zen-flex zen-h-full zen-min-h-0 zen-flex-col [&>*]:zen-shrink-0",
      current.class,
    );
  const el = h("div", rootClass());
  if (current.id) el.id = current.id;

  const toolbarEl = h("div", "zen-flex zen-items-center zen-gap-2");
  const containerEl = h(
    "div",
    cn(
      "zen-rounded-zen-md zen-border zen-border-zen-border",
      current.fillHeight && "!zen-shrink zen-flex zen-min-h-0 zen-flex-1 zen-flex-col",
    ),
  );
  const paginationEl = h(
    "div",
    "zen-flex zen-items-center zen-justify-between zen-gap-3 zen-text-sm",
  );
  /* The pager's right-hand cluster, and in it a slot for the toolbar's menus
     (toolbarPlacement="pagination"). Both persist across repaints: the pager
     rebuilds its info and buttons on every sync, and a menu button moved out
     and back in each time would lose focus under the user. */
  const pagerInfoEl = h("div", "zen-text-zen-muted-fg");
  const pagerRightEl = h("div", "zen-flex zen-items-center zen-gap-3");
  const pagerMenusEl = h("div", "zen-flex zen-items-center zen-gap-2");
  const pagerControlsEl = h("div", "zen-flex zen-items-center zen-gap-3");
  pagerRightEl.append(pagerMenusEl, pagerControlsEl);
  paginationEl.append(pagerInfoEl, pagerRightEl);
  const menusInPager = (): boolean => current.toolbarPlacement === "pagination" && paginationActive();

  /* Persistent global-filter input — created ONCE so typing keeps focus across the
   * body repaints its onInput triggers. */
  let filterInput: InputHandle | null = null;
  if (
    current.enableColumnFilters ||
    ((current.onExport || current.enableExport || current.enableColumnVisibility || current.enableGrouping) &&
      current.toolbarPlacement !== "pagination")
  )
    el.append(toolbarEl);
  if (current.enableColumnFilters) {
    filterInput = Input({
      value: globalFilterInner,
      placeholder: current.globalFilterPlaceholder ?? loc.t("dataTable.search"),
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
  }
  el.append(containerEl);
  /* Everything the body rows made, and the row window. */
  const clearBody = (): void => {
    for (const comps of rowComps.values()) for (const c of comps) c.destroy();
    rowComps = new Map();
    for (const comps of cellComps.values()) for (const c of comps) c.destroy();
    cellComps.clear();
    cellEls = new Map();
    vw?.destroy();
    vw = null;
  };
  disposer.add(() => {
    if (virt) virt.destroy();
    clearMounted();
    clearBody();
  });

  /* ----- derived reads ----- */
  const effSorting = (): SortingState => current.sorting ?? sortingInner;
  const effSelection = (): Set<string> =>
    current.rowSelection ? new Set(current.rowSelection) : selectionInner;
  const effGlobalFilter = (): string => current.globalFilter ?? globalFilterInner;
  const effColumnFilters = (): { id: string; value: unknown }[] => current.columnFilters ?? columnFiltersInner;
  const columnFilterValue = (id: string): unknown => effColumnFilters().find((f) => f.id === id)?.value;
  const effExpanded = (): true | Record<string, boolean> => current.expanded ?? expandedInner;
  const effGrouping = (): string[] => current.grouping ?? groupingInner;
  /** Grouping applies to the regular table (not the div grid or row virtualization yet). */
  const groupingActive = (): boolean =>
    !!current.enableGrouping && effGrouping().length > 0 && !isVirt() && !rowVirt();
  const canGroup = (col: DataTableColumn<TData>): boolean =>
    !!current.enableGrouping && col.enableGrouping !== false && !!(col.accessorKey || col.accessorFn);
  function setGrouping(next: string[]): void {
    if (current.grouping === undefined) groupingInner = next;
    current.onGroupingChange?.(next);
    pageIndexInner = 0;
    sync();
  }
  /** Rows expand only into a detail renderer, and not in the div grid (React's rule too). */
  const expansionActive = (): boolean => !!current.renderSubRow && !isVirt();
  const isExpanded = (id: string): boolean => {
    const e = effExpanded();
    return e === true || !!e[id];
  };
  /* TanStack's toggle: from "all" (`true`), every row on screen stays open but this one. */
  function toggleExpanded(id: string): void {
    const e = effExpanded();
    const next: Record<string, boolean> =
      e === true ? Object.fromEntries(lastDisplay.map((r) => [rowIdOf(r.row, r.index), true])) : { ...e };
    if (next[id]) delete next[id];
    else next[id] = true;
    if (current.expanded === undefined) expandedInner = next;
    current.onExpandedChange?.(next);
    sync();
  }
  /* A row's detail row, built with the row and kept beside it: the row window
   * moves and measures the pair as one. */
  let subElById = new Map<string, HTMLElement>();
  /** The older div-grid body (enableVirtualization), unless row virtualization wins. */
  const isVirt = (): boolean => !!current.enableVirtualization && !current.enableRowVirtualization;
  /** Only the rows in view, inside the regular table. */
  const rowVirt = (): boolean => !!current.enableRowVirtualization;
  const cellNavActive = (): boolean => !!current.enableCellNavigation && !isVirt();
  const rowHeight = (): number => current.rowEstimatedHeight ?? 44;
  const bodyHeight = (): number => current.maxBodyHeight ?? 480;

  const effVisibility = (): Record<string, boolean> => current.columnVisibility ?? visibilityInner;
  const effPinning = (): { left: string[]; right: string[] } =>
    current.columnPinning ? normalisePinning(current.columnPinning) : pinningInner;
  /* The visible columns in display order: left-pinned, the rest in column
   * order, right-pinned (core/columns, TanStack's rules). Every renderer reads
   * columns through here, so order, visibility and pinning reach the header,
   * body, footer, export and the grid at once. Cached per paint: body rows
   * call it once each. */
  let leafCache: DataTableColumn<TData>[] | null = null;
  let layoutCache: { left: string[]; center: string[]; right: string[] } | null = null;
  const layout = () =>
    (layoutCache ??= columnLayout(
      current.columns.map((c) => colId(c)),
      {
        order: columnOrderInner,
        visibility: effVisibility(),
        pinning: current.enableColumnPinning ? effPinning() : undefined,
      },
    ));
  const leafColumns = (): DataTableColumn<TData>[] => {
    if (leafCache) return leafCache;
    const l = layout();
    let center = l.center;
    // Grouped columns lead, in grouping order (TanStack's groupedColumnMode "reorder").
    if (groupingActive()) {
      const g = effGrouping().filter((id) => center.includes(id));
      center = [...g, ...center.filter((id) => !g.includes(id))];
    }
    return (leafCache = [...l.left, ...center, ...l.right].map((id) => colById(id)!).filter(Boolean));
  };
  const invalidateColumns = () => {
    leafCache = null;
    layoutCache = null;
  };
  const pinSide = (col: DataTableColumn<TData>): "left" | "right" | false => {
    if (!current.enableColumnPinning) return false;
    const id = colId(col);
    const l = layout();
    return l.left.includes(id) ? "left" : l.right.includes(id) ? "right" : false;
  };
  /** A column's width: resized, else its `size`; 150 (TanStack's) when resizing needs one. */
  const colSize = (col: DataTableColumn<TData>): number | undefined =>
    columnSizingInner[colId(col)] ?? col.size ?? (current.enableColumnResizing ? 150 : undefined);
  /** Hideable columns in the table's current order, hidden ones included: the Columns menu. */
  const menuColumns = (): DataTableColumn<TData>[] =>
    orderedColumnIds(current.columns.map((c) => colId(c)), columnOrderInner)
      .map((id) => colById(id)!)
      .filter((c) => c && c.enableHiding !== false);

  const persistLayout = () =>
    savePersisted(current.persistKey, {
      columnOrder: columnOrderInner,
      columnSizing: columnSizingInner,
      columnVisibility: effVisibility(),
      columnPinning: effPinning(),
    });
  const setColumnOrder = (next: string[]) => {
    columnOrderInner = next;
    invalidateColumns();
    current.onColumnOrderChange?.(next);
    persistLayout();
    sync();
  };
  const setColumnSizing = (next: Record<string, number>) => {
    columnSizingInner = next;
    persistLayout();
    sync();
  };
  const setVisibility = (next: Record<string, boolean>) => {
    if (current.columnVisibility === undefined) visibilityInner = next;
    invalidateColumns();
    current.onColumnVisibilityChange?.(next);
    persistLayout();
    sync();
  };
  const setPinning = (next: { left: string[]; right: string[] }) => {
    if (current.columnPinning === undefined) pinningInner = next;
    invalidateColumns();
    current.onColumnPinningChange?.(next);
    persistLayout();
    sync();
  };
  /* "Reset columns": back to the layout the table was given, through the
   * setters so controlled props hear it and persistKey's entry is rewritten. */
  const resetColumns = () => {
    columnOrderInner = [];
    columnSizingInner = {};
    if (current.columnVisibility === undefined) visibilityInner = {};
    if (current.columnPinning === undefined) pinningInner = normalisePinning(current.initialColumnPinning);
    invalidateColumns();
    current.onColumnOrderChange?.([]);
    current.onColumnVisibilityChange?.({});
    current.onColumnPinningChange?.(normalisePinning(current.initialColumnPinning));
    persistLayout();
    sync();
  };
  const colId = (col: DataTableColumn<TData>): string =>
    col.id ?? col.accessorKey ?? "";
  const colById = (id: string): DataTableColumn<TData> | undefined =>
    current.columns.find((c) => colId(c) === id);
  const headerText = (col: DataTableColumn<TData>): string =>
    col.header ?? colId(col);
  const getValue = (col: DataTableColumn<TData> | undefined, row: TData, index = -1): unknown =>
    col?.accessorFn
      ? col.accessorFn(row, index)
      : col?.accessorKey
        ? (row as Record<string, unknown>)[col.accessorKey]
        : undefined;
  const rowIdOf = (row: TData, index: number): string =>
    current.getRowId ? current.getRowId(row, index) : String(index);
  const canSort = (col: DataTableColumn<TData>): boolean =>
    !!current.enableSorting && col.enableSorting !== false && !!(col.accessorKey || col.accessorFn);
  const isEditable = (col: DataTableColumn<TData>, row: TData): boolean => {
    const m = col.meta?.editable;
    return typeof m === "function" ? m(row) : !!m;
  };

  const renderCell = (
    col: DataTableColumn<TData>,
    row: TData,
    index: number,
  ): Child => {
    const value = getValue(col, row, index);
    if (col.cell) return col.cell({ row, value, index });
    return value == null ? "" : String(value);
  };

  /* ----- row pipeline ----- */
  function processRows(sort = true): DisplayRow[] {
    let rows: DisplayRow[] = current.data.map((row, index) => ({ row, index }));

    // A server-filtered table takes `data` as the answer (manualFiltering).
    if (current.enablePerColumnFilters && !current.manualFiltering) {
      for (const f of effColumnFilters()) {
        const col = colById(f.id);
        if (!col) continue;
        rows = rows.filter((r) => columnFilterMatches(col.meta?.filterVariant, getValue(col, r.row, r.index), f.value));
      }
    }

    if (current.enableColumnFilters && !current.manualFiltering) {
      const q = effGlobalFilter().trim().toLowerCase();
      if (q) {
        rows = rows.filter((r) =>
          leafColumns().some((c) =>
            String(getValue(c, r.row, r.index) ?? "")
              .toLowerCase()
              .includes(q),
          ),
        );
      }
    }

    const sorting = effSorting();
    if (sort && current.enableSorting && sorting.length && !current.manualSorting) {
      rows = [...rows].sort((a, b) => {
        for (const s of sorting) {
          const col = colById(s.id);
          const cmp = col?.sortingFn
            ? col.sortingFn(a.row, b.row)
            : compareValues(getValue(col, a.row, a.index), getValue(col, b.row, b.index));
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
      : Math.max(1, Math.ceil((pagingLength ?? processed.length) / Math.max(1, effPageSize())));

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
    const label = loc.t(
      sorted === "asc" ? "dataTable.sortAscending" : sorted === "desc" ? "dataTable.sortDescending" : "dataTable.sortNone",
    );
    btn.setAttribute("aria-label", loc.t("dataTable.sortBy", { column: headerText(col), state: label }));
    btn.append(document.createTextNode(headerText(col)), sortIndicator(sorted));
    const idx = sortIndexOf(id);
    if (idx !== null) {
      // At the header's own size (it was a 16px raw-rem literal beside 12px text).
      const badge = h("span", "zen-font-semibold zen-text-zen-muted-fg zen-ml-0.5");
      badge.setAttribute("aria-hidden", "true");
      badge.title = loc.t("dataTable.sortPriority", { n: idx });
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
      "zen-[padding-inline:var(--zen-table-cell-padding-x)] zen-py-2 zen-inline-flex zen-items-center zen-gap-1",
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

  /* ----- totals (a column's meta.aggregate) ----- */
  function totalOf(col: DataTableColumn<TData>, rows: DisplayRow[]): Child {
    const meta = col.meta!;
    const values = rows.map((r) => getValue(col, r.row, r.index));
    const value =
      typeof meta.aggregate === "function"
        ? meta.aggregate(values, rows.map((r) => r.row))
        : aggregateValues(values, meta.aggregate!);
    if (meta.formatTotal) return meta.formatTotal(value);
    if (value === null || value === undefined) return "";
    const kind = typeof meta.aggregate === "string" ? meta.aggregate : "sum";
    if (typeof value === "number")
      return formatNumber(value, { locale: loc.locale, precision: totalPrecision(values, kind) });
    if (value instanceof Date) return value.toLocaleDateString(validLocale(loc.locale));
    return String(value);
  }

  /* ----- server export (onExport) ----- */
  /* The Export menu, its live status and its error: built once, the first
   * time the table has an onExport, and kept across repaints (it lives in the
   * toolbar, which the body's repaint does not touch). */
  let exporter: {
    menu: DropdownMenuHandle;
    button: ReturnType<typeof Button>;
    status: HTMLElement;
    error: HTMLElement;
    signature: string;
  } | null = null;
  let exportBusy = false;
  let exportOnlySelected = false;

  /** The columns as the server should write them: what the user sees, in order. */
  const exportColumns = (): ExportColumn[] =>
    leafColumns().map((c) => {
      const meta = c.meta ?? {};
      const format: ExportColumn["format"] =
        meta.exportFormat ?? (meta.aggregate ? { kind: "number" } : { kind: "text" });
      const numeric =
        format.kind !== "text" && format.kind !== "date" && format.kind !== "datetime" && format.kind !== "boolean";
      return {
        id: colId(c),
        header: headerText(c),
        // React reads TanStack's column size, which is 150 when a column sets none.
        width: Math.round(c.size ?? 150),
        align: numeric ? "end" : "start",
        format,
        ...(meta.aggregate
          ? { total: typeof meta.aggregate === "string" ? (meta.aggregate as ExportColumn["total"]) : "custom" }
          : {}),
      };
    });

  const exportFilename = (): string => current.exportFilename ?? "data-table";

  function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function runExport(format: ExportFormat): Promise<void> {
    const onExport = current.onExport;
    if (exportBusy || !onExport || !exporter) return;
    exportBusy = true;
    const ui = exporter;
    ui.error.replaceChildren();
    ui.error.hidden = true;
    ui.status.textContent = loc.t("dataTable.exportPreparing");
    ui.button.update({ loading: true, children: loc.t("dataTable.exportPreparing") });
    // Selection is kept by id, so rows selected on pages never loaded count too.
    const selectedIds = [...effSelection()];
    const request = buildExportRequest({
      format,
      filename: exportFilename(),
      title: current.exportTitle,
      locale: loc.locale ?? (typeof navigator !== "undefined" ? navigator.language : undefined),
      selectedIds: exportOnlySelected ? selectedIds : null,
      columns: exportColumns(),
      sort: effSorting(),
      search: effGlobalFilter(),
      columnFilters: [],
      grouping: [],
      context: current.exportContext,
    });
    try {
      const result = await onExport(format, request);
      const name = `${exportFilename()}.${EXPORT_FILE[format].extension}`;
      if (result instanceof Blob) downloadBlob(result, name);
      else if (result && typeof result === "object" && "url" in result) {
        const a = document.createElement("a");
        a.href = result.url;
        a.download = result.filename ?? name;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      ui.status.textContent = loc.t("dataTable.exportReady");
    } catch (e) {
      ui.error.textContent = loc.t("dataTable.exportFailed", { error: String((e as Error)?.message ?? e) });
      ui.error.hidden = false;
      ui.status.textContent = "";
    } finally {
      exportBusy = false;
      ui.button.update({ loading: false, children: loc.t("dataTable.export") });
    }
  }

  function exportItems(): { items: DropdownMenuItemSpec[]; signature: string } {
    const formats = current.exportFormats ?? ["xlsx", "pdf", "csv"];
    const selected = effSelection().size;
    if (selected === 0) exportOnlySelected = false;
    const label = (f: ExportFormat) =>
      loc.t(f === "xlsx" ? "dataTable.exportExcel" : f === "pdf" ? "dataTable.exportPdf" : "dataTable.exportCsv");
    const items: DropdownMenuItemSpec[] = [
      { type: "label", label: loc.t("dataTable.exportTo") },
      ...formats.map((f): DropdownMenuItemSpec => ({ label: label(f), onSelect: () => void runExport(f) })),
    ];
    if (selected > 0) {
      items.push(
        { type: "separator" },
        {
          type: "checkbox",
          label: loc.t("dataTable.exportOnlySelected", { count: selected }),
          checked: exportOnlySelected,
          onCheckedChange: (v) => (exportOnlySelected = v),
          // A scope, not an action: the menu stays open to pick the format.
          closeOnSelect: false,
        },
      );
    }
    return { items, signature: `${formats.join(",")}|${selected}|${exportOnlySelected}` };
  }

  /* The toolbar's menu buttons (Export, Columns) live in one element that
   * sits on the toolbar row or in the pager row (toolbarPlacement). Built once:
   * a menu button moved out and back on every repaint would lose focus. */
  const toolbarMenusEl = h("div", "zen-ml-auto zen-flex zen-items-center zen-gap-2");
  const hasToolbarMenus = (): boolean =>
    !!current.onExport || !!current.enableExport || !!current.enableColumnVisibility || !!current.enableGrouping;
  function paintMenus(): void {
    paintExport();
    paintColumnsMenu();
    paintGroupMenu();
    if (!hasToolbarMenus()) {
      toolbarMenusEl.remove();
      return;
    }
    const host = menusInPager() ? pagerMenusEl : toolbarEl;
    if (host === toolbarEl && !toolbarEl.isConnected) el.prepend(toolbarEl);
    // The search box alone keeps the top row; with nothing in it, it goes.
    if (host !== toolbarEl && !current.enableColumnFilters) toolbarEl.remove();
    if (toolbarMenusEl.parentElement !== host) host.append(toolbarMenusEl);
  }

  /* The client Export menu (enableExport): CSV / JSON of the filtered rows in
   * data order, or the selected ones, React's formats exactly. */
  let clientExport: { menu: DropdownMenuHandle; button: ZenComponent<ButtonProps> } | null = null;
  function clientExportRows(): DisplayRow[] {
    const filtered = processRows(false);
    if (!current.exportOnlySelected) return filtered;
    const sel = effSelection();
    const picked = filtered.filter((r) => sel.has(rowIdOf(r.row, r.index)));
    // Never an empty file: with nothing selected, the filtered rows.
    return picked.length ? picked : filtered;
  }
  function exportClientCsv(): void {
    const cols = leafColumns();
    const header = cols.map((c) => csvEscape(headerText(c))).join(",");
    const body = clientExportRows()
      .map((r) => cols.map((c) => csvEscape(getValue(c, r.row, r.index))).join(","))
      .join("\n");
    downloadBlob(new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" }), `${exportFilename()}.csv`);
  }
  function exportClientJson(): void {
    const cols = leafColumns();
    const payload = clientExportRows().map((r) => Object.fromEntries(cols.map((c) => [colId(c), getValue(c, r.row, r.index)])));
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }), `${exportFilename()}.json`);
  }
  const clientExportItems = (): DropdownMenuItemSpec[] => [
    { type: "label", label: loc.t(current.exportOnlySelected ? "dataTable.exportSelectedRows" : "dataTable.exportVisibleRows") },
    { type: "separator" },
    { label: loc.t("dataTable.exportCsv"), onSelect: exportClientCsv },
    { label: loc.t("dataTable.exportJson"), onSelect: exportClientJson },
  ];
  function paintClientExport(): void {
    if (current.onExport || !current.enableExport) {
      clientExport?.menu.el.remove();
      return;
    }
    if (!clientExport) {
      const button = Button({ variant: "outline", color: "neutral", size: "sm", children: loc.t("dataTable.export") });
      const menu = DropdownMenu({ trigger: button, items: clientExportItems(), align: "end", class: "zen-min-w-44" });
      clientExport = { menu, button };
      disposer.add(() => {
        clientExport?.menu.destroy();
        clientExport?.button.destroy();
      });
    } else if (!clientExport.menu.isOpen) clientExport.menu.update({ items: clientExportItems() });
    if (clientExport.menu.el.parentElement !== toolbarMenusEl) toolbarMenusEl.prepend(clientExport.menu.el);
  }

  function paintExport(): void {
    paintClientExport();
    if (!current.onExport) {
      if (exporter) exporter.menu.el.parentElement?.remove();
      return;
    }
    const { items, signature } = exportItems();
    if (!exporter) {
      const right = h("div", "zen-flex zen-items-center zen-gap-2");
      const error = h("span", "zen-text-sm zen-text-zen-error");
      error.setAttribute("role", "alert");
      error.setAttribute("data-export-error", "");
      error.hidden = true;
      const status = h("span", "zen-sr-only");
      status.setAttribute("role", "status");
      const button = Button({ variant: "outline", color: "neutral", size: "sm", children: loc.t("dataTable.export") });
      const menu = DropdownMenu({ trigger: button, items, align: "end", class: "zen-min-w-52" });
      right.append(error, status, menu.el);
      toolbarMenusEl.prepend(right);
      exporter = { menu, button, status, error, signature };
      disposer.add(() => {
        exporter?.menu.destroy();
        exporter?.button.destroy();
      });
    } else {
      const wrap = exporter.menu.el.parentElement!;
      if (wrap.parentElement !== toolbarMenusEl) toolbarMenusEl.prepend(wrap);
      // Only when what the menu offers changed: an update while it is open
      // rebuilds it, which would move focus under the user.
      if (signature !== exporter.signature) {
        exporter.signature = signature;
        exporter.menu.update({ items });
      }
    }
  }

  /* ----- Group by menu ----- */
  let groupMenu: { menu: DropdownMenuHandle; button: ZenComponent<ButtonProps> } | null = null;
  const groupItemsSpec = (): DropdownMenuItemSpec[] =>
    current.columns.filter(canGroup).map((col) => {
      const id = colId(col);
      return {
        type: "checkbox" as const,
        label: headerText(col),
        checked: effGrouping().includes(id),
        // From the live grouping, not the row's checked flag: the menu's rows
        // can be a step behind while it closes.
        onCheckedChange: () => {
          const g = effGrouping();
          setGrouping(g.includes(id) ? g.filter((x) => x !== id) : [...g, id]);
        },
      };
    });
  function paintGroupMenu(): void {
    if (!current.enableGrouping || !current.columns.some(canGroup)) {
      groupMenu?.menu.el.remove();
      return;
    }
    const n = effGrouping().length;
    const label = n ? loc.t("dataTable.groupByCount", { count: n }) : loc.t("dataTable.groupBy");
    if (!groupMenu) {
      const button = Button({ variant: "outline", color: "neutral", size: "sm", children: label });
      const menu = DropdownMenu({
        trigger: button,
        items: groupItemsSpec(),
        align: "end",
        class: "zen-min-w-52",
        // A choice repaints the table while the menu is still open, so the
        // rows are refreshed as it closes, for the next opening.
        onOpenChange: (open) => {
          if (!open) groupMenu?.menu.update({ items: groupItemsSpec() });
        },
      });
      groupMenu = { menu, button };
      disposer.add(() => {
        groupMenu?.menu.destroy();
        groupMenu?.button.destroy();
      });
    } else {
      groupMenu.button.update({ children: label });
      if (!groupMenu.menu.isOpen) groupMenu.menu.update({ items: groupItemsSpec() });
    }
    // Export, Group by, Columns: React's order.
    const el = groupMenu.menu.el;
    const columnsEl = columnsMenu?.menu.el;
    if (columnsEl && columnsEl.parentElement === toolbarMenusEl) {
      if (el.nextElementSibling !== columnsEl) columnsEl.before(el);
    } else if (el.parentElement !== toolbarMenusEl) toolbarMenusEl.append(el);
  }

  /* ----- Columns menu ----- */
  let columnsMenu: { menu: DropdownMenuHandle; button: ZenComponent<ButtonProps> } | null = null;
  const allColumnIds = (): string[] => current.columns.map((c) => colId(c));

  /* Alt+ArrowUp / Alt+ArrowDown on a column's row moves the column. The row is
   * moved in place in the open menu (the menu reads its rows in DOM order on
   * every key, so arrows follow), not rebuilt: rebuilding closes and reopens
   * it, which takes focus to the trigger and back on every press. */
  function onColumnMenuKey(e: KeyboardEvent, row: HTMLElement, id: string): void {
    if (!current.enableColumnOrdering || !e.altKey || e.ctrlKey || e.metaKey) return;
    const direction = e.key === "ArrowUp" ? "earlier" : e.key === "ArrowDown" ? "later" : null;
    if (!direction) return;
    e.preventDefault();
    e.stopPropagation();
    const next = moveColumn(
      orderedColumnIds(allColumnIds(), columnOrderInner),
      id,
      direction,
      menuColumns().map((c) => colId(c)),
    );
    if (!next) return;
    setColumnOrder(next);
    const rows = [...(row.parentElement?.querySelectorAll<HTMLElement>("[data-item-id]") ?? [])];
    const i = rows.indexOf(row);
    const neighbour = rows[direction === "earlier" ? i - 1 : i + 1];
    if (neighbour) {
      if (direction === "earlier") neighbour.before(row);
      else neighbour.after(row);
    }
    // Moving a node blurs it: focus goes back to the moved row.
    row.focus();
  }

  function columnItems(): DropdownMenuItemSpec[] {
    const pinning = !!current.enableColumnPinning;
    const ordering = !!current.enableColumnOrdering;
    const vis = effVisibility();
    const pins = effPinning();
    const items: DropdownMenuItemSpec[] = [
      { type: "label", label: loc.t(pinning ? "dataTable.manageColumns" : "dataTable.toggleColumns") },
      { type: "separator" },
    ];
    for (const col of menuColumns()) {
      const id = colId(col);
      const label = headerText(col);
      const visible = vis[id] !== false;
      const toggle = (v: boolean) => setVisibility({ ...effVisibility(), [id]: v });
      if (!pinning) {
        items.push({
          type: "checkbox",
          id,
          label,
          checked: visible,
          // Stays open, so several columns can be toggled in one visit.
          closeOnSelect: false,
          onCheckedChange: toggle,
          keyshortcuts: ordering ? "Alt+ArrowUp Alt+ArrowDown" : undefined,
          onKeyDown: (e, row) => onColumnMenuKey(e, row, id),
        });
        continue;
      }
      /* With pinning, each column is a submenu: show it, and where it is
       * pinned. Every choice is a menu item, so all of it works from the
       * keyboard (React's and Solid's pin buttons in the row do not: todo.md). */
      const side = pins.left.includes(id) ? "left" : pins.right.includes(id) ? "right" : "none";
      const pinTo = (where: string) => {
        const p = effPinning();
        const left = p.left.filter((x) => x !== id);
        const right = p.right.filter((x) => x !== id);
        if (where === "left") left.push(id);
        if (where === "right") right.push(id);
        setPinning({ left, right });
      };
      items.push({
        type: "sub",
        label,
        items: [
          { type: "checkbox", label: loc.t("dataTable.showColumn"), checked: visible, onCheckedChange: toggle },
          { type: "separator" },
          {
            type: "radio",
            value: side,
            onValueChange: pinTo,
            options: [
              { value: "none", label: loc.t("dataTable.pinNone") },
              { value: "left", label: loc.t("dataTable.pinTo", { side: loc.t("dataTable.sideLeft") }) },
              { value: "right", label: loc.t("dataTable.pinTo", { side: loc.t("dataTable.sideRight") }) },
            ],
          },
        ],
      });
    }
    items.push({ type: "separator" }, { label: loc.t("dataTable.resetColumns"), onSelect: resetColumns });
    if (ordering && !pinning) items.push({ type: "label", label: loc.t("dataTable.moveColumnHint") });
    return items;
  }

  function paintColumnsMenu(): void {
    if (!current.enableColumnVisibility || menuColumns().length === 0) {
      columnsMenu?.menu.el.remove();
      return;
    }
    if (!columnsMenu) {
      const button = Button({ variant: "outline", color: "neutral", size: "sm", children: loc.t("dataTable.columns") });
      const menu = DropdownMenu({
        trigger: button,
        items: columnItems(),
        align: "end",
        class: "zen-min-w-56",
        // While it is open the menu shows its own changes (a checkbox toggles
        // in place, a moved row moves): refresh it for the next opening.
        onOpenChange: (open) => {
          if (!open) columnsMenu?.menu.update({ items: columnItems() });
        },
      });
      columnsMenu = { menu, button };
      disposer.add(() => {
        columnsMenu?.menu.destroy();
        columnsMenu?.button.destroy();
      });
    } else if (!columnsMenu.menu.isOpen) {
      columnsMenu.menu.update({ items: columnItems() });
    }
    if (columnsMenu.menu.el.parentElement !== toolbarMenusEl) toolbarMenusEl.append(columnsMenu.menu.el);
  }

  /* ----- context menu ----- */
  /* contextMenu: a right-click on a row or cell, or the menu key / Shift+F10
   * on a focused one, opens the caller's items for it. Anywhere else (the
   * header, the footer, empty space) the browser keeps its own menu: the
   * ContextMenu is disabled while there is no target, which is what leaves the
   * browser its menu. The target is read before ContextMenu decides: in its
   * onContextMenu hook for a right-click, and in a capture listener for the
   * keys (ContextMenu checks `disabled` before it handles the key). */
  let cm: ContextMenuHandle | null = null;
  const menuActive = (): boolean => !!current.contextMenu && !isVirt();

  function menuTargetFrom(node: EventTarget | null): DataTableMenuTarget<TData> | null {
    const tr = (node as Element | null)?.closest?.("tr[data-row-id]") as HTMLElement | null;
    if (!tr || !containerEl.contains(tr)) return null;
    const id = tr.dataset.rowId ?? "";
    const r = displayById.get(id);
    if (!r) return null;
    const colKey = ((node as Element).closest("td[data-column]") as HTMLElement | null)?.dataset.column;
    const column = colKey !== undefined ? colById(colKey) : undefined;
    // A right-click on a selected row acts on the whole selection, as in a file manager.
    const sel = effSelection();
    const selection = sel.has(id)
      ? current.data.filter((row, index) => sel.has(rowIdOf(row, index)))
      : [r.row];
    return { row: r.row, column, selection };
  }

  /** Point the menu at what the event is for, or disable it (the browser's menu) when nothing. */
  function takeMenuTarget(node: EventTarget | null): DataTableMenuTarget<TData> | null {
    const target = current.contextMenu ? menuTargetFrom(node) : null;
    cm?.update(target ? { disabled: false, items: current.contextMenu!(target) } : { disabled: true });
    return target;
  }

  function ensureContextMenu(): void {
    if (cm || !menuActive()) return;
    cm = ContextMenu({
      class: "zen-contents",
      contentClass: "zen-min-w-48",
      items: [],
      disabled: true,
      onContextMenu: (e) => {
        const target = takeMenuTarget(e.target);
        if (!target) return;
        // A right-click makes its row (or cell) the focused one, as on a
        // desktop, so the menu is for it and focus returns there. Inside a
        // cell selection it leaves the selection alone: the menu acts on it.
        if (cellNavActive()) {
          const hit = cellAt(e.target);
          const rect = selRectNow();
          if (hit && !(rect && inRect(rect, hit.at.row, hit.at.col))) moveTo(hit.at);
        } else if (keyboardActive()) {
          const tr = (e.target as Element).closest("tr[data-row-id]") as HTMLElement | null;
          const id = tr ? rowIdOfEl.get(tr) : undefined;
          const i = id !== undefined ? displayIndexById.get(id) ?? -1 : -1;
          if (tr && i >= 0) {
            setTabStop(i);
            tr.focus({ preventScroll: true });
          }
        }
      },
    });
    const onKeyCapture = (e: KeyboardEvent) => {
      if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) takeMenuTarget(document.activeElement);
    };
    const handle = cm;
    handle.el.addEventListener("keydown", onKeyCapture, true);
    disposer.add(() => {
      handle.el.removeEventListener("keydown", onKeyCapture, true);
      handle.destroy();
    });
  }

  /* ----- keyboard rows ----- */
  const keyboardActive = (): boolean =>
    !!current.enableKeyboardNavigation && !isVirt() && !cellNavActive();

  const rowElAt = (index: number): HTMLElement | undefined => {
    const r = lastDisplay[index];
    return r ? rowElById.get(rowIdOf(r.row, r.index)) : undefined;
  };

  function setTabStop(index: number): void {
    focusIndex = index;
    for (const [id, tr] of rowElById) tr.setAttribute("tabindex", displayIndexById.get(id) === index ? "0" : "-1");
  }

  /* Virtualized, the row the keys move to may not be mounted yet: it is
   * scrolled into view (which mounts it), focused, and once the rows it
   * passed are measured, nudged whole into view below the sticky header. */
  function focusRow(index: number): void {
    if (!rowVirt()) {
      rowElAt(index)?.focus();
      return;
    }
    vw?.scrollToIndex(index);
    rowElAt(index)?.focus({ preventScroll: true });
    const keep = () => {
      const tr = rowElAt(index);
      if (tr && document.activeElement === tr) keepInView(tr);
    };
    keep();
    requestAnimationFrame(() => requestAnimationFrame(keep));
  }

  /* Keep a focused row or cell whole in view: below the sticky header, and
   * clear of sticky (pinned) cells. Only the table's own scroller moves; a
   * table that does not scroll leaves it to the page. */
  function keepInView(el: HTMLElement): void {
    const scroller = tableWrapper;
    const tableEl = scroller?.querySelector("table");
    if (!scroller || !tableEl) return;
    const box = scroller.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (scroller.scrollHeight > scroller.clientHeight) {
      const top = tableEl.tHead?.getBoundingClientRect().bottom ?? box.top;
      const bottom = box.top + scroller.clientHeight;
      if (r.top < top) scroller.scrollTop -= top - r.top;
      else if (r.bottom > bottom) scroller.scrollTop += r.bottom - bottom;
    } else if (r.top < 0 || r.bottom > window.innerHeight) {
      el.scrollIntoView({ block: "nearest" });
    }
    if (el.tagName === "TD" && scroller.scrollWidth > scroller.clientWidth && getComputedStyle(el).position !== "sticky") {
      let left = box.left;
      let right = box.left + scroller.clientWidth;
      for (const c of Array.from(el.parentElement?.children ?? [])) {
        if (c === el || getComputedStyle(c).position !== "sticky") continue;
        const cr = c.getBoundingClientRect();
        if (cr.right <= r.left + 1) left = Math.max(left, cr.right);
        else if (cr.left >= r.right - 1) right = Math.min(right, cr.left);
      }
      if (r.left < left) scroller.scrollLeft -= left - r.left;
      else if (r.right > right) scroller.scrollLeft += r.right - right;
    }
  }

  function onRowKeyDown(e: KeyboardEvent, tr: HTMLElement, r: DisplayRow, index: number): void {
    if (e.altKey || ownsArrowKeys(e.target)) return;
    const to = rowKeyTarget(e.key, index, lastDisplay.length);
    if (to !== null) {
      e.preventDefault();
      if (!lastDisplay[to]) return;
      setTabStop(to);
      focusRow(to);
      return;
    }
    // The rest act on the row itself: on a link or a button inside it, Enter
    // and Space are that control's.
    if (e.target !== tr) return;
    if (e.key === "Enter" && current.onRowActivate) {
      e.preventDefault();
      current.onRowActivate(r.row, e);
    } else if (e.key === " " && current.enableRowSelection) {
      e.preventDefault();
      toggleRow(rowIdOf(r.row, r.index));
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a" && current.enableRowSelection) {
      e.preventDefault();
      toggleAll(lastDisplay);
    }
  }

  /* ----- inline editing -----
   * One cell at a time. Starting, committing and cancelling repaint that cell
   * alone; the caller's onCellEdit then updates `data`, which repaints the
   * rest. */
  function startEdit(rowId: string, columnId: string, seed?: string): void {
    if (editor) dropEditor();
    editing = seed === undefined ? { rowId, columnId } : { rowId, columnId, seed };
    paintCell(rowId, columnId);
    editor?.comp.start();
  }

  /** Throw the open editor away without a word (a new edit, a row that has gone). */
  function dropEditor(): void {
    const ed = editor;
    editor = null;
    editing = null;
    if (!ed) return;
    ed.comp.destroy();
    paintCell(ed.rowId, ed.columnId);
  }

  /** After an edit ended from the keyboard or a pick, focus goes back to its cell. */
  function refocusCell(rowId: string, columnId: string): void {
    const now = document.activeElement;
    // Focus that went somewhere real (a click elsewhere) stays there.
    if (now && now !== document.body) return;
    const td = cellEls.get(cellKey(rowId, columnId));
    if (!td) return;
    const target = cellNavActive() ? td : (td.querySelector('[role="button"]') as HTMLElement | null) ?? td;
    target.focus({ preventScroll: true });
  }

  function endEdit(
    rowId: string,
    columnId: string,
    commit: { value: unknown } | null,
    how: "key" | "blur" | "pick" | "cancel",
  ): void {
    const ed = editor;
    if (!ed || ed.rowId !== rowId || ed.columnId !== columnId) return;
    editor = null;
    editing = null;
    ed.comp.destroy();
    paintCell(rowId, columnId);
    if (commit) current.onCellEdit?.({ rowId, columnId, value: commit.value });
    if (how !== "blur") refocusCell(rowId, columnId);
  }

  function editCells(edits: CellEditPayload[]): void {
    if (edits.length === 0) return;
    if (current.onCellsEdit) current.onCellsEdit(edits);
    else for (const edit of edits) current.onCellEdit?.(edit);
  }

  /** The editor for the cell being edited, made once and moved into each rebuilt cell. */
  function editorFor(col: DataTableColumn<TData>, r: DisplayRow, rowId: string): CellEditor {
    const columnId = colId(col);
    if (editor && editor.rowId === rowId && editor.columnId === columnId) return editor.comp;
    const variant = col.meta?.editVariant ?? "text";
    const seed = editing?.seed;
    const comp = createCellEditor({
      variant,
      initialValue: seededValue(variant, getValue(col, r.row, r.index), seed),
      seeded: seed !== undefined && variant !== "select",
      options: col.meta?.editOptions ?? [],
      moving: () => moving,
      onCommit: (value, how) => endEdit(rowId, columnId, { value }, how),
      onCancel: () => endEdit(rowId, columnId, null, "cancel"),
    });
    editor = { comp, rowId, columnId };
    return comp;
  }

  /** A data cell's content: the editor, the editable display, or the plain render. */
  function fillCell(td: HTMLTableCellElement, col: DataTableColumn<TData>, r: DisplayRow, rowId: string): void {
    const columnId = colId(col);
    const key = cellKey(rowId, columnId);
    for (const c of cellComps.get(key) ?? []) c.destroy();
    cellComps.delete(key);
    const editable = isEditable(col, r.row);
    if (editable && editing && editing.rowId === rowId && editing.columnId === columnId) {
      const comp = editorFor(col, r, rowId);
      const was = moving;
      moving = true;
      td.replaceChildren(comp.el);
      moving = was;
      return;
    }
    const content = renderCell(col, r.row, r.index);
    const comps: AnyZenComponent[] = [];
    collectInto(content, comps);
    if (comps.length) cellComps.set(key, comps);
    if (!editable) {
      td.replaceChildren(...toNodes(content));
      return;
    }
    const wrap = h("div", cellNavActive() ? EDIT_NAV_CLASS : EDIT_BUTTON_CLASS);
    wrap.append(...toNodes(content));
    // With cell navigation the cell itself is the focus target and starts the
    // edit (see below), so the display is not a button of its own.
    if (!cellNavActive()) {
      wrap.tabIndex = 0;
      wrap.setAttribute("role", "button");
      wrap.setAttribute("aria-label", loc.t("dataTable.editCell", { column: headerText(col) }));
      wrap.addEventListener("dblclick", () => startEdit(rowId, columnId));
      wrap.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          startEdit(rowId, columnId);
        }
      });
    }
    td.replaceChildren(wrap);
  }

  function paintCell(rowId: string, columnId: string): void {
    const td = cellEls.get(cellKey(rowId, columnId));
    const r = displayById.get(rowId);
    const col = colById(columnId);
    if (td && r && col) fillCell(td, col, r, rowId);
  }

  /* ----- cell navigation -----
   * enableCellNavigation. The grid's cells are the data columns (not the
   * select column) by the rows on screen. One cell is active, the table's
   * single tab stop; a selection is a rectangle from an anchor to a focus,
   * the arithmetic in core's grid-range. Keys, pointer, copy and paste are
   * read by listeners on the table's container, one of each, attached once:
   * the container outlives every repaint. Moving the active cell or the
   * selection repaints the cells' attributes, not the rows. */
  const navRows = (): number => lastDisplay.length;
  const navCols = (): DataTableColumn<TData>[] => leafColumns();
  const nCols = (): number => navCols().length;
  const activeNow = (): GridCell =>
    clampRange({ anchor: activeCell, focus: activeCell }, navRows(), nCols())?.anchor ?? ORIGIN;
  const selRectNow = (): CellRect | null => {
    const c = clampRange(cellSel, navRows(), nCols());
    return c ? rangeRect(c) : null;
  };
  const navColIndex = (id: string): number => navCols().findIndex((c) => colId(c) === id);

  /** Tab stop, selection and its tint, on the cells mounted now. */
  function paintNav(): void {
    if (!cellNavActive()) return;
    const at = activeNow();
    const rect = selRectNow();
    const multi = !!rect && (rect.top !== rect.bottom || rect.left !== rect.right);
    for (const td of cellEls.values()) {
      const row = displayIndexById.get(td.dataset.row ?? "") ?? -1;
      const col = navColIndex(td.dataset.col ?? "");
      if (row < 0 || col < 0) continue;
      const isActive = row === at.row && col === at.col;
      const isSelected = multi && !!rect && inRect(rect, row, col);
      td.tabIndex = isActive ? 0 : -1;
      td.setAttribute("aria-selected", isSelected || isActive ? "true" : "false");
      td.classList.toggle("zen-bg-zen-primary-soft", isSelected);
    }
  }
  const setSelection = (r: CellRange): void => {
    cellSel = r;
    paintNav();
  };

  function cellAt(target: EventTarget | null): { td: HTMLTableCellElement; at: GridCell } | null {
    const td = (target as Element | null)?.closest?.("td[data-col]") as HTMLTableCellElement | null;
    if (!td || !containerEl.contains(td)) return null;
    const row = displayIndexById.get(td.dataset.row ?? "") ?? -1;
    const col = navColIndex(td.dataset.col ?? "");
    return row < 0 || col < 0 ? null : { td, at: { row, col } };
  }

  function focusCell(at: GridCell): void {
    const r = lastDisplay[at.row];
    const col = navCols()[at.col];
    if (!r || !col) return;
    const key = cellKey(rowIdOf(r.row, r.index), colId(col));
    if (rowVirt()) vw?.scrollToIndex(at.row);
    const el = cellEls.get(key);
    if (!el) return;
    el.focus({ preventScroll: true });
    keepInView(el);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const now = cellEls.get(key);
        if (now && document.activeElement === now) keepInView(now);
      }),
    );
  }

  function moveTo(at: GridCell): void {
    activeCell = at;
    setSelection({ anchor: at, focus: at });
    focusCell(at);
  }

  // Shift extends the selection from the active cell, which stays where it
  // is; the far corner is scrolled to, so a range can reach rows not yet in
  // view.
  function extendTo(to: GridCell): void {
    setSelection({ anchor: activeNow(), focus: to });
    if (rowVirt()) vw?.scrollToIndex(to.row);
  }

  // The text a cell copies: its value, as a spreadsheet would take it.
  function cellText(r: DisplayRow, col: DataTableColumn<TData>): string {
    const v = getValue(col, r.row, r.index);
    if (v === null || v === undefined) return "";
    if (v instanceof Date) return v.toISOString();
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  }

  // A pasted or cleared value, as the column's editor would have produced it;
  // null when the column cannot take it (not editable, not a number, not one
  // of a select's options), and that cell is left alone.
  function valueFor(r: DisplayRow, col: DataTableColumn<TData>, text: string): { value: unknown } | null {
    if (!isEditable(col, r.row)) return null;
    const m = col.meta;
    if (m?.editVariant === "number") {
      const t = text.trim();
      if (t === "") return { value: null };
      const n = Number(t.replace(/[,\s]/g, ""));
      return Number.isFinite(n) ? { value: n } : null;
    }
    if (m?.editVariant === "select") {
      const options = m.editOptions ?? [];
      const hit =
        options.find((o) => o.value === text) ??
        options.find((o) => o.label.toLowerCase() === text.trim().toLowerCase());
      return hit ? { value: hit.value } : null;
    }
    return { value: text };
  }

  function editRect(rect: CellRect, textAt: (row: number, col: number) => string): CellEditPayload[] {
    const edits: CellEditPayload[] = [];
    for (let ri = rect.top; ri <= rect.bottom; ri++) {
      const r = lastDisplay[ri];
      if (!r) continue;
      for (let ci = rect.left; ci <= rect.right; ci++) {
        const col = navCols()[ci];
        if (!col) continue;
        const v = valueFor(r, col, textAt(ri, ci));
        if (v) edits.push({ rowId: rowIdOf(r.row, r.index), columnId: colId(col), value: v.value });
      }
    }
    return edits;
  }

  // After an editor's own Enter or Esc has closed it, focus returns to the
  // grid. The editor handles those keys after the table sees them (this is a
  // capture listener), so the return waits a task.
  const afterEdit = (to: GridCell): void => {
    setTimeout(() => moveTo(to));
  };

  function onNavKeyDown(e: KeyboardEvent): void {
    if (!cellNavActive()) return;
    const hit = cellAt(e.target);
    if (!hit) return;
    const { td, at } = hit;
    const nRows = navRows();
    if (e.target !== td) {
      // Inside the cell: an editor, or a control the cell renders.
      if (!editing) return;
      if (e.key === "Escape") afterEdit(at);
      else if (e.key === "Enter" && !e.shiftKey) afterEdit({ row: Math.min(at.row + 1, nRows - 1), col: at.col });
      else if (e.key === "Tab") {
        // Across, committing on the way: the editor saves when it loses focus.
        e.preventDefault();
        moveTo({ row: at.row, col: Math.min(Math.max(at.col + (e.shiftKey ? -1 : 1), 0), nCols() - 1) });
      }
      return;
    }
    if (e.altKey) return;
    const ctrl = e.ctrlKey || e.metaKey;
    const rtl = getComputedStyle(td).direction === "rtl";
    const key = rtl && e.key === "ArrowLeft" ? "ArrowRight" : rtl && e.key === "ArrowRight" ? "ArrowLeft" : e.key;
    const to = cellKeyTarget(key, e.shiftKey ? cellSel.focus : at, nRows, nCols(), ctrl);
    if (to) {
      e.preventDefault();
      if (e.shiftKey) extendTo(to);
      else moveTo(to);
      return;
    }
    const r = lastDisplay[at.row];
    const col = navCols()[at.col];
    if (!r || !col) return;
    const rect = selRectNow();
    const multi = !!rect && (rect.top !== rect.bottom || rect.left !== rect.right);
    const rowId = rowIdOf(r.row, r.index);
    if (ctrl && key.toLowerCase() === "a") {
      e.preventDefault();
      setSelection({ anchor: ORIGIN, focus: { row: nRows - 1, col: nCols() - 1 } });
    } else if (key === "Escape" && multi) {
      e.preventDefault();
      setSelection({ anchor: at, focus: at });
    } else if ((key === "Enter" || key === "F2") && isEditable(col, r.row)) {
      e.preventDefault();
      startEdit(rowId, colId(col));
    } else if ((key === "Delete" || key === "Backspace") && rect) {
      e.preventDefault();
      editCells(editRect(rect, () => ""));
    } else if (key.length === 1 && !ctrl && isEditable(col, r.row)) {
      e.preventDefault();
      startEdit(rowId, colId(col), key);
    }
  }

  function onNavDblClick(e: MouseEvent): void {
    if (!cellNavActive()) return;
    const hit = cellAt(e.target);
    if (!hit || editing) return;
    const r = lastDisplay[hit.at.row];
    const col = navCols()[hit.at.col];
    if (r && col && isEditable(col, r.row)) startEdit(rowIdOf(r.row, r.index), colId(col));
  }

  // Pointer: a press makes a cell active, Shift+press extends to it, a drag
  // selects what it crosses. Text selection is held off during the drag.
  function onNavPointerDown(e: PointerEvent): void {
    if (!cellNavActive() || e.button !== 0) return;
    const hit = cellAt(e.target);
    if (!hit) return;
    if (editing && hit.td.contains(document.activeElement) && document.activeElement !== hit.td) return;
    if (e.shiftKey) {
      e.preventDefault();
      extendTo(hit.at);
      return;
    }
    activeCell = hit.at;
    setSelection({ anchor: hit.at, focus: hit.at });
    stopCellDrag?.();
    const userSelect = containerEl.style.userSelect;
    const onOver = (ev: PointerEvent) => {
      const over = cellAt(ev.target);
      if (!over) return;
      containerEl.style.userSelect = "none";
      setSelection({ anchor: activeNow(), focus: over.at });
    };
    const stop = () => {
      containerEl.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      containerEl.style.userSelect = userSelect;
      stopCellDrag = undefined;
    };
    containerEl.addEventListener("pointerover", onOver);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    stopCellDrag = stop;
  }

  // Copy and paste reach the focused cell (the active one) as events: the
  // clipboard is read and written through them, so no permission is asked.
  function onNavCopy(e: ClipboardEvent): void {
    if (!cellNavActive() || editing || !cellAt(document.activeElement)) return;
    const rect = selRectNow();
    if (!rect || !e.clipboardData) return;
    const lines: string[][] = [];
    for (let ri = rect.top; ri <= rect.bottom; ri++) {
      const r = lastDisplay[ri];
      if (!r) continue;
      const line: string[] = [];
      for (let ci = rect.left; ci <= rect.right; ci++) {
        const col = navCols()[ci];
        line.push(col ? cellText(r, col) : "");
      }
      lines.push(line);
    }
    e.clipboardData.setData("text/plain", toTsv(lines));
    e.preventDefault();
  }
  function onNavPaste(e: ClipboardEvent): void {
    if (!cellNavActive() || editing || !cellAt(document.activeElement)) return;
    const text = e.clipboardData?.getData("text/plain");
    const rect = selRectNow();
    if (!text || !rect) return;
    e.preventDefault();
    const plan = pastePlan(parseTsv(text), rect, navRows(), nCols());
    if (plan.length === 0) return;
    const byCell = new Map(plan.map((t) => [`${t.row}:${t.col}`, t.value]));
    const bottom = Math.max(...plan.map((t) => t.row));
    const right = Math.max(...plan.map((t) => t.col));
    const edits = editRect({ top: rect.top, left: rect.left, bottom, right }, (ri, ci) => byCell.get(`${ri}:${ci}`) ?? "");
    // What was pasted is selected, as a spreadsheet shows it.
    cellSel = { anchor: { row: rect.top, col: rect.left }, focus: { row: bottom, col: right } };
    editCells(edits);
    paintNav();
  }

  containerEl.addEventListener("keydown", onNavKeyDown, true);
  containerEl.addEventListener("dblclick", onNavDblClick);
  containerEl.addEventListener("pointerdown", onNavPointerDown);
  containerEl.addEventListener("copy", onNavCopy);
  containerEl.addEventListener("paste", onNavPaste);
  disposer.add(() => {
    containerEl.removeEventListener("keydown", onNavKeyDown, true);
    containerEl.removeEventListener("dblclick", onNavDblClick);
    containerEl.removeEventListener("pointerdown", onNavPointerDown);
    containerEl.removeEventListener("copy", onNavCopy);
    containerEl.removeEventListener("paste", onNavPaste);
    stopCellDrag?.();
    stopRowDrag?.();
    const ed = editor;
    editor = null;
    editing = null;
    ed?.comp.destroy();
  });

  /* Whether the table holds focus, kept from its own focus events rather than
   * read from document.activeElement, which is the page during a blur. A blur
   * towards nothing that leaves its element in place is a click elsewhere:
   * the table gives focus up. One whose element has gone is a rebuild: it
   * does not. (Cell navigation and keyboard rows only.) */
  let tableHasFocus = false;
  const onFocusIn = (): void => {
    tableHasFocus = true;
  };
  const onFocusOut = (e: FocusEvent): void => {
    const to = e.relatedTarget as Node | null;
    if (to) {
      if (!containerEl.contains(to)) tableHasFocus = false;
      return;
    }
    const from = e.target as Element;
    setTimeout(() => {
      const now = document.activeElement;
      if (from.isConnected && (!now || now === document.body)) tableHasFocus = false;
    });
  };
  containerEl.addEventListener("focusin", onFocusIn);
  containerEl.addEventListener("focusout", onFocusOut);
  disposer.add(() => {
    containerEl.removeEventListener("focusin", onFocusIn);
    containerEl.removeEventListener("focusout", onFocusOut);
  });

  /* Every state change repaints the body, which would drop focus to the page.
   * Where focus was in the table, it is put back: in the editor, on the
   * active cell, on the same row (by id, so a sort or new data that moves the
   * row is followed), on the same control inside it, or, when that row has
   * gone, on the keyboard's tab-stop row. */
  const FOCUSABLE = "button, input, select, textarea, a[href], [tabindex]";
  type FocusMark =
    | { kind: "editor" }
    | { kind: "cell" }
    | { kind: "row"; id: string; sub: number }
    | { kind: "other"; index: number };
  function captureFocus(): FocusMark | null {
    if (editor?.comp.holdsFocus()) return { kind: "editor" };
    const active = document.activeElement;
    // Focus is between two of the table's own elements (an editor's blur
    // committing while focus moves to the next cell): it goes to the active
    // cell or the tab-stop row once the rows are rebuilt.
    if ((!active || active === document.body) && tableHasFocus) {
      if (cellNavActive()) return { kind: "cell" };
      const stop = lastDisplay[Math.min(focusIndex, lastDisplay.length - 1)];
      if (keyboardActive() && stop) return { kind: "row", id: rowIdOf(stop.row, stop.index), sub: -1 };
    }
    if (!active || !containerEl.contains(active)) return null;
    if (cellNavActive() && active.matches("td[data-col]")) return { kind: "cell" };
    const tr = active.closest("tr");
    const id = tr ? rowIdOfEl.get(tr) : undefined;
    if (tr && id !== undefined) {
      const sub = active === tr ? -1 : Array.from(tr.querySelectorAll(FOCUSABLE)).indexOf(active);
      return { kind: "row", id, sub };
    }
    return { kind: "other", index: Array.from(containerEl.querySelectorAll(FOCUSABLE)).indexOf(active) };
  }
  function restoreFocus(mark: FocusMark | null): void {
    if (!mark) return;
    if (mark.kind === "editor" && editor) {
      if (!editor.comp.holdsFocus()) editor.comp.focus();
      return;
    }
    const active = document.activeElement;
    if (active && active !== document.body && containerEl.contains(active)) return;
    let target: Element | undefined;
    if (mark.kind === "cell" || mark.kind === "editor") {
      if (!cellNavActive()) return;
      const at = activeNow();
      const r = lastDisplay[at.row];
      const col = navCols()[at.col];
      if (r && col) target = cellEls.get(cellKey(rowIdOf(r.row, r.index), colId(col)));
    } else if (mark.kind === "row") {
      const tr = rowElById.get(mark.id);
      if (tr) target = mark.sub < 0 ? tr : tr.querySelectorAll(FOCUSABLE)[mark.sub] ?? tr;
      else if (keyboardActive()) target = rowElAt(Math.min(focusIndex, lastDisplay.length - 1));
    } else if (mark.index >= 0) {
      target = containerEl.querySelectorAll(FOCUSABLE)[mark.index];
    }
    (target as HTMLElement | undefined)?.focus({ preventScroll: true });
  }

  /* ----- the regular table ----- */
  const rowOrderingActive = (): boolean => !!current.enableRowOrdering && !isVirt();

  function totalColumnCount(): number {
    return leafColumns().length + (current.enableRowSelection ? 1 : 0) + (rowOrderingActive() ? 1 : 0);
  }

  function messageRow(text: string): HTMLElement {
    const tr = h("tr");
    const td = h("td", "zen-text-center zen-text-zen-muted-fg zen-py-6");
    td.setAttribute("colspan", String(totalColumnCount()));
    td.textContent = text;
    tr.append(td);
    return tr;
  }

  /** One body row, registered in the maps; what it creates is kept in rowComps / cellComps. */
  function buildRow(r: DisplayRow, i: number): HTMLElement {
    const keyboard = keyboardActive();
    const nav = cellNavActive();
    const virtual = rowVirt();
    const id = rowIdOf(r.row, r.index);
    const selected = effSelection().has(id);
    const comps: AnyZenComponent[] = [];
    const tr = h(
      "tr",
      cn(TABLE_ROW_CLASS, current.rowClassName?.(r.row, r.index)),
    );
    // Added past cn(): its merge reads `outline` and `outline-2` as one
    // conflict and would keep only the width, leaving the browser's ring.
    if (keyboard) tr.classList.add(...ROW_FOCUS_CLASS);
    if (selected) tr.setAttribute("data-state", "selected");
    rowElById.set(id, tr);
    rowIdOfEl.set(tr, id);
    // A context menu is attached: rows and cells say which they are.
    if (menuActive()) tr.setAttribute("data-row-id", id);
    if (keyboard) {
      const tabStop = Math.min(focusIndex, Math.max(lastDisplay.length - 1, 0));
      tr.setAttribute("tabindex", i === tabStop ? "0" : "-1");
      const label = current.rowLabel?.(r.row, r.index);
      if (label !== undefined) tr.setAttribute("aria-label", label);
      if (current.enableRowSelection) tr.setAttribute("aria-selected", selected ? "true" : "false");
      tr.addEventListener("keydown", (e) => onRowKeyDown(e, tr, r, i));
      // focusin, not focus: a control inside the row makes it the tab stop too.
      tr.addEventListener("focusin", () => {
        if (focusIndex !== i || tr.getAttribute("tabindex") !== "0") setTabStop(i);
      });
    }
    if (virtual) {
      tr.setAttribute("data-index", String(i));
      // The header row is 1; rows count from 2.
      tr.setAttribute("aria-rowindex", String(i + 2));
    }

    if (rowOrderingActive()) {
      const td = h("td", cn(TABLE_CELL_CLASS, sepCellClass()));
      markUtilityPin(td, "__drag__");
      const grip = h("button", DRAG_HANDLE_CLASS) as HTMLButtonElement;
      grip.type = "button";
      grip.setAttribute("aria-label", loc.t("dataTable.dragRow"));
      grip.append(svgNode(GRIP));
      grip.addEventListener("pointerdown", (e) => startRowDrag(id, e));
      td.append(grip);
      tr.append(td);
    }

    if (expansionActive()) {
      const td = h("td", cn(TABLE_CELL_CLASS, sepCellClass()));
      markUtilityPin(td, "__expand__");
      const open = isExpanded(id);
      const btn = h(
        "button",
        cn(
          "zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6 zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring zen-transition-transform",
          open && "zen-rotate-90",
        ),
      ) as HTMLButtonElement;
      btn.type = "button";
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", loc.t(open ? "dataTable.collapseRow" : "dataTable.expandRow"));
      btn.append(svgNode(EXPAND_CHEVRON));
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleExpanded(id);
      });
      td.append(btn);
      tr.append(td);
    }

    if (current.enableRowSelection) {
      const td = h("td", cn(TABLE_CELL_CLASS, sepCellClass()));
      markUtilityPin(td, "__select__");
      const cb = Checkbox({
        checked: selected,
        onCheckedChange: () => toggleRow(id),
        "aria-label": loc.t("dataTable.selectRow", { n: r.index + 1 }),
      });
      comps.push(cb);
      td.append(cb.el);
      tr.append(td);
    }

    for (const col of leafColumns()) {
      const columnId = colId(col);
      const td = h("td", cn(TABLE_CELL_CLASS, sepCellClass())) as HTMLTableCellElement;
      markPin(td, col);
      if (nav) {
        // Its place in the grid; paintNav sets the tab stop and the selection.
        td.classList.add(...NAV_CELL_FOCUS_CLASS);
        td.setAttribute("role", "gridcell");
        td.tabIndex = -1;
        td.setAttribute("aria-selected", "false");
        td.setAttribute("data-row", id);
        td.setAttribute("data-col", columnId);
      }
      if (menuActive()) td.setAttribute("data-column", columnId);
      cellEls.set(cellKey(id, columnId), td);
      // Inside a group the grouped columns stay empty: the group row says it.
      if (!(groupingActive() && effGrouping().includes(columnId))) fillCell(td, col, r, id);
      tr.append(td);
    }
    rowComps.set(id, comps);
    if (dragRowId !== null) paintDragRow(tr, i);
    if (expansionActive() && isExpanded(id)) {
      // React's panel: the full width, flush, on a faint muted ground.
      const sub = h("tr", TABLE_ROW_CLASS);
      sub.setAttribute("data-expanded-of", id);
      const td = h("td", "zen-p-0 zen-bg-zen-muted/30") as HTMLTableCellElement;
      td.colSpan = tr.children.length;
      td.append(...toNodes(current.renderSubRow!({ row: r.row, index: r.index, id })));
      sub.append(td);
      subElById.set(id, sub);
    }
    return tr;
  }

  /* ----- row ordering (enableRowOrdering) -----
   * The table drags its rows itself. Most rows of a virtualized table are not
   * mounted, so the drop position comes from the row window's layout (or the
   * mounted rows' boxes when every row is mounted), the table scrolls itself
   * while the pointer is near its top or bottom edge, and the dragged row
   * stays mounted. Esc cancels. Everything a drag adds to the window is
   * removed when it ends, or when the table goes. */
  function paintDragRow(tr: HTMLElement, index: number): void {
    const id = rowIdOfEl.get(tr);
    const dragging = dragRowId !== null && id === dragRowId;
    if (dragging) tr.setAttribute("data-dragging", "true");
    else tr.removeAttribute("data-dragging");
    tr.classList.toggle("zen-opacity-50", dragging);
    const n = lastDisplay.length;
    const edge =
      dropIndex === null ? undefined : dropIndex === index ? "before" : dropIndex === n && index === n - 1 ? "after" : undefined;
    if (edge) tr.setAttribute("data-drop", edge);
    else tr.removeAttribute("data-drop");
    // The line is drawn on the cells: a row's own box-shadow is not painted
    // in a collapsed-border table.
    for (const td of Array.from(tr.children) as HTMLElement[]) {
      td.style.boxShadow = edge ? `inset 0 ${edge === "before" ? 2 : -2}px 0 0 var(--zen-color-primary)` : "";
    }
  }
  function paintDrag(): void {
    for (const [id, tr] of rowElById) paintDragRow(tr, displayIndexById.get(id) ?? -1);
  }

  /** The row at a content offset in the scroller (header included). */
  function rowAtOffset(scroller: HTMLElement, offset: number): { index: number; start: number; end: number } | undefined {
    if (vw) return vw.itemAt(offset);
    const box = scroller.getBoundingClientRect();
    let best: { index: number; start: number; end: number } | undefined;
    for (let i = 0; i < lastDisplay.length; i++) {
      const tr = rowElAt(i);
      if (!tr) continue;
      const r = tr.getBoundingClientRect();
      const start = r.top - box.top + scroller.scrollTop;
      const end = start + r.height;
      best = { index: i, start, end };
      if (offset < end) break;
    }
    return best;
  }

  function startRowDrag(rowId: string, e: PointerEvent): void {
    const scroller = tableWrapper;
    const tableEl = scroller?.querySelector("table");
    if (e.button !== 0 || !scroller || !tableEl) return;
    e.preventDefault(); // no text selection, no compatibility mouse events
    stopRowDrag?.();
    let pointerY = e.clientY;
    let frame = 0;
    const band = () => {
      const rect = scroller.getBoundingClientRect();
      const top = tableEl.tHead?.getBoundingClientRect().bottom ?? rect.top;
      return { rect, top, bottom: rect.top + scroller.clientHeight };
    };
    const locate = () => {
      const { rect, top, bottom } = band();
      const y = Math.min(Math.max(pointerY, top), bottom - 1);
      const offset = scroller.scrollTop + (y - rect.top);
      const hit = rowAtOffset(scroller, offset);
      if (!hit) return;
      const next = offset > (hit.start + hit.end) / 2 ? hit.index + 1 : hit.index;
      if (next === dropIndex) return;
      dropIndex = next;
      paintDrag();
    };
    // Near an edge the table scrolls, faster the further past it the pointer is.
    const EDGE = 40;
    const tick = () => {
      const { top, bottom } = band();
      const over =
        pointerY < top + EDGE ? pointerY - (top + EDGE) : pointerY > bottom - EDGE ? pointerY - (bottom - EDGE) : 0;
      if (over) {
        scroller.scrollTop += Math.max(-200, Math.min(200, Math.round(over / 3) || Math.sign(over)));
        vw?.paint();
        locate();
      }
      frame = requestAnimationFrame(tick);
    };
    const finish = (commit: boolean) => {
      const from = displayIndexById.get(rowId);
      const to = dropIndex;
      stop();
      if (!commit || from === undefined || to === null) return;
      const target = to > from ? to - 1 : to;
      if (target === from) return;
      const ids = lastDisplay.map((r) => rowIdOf(r.row, r.index));
      const [moved] = ids.splice(from, 1);
      ids.splice(target, 0, moved);
      current.onRowOrderChange?.(ids);
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
      dragRowId = null;
      dropIndex = null;
      stopRowDrag = undefined;
      paintDrag();
      vw?.paint();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey, true);
    stopRowDrag = stop;
    dragRowId = rowId;
    paintDrag();
    locate();
    frame = requestAnimationFrame(tick);
  }

  /** A row leaving the window: what it made is released. */
  function unmountRow(id: string, tr: HTMLElement): void {
    for (const c of rowComps.get(id) ?? []) c.destroy();
    rowComps.delete(id);
    for (const col of leafColumns()) {
      const key = cellKey(id, colId(col));
      for (const c of cellComps.get(key) ?? []) c.destroy();
      cellComps.delete(key);
      cellEls.delete(key);
    }
    rowElById.delete(id);
    subElById.get(id)?.remove();
    subElById.delete(id);
    tr.remove();
  }

  function spacerRow(height: number): HTMLElement {
    const tr = h("tr");
    tr.setAttribute("aria-hidden", "true");
    tr.setAttribute("data-virtual-spacer", "");
    const td = h("td");
    td.setAttribute("colspan", String(totalColumnCount()));
    td.style.height = `${height}px`;
    td.style.padding = "0";
    td.style.border = "0";
    tr.append(td);
    return tr;
  }

  /* ----- row virtualization -----
   * enableRowVirtualization: the regular table's rows, only those in view. The
   * rows it skips are stood in for by spacer rows of their height, so the
   * table stays one table: header, column widths, sticky cells and footer are
   * the plain body's, and so is every row. Rows are measured as they mount,
   * so a taller one is placed where it really is; until then a row is placed
   * by an estimate (rowEstimatedHeight, or the first row measured).
   *
   * Scrolling only ever inserts the rows arriving and removes the ones
   * leaving: a mounted row is never moved, so the row that holds focus keeps
   * it. Some rows stay mounted wherever the scroll is: the keyboard's tab
   * stop (or the active cell's row), so the table never loses its one tab
   * stop or the focus it holds, and the row being edited, so a half-typed
   * value is not thrown away. The windowing maths is the same as
   * VirtualizedItems' (enableVirtualization's): a prefix sum of the rows'
   * heights and a binary search into it; it is here because those rows are
   * table rows, not absolutely placed divs. */
  interface RowWindow {
    paint(): void;
    scrollToIndex(index: number): void;
    /** The row at a content offset in the scroller (header included). */
    itemAt(offset: number): { index: number; start: number; end: number } | undefined;
    destroy(): void;
  }
  let vw: RowWindow | null = null;
  /* The row being dragged (enableRowOrdering), kept mounted while it is;
   * where it would land (before the row at this index; the row count: after
   * the last); and the release of the drag in progress. */
  let dragRowId: string | null = null;
  let dropIndex: number | null = null;
  let stopRowDrag: (() => void) | undefined;
  const rowSizes = new Map<string, number>();
  let estimate = 40;
  let learned = false;
  let estimateSet = false;

  function createRowWindow(scroller: HTMLElement, table: HTMLTableElement, tbody: HTMLElement): RowWindow {
    const OVERSCAN = 8;
    if (!estimateSet) {
      estimateSet = true;
      if (current.rowEstimatedHeight !== undefined) {
        estimate = current.rowEstimatedHeight;
        learned = true;
      }
    }
    let offsets = new Float64Array(1);
    let dirty = true;
    let frame = 0;
    let gone = false;
    const count = (): number => lastDisplay.length;
    const idAt = (i: number): string => rowIdOf(lastDisplay[i].row, lastDisplay[i].index);
    const layout = (): void => {
      const n = count();
      if (!dirty && offsets.length === n + 1) return;
      offsets = new Float64Array(n + 1);
      for (let i = 0; i < n; i++) offsets[i + 1] = offsets[i] + (rowSizes.get(idAt(i)) ?? estimate);
      dirty = false;
    };
    /** The row that holds the offset `y` (in the body's own coordinates). */
    const indexAt = (y: number): number => {
      const n = count();
      if (n === 0 || y <= 0) return 0;
      let lo = 0;
      let hi = n - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (offsets[mid] <= y) lo = mid;
        else hi = mid - 1;
      }
      return lo;
    };
    const headerHeight = (): number => table.tHead?.getBoundingClientRect().height ?? 0;
    const kept = (): number[] => {
      const n = count();
      const out: number[] = [];
      if (keyboardActive()) out.push(Math.min(focusIndex, n - 1));
      if (cellNavActive()) out.push(activeNow().row);
      if (editing) out.push(displayIndexById.get(editing.rowId) ?? -1);
      if (dragRowId !== null) out.push(displayIndexById.get(dragRowId) ?? -1);
      return out.filter((i) => i >= 0 && i < n);
    };

    const paint = (): void => {
      if (gone || !scroller.isConnected) return;
      for (let pass = 0; pass < 3; pass++) {
        layout();
        const n = count();
        if (n === 0) return;
        const top = scroller.scrollTop;
        const bottom = top + Math.max(0, scroller.clientHeight - headerHeight());
        const first = Math.max(0, indexAt(top) - OVERSCAN);
        const last = Math.min(n - 1, indexAt(bottom) + OVERSCAN);
        const want = new Set<number>();
        for (let i = first; i <= last; i++) want.add(i);
        for (const i of kept()) want.add(i);
        const list = [...want].sort((a, b) => a - b);
        const wantIds = new Set(list.map(idAt));
        for (const [id, tr] of [...rowElById]) if (!wantIds.has(id)) unmountRow(id, tr);
        for (const sp of Array.from(tbody.children)) if (sp.hasAttribute("data-virtual-spacer")) sp.remove();
        let cursor: ChildNode | null = tbody.firstChild;
        let prevEnd = 0;
        const fresh: Array<[string, HTMLElement]> = [];
        for (const i of list) {
          const id = idAt(i);
          let tr = rowElById.get(id);
          if (!tr) {
            tr = buildRow(lastDisplay[i], i);
            fresh.push([id, tr]);
            tbody.insertBefore(tr, cursor);
          } else if (tr === cursor) {
            cursor = tr.nextSibling;
          } else {
            tbody.insertBefore(tr, cursor);
          }
          // Its detail row travels with it, and the cursor steps past both.
          const sub = subElById.get(id);
          if (sub) {
            if (tr.nextSibling !== sub) tr.after(sub);
            if (cursor === sub) cursor = sub.nextSibling;
          }
          const gap = offsets[i] - prevEnd;
          if (gap > 0.5) tbody.insertBefore(spacerRow(gap), tr);
          prevEnd = offsets[i + 1];
        }
        const tail = offsets[n] - prevEnd;
        if (tail > 0.5) tbody.append(spacerRow(tail));
        for (const [id, tr] of fresh) {
          // A row's size includes its open detail row: the pair is one item.
          const size = tr.getBoundingClientRect().height + (subElById.get(id)?.getBoundingClientRect().height ?? 0);
          if (size <= 0) continue;
          if (!learned) {
            learned = true;
            // Re-estimate every unmeasured row from it: a jump to a row far
            // away lands where that row really is.
            if (Math.abs(size - estimate) > 0.01) {
              estimate = size;
              dirty = true;
            }
          }
          const was = rowSizes.get(id) ?? estimate;
          rowSizes.set(id, size);
          if (Math.abs(size - was) > 0.01) dirty = true;
        }
        if (!dirty) break;
      }
      paintNav();
    };

    const onScroll = (): void => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        paint();
      });
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    // fillHeight: the frame decides the height, and it can change.
    const ro = new ResizeObserver(() => onScroll());
    ro.observe(scroller);

    return {
      paint,
      scrollToIndex(index) {
        layout();
        if (index < 0 || index >= count()) return;
        const band = Math.max(0, scroller.clientHeight - headerHeight());
        const start = offsets[index];
        const end = offsets[index + 1];
        if (start < scroller.scrollTop) scroller.scrollTop = start;
        else if (end > scroller.scrollTop + band) scroller.scrollTop = end - band;
        paint();
      },
      itemAt(offset) {
        layout();
        if (count() === 0) return undefined;
        const head = headerHeight();
        const index = indexAt(offset - head);
        return { index, start: offsets[index] + head, end: offsets[index + 1] + head };
      },
      destroy() {
        gone = true;
        if (frame) cancelAnimationFrame(frame);
        scroller.removeEventListener("scroll", onScroll);
        ro.disconnect();
      },
    };
  }

  /* ----- grouping ----- */
  /* Rows (already filtered and sorted) nested by each grouped column in turn;
   * a group lists its rows only while expanded. Groups keep the order their
   * first row has, so sorting by the grouped column orders the groups. */
  function groupItems(rows: DisplayRow[]): BodyItem[] {
    const cols = effGrouping()
      .map((id) => colById(id))
      .filter((c): c is DataTableColumn<TData> => !!c);
    const keyOf = (col: DataTableColumn<TData>, r: DisplayRow) => getValue(col, r.row, r.index);
    const build = (list: DisplayRow[], depth: number, parent: string): BodyItem[] => {
      if (depth >= cols.length) return list.map((r) => ({ kind: "row" as const, r }));
      const col = cols[depth]!;
      const groups = new Map<string, { key: unknown; rows: DisplayRow[] }>();
      for (const r of list) {
        const key = keyOf(col, r);
        const k = String(key);
        const g = groups.get(k);
        if (g) g.rows.push(r);
        else groups.set(k, { key, rows: [r] });
      }
      const out: BodyItem[] = [];
      const next = cols[depth + 1];
      for (const [k, g] of groups) {
        const id = `${parent ? `${parent}>` : ""}${colId(col)}:${k}`;
        const children = next ? new Set(g.rows.map((r) => String(keyOf(next, r)))).size : g.rows.length;
        out.push({ kind: "group", id, depth, columnId: colId(col), key: g.key, leaves: g.rows, children });
        if (isExpanded(id)) out.push(...build(g.rows, depth + 1, id));
      }
      return out;
    };
    return build(rows, 0, "");
  }

  /* A group row: in the column grouped at its depth, the toggle, the value
   * (through the column's own cell) and "(N)"; a subtotal under each column
   * with meta.aggregate; every other cell empty. */
  function buildGroupRow(item: GroupItem): HTMLElement {
    const tr = h("tr", TABLE_ROW_CLASS);
    tr.dataset.group = item.id;
    const utility = (key: string) => {
      const td = h("td", cn(TABLE_CELL_CLASS, sepCellClass()));
      markUtilityPin(td, key);
      tr.append(td);
    };
    if (rowOrderingActive()) utility("__drag__");
    if (expansionActive()) utility("__expand__");
    if (current.enableRowSelection) utility("__select__");
    for (const col of leafColumns()) {
      const td = h("td", cn(TABLE_CELL_CLASS, sepCellClass()));
      markPin(td, col);
      if (colId(col) === item.columnId) {
        const open = isExpanded(item.id);
        const wrap = h("div", "zen-inline-flex zen-items-center zen-gap-1.5");
        const btn = h(
          "button",
          cn(
            "zen-inline-flex zen-items-center zen-justify-center zen-h-5 zen-w-5 zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer zen-transition-transform zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            open && "zen-rotate-90",
          ),
        ) as HTMLButtonElement;
        btn.type = "button";
        btn.setAttribute("aria-expanded", String(open));
        btn.setAttribute("aria-label", loc.t(open ? "dataTable.collapseGroup" : "dataTable.expandGroup"));
        btn.append(svgNode(GROUP_CHEVRON));
        btn.addEventListener("click", () => toggleExpanded(item.id));
        const value = h("span", "zen-font-medium");
        const first = item.leaves[0]!;
        value.append(
          ...toNodes(col.cell ? col.cell({ row: first.row, value: item.key, index: first.index }) : String(item.key ?? "")),
        );
        const count = h("span", "zen-text-xs zen-text-zen-muted-fg");
        count.textContent = `(${item.children})`;
        wrap.append(btn, value, count);
        td.append(wrap);
      } else if (col.meta?.aggregate && !effGrouping().includes(colId(col))) {
        // A column grouped at another depth is a placeholder here (TanStack's
        // rule), even if it also has a total.
        td.append(...toNodes(totalOf(col, item.leaves)));
      }
      tr.append(td);
    }
    return tr;
  }

  /* ----- per-column filters ----- */
  const canFilter = (col: DataTableColumn<TData>): boolean =>
    !!current.enablePerColumnFilters && col.enableColumnFilter !== false && !!(col.accessorKey || col.accessorFn);

  /* TanStack's setFilterValue: undefined removes the filter, anything else
   * replaces it in place or appends it. A filter change returns to page one. */
  function setColumnFilter(id: string, value: unknown): void {
    const prev = effColumnFilters();
    const at = prev.findIndex((f) => f.id === id);
    const next =
      value === undefined
        ? prev.filter((f) => f.id !== id)
        : at >= 0
          ? prev.map((f, i) => (i === at ? { id, value } : f))
          : [...prev, { id, value }];
    if (current.columnFilters === undefined) columnFiltersInner = next;
    current.onColumnFiltersChange?.(next);
    pageIndexInner = 0;
    sync();
  }
  function setGlobal(value: string): void {
    if (current.globalFilter === undefined) globalFilterInner = value;
    current.onGlobalFilterChange?.(value);
    filterInput?.update({ value });
    pageIndexInner = 0;
  }

  /* One control per column, built once and re-attached on every repaint: the
   * header is rebuilt each sync, and an input built afresh would lose focus
   * and caret on every keystroke (captureFilterFocus puts them back on the
   * same node). `set` shows a value that changed elsewhere (a chip removed). */
  interface FilterControl {
    el: HTMLElement;
    set(value: unknown): void;
    destroy(): void;
  }
  const filterControls = new Map<string, FilterControl>();
  disposer.add(() => {
    for (const c of filterControls.values()) c.destroy();
  });
  function opSelect<T extends string>(
    options: readonly { value: T; label: string; symbol: string }[],
    ariaLabel: string,
    onChange: (op: T) => void,
  ): HTMLSelectElement {
    const sel = document.createElement("select");
    sel.className = OP_SELECT_CLASS;
    sel.style.minWidth = "36px";
    sel.setAttribute("aria-label", ariaLabel);
    for (const o of options) {
      const opt = document.createElement("option");
      opt.value = o.value;
      opt.textContent = o.symbol;
      sel.append(opt);
    }
    const title = () =>
      (sel.title = loc.t((options.find((o) => o.value === sel.value) ?? options[0]!).label as MessageKey));
    sel.addEventListener("change", () => {
      title();
      onChange(sel.value as T);
    });
    title();
    return sel;
  }
  function filterControl(col: DataTableColumn<TData>): FilterControl {
    const id = colId(col);
    const existing = filterControls.get(id);
    if (existing) return existing;
    const name = headerText(col);
    const valueLabel = loc.t("dataTable.filterColumn", { column: name });
    const opLabel = loc.t("dataTable.filterOperator", { column: name });
    const row = h("div", "zen-flex zen-items-center zen-gap-1");
    const parts: { destroy(): void }[] = [];
    let set: (v: unknown) => void = () => {};
    const variant = col.meta?.filterVariant ?? "text";
    if (variant === "number") {
      let op: NumberFilterValue["op"] = "eq";
      let value: number | null = null;
      const sel = opSelect(NUMBER_FILTER_OPS, opLabel, (o) => {
        op = o;
        setColumnFilter(id, { op, value } satisfies NumberFilterValue);
      });
      const field = NumberField({
        placeholder: "…",
        "aria-label": valueLabel,
        class: "zen-h-7 zen-text-xs zen-flex-1 zen-min-w-0",
        onValueChange: (v) => {
          value = v;
          setColumnFilter(id, { op, value } satisfies NumberFilterValue);
        },
      } as Parameters<typeof NumberField>[0]);
      parts.push(field);
      row.append(sel, field.el);
      set = (v) => {
        const f = v as NumberFilterValue | undefined;
        op = f?.op ?? "eq";
        value = f?.value ?? null;
        if (sel.value !== op) sel.value = op;
        field.update({ value });
      };
    } else if (variant === "numberRange") {
      let range: NumberRangeFilterValue = [null, null];
      const min = NumberField({
        placeholder: loc.t("dataTable.min"),
        "aria-label": loc.t("dataTable.columnMinimum", { column: name }),
        class: "zen-h-7 zen-text-xs zen-min-w-0 zen-flex-1",
        onValueChange: (v) => setColumnFilter(id, (range = [v ?? null, range[1]])),
      } as Parameters<typeof NumberField>[0]);
      const dash = h("span", "zen-text-zen-muted-fg zen-text-xs");
      dash.setAttribute("aria-hidden", "true");
      dash.textContent = "–";
      const max = NumberField({
        placeholder: loc.t("dataTable.max"),
        "aria-label": loc.t("dataTable.columnMaximum", { column: name }),
        class: "zen-h-7 zen-text-xs zen-min-w-0 zen-flex-1",
        onValueChange: (v) => setColumnFilter(id, (range = [range[0], v ?? null])),
      } as Parameters<typeof NumberField>[0]);
      parts.push(min, max);
      row.append(min.el, dash, max.el);
      set = (v) => {
        range = (v as NumberRangeFilterValue | undefined) ?? [null, null];
        min.update({ value: range[0] });
        max.update({ value: range[1] });
      };
    } else if (variant === "select") {
      const ALL = "__all__";
      const select = Select({
        options: [
          { value: ALL, label: loc.t("dataTable.all") },
          ...(col.meta?.filterOptions ?? []).map((o) => ({ value: o.value, label: o.label })),
        ],
        value: ALL,
        "aria-label": valueLabel,
        // React sizes the trigger (SelectTrigger zen-h-7); vanilla's Select
        // takes `class` on its wrapper, so the trigger is reached from there.
        class: "[&>button]:zen-h-7 [&>button]:zen-text-xs",
        onValueChange: (v) => setColumnFilter(id, v === ALL ? undefined : v),
      } as Parameters<typeof Select>[0]);
      parts.push(select);
      row.className = "";
      row.append(select.el);
      set = (v) => select.update({ value: v === undefined || v === null || v === "" ? ALL : String(v) });
    } else if (variant === "boolean") {
      const sel = document.createElement("select");
      sel.className = cn(OP_SELECT_CLASS, "zen-w-full zen-px-2");
      sel.setAttribute("aria-label", valueLabel);
      for (const [v, key] of [["any", "dataTable.any"], ["true", "dataTable.yes"], ["false", "dataTable.no"]] as const) {
        const opt = document.createElement("option");
        opt.value = v;
        opt.textContent = loc.t(key);
        sel.append(opt);
      }
      sel.addEventListener("change", () => setColumnFilter(id, sel.value === "any" ? undefined : sel.value === "true"));
      row.className = "";
      row.append(sel);
      set = (v) => {
        const want = v === true || v === "true" ? "true" : v === false || v === "false" ? "false" : "any";
        if (sel.value !== want) sel.value = want;
      };
    } else {
      /* Text. Without operators the value is a bare string: an operator the
       * server ignores is a control that lies about what it does. */
      const operators = current.enableFilterOperators !== false;
      let op: TextFilterValue["op"] = "contains";
      let value = "";
      const commit = () => setColumnFilter(id, operators ? ({ op, value } satisfies TextFilterValue) : value);
      const sel = operators
        ? opSelect(TEXT_FILTER_OPS, opLabel, (o) => {
            op = o;
            commit();
          })
        : null;
      let composing = false;
      const input = Input({
        value: "",
        placeholder: loc.t("dataTable.filterPlaceholder"),
        "aria-label": valueLabel,
        class: "zen-h-7 zen-text-xs zen-flex-1 zen-min-w-0",
        onInput: (e) => {
          value = (e.target as HTMLInputElement).value;
          // Mid-composition (an IME), the repaint would end the composition.
          if (!composing) commit();
        },
      });
      input.el.addEventListener("compositionstart", () => (composing = true));
      input.el.addEventListener("compositionend", () => {
        composing = false;
        commit();
      });
      parts.push(input);
      if (sel) row.append(sel);
      row.append(input.el);
      set = (v) => {
        const obj = typeof v === "object" && v !== null ? (v as TextFilterValue) : null;
        op = obj?.op ?? "contains";
        value = obj ? (obj.value ?? "") : typeof v === "string" ? v : "";
        if (sel && sel.value !== op) sel.value = op;
        const field = row.querySelector("input");
        if (field && field.value !== value) input.update({ value });
      };
    }
    const control: FilterControl = { el: row, set, destroy: () => parts.forEach((p) => p.destroy()) };
    filterControls.set(id, control);
    return control;
  }
  /** Focus (and the caret) inside a filter control, to put back after a repaint. */
  function captureFilterFocus(): { el: HTMLElement; sel: [number | null, number | null] | null } | null {
    const a = document.activeElement as HTMLElement | null;
    if (!a) return null;
    for (const c of filterControls.values()) {
      if (c.el.contains(a)) {
        return { el: a, sel: a instanceof HTMLInputElement ? [a.selectionStart, a.selectionEnd] : null };
      }
    }
    return null;
  }
  function restoreFilterFocus(m: ReturnType<typeof captureFilterFocus>): void {
    if (!m || !m.el.isConnected || document.activeElement === m.el) return;
    m.el.focus({ preventScroll: true });
    if (m.sel && m.el instanceof HTMLInputElement && m.sel[0] !== null) {
      try {
        m.el.setSelectionRange(m.sel[0], m.sel[1] ?? m.sel[0]);
      } catch {
        // Not a text input (number fields reject selection ranges).
      }
    }
  }
  /** The filter row's cell for a column: its control, or empty. */
  function filterCell(tag: "th" | "div", col: DataTableColumn<TData>, cls: string): HTMLElement {
    const cell = h(tag, cls);
    if (tag === "th") markPin(cell, col);
    if (canFilter(col)) {
      const control = filterControl(col);
      control.set(columnFilterValue(colId(col)));
      cell.append(control.el);
    }
    return cell;
  }

  /* The bulk-actions bar (renderBulkActions): React's BulkActionBar. Rebuilt
   * only when the selection (or what it could grow to) changes, so a repaint
   * for anything else does not take focus off one of your action buttons. */
  const bulkEl = h(
    "div",
    "zen-flex zen-items-center zen-gap-3 zen-px-3 zen-py-2 zen-rounded-zen-md zen-bg-zen-primary-soft zen-border zen-border-zen-primary-soft zen-text-zen-primary-soft-fg",
  );
  bulkEl.setAttribute("role", "toolbar");
  bulkEl.setAttribute("aria-label", loc.t("dataTable.bulkActions"));
  let bulkSignature = "";
  function paintBulk(processed: DisplayRow[]): void {
    const sel = effSelection();
    if (!current.renderBulkActions || sel.size === 0) {
      bulkEl.remove();
      bulkSignature = "";
      return;
    }
    const picked = processed.filter((r) => sel.has(rowIdOf(r.row, r.index)));
    const pageIds = lastDisplay.map((r) => rowIdOf(r.row, r.index));
    const allPage = pageIds.length > 0 && pageIds.every((id) => sel.has(id));
    const crossPage = allPage && sel.size < processed.length;
    const signature = `${[...sel].sort().join(",")}|${processed.length}|${crossPage}`;
    if (signature !== bulkSignature) {
      bulkSignature = signature;
      const count = h("span", "zen-text-sm zen-font-medium");
      count.setAttribute("aria-live", "polite");
      count.setAttribute("aria-atomic", "true");
      count.textContent = loc.t("dataTable.nSelected", { count: sel.size });
      const parts: HTMLElement[] = [count];
      if (crossPage) {
        const all = h(
          "button",
          "zen-text-xs zen-underline zen-underline-offset-2 zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-inherit hover:zen-opacity-80 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        ) as HTMLButtonElement;
        all.type = "button";
        all.textContent = loc.t("dataTable.selectAllMatching", { count: processed.length });
        all.addEventListener("click", () => commitSelection(new Set(processed.map((r) => rowIdOf(r.row, r.index)))));
        parts.push(all);
      }
      const right = h("div", "zen-ml-auto zen-flex zen-items-center zen-gap-2");
      const clear = () => commitSelection(new Set());
      right.append(
        ...toNodes(
          current.renderBulkActions({
            rows: picked.map((r) => r.row),
            ids: picked.map((r) => rowIdOf(r.row, r.index)),
            clear,
          }),
        ),
      );
      const x = h(
        "button",
        "zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6 zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10 focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring",
      ) as HTMLButtonElement;
      x.type = "button";
      x.setAttribute("aria-label", loc.t("dataTable.clearSelection"));
      x.append(svgNode(CHIP_X.replace('width="10" height="10"', 'width="14" height="14"')));
      x.addEventListener("click", clear);
      right.append(x);
      parts.push(right);
      bulkEl.replaceChildren(...parts);
    }
    // Toolbar, bulk bar, filter chips, table: React's order.
    const anchor = chipsEl.isConnected ? chipsEl : containerEl;
    if (bulkEl.nextElementSibling !== anchor) anchor.before(bulkEl);
  }

  /* Active filters as chips above the table (React's ActiveFilterChips): the
   * search term and each column's filter, each removable, and Clear all. */
  const chipsEl = h("div", "zen-flex zen-flex-wrap zen-items-center zen-gap-2");
  chipsEl.setAttribute("role", "group");
  chipsEl.setAttribute("aria-label", loc.t("dataTable.activeFilters"));
  function chip(label: string, onRemove: () => void): HTMLElement {
    const el = h(
      "span",
      "zen-inline-flex zen-items-center zen-gap-1 zen-px-2 zen-py-0.5 zen-text-xs zen-font-medium zen-rounded-zen-full zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-border zen-border-zen-primary-soft",
    );
    const text = h("span");
    text.textContent = label;
    const x = h(
      "button",
      "zen-inline-flex zen-items-center zen-justify-center zen-h-4 zen-w-4 zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10 focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring",
    ) as HTMLButtonElement;
    x.type = "button";
    x.setAttribute("aria-label", loc.t("dataTable.removeChip", { label }));
    x.append(svgNode(CHIP_X));
    x.addEventListener("click", onRemove);
    el.append(text, x);
    return el;
  }
  function paintChips(): void {
    const words = { yes: loc.t("dataTable.yes"), no: loc.t("dataTable.no") };
    const global = effGlobalFilter();
    const cols = effColumnFilters()
      .map((f) => ({ f, text: describeColumnFilter(f.value, words) }))
      .filter((x) => x.text !== "");
    if (!global && cols.length === 0) {
      chipsEl.remove();
      return;
    }
    const label = h("span", "zen-text-xs zen-text-zen-muted-fg");
    label.textContent = loc.t("dataTable.filtersLabel");
    const items: HTMLElement[] = [label];
    if (global) {
      items.push(
        chip(loc.t("dataTable.searchChip", { value: global }), () => {
          setGlobal("");
          sync();
        }),
      );
    }
    for (const { f, text } of cols) {
      const col = colById(f.id);
      items.push(
        chip(loc.t("dataTable.filterChip", { column: col ? headerText(col) : f.id, value: text }), () =>
          setColumnFilter(f.id, undefined),
        ),
      );
    }
    const clear = h(
      "button",
      "zen-ml-1 zen-inline-flex zen-items-center zen-text-xs zen-px-2 zen-py-0.5 zen-rounded-zen-sm zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted zen-bg-transparent zen-border-0 zen-cursor-pointer focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
    ) as HTMLButtonElement;
    clear.type = "button";
    clear.textContent = loc.t("dataTable.clearAll");
    clear.addEventListener("click", () => {
      if (current.columnFilters === undefined) columnFiltersInner = [];
      current.onColumnFiltersChange?.([]);
      setGlobal("");
      sync();
    });
    items.push(clear);
    chipsEl.replaceChildren(...items);
    if (!chipsEl.isConnected || chipsEl.nextElementSibling !== containerEl) containerEl.before(chipsEl);
  }

  /* ----- pinning, resizing, header drag ----- */
  const resizable = (col: DataTableColumn<TData>): boolean =>
    !!current.enableColumnResizing && col.enableResizing !== false;

  /* Pinned cells are sticky; their offsets are measured once the table is laid
   * out (applyPinOffsets), so a selection or drag column before them, or a
   * column without a size, is counted at the width it really has. The look is
   * React's: the theme's background, and a border with a soft shadow on the
   * inner edge of the frozen block. */
  function stickCell(el: HTMLElement, side: "left" | "right", key: string): void {
    el.dataset.pin = side;
    el.dataset.pinCol = key;
    el.style.position = "sticky";
    const head = el.tagName === "TH";
    el.style.background = head ? headerStickyBg() : "var(--zen-color-background)";
    // Above sticky body cells; a sticky header row also sits above the body.
    const stickyHead = !!(current.stickyHeader || current.fillHeight || rowVirt()) && !isVirt();
    el.style.zIndex = head ? (stickyHead ? "11" : "2") : "1";
  }
  function markPin(el: HTMLElement, col: DataTableColumn<TData>): void {
    el.dataset.colId = colId(col);
    const side = pinSide(col);
    if (side) stickCell(el, side, colId(col));
  }
  /** The selection / drag columns stick too when columns are pinned left, or
   *  they would scroll away from under the frozen ones. */
  function markUtilityPin(el: HTMLElement, key: string): void {
    if (current.enableColumnPinning && layout().left.length > 0) stickCell(el, "left", key);
  }
  let pinObserver: ResizeObserver | null = null;
  disposer.add(() => pinObserver?.disconnect());
  function applyPinOffsets(table: HTMLElement): void {
    const head = table.querySelector<HTMLElement>("thead tr"); // i18n-ignore (a selector)
    if (!head) return;
    const ths = [...head.children] as HTMLElement[];
    const left = new Map<string, number>();
    const right = new Map<string, number>();
    let x = 0;
    for (const th of ths) {
      if (th.dataset.pin !== "left") break;
      left.set(th.dataset.pinCol!, x);
      x += th.getBoundingClientRect().width;
    }
    x = 0;
    for (const th of [...ths].reverse()) {
      if (th.dataset.pin !== "right") break;
      right.set(th.dataset.pinCol!, x);
      x += th.getBoundingClientRect().width;
    }
    const lastLeft = [...left.keys()].pop();
    const firstRight = [...right.keys()].pop();
    for (const cell of table.querySelectorAll<HTMLElement>("[data-pin]")) {
      const key = cell.dataset.pinCol!;
      if (cell.dataset.pin === "left" && left.has(key)) {
        cell.style.left = `${left.get(key)}px`;
        cell.style.boxShadow =
          key === lastLeft ? "inset -1px 0 0 var(--zen-color-border), 4px 0 6px -4px rgba(0,0,0,0.12)" : "";
      } else if (cell.dataset.pin === "right" && right.has(key)) {
        cell.style.right = `${right.get(key)}px`;
        cell.style.boxShadow =
          key === firstRight ? "inset 1px 0 0 var(--zen-color-border), -4px 0 6px -4px rgba(0,0,0,0.12)" : "";
      }
    }
  }
  /* After layout: pinned offsets, and the header row's height, which the
   * sticky filter row sits under (--zen-dt-header-h, as in React). */
  function watchPins(table: HTMLElement): void {
    pinObserver?.disconnect();
    pinObserver = null;
    if (!current.enableColumnPinning && !current.enablePerColumnFilters) return;
    pinObserver = new ResizeObserver(() => {
      if (current.enableColumnPinning) applyPinOffsets(table);
      const head = table.querySelector<HTMLElement>("thead tr"); // i18n-ignore (a selector)
      if (head && current.enablePerColumnFilters) {
        table.style.setProperty("--zen-dt-header-h", `${head.getBoundingClientRect().height}px`);
      }
    });
    pinObserver.observe(table);
  }

  /* The WAI-ARIA window-splitter pattern, as in React and Solid: a focusable
   * separator whose value is the width. Drag it, or arrow keys (16px, Shift
   * 64px), the arrow pointing away from the column widening it. */
  function resizeHandle(col: DataTableColumn<TData>, th: HTMLElement): HTMLElement {
    const id = colId(col);
    const sep = h(
      "div",
      "zen-absolute zen-right-0 zen-top-0 zen-h-full zen-w-1.5 zen-cursor-col-resize zen-select-none zen-touch-none zen-bg-transparent zen-border-0 zen-p-0 hover:zen-bg-zen-primary focus-visible:zen-bg-zen-primary focus-visible:zen-outline-none",
    );
    sep.setAttribute("role", "separator");
    sep.tabIndex = 0;
    sep.setAttribute("aria-orientation", "vertical");
    sep.setAttribute("aria-label", loc.t("dataTable.resize", { column: headerText(col) }));
    const size = colSize(col);
    if (size) sep.setAttribute("aria-valuenow", String(Math.round(size)));
    sep.setAttribute("aria-valuemin", String(col.minSize ?? 20));
    if (col.maxSize !== undefined) sep.setAttribute("aria-valuemax", String(col.maxSize));
    sep.dataset.resizeFor = id;
    sep.addEventListener("click", (e) => e.stopPropagation());
    sep.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startW = th.getBoundingClientRect().width;
      const rtl = getComputedStyle(th).direction === "rtl";
      let width = startW;
      sep.classList.add("zen-bg-zen-primary");
      // Live: the header cell sizes the column while dragging; the table is
      // rebuilt once, on release, with the new width.
      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        width = clampColumnSize(startW, rtl ? -dx : dx, col.minSize, col.maxSize);
        th.style.width = `${width}px`;
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        sep.classList.remove("zen-bg-zen-primary");
        if (width !== startW) setColumnSizing({ ...columnSizingInner, [id]: width });
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    });
    sep.addEventListener("keydown", (e) => {
      const rtl = getComputedStyle(sep).direction === "rtl";
      const delta = columnResizeDelta(e.key, { shift: e.shiftKey, rtl });
      if (delta === null) return;
      e.preventDefault();
      e.stopPropagation();
      const from = colSize(col) ?? th.getBoundingClientRect().width;
      setColumnSizing({ ...columnSizingInner, [id]: clampColumnSize(from, delta, col.minSize, col.maxSize) });
      // The repaint rebuilt the header: focus goes to this column's new handle.
      containerEl.querySelector<HTMLElement>(`[data-resize-for="${CSS.escape(id)}"]`)?.focus();
    });
    return sep;
  }

  /* Drag a header sideways to move its column (enableColumnOrdering). A press
   * that does not move is a click, so a sortable header still sorts. The
   * keyboard route is the Columns menu (Alt+ArrowUp / Alt+ArrowDown). */
  function attachHeaderDrag(th: HTMLElement, col: DataTableColumn<TData>): void {
    th.style.cursor = "grab";
    th.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || (e.target as Element).closest('[role="separator"]')) return;
      const id = colId(col);
      const startX = e.clientX;
      let dragging = false;
      let target: { id: string; after: boolean } | null = null;
      let marked: HTMLElement | null = null;
      const heads = () => [...(th.parentElement?.querySelectorAll<HTMLElement>("th[data-col-id]") ?? [])];
      const onMove = (ev: PointerEvent) => {
        if (!dragging && Math.abs(ev.clientX - startX) < 5) return;
        dragging = true;
        th.style.opacity = "0.6";
        const over = heads().find((x) => {
          const r = x.getBoundingClientRect();
          return ev.clientX >= r.left && ev.clientX <= r.right;
        });
        if (marked) marked.style.boxShadow = "";
        marked = null;
        target = null;
        if (over && over !== th) {
          const r = over.getBoundingClientRect();
          const after = ev.clientX > r.left + r.width / 2;
          target = { id: over.dataset.colId!, after };
          marked = over;
          // A 2px bar on the side the column will land.
          over.style.boxShadow = after ? "inset -2px 0 0 var(--zen-color-primary)" : "inset 2px 0 0 var(--zen-color-primary)";
        }
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        th.style.opacity = "";
        if (marked) marked.style.boxShadow = "";
        if (!dragging) return;
        // The click that follows a drag is not a sort.
        const swallow = (ev: Event) => {
          ev.stopPropagation();
          ev.preventDefault();
        };
        window.addEventListener("click", swallow, { capture: true, once: true });
        setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 0);
        if (!target) return;
        const visible = leafColumns().map((c) => colId(c)).filter((x) => x !== id);
        const at = visible.indexOf(target.id) + (target.after ? 1 : 0);
        visible.splice(at, 0, id);
        const rest = orderedColumnIds(allColumnIds(), columnOrderInner).filter((x) => !visible.includes(x));
        setColumnOrder([...visible, ...rest]);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    });
  }

  function buildTable(processed: DisplayRow[], display: DisplayRow[]): HTMLElement {
    const virtual = rowVirt();
    // Row virtualization scrolls the rows inside the table, so its header sticks.
    const stickyActive = !!(current.stickyHeader || current.fillHeight || virtual) && !isVirt();
    const wrapper = h(
      "div",
      cn("zen-relative zen-w-full zen-overflow-auto", current.fillHeight && "zen-min-h-0 zen-flex-1"),
    );
    if (stickyActive && !current.fillHeight) wrapper.style.maxHeight = `${bodyHeight()}px`;
    // The spacer rows change height as the window moves, and the browser's
    // scroll anchoring "corrects" the scroll for that on its own: a jump to a
    // row far off landed at the top instead.
    if (virtual) wrapper.style.overflowAnchor = "none";
    tableWrapper = wrapper;

    const table = h(
      "table",
      cn(
        "zen-w-full zen-caption-bottom zen-text-sm zen-border-collapse",
        // Virtualized, the columns are laid out from the header, not from
        // whichever rows happen to be mounted, so they hold still as you scroll.
        virtual && "zen-table-fixed",
      ),
    ) as HTMLTableElement;
    if (virtual) table.setAttribute("aria-rowcount", String(display.length + 1));
    if (cellNavActive()) {
      table.setAttribute("role", "grid");
      table.setAttribute("aria-multiselectable", "true");
    }

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
    if (virtual) htr.setAttribute("aria-rowindex", "1");

    if (rowOrderingActive()) {
      const th = h("th", cn(TABLE_HEAD_CLASS, "zen-w-8"));
      markUtilityPin(th, "__drag__");
      const label = h("span", "zen-sr-only");
      label.textContent = loc.t("dataTable.reorder");
      th.append(label);
      htr.append(th);
    }

    if (expansionActive()) {
      const th = h("th", cn(TABLE_HEAD_CLASS, "zen-w-8"));
      markUtilityPin(th, "__expand__");
      const label = h("span", "zen-sr-only");
      label.textContent = loc.t("dataTable.expand");
      th.append(label);
      htr.append(th);
    }

    if (current.enableRowSelection) {
      const th = h("th", cn(TABLE_HEAD_CLASS, "zen-w-9"));
      markUtilityPin(th, "__select__");
      const cb = Checkbox({
        checked: headerCheckState(processed),
        onCheckedChange: () => toggleAll(processed),
        "aria-label": loc.t("dataTable.selectAll"),
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
      const width = colSize(col);
      if (width) th.style.width = `${width}px`;
      markPin(th, col);
      if (sorted) {
        th.setAttribute("data-active", "true");
        th.setAttribute(
          "aria-sort",
          sorted === "asc" ? "ascending" : "descending",
        );
      }
      th.append(sortable ? sortButton(col) : plainHeaderSpan(col));
      if (resizable(col)) th.append(resizeHandle(col, th));
      if (current.enableColumnOrdering) attachHeaderDrag(th, col);
      htr.append(th);
    }
    thead.append(htr);

    /* The per-column filter row, under the header (and sticking under it). */
    if (current.enablePerColumnFilters) {
      const ftr = h("tr", cn(sepHeadClass(), stickyRowClass, headerVariantRowClass()));
      ftr.dataset.filterRow = "";
      if (stickyActive) ftr.style.top = "var(--zen-dt-header-h, 40px)";
      if (rowOrderingActive()) {
        const th = h("th", "zen-px-2 zen-py-1");
        markUtilityPin(th, "__drag__");
        ftr.append(th);
      }
      if (expansionActive()) {
        const th = h("th", "zen-px-2 zen-py-1");
        markUtilityPin(th, "__expand__");
        ftr.append(th);
      }
      if (current.enableRowSelection) {
        const th = h("th", "zen-px-2 zen-py-1");
        markUtilityPin(th, "__select__");
        ftr.append(th);
      }
      for (const col of leafColumns()) ftr.append(filterCell("th", col, "zen-px-2 zen-py-1"));
      thead.append(ftr);
    }

    /* tbody */
    const tbody = h("tbody", "[&_tr:last-child]:zen-border-0");
    if (current.loading) {
      tbody.append(messageRow(loc.t("dataTable.loading")));
    } else if (display.length === 0 && !pageItems?.length) {
      // (Collapsed groups are rows too: a page of group rows is not empty.)
      tbody.append(messageRow(current.emptyMessage ?? loc.t("dataTable.noResults")));
    } else if (virtual) {
      // One spacer as tall as every row, so the scroll a repaint restores is
      // there to restore; the window replaces it once the table is in place.
      vw = createRowWindow(wrapper, table, tbody);
      let total = 0;
      for (const r of display) total += rowSizes.get(rowIdOf(r.row, r.index)) ?? estimate;
      tbody.append(spacerRow(total));
    } else {
      if (pageItems) {
        let i = 0;
        for (const it of pageItems) {
          if (it.kind === "group") tbody.append(buildGroupRow(it));
          else {
            tbody.append(buildRow(it.r, i++));
            const sub = subElById.get(rowIdOf(it.r.row, it.r.index));
            if (sub) tbody.append(sub);
          }
        }
      } else {
        display.forEach((r, i) => {
          tbody.append(buildRow(r, i));
          const sub = subElById.get(rowIdOf(r.row, r.index));
          if (sub) tbody.append(sub);
        });
      }
    }

    /* tfoot — only when a column declares a footer or a total, so every
     * existing table keeps its exact markup. */
    const footerCols = leafColumns().filter((c) => c.footer);
    const hasTotals = leafColumns().some((c) => c.meta?.aggregate);
    if (footerCols.length || hasTotals) {
      const tfoot = h("tfoot", "zen-border-t zen-bg-zen-muted/50 zen-font-medium");
      const tr = h("tr", "");
      // Totals: right-aligned figures, kept in view at the bottom while the
      // rows scroll under them. A footer without totals renders exactly as it
      // always has.
      const totalCellClass = (isTotal: boolean): string =>
        cn(
          TABLE_CELL_CLASS,
          sepCellClass(),
          isTotal && "zen-text-end zen-tabular-nums",
          stickyActive && "zen-sticky zen-bottom-0 zen-z-[1] zen-bg-zen-muted",
        );
      // The drag column's cell, so the footer sits under its columns.
      if (rowOrderingActive()) {
        const td = h("td", hasTotals ? totalCellClass(false) : cn(TABLE_CELL_CLASS, sepCellClass()));
        markUtilityPin(td, "__drag__");
        tr.append(td);
      }
      if (expansionActive()) {
        const td = h("td", hasTotals ? totalCellClass(false) : cn(TABLE_CELL_CLASS, sepCellClass()));
        markUtilityPin(td, "__expand__");
        tr.append(td);
      }
      if (hasTotals) {
        tfoot.setAttribute("data-totals", "");
        // The select column's cell, so the totals sit under their columns.
        if (current.enableRowSelection) {
          const td = h("td", totalCellClass(false));
          markUtilityPin(td, "__select__");
          tr.append(td);
        }
      }
      const labelCol = hasTotals
        ? leafColumns().find((c) => !c.meta?.aggregate && !c.footer)
        : undefined;
      // The filtered rows (every page), or this page's own rows.
      const totalRows = current.totalsOver === "page" ? display : processed;
      for (const col of leafColumns()) {
        const td = h("td", hasTotals ? totalCellClass(!!col.meta?.aggregate) : cn(TABLE_CELL_CLASS, sepCellClass()));
        markPin(td, col);
        if (col.footer) {
          const content = col.footer(display.map((r: (typeof display)[number]) => r.row));
          collectInto(content, mounted);
          td.append(...toNodes(content));
        } else if (col.meta?.aggregate) {
          const content = totalOf(col, totalRows);
          collectInto(content, mounted);
          td.append(...toNodes(content));
        } else if (col === labelCol) {
          td.textContent = loc.t("dataTable.total");
        }
        tr.append(td);
      }
      tfoot.append(tr);
      table.append(thead, tbody, tfoot);
    } else {
      table.append(thead, tbody);
    }
    wrapper.append(table);
    watchPins(table);
    return wrapper;
  }

  /* ----- virtualized body ----- */
  function gridTemplate(): string {
    const parts: string[] = [];
    if (current.enableRowSelection) parts.push("36px");
    for (const col of leafColumns()) {
      const width = colSize(col);
      parts.push(width ? `${width}px` : "minmax(0, 1fr)");
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
        "aria-label": loc.t("dataTable.selectAll"),
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
      if (resizable(col)) {
        // The handle positions against its cell; the grid is sized by
        // gridTemplate(), which the release rebuilds from the new width.
        cell.style.position = "relative";
        cell.append(resizeHandle(col, cell));
      }
      virtHeaderEl.append(cell);
    }
    // The filter row: the grid's next row, cell for cell.
    if (current.enablePerColumnFilters) {
      if (current.enableRowSelection) virtHeaderEl.append(h("div"));
      for (const col of leafColumns()) virtHeaderEl.append(filterCell("div", col, "zen-px-2 zen-py-1"));
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
          "aria-label": loc.t("dataTable.selectRow", { n: index + 1 }),
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
    pagerControlsEl.replaceChildren();
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

    const info = pagerInfoEl;
    info.textContent = current.enableRowSelection
      ? loc.t("dataTable.selectedOf", { selected: selectedCount, total: totalCount })
      : loc.t("dataTable.pageOf", { page: pageIndex + 1, pages: Math.max(pageCount, 1) });

    const right = pagerControlsEl;

    if (!manual) {
      const group = h("div", "zen-flex zen-items-center zen-gap-2");
      const lbl = h("span", "zen-text-zen-muted-fg");
      lbl.textContent = loc.t("dataTable.rowsPerPage");
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
    navBtn("«", loc.t("dataTable.firstPage"), !canPrev, () => setPage(0));
    navBtn("‹", loc.t("dataTable.previousPage"), !canPrev, () => setPage(pageIndex - 1));
    navBtn("›", loc.t("dataTable.nextPage"), !canNext, () => setPage(pageIndex + 1));
    navBtn("»", loc.t("dataTable.lastPage"), !canNext, () => setPage(pageCount - 1));
    right.append(nav);
  }

  /* ----- the single render pass ----- */
  let lastDisplay: DisplayRow[] = [];
  /* The table's own scroller, as last painted. A repaint builds a new one, which
   * would start at the top: a row selected far down a scrolling table would
   * jump the list back to its first row under the user. */
  let tableWrapper: HTMLElement | null = null;
  function sync(): void {
    invalidateColumns();
    const filterFocus = captureFilterFocus();
    const focusMark = captureFocus();
    const scrolled = tableWrapper?.isConnected
      ? { top: tableWrapper.scrollTop, left: tableWrapper.scrollLeft }
      : null;
    clearMounted();
    clearBody();
    const processed = processRows();
    // Grouping pages over group rows and rows alike (TanStack's
    // paginateExpandedRows); the rows on the page stay the table's display.
    const items = groupingActive() ? groupItems(processed) : null;
    pagingLength = items ? items.length : null;
    if (items && current.enablePagination && !current.manualPagination) {
      const size = effPageSize();
      const start = Math.min(effPageIndex(), Math.max(0, Math.ceil(items.length / size) - 1)) * size;
      pageItems = items.slice(start, start + size);
    } else pageItems = items;
    const display = pageItems
      ? pageItems.flatMap((it) => (it.kind === "row" ? [it.r] : []))
      : computeDisplay(processed);
    lastDisplay = display;
    rowElById = new Map();
    subElById = new Map();
    displayById = new Map();
    displayIndexById = new Map();
    display.forEach((r, i) => {
      const id = rowIdOf(r.row, r.index);
      displayById.set(id, r);
      displayIndexById.set(id, i);
    });
    // The row being edited has gone (filtered out, deleted): so has its edit.
    if (editing && (!displayById.has(editing.rowId) || isVirt())) {
      const ed = editor;
      editor = null;
      editing = null;
      ed?.comp.destroy();
    }
    // The editor is moved into the rebuilt cell: its blur then is not the user's.
    const wasMoving = moving;
    moving = true;

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
      ensureContextMenu();
      if (cm && menuActive()) {
        // The rows live inside the ContextMenu's area (display: contents).
        cm.el.replaceChildren(buildTable(processed, display));
        if (cm.el.parentElement !== containerEl) containerEl.replaceChildren(cm.el);
      } else {
        containerEl.replaceChildren(buildTable(processed, display));
      }
    } else {
      paintVirtHeader(processed);
      virt!.update({
        items: display,
        estimateSize: rowHeight(),
        maxHeight: bodyHeight(),
      } as Partial<{ items: DisplayRow[] }>);
    }

    if (mode === "table" && scrolled && tableWrapper && (scrolled.top || scrolled.left)) {
      tableWrapper.scrollTop = scrolled.top;
      tableWrapper.scrollLeft = scrolled.left;
    }
    if (mode === "table") {
      vw?.paint();
      paintNav();
    }
    moving = wasMoving;

    if (current.loading) containerEl.setAttribute("aria-busy", "true");
    else containerEl.removeAttribute("aria-busy");

    paintPagination(processed);
    paintMenus();
    paintChips();
    paintBulk(processed);
    // An empty slot is still a flex item, and would add the cluster's gap.
    // style.display, not `hidden`: its zen-flex class beats the [hidden] rule.
    pagerMenusEl.style.display = pagerMenusEl.childElementCount ? "" : "none";
    restoreFilterFocus(filterFocus);
    restoreFocus(focusMark);
  }

  sync();

  return {
    el,
    update(next: Partial<DataTableProps<TData>>) {
      current = { ...current, ...next };
      if (next.class !== undefined || next.fillHeight !== undefined) el.className = rootClass();
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
