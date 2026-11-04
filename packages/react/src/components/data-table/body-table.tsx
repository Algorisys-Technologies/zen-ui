import * as React from "react";
import type { Cell, Column, Row, Table as TanStackTable } from "@tanstack/react-table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ownsArrowKeys, rowKeyTarget } from "@algorisys/zen-ui-core/row-keys";

import { cn } from "../../lib/cn";
import { Table, TableBody, TableCell, TableRow } from "./table";
import { EditableCell, type EditingState } from "./edit-cell";

/**
 * The body of the (unvirtualized-by-grid) DataTable: the <table>, its rows
 * and its footer. DataTable builds the header and the footer and hands them
 * in; this owns what happens in the rows: keyboard rows, and the panel an
 * expanded row opens. Mirrors the Solid binding's BodyTable.
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
}

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
  } = props;
  const rows = table.getRowModel().rows;
  const tableRef = React.useRef<HTMLTableElement>(null);

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

  // When the focused row goes away (it was filtered out, or an inline editor
  // inside it closed), focus falls to the page. If the table held focus, it
  // goes back to the tab-stop row once the rows have settled.
  //
  // "Held focus" is kept from the table's own focus events, not read from
  // document.activeElement, which is the page during a blur. A blur towards
  // nothing that leaves its element in place is a click elsewhere: the table
  // gives focus up. One whose element has gone is a rebuild: it does not.
  const tableHasFocus = React.useRef(false);
  const restoreFocus = React.useRef<() => void>(() => {});
  restoreFocus.current = () => {
    const stop = rows[tabStop];
    if (stop) focusRow(stop.id);
  };
  React.useEffect(() => {
    const el = tableRef.current;
    if (!keyboard || !el) return;
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
  }, [keyboard]);
  React.useEffect(() => {
    if (!tableHasFocus.current) return;
    const t = setTimeout(() => {
      const now = document.activeElement;
      if (!tableHasFocus.current || (now && now !== document.body)) return;
      restoreFocus.current();
    });
    return () => clearTimeout(t);
  }, [rows]);

  const cells = (row: Row<TData>) =>
    row.getVisibleCells().map((cell) => {
      const pin = pinStyle(cell.column);
      const isEditing = editingCell?.rowId === row.id && editingCell?.columnId === cell.column.id;
      /* Disable inline-edit for group-header and aggregated cells — the
       * rendered value isn't a single row's field. */
      const isInteractive = !cell.getIsGrouped() && !cell.getIsAggregated() && !cell.getIsPlaceholder();
      const content = renderCell(cell);
      return (
        <TableCell key={cell.id} className={sepCellClass} style={pin}>
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
      {cells(row)}
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
    <Table ref={tableRef} containerClassName={props.containerClassName} containerStyle={props.containerStyle}>
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
