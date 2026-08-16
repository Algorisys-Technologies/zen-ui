import type { Column, FilterFn, RowData } from "@tanstack/react-table";
/**
 * Filter variants for per-column filters in DataTable.
 *
 * Declare on each column's `meta.filterVariant`. When set, DataTable
 * renders the matching input control (instead of the default <Input>)
 * AND auto-attaches the matching `filterFn` if the column hasn't
 * specified its own.
 *
 *   columns = [
 *     { accessorKey: "name",   header: "Name",   meta: { filterVariant: "text" } },
 *     { accessorKey: "score",  header: "Score",  meta: { filterVariant: "numberRange" } },
 *     { accessorKey: "role",   header: "Role",
 *       meta: { filterVariant: "select",
 *               filterOptions: [{ label: "Admin", value: "Admin" }, …] } },
 *   ];
 */
export type FilterVariant = "text" | "number" | "numberRange" | "select" | "boolean";
export type TextOp = "contains" | "equals" | "starts" | "ends";
export interface TextFilterValue {
    op: TextOp;
    value: string;
}
export type NumberOp = "eq" | "ne" | "gt" | "lt" | "gte" | "lte";
export interface NumberFilterValue {
    op: NumberOp;
    value: number | null;
}
export type NumberRangeFilterValue = [number | null, number | null];
declare module "@tanstack/react-table" {
    interface ColumnMeta<TData extends RowData, TValue> {
        filterVariant?: FilterVariant;
        /** Options used by the `select` variant. */
        filterOptions?: {
            label: string;
            value: string;
        }[];
    }
}
export declare const filterFnByVariant: Record<FilterVariant, FilterFn<unknown>>;
export declare function FilterCell<TData>({ column, operators, }: {
    column: Column<TData, unknown>;
    /** Render the per-column operator select. Off for server-filtered tables. */
    operators?: boolean;
}): import("react").JSX.Element | null;
//# sourceMappingURL=filters.d.ts.map