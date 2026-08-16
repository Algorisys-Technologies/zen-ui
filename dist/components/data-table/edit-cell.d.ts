import * as React from "react";
import type { Cell, RowData } from "@tanstack/react-table";
/**
 * Inline cell editing.
 *
 * Declare `meta.editable: true` on a column (or a function
 * `(row) => boolean` for per-row control) and DataTable will:
 *
 *   - render the cell normally until activated
 *   - activate on double-click or Enter / Space when the cell is focused
 *   - swap the cell content for the matching input control
 *     (text by default, number / select via `meta.editVariant`)
 *   - commit on Enter or blur via the caller's `onCellEdit(payload)`
 *   - cancel on Escape (restore prior render)
 *
 * The component is uncontrolled with respect to data — the caller still
 * owns the source `data` array and updates it from `onCellEdit`.
 *
 *   <DataTable
 *     data={rows}
 *     columns={[
 *       { accessorKey: "name", header: "Name",
 *         meta: { editable: true } },
 *       { accessorKey: "salary", header: "Salary",
 *         meta: { editable: true, editVariant: "number" } },
 *       { accessorKey: "role", header: "Role",
 *         meta: { editable: true, editVariant: "select",
 *                 editOptions: [{ label: "Admin", value: "Admin" }, …] } },
 *     ]}
 *     onCellEdit={({ rowId, columnId, value }) => {
 *       setRows(prev => prev.map(r =>
 *         r.id === rowId ? { ...r, [columnId]: value } : r));
 *     }}
 *   />
 */
export type EditVariant = "text" | "number" | "select";
export interface CellEditPayload {
    /** Stable row id — pass `getRowId` on your column defs for reliable identity. */
    rowId: string;
    columnId: string;
    /** Newly committed value. Stringified for text; number-or-null for number. */
    value: unknown;
}
export interface EditingState {
    rowId: string;
    columnId: string;
}
declare module "@tanstack/react-table" {
    interface ColumnMeta<TData extends RowData, TValue> {
        editable?: boolean | ((row: TData) => boolean);
        editVariant?: EditVariant;
        /** Options used by the `select` edit variant. */
        editOptions?: {
            label: string;
            value: string;
        }[];
    }
}
export interface EditableCellProps<TData> {
    cell: Cell<TData, unknown>;
    /** When true, this is the cell currently in edit mode. */
    editing: boolean;
    onStartEdit: () => void;
    onCommit: (value: unknown) => void;
    onCancel: () => void;
    /** The cell's rendered (non-edit) content. */
    children: React.ReactNode;
}
/**
 * EditableCell — wraps a cell renderer with double-click-to-edit + the
 * matching editor. Read-only / non-editable cells render through unchanged.
 */
export declare function EditableCell<TData>({ cell, editing, onStartEdit, onCommit, onCancel, children, }: EditableCellProps<TData>): React.JSX.Element;
//# sourceMappingURL=edit-cell.d.ts.map