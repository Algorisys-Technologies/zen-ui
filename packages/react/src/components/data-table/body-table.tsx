import * as React from "react";
import type { Cell, Column, Row, Table as TanStackTable } from "@tanstack/react-table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
}

type EditMeta = {
  editable?: boolean | ((row: unknown) => boolean);
  editVariant?: "text" | "number" | "select";
  editOptions?: { label: string; value: string }[];
};

const cellKey = (rowId: string, colId: string) => `${rowId}\u0000${colId}`;
const ORIGIN: GridCell = { row: 0, col: 0 };

export function BodyTable<TData>(props: BodyTableProps<TData>) {
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
  } = props;
  const rows = table.getRowModel().rows;
  const tableRef = React.useRef<HTMLTableElement>(null);
  const rowIndex = React.useMemo(() => new Map(rows.map((r, i) => [r.id, i])), [rows]);

  // Keyboard rows: a roving tabindex, so the table is one tab stop and the
  // arrows move within it. The index is clamped when the rows change under it
  // (a new page, a filter), so there is always exactly one tab stop.
  const [focusIndex, setFocusIndex] = React.useState(0);
  const tabStop = Math.min(focusIndex, Math.max(rows.length - 1, 0));
  const rowRefs = React.useRef(new Map<string, HTMLTableRowElement>());
  const focusRow = (id: string) => rowRefs.current.get(id)?.focus();

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
    nav.current = { keydown, dblclick, pointerdown, copy, paste, focusCell, stop: nav.current?.stop };
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
      // A pinned cell paints its own background, so its selection has to be
      // painted there too.
      const style = pin && isSelected ? { ...pin, background: "var(--zen-color-primary-soft)" } : pin;
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

  const dataRow = (row: Row<TData>, index: number) => (
    <TableRow
      ref={
        keyboard
          ? (el: HTMLTableRowElement | null) => {
              if (el) rowRefs.current.set(row.id, el);
              else rowRefs.current.delete(row.id);
            }
          : undefined
      }
      tabIndex={keyboard ? (index === tabStop ? 0 : -1) : undefined}
      aria-label={keyboard ? rowLabel?.(row) : undefined}
      aria-selected={keyboard && selectable ? (row.getIsSelected() ? "true" : "false") : undefined}
      onKeyDown={keyboard ? (e) => onRowKeyDown(e, row, index) : undefined}
      onFocus={keyboard ? () => setFocusIndex(index) : undefined}
      data-state={row.getIsSelected() ? "selected" : undefined}
      data-grouped={row.getIsGrouped() ? "true" : undefined}
      className={cn(
        row.getIsGrouped() && "zen-bg-zen-muted/40 zen-font-medium",
        keyboard &&
          "focus-visible:zen-outline focus-visible:zen-outline-2 focus-visible:-zen-outline-offset-2 focus-visible:zen-outline-zen-ring",
        rowClassName?.(row),
      )}
    >
      {cells(row, index)}
    </TableRow>
  );

  const subRowPanel = (row: Row<TData>) => (
    <TableRow data-expanded-of={row.id}>
      <TableCell colSpan={row.getVisibleCells().length} className="zen-p-0 zen-bg-zen-muted/30">
        {renderSubRow!(row)}
      </TableCell>
    </TableRow>
  );

  return (
    <Table
      ref={tableRef}
      containerClassName={props.containerClassName}
      containerStyle={props.containerStyle}
      role={cellNav ? "grid" : undefined}
      aria-multiselectable={cellNav ? "true" : undefined}
    >
      {props.header}
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={colSpan} className="zen-text-center zen-text-zen-muted-fg zen-py-6">
              Loading…
            </TableCell>
          </TableRow>
        ) : rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={colSpan} className="zen-text-center zen-text-zen-muted-fg zen-py-6">
              {emptyMessage}
            </TableCell>
          </TableRow>
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
      {props.footer}
    </Table>
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
