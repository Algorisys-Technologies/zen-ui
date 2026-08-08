import * as React from "react";
import type { ColumnDef, ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { cn } from "../../lib/cn";
import { Badge } from "../badge/badge";
import { DataTable } from "../data-table/data-table";

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

/** Long enough to swallow a word, short enough to feel immediate. */
const DEBOUNCE_MS = 350;

const DEFAULT_PARAMS: Required<UrlDataTableParamNames> = {
  sort: "sort",
  filters: "filters",
  search: "search",
  page: "page",
};

/* ── wire format ──────────────────────────────────────────────────────────
 * `a:asc,b:desc` <-> SortingState. Pairs missing either half are dropped
 * rather than guessed: a half-written URL should lose one column, not sort by
 * "undefined" and return a differently-ordered page than the user asked for. */

export function parseSortParam(raw: string | null): SortingState {
  if (!raw) return [];
  const out: SortingState = [];
  for (const part of raw.split(",")) {
    const [id, dir] = part.split(":");
    if (id && (dir === "asc" || dir === "desc")) out.push({ id, desc: dir === "desc" });
  }
  return out;
}

export function serializeSortParam(sorting: SortingState): string {
  return sorting.map((s) => `${s.id}:${s.desc ? "desc" : "asc"}`).join(",");
}

/**
 * Per-column filters are `{ op, value }`, not strings — DataTable renders an
 * operator select beside each input. An earlier version of this serialized the
 * whole object, so the URL read `filters=text:[object Object]` and the operator
 * was lost on the way back, which snapped every select to its default.
 *
 * So the operator rides in the URL too:
 *
 *   filters=question:contains:how,status:active
 *            ^key     ^op       ^value    ^key  ^value (toolbar dropdown, no op)
 *
 * A value is only read as an operator when it is one of the operators DataTable
 * actually defines, so a plain filter value keeps working unless it literally
 * begins with `contains:` or a sibling. Values may still contain colons — only
 * the first one (and an operator immediately after it) is structural.
 */
const KNOWN_OPS = new Set([
  "contains", "equals", "starts", "ends",
  "eq", "ne", "gt", "lt", "gte", "lte",
]);

export function parseFilterParam(raw: string | null): ColumnFiltersState {
  if (!raw) return [];
  const out: ColumnFiltersState = [];
  for (const part of raw.split(",")) {
    const i = part.indexOf(":");
    if (i <= 0) continue;
    const id = part.slice(0, i);
    const rest = part.slice(i + 1);
    if (!id || !rest) continue;

    const j = rest.indexOf(":");
    if (j > 0 && KNOWN_OPS.has(rest.slice(0, j))) {
      out.push({ id, value: { op: rest.slice(0, j), value: rest.slice(j + 1) } });
      continue;
    }
    out.push({ id, value: rest });
  }
  return out;
}

export function serializeFilterParam(filters: ColumnFiltersState): string {
  const parts: string[] = [];
  for (const f of filters) {
    const v = f.value as unknown;
    if (v == null) continue;

    if (typeof v === "object") {
      const { op, value } = v as { op?: string; value?: unknown };
      // An operator with no operand filters nothing; keeping it in the URL just
      // makes the loader re-fetch for a predicate that cannot match.
      if (value == null || String(value).trim() === "") continue;
      parts.push(op ? `${f.id}:${op}:${value}` : `${f.id}:${value}`);
      continue;
    }

    if (String(v).trim() === "") continue;
    parts.push(`${f.id}:${v}`);
  }
  return parts.join(",");
}

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  if (value) params.set(key, value);
  else params.delete(key);
}

