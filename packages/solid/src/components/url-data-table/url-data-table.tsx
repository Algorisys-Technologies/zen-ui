import { type JSX, For, Show, createMemo } from "solid-js";
import type { ColumnDef, ColumnFiltersState, SortingState } from "@tanstack/solid-table";
import { cn } from "../../lib/cn";
import { Badge } from "../badge/badge";
import { DataTable } from "../data-table/data-table";

/**
 * UrlDataTable — a DataTable whose entire state lives in the URL.
 *
 * See the React binding for the full rationale; the short version is that
 * DataTable already speaks `manualSorting` / `manualFiltering` /
 * `manualPagination` but has no opinion about WHERE that state lives, so every
 * server-paginated app rebuilds the same querystring layer and each copy drifts.
 *
 * It owns no state: `params` in, `onParamsChange` out, and nothing here imports
 * a router — the caller wires whatever it has. The wire format is deliberately
 * readable, because these URLs get pasted into tickets:
 *
 *   ?sort=name:asc,createdAt:desc&filters=status:active&search=acme&page=2
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
  render?: (row: TRow) => JSX.Element;
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
  actions?: (row: TRow) => JSX.Element;
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
  class?: string;
}

const DEFAULT_PARAMS: Required<UrlDataTableParamNames> = {
  sort: "sort",
  filters: "filters",
  search: "search",
  page: "page",
};

/* ── wire format ──────────────────────────────────────────────────────────
 * Kept byte-identical to the React binding: the same URL has to mean the same
 * table in either, or a link stops being portable between two apps that share
 * a backend. */

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

export function parseFilterParam(raw: string | null): ColumnFiltersState {
  if (!raw) return [];
  const out: ColumnFiltersState = [];
  for (const part of raw.split(",")) {
    // Only the FIRST colon separates key from value, so values may contain one.
    const i = part.indexOf(":");
    if (i <= 0) continue;
    const id = part.slice(0, i);
    const value = part.slice(i + 1);
    if (id && value) out.push({ id, value });
  }
  return out;
}

export function serializeFilterParam(filters: ColumnFiltersState): string {
  return filters
    .filter((f) => f.value != null && String(f.value).trim() !== "")
    .map((f) => `${f.id}:${String(f.value)}`)
    .join(",");
}

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  if (value) params.set(key, value);
  else params.delete(key);
}

