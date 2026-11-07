import { jsxs as d, jsx as s, Fragment as Ye } from "react/jsx-runtime";
import * as a from "react";
import { useReactTable as Ze, flexRender as y } from "./index203.js";
import { useVirtualizer as et } from "./index204.js";
import { cn as I } from "./index160.js";
import { arrowStep as tt } from "./index168.js";
import "./index28.js";
import "./index110.js";
import { Table as nt, TableHeader as st, TableRow as _, TableHead as at, TableBody as ot, TableCell as re } from "./index104.js";
import { Checkbox as de } from "./index36.js";
import { Icon as V } from "./index63.js";
import { Input as it } from "./index4.js";
import { Button as K } from "./index71.js";
import { useLocale as lt } from "./index90.js";
import { getFilteredRowModel as rt, getSortedRowModel as dt, getPaginationRowModel as ct, getExpandedRowModel as gt, getCoreRowModel as ut } from "./index214.js";
const ft = (z) => z.children;
function Et({
  data: z,
  columns: R,
  getSubRows: j,
  getRowId: C,
  hasChildren: G,
  loadChildren: m,
  onLoadChildrenError: k,
  expanded: H,
  defaultExpanded: ce,
  onExpandedChange: ge,
  enableExpandAll: B = !0,
  enableSorting: O = !0,
  sorting: U,
  onSortingChange: ue,
  enablePagination: T,
  pageSize: fe = 10,
  pageSizeOptions: W,
  onPaginationChange: pe,
  enableGlobalFilter: E,
  globalFilter: $,
  onGlobalFilterChange: ze,
  globalFilterPlaceholder: me,
  enableRowSelection: b,
  enableSubRowSelection: be = !0,
  rowSelection: q,
  onRowSelectionChange: he,
  hierarchyColumnId: xe,
  indent: ve = 20,
  enableVirtualization: M,
  rowEstimatedHeight: Se = 44,
  stickyHeader: ye,
  headerVariant: N = "plain",
  maxBodyHeight: f,
  rowClassName: Ie,
  onRowClick: h,
  emptyMessage: Re,
  loading: w,
  className: Ce
}) {
  const r = lt(), [ke, Te] = a.useState(ce ?? {}), [Ee, Me] = a.useState([]), [Ne, we] = a.useState({}), [De, Pe] = a.useState(""), [J, Ae] = a.useState({
    pageIndex: 0,
    pageSize: fe
  }), Q = H ?? ke, X = U ?? Ee, Y = q ?? Ne, D = $ ?? De, Fe = a.useMemo(() => b ? [{
    id: "__select__",
    header: ({ table: t }) => /* @__PURE__ */ s(
      de,
      {
        checked: t.getIsAllRowsSelected() ? !0 : t.getIsSomeRowsSelected() ? "indeterminate" : !1,
        onCheckedChange: (n) => t.toggleAllRowsSelected(n === !0),
        "aria-label": r.t("dataTable.selectAll")
      }
    ),
    cell: ({ row: t }) => {
      const n = t.subRows.length > 0, i = n ? t.getIsSelected() && t.getIsAllSubRowsSelected() : t.getIsSelected(), p = !i && (t.getIsSomeSelected() || n && t.getIsSelected());
      return /* @__PURE__ */ s(
        de,
        {
          checked: i ? !0 : p ? "indeterminate" : !1,
          onCheckedChange: (Xe) => t.toggleSelected(Xe === !0),
          "aria-label": r.t("dataTable.selectRow", { n: t.index + 1 })
        }
      );
    },
    enableSorting: !1,
    enableHiding: !1,
    size: 36
  }, ...R] : R, [R, b, r]), [c, Le] = a.useState({}), [P, Z] = a.useState(/* @__PURE__ */ new Set()), [ee, _e] = a.useState(0), g = a.useCallback(
    (e) => C?.(e, 0) ?? e.id,
    [C]
  ), te = a.useCallback(
    (e) => {
      if (!m || !G?.(e)) return !1;
      const t = g(e);
      return t !== void 0 && c[t] === void 0;
    },
    [m, G, g, c]
  ), Ve = a.useCallback(
    async (e) => {
      const t = g(e);
      if (!(t === void 0 || !m) && !(P.has(t) || c[t] !== void 0)) {
        Z((n) => new Set(n).add(t));
        try {
          const n = await m(e);
          Le((i) => ({ ...i, [t]: n })), _e((i) => i + 1);
        } catch (n) {
          if (k) k(n, e);
          else throw n;
        } finally {
          Z((n) => {
            const i = new Set(n);
            return i.delete(t), i;
          });
        }
      }
    },
    [g, m, P, c, k]
  ), Ke = a.useMemo(
    () => ee > 0 ? [...z] : z,
    [z, ee]
  ), je = a.useCallback(
    (e) => {
      const t = g(e);
      return t !== void 0 && c[t] !== void 0 ? c[t] : (j ?? ft)(e);
    },
    [j, g, c]
  ), o = Ze({
    data: Ke,
    columns: Fe,
    state: {
      expanded: Q,
      sorting: X,
      rowSelection: Y,
      globalFilter: D,
      pagination: J
    },
    getSubRows: je,
    /* A row that says it has children is expandable before it has any. */
    getRowCanExpand: (e) => e.subRows.length > 0 || te(e.original),
    getRowId: C,
    enableSorting: O,
    enableRowSelection: !!b,
    enableSubRowSelection: be,
    /*
     * Filter from the leaves up, so a matching child keeps its ancestors on
     * screen. The default drops any row that does not match ITSELF, which for a
     * tree means a hit three levels down takes its whole path with it and the
     * user sees an empty table while the count says otherwise.
     */
    filterFromLeafRows: !0,
    onExpandedChange: (e) => {
      const t = typeof e == "function" ? e(Q) : e;
      H === void 0 && Te(t), ge?.(t);
    },
    onSortingChange: (e) => {
      const t = typeof e == "function" ? e(X) : e;
      U === void 0 && Me(t), ue?.(t);
    },
    onRowSelectionChange: (e) => {
      const t = typeof e == "function" ? e(Y) : e;
      q === void 0 && we(t), he?.(t);
    },
    onGlobalFilterChange: (e) => {
      const t = typeof e == "function" ? e(D) : e;
      $ === void 0 && Pe(t), ze?.(t);
    },
    getCoreRowModel: ut(),
    getExpandedRowModel: gt(),
    /*
     * The whole reason pagination is coherent here. With this false, TanStack
     * pages the ROOT rows and keeps every expanded descendant on the same page
     * as its parent. Left at its default (true) it pages the flattened list,
     * which puts half a subtree on page 2 under no parent at all.
     *
     * It MUST track `enablePagination` rather than being pinned false, and the
     * reason is buried in table-core: `getExpandedRowModel` returns the
     * PRE-expanded model untouched when this is false ("Only expand rows at
     * this point if they are being paginated"), because the flattening —
     * `expandRows()` — is deliberately delegated to `getPaginationRowModel`.
     * Pinned false with no pagination row model supplied, nothing calls it, so
     * no subtree ever enters the row model and the tree cannot open AT ALL: not
     * by chevron, not by keyboard, not by `defaultExpanded`. It shipped that
     * way. The failure is silent and reads as a dead control — every root row
     * still renders, still has a chevron (`row.subRows` is populated; only the
     * row MODEL is short), and still reports aria-expanded="false" after a
     * click.
     */
    paginateExpandedRows: !T,
    onPaginationChange: (e) => {
      const t = typeof e == "function" ? e(J) : e;
      Ae(t), pe?.(t);
    },
    getPaginationRowModel: T ? ct() : void 0,
    getSortedRowModel: O ? dt() : void 0,
    getFilteredRowModel: E ? rt() : void 0
  }), l = o.getRowModel().rows, Ge = xe ?? o.getVisibleLeafColumns().find((e) => !e.id.startsWith("__"))?.id, He = a.useMemo(() => {
    const e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map();
    for (const n of l) {
      const i = n.parentId ?? "", p = t.get(i);
      p ? p.push(n) : t.set(i, [n]);
    }
    for (const n of t.values())
      n.forEach((i, p) => e.set(i.id, { pos: p + 1, size: n.length }));
    return e;
  }, [l]), ne = (e) => {
    const t = g(e.original);
    return t !== void 0 && P.has(t);
  }, x = (e, t) => {
    t && te(e.original) && Ve(e.original), e.toggleExpanded(t);
  }, se = a.useRef(null), u = !!M && !!f, A = et({
    count: l.length,
    getScrollElement: () => se.current?.parentElement ?? null,
    estimateSize: () => Se,
    overscan: 8
  }), v = A.getVirtualItems(), Be = u ? v.map((e) => l[e.index]).filter(Boolean) : l, ae = u ? v[0]?.start ?? 0 : 0, oe = u ? A.getTotalSize() - (v[v.length - 1]?.end ?? 0) : 0, ie = a.useMemo(() => {
    const e = /* @__PURE__ */ new Map();
    return l.forEach((t, n) => e.set(t.id, n + 1)), e;
  }, [l]);
  a.useEffect(() => {
    M && !f && console.warn(
      "[TreeTable] `enableVirtualization` needs `maxBodyHeight` — without a bounded scroller there is no window. Rendering all rows."
    );
  }, [M, f]);
  const F = a.useRef(/* @__PURE__ */ new Map()), [Oe, le] = a.useState(null), Ue = Oe ?? l[0]?.id, S = (e) => {
    e && (le(e), F.current.get(e)?.focus());
  }, L = (e, t) => {
    const n = l.findIndex((i) => i.id === e.id);
    S(l[n + t]?.id);
  }, We = (e, t) => {
    const n = tt(e.key, e.currentTarget);
    e.key === "ArrowDown" ? (e.preventDefault(), L(t, 1)) : e.key === "ArrowUp" ? (e.preventDefault(), L(t, -1)) : n === 1 ? (e.preventDefault(), t.getCanExpand() && !t.getIsExpanded() ? x(t, !0) : t.getIsExpanded() && L(t, 1)) : n === -1 ? (e.preventDefault(), t.getIsExpanded() ? x(t, !1) : t.parentId && S(t.parentId)) : e.key === "Home" ? (e.preventDefault(), S(l[0]?.id)) : e.key === "End" ? (e.preventDefault(), S(l[l.length - 1]?.id)) : (e.key === "Enter" || e.key === " ") && (h ? (e.preventDefault(), h(t)) : t.getCanExpand() && (e.preventDefault(), x(t, !t.getIsExpanded())));
  }, $e = N === "branded" ? "zen-bg-zen-primary-soft [&>th]:zen-text-zen-primary-soft-fg [&>th]:zen-font-semibold" : "", qe = N === "underline" ? "[&_tr:last-child]:zen-border-b-2 [&_tr:last-child]:zen-border-zen-primary" : "", Je = ye ? N === "branded" ? "zen-sticky zen-top-0 zen-z-10" : "zen-sticky zen-top-0 zen-z-10 zen-bg-zen-background" : "", Qe = E || B;
  return /* @__PURE__ */ d("div", { className: I("zen-flex zen-w-full zen-flex-col zen-gap-3", Ce), children: [
    Qe && /* @__PURE__ */ d("div", { className: "zen-flex zen-flex-wrap zen-items-center zen-gap-2", children: [
      E && /* @__PURE__ */ s(
        it,
        {
          value: D,
          onChange: (e) => o.setGlobalFilter(e.target.value),
          placeholder: me ?? r.t("dataTable.search"),
          className: "zen-max-w-xs",
          "aria-label": r.t("treeTable.search")
        }
      ),
      B && /* @__PURE__ */ d(
        K,
        {
          variant: "outline",
          size: "sm",
          onClick: () => o.toggleAllRowsExpanded(),
          "aria-expanded": o.getIsAllRowsExpanded(),
          children: [
            /* @__PURE__ */ s(
              V,
              {
                name: o.getIsAllRowsExpanded() ? "chevron-down" : "chevron-right",
                size: 14
              }
            ),
            o.getIsAllRowsExpanded() ? r.t("treeTable.collapseAll") : r.t("treeTable.expandAll")
          ]
        }
      )
    ] }),
    /* @__PURE__ */ d(
      nt,
      {
        ref: se,
        role: "treegrid",
        "aria-busy": w || void 0,
        "aria-rowcount": u ? l.length : void 0,
        containerClassName: f ? "zen-overflow-auto" : void 0,
        containerStyle: f ? { maxHeight: `${f}px` } : void 0,
        children: [
          /* @__PURE__ */ s(st, { className: qe, children: o.getHeaderGroups().map((e) => /* @__PURE__ */ s(_, { className: I($e, Je), children: e.headers.map((t) => {
            const n = t.column.getIsSorted();
            return /* @__PURE__ */ s(
              at,
              {
                style: t.column.getSize() ? { width: t.getSize() } : void 0,
                "aria-sort": n === "asc" ? "ascending" : n === "desc" ? "descending" : t.column.getCanSort() ? "none" : void 0,
                children: !t.isPlaceholder && (t.column.getCanSort() ? /* @__PURE__ */ d(
                  "button",
                  {
                    type: "button",
                    onClick: t.column.getToggleSortingHandler(),
                    className: "zen-inline-flex zen-items-center zen-gap-1 zen-border-0 zen-bg-transparent zen-p-0 zen-font-inherit zen-text-inherit zen-cursor-pointer focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                    children: [
                      y(t.column.columnDef.header, t.getContext()),
                      n && /* @__PURE__ */ s(V, { name: n === "asc" ? "chevron-up" : "chevron-down", size: 12 })
                    ]
                  }
                ) : y(t.column.columnDef.header, t.getContext()))
              },
              t.id
            );
          }) }, e.id)) }),
          /* @__PURE__ */ s(ot, { children: w || l.length === 0 ? /* @__PURE__ */ s(_, { children: /* @__PURE__ */ s(
            re,
            {
              colSpan: o.getVisibleLeafColumns().length,
              className: "zen-h-24 zen-text-center zen-text-zen-muted-fg",
              children: w ? r.t("treeTable.loading") : Re ?? r.t("dataTable.noResults")
            }
          ) }) : /* @__PURE__ */ d(Ye, { children: [
            ae > 0 && /* @__PURE__ */ s("tr", { "aria-hidden": "true", style: { height: ae } }),
            Be.map((e) => {
              const t = He.get(e.id);
              return /* @__PURE__ */ s(
                _,
                {
                  ref: (n) => {
                    n ? (F.current.set(e.id, n), u && A.measureElement(n)) : F.current.delete(e.id);
                  },
                  "data-index": u ? (ie.get(e.id) ?? 1) - 1 : void 0,
                  "aria-rowindex": u ? ie.get(e.id) : void 0,
                  "data-state": e.getIsSelected() ? "selected" : void 0,
                  "data-depth": e.depth,
                  className: I(
                    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset",
                    h && "zen-cursor-pointer",
                    Ie?.(e)
                  ),
                  "aria-level": e.depth + 1,
                  "aria-expanded": e.getCanExpand() ? e.getIsExpanded() : void 0,
                  "aria-posinset": t?.pos,
                  "aria-setsize": t?.size,
                  "aria-selected": b ? e.getIsSelected() : void 0,
                  tabIndex: Ue === e.id ? 0 : -1,
                  onFocus: () => le(e.id),
                  onKeyDown: (n) => We(n, e),
                  onClick: () => h?.(e),
                  children: e.getVisibleCells().map((n) => /* @__PURE__ */ s(re, { children: n.column.id === Ge ? /* @__PURE__ */ d(
                    "span",
                    {
                      className: "zen-flex zen-items-center zen-gap-1",
                      style: { paddingInlineStart: e.depth * ve },
                      children: [
                        e.getCanExpand() ? /* @__PURE__ */ s(
                          "button",
                          {
                            type: "button",
                            tabIndex: -1,
                            "aria-hidden": "true",
                            "aria-busy": ne(e) || void 0,
                            onClick: (i) => {
                              i.stopPropagation(), x(e, !e.getIsExpanded());
                            },
                            className: "zen-inline-flex zen-w-4 zen-shrink-0 zen-items-center zen-justify-center zen-border-0 zen-bg-transparent zen-p-0 zen-cursor-pointer zen-text-zen-muted-fg",
                            children: ne(e) ? (
                              /* A fetch has no length the caller can predict, so the
                                 chevron itself reports it rather than the row jumping
                                 to a placeholder that may be replaced in 40ms. */
                              /* @__PURE__ */ s("span", { className: "zen-inline-block zen-h-3 zen-w-3 zen-animate-spin zen-rounded-zen-full zen-border zen-border-zen-border zen-border-t-zen-primary" })
                            ) : /* @__PURE__ */ s(
                              V,
                              {
                                name: "chevron-right",
                                size: 14,
                                className: I(
                                  "zen-transition-transform",
                                  e.getIsExpanded() && "zen-rotate-90"
                                )
                              }
                            )
                          }
                        ) : /* @__PURE__ */ s("span", { className: "zen-inline-block zen-w-4 zen-shrink-0" }),
                        y(n.column.columnDef.cell, n.getContext())
                      ]
                    }
                  ) : y(n.column.columnDef.cell, n.getContext()) }, n.id))
                },
                e.id
              );
            }),
            oe > 0 && /* @__PURE__ */ s("tr", { "aria-hidden": "true", style: { height: oe } })
          ] }) })
        ]
      }
    ),
    T && /* @__PURE__ */ d("div", { className: "zen-flex zen-flex-wrap zen-items-center zen-justify-between zen-gap-2", children: [
      /* @__PURE__ */ s("p", { className: "zen-m-0 zen-text-sm zen-text-zen-muted-fg", children: r.t("treeTable.pageOf", {
        page: o.getState().pagination.pageIndex + 1,
        pages: Math.max(1, o.getPageCount()),
        roots: o.getPreFilteredRowModel().rows.filter((e) => e.depth === 0).length
      }) }),
      /* @__PURE__ */ d("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
        W?.length ? /* @__PURE__ */ s(
          "select",
          {
            className: "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-2 zen-py-1 zen-text-sm",
            "aria-label": r.t("dataTable.rowsPerPage"),
            value: o.getState().pagination.pageSize,
            onChange: (e) => o.setPageSize(Number(e.target.value)),
            children: W.map((e) => /* @__PURE__ */ s("option", { value: e, children: r.t("treeTable.perPage", { n: e }) }, e))
          }
        ) : null,
        /* @__PURE__ */ s(
          K,
          {
            variant: "outline",
            size: "sm",
            disabled: !o.getCanPreviousPage(),
            onClick: () => o.previousPage(),
            children: r.t("treeTable.previous")
          }
        ),
        /* @__PURE__ */ s(
          K,
          {
            variant: "outline",
            size: "sm",
            disabled: !o.getCanNextPage(),
            onClick: () => o.nextPage(),
            children: r.t("treeTable.next")
          }
        )
      ] })
    ] })
  ] });
}
export {
  Et as TreeTable
};
//# sourceMappingURL=index107.js.map
