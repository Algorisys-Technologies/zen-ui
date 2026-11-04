import * as React from "react";
import type { Cell, Column, Row, Table as TanStackTable } from "@tanstack/react-table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  defaultRangeExtractor,
  measureElement as measureRowElement,
  useVirtualizer,
  type Range,
} from "@tanstack/react-virtual";
import { cellKeyTarget, ownsArrowKeys, rowKeyTarget, type GridCell } from "@algorisys/zen-ui-core/row-keys";
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

import { cn } from "../../lib/cn";
import { Table, TableBody, TableCell, TableRow } from "./table";
import { EditableCell, type CellEditPayload, type EditingState } from "./edit-cell";
import { useLocale } from "../locale/locale";

/**
 * The body of the (unvirtualized-by-grid) DataTable: the <table>, its rows
 * and its footer. DataTable builds the header and the footer and hands them
 * in; this owns what happens in the rows: keyboard rows, cell navigation, and
 * the panel an expanded row opens. Mirrors the Solid binding's BodyTable.
 */
export interface BodyTableProps<TData> {
  table: TanStackTable<TData>;
  /** The <thead>, already wrapped in its column-ordering context when there is one. */
  header: React.ReactNode;
  /** The <tfoot>, or null. */
  footer: React.ReactNode;
  loading: boolean;
  emptyMessage: string;
  /** colSpan of the loading / empty row. */
  colSpan: number;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  sepCellClass: string;
  pinStyle: (col: Column<TData, unknown>) => React.CSSProperties | undefined;
  editingCell: EditingState | null;
  startEdit: (rowId: string, columnId: string, seed?: string) => void;
  commitEdit: (rowId: string, columnId: string, value: unknown) => void;
  cancelEdit: () => void;
  rowClassName?: (row: Row<TData>) => string | undefined;
  renderCell: (cell: Cell<TData, unknown>) => React.ReactNode;
  expansionEnabled: boolean;
  renderSubRow?: (row: Row<TData>) => React.ReactNode;
  /** Rows are dnd-kit sortable (enableRowOrdering, unvirtualized). */
  rowOrderingActive?: boolean;
  /** enableKeyboardNavigation: rows take focus, one tab stop for the table. */
  keyboard?: boolean;
  selectable?: boolean;
  onRowActivate?: (row: Row<TData>, event: React.KeyboardEvent<HTMLTableRowElement>) => void;
  rowLabel?: (row: Row<TData>) => string;
  /** Move cell by cell (enableCellNavigation): see the cell navigation section. */
  cellNav?: boolean;
  editCells?: (edits: CellEditPayload[]) => void;
  /** Render only the rows in view (enableRowVirtualization). Fixed for the table's life. */
  virtualize?: boolean;
  /** Unset: learned from the first row measured. */
  estimatedRowHeight?: number;
  /** Header rows above the body, for aria-rowcount / aria-rowindex. */
  headerRowCount?: number;
  /** Drag rows by their handle, virtualized: see startDrag. */
  rowDrag?: boolean;
  onRowMove?: (from: number, to: number) => void;
  /** A context menu is attached: rows and cells say which they are, and a right-click focuses them. */
  menuTargets?: boolean;
}

/** One rendered body row when virtualized: a data row, or the panel an expanded row opens. */
interface BodyItem<TData> {
  kind: "row" | "sub";
  row: Row<TData>;
}
type VirtRow = { index: number; measure: (el: Element | null) => void };

/** Provided by a virtualized body that drags its rows itself (see BodyTable's startDrag). */
export const RowDragContext = React.createContext<{
  active: boolean;
  start: (rowId: string, e: React.PointerEvent) => void;
} | null>(null);

type EditMeta = {
  editable?: boolean | ((row: unknown) => boolean);
  editVariant?: "text" | "number" | "select";
  editOptions?: { label: string; value: string }[];
};

const cellKey = (rowId: string, colId: string) => `${rowId}\u0000${colId}`;
const ORIGIN: GridCell = { row: 0, col: 0 };