export function UrlDataTable<TRow extends Record<string, unknown>>({
  columns,
  rows,
  params,
  onParamsChange,
  search = false,
  searchPlaceholder = "Search…",
  filters,
  actions,
  actionsLabel = "Actions",
  page = 1,
  pageCount = 1,
  pageSize,
  totalCount,
  emptyMessage,
  loading,
  paramNames,
  className,
}: UrlDataTableProps<TRow>) {
  const names = { ...DEFAULT_PARAMS, ...paramNames };

  const sorting = React.useMemo(
    () => parseSortParam(params.get(names.sort)),
    [params, names.sort],
  );

  const urlFilters = params.get(names.filters) ?? "";
  const urlSearch = params.get(names.search) ?? "";

  /**
   * Text inputs are drafted locally and pushed to the URL on a timer.
   *
   * Committing per keystroke means a navigation per keystroke: the loader
   * re-runs, the tree re-renders, and the input you are typing into is
   * remounted mid-word. It reads as "typing doesn't work" — characters land,
   * then vanish. Sorting and pagination stay immediate; they are single
   * discrete actions and there is nothing to coalesce.
   *
   * The URL stays the source of truth: whenever it changes underneath (back
   * button, a link, another control committing) the draft resyncs to it.
   */
  const [searchDraft, setSearchDraft] = React.useState(urlSearch);
  const [filtersDraft, setFiltersDraft] = React.useState<ColumnFiltersState>(() =>
    parseFilterParam(urlFilters),
  );

  React.useEffect(() => setSearchDraft(urlSearch), [urlSearch]);
  React.useEffect(() => setFiltersDraft(parseFilterParam(urlFilters)), [urlFilters]);

  /**
   * Every mutation resets to page 1 unless it IS a page change. Without that,
   * filtering while on page 7 of 7 asks the server for page 7 of a result set
   * that now has two pages and the user gets an empty table — the single most
   * common bug in hand-rolled versions of this.
   */
  const commit = React.useCallback(
    (mutate: (next: URLSearchParams) => void, opts?: { keepPage?: boolean }) => {
      const next = new URLSearchParams(params);
      mutate(next);
      if (!opts?.keepPage) next.delete(names.page);
      onParamsChange(next);
    },
    [params, onParamsChange, names.page],
  );

  const handleSortingChange = React.useCallback(
    (state: SortingState) =>
      commit((next) => setOrDelete(next, names.sort, serializeSortParam(state))),
    [commit, names.sort],
  );

  React.useEffect(() => {
    if (searchDraft.trim() === urlSearch) return;
    const t = setTimeout(
      () => commit((next) => setOrDelete(next, names.search, searchDraft.trim())),
      DEBOUNCE_MS,
    );
    return () => clearTimeout(t);
  }, [searchDraft, urlSearch, commit, names.search]);

  React.useEffect(() => {
    const serialized = serializeFilterParam(filtersDraft);
    if (serialized === urlFilters) return;
    const t = setTimeout(
      () => commit((next) => setOrDelete(next, names.filters, serialized)),
      DEBOUNCE_MS,
    );
    return () => clearTimeout(t);
  }, [filtersDraft, urlFilters, commit, names.filters]);

  const handlePageChange = React.useCallback(
    (pageIndex: number) =>
      commit((next) => setOrDelete(next, names.page, String(pageIndex + 1)), {
        keepPage: true,
      }),
    [commit, names.page],
  );

  const handleDropdownFilter = React.useCallback((key: string, value: string) => {
    setFiltersDraft((prev) => {
      const rest = prev.filter((f) => f.id !== key);
      return value ? [...rest, { id: key, value }] : rest;
    });
  }, []);

  const tableColumns = React.useMemo<ColumnDef<TRow, unknown>[]>(() => {
    const defs: ColumnDef<TRow, unknown>[] = columns.map((col) => ({
      id: col.key,
      accessorKey: col.key,
      header: col.label,
      size: col.width,
      enableSorting: !!col.sort,
      enableColumnFilter: !!col.search,
      cell: (info) => {
        const row = info.row.original;
        if (col.render) return col.render(row);

        const value = row[col.key];

        // A cell value may already be rendered content rather than data — a
        // status pill, a link, an icon. Coercing that with String() yields
        // "[object Object]", so anything renderable passes straight through.
        if (React.isValidElement(value)) return value;

        // A boolean column is a state, not a value: rendering `false` as empty
        // makes "no" indistinguishable from "not answered".
        if (typeof value === "boolean") {
          return value ? (
            <span className="zen-font-medium zen-text-zen-success">Yes</span>
          ) : (
            <span className="zen-text-zen-muted-fg">No</span>
          );
        }

        if (value == null || value === "") {
          return <span className="zen-text-zen-muted-fg">—</span>;
        }

        if (col.isDate) {
          const d = new Date(value as string | number | Date);
          return Number.isNaN(d.getTime()) ? String(value) : d.toDateString();
        }

        if (col.highlight) return <Badge variant="soft">{String(value)}</Badge>;

        return String(value);
      },
    }));

    if (actions) {
      defs.push({
        id: "__actions",
        header: () => <div className="zen-text-center">{actionsLabel}</div>,
        enableSorting: false,
        enableColumnFilter: false,
        cell: (info) => (
          <div className="zen-whitespace-nowrap zen-text-center">
            {actions(info.row.original)}
          </div>
        ),
      });
    }

    return defs;
  }, [columns, actions, actionsLabel]);

  const hasPerColumnFilters = columns.some((c) => c.search);
  const hasSortableColumn = columns.some((c) => c.sort);

  return (
    <div className={cn("zen-flex zen-flex-col zen-gap-3", className)}>
      {filters && filters.length > 0 && (
        <div className="zen-flex zen-flex-wrap zen-items-center zen-gap-2">
          {filters.map((filter) => {
            const current =
              filtersDraft.find((f) => f.id === filter.key)?.value ?? "";
            return (
              <label key={filter.key} className="zen-flex zen-items-center zen-gap-1.5">
                <span className="zen-sr-only">{filter.label}</span>
                <select
                  className={cn(
                    "zen-h-9 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background",
                    "zen-px-2 zen-text-sm zen-text-zen-foreground",
                    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                  )}
                  value={String(current)}
                  onChange={(e) => handleDropdownFilter(filter.key, e.target.value)}
                >
                  <option value="">{filter.label}</option>
                  {filter.values.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
        </div>
      )}

      <DataTable<TRow, unknown>
        data={rows}
        columns={tableColumns}
        /* The server has already sorted, filtered and sliced. Running the
           client row models over the page again would reorder a partial
           result and quietly contradict the URL. */
        manualSorting
        manualFiltering
        manualPagination={{
          pageIndex: Math.max(0, page - 1),
          pageCount: Math.max(1, pageCount),
          pageSize,
          onPageChange: handlePageChange,
        }}
        enableSorting={hasSortableColumn}
        enableMultiSort={hasSortableColumn}
        enablePagination
        enableColumnFilters={hasPerColumnFilters}
        enablePerColumnFilters={hasPerColumnFilters}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        columnFilters={filtersDraft}
        onColumnFiltersChange={setFiltersDraft}
        globalFilter={search ? searchDraft : undefined}
        onGlobalFilterChange={search ? setSearchDraft : undefined}
        globalFilterPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        loading={loading}
      />

      {typeof totalCount === "number" && (
        <p className="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
          Showing {rows.length} of {totalCount}
        </p>
      )}
    </div>
  );
}
