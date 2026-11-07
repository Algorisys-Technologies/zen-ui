import * as React from "react";
import type { Cell, Column, Row, Table as TanStackTable } from "@tanstack/react-table";
import { type CellEditPayload, type EditingState } from "./edit-cell";
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
/** Provided by a virtualized body that drags its rows itself (see BodyTable's startDrag). */
export declare const RowDragContext: React.Context<{
    active: boolean;
    start: (rowId: string, e: React.PointerEvent) => void;
} | null>;
export declare function BodyTable<TData>(props: BodyTableProps<TData>): React.JSX.Element;
//# sourceMappingURL=body-table.d.ts.map