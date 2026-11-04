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
export type ExportColumnFormat =
  | { kind: "text" }
  | { kind: "number"; precision?: number }
  | { kind: "amount"; currency?: string; precision?: number }
  | { kind: "quantity"; unit?: string; precision?: number }
  | { kind: "percent"; precision?: number }
  | { kind: "date" }
  | { kind: "datetime" }
  | { kind: "boolean" };

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
  scope: { kind: "all" } | { kind: "selected"; ids: string[] };
  columns: ExportColumn[];
  /** In priority order. */
  sort: { id: string; desc: boolean }[];
  filters: {
    /** The table's search box. */
    search?: string;
    /**
     * Per-column filter values as the table holds them: a string, a
     * { op, value } (DataTable's operator names: contains, equals, starts,
     * ends; eq, ne, gt, gte, lt, lte), a [min, max] range, an array of
     * choices, or a boolean.
     */
    columns: { id: string; value: unknown }[];
  };
  /** Column ids, outermost first. */
  grouping: string[];
  /** Anything else the app passed (a FilterBuilder tree, a saved view's id). */
  context?: Record<string, unknown>;
}

const isEmptyFilter = (v: unknown): boolean => {
  if (v === null || v === undefined || v === "") return true;
  if (Array.isArray(v)) return v.length === 0 || v.every((x) => x === null || x === undefined || x === "");
  if (typeof v === "object" && "value" in (v as object)) return isEmptyFilter((v as { value: unknown }).value);
  return false;
};

/** Build a request from a table's state, dropping what means nothing (empty filters, duplicate sorts). */
export function buildExportRequest(input: {
  format: ExportFormat;
  filename: string;
  title?: string;
  locale?: string;
  selectedIds?: string[] | null;
  columns: ExportColumn[];
  sort?: { id: string; desc: boolean }[];
  search?: string;
  columnFilters?: { id: string; value: unknown }[];
  grouping?: string[];
  context?: Record<string, unknown>;
}): ExportRequest {
  const seenSort = new Set<string>();
  const sort = (input.sort ?? []).filter((s) => (seenSort.has(s.id) ? false : (seenSort.add(s.id), true))).map((s) => ({ id: s.id, desc: !!s.desc }));
  const request: ExportRequest = {
    version: 1,
    format: input.format,
    filename: input.filename,
    ...(input.title ? { title: input.title } : {}),
    ...(input.locale ? { locale: input.locale } : {}),
    scope: input.selectedIds && input.selectedIds.length ? { kind: "selected", ids: [...new Set(input.selectedIds)] } : { kind: "all" },
    columns: input.columns.map((c) => ({ ...c })),
    sort,
    filters: {
      ...(input.search && input.search.trim() ? { search: input.search.trim() } : {}),
      columns: (input.columnFilters ?? []).filter((f) => !isEmptyFilter(f.value)).map((f) => ({ id: f.id, value: f.value })),
    },
    grouping: [...new Set(input.grouping ?? [])],
    ...(input.context && Object.keys(input.context).length ? { context: input.context } : {}),
  };
  return request;
}

const FORMATS = new Set(["xlsx", "pdf", "csv"]);
const KINDS = new Set(["text", "number", "amount", "quantity", "percent", "date", "datetime", "boolean"]);
const TOTALS = new Set(["sum", "count", "avg", "min", "max", "custom"]);

/**
 * Read a request on a JavaScript server (Node, Bun, an edge function): the
 * request, or null and what was wrong. Never throws: the body came over the
 * network and is the client's word, not the server's. A server in another
 * language reads the same JSON; the shape is documented above.
 */
export function parseExportRequest(input: unknown): { request: ExportRequest | null; problems: string[] } {
  const problems: string[] = [];
  const o = typeof input === "string" ? safeJson(input) : input;
  if (!o || typeof o !== "object" || Array.isArray(o)) return { request: null, problems: ["not an object"] };
  const r = o as Record<string, unknown>;
  if (r.version !== 1) problems.push(`unsupported version ${JSON.stringify(r.version)}`);
  if (!FORMATS.has(r.format as string)) problems.push(`unknown format ${JSON.stringify(r.format)}`);
  if (typeof r.filename !== "string" || !r.filename) problems.push("no filename");
  const cols = Array.isArray(r.columns) ? r.columns : [];
  if (!cols.length) problems.push("no columns");
  const ids = new Set<string>();
  cols.forEach((c, i) => {
    const col = c as Record<string, unknown> | null;
    if (!col || typeof col.id !== "string" || !col.id) return problems.push(`column ${i}: no id`);
    if (ids.has(col.id)) problems.push(`column ${i}: duplicate id ${col.id}`);
    ids.add(col.id);
    if (typeof col.header !== "string") problems.push(`column ${col.id}: no header`);
    const f = col.format as Record<string, unknown> | undefined;
    if (!f || !KINDS.has(f.kind as string)) problems.push(`column ${col.id}: unknown format`);
    if (col.total !== undefined && !TOTALS.has(col.total as string)) problems.push(`column ${col.id}: unknown total`);
  });
  const scope = r.scope as Record<string, unknown> | undefined;
  if (!scope || (scope.kind !== "all" && !(scope.kind === "selected" && Array.isArray(scope.ids) && scope.ids.every((x) => typeof x === "string")))) problems.push("bad scope");
  if (!Array.isArray(r.sort) || !r.sort.every((s) => s && typeof (s as { id: unknown }).id === "string")) problems.push("bad sort");
  const filters = r.filters as Record<string, unknown> | undefined;
  if (!filters || !Array.isArray(filters.columns)) problems.push("bad filters");
  if (!Array.isArray(r.grouping)) problems.push("bad grouping");
  return problems.length ? { request: null, problems } : { request: o as ExportRequest, problems };
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

/** The usual file extension and MIME type for a format, for the app's response. */
export const EXPORT_FILE: Record<ExportFormat, { extension: string; mime: string }> = {
  xlsx: { extension: "xlsx", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  pdf: { extension: "pdf", mime: "application/pdf" },
  csv: { extension: "csv", mime: "text/csv;charset=utf-8" },
};
