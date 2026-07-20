import { cn } from "../../lib/cn";
import { Disposer, toNodes, type BaseProps, type Child, type ZenComponent } from "../../lib/component";
import { Checkbox } from "../form/checkbox/checkbox";
import { Button } from "../button/button";
import { Input, type InputHandle } from "../form/input/input";
import { Icon } from "../icon/icon";
import { arrowStep } from "@algorisys/zen-ui-core";

/**
 * TreeTable — a table whose rows form a hierarchy.
 *
 *   TreeTable({ data: accounts, columns }).el
 *
 * Vanilla port of the React/Solid bindings. Those two sit on
 * `@tanstack/*-table`, which this binding cannot import (no new runtime deps —
 * the same constraint DataTable is written under), so the hierarchy layer is
 * hand-written here: the visible-row flatten, the ancestor-preserving filter,
 * the sibling-scoped sort and the subtree selection maths. The API and the
 * behaviour are the same; only the engine differs.
 *
 * Like DataTable, it is data-driven rather than compound: callers pass a
 * `TreeTableColumn[]`, and children come from `row.children` unless `getSubRows`
 * says otherwise.
 */

export interface TreeTableCellContext<TData> {
  row: TData;
  value: unknown;
  depth: number;
}

export interface TreeTableColumn<TData> {
  /** Stable column id. Defaults to `accessorKey`. */
  id?: string;
  /** Key on the row datum this column reads. */
  accessorKey?: string;
  header?: string;
  /** Custom cell renderer. Defaults to the accessor value as text. */
  cell?: (info: TreeTableCellContext<TData>) => Child;
  enableSorting?: boolean;
  size?: number;
  sortingFn?: (a: TData, b: TData) => number;
}

export interface TreeTableProps<TData> extends BaseProps {
  data: TData[];
  columns: TreeTableColumn<TData>[];
  /** Where a row's children live. Defaults to `row.children`. */
  getSubRows?: (row: TData) => TData[] | undefined;
  /** Stable id per row. Defaults to `row.id`, else the materialised path. */
  getRowId?: (row: TData) => string;

  /** Ids open on first render, or `true` for all. */
  defaultExpanded?: string[] | true;
  onExpandedChange?: (ids: string[]) => void;
  /** Show the expand-all / collapse-all control. Default true. */
  enableExpandAll?: boolean;

  enableSorting?: boolean;
  enableGlobalFilter?: boolean;
  globalFilterPlaceholder?: string;

  enableRowSelection?: boolean;
  /** Selecting a parent selects its descendants. Default true. */
  enableSubRowSelection?: boolean;
  onRowSelectionChange?: (ids: string[]) => void;

  /** Which column carries the chevron. Defaults to the first column. */
  hierarchyColumnId?: string;
  /** Pixels of indent per level. Default 20. */
  indent?: number;
  stickyHeader?: boolean;
  headerVariant?: "plain" | "underline" | "branded";
  maxBodyHeight?: number;
  onRowClick?: (row: TData) => void;
  emptyMessage?: string;
  loading?: boolean;
}

/** One row of the flattened, currently-visible tree. */
interface FlatRow<TData> {
  id: string;
  data: TData;
  depth: number;
  parentId: string | null;
  children: FlatRow<TData>[];
  /** 1-based position among its siblings, for aria-posinset. */
  pos: number;
  setSize: number;
}

const columnId = <TData,>(c: TreeTableColumn<TData>, i: number) => c.id ?? c.accessorKey ?? `col-${i}`;
const readValue = <TData,>(row: TData, c: TreeTableColumn<TData>): unknown =>
  c.accessorKey ? (row as Record<string, unknown>)[c.accessorKey] : undefined;

const defaultCompare = (a: unknown, b: unknown): number => {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a ?? "").localeCompare(String(b ?? ""));
};

