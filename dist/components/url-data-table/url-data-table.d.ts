import * as React from "react";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
/**
 * UrlDataTable — a DataTable whose entire state lives in the URL.
 *
 *   <UrlDataTable
 *     columns={[{ key: "email", label: "Email", sort: true, search: true }]}
 *     rows={rows}
 *     params={searchParams}
 *     onParamsChange={setSearchParams}
 *     pageCount={pages}
 *     page={currentPage}
 *   />
 *
 * DataTable already supports server-driven data through `manualSorting`,
 * `manualFiltering` and `manualPagination`. What it does NOT have an opinion
 * about is WHERE that state lives, so every server-paginated app rebuilds the
 * same layer: read sort/filter/search/page out of the querystring, hand them to
 * the table as controlled state, write them back on every interaction, and let
 * the loader re-fetch. That layer is what drifts — each copy invents its own
 * encoding, forgets to reset the page when a filter changes, or re-sorts data
 * the server already sorted.
 *
 * This is that layer, once. It owns no state of its own: `params` in,
 * `onParamsChange` out. Nothing here imports a router — the caller wires
 * whatever it has (Remix `useSearchParams`, Next `useSearchParams` +
 * `router.push`, TanStack Router, or plain `history.pushState`), which is what
 * keeps it usable from every binding rather than only the React-Router ones.
 *
 * The wire format is deliberately readable, because these URLs get pasted into
 * tickets and bookmarked:
 *
 *   ?sort=name:asc,createdAt:desc&filters=status:active&search=acme&page=2
 *
 * Multi-column sort is ordered — `sort` is a list, and the order in the URL is
 * the precedence the server should apply.
 */
export interface UrlDataTableColumn<TRow> {
    /** Key into each row, and the id used in the URL. */
    key: string;
    label: string;
    /** Show a sort control on this header. Tri-state: asc, desc, off. */
    sort?: boolean;
    /** Allow filtering this column. Renders an input in the header filter row. */
    search?: boolean;
    /** Render the value with `toDateString()`. Ignored when `render` is given. */
    isDate?: boolean;
    /** Render the value as a Badge. Ignored when `render` is given. */
    highlight?: boolean;
    /** Full control over the cell. Wins over isDate / highlight. */
    render?: (row: TRow) => React.ReactNode;
    /** Column width hint, passed through to the underlying column def. */
    width?: number;
}
export interface UrlDataTableFilterOption {
    label: string;
    value: string;
}
export interface UrlDataTableFilter {
    label: string;
    key: string;
    values: UrlDataTableFilterOption[];
}
export interface UrlDataTableParamNames {
    sort?: string;
    filters?: string;
    search?: string;
    page?: string;
}
export interface UrlDataTableProps<TRow extends Record<string, unknown>> {
    columns: UrlDataTableColumn<TRow>[];
    /** The current page of rows, already sorted and filtered by the server. */
    rows: TRow[];
    /** Current querystring. */
    params: URLSearchParams;
    /** Called with the next querystring whenever the user changes table state. */
    onParamsChange: (next: URLSearchParams) => void;
    /** Show the global search box. */
    search?: boolean;
    searchPlaceholder?: string;
    /** Dropdown filters rendered in the toolbar. */
    filters?: UrlDataTableFilter[];
    /** Trailing actions column. */
    actions?: (row: TRow) => React.ReactNode;
    actionsLabel?: string;
    /** 1-based, to match the way page numbers appear in a URL. */
    page?: number;
    pageCount?: number;
    pageSize?: number;
    totalCount?: number;
    emptyMessage?: string;
    loading?: boolean;
    /** Override the querystring keys if they collide with something else. */
    paramNames?: UrlDataTableParamNames;
    className?: string;
}
export declare function parseSortParam(raw: string | null): SortingState;
export declare function serializeSortParam(sorting: SortingState): string;
export declare function parseFilterParam(raw: string | null): ColumnFiltersState;
export declare function serializeFilterParam(filters: ColumnFiltersState): string;
export declare function UrlDataTable<TRow extends Record<string, unknown>>({ columns, rows, params, onParamsChange, search, searchPlaceholder, filters, actions, actionsLabel, page, pageCount, pageSize, totalCount, emptyMessage, loading, paramNames, className, }: UrlDataTableProps<TRow>): React.JSX.Element;
//# sourceMappingURL=url-data-table.d.ts.map