export function UrlDataTable<TRow extends Record<string, unknown>>(
  props: UrlDataTableProps<TRow>,
) {
  const names = createMemo(() => ({ ...DEFAULT_PARAMS, ...props.paramNames }));

  const sorting = createMemo(() => parseSortParam(props.params.get(names().sort)));
  const columnFilters = createMemo(() =>
    parseFilterParam(props.params.get(names().filters)),
  );
  const globalFilter = createMemo(() => props.params.get(names().search) ?? "");

  /**
   * Every mutation resets to page 1 unless it IS a page change. Without that,
   * filtering while on page 7 of 7 asks the server for page 7 of a result set
   * that now has two pages and the user gets an empty table.
   */
  const commit = (
    mutate: (next: URLSearchParams) => void,
    opts?: { keepPage?: boolean },
  ) => {
    const next = new URLSearchParams(props.params);
    mutate(next);
    if (!opts?.keepPage) next.delete(names().page);
    props.onParamsChange(next);
  };

  const handleDropdownFilter = (key: string, value: string) =>
    commit((next) => {
      const current = parseFilterParam(next.get(names().filters)).filter(
        (f) => f.id !== key,
      );
      if (value) current.push({ id: key, value });
      setOrDelete(next, names().filters, serializeFilterParam(current));
    });

  const tableColumns = createMemo<ColumnDef<TRow, unknown>[]>(() => {
    const defs: ColumnDef<TRow, unknown>[] = props.columns.map((col) => ({
      id: col.key,
      accessorKey: col.key,
      header: col.label,
      size: col.width,
      enableSorting: !!col.sort,
      enableColumnFilter: !!col.search,
      cell: (info: any) => {
        const row = info.row.original as TRow;
        if (col.render) return col.render(row);

        const value = row[col.key];

        // A boolean column is a state, not a value: rendering `false` as empty
        // makes "no" indistinguishable from "not answered".
        if (typeof value === "boolean") {
          return value ? (
            <span class="zen-font-medium zen-text-zen-success">Yes</span>
          ) : (
            <span class="zen-text-zen-muted-fg">No</span>
          );
        }

        if (value == null || value === "") {
          return <span class="zen-text-zen-muted-fg">—</span>;
        }

        if (col.isDate) {
          const d = new Date(value as string | number | Date);
          return Number.isNaN(d.getTime()) ? String(value) : d.toDateString();
        }

        if (col.highlight) return <Badge variant="soft">{String(value)}</Badge>;

        return String(value);
      },
    }));

    if (props.actions) {
      defs.push({
        id: "__actions",
        header: () => <div class="zen-text-center">{props.actionsLabel ?? "Actions"}</div>,
        enableSorting: false,
        enableColumnFilter: false,
        cell: (info: any) => (
          <div class="zen-whitespace-nowrap zen-text-center">
            {props.actions!(info.row.original as TRow)}
          </div>
        ),
      });
    }

    return defs;
  });

  const hasPerColumnFilters = createMemo(() => props.columns.some((c) => c.search));
  const hasSortableColumn = createMemo(() => props.columns.some((c) => c.sort));

  return (
    <div class={cn("zen-flex zen-flex-col zen-gap-3", props.class)}>
      <Show when={props.filters && props.filters.length > 0}>
        <div class="zen-flex zen-flex-wrap zen-items-center zen-gap-2">
          <For each={props.filters}>
            {(filter) => (
              <label class="zen-flex zen-items-center zen-gap-1.5">
                <span class="zen-sr-only">{filter.label}</span>
                <select
                  class={cn(
                    "zen-h-9 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background",
                    "zen-px-2 zen-text-sm zen-text-zen-foreground",
                    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                  )}
                  value={String(
                    columnFilters().find((f) => f.id === filter.key)?.value ?? "",
                  )}
                  onChange={(e) =>
                    handleDropdownFilter(filter.key, e.currentTarget.value)
                  }
                >
                  <option value="">{filter.label}</option>
                  <For each={filter.values}>
                    {(opt) => <option value={opt.value}>{opt.label}</option>}
                  </For>
                </select>
              </label>
            )}
          </For>
        </div>
      </Show>

      <DataTable<TRow, unknown>
        data={props.rows}
        columns={tableColumns()}
        /* The server has already sorted, filtered and sliced. Running the
           client row models over the page again would reorder a partial
           result and quietly contradict the URL. */
        manualSorting
        manualFiltering
        manualPagination={{
          pageIndex: Math.max(0, (props.page ?? 1) - 1),
          pageCount: Math.max(1, props.pageCount ?? 1),
          pageSize: props.pageSize,
          onPageChange: (pageIndex: number) =>
            commit((next) => setOrDelete(next, names().page, String(pageIndex + 1)), {
              keepPage: true,
            }),
        }}
        enableSorting={hasSortableColumn()}
        enableMultiSort={hasSortableColumn()}
        enablePagination
        enableColumnFilters={hasPerColumnFilters()}
        enablePerColumnFilters={hasPerColumnFilters()}
        sorting={sorting()}
        onSortingChange={(state) =>
          commit((next) => setOrDelete(next, names().sort, serializeSortParam(state)))
        }
        columnFilters={columnFilters()}
        onColumnFiltersChange={(state) =>
          commit((next) =>
            setOrDelete(next, names().filters, serializeFilterParam(state)),
          )
        }
        globalFilter={props.search ? globalFilter() : undefined}
        onGlobalFilterChange={
          props.search
            ? (value: string) =>
                commit((next) => setOrDelete(next, names().search, value.trim()))
            : undefined
        }
        globalFilterPlaceholder={props.searchPlaceholder ?? "Search…"}
        emptyMessage={props.emptyMessage}
        loading={props.loading}
      />

      <Show when={typeof props.totalCount === "number"}>
        <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
          Showing {props.rows.length} of {props.totalCount}
        </p>
      </Show>
    </div>
  );
}
