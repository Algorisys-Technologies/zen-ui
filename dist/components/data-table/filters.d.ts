import { type JSX } from "solid-js";
import type { Column, FilterFn, RowData } from "@tanstack/solid-table";
/**
 * Per-column filter variants for the Solid DataTable.
 *
 * Declare on each column's `meta.filterVariant`. When set, DataTable
 * renders the matching input control (instead of the default <Input>)
 * AND auto-attaches the matching `filterFn` if the column hasn't
 * specified its own. Mirrors the React binding's filter machinery.
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
declare module "@tanstack/solid-table" {
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
export declare function FilterCell<TData>(props: {
    column: Column<TData, unknown>;
}): JSX.Element;
//# sourceMappingURL=filters.d.ts.map