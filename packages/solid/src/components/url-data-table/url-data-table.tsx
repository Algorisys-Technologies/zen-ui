import { type JSX, For, Show, createMemo } from "solid-js";
import type {
  CellContext,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/solid-table";
import { cn } from "../../lib/cn";
import { Badge } from "../badge/badge";
import { DataTable } from "../data-table/data-table";
import { Search } from "../form/search/search";

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

  /*
   * Every mutator below reads `names()` inside the callback handed to `commit`,
   * and `solid/reactivity` flags each one as reactivity outside a tracked scope.
   * It is a false positive of the shape CLAUDE.md already records for
   * tree-table: `commit` invokes the mutator SYNCHRONOUSLY, and every caller is
   * an event handler, so the read is a snapshot at event time — which is what a
   * URL mutation wants. Deferring it would be the bug.
   */
  const handleDropdownFilter = (key: string, value: string) =>
    // eslint-disable-next-line solid/reactivity
    commit((next) => {
      const current = parseFilterParam(next.get(names().filters)).filter(
        (f) => f.id !== key,
      );
      if (value) current.push({ id: key, value });
      setOrDelete(next, names().filters, serializeFilterParam(current));
    });

  /*
   * eslint-disable solid/components-return-once -- these are TanStack ColumnDef
   * renderers, not Solid components. A `cell` renderer is a plain function
   * TanStack calls per render via flexRender, so an early return is how you
   * branch on the cell's VALUE; the rule cannot tell it from a component,
   * because both are "a function returning JSX". Same false positive, and same
   * remedy, as the `solid/no-destructure` block around DataTable's column
   * factory. Scoped to this factory and re-enabled straight after.
   */
  /* eslint-disable solid/components-return-once */
  const tableColumns = createMemo<ColumnDef<TRow, unknown>[]>(() => {
    const defs: ColumnDef<TRow, unknown>[] = props.columns.map((col) => ({
      id: col.key,
      accessorKey: col.key,
      header: col.label,
      size: col.width,
      enableSorting: !!col.sort,
      enableColumnFilter: !!col.search,
      cell: (info: CellContext<TRow, unknown>) => {
        const row = info.row.original;
        if (col.render) return col.render(row);

        const value = row[col.key];

        // A cell value may already be rendered content rather than data — a
        // status pill, a link, an icon. Coercing that with String() yields
        // "[object Object]", so anything renderable passes straight through.
        if (value instanceof Node || typeof value === "function") return value as JSX.Element;

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
        cell: (info: CellContext<TRow, unknown>) => (
          <div class="zen-whitespace-nowrap zen-text-center">
            {props.actions!(info.row.original)}
          </div>
        ),
      });
    }

    return defs;
  });
  /* eslint-enable solid/components-return-once */

  const hasPerColumnFilters = createMemo(() => props.columns.some((c) => c.search));
  const hasSortableColumn = createMemo(() => props.columns.some((c) => c.sort));

  /*
   * eslint-disable solid/reactivity -- every handler below hands `commit` a
   * mutator that reads `names()`. Same false positive as `handleDropdownFilter`
   * above: `commit` runs the mutator synchronously and the caller is always an
   * event handler, so the read is a snapshot taken at event time, which is
   * exactly what writing a URL wants. A block rather than five line directives
   * because these sit in JSX ATTRIBUTE position, where a line comment cannot be
   * placed on the line before the one reported. Scoped to the return and
   * re-enabled after it.
   */
  /* eslint-disable solid/reactivity */
  return (
    <div class={cn("zen-flex zen-flex-col zen-gap-3", props.class)}>
      {/* One toolbar row, owned here — see the React binding for why DataTable
          is not given a global filter. `zen-p-px` keeps the focus ring, which is
          drawn outside the control's box, from being clipped by the block above. */}
      <Show when={props.search || (props.filters && props.filters.length > 0)}>
        <div class="zen-flex zen-flex-wrap zen-items-center zen-gap-2 zen-p-px">
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
          <Show when={props.search}>
            <Search
              value={globalFilter()}
              onValueChange={(v: string) =>
                commit((next) => setOrDelete(next, names().search, v.trim()))
              }
              onClear={() =>
                commit((next) => setOrDelete(next, names().search, ""))
              }
              placeholder={props.searchPlaceholder ?? "Search…"}
              class="zen-w-64"
            />
          </Show>
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
        /* Off deliberately — see the React binding. */
        enableColumnFilters={false}
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
  /* eslint-enable solid/reactivity */
}
