import { type JSX } from "solid-js";
import type { Cell, RowData } from "@tanstack/solid-table";
/**
 * Inline cell editing for the Solid DataTable. Mirrors the React
 * binding's edit-cell.tsx: declare `meta.editable: true` on a column
 * (or a `(row) => boolean`) and DataTable will activate inline editing
 * on double-click / Enter / Space; the matching editor (text / number /
 * select) renders in place and commits on Enter / blur, cancels on Esc.
 */
export type EditVariant = "text" | "number" | "select";
export interface CellEditPayload {
    rowId: string;
    columnId: string;
    value: unknown;
}
export interface EditingState {
    rowId: string;
    columnId: string;
}
declare module "@tanstack/solid-table" {
    interface ColumnMeta<TData extends RowData, TValue> {
        editable?: boolean | ((row: TData) => boolean);
        editVariant?: EditVariant;
        editOptions?: {
            label: string;
            value: string;
        }[];
    }
}
export interface EditableCellProps<TData> {
    cell: Cell<TData, unknown>;
    editing: boolean;
    onStartEdit: () => void;
    onCommit: (value: unknown) => void;
    onCancel: () => void;
    children: JSX.Element;
}
export declare function EditableCell<TData>(props: EditableCellProps<TData>): JSX.Element;
//# sourceMappingURL=edit-cell.d.ts.map