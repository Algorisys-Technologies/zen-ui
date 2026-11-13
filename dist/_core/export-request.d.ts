/**
 * Server-side export: the request a table hands to the app's server, shared
 * by every binding.
 *
 *   bun run check:export-request
 *
 * A large list never lives in the browser: a ledger of a million lines shows
 * one page of it. So an export cannot be built from the rows on screen; the
 * server, which has all of them, builds it. zen-ui's part is to describe
 * exactly what the user is looking at, so the server's file matches the
 * screen: the visible columns in their order (header, width, alignment,
 * format, total), the filters, sort and grouping, the locale, and whether it
 * is every matching row or a selection. The app's endpoint reads this,
 * queries its database and renders the file with its own tools (openpyxl,
 * a print format, …). The request is a few kilobytes whatever the data's size.
 *
 * The shape is versioned (`version: 1`) and only ever grows: a server written
 * for version 1 keeps working when fields are added.
 */
export type ExportFormat = "xlsx" | "pdf" | "csv";
/** How a column's values are meant to be read, so the server formats them as the screen does. */
export type ExportColumnFormat = {
    kind: "text";
} | {
    kind: "number";
    precision?: number;
} | {
    kind: "amount";
    currency?: string;
    precision?: number;
} | {
    kind: "quantity";
    unit?: string;
    precision?: number;
} | {
    kind: "percent";
    precision?: number;
} | {
    kind: "date";
} | {
    kind: "datetime";
} | {
    kind: "boolean";
};
export interface ExportColumn {
    /** The column's id: the field the server reads. */
    id: string;
    /** Its heading, as the user sees it (in their language). */
    header: string;
    /** Width on screen, in CSS pixels: a spreadsheet's column width can follow it. */
    width: number;
    align: "start" | "end";
    format: ExportColumnFormat;
    /** A total under this column, of this kind ("custom": the app's own function; the server decides). */
    total?: "sum" | "count" | "avg" | "min" | "max" | "custom";
}
export interface ExportRequest {
    version: 1;
    format: ExportFormat;
    /** A file name without extension. */
    filename: string;
    title?: string;
    /** BCP 47, for the server's number and date formatting. */
    locale?: string;
    /** Every row the filters match, or only these selected row ids (which may be on pages never loaded). */
    scope: {
        kind: "all";
    } | {
        kind: "selected";
        ids: string[];
    };
    columns: ExportColumn[];
    /** In priority order. */
    sort: {
        id: string;
        desc: boolean;
    }[];
    filters: {
        /** The table's search box. */
        search?: string;
        /**
         * Per-column filter values as the table holds them: a string, a
         * { op, value } (DataTable's operator names: contains, equals, starts,
         * ends; eq, ne, gt, gte, lt, lte), a [min, max] range, an array of
         * choices, or a boolean.
         */
        columns: {
            id: string;
            value: unknown;
        }[];
    };
    /** Column ids, outermost first. */
    grouping: string[];
    /** Anything else the app passed (a FilterBuilder tree, a saved view's id). */
    context?: Record<string, unknown>;
}
/** Build a request from a table's state, dropping what means nothing (empty filters, duplicate sorts). */
export declare function buildExportRequest(input: {
    format: ExportFormat;
    filename: string;
    title?: string;
    locale?: string;
    selectedIds?: string[] | null;
    columns: ExportColumn[];
    sort?: {
        id: string;
        desc: boolean;
    }[];
    search?: string;
    columnFilters?: {
        id: string;
        value: unknown;
    }[];
    grouping?: string[];
    context?: Record<string, unknown>;
}): ExportRequest;
/**
 * Read a request on a JavaScript server (Node, Bun, an edge function): the
 * request, or null and what was wrong. Never throws: the body came over the
 * network and is the client's word, not the server's. A server in another
 * language reads the same JSON; the shape is documented above.
 */
export declare function parseExportRequest(input: unknown): {
    request: ExportRequest | null;
    problems: string[];
};
/** The usual file extension and MIME type for a format, for the app's response. */
export declare const EXPORT_FILE: Record<ExportFormat, {
    extension: string;
    mime: string;
}>;