export function BodyTable<TData>(props: BodyTableProps<TData>) {
  const loc = useLocale();
  const {
    table,
    loading,
    emptyMessage,
    colSpan,
    sepCellClass,
    pinStyle,
    editingCell,
    startEdit,
    commitEdit,
    cancelEdit,
    rowClassName,
    renderCell,
    expansionEnabled,
    renderSubRow,
    rowOrderingActive,
    keyboard,
    selectable,
    onRowActivate,
    rowLabel,
    cellNav,
    virtualize,
    rowDrag,
    menuTargets,
  } = props;
  const rows = table.getRowModel().rows;
  const tableRef = React.useRef<HTMLTableElement>(null);
  // The <table> as state too, for VirtualRows: a child's layout effects run
  // before its ancestors' refs are attached, so on the first commit the
  // virtualizer would find no scroller, and nothing would ask it again.
  const [tableEl, setTableEl] = React.useState<HTMLTableElement | null>(null);
  const setTableRef = React.useCallback((el: HTMLTableElement | null) => {
    tableRef.current = el;
    setTableEl(el);
  }, []);
  const rowIndex = React.useMemo(() => new Map(rows.map((r, i) => [r.id, i])), [rows]);
  const colCount = table.getAllLeafColumns().length;

  // Virtualized, the body is a flat list of items, an expanded row's panel
  // being an item of its own so it is measured on its own.
  const items = React.useMemo<BodyItem<TData>[]>(() => {
    if (!virtualize) return [];
    const out: BodyItem<TData>[] = [];
    for (const row of rows) {
      out.push({ kind: "row", row });
      if (expansionEnabled && renderSubRow && row.getIsExpanded() && !row.getIsGrouped()) out.push({ kind: "sub", row });
    }
    return out;
  }, [virtualize, rows, expansionEnabled, renderSubRow]);
  // Where a row sits among the items (the virtualizer's index), by id.
  const itemIndex = React.useMemo(() => {
    const m = new Map<string, number>();
    items.forEach((it, i) => it.kind === "row" && m.set(it.row.id, i));
    return m;
  }, [items]);
  const virtual = React.useRef<VirtualRowsApi | null>(null);

  // Keyboard rows: a roving tabindex, so the table is one tab stop and the
  // arrows move within it. The index is clamped when the rows change under it
  // (a new page, a filter), so there is always exactly one tab stop.
  const [focusIndex, setFocusIndex] = React.useState(0);
  const tabStop = Math.min(focusIndex, Math.max(rows.length - 1, 0));
  const rowRefs = React.useRef(new Map<string, HTMLTableRowElement>());
  // Virtualized, the row the keys move to may not be mounted yet: it is
  // scrolled into view, and focused by its ref when it arrives.
  const pendingFocus = React.useRef<string | null>(null);
  // Once the rows it passed are measured, the focused row may sit a little
  // off from where the jump put it: nudge the scroller (only the scroller;
  // scrollIntoView would scroll the page too) so the row is whole, below the
  // sticky header.
  const keepInView = (id: string) => {
    const tableEl = tableRef.current;
    const el = rowRefs.current.get(id);
    const scroller = tableEl?.parentElement;
    if (!el || !scroller || document.activeElement !== el) return;
    const top = tableEl?.tHead?.getBoundingClientRect().bottom ?? scroller.getBoundingClientRect().top;
    const bottom = scroller.getBoundingClientRect().top + scroller.clientHeight;
    const r = el.getBoundingClientRect();
    if (r.top < top) scroller.scrollTop -= top - r.top;
    else if (r.bottom > bottom) scroller.scrollTop += r.bottom - bottom;
  };
  const itemIndexRef = React.useRef(itemIndex);
  itemIndexRef.current = itemIndex;
  const focusRow = (id: string) => {
    const api = virtual.current;
    if (!api) {
      rowRefs.current.get(id)?.focus();
      return;
    }
    const at = itemIndexRef.current.get(id);
    if (at !== undefined) api.scrollToItem(at);
    const el = rowRefs.current.get(id);
    if (el) el.focus({ preventScroll: true });
    else pendingFocus.current = id;
    requestAnimationFrame(() => requestAnimationFrame(() => keepInView(id)));
  };

  const onRowKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>, row: Row<TData>, index: number) => {
    if (e.altKey || ownsArrowKeys(e.target)) return;
    const onRow = e.target === e.currentTarget;
    const to = rowKeyTarget(e.key, index, rows.length);
    if (to !== null) {
      e.preventDefault();
      const next = rows[to];
      if (!next) return;
      setFocusIndex(to);
      focusRow(next.id);
      return;
    }
    // The rest act on the row itself: on a link or a button inside it, Enter
    // and Space are that control's.
    if (!onRow) return;
    if (e.key === "Enter" && onRowActivate) {
      e.preventDefault();
      onRowActivate(row, e);
    } else if (e.key === " " && selectable && row.getCanSelect()) {
      e.preventDefault();
      row.toggleSelected();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a" && selectable) {
      e.preventDefault();
      table.toggleAllPageRowsSelected(!table.getIsAllPageRowsSelected());
    }
  };

  /* ---------------------------- cell navigation ---------------------------
   * enableCellNavigation. The grid's cells are the data columns in view (not
   * the select, expand or drag columns) by the data rows (not the expanded
   * panels). One cell is active, the table's single tab stop; a selection is
   * a rectangle from an anchor to a focus, the arithmetic in core's
   * grid-range. Keys, pointer, copy and paste are read by listeners on the
   * table itself, one of each, not one per cell. They are attached once and
   * read the latest render through `grid` (a ref), and the active cell and
   * selection are mirrored into refs as they are set, so a handler never
   * reads a value one render old. */
  const visibleLeaf = table.getVisibleLeafColumns();
  const navCols = React.useMemo(
    () => (cellNav ? visibleLeaf.filter((c) => !c.id.startsWith("__")) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the visible columns, by identity of their ids
    [cellNav, visibleLeaf.map((c) => c.id).join("\u0000")],
  );
  const navColIndex = React.useMemo(() => new Map(navCols.map((c, i) => [c.id, i])), [navCols]);
  const [activeCell, setActiveCellState] = React.useState<GridCell>(ORIGIN);
  const [selection, setSelectionState] = React.useState<CellRange>({ anchor: ORIGIN, focus: ORIGIN });
  const activeRef = React.useRef(activeCell);
  const selectionRef = React.useRef(selection);
  const setActiveCell = (at: GridCell) => {
    activeRef.current = at;
    setActiveCellState(at);
  };
  const setSelection = (r: CellRange) => {
    selectionRef.current = r;
    setSelectionState(r);
  };
  // Rows and columns come and go (a filter, a page, a hidden column): the
  // active cell and the selection are always kept inside the grid.
  const clampActive = (at: GridCell, nRows: number, nCols: number): GridCell =>
    clampRange({ anchor: at, focus: at }, nRows, nCols)?.anchor ?? ORIGIN;
  const clampRect = (r: CellRange, nRows: number, nCols: number): CellRect | null => {
    const c = clampRange(r, nRows, nCols);
    return c ? rangeRect(c) : null;
  };
  const active = clampActive(activeCell, rows.length, navCols.length);
  const selRect = clampRect(selection, rows.length, navCols.length);
  const multiSelected = !!selRect && (selRect.top !== selRect.bottom || selRect.left !== selRect.right);

  const cellRefs = React.useRef(new Map<string, HTMLTableCellElement>());
  const pendingCellFocus = React.useRef<string | null>(null);

  // Keep a focused cell whole in view: below the sticky header, and clear of
  // pinned columns. Only the table's own scroller moves; a table that does not
  // scroll leaves it to the page.
  const keepCellInView = (key: string) => {
    const tableEl = tableRef.current;
    const el = cellRefs.current.get(key);
    const scroller = tableEl?.parentElement;
    if (!el || !scroller || document.activeElement !== el) return;
    const box = scroller.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (scroller.scrollHeight > scroller.clientHeight) {
      const top = tableEl?.tHead?.getBoundingClientRect().bottom ?? box.top;
      const bottom = box.top + scroller.clientHeight;
      if (r.top < top) scroller.scrollTop -= top - r.top;
      else if (r.bottom > bottom) scroller.scrollTop += r.bottom - bottom;
    } else if (r.top < 0 || r.bottom > window.innerHeight) {
      el.scrollIntoView({ block: "nearest" });
    }
    if (scroller.scrollWidth > scroller.clientWidth && getComputedStyle(el).position !== "sticky") {
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
  };

  // Everything the table's own listeners need, from the latest render.
  const grid = React.useRef({ rows, navCols, navColIndex, rowIndex, editingCell, props });
  grid.current = { rows, navCols, navColIndex, rowIndex, editingCell, props };

  const isEditable = (row: Row<TData>, col: Column<TData, unknown>) => {
    if (row.getIsGrouped()) return false;
    const m = col.columnDef.meta as EditMeta | undefined;
    return typeof m?.editable === "function" ? m.editable(row.original) : !!m?.editable;
  };

  // The handlers below run from native listeners; they live in a ref so the
  // listeners are attached once and still call this render's code.
  const nav = React.useRef<{
    keydown: (e: KeyboardEvent) => void;
    dblclick: (e: MouseEvent) => void;
    pointerdown: (e: PointerEvent) => void;
    copy: (e: ClipboardEvent) => void;
    paste: (e: ClipboardEvent) => void;
    focusCell: (at: GridCell) => void;
    contextmenu: (e: MouseEvent) => void;
    stop?: () => void;
  } | null>(null);
  {
    const g = () => grid.current;
    const nRows = () => g().rows.length;
    const nCols = () => g().navCols.length;
    const activeNow = () => clampActive(activeRef.current, nRows(), nCols());
    const selRectNow = () => clampRect(selectionRef.current, nRows(), nCols());
    const cellAt = (target: EventTarget | null): { td: HTMLTableCellElement; at: GridCell } | null => {
      const td = (target as Element | null)?.closest?.("td[data-col]") as HTMLTableCellElement | null;
      if (!td || !tableRef.current?.contains(td)) return null;
      const row = g().rowIndex.get(td.dataset.row ?? "") ?? -1;
      const col = g().navColIndex.get(td.dataset.col ?? "");
      return row < 0 || col === undefined ? null : { td, at: { row, col } };
    };
    const focusCell = (at: GridCell) => {
      const row = g().rows[at.row];
      const col = g().navCols[at.col];
      if (!row || !col) return;
      const key = cellKey(row.id, col.id);
      const api = virtual.current;
      if (api) {
        const at = itemIndexRef.current.get(row.id);
        if (at !== undefined) api.scrollToItem(at);
      }
      const el = cellRefs.current.get(key);
      if (el) el.focus({ preventScroll: true });
      else pendingCellFocus.current = key;
      keepCellInView(key);
      requestAnimationFrame(() => requestAnimationFrame(() => keepCellInView(key)));
    };
    const moveTo = (at: GridCell) => {
      setActiveCell(at);
      setSelection({ anchor: at, focus: at });
      focusCell(at);
    };
    // Shift extends the selection from the active cell, which stays where it
    // is; the far corner is scrolled to, so a range can reach rows not yet in
    // view.
    const extendTo = (to: GridCell) => {
      setSelection({ anchor: activeNow(), focus: to });
      const row = g().rows[to.row];
      const api = virtual.current;
      if (api && row) {
        const at = itemIndexRef.current.get(row.id);
        if (at !== undefined) api.scrollToItem(at);
      }
    };
    // The text a cell copies: its value, as a spreadsheet would take it.
    const cellText = (row: Row<TData>, col: Column<TData, unknown>) => {
      const v = row.getValue(col.id);
      if (v === null || v === undefined) return "";
      if (v instanceof Date) return v.toISOString();
      if (typeof v === "object") return JSON.stringify(v);
      return String(v);
    };
    // A pasted or cleared value, as the column's editor would have produced
    // it; null when the column cannot take it (not editable, not a number,
    // not one of a select's options), and that cell is left alone.
    const valueFor = (row: Row<TData>, col: Column<TData, unknown>, text: string): { value: unknown } | null => {
      if (!isEditable(row, col)) return null;
      const m = col.columnDef.meta as EditMeta | undefined;
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
    };
    const editRect = (rect: CellRect, textAt: (row: number, col: number) => string) => {
      const edits: CellEditPayload[] = [];
      for (let r = rect.top; r <= rect.bottom; r++) {
        const row = g().rows[r];
        if (!row) continue;
        for (let c = rect.left; c <= rect.right; c++) {
          const col = g().navCols[c];
          if (!col) continue;
          const v = valueFor(row, col, textAt(r, c));
          if (v) edits.push({ rowId: row.id, columnId: col.id, value: v.value });
        }
      }
      return edits;
    };
    // After an editor's own Enter, Esc or blur has closed it, focus returns to
    // the grid. The editor handles those keys after this table sees them (its
    // handlers run from React's root, after this capture listener), so the
    // return waits a task.
    const afterEdit = (to: GridCell) => setTimeout(() => moveTo(to));

    const keydown = (e: KeyboardEvent) => {
      const hit = cellAt(e.target);
      if (!hit) return;
      const { td, at } = hit;
      if (e.target !== td) {
        // Inside the cell: an editor, or a control the cell renders.
        if (!g().editingCell) return;
        if (e.key === "Escape") afterEdit(at);
        else if (e.key === "Enter" && !e.shiftKey) afterEdit({ row: Math.min(at.row + 1, nRows() - 1), col: at.col });
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
      const to = cellKeyTarget(key, e.shiftKey ? selectionRef.current.focus : at, nRows(), nCols(), ctrl);
      if (to) {
        e.preventDefault();
        if (e.shiftKey) extendTo(to);
        else moveTo(to);
        return;
      }
      const row = g().rows[at.row];
      const col = g().navCols[at.col];
      if (!row || !col) return;
      const rect = selRectNow();
      const multi = !!rect && (rect.top !== rect.bottom || rect.left !== rect.right);
      if (ctrl && key.toLowerCase() === "a") {
        e.preventDefault();
        setSelection({ anchor: ORIGIN, focus: { row: nRows() - 1, col: nCols() - 1 } });
      } else if (key === "Escape" && multi) {
        e.preventDefault();
        setSelection({ anchor: at, focus: at });
      } else if ((key === "Enter" || key === "F2") && isEditable(row, col)) {
        e.preventDefault();
        g().props.startEdit(row.id, col.id);
      } else if ((key === "Delete" || key === "Backspace") && rect) {
        e.preventDefault();
        g().props.editCells?.(editRect(rect, () => ""));
      } else if (key.length === 1 && !ctrl && isEditable(row, col)) {
        e.preventDefault();
        g().props.startEdit(row.id, col.id, key);
      }
    };

    const dblclick = (e: MouseEvent) => {
      const hit = cellAt(e.target);
      if (!hit || g().editingCell) return;
      const row = g().rows[hit.at.row];
      const col = g().navCols[hit.at.col];
      if (row && col && isEditable(row, col)) g().props.startEdit(row.id, col.id);
    };

    // Pointer: a press makes a cell active, Shift+press extends to it, a drag
    // selects what it crosses. Text selection is held off during the drag.
    const pointerdown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const hit = cellAt(e.target);
      if (!hit) return;
      if (g().editingCell && hit.td.contains(document.activeElement) && document.activeElement !== hit.td) return;
      if (e.shiftKey) {
        e.preventDefault();
        extendTo(hit.at);
        return;
      }
      setActiveCell(hit.at);
      setSelection({ anchor: hit.at, focus: hit.at });
      nav.current?.stop?.();
      const tableEl = tableRef.current;
      if (!tableEl) return;
      const userSelect = tableEl.style.userSelect;
      const onOver = (ev: PointerEvent) => {
        const over = cellAt(ev.target);
        if (!over) return;
        tableEl.style.userSelect = "none";
        setSelection({ anchor: activeNow(), focus: over.at });
      };
      const stop = () => {
        tableEl.removeEventListener("pointerover", onOver);
        window.removeEventListener("pointerup", stop);
        window.removeEventListener("pointercancel", stop);
        tableEl.style.userSelect = userSelect;
        if (nav.current) nav.current.stop = undefined;
      };
      tableEl.addEventListener("pointerover", onOver);
      window.addEventListener("pointerup", stop);
      window.addEventListener("pointercancel", stop);
      if (nav.current) nav.current.stop = stop;
    };

    // Copy and paste reach the focused cell (the active one) as events: the
    // clipboard is read and written through them, so no permission is asked.
    const copy = (e: ClipboardEvent) => {
      if (g().editingCell || !cellAt(document.activeElement)) return;
      const rect = selRectNow();
      if (!rect || !e.clipboardData) return;
      const lines: string[][] = [];
      for (let r = rect.top; r <= rect.bottom; r++) {
        const row = g().rows[r];
        if (!row) continue;
        const line: string[] = [];
        for (let c = rect.left; c <= rect.right; c++) {
          const col = g().navCols[c];
          line.push(col ? cellText(row, col) : "");
        }
        lines.push(line);
      }
      e.clipboardData.setData("text/plain", toTsv(lines));
      e.preventDefault();
    };
    const paste = (e: ClipboardEvent) => {
      if (g().editingCell || !cellAt(document.activeElement)) return;
      const text = e.clipboardData?.getData("text/plain");
      const rect = selRectNow();
      if (!text || !rect) return;
      e.preventDefault();
      const plan = pastePlan(parseTsv(text), rect, nRows(), nCols());
      if (plan.length === 0) return;
      const byCell = new Map(plan.map((t) => [`${t.row}:${t.col}`, t.value]));
      const bottom = Math.max(...plan.map((t) => t.row));
      const right = Math.max(...plan.map((t) => t.col));
      g().props.editCells?.(editRect({ top: rect.top, left: rect.left, bottom, right }, (r, c) => byCell.get(`${r}:${c}`) ?? ""));
      // What was pasted is selected, as a spreadsheet shows it.
      setSelection({ anchor: { row: rect.top, col: rect.left }, focus: { row: bottom, col: right } });
    };
    // A right-click makes its row or cell the focused one, as on a desktop, so
    // the menu is for it and focus returns there. Inside a cell selection it
    // leaves the selection alone: the menu acts on it.
    const contextmenu = (e: MouseEvent) => {
      const tr = (e.target as Element | null)?.closest?.("tr[data-row-id]") as HTMLElement | null;
      if (!tr || !tableRef.current?.contains(tr)) return;
      const id = tr.dataset.rowId ?? "";
      const index = g().rowIndex.get(id) ?? -1;
      if (index < 0) return;
      if (g().props.cellNav) {
        const hit = cellAt(e.target);
        const rect = selRectNow();
        if (hit && !(rect && inRect(rect, hit.at.row, hit.at.col))) moveTo(hit.at);
      } else if (g().props.keyboard) {
        setFocusIndex(index);
        focusRow(id);
      }
    };
    nav.current = { keydown, dblclick, pointerdown, copy, paste, focusCell, contextmenu, stop: nav.current?.stop };
  }

  React.useEffect(() => {
    const el = tableRef.current;
    if (!cellNav || !el) return;
    const keydown = (e: KeyboardEvent) => nav.current?.keydown(e);
    const dblclick = (e: MouseEvent) => nav.current?.dblclick(e);
    const pointerdown = (e: PointerEvent) => nav.current?.pointerdown(e);
    const copy = (e: ClipboardEvent) => nav.current?.copy(e);
    const paste = (e: ClipboardEvent) => nav.current?.paste(e);
    // Capture: the grid reads a key before the editor inside the cell does.
    el.addEventListener("keydown", keydown, true);
    el.addEventListener("dblclick", dblclick);
    el.addEventListener("pointerdown", pointerdown);
    el.addEventListener("copy", copy);
    el.addEventListener("paste", paste);
    return () => {
      el.removeEventListener("keydown", keydown, true);
      el.removeEventListener("dblclick", dblclick);
      el.removeEventListener("pointerdown", pointerdown);
      el.removeEventListener("copy", copy);
      el.removeEventListener("paste", paste);
      nav.current?.stop?.();
    };
  }, [cellNav]);

  React.useEffect(() => {
    const el = tableEl;
    if (!menuTargets || !el) return;
    const contextmenu = (e: MouseEvent) => nav.current?.contextmenu(e);
    el.addEventListener("contextmenu", contextmenu);
    return () => el.removeEventListener("contextmenu", contextmenu);
  }, [menuTargets, tableEl]);

  // When the focused row or cell goes away (filtered out, a page change, an
  // inline editor inside it closing), focus falls to the page. If the table
  // held focus, it goes back to the active cell or the tab-stop row once the
  // rows have settled.
  //
  // "Held focus" is kept from the table's own focus events, not read from
  // document.activeElement, which is the page during a blur. A blur towards
  // nothing that leaves its element in place is a click elsewhere: the table
  // gives focus up. One whose element has gone is a rebuild: it does not.
  const tableHasFocus = React.useRef(false);
  const restoreFocus = React.useRef<() => void>(() => {});
  restoreFocus.current = () => {
    if (cellNav) nav.current?.focusCell(active);
    else {
      const stop = rows[tabStop];
      if (stop) focusRow(stop.id);
    }
  };
  React.useEffect(() => {
    const el = tableRef.current;
    if (!(keyboard || cellNav) || !el) return;
    const onIn = () => (tableHasFocus.current = true);
    const onOut = (e: FocusEvent) => {
      const to = e.relatedTarget as Node | null;
      if (to) {
        if (!el.contains(to)) tableHasFocus.current = false;
        return;
      }
      const from = e.target as Element;
      setTimeout(() => {
        const now = document.activeElement;
        if (from.isConnected && (!now || now === document.body)) tableHasFocus.current = false;
      });
    };
    el.addEventListener("focusin", onIn);
    el.addEventListener("focusout", onOut);
    return () => {
      el.removeEventListener("focusin", onIn);
      el.removeEventListener("focusout", onOut);
    };
  }, [keyboard, cellNav]);
  React.useEffect(() => {
    if (!tableHasFocus.current) return;
    const t = setTimeout(() => {
      const now = document.activeElement;
      if (!tableHasFocus.current || (now && now !== document.body)) return;
      restoreFocus.current();
    });
    return () => clearTimeout(t);
  }, [rows]);

  // Dragging rows, virtualized. dnd-kit can drop only onto a mounted row and
  // most are not, so the drop position comes from the virtualizer's layout,
  // the table scrolls itself while the pointer is near its top or bottom edge,
  // and the dragged row stays mounted. Esc cancels. Everything a drag adds to
  // the window is removed when it ends, or when the table goes.
  const [dragId, setDragIdState] = React.useState<string | null>(null);
  /** Where the dragged row would land: before the row at this index (rows.length: after the last). */
  const [dropIndex, setDropIndexState] = React.useState<number | null>(null);
  const dropIndexRef = React.useRef<number | null>(null);
  const stopDrag = React.useRef<(() => void) | undefined>(undefined);
  React.useEffect(() => () => stopDrag.current?.(), []);
  const startDrag = (rowId: string, e: React.PointerEvent) => {
    const tableEl = tableRef.current;
    const scroller = tableEl?.parentElement;
    const api = virtual.current;
    if (e.button !== 0 || !api || !scroller) return;
    e.preventDefault(); // no text selection, no compatibility mouse events
    stopDrag.current?.();
    const setDropIndex = (i: number | null) => {
      dropIndexRef.current = i;
      setDropIndexState(i);
    };
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
      const from = grid.current.rowIndex.get(rowId);
      const to = dropIndexRef.current;
      stop();
      if (!commit || from === undefined || to === null) return;
      const target = to > from ? to - 1 : to;
      if (target !== from) grid.current.props.onRowMove?.(from, target);
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
      setDragIdState(null);
      setDropIndex(null);
      stopDrag.current = undefined;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey, true);
    stopDrag.current = stop;
    setDragIdState(rowId);
    locate();
    frame = requestAnimationFrame(tick);
  };
  const dropEdge = (index: number): "before" | "after" | undefined => {
    if (dropIndex === null) return undefined;
    if (dropIndex === index) return "before";
    return dropIndex === rows.length && index === rows.length - 1 ? "after" : undefined;
  };
  const dropShadow = (index: number): React.CSSProperties | undefined => {
    const edge = dropEdge(index);
    return edge ? { boxShadow: `inset 0 ${edge === "before" ? 2 : -2}px 0 0 var(--zen-color-primary)` } : undefined;
  };
  const startDragRef = React.useRef(startDrag);
  startDragRef.current = startDrag;
  const rowDragValue = React.useMemo(
    () => ({ active: !!rowDrag, start: (id: string, e: React.PointerEvent) => startDragRef.current(id, e) }),
    [rowDrag],
  );

  // Virtualized, some rows stay mounted wherever the scroll is: the keyboard's
  // tab stop, so the table never loses its one tab stop or the focus it holds;
  // the row being edited, so a half-typed value is not thrown away; and the
  // row being dragged. (VirtualRows de-duplicates: a row focused AND edited is
  // mounted once.)
  const keep: number[] = [];
  if (virtualize) {
    const stop = rows[cellNav ? active.row : tabStop];
    if ((keyboard || cellNav) && stop) keep.push(itemIndex.get(stop.id) ?? -1);
    if (editingCell) keep.push(itemIndex.get(editingCell.rowId) ?? -1);
    if (dragId !== null) keep.push(itemIndex.get(dragId) ?? -1);
  }
  const keepKey = keep.filter((i) => i >= 0).join(",");

  const cellRef = (key: string) => (el: HTMLTableCellElement | null) => {
    if (!el) {
      cellRefs.current.delete(key);
      return;
    }
    cellRefs.current.set(key, el);
    if (pendingCellFocus.current === key) {
      pendingCellFocus.current = null;
      queueMicrotask(() => {
        el.focus({ preventScroll: true });
        keepCellInView(key);
      });
    }
  };

  const cells = (row: Row<TData>, index: number) =>
    row.getVisibleCells().map((cell) => {
      const pin = pinStyle(cell.column);
      const isEditing = editingCell?.rowId === row.id && editingCell?.columnId === cell.column.id;
      /* Disable inline-edit for group-header and aggregated cells — the
       * rendered value isn't a single row's field. */
      const isInteractive = !cell.getIsGrouped() && !cell.getIsAggregated() && !cell.getIsPlaceholder();
      const content = renderCell(cell);
      // Cell navigation: this cell's place in the grid (none for the select,
      // expand and drag columns), whether it is the active cell (the tab
      // stop) and whether the selection covers it.
      const navCol = cellNav ? navColIndex.get(cell.column.id) : undefined;
      const isActiveCell = navCol !== undefined && index === active.row && navCol === active.col;
      const isSelected = navCol !== undefined && !!selRect && multiSelected && inRect(selRect, index, navCol);
      // The drop line is drawn on the cells: a row's own box-shadow is not
      // painted in a collapsed-border table. A pinned cell paints its own
      // background, so its selection has to be painted there too.
      let style = rowDrag ? { ...pin, ...dropShadow(index) } : pin;
      if (pin && isSelected) style = { ...style, background: "var(--zen-color-primary-soft)" };
      return (
        <TableCell
          key={cell.id}
          ref={navCol !== undefined ? cellRef(cellKey(row.id, cell.column.id)) : undefined}
          className={
            navCol === undefined
              ? sepCellClass
              : cn(
                  sepCellClass,
                  "focus:zen-outline focus:zen-outline-2 focus:-zen-outline-offset-2 focus:zen-outline-zen-ring",
                  isSelected && "zen-bg-zen-primary-soft",
                )
          }
          style={style}
          role={cellNav ? "gridcell" : undefined}
          tabIndex={navCol === undefined ? undefined : isActiveCell ? 0 : -1}
          aria-selected={navCol !== undefined ? (isSelected || isActiveCell ? "true" : "false") : undefined}
          data-row={navCol !== undefined ? row.id : undefined}
          data-col={navCol !== undefined ? cell.column.id : undefined}
          data-column={menuTargets ? cell.column.id : undefined}
        >
          {isInteractive ? (
            <EditableCell
              cell={cell}
              editing={isEditing}
              onStartEdit={() => startEdit(row.id, cell.column.id)}
              onCommit={(v) => commitEdit(row.id, cell.column.id, v)}
              onCancel={cancelEdit}
              navigable={navCol !== undefined}
              seed={isEditing ? editingCell?.seed : undefined}
            >
              {content}
            </EditableCell>
          ) : (
            content
          )}
        </TableCell>
      );
    });

  const dataRow = (row: Row<TData>, index: number, virt?: VirtRow) => (
    <TableRow
      key={virt ? `row:${row.id}` : undefined}
      ref={
        keyboard || virt
          ? (el: HTMLTableRowElement | null) => {
              virt?.measure(el);
              if (!keyboard) return;
              if (!el) {
                rowRefs.current.delete(row.id);
                return;
              }
              rowRefs.current.set(row.id, el);
              if (pendingFocus.current === row.id) {
                pendingFocus.current = null;
                queueMicrotask(() => el.focus({ preventScroll: true }));
              }
            }
          : undefined
      }
      data-index={virt?.index}
      aria-rowindex={virt ? (props.headerRowCount ?? 1) + virt.index + 1 : undefined}
      data-dragging={rowDrag && dragId === row.id ? "true" : undefined}
      data-row-id={menuTargets ? row.id : undefined}
      data-drop={rowDrag ? dropEdge(index) : undefined}
      tabIndex={keyboard ? (index === tabStop ? 0 : -1) : undefined}
      aria-label={keyboard ? rowLabel?.(row) : undefined}
      aria-selected={keyboard && selectable ? (row.getIsSelected() ? "true" : "false") : undefined}
      onKeyDown={keyboard ? (e) => onRowKeyDown(e, row, index) : undefined}
      onFocus={keyboard ? () => setFocusIndex(index) : undefined}
      data-state={row.getIsSelected() ? "selected" : undefined}
      data-grouped={row.getIsGrouped() ? "true" : undefined}
      className={cn(
        row.getIsGrouped() && "zen-bg-zen-muted/40 zen-font-medium",
        rowDrag && dragId === row.id && "zen-opacity-50",
        keyboard &&
          "focus-visible:zen-outline focus-visible:zen-outline-2 focus-visible:-zen-outline-offset-2 focus-visible:zen-outline-zen-ring",
        rowClassName?.(row),
      )}
    >
      {cells(row, index)}
    </TableRow>
  );

  const subRowPanel = (row: Row<TData>, virt?: VirtRow) => (
    <TableRow
      key={virt ? `sub:${row.id}` : undefined}
      ref={virt?.measure}
      data-expanded-of={row.id}
      data-index={virt?.index}
      aria-rowindex={virt ? (props.headerRowCount ?? 1) + virt.index + 1 : undefined}
    >
      <TableCell colSpan={row.getVisibleCells().length} className="zen-p-0 zen-bg-zen-muted/30">
        {renderSubRow!(row)}
      </TableCell>
    </TableRow>
  );

  const body = (
    <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={colSpan} className="zen-text-center zen-text-zen-muted-fg zen-py-6">
              {loc.t("dataTable.loading")}
            </TableCell>
          </TableRow>
        ) : rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={colSpan} className="zen-text-center zen-text-zen-muted-fg zen-py-6">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : virtualize ? (
          <VirtualRows
            items={items}
            tableEl={tableEl}
            estimatedRowHeight={props.estimatedRowHeight}
            colCount={colCount}
            keepKey={keepKey}
            onReady={(api) => (virtual.current = api)}
          >
            {(item, virt) =>
              item.kind === "row"
                ? dataRow(item.row, rowIndex.get(item.row.id) ?? 0, virt)
                : subRowPanel(item.row, virt)
            }
          </VirtualRows>
        ) : (
          rows.map((row, index) =>
            rowOrderingActive ? (
              <SortableRow key={row.id} id={row.id} selected={row.getIsSelected()} className={rowClassName?.(row)}>
                {row.getVisibleCells().map((cell) => {
                  const isEditing = editingCell?.rowId === row.id && editingCell?.columnId === cell.column.id;
                  return (
                    <TableCell key={cell.id} className={sepCellClass} style={pinStyle(cell.column)}>
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
                {dataRow(row, index)}
                {/* A group row expands into its rows, not into a detail panel. */}
                {expansionEnabled && row.getIsExpanded() && !row.getIsGrouped() && renderSubRow
                  ? subRowPanel(row)
                  : null}
              </React.Fragment>
            ),
          )
        )}
      </TableBody>
  );

  return (
    <Table
      ref={setTableRef}
      containerClassName={props.containerClassName}
      containerStyle={
        virtualize
          ? // The spacer rows change height as the window moves, and the
            // browser's scroll anchoring "corrects" the scroll for that on its
            // own: a jump to a row far off landed at the top instead.
            { ...props.containerStyle, overflowAnchor: "none" }
          : props.containerStyle
      }
      // Virtualized, the columns are laid out from the header, not from
      // whichever rows happen to be mounted, so they hold still as you scroll.
      className={virtualize ? "zen-table-fixed" : undefined}
      aria-rowcount={virtualize ? (props.headerRowCount ?? 1) + items.length : undefined}
      role={cellNav ? "grid" : undefined}
      aria-multiselectable={cellNav ? "true" : undefined}
    >
      {props.header}
      {rowDrag ? <RowDragContext.Provider value={rowDragValue}>{body}</RowDragContext.Provider> : body}
      {props.footer}
    </Table>
  );
}

/* ----------------------------- VirtualRows --------------------------- */
/** What BodyTable may ask of its VirtualRows: scroll to an item, find the item at an offset. */
interface VirtualRowsApi {
  scrollToItem: (index: number) => void;
  /** The item at a content offset in the scroller (header included), measured or estimated. */
  itemAt: (offset: number) => { index: number; start: number; end: number } | undefined;
}

// The regular table's rows, only those in view (enableRowVirtualization). The
// rows it skips are stood in for by spacer rows of their height, so the table
// stays one table: header, column widths, sticky cells and footer are the
// plain body's, and so is every row. Rows are measured as they mount, so a
// group row or an expanded panel may be taller than the rest.
function VirtualRows<TData>({
  items,
  tableEl,
  estimatedRowHeight,
  colCount,
  keepKey,
  onReady,
  children,
}: {
  items: BodyItem<TData>[];
  tableEl: HTMLTableElement | null;
  estimatedRowHeight?: number;
  colCount: number;
  /** Item indices to keep mounted wherever the scroll is, comma-joined. */
  keepKey: string;
  onReady: (api: VirtualRowsApi) => void;
  children: (item: BodyItem<TData>, virt: VirtRow) => React.ReactNode;
}) {
  // The header shares the rows' scroller but sticks at its top: the rows
  // start below it, and a row scrolled to must not land underneath it.
  const [headerHeight, setHeaderHeight] = React.useState(0);
  React.useLayoutEffect(() => {
    const head = tableEl?.tHead;
    if (!head) return;
    setHeaderHeight(head.offsetHeight);
    const ro = new ResizeObserver(() => setHeaderHeight(head.offsetHeight));
    ro.observe(head);
    return () => ro.disconnect();
  }, [tableEl]);

  // Rows not mounted yet are placed by an estimate. Unless the caller gives
  // one, it is the first row measured, so it follows density and theme.
  const estimate = React.useRef(estimatedRowHeight ?? 40);
  const learned = React.useRef(estimatedRowHeight !== undefined);

  // Both are new functions whenever what they read changes: the virtualizer
  // recomputes only when they change identity, and a sort keeps the count.
  const getItemKey = React.useCallback(
    (index: number) => {
      const item = items[index];
      return item ? `${item.kind}:${item.row.id}` : index;
    },
    [items],
  );
  const rangeExtractor = React.useCallback(
    (range: Range) => {
      const base = defaultRangeExtractor(range);
      // A row may be kept for more than one reason (focused AND edited): an
      // index listed twice would mount it twice.
      const keep = keepKey ? keepKey.split(",").map(Number) : [];
      const extra = [...new Set(keep)].filter((i) => i < range.count && !base.includes(i));
      return extra.length ? [...base, ...extra].sort((x, y) => x - y) : base;
    },
    [keepKey],
  );
  const virtualizer = useVirtualizer<HTMLElement, Element>({
    count: items.length,
    getScrollElement: () => tableEl?.parentElement ?? null,
    estimateSize: () => estimate.current,
    measureElement: (el, entry, instance) => {
      const size = measureRowElement(el, entry, instance);
      if (!learned.current && entry && size > 0) {
        learned.current = true;
        // Re-estimate every unmeasured row from it: the jump to a row far
        // away lands where that row really is.
        queueMicrotask(() => {
          estimate.current = size;
          instance.measure();
        });
      }
      return size;
    },
    getItemKey,
    rangeExtractor,
    scrollMargin: headerHeight,
    scrollPaddingStart: headerHeight,
    overscan: 8,
    // Rows are measured from their ref, during React's commit: a synchronous
    // re-render from there is what flushSync warns about.
    useFlushSync: false,
  });
  React.useLayoutEffect(() => {
    onReady({
      scrollToItem: (index) => virtualizer.scrollToIndex(index, { align: "auto" }),
      itemAt: (offset) => {
        const item = virtualizer.getVirtualItemForOffset(offset);
        return item && { index: item.index, start: item.start, end: item.end };
      },
    });
  }, [virtualizer, onReady]);

  // A list update can move a mounted row among its siblings, and moving a
  // focused element drops its focus, with nothing to tell that blur from a
  // click elsewhere. So the focus held in the body before an update is put
  // back after it, only when the update is what took it: nothing else has
  // focus. (An editor's blur during the move is React's commit, when React
  // dispatches no events, so it does not save.)
  const held = React.useRef<HTMLElement | null>(null);
  if (typeof document !== "undefined") {
    const a = document.activeElement;
    const body = tableEl?.tBodies[0];
    held.current = body && a instanceof HTMLElement && body.contains(a) ? a : null;
  }
  React.useLayoutEffect(() => {
    const el = held.current;
    if (!el || !el.isConnected || document.activeElement === el) return;
    if (document.activeElement && document.activeElement !== document.body) return;
    el.focus({ preventScroll: true });
  });

  const virtualItems = virtualizer.getVirtualItems();
  const spacer = (height: number, key: string) => (
    <tr key={key} aria-hidden="true" data-virtual-spacer="">
      <td colSpan={colCount} style={{ height, padding: 0, border: 0 }} />
    </tr>
  );
  // Item starts include the header (scrollMargin); the total size does not.
  const last = virtualItems[virtualItems.length - 1];
  const bottomGap = last ? virtualizer.getTotalSize() - (last.end - headerHeight) : 0;
  return (
    <>
      {virtualItems.map((vi, p) => {
        // A gap before this item: the unmounted rows above it (more than the
        // window's edge when this is a kept row far from the rest).
        const gap = vi.start - (p === 0 ? headerHeight : virtualItems[p - 1].end);
        const item = items[vi.index];
        return (
          <React.Fragment key={vi.key}>
            {gap > 0 ? spacer(gap, "gap") : null}
            {item ? children(item, { index: vi.index, measure: virtualizer.measureElement }) : null}
          </React.Fragment>
        );
      })}
      {bottomGap > 0 ? spacer(bottomGap, "bottom") : null}
    </>
  );
}

/* ----------------------------- sortable row -------------------------- */
function SortableRow({
  id,
  selected,
  className,
  children,
}: {
  id: string;
  selected: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, transform, transition, isDragging } = useSortable({ id });
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
