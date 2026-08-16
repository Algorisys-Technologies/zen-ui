import { jsxs as r, jsx as s, Fragment as Xe } from "react/jsx-runtime";
import * as o from "react";
import { useReactTable as Ye, flexRender as S } from "./index177.js";
import { useVirtualizer as Ze } from "./index178.js";
import { cn as y } from "./index145.js";
import { arrowStep as en } from "./index150.js";
import "./index25.js";
import "./index100.js";
import { Table as nn, TableHeader as tn, TableRow as L, TableHead as sn, TableBody as on, TableCell as le } from "./index94.js";
import { Checkbox as re } from "./index33.js";
import { Icon as _ } from "./index57.js";
import { Input as an } from "./index4.js";
import { Button as V } from "./index65.js";
import { getFilteredRowModel as ln, getSortedRowModel as rn, getPaginationRowModel as dn, getExpandedRowModel as cn, getCoreRowModel as gn } from "./index184.js";
const un = (p) => p.children;
function kn({
  data: p,
  columns: I,
  getSubRows: K,
  getRowId: C,
  hasChildren: j,
  loadChildren: z,
  onLoadChildrenError: R,
  expanded: G,
  defaultExpanded: de,
  onExpandedChange: ce,
  enableExpandAll: H = !0,
  enableSorting: $ = !0,
  sorting: B,
  onSortingChange: ge,
  enablePagination: k,
  pageSize: ue = 10,
  pageSizeOptions: U,
  onPaginationChange: fe,
  enableGlobalFilter: E,
  globalFilter: W,
  onGlobalFilterChange: pe,
  globalFilterPlaceholder: ze,
  enableRowSelection: m,
  enableSubRowSelection: me = !0,
  rowSelection: q,
  onRowSelectionChange: he,
  hierarchyColumnId: xe,
  indent: ve = 20,
  enableVirtualization: N,
  rowEstimatedHeight: be = 44,
  stickyHeader: Se,
  headerVariant: M = "plain",
  maxBodyHeight: u,
  rowClassName: ye,
  onRowClick: h,
  emptyMessage: Ie = "No results.",
  loading: w,
  className: Ce
}) {
  const [Re, ke] = o.useState(de ?? {}), [Ee, Ne] = o.useState([]), [Me, we] = o.useState({}), [Te, De] = o.useState(""), [J, Pe] = o.useState({
    pageIndex: 0,
    pageSize: ue
  }), O = G ?? Re, Q = B ?? Ee, X = q ?? Me, T = W ?? Te, Fe = o.useMemo(() => m ? [{
    id: "__select__",
    header: ({ table: n }) => /* @__PURE__ */ s(
      re,
      {
        checked: n.getIsAllRowsSelected() ? !0 : n.getIsSomeRowsSelected() ? "indeterminate" : !1,
        onCheckedChange: (t) => n.toggleAllRowsSelected(t === !0),
        "aria-label": "Select all rows"
      }
    ),
    cell: ({ row: n }) => {
      const t = n.subRows.length > 0, a = t ? n.getIsSelected() && n.getIsAllSubRowsSelected() : n.getIsSelected(), f = !a && (n.getIsSomeSelected() || t && n.getIsSelected());
      return /* @__PURE__ */ s(
        re,
        {
          checked: a ? !0 : f ? "indeterminate" : !1,
          onCheckedChange: (Qe) => n.toggleSelected(Qe === !0),
          "aria-label": `Select row ${n.index + 1}`
        }
      );
    },
    enableSorting: !1,
    enableHiding: !1,
    size: 36
  }, ...I] : I, [I, m]), [d, Ae] = o.useState({}), [D, Y] = o.useState(/* @__PURE__ */ new Set()), [Z, Le] = o.useState(0), c = o.useCallback(
    (e) => C?.(e, 0) ?? e.id,
    [C]
  ), ee = o.useCallback(
    (e) => {
      if (!z || !j?.(e)) return !1;
      const n = c(e);
      return n !== void 0 && d[n] === void 0;
    },
    [z, j, c, d]
  ), _e = o.useCallback(
    async (e) => {
      const n = c(e);
      if (!(n === void 0 || !z) && !(D.has(n) || d[n] !== void 0)) {
        Y((t) => new Set(t).add(n));
        try {
          const t = await z(e);
          Ae((a) => ({ ...a, [n]: t })), Le((a) => a + 1);
        } catch (t) {
          if (R) R(t, e);
          else throw t;
        } finally {
          Y((t) => {
            const a = new Set(t);
            return a.delete(n), a;
          });
        }
      }
    },
    [c, z, D, d, R]
  ), Ve = o.useMemo(
    () => Z > 0 ? [...p] : p,
    [p, Z]
  ), Ke = o.useCallback(
    (e) => {
      const n = c(e);
      return n !== void 0 && d[n] !== void 0 ? d[n] : (K ?? un)(e);
    },
    [K, c, d]
  ), i = Ye({
    data: Ve,
    columns: Fe,
    state: {
      expanded: O,
      sorting: Q,
      rowSelection: X,
      globalFilter: T,
      pagination: J
    },
    getSubRows: Ke,
    /* A row that says it has children is expandable before it has any. */
    getRowCanExpand: (e) => e.subRows.length > 0 || ee(e.original),
    getRowId: C,
    enableSorting: $,
    enableRowSelection: !!m,
    enableSubRowSelection: me,
    /*
     * Filter from the leaves up, so a matching child keeps its ancestors on
     * screen. The default drops any row that does not match ITSELF, which for a
     * tree means a hit three levels down takes its whole path with it and the
     * user sees an empty table while the count says otherwise.
     */
    filterFromLeafRows: !0,
    onExpandedChange: (e) => {
      const n = typeof e == "function" ? e(O) : e;
      G === void 0 && ke(n), ce?.(n);
    },
    onSortingChange: (e) => {
      const n = typeof e == "function" ? e(Q) : e;
      B === void 0 && Ne(n), ge?.(n);
    },
    onRowSelectionChange: (e) => {
      const n = typeof e == "function" ? e(X) : e;
      q === void 0 && we(n), he?.(n);
    },
    onGlobalFilterChange: (e) => {
      const n = typeof e == "function" ? e(T) : e;
      W === void 0 && De(n), pe?.(n);
    },
    getCoreRowModel: gn(),
    getExpandedRowModel: cn(),
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
    paginateExpandedRows: !k,
    onPaginationChange: (e) => {
      const n = typeof e == "function" ? e(J) : e;
      Pe(n), fe?.(n);
    },
    getPaginationRowModel: k ? dn() : void 0,
    getSortedRowModel: $ ? rn() : void 0,
    getFilteredRowModel: E ? ln() : void 0
  }), l = i.getRowModel().rows, je = xe ?? i.getVisibleLeafColumns().find((e) => !e.id.startsWith("__"))?.id, Ge = o.useMemo(() => {
    const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
    for (const t of l) {
      const a = t.parentId ?? "", f = n.get(a);
      f ? f.push(t) : n.set(a, [t]);
    }
    for (const t of n.values())
      t.forEach((a, f) => e.set(a.id, { pos: f + 1, size: t.length }));
    return e;
  }, [l]), ne = (e) => {
    const n = c(e.original);
    return n !== void 0 && D.has(n);
  }, x = (e, n) => {
    n && ee(e.original) && _e(e.original), e.toggleExpanded(n);
  }, te = o.useRef(null), g = !!N && !!u, P = Ze({
    count: l.length,
    getScrollElement: () => te.current?.parentElement ?? null,
    estimateSize: () => be,
    overscan: 8
  }), v = P.getVirtualItems(), He = g ? v.map((e) => l[e.index]).filter(Boolean) : l, se = g ? v[0]?.start ?? 0 : 0, oe = g ? P.getTotalSize() - (v[v.length - 1]?.end ?? 0) : 0, ie = o.useMemo(() => {
    const e = /* @__PURE__ */ new Map();
    return l.forEach((n, t) => e.set(n.id, t + 1)), e;
  }, [l]);
  o.useEffect(() => {
    N && !u && console.warn(
      "[TreeTable] `enableVirtualization` needs `maxBodyHeight` — without a bounded scroller there is no window. Rendering all rows."
    );
  }, [N, u]);
  const F = o.useRef(/* @__PURE__ */ new Map()), [$e, ae] = o.useState(null), Be = $e ?? l[0]?.id, b = (e) => {
    e && (ae(e), F.current.get(e)?.focus());
  }, A = (e, n) => {
    const t = l.findIndex((a) => a.id === e.id);
    b(l[t + n]?.id);
  }, Ue = (e, n) => {
    const t = en(e.key, e.currentTarget);
    e.key === "ArrowDown" ? (e.preventDefault(), A(n, 1)) : e.key === "ArrowUp" ? (e.preventDefault(), A(n, -1)) : t === 1 ? (e.preventDefault(), n.getCanExpand() && !n.getIsExpanded() ? x(n, !0) : n.getIsExpanded() && A(n, 1)) : t === -1 ? (e.preventDefault(), n.getIsExpanded() ? x(n, !1) : n.parentId && b(n.parentId)) : e.key === "Home" ? (e.preventDefault(), b(l[0]?.id)) : e.key === "End" ? (e.preventDefault(), b(l[l.length - 1]?.id)) : (e.key === "Enter" || e.key === " ") && (h ? (e.preventDefault(), h(n)) : n.getCanExpand() && (e.preventDefault(), x(n, !n.getIsExpanded())));
  }, We = M === "branded" ? "zen-bg-zen-primary-soft [&>th]:zen-text-zen-primary-soft-fg [&>th]:zen-font-semibold" : "", qe = M === "underline" ? "[&_tr:last-child]:zen-border-b-2 [&_tr:last-child]:zen-border-zen-primary" : "", Je = Se ? M === "branded" ? "zen-sticky zen-top-0 zen-z-10" : "zen-sticky zen-top-0 zen-z-10 zen-bg-zen-background" : "", Oe = E || H;
  return /* @__PURE__ */ r("div", { className: y("zen-flex zen-w-full zen-flex-col zen-gap-3", Ce), children: [
    Oe && /* @__PURE__ */ r("div", { className: "zen-flex zen-flex-wrap zen-items-center zen-gap-2", children: [
      E && /* @__PURE__ */ s(
        an,
        {
          value: T,
          onChange: (e) => i.setGlobalFilter(e.target.value),
          placeholder: ze ?? "Search…",
          className: "zen-max-w-xs",
          "aria-label": "Search"
        }
      ),
      H && /* @__PURE__ */ r(
        V,
        {
          variant: "outline",
          size: "sm",
          onClick: () => i.toggleAllRowsExpanded(),
          "aria-expanded": i.getIsAllRowsExpanded(),
          children: [
            /* @__PURE__ */ s(
              _,
              {
                name: i.getIsAllRowsExpanded() ? "chevron-down" : "chevron-right",
                size: 14
              }
            ),
            i.getIsAllRowsExpanded() ? "Collapse all" : "Expand all"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ r(
      nn,
      {
        ref: te,
        role: "treegrid",
        "aria-busy": w || void 0,
        "aria-rowcount": g ? l.length : void 0,
        containerClassName: u ? "zen-overflow-auto" : void 0,
        containerStyle: u ? { maxHeight: `${u}px` } : void 0,
        children: [
          /* @__PURE__ */ s(tn, { className: qe, children: i.getHeaderGroups().map((e) => /* @__PURE__ */ s(L, { className: y(We, Je), children: e.headers.map((n) => {
            const t = n.column.getIsSorted();
            return /* @__PURE__ */ s(
              sn,
              {
                style: n.column.getSize() ? { width: n.getSize() } : void 0,
                "aria-sort": t === "asc" ? "ascending" : t === "desc" ? "descending" : n.column.getCanSort() ? "none" : void 0,
                children: !n.isPlaceholder && (n.column.getCanSort() ? /* @__PURE__ */ r(
                  "button",
                  {
                    type: "button",
                    onClick: n.column.getToggleSortingHandler(),
                    className: "zen-inline-flex zen-items-center zen-gap-1 zen-border-0 zen-bg-transparent zen-p-0 zen-font-inherit zen-text-inherit zen-cursor-pointer focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                    children: [
                      S(n.column.columnDef.header, n.getContext()),
                      t && /* @__PURE__ */ s(_, { name: t === "asc" ? "chevron-up" : "chevron-down", size: 12 })
                    ]
                  }
                ) : S(n.column.columnDef.header, n.getContext()))
              },
              n.id
            );
          }) }, e.id)) }),
          /* @__PURE__ */ s(on, { children: w || l.length === 0 ? /* @__PURE__ */ s(L, { children: /* @__PURE__ */ s(
            le,
            {
              colSpan: i.getVisibleLeafColumns().length,
              className: "zen-h-24 zen-text-center zen-text-zen-muted-fg",
              children: w ? "Loading…" : Ie
            }
          ) }) : /* @__PURE__ */ r(Xe, { children: [
            se > 0 && /* @__PURE__ */ s("tr", { "aria-hidden": "true", style: { height: se } }),
            He.map((e) => {
              const n = Ge.get(e.id);
              return /* @__PURE__ */ s(
                L,
                {
                  ref: (t) => {
                    t ? (F.current.set(e.id, t), g && P.measureElement(t)) : F.current.delete(e.id);
                  },
                  "data-index": g ? (ie.get(e.id) ?? 1) - 1 : void 0,
                  "aria-rowindex": g ? ie.get(e.id) : void 0,
                  "data-state": e.getIsSelected() ? "selected" : void 0,
                  "data-depth": e.depth,
                  className: y(
                    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset",
                    h && "zen-cursor-pointer",
                    ye?.(e)
                  ),
                  "aria-level": e.depth + 1,
                  "aria-expanded": e.getCanExpand() ? e.getIsExpanded() : void 0,
                  "aria-posinset": n?.pos,
                  "aria-setsize": n?.size,
                  "aria-selected": m ? e.getIsSelected() : void 0,
                  tabIndex: Be === e.id ? 0 : -1,
                  onFocus: () => ae(e.id),
                  onKeyDown: (t) => Ue(t, e),
                  onClick: () => h?.(e),
                  children: e.getVisibleCells().map((t) => /* @__PURE__ */ s(le, { children: t.column.id === je ? /* @__PURE__ */ r(
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
                            onClick: (a) => {
                              a.stopPropagation(), x(e, !e.getIsExpanded());
                            },
                            className: "zen-inline-flex zen-w-4 zen-shrink-0 zen-items-center zen-justify-center zen-border-0 zen-bg-transparent zen-p-0 zen-cursor-pointer zen-text-zen-muted-fg",
                            children: ne(e) ? (
                              /* A fetch has no length the caller can predict, so the
                                 chevron itself reports it rather than the row jumping
                                 to a placeholder that may be replaced in 40ms. */
                              /* @__PURE__ */ s("span", { className: "zen-inline-block zen-h-3 zen-w-3 zen-animate-spin zen-rounded-zen-full zen-border zen-border-zen-border zen-border-t-zen-primary" })
                            ) : /* @__PURE__ */ s(
                              _,
                              {
                                name: "chevron-right",
                                size: 14,
                                className: y(
                                  "zen-transition-transform",
                                  e.getIsExpanded() && "zen-rotate-90"
                                )
                              }
                            )
                          }
                        ) : /* @__PURE__ */ s("span", { className: "zen-inline-block zen-w-4 zen-shrink-0" }),
                        S(t.column.columnDef.cell, t.getContext())
                      ]
                    }
                  ) : S(t.column.columnDef.cell, t.getContext()) }, t.id))
                },
                e.id
              );
            }),
            oe > 0 && /* @__PURE__ */ s("tr", { "aria-hidden": "true", style: { height: oe } })
          ] }) })
        ]
      }
    ),
    k && /* @__PURE__ */ r("div", { className: "zen-flex zen-flex-wrap zen-items-center zen-justify-between zen-gap-2", children: [
      /* @__PURE__ */ r("p", { className: "zen-m-0 zen-text-sm zen-text-zen-muted-fg", children: [
        "Page ",
        i.getState().pagination.pageIndex + 1,
        " of",
        " ",
        Math.max(1, i.getPageCount()),
        " · ",
        i.getPreFilteredRowModel().rows.filter((e) => e.depth === 0).length,
        " top-level rows"
      ] }),
      /* @__PURE__ */ r("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
        U?.length ? /* @__PURE__ */ s(
          "select",
          {
            className: "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-2 zen-py-1 zen-text-sm",
            "aria-label": "Rows per page",
            value: i.getState().pagination.pageSize,
            onChange: (e) => i.setPageSize(Number(e.target.value)),
            children: U.map((e) => /* @__PURE__ */ r("option", { value: e, children: [
              e,
              " per page"
            ] }, e))
          }
        ) : null,
        /* @__PURE__ */ s(
          V,
          {
            variant: "outline",
            size: "sm",
            disabled: !i.getCanPreviousPage(),
            onClick: () => i.previousPage(),
            children: "Previous"
          }
        ),
        /* @__PURE__ */ s(
          V,
          {
            variant: "outline",
            size: "sm",
            disabled: !i.getCanNextPage(),
            onClick: () => i.nextPage(),
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
}
export {
  kn as TreeTable
};
//# sourceMappingURL=index97.js.map