export function TreeTable<TData>(props: TreeTableProps<TData>): ZenComponent<TreeTableProps<TData>> {
  let current = { ...props };
  const disposer = new Disposer();

  const kids = (row: TData): TData[] =>
    (current.getSubRows ? current.getSubRows(row) : (row as { children?: TData[] }).children) ?? [];

  const idOf = (row: TData, path: string): string =>
    current.getRowId ? current.getRowId(row) : ((row as { id?: string }).id ?? path);

  /* ---- state ---- */
  const expanded = new Set<string>();
  const selected = new Set<string>();
  let expandAllSeed = current.defaultExpanded === true;
  if (Array.isArray(current.defaultExpanded)) for (const id of current.defaultExpanded) expanded.add(id);
  let sortColumn: string | null = null;
  let sortDesc = false;
  let query = "";
  let focusedId: string | null = null;

  /* Every id in the source tree, so expand-all and the subtree maths do not
   * have to re-walk from the caller's data each time. */
  const allIds = () => {
    const out: string[] = [];
    const walk = (rows: TData[], prefix: string) =>
      rows.forEach((r, i) => {
        const id = idOf(r, `${prefix}${i}`);
        const ks = kids(r);
        if (ks.length) {
          out.push(id);
          walk(ks, `${id}.`);
        }
      });
    walk(current.data ?? [], "");
    return out;
  };

  const descendantIds = (row: TData, path: string): string[] => {
    const out: string[] = [];
    const walk = (r: TData, p: string) => {
      const id = idOf(r, p);
      out.push(id);
      kids(r).forEach((c, i) => walk(c, `${id}.${i}`));
    };
    walk(row, path);
    return out;
  };

  /*
   * Filter from the leaves up: a node survives if it matches OR any descendant
   * does, and it keeps only the surviving branch beneath it. Dropping rows that
   * do not match themselves would strand a deep hit with no path above it —
   * "APAC" would render alone, without Go to market > Sales.
   */
  const matches = (row: TData): boolean => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (current.columns ?? []).some((c) => String(readValue(row, c) ?? "").toLowerCase().includes(q));
  };

  const filterTree = (rows: TData[]): TData[] => {
    if (!query) return rows;
    const out: TData[] = [];
    for (const row of rows) {
      const keptKids = filterTree(kids(row));
      if (matches(row) || keptKids.length) {
        out.push(keptKids.length ? ({ ...row, __kids: keptKids } as TData) : row);
      }
    }
    return out;
  };
  /* filterTree stashes the surviving children on a private key so the walk below
   * reads them instead of the caller's, without mutating the caller's data. */
  const effectiveKids = (row: TData): TData[] => {
    const stashed = (row as { __kids?: TData[] }).__kids;
    return stashed ?? kids(row);
  };

  /* Sorting is per-parent. A child outranking its parent would have to render
   * somewhere it does not belong, so the comparator never crosses a level. */
  const sortSiblings = (rows: TData[]): TData[] => {
    if (!sortColumn || !current.enableSorting) return rows;
    const col = (current.columns ?? []).find((c, i) => columnId(c, i) === sortColumn);
    if (!col) return rows;
    const cmp = col.sortingFn ?? ((a: TData, b: TData) => defaultCompare(readValue(a, col), readValue(b, col)));
    return [...rows].sort((a, b) => (sortDesc ? -cmp(a, b) : cmp(a, b)));
  };

  /** The visible rows, in render order. */
  const flatten = (): FlatRow<TData>[] => {
    const out: FlatRow<TData>[] = [];
    const walk = (rows: TData[], depth: number, parentId: string | null, prefix: string) => {
      const ordered = sortSiblings(rows);
      ordered.forEach((row, i) => {
        const id = idOf(row, `${prefix}${i}`);
        const node: FlatRow<TData> = {
          id,
          data: row,
          depth,
          parentId,
          children: [],
          pos: i + 1,
          setSize: ordered.length,
        };
        out.push(node);
        const ks = effectiveKids(row);
        // A filter result is expanded implicitly — hiding the match behind a
        // closed chevron would make the search look like it found nothing.
        if (ks.length && (expanded.has(id) || !!query)) walk(ks, depth + 1, id, `${id}.`);
      });
    };
    walk(filterTree(current.data ?? []), 0, null, "");
    return out;
  };

  /* ---- selection maths ---- */
  const cascade = current.enableSubRowSelection !== false;

  const subtreeState = (row: FlatRow<TData>): "checked" | "indeterminate" | "unchecked" => {
    const ids = descendantIds(row.data, row.id).slice(1); // descendants only
    const own = selected.has(row.id);
    if (!ids.length) return own ? "checked" : "unchecked";
    const on = ids.filter((id) => selected.has(id)).length;
    if (own && on === ids.length) return "checked";
    if (own || on > 0) return "indeterminate";
    return "unchecked";
  };

  const toggleRow = (row: FlatRow<TData>, on: boolean) => {
    const ids = cascade ? descendantIds(row.data, row.id) : [row.id];
    for (const id of ids) {
      if (on) selected.add(id);
      else selected.delete(id);
    }
    /*
     * Ancestors are deliberately NOT cleared when a descendant is unticked.
     * They stay in the set and render indeterminate, which is what React and
     * Solid do — TanStack keeps the parent's own entry and only the checkbox
     * derives from the subtree. Clearing them here made vanilla report 7
     * selected where the other two reported 9 for the identical interaction.
     * React is the reference; a count that disagrees across bindings is worse
     * than one that is arguably too generous.
     */
    current.onRowSelectionChange?.([...selected]);
    render();
  };

  /* ---- DOM ---- */
  const root = document.createElement("div");
  root.className = cn("zen-flex zen-w-full zen-flex-col zen-gap-3", current.class);

  const toolbar = document.createElement("div");
  toolbar.className = "zen-flex zen-flex-wrap zen-items-center zen-gap-2";

  const scroller = document.createElement("div");
  scroller.className = "zen-relative zen-w-full zen-overflow-auto";

  const table = document.createElement("table");
  table.setAttribute("role", "treegrid");
  table.className = "zen-w-full zen-caption-bottom zen-text-sm zen-border-collapse";
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  table.append(thead, tbody);
  scroller.append(table);

  let rows: FlatRow<TData>[] = [];
  let searchInput: InputHandle | null = null;
  let expandAllBtn: ReturnType<typeof Button> | null = null;

  const hierarchyId = () =>
    current.hierarchyColumnId ?? columnId((current.columns ?? [])[0] ?? {}, 0);

  const isAllExpanded = () => {
    const ids = allIds();
    return ids.length > 0 && ids.every((id) => expanded.has(id));
  };

  const renderToolbar = () => {
    toolbar.replaceChildren();
    const wantExpandAll = current.enableExpandAll !== false;
    if (!current.enableGlobalFilter && !wantExpandAll) {
      toolbar.style.display = "none";
      return;
    }
    toolbar.style.display = "";

    if (current.enableGlobalFilter) {
      searchInput = Input({
        value: query,
        placeholder: current.globalFilterPlaceholder ?? "Search…",
        class: "zen-max-w-xs",
        "aria-label": "Search",
        onInput: (e: Event) => {
          query = (e.target as HTMLInputElement).value;
          render({ keepFocus: "search" });
        },
      });
      toolbar.append(searchInput.el);
    }

    if (wantExpandAll) {
      const all = isAllExpanded();
      expandAllBtn = Button({
        variant: "outline",
        size: "sm",
        children: [
          Icon({ name: all ? "chevron-down" : "chevron-right", size: 14 }).el,
          document.createTextNode(all ? "Collapse all" : "Expand all"),
        ],
        onClick: () => {
          if (isAllExpanded()) expanded.clear();
          else for (const id of allIds()) expanded.add(id);
          current.onExpandedChange?.([...expanded]);
          render();
        },
      });
      expandAllBtn.el.setAttribute("aria-expanded", String(all));
      toolbar.append(expandAllBtn.el);
    }
  };

  const headerVariantRow = () =>
    current.headerVariant === "branded"
      ? "zen-bg-zen-primary-soft [&>th]:zen-text-zen-primary-soft-fg [&>th]:zen-font-semibold"
      : "";

  const renderHead = () => {
    thead.replaceChildren();
    thead.className = cn(
      "[&_tr]:zen-border-b [&_tr]:zen-border-zen-border",
      current.headerVariant === "underline"
        ? "[&_tr:last-child]:zen-border-b-2 [&_tr:last-child]:zen-border-zen-primary"
        : "",
    );
    const tr = document.createElement("tr");
    tr.className = cn(
      "zen-border-b zen-border-zen-border",
      headerVariantRow(),
      current.stickyHeader
        ? current.headerVariant === "branded"
          ? "zen-sticky zen-top-0 zen-z-10"
          : "zen-sticky zen-top-0 zen-z-10 zen-bg-zen-background"
        : "",
    );

    if (current.enableRowSelection) {
      const th = document.createElement("th");
      th.className = "zen-h-10 zen-px-2 zen-py-2 zen-text-start zen-align-middle";
      th.style.width = "36px";
      const total = rows.length;
      const on = rows.filter((r) => selected.has(r.id)).length;
      th.append(
        Checkbox({
          checked: on === 0 ? false : on === total ? true : "indeterminate",
          onCheckedChange: (v) => {
            if (v === true) for (const r of rows) selected.add(r.id);
            else selected.clear();
            current.onRowSelectionChange?.([...selected]);
            render();
          },
          "aria-label": "Select all rows",
        }).el,
      );
      tr.append(th);
    }

    (current.columns ?? []).forEach((col, i) => {
      const id = columnId(col, i);
      const th = document.createElement("th");
      th.className =
        "zen-h-10 zen-px-2 zen-py-2 zen-text-start zen-align-middle zen-font-medium zen-text-xs zen-text-zen-muted-fg";
      if (col.size) th.style.width = `${col.size}px`;

      const sortable = current.enableSorting && col.enableSorting !== false;
      if (sortable) {
        th.setAttribute(
          "aria-sort",
          sortColumn === id ? (sortDesc ? "descending" : "ascending") : "none",
        );
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className =
          "zen-inline-flex zen-items-center zen-gap-1 zen-border-0 zen-bg-transparent zen-p-0 zen-font-inherit zen-text-inherit zen-cursor-pointer focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring";
        btn.append(document.createTextNode(col.header ?? id));
        if (sortColumn === id) {
          btn.append(Icon({ name: sortDesc ? "chevron-down" : "chevron-up", size: 12 }).el);
        }
        btn.addEventListener("click", () => {
          if (sortColumn === id) sortDesc = !sortDesc;
          else {
            sortColumn = id;
            /*
             * A number column sorts DESCENDING first. That is TanStack's
             * `sortDescFirst` default, so React and Solid do it, and it is the
             * right guess anyway: nobody clicks "Budget" hoping to see the
             * smallest one. Measured before this: vanilla opened on Operations
             * (5.2M) where the other two opened on Engineering (19.4M).
             */
            const firstValue = rows.length ? readValue(rows[0].data, col) : undefined;
            sortDesc = typeof firstValue === "number";
          }
          render();
        });
        th.append(btn);
      } else {
        th.append(document.createTextNode(col.header ?? id));
      }
      tr.append(th);
    });
    thead.append(tr);
  };

  const colCount = () => (current.columns ?? []).length + (current.enableRowSelection ? 1 : 0);

  const renderBody = () => {
    tbody.replaceChildren();
    tbody.className = "[&_tr:last-child]:zen-border-0";

    if (current.loading || rows.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = colCount();
      td.className = "zen-h-24 zen-p-2 zen-text-center zen-align-middle zen-text-zen-muted-fg";
      td.textContent = current.loading ? "Loading…" : (current.emptyMessage ?? "No results.");
      tr.append(td);
      tbody.append(tr);
      return;
    }

    const activeId = focusedId ?? rows[0]?.id;

    for (const row of rows) {
      const tr = document.createElement("tr");
      const state = current.enableRowSelection ? subtreeState(row) : "unchecked";
      tr.className = cn(
        "zen-border-b zen-border-zen-border",
        "zen-transition-[background-color,box-shadow] zen-duration-100",
        "hover:zen-bg-zen-muted/50",
        "data-[state=selected]:zen-bg-zen-primary-soft",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset",
        current.onRowClick && "zen-cursor-pointer",
      );
      if (state === "checked") tr.setAttribute("data-state", "selected");
      tr.setAttribute("data-depth", String(row.depth));
      // aria-level is 1-based; the flatten's depth is 0-based.
      tr.setAttribute("aria-level", String(row.depth + 1));
      tr.setAttribute("aria-posinset", String(row.pos));
      tr.setAttribute("aria-setsize", String(row.setSize));
      const canExpand = effectiveKids(row.data).length > 0;
      if (canExpand) tr.setAttribute("aria-expanded", String(expanded.has(row.id) || !!query));
      if (current.enableRowSelection) tr.setAttribute("aria-selected", String(state === "checked"));
      tr.tabIndex = activeId === row.id ? 0 : -1;
      tr.addEventListener("focus", () => {
        focusedId = row.id;
      });
      tr.addEventListener("keydown", (e) => onRowKeyDown(e, row));
      if (current.onRowClick) tr.addEventListener("click", () => current.onRowClick!(row.data));

      if (current.enableRowSelection) {
        const td = document.createElement("td");
        td.className = "zen-px-2 zen-py-3 zen-align-middle";
        td.append(
          Checkbox({
            checked: state === "checked" ? true : state === "indeterminate" ? "indeterminate" : false,
            onCheckedChange: (v) => toggleRow(row, v === true),
            "aria-label": `Select row ${row.pos}`,
          }).el,
        );
        td.addEventListener("click", (e) => e.stopPropagation());
        tr.append(td);
      }

      (current.columns ?? []).forEach((col, i) => {
        const td = document.createElement("td");
        td.className = "zen-px-2 zen-py-3 zen-align-middle";
        const value = readValue(row.data, col);
        const content = col.cell
          ? toNodes(col.cell({ row: row.data, value, depth: row.depth }))
          : [document.createTextNode(String(value ?? ""))];

        if (columnId(col, i) === hierarchyId()) {
          const wrap = document.createElement("span");
          wrap.className = "zen-flex zen-items-center zen-gap-1";
          // Inline, not a utility: depth is unbounded, so no finite class set
          // can express it. Same reasoning as Tree's indent.
          wrap.style.paddingInlineStart = `${row.depth * (current.indent ?? 20)}px`;
          if (canExpand) {
            const btn = document.createElement("button");
            btn.type = "button";
            // The row handles arrows; this button is the pointer affordance and
            // must not also steal a tab stop from the roving row focus.
            btn.tabIndex = -1;
            btn.setAttribute("aria-hidden", "true");
            btn.className =
              "zen-inline-flex zen-w-4 zen-shrink-0 zen-items-center zen-justify-center zen-border-0 zen-bg-transparent zen-p-0 zen-cursor-pointer zen-text-zen-muted-fg";
            const icon = Icon({
              name: "chevron-right",
              size: 14,
              class: cn("zen-transition-transform", (expanded.has(row.id) || !!query) && "zen-rotate-90"),
            });
            btn.append(icon.el);
            btn.addEventListener("click", (e) => {
              e.stopPropagation();
              toggleExpanded(row);
            });
            wrap.append(btn);
          } else {
            const spacer = document.createElement("span");
            spacer.className = "zen-inline-block zen-w-4 zen-shrink-0";
            wrap.append(spacer);
          }
          wrap.append(...content);
          td.append(wrap);
        } else {
          td.append(...content);
        }
        tr.append(td);
      });

      tbody.append(tr);
    }
  };

  const toggleExpanded = (row: FlatRow<TData>, force?: boolean) => {
    const open = force ?? !expanded.has(row.id);
    if (open) expanded.add(row.id);
    else expanded.delete(row.id);
    current.onExpandedChange?.([...expanded]);
    render({ keepFocus: row.id });
  };

  const focusRow = (id: string | null | undefined) => {
    if (!id) return;
    focusedId = id;
    const i = rows.findIndex((r) => r.id === id);
    (tbody.children[i] as HTMLTableRowElement | undefined)?.focus();
  };

  const moveBy = (row: FlatRow<TData>, delta: number) => {
    const i = rows.findIndex((r) => r.id === row.id);
    focusRow(rows[i + delta]?.id);
  };

  const onRowKeyDown = (e: KeyboardEvent, row: FlatRow<TData>) => {
    const step = arrowStep(e.key, e.currentTarget as Element);
    const canExpand = effectiveKids(row.data).length > 0;
    const isOpen = expanded.has(row.id) || !!query;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveBy(row, 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveBy(row, -1);
    } else if (step === 1) {
      e.preventDefault();
      if (canExpand && !isOpen) toggleExpanded(row, true);
      else if (isOpen) moveBy(row, 1);
    } else if (step === -1) {
      e.preventDefault();
      if (canExpand && isOpen) toggleExpanded(row, false);
      else if (row.parentId) focusRow(row.parentId);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusRow(rows[0]?.id);
    } else if (e.key === "End") {
      e.preventDefault();
      focusRow(rows[rows.length - 1]?.id);
    } else if (e.key === "Enter" || e.key === " ") {
      if (current.onRowClick) {
        e.preventDefault();
        current.onRowClick(row.data);
      } else if (canExpand) {
        e.preventDefault();
        toggleExpanded(row);
      }
    }
  };

  function render(opts?: { keepFocus?: string }) {
    rows = flatten();
    renderToolbar();
    renderHead();
    renderBody();
    scroller.style.maxHeight = current.maxBodyHeight ? `${current.maxBodyHeight}px` : "";
    if (opts?.keepFocus === "search") searchInput?.el.querySelector("input")?.focus();
    else if (opts?.keepFocus) focusRow(opts.keepFocus);
  }

  if (expandAllSeed) {
    for (const id of allIds()) expanded.add(id);
    expandAllSeed = false;
  }
  root.append(toolbar, scroller);
  render();

  return {
    el: root,
    update(next) {
      current = { ...current, ...next };
      root.className = cn("zen-flex zen-w-full zen-flex-col zen-gap-3", current.class);
      render();
    },
    destroy() {
      disposer.dispose();
      root.remove();
    },
  };
}
