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
        /**
         * The column's plain-text name, for where the header cannot be read: the
         * Columns menu, the sort button's and resize handle's accessible names,
         * filter labels and export headers. Needed when `header` is a function;
         * without it those fall back to a string header, then the column id.
         */
        label?: string;
        filterVariant?: FilterVariant;
        /** Options used by the `select` variant. */
        filterOptions?: {
            label: string;
            value: string;
        }[];
        /**
         * A total for this column, computed and shown by DataTable: in a footer
         * (over the filtered rows, or the page with `totalsOver="page"`) and as
         * each group's subtotal when grouped. Sums are exact in decimal. Leaves a
         * column's own `footer`, `aggregationFn` and `aggregatedCell` alone.
         */
        aggregate?: "sum" | "count" | "avg" | "min" | "max" | ((values: unknown[], rows: unknown[]) => unknown);
        /** How the total and subtotals show. Default: the locale's number at the column's own decimal places. */
        formatTotal?: (value: unknown) => import("react").ReactNode;
        /**
         * How a server-side export should format this column (DataTable onExport):
         * `{ kind: "amount", currency: "INR" }`, `{ kind: "date" }`… Default:
         * "number" for a column with a total or a number filter, else "text".
         */
        exportFormat?: import("../../_core/export-request").ExportColumnFormat;
    }
}
export declare const textFilterFn: FilterFn<unknown>;
export declare const filterFnByVariant: Record<FilterVariant, FilterFn<unknown>>;
export declare function FilterCell<TData>({ column, operators, }: {
    column: Column<TData, unknown>;
    /** Render the per-column operator select. Off for server-filtered tables. */
    operators?: boolean;
}): import("react").JSX.Element | null;
//# sourceMappingURL=filters.d.ts.map