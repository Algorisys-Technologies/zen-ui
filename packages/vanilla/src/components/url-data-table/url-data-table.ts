import { cn } from "../../lib/cn";
import {
  Disposer,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import {
  DataTable,
  type DataTableCellContext,
  type DataTableColumn,
  type SortingState,
} from "../data-table/data-table";

/**
 * UrlDataTable — a DataTable whose entire state lives in the URL.
 *
 * See the React binding for the full rationale. DataTable already speaks
 * `manualPagination` and controlled `sorting` / `globalFilter`, but has no
 * opinion about WHERE that state lives, so every server-paginated app rebuilds
 * the same querystring layer and each copy drifts.
 *
 * `params` in, `onParamsChange` out; nothing here touches `window.location`, so
 * the caller keeps ownership of history and routing.
 *
 *   ?sort=name:asc,createdAt:desc&filters=status:active&search=acme&page=2
 *
 * BINDING DIVERGENCE — per-column filters. React and Solid render a filter row
 * under the header, driven by TanStack's `columnFilters`. Vanilla's DataTable
 * has no column-filter model, so `column.search` is accepted and ignored here
 * and only the toolbar dropdowns (`filters`) and global `search` write to the
 * `filters` / `search` params. The wire format is identical either way, so a
 * URL produced by the React binding still loads correctly in this one — it just
 * cannot be authored from a column header.
 */

export interface UrlDataTableColumn<TRow> {
  /** Key into each row, and the id used in the URL. */
  key: string;
  label: string;
  /** Show a sort control on this header. Tri-state: asc, desc, off. */
  sort?: boolean;
  /** Accepted for parity; ignored in this binding — see the note above. */
  search?: boolean;
  /** Render the value with `toDateString()`. Ignored when `render` is given. */
  isDate?: boolean;
  /** Render the value inside a badge-styled span. Ignored when `render` is given. */
  highlight?: boolean;
  /** Full control over the cell. Wins over isDate / highlight. */
  render?: (row: TRow) => Child;
  /** Column width hint. */
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

  search?: boolean;
  searchPlaceholder?: string;
  filters?: UrlDataTableFilter[];

  actions?: (row: TRow) => Child;
  actionsLabel?: string;

  /** 1-based, to match the way page numbers appear in a URL. */
  page?: number;
  pageCount?: number;
  pageSize?: number;
  totalCount?: number;

  emptyMessage?: string;
  loading?: boolean;
  paramNames?: UrlDataTableParamNames;
  class?: string;
  id?: string;
}

const DEFAULT_PARAMS: Required<UrlDataTableParamNames> = {
  sort: "sort",
  filters: "filters",
  search: "search",
  page: "page",
};

/* ── wire format ─────────────────────────────────────────────────────────
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

export function parseFilterParam(
  raw: string | null,
): Array<{ id: string; value: unknown }> {
  if (!raw) return [];
  const out: Array<{ id: string; value: unknown }> = [];
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

export function serializeFilterParam(
  filters: Array<{ id: string; value: unknown }>,
): string {
  const parts: string[] = [];
  for (const f of filters) {
    const v = f.value;
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

function el(tag: string, className?: string): HTMLElement {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

/* ----------------------------------------------------------------- factory */

export function UrlDataTable<TRow extends Record<string, unknown>>(
  props: UrlDataTableProps<TRow>,
): ZenComponent<UrlDataTableProps<TRow>> {
  let current: UrlDataTableProps<TRow> = { ...props };
  const disposer = new Disposer();

  const root = el("div", cn("zen-flex zen-flex-col zen-gap-3", current.class));
  if (current.id) root.id = current.id;

  const filterBar = el("div", "zen-flex zen-flex-wrap zen-items-center zen-gap-2");
  const tableHost = el("div");
  const footer = el("div", "zen-text-xs zen-text-zen-muted-fg");
  root.append(filterBar, tableHost, footer);

  const names = () => ({ ...DEFAULT_PARAMS, ...current.paramNames });

  /**
   * Every mutation resets to page 1 unless it IS a page change. Without that,
   * filtering while on page 7 of 7 asks the server for page 7 of a result set
   * that now has two pages and the user gets an empty table.
   */
  const commit = (
    mutate: (next: URLSearchParams) => void,
    opts?: { keepPage?: boolean },
  ) => {
    const next = new URLSearchParams(current.params);
    mutate(next);
    if (!opts?.keepPage) next.delete(names().page);
    current.onParamsChange(next);
  };

  const buildColumns = (): DataTableColumn<TRow>[] => {
    const defs: DataTableColumn<TRow>[] = current.columns.map((col) => ({
      id: col.key,
      accessorKey: col.key,
      header: col.label,
      size: col.width,
      enableSorting: !!col.sort,
      cell: (info: DataTableCellContext<TRow>): Child => {
        const row = info.row;
        if (col.render) return col.render(row);

        const value = info.value;

        // A cell value may already be rendered content rather than data — a
        // status pill, a link, an icon. Coercing that with String() yields
        // "[object Object]", so anything renderable passes straight through.
        if (value instanceof Node) return value as Child;

        // A boolean column is a state, not a value: rendering `false` as empty
        // makes "no" indistinguishable from "not answered".
        if (typeof value === "boolean") {
          const span = el(
            "span",
            value
              ? "zen-font-medium zen-text-zen-success"
              : "zen-text-zen-muted-fg",
          );
          span.textContent = value ? "Yes" : "No";
          return span;
        }

        if (value == null || value === "") {
          const span = el("span", "zen-text-zen-muted-fg");
          span.textContent = "—";
          return span;
        }

        if (col.isDate) {
          const d = new Date(value as string | number | Date);
          return Number.isNaN(d.getTime()) ? String(value) : d.toDateString();
        }

        if (col.highlight) {
          const span = el(
            "span",
            "zen-inline-flex zen-items-center zen-rounded-zen-md zen-bg-zen-primary-soft zen-px-2 zen-py-0.5 zen-text-xs zen-text-zen-primary-soft-fg",
          );
          span.textContent = String(value);
          return span;
        }

        return String(value);
      },
    }));

    if (current.actions) {
      defs.push({
        id: "__actions",
        header: current.actionsLabel ?? "Actions",
        enableSorting: false,
        cell: (info: DataTableCellContext<TRow>): Child => {
          const wrap = el("div", "zen-whitespace-nowrap zen-text-center");
          const rendered = current.actions!(info.row);
          if (rendered instanceof Node) wrap.append(rendered);
          else if (rendered != null && rendered !== false) wrap.textContent = String(rendered);
          return wrap;
        },
      });
    }

    return defs;
  };

  const table = DataTable<TRow>({
    data: current.rows,
    columns: buildColumns(),
    /* The server has already sorted and sliced. Re-running the client models
       over one page would reorder a partial result and contradict the URL. */
    enableSorting: current.columns.some((c) => c.sort),
    enablePagination: true,
    sorting: parseSortParam(current.params.get(names().sort)),
    onSortingChange: (state) =>
      commit((next) => setOrDelete(next, names().sort, serializeSortParam(state))),
    globalFilter: current.search
      ? current.params.get(names().search) ?? ""
      : undefined,
    onGlobalFilterChange: current.search
      ? (value: string) =>
          commit((next) => setOrDelete(next, names().search, value.trim()))
      : undefined,
    globalFilterPlaceholder: current.searchPlaceholder ?? "Search…",
    manualPagination: {
      pageIndex: Math.max(0, (current.page ?? 1) - 1),
      pageCount: Math.max(1, current.pageCount ?? 1),
      pageSize: current.pageSize,
      onPageChange: (pageIndex: number) =>
        commit((next) => setOrDelete(next, names().page, String(pageIndex + 1)), {
          keepPage: true,
        }),
    },
    emptyMessage: current.emptyMessage,
    loading: current.loading,
  });
  tableHost.append(table.el);

  const renderFilters = () => {
    filterBar.replaceChildren();
    const active = parseFilterParam(current.params.get(names().filters));
    for (const filter of current.filters ?? []) {
      const label = el("label", "zen-flex zen-items-center zen-gap-1.5");
      const sr = el("span", "zen-sr-only");
      sr.textContent = filter.label;

      const select = document.createElement("select");
      select.className = cn(
        "zen-h-9 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background",
        "zen-px-2 zen-text-sm zen-text-zen-foreground",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      );

      const none = document.createElement("option");
      none.value = "";
      none.textContent = filter.label;
      select.append(none);

      for (const opt of filter.values) {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        select.append(option);
      }

      select.value = String(active.find((f) => f.id === filter.key)?.value ?? "");

      const onChange = () =>
        commit((next) => {
          const rest = parseFilterParam(next.get(names().filters)).filter(
            (f) => f.id !== filter.key,
          );
          if (select.value) rest.push({ id: filter.key, value: select.value });
          setOrDelete(next, names().filters, serializeFilterParam(rest));
        });

      select.addEventListener("change", onChange);
      disposer.add(() => select.removeEventListener("change", onChange));

      label.append(sr, select);
      filterBar.append(label);
    }
    filterBar.hidden = (current.filters ?? []).length === 0;
  };

  const renderFooter = () => {
    if (typeof current.totalCount === "number") {
      footer.hidden = false;
      footer.textContent = `Showing ${current.rows.length} of ${current.totalCount}`;
    } else {
      footer.hidden = true;
      footer.textContent = "";
    }
  };

  const sync = () => {
    table.update({
      data: current.rows,
      columns: buildColumns(),
      sorting: parseSortParam(current.params.get(names().sort)),
      globalFilter: current.search
        ? current.params.get(names().search) ?? ""
        : undefined,
      manualPagination: {
        pageIndex: Math.max(0, (current.page ?? 1) - 1),
        pageCount: Math.max(1, current.pageCount ?? 1),
        pageSize: current.pageSize,
        onPageChange: (pageIndex: number) =>
          commit((next) => setOrDelete(next, names().page, String(pageIndex + 1)), {
            keepPage: true,
          }),
      },
      emptyMessage: current.emptyMessage,
      loading: current.loading,
    });
    renderFilters();
    renderFooter();
  };

  renderFilters();
  renderFooter();

  return {
    el: root,
    update(next: Partial<UrlDataTableProps<TRow>>) {
      current = { ...current, ...next };
      root.className = cn("zen-flex zen-flex-col zen-gap-3", current.class);
      sync();
    },
    destroy() {
      disposer.dispose();
      table.destroy();
      root.remove();
    },
  };
}
