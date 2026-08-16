import { jsxs as a, jsx as e, Fragment as ce } from "react/jsx-runtime";
import * as m from "react";
import { useReactTable as et, flexRender as D } from "./index177.js";
import { useVirtualizer as nt } from "./index178.js";
import { useSensors as tt, useSensor as dn, DndContext as we, closestCenter as Ie, KeyboardSensor as ot, PointerSensor as rt } from "./index179.js";
import { SortableContext as ke, horizontalListSortingStrategy as hn, verticalListSortingStrategy as it, arrayMove as un, sortableKeyboardCoordinates as st, useSortable as ae } from "./index180.js";
import { CSS as Ee } from "./index181.js";
import { Button as H } from "./index65.js";
import { Checkbox as Ne } from "./index33.js";
import { DropdownMenu as Me, DropdownMenuTrigger as $e, DropdownMenuContent as Fe, DropdownMenuLabel as Le, DropdownMenuSeparator as He, DropdownMenuItem as gn, DropdownMenuCheckboxItem as xn } from "./index67.js";
import { Input as lt } from "./index4.js";
import { Select as ct, SelectTrigger as at, SelectValue as dt, SelectContent as ut, SelectItem as gt } from "./index36.js";
import { TableHeader as zt, TableRow as E, TableHead as Re, Table as ft, TableBody as mt, TableCell as _, TableFooter as pt } from "./index94.js";
import { filterFnByVariant as ht, FilterCell as bn } from "./index182.js";
import { EditableCell as De } from "./index183.js";
import { cn as b } from "./index145.js";
import { getGroupedRowModel as xt, getExpandedRowModel as bt, getPaginationRowModel as vt, getFilteredRowModel as yt, getSortedRowModel as Ct, getCoreRowModel as St } from "./index184.js";
function io({
  data: n,
  columns: i,
  enableSorting: s = !1,
  enableMultiSort: r = !1,
  enablePagination: d = !1,
  enableColumnFilters: u = !1,
  enableRowSelection: c = !1,
  enableColumnVisibility: l = !1,
  enableVirtualization: f = !1,
  enableColumnSeparators: x = !1,
  enableRowOrdering: h = !1,
  onRowOrderChange: v,
  getRowId: S,
  persistKey: I,
  rowClassName: M,
  renderBulkActions: de,
  renderSubRow: G,
  expanded: $,
  onExpandedChange: j,
  enableGrouping: T = !1,
  grouping: B,
  initialGrouping: X,
  onGroupingChange: A,
  enableColumnOrdering: P = !1,
  onColumnOrderChange: O,
  enableColumnResizing: W = !1,
  enablePerColumnFilters: N = !1,
  enableFilterOperators: Z = !0,
  enableExport: p = !1,
  exportFilename: z = "data-table",
  exportOnlySelected: y = !1,
  stickyHeader: J = !1,
  enableColumnPinning: F = !1,
  columnPinning: ee,
  initialColumnPinning: Sn,
  onColumnPinningChange: wn,
  onCellEdit: Ge,
  headerVariant: U = "plain",
  pageSize: ue = 10,
  pageSizeOptions: In = [10, 20, 50, 100],
  maxBodyHeight: je = 480,
  rowEstimatedHeight: kn = 44,
  globalFilterPlaceholder: Nn = "Search…",
  emptyMessage: Te = "No results.",
  loading: ge = !1,
  className: Rn,
  manualPagination: w,
  manualSorting: Be = !1,
  manualFiltering: Ae = !1,
  sorting: Pe,
  onSortingChange: Dn,
  columnFilters: Ve,
  onColumnFiltersChange: En,
  rowSelection: _e,
  onRowSelectionChange: Mn,
  columnVisibility: Oe,
  onColumnVisibilityChange: $n,
  globalFilter: ze,
  onGlobalFilterChange: We
}) {
  const ne = m.useMemo(
    () => Et(I),
    [I]
  ), [Fn, Ln] = m.useState([]), [Hn, Gn] = m.useState([]), [jn, Tn] = m.useState({}), [Bn, An] = m.useState(
    () => ne?.columnVisibility ?? {}
  ), [Pn, Je] = m.useState(""), [Ue, Vn] = m.useState({
    pageIndex: 0,
    pageSize: ue
  }), [q, qe] = m.useState(
    () => ne?.columnOrder ?? []
  ), [fe, _n] = m.useState(
    () => ne?.columnSizing ?? {}
  ), [On, Wn] = m.useState(
    () => ne?.columnPinning ?? Sn ?? { left: [], right: [] }
  ), te = ee ?? On, [Jn, Un] = m.useState({}), Ye = $ ?? Jn, [qn, Yn] = m.useState(
    () => X ?? []
  ), Ke = B ?? qn, [Y, me] = m.useState(null), pe = m.useCallback(
    (t, o) => me({ rowId: t, columnId: o }),
    []
  ), he = m.useCallback(
    (t, o, g) => {
      me(null), Ge?.({ rowId: t, columnId: o, value: g });
    },
    [Ge]
  ), xe = m.useCallback(() => me(null), []), Qe = Pe ?? Fn, Xe = Ve ?? Hn, Ze = _e ?? jn, K = Oe ?? Bn, en = ze ?? Pn, oe = h && !f, re = T && !f, ie = !!G && !f || re;
  m.useEffect(() => {
  }, [f, h, G, T]);
  const be = m.useMemo(() => {
    const t = [];
    oe && t.push({
      id: "__drag__",
      header: () => /* @__PURE__ */ e("span", { className: "zen-sr-only", children: "Reorder" }),
      cell: ({ row: g }) => /* @__PURE__ */ e($t, { id: g.id }),
      enableSorting: !1,
      enableHiding: !1,
      size: 32
    }), ie && t.push({
      id: "__expand__",
      header: () => /* @__PURE__ */ e("span", { className: "zen-sr-only", children: "Expand" }),
      cell: ({ row: g }) => /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          onClick: () => g.toggleExpanded(),
          "aria-expanded": g.getIsExpanded(),
          "aria-label": g.getIsExpanded() ? "Collapse row" : "Expand row",
          className: b(
            "zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6",
            "zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer",
            "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            "zen-transition-transform",
            g.getIsExpanded() && "zen-rotate-90"
          ),
          children: /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: /* @__PURE__ */ e("polyline", { points: "9 6 15 12 9 18" }) })
        }
      ),
      enableSorting: !1,
      enableHiding: !1,
      size: 32
    }), c && t.push({
      id: "__select__",
      header: ({ table: g }) => /* @__PURE__ */ e(
        Ne,
        {
          checked: g.getIsAllRowsSelected() ? !0 : g.getIsSomeRowsSelected() ? "indeterminate" : !1,
          onCheckedChange: (C) => g.toggleAllRowsSelected(C === !0),
          "aria-label": "Select all rows"
        }
      ),
      cell: ({ row: g }) => /* @__PURE__ */ e(
        Ne,
        {
          checked: g.getIsSelected(),
          onCheckedChange: (C) => g.toggleSelected(C === !0),
          "aria-label": `Select row ${g.index + 1}`
        }
      ),
      enableSorting: !1,
      enableHiding: !1,
      size: 36
    });
    const o = i.map((g) => {
      const C = g.meta;
      return C?.filterVariant && !g.filterFn ? {
        ...g,
        // The variant filterFns are data-shape-agnostic — they read via
        // row.getValue(columnId) and compare against the filter value —
        // so widening to FilterFn<TData> is safe.
        filterFn: ht[C.filterVariant]
      } : g;
    });
    return [...t, ...o];
  }, [i, c, oe, ie]), k = et({
    data: n,
    columns: be,
    state: {
      sorting: Qe,
      columnFilters: Xe,
      rowSelection: Ze,
      columnVisibility: K,
      globalFilter: en,
      columnOrder: q,
      columnSizing: fe,
      columnPinning: te,
      expanded: Ye,
      grouping: Ke,
      ...w ? {
        pagination: {
          pageIndex: w.pageIndex,
          pageSize: w.pageSize ?? ue
        }
      } : d ? { pagination: Ue } : {}
    },
    enableSorting: s,
    enableMultiSort: r,
    enableRowSelection: c,
    enableColumnFilters: u || N,
    enableColumnResizing: W,
    columnResizeMode: "onChange",
    enableColumnPinning: F,
    enableGrouping: re,
    getRowId: S,
    manualPagination: !!w,
    manualSorting: Be,
    manualFiltering: Ae,
    pageCount: w?.pageCount,
    onColumnOrderChange: (t) => {
      const o = typeof t == "function" ? t(q) : t;
      qe(o), O?.(o);
    },
    onColumnSizingChange: _n,
    onColumnPinningChange: (t) => {
      const o = typeof t == "function" ? t(te) : t;
      ee === void 0 && Wn(o), wn?.(o);
    },
    onExpandedChange: (t) => {
      const o = typeof t == "function" ? t(Ye) : t;
      $ === void 0 && Un(o), j?.(o);
    },
    onGroupingChange: (t) => {
      const o = typeof t == "function" ? t(Ke) : t;
      B === void 0 && Yn(o), A?.(o);
    },
    onSortingChange: (t) => {
      const o = typeof t == "function" ? t(Qe) : t;
      Pe === void 0 && Ln(o), Dn?.(o);
    },
    onColumnFiltersChange: (t) => {
      const o = typeof t == "function" ? t(Xe) : t;
      Ve === void 0 && Gn(o), En?.(o);
    },
    onRowSelectionChange: (t) => {
      const o = typeof t == "function" ? t(Ze) : t;
      _e === void 0 && Tn(o), Mn?.(o);
    },
    onColumnVisibilityChange: (t) => {
      const o = typeof t == "function" ? t(K) : t;
      Oe === void 0 && An(o), $n?.(o);
    },
    onGlobalFilterChange: (t) => {
      ze === void 0 && Je(t), We?.(t);
    },
    onPaginationChange: w ? (t) => {
      const o = typeof t == "function" ? t({
        pageIndex: w.pageIndex,
        pageSize: w.pageSize ?? ue
      }) : t;
      w.onPageChange(o.pageIndex);
    } : (t) => {
      const o = typeof t == "function" ? t(Ue) : t;
      Vn(o);
    },
    getCoreRowModel: St(),
    /* Skip the row-model functions when their corresponding manual flag
     * is set — TanStack will then trust the source data array as-is. */
    getSortedRowModel: s && !Be ? Ct() : void 0,
    getFilteredRowModel: (u || N) && !Ae ? yt() : void 0,
    getPaginationRowModel: d && !w ? vt() : void 0,
    getExpandedRowModel: ie ? bt() : void 0,
    /* groupingActive (not enableGrouping) — gated off when virtualized
     * so getGroupedRowModel doesn't produce group rows that the virt
     * body would render as misleading data rows. */
    getGroupedRowModel: re ? xt() : void 0
  }), se = k.getRowModel().rows, nn = m.useCallback(
    (t) => {
      if (t.getIsGrouped()) {
        const o = t.row;
        return /* @__PURE__ */ a("div", { className: "zen-inline-flex zen-items-center zen-gap-1.5", children: [
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              onClick: o.getToggleExpandedHandler(),
              "aria-expanded": o.getIsExpanded(),
              "aria-label": o.getIsExpanded() ? "Collapse group" : "Expand group",
              className: b(
                "zen-inline-flex zen-items-center zen-justify-center zen-h-5 zen-w-5 zen-rounded-zen-sm",
                "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-transition-transform",
                "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
                "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                o.getIsExpanded() && "zen-rotate-90"
              ),
              children: /* @__PURE__ */ e(
                "svg",
                {
                  width: "10",
                  height: "10",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "2.5",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  "aria-hidden": !0,
                  children: /* @__PURE__ */ e("polyline", { points: "9 6 15 12 9 18" })
                }
              )
            }
          ),
          /* @__PURE__ */ e("span", { className: "zen-font-medium", children: D(t.column.columnDef.cell, t.getContext()) }),
          /* @__PURE__ */ a("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: [
            "(",
            o.subRows.length,
            ")"
          ] })
        ] });
      }
      return t.getIsAggregated() ? D(
        t.column.columnDef.aggregatedCell ?? t.column.columnDef.cell,
        t.getContext()
      ) : t.getIsPlaceholder() ? null : D(t.column.columnDef.cell, t.getContext());
    },
    []
  );
  m.useEffect(() => {
    Mt(I, {
      columnOrder: q,
      columnSizing: fe,
      columnVisibility: K,
      columnPinning: te
    });
  }, [I, q, fe, K, te]);
  const ve = tt(
    dn(rt, { activationConstraint: { distance: 5 } }),
    dn(ot, { coordinateGetter: st })
  ), le = m.useMemo(() => se.map((t) => t.id), [se]), Kn = (t) => {
    const { active: o, over: g } = t;
    if (!g || o.id === g.id) return;
    const C = le.indexOf(String(o.id)), R = le.indexOf(String(g.id));
    if (C < 0 || R < 0) return;
    const L = un(le, C, R);
    v?.(L);
  }, ye = x ? "zen-border-r zen-border-zen-border last:zen-border-r-0" : "", tn = x ? "[&>th]:zen-border-r [&>th]:zen-border-zen-border [&>th:last-child]:zen-border-r-0" : "", Ce = m.useCallback(
    (t) => {
      if (!F) return;
      const o = t.getIsPinned();
      if (!o) return;
      const g = o === "left" && t.getIsLastColumn("left"), C = o === "right" && t.getIsFirstColumn("right");
      return {
        position: "sticky",
        left: o === "left" ? `${t.getStart("left")}px` : void 0,
        right: o === "right" ? `${t.getAfter("right")}px` : void 0,
        background: "var(--zen-color-background)",
        // Body cells: z=1 so they sit above non-pinned cells while scrolling.
        // Sticky-header cells override to z=11 below.
        zIndex: 1,
        boxShadow: g ? "inset -1px 0 0 var(--zen-color-border), 4px 0 6px -4px rgba(0,0,0,0.12)" : C ? "inset 1px 0 0 var(--zen-color-border), -4px 0 6px -4px rgba(0,0,0,0.12)" : void 0
      };
    },
    [F]
  ), V = J && !f, Q = m.useMemo(
    () => k.getVisibleLeafColumns().map((t) => t.id),
    // re-derive when column order or visibility changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [k, q, K]
  ), on = (t) => {
    const { active: o, over: g } = t;
    if (!g || o.id === g.id) return;
    const C = Q.indexOf(String(o.id)), R = Q.indexOf(String(g.id));
    if (C < 0 || R < 0) return;
    const L = un(Q, C, R);
    qe(L), O?.(L);
  }, rn = U === "branded" ? "zen-bg-zen-primary-soft [&>th]:zen-text-zen-primary-soft-fg [&>th]:zen-font-semibold" : "", Qn = U === "underline" ? "[&_tr:last-child]:zen-border-b-2 [&_tr:last-child]:zen-border-zen-primary" : "", Se = U === "branded" ? "var(--zen-color-primary-soft)" : "var(--zen-color-background)", sn = V ? U === "branded" ? "zen-sticky zen-top-0 zen-z-10" : "zen-sticky zen-top-0 zen-z-10 zen-bg-zen-background" : "", ln = (t) => {
    const o = Ce(t);
    if (o)
      return { ...o, background: Se };
  }, Xn = m.useMemo(
    () => i.some((t) => t.footer !== void 0),
    [i]
  ), cn = /* @__PURE__ */ a(zt, { className: Qn, children: [
    k.getHeaderGroups().map((t) => /* @__PURE__ */ e(
      E,
      {
        className: b(tn, sn, rn),
        children: t.headers.map((o) => /* @__PURE__ */ e(
          Ht,
          {
            header: o,
            enableColumnResizing: W,
            enableColumnOrdering: P,
            pinStyle: ln(o.column),
            stickyHeader: V,
            stickyBg: Se
          },
          o.id
        ))
      },
      t.id
    )),
    N && k.getHeaderGroups().map((t) => /* @__PURE__ */ e(
      E,
      {
        className: b(tn, sn, rn),
        style: V ? { top: "var(--zen-dt-header-h, 40px)" } : void 0,
        children: t.headers.map((o) => {
          const g = ln(o.column);
          return /* @__PURE__ */ e(
            Re,
            {
              className: "zen-px-2 zen-py-1",
              style: g ? { ...g, zIndex: V ? 11 : 1 } : V ? { background: Se } : void 0,
              children: o.column.getCanFilter() && !o.id.startsWith("__") ? /* @__PURE__ */ e(bn, { column: o.column, operators: Z }) : null
            },
            `${o.id}-filter`
          );
        })
      },
      `${t.id}-filter`
    ))
  ] }), an = /* @__PURE__ */ a(ft, { containerStyle: V ? { maxHeight: je } : void 0, children: [
    P ? /* @__PURE__ */ e(
      we,
      {
        sensors: ve,
        collisionDetection: Ie,
        onDragEnd: on,
        children: /* @__PURE__ */ e(
          ke,
          {
            items: Q,
            strategy: hn,
            children: cn
          }
        )
      }
    ) : cn,
    /* @__PURE__ */ e(mt, { children: ge ? /* @__PURE__ */ e(E, { children: /* @__PURE__ */ e(
      _,
      {
        colSpan: be.length,
        className: "zen-text-center zen-text-zen-muted-fg zen-py-6",
        children: "Loading…"
      }
    ) }) : se.length === 0 ? /* @__PURE__ */ e(E, { children: /* @__PURE__ */ e(
      _,
      {
        colSpan: be.length,
        className: "zen-text-center zen-text-zen-muted-fg zen-py-6",
        children: Te
      }
    ) }) : se.map(
      (t) => oe ? /* @__PURE__ */ e(
        Ft,
        {
          id: t.id,
          selected: t.getIsSelected(),
          cellClassName: ye,
          className: M?.(t),
          children: t.getVisibleCells().map((o) => {
            const g = Ce(o.column), C = Y?.rowId === t.id && Y?.columnId === o.column.id;
            return /* @__PURE__ */ e(
              _,
              {
                className: ye,
                style: g,
                children: /* @__PURE__ */ e(
                  De,
                  {
                    cell: o,
                    editing: C,
                    onStartEdit: () => pe(t.id, o.column.id),
                    onCommit: (R) => he(t.id, o.column.id, R),
                    onCancel: xe,
                    children: nn(o)
                  }
                )
              },
              o.id
            );
          })
        },
        t.id
      ) : /* @__PURE__ */ a(m.Fragment, { children: [
        /* @__PURE__ */ e(
          E,
          {
            "data-state": t.getIsSelected() ? "selected" : void 0,
            "data-grouped": t.getIsGrouped() ? "true" : void 0,
            className: b(
              t.getIsGrouped() && "zen-bg-zen-muted/40 zen-font-medium",
              M?.(t)
            ),
            children: t.getVisibleCells().map((o) => {
              const g = Ce(o.column), C = Y?.rowId === t.id && Y?.columnId === o.column.id, R = !o.getIsGrouped() && !o.getIsAggregated() && !o.getIsPlaceholder(), L = nn(o);
              return /* @__PURE__ */ e(
                _,
                {
                  className: ye,
                  style: g,
                  children: R ? /* @__PURE__ */ e(
                    De,
                    {
                      cell: o,
                      editing: C,
                      onStartEdit: () => pe(t.id, o.column.id),
                      onCommit: (Zn) => he(t.id, o.column.id, Zn),
                      onCancel: xe,
                      children: L
                    }
                  ) : L
                },
                o.id
              );
            })
          }
        ),
        ie && t.getIsExpanded() && G ? /* @__PURE__ */ e(E, { "data-expanded-of": t.id, children: /* @__PURE__ */ e(
          _,
          {
            colSpan: t.getVisibleCells().length,
            className: "zen-p-0 zen-bg-zen-muted/30",
            children: G(t)
          }
        ) }) : null
      ] }, t.id)
    ) }),
    Xn ? /* @__PURE__ */ e(pt, { children: k.getFooterGroups().map((t) => /* @__PURE__ */ e(E, { children: t.headers.map((o) => /* @__PURE__ */ e(_, { colSpan: o.colSpan, children: o.isPlaceholder ? null : D(
      o.column.columnDef.footer,
      o.getContext()
    ) }, o.id)) }, t.id)) }) : null
  ] });
  return /* @__PURE__ */ a("div", { className: b("zen-space-y-3", Rn), children: [
    /* @__PURE__ */ e(
      wt,
      {
        table: k,
        enableColumnFilters: u,
        enableColumnVisibility: l,
        enableColumnPinning: F,
        enableGrouping: re,
        enableExport: p,
        exportFilename: z,
        exportOnlySelected: y,
        globalFilter: en,
        globalFilterPlaceholder: Nn,
        onGlobalFilterChange: (t) => {
          ze === void 0 && Je(t), We?.(t);
        }
      }
    ),
    /* @__PURE__ */ e(kt, { table: k, renderBulkActions: de }),
    /* @__PURE__ */ e(Nt, { table: k }),
    /* @__PURE__ */ e(
      "div",
      {
        className: "zen-rounded-zen-md zen-border zen-border-zen-border",
        "aria-busy": ge || void 0,
        children: f ? /* @__PURE__ */ e(
          jt,
          {
            table: k,
            maxHeight: je,
            estimatedRowHeight: kn,
            emptyMessage: Te,
            loading: ge,
            enableColumnPinning: F,
            enableColumnResizing: W,
            enableColumnOrdering: P,
            enablePerColumnFilters: N,
            visibleColumnIds: Q,
            onColumnDragEnd: on,
            sensors: ve,
            editingCell: Y,
            onStartEdit: pe,
            onCommitEdit: he,
            onCancelEdit: xe,
            rowClassName: M,
            headerVariant: U
          }
        ) : oe ? /* @__PURE__ */ e(
          we,
          {
            sensors: ve,
            collisionDetection: Ie,
            onDragEnd: Kn,
            children: /* @__PURE__ */ e(ke, { items: le, strategy: it, children: an })
          }
        ) : an
      }
    ),
    (d || w) && /* @__PURE__ */ e(
      At,
      {
        table: k,
        enableRowSelection: c,
        pageSizeOptions: In,
        manual: !!w
      }
    )
  ] });
}
function wt({
  table: n,
  enableColumnFilters: i,
  enableColumnVisibility: s,
  enableColumnPinning: r,
  enableGrouping: d,
  enableExport: u,
  exportFilename: c,
  exportOnlySelected: l,
  globalFilter: f,
  globalFilterPlaceholder: x,
  onGlobalFilterChange: h
}) {
  return !i && !s && !d && !u ? null : /* @__PURE__ */ a("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
    i && /* @__PURE__ */ e(
      lt,
      {
        value: f,
        onChange: (v) => h(v.target.value),
        placeholder: x,
        className: "zen-max-w-xs"
      }
    ),
    /* @__PURE__ */ a("div", { className: "zen-ml-auto zen-flex zen-items-center zen-gap-2", children: [
      u && /* @__PURE__ */ e(
        Rt,
        {
          table: n,
          filename: c,
          onlySelected: l
        }
      ),
      d && /* @__PURE__ */ e(It, { table: n }),
      s && /* @__PURE__ */ e(Lt, { table: n, enableColumnPinning: r })
    ] })
  ] });
}
function It({ table: n }) {
  const i = n.getAllColumns().filter((r) => r.getCanGroup());
  if (i.length === 0) return null;
  const s = n.getState().grouping.length;
  return /* @__PURE__ */ a(Me, { children: [
    /* @__PURE__ */ e($e, { asChild: !0, children: /* @__PURE__ */ e(H, { variant: "outline", color: "neutral", size: "sm", children: s ? `Group by (${s})` : "Group by" }) }),
    /* @__PURE__ */ a(Fe, { align: "end", className: "zen-min-w-44", children: [
      /* @__PURE__ */ e(Le, { children: "Group rows by" }),
      /* @__PURE__ */ e(He, {}),
      i.map((r) => {
        const d = typeof r.columnDef.header == "string" && r.columnDef.header || r.id;
        return /* @__PURE__ */ e(
          xn,
          {
            checked: r.getIsGrouped(),
            onCheckedChange: () => r.toggleGrouping(),
            children: d
          },
          r.id
        );
      })
    ] })
  ] });
}
function kt({
  table: n,
  renderBulkActions: i
}) {
  const s = n.getSelectedRowModel().rows, r = s.length;
  if (r === 0 || !i) return null;
  const d = n.getFilteredRowModel().rows, u = d.length, c = r === u, l = n.getIsAllPageRowsSelected(), f = u > r, x = l && !c && f, h = () => n.resetRowSelection(), v = () => {
    const S = {};
    d.forEach((I) => {
      S[I.id] = !0;
    }), n.setRowSelection(S);
  };
  return /* @__PURE__ */ a(
    "div",
    {
      className: b(
        "zen-flex zen-items-center zen-gap-3 zen-px-3 zen-py-2",
        "zen-rounded-zen-md zen-bg-zen-primary-soft zen-border zen-border-zen-primary-soft",
        "zen-text-zen-primary-soft-fg"
      ),
      role: "toolbar",
      "aria-label": "Bulk actions for selected rows",
      children: [
        /* @__PURE__ */ a(
          "span",
          {
            className: "zen-text-sm zen-font-medium",
            "aria-live": "polite",
            "aria-atomic": "true",
            children: [
              r,
              " selected"
            ]
          }
        ),
        x ? /* @__PURE__ */ a(
          "button",
          {
            type: "button",
            onClick: v,
            className: b(
              "zen-text-xs zen-underline zen-underline-offset-2",
              "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-inherit",
              "hover:zen-opacity-80",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2"
            ),
            children: [
              "Select all ",
              u,
              " matching"
            ]
          }
        ) : null,
        /* @__PURE__ */ a("div", { className: "zen-ml-auto zen-flex zen-items-center zen-gap-2", children: [
          i({ table: n, rows: s, clear: h }),
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              onClick: h,
              "aria-label": "Clear selection",
              className: b(
                "zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6",
                "zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer",
                "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10",
                "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring"
              ),
              children: /* @__PURE__ */ a("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
                /* @__PURE__ */ e("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                /* @__PURE__ */ e("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
              ] })
            }
          )
        ] })
      ]
    }
  );
}
function Nt({
  table: n
}) {
  const i = n.getState().columnFilters, s = n.getState().globalFilter, r = typeof s == "string" && s.length > 0;
  if (i.length === 0 && !r) return null;
  const d = (c) => {
    const f = n.getColumn(c)?.columnDef.header;
    return typeof f == "string" ? f : c;
  }, u = (c) => {
    if (c == null || c === "") return "";
    if (Array.isArray(c)) {
      const [l, f] = c;
      return l == null && f == null ? "" : l == null ? `≤ ${f}` : f == null ? `≥ ${l}` : `${l} – ${f}`;
    }
    if (typeof c == "object") {
      const l = c;
      return l.op && l.value !== void 0 && l.value !== null && l.value !== "" ? `${{
        contains: "≈",
        equals: "=",
        starts: "a…",
        ends: "…a",
        eq: "=",
        ne: "≠",
        gt: ">",
        lt: "<",
        gte: "≥",
        lte: "≤"
      }[l.op] ?? l.op} ${l.value}` : "";
    }
    return typeof c == "boolean" ? c ? "Yes" : "No" : String(c);
  };
  return /* @__PURE__ */ a(
    "div",
    {
      className: "zen-flex zen-flex-wrap zen-items-center zen-gap-2",
      role: "group",
      "aria-label": "Active filters",
      children: [
        /* @__PURE__ */ e("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: "Filters:" }),
        r ? /* @__PURE__ */ e(
          zn,
          {
            label: `Search: ${s}`,
            onRemove: () => n.setGlobalFilter("")
          }
        ) : null,
        i.map((c) => {
          const l = u(c.value);
          return l ? /* @__PURE__ */ e(
            zn,
            {
              label: `${d(c.id)}: ${l}`,
              onRemove: () => n.getColumn(c.id)?.setFilterValue(void 0)
            },
            c.id
          ) : null;
        }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: () => {
              n.resetColumnFilters(), n.setGlobalFilter("");
            },
            className: b(
              "zen-ml-1 zen-inline-flex zen-items-center zen-text-xs zen-px-2 zen-py-0.5 zen-rounded-zen-sm",
              "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
              "zen-bg-transparent zen-border-0 zen-cursor-pointer",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
            ),
            children: "Clear all"
          }
        )
      ]
    }
  );
}
function zn({
  label: n,
  onRemove: i
}) {
  return /* @__PURE__ */ a(
    "span",
    {
      className: b(
        "zen-inline-flex zen-items-center zen-gap-1 zen-px-2 zen-py-0.5",
        "zen-text-xs zen-font-medium",
        "zen-rounded-zen-full zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
        "zen-border zen-border-zen-primary-soft"
      ),
      children: [
        /* @__PURE__ */ e("span", { children: n }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: i,
            "aria-label": `Remove ${n}`,
            className: b(
              "zen-inline-flex zen-items-center zen-justify-center",
              "zen-h-4 zen-w-4 zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer",
              "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10",
              "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring"
            ),
            children: /* @__PURE__ */ a("svg", { width: "10", height: "10", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
              /* @__PURE__ */ e("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
              /* @__PURE__ */ e("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
            ] })
          }
        )
      ]
    }
  );
}
function Rt({
  table: n,
  filename: i,
  onlySelected: s
}) {
  const r = m.useCallback(() => {
    const l = s ? n.getSelectedRowModel().rows : n.getFilteredRowModel().rows;
    return s && l.length === 0 ? n.getFilteredRowModel().rows : l;
  }, [n, s]), d = () => n.getVisibleLeafColumns().filter((l) => !l.id.startsWith("__"));
  return /* @__PURE__ */ a(Me, { children: [
    /* @__PURE__ */ e($e, { asChild: !0, children: /* @__PURE__ */ e(H, { variant: "outline", color: "neutral", size: "sm", children: "Export" }) }),
    /* @__PURE__ */ a(Fe, { align: "end", className: "zen-min-w-44", children: [
      /* @__PURE__ */ a(Le, { children: [
        "Export ",
        s ? "selected" : "visible",
        " rows"
      ] }),
      /* @__PURE__ */ e(He, {}),
      /* @__PURE__ */ e(gn, { onSelect: () => {
        const l = d(), f = r(), x = l.map((v) => fn(Dt(v))).join(","), h = f.map(
          (v) => l.map((S) => fn(v.getValue(S.id))).join(",")
        ).join(`
`);
        mn(
          new Blob([`${x}
${h}`], { type: "text/csv;charset=utf-8" }),
          `${i}.csv`
        );
      }, children: "CSV (.csv)" }),
      /* @__PURE__ */ e(gn, { onSelect: () => {
        const l = d(), x = r().map((h) => {
          const v = {};
          return l.forEach((S) => {
            v[S.id] = h.getValue(S.id);
          }), v;
        });
        mn(
          new Blob([JSON.stringify(x, null, 2)], { type: "application/json" }),
          `${i}.json`
        );
      }, children: "JSON (.json)" })
    ] })
  ] });
}
const Dt = (n) => typeof n.columnDef.header == "string" ? n.columnDef.header : n.id, fn = (n) => {
  if (n == null) return "";
  const i = String(n);
  return /[",\n\r]/.test(i) ? `"${i.replace(/"/g, '""')}"` : i;
}, mn = (n, i) => {
  if (typeof window > "u") return;
  const s = URL.createObjectURL(n), r = document.createElement("a");
  r.href = s, r.download = i, r.style.display = "none", document.body.appendChild(r), r.click(), document.body.removeChild(r), URL.revokeObjectURL(s);
}, vn = "zen-dt:";
function Et(n) {
  if (!n || typeof window > "u") return null;
  try {
    const i = window.localStorage.getItem(vn + n);
    if (!i) return null;
    const s = JSON.parse(i);
    return s && s.v === 1 ? s : null;
  } catch {
    return null;
  }
}
function Mt(n, i) {
  if (!(!n || typeof window > "u"))
    try {
      window.localStorage.setItem(
        vn + n,
        JSON.stringify({ v: 1, ...i })
      );
    } catch {
    }
}
function $t({ id: n }) {
  const { attributes: i, listeners: s, setActivatorNodeRef: r } = ae({ id: n });
  return /* @__PURE__ */ e(
    "button",
    {
      type: "button",
      ref: r,
      ...i,
      ...s,
      "aria-label": "Drag to reorder row",
      className: b(
        "zen-cursor-grab active:zen-cursor-grabbing zen-inline-flex zen-items-center zen-justify-center",
        "zen-h-6 zen-w-6 zen-rounded-zen-sm zen-bg-transparent zen-border-0",
        "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
      ),
      children: /* @__PURE__ */ a("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": !0, children: [
        /* @__PURE__ */ e("circle", { cx: "9", cy: "6", r: "1.6" }),
        /* @__PURE__ */ e("circle", { cx: "15", cy: "6", r: "1.6" }),
        /* @__PURE__ */ e("circle", { cx: "9", cy: "12", r: "1.6" }),
        /* @__PURE__ */ e("circle", { cx: "15", cy: "12", r: "1.6" }),
        /* @__PURE__ */ e("circle", { cx: "9", cy: "18", r: "1.6" }),
        /* @__PURE__ */ e("circle", { cx: "15", cy: "18", r: "1.6" })
      ] })
    }
  );
}
function Ft({
  id: n,
  selected: i,
  className: s,
  children: r
}) {
  const {
    setNodeRef: d,
    transform: u,
    transition: c,
    isDragging: l
  } = ae({ id: n });
  return /* @__PURE__ */ e(
    E,
    {
      ref: d,
      "data-state": i ? "selected" : void 0,
      className: s,
      style: {
        transform: Ee.Transform.toString(u),
        transition: c,
        opacity: l ? 0.6 : 1,
        position: l ? "relative" : void 0,
        zIndex: l ? 1 : void 0
      },
      children: r
    }
  );
}
function Lt({
  table: n,
  enableColumnPinning: i
}) {
  const s = n.getAllColumns().filter((r) => r.getCanHide());
  return s.length === 0 ? null : /* @__PURE__ */ a(Me, { children: [
    /* @__PURE__ */ e($e, { asChild: !0, children: /* @__PURE__ */ e(H, { variant: "outline", color: "neutral", size: "sm", children: "Columns" }) }),
    /* @__PURE__ */ a(Fe, { align: "end", className: "zen-min-w-56", children: [
      /* @__PURE__ */ e(Le, { children: i ? "Manage columns" : "Toggle columns" }),
      /* @__PURE__ */ e(He, {}),
      s.map((r) => {
        const d = typeof r.columnDef.header == "string" && r.columnDef.header || r.id;
        if (!i)
          return /* @__PURE__ */ e(
            xn,
            {
              checked: r.getIsVisible(),
              onCheckedChange: (c) => r.toggleVisibility(c === !0),
              children: d
            },
            r.id
          );
        const u = r.getIsPinned();
        return /* @__PURE__ */ a(
          "div",
          {
            className: "zen-flex zen-items-center zen-gap-2 zen-px-2 zen-py-1.5 zen-text-sm",
            children: [
              /* @__PURE__ */ e(
                Ne,
                {
                  checked: r.getIsVisible(),
                  onCheckedChange: (c) => r.toggleVisibility(c === !0),
                  "aria-label": `Toggle visibility of ${d}`
                }
              ),
              /* @__PURE__ */ e("span", { className: "zen-flex-1 zen-truncate", children: d }),
              /* @__PURE__ */ e(
                pn,
                {
                  active: u === "left",
                  side: "left",
                  label: d,
                  onClick: (c) => {
                    c.preventDefault(), r.pin(u === "left" ? !1 : "left");
                  }
                }
              ),
              /* @__PURE__ */ e(
                pn,
                {
                  active: u === "right",
                  side: "right",
                  label: d,
                  onClick: (c) => {
                    c.preventDefault(), r.pin(u === "right" ? !1 : "right");
                  }
                }
              )
            ]
          },
          r.id
        );
      })
    ] })
  ] });
}
function pn({
  active: n,
  side: i,
  label: s,
  onClick: r
}) {
  return /* @__PURE__ */ e(
    "button",
    {
      type: "button",
      onClick: r,
      "aria-label": n ? `Unpin ${s} from ${i}` : `Pin ${s} to ${i}`,
      "aria-pressed": n,
      title: n ? `Unpin from ${i}` : `Pin to ${i}`,
      className: b(
        "zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6 zen-rounded-zen-sm",
        "zen-border-0 zen-cursor-pointer zen-text-xs",
        n ? "zen-bg-zen-primary zen-text-zen-primary-fg" : "zen-bg-transparent zen-text-zen-muted-fg hover:zen-bg-zen-muted hover:zen-text-zen-foreground",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
      ),
      children: i === "left" ? "◀" : "▶"
    }
  );
}
function Ht({
  header: n,
  enableColumnResizing: i,
  enableColumnOrdering: s,
  pinStyle: r,
  stickyHeader: d,
  stickyBg: u
}) {
  if (n.isPlaceholder) return /* @__PURE__ */ e(Re, {});
  const c = n.column.getCanSort(), l = n.column.getIsSorted(), f = l === "asc" ? "ascending" : l === "desc" ? "descending" : "none", x = n.column.getSortIndex() >= 0 ? n.column.getSortIndex() + 1 : null, h = n.column.getIsResizing(), v = /* @__PURE__ */ a(ce, { children: [
    c ? /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        onClick: n.column.getToggleSortingHandler(),
        "aria-label": `Sort by ${typeof n.column.columnDef.header == "string" ? n.column.columnDef.header : n.column.id}, currently ${f}`,
        className: b(
          "zen-w-full zen-h-full zen-px-2 zen-py-2",
          "zen-inline-flex zen-items-center zen-gap-1 zen-text-start zen-font-inherit zen-text-inherit",
          "zen-bg-transparent zen-border-0 zen-cursor-pointer",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset"
        ),
        children: [
          D(n.column.columnDef.header, n.getContext()),
          /* @__PURE__ */ e(yn, { state: l }),
          x !== null ? /* @__PURE__ */ e(
            "span",
            {
              "aria-hidden": !0,
              className: "zen-text-[1rem] zen-font-semibold zen-text-zen-muted-fg zen-ml-0.5",
              title: `Sort priority ${x}`,
              children: x
            }
          ) : null
        ]
      }
    ) : /* @__PURE__ */ e("span", { className: "zen-px-2 zen-py-2 zen-inline-flex zen-items-center zen-gap-1", children: D(n.column.columnDef.header, n.getContext()) }),
    i && n.column.getCanResize() ? /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        "aria-label": `Resize ${n.column.id}`,
        onMouseDown: n.getResizeHandler(),
        onTouchStart: n.getResizeHandler(),
        onClick: (M) => M.stopPropagation(),
        className: b(
          "zen-absolute zen-right-0 zen-top-0 zen-h-full zen-w-1.5 zen-cursor-col-resize zen-select-none zen-touch-none",
          "zen-bg-transparent zen-border-0 zen-p-0",
          "hover:zen-bg-zen-primary",
          h && "zen-bg-zen-primary"
        )
      }
    ) : null
  ] }), S = {
    width: n.column.getSize(),
    ...r ?? {},
    ...r ? { zIndex: d ? 11 : 1 } : {},
    ...d && !r ? { background: u ?? "var(--zen-color-background)" } : {}
  }, I = /* @__PURE__ */ e(
    Re,
    {
      "data-active": l ? "true" : void 0,
      "aria-sort": l === "asc" ? "ascending" : l === "desc" ? "descending" : void 0,
      className: b(
        "zen-p-0 zen-transition-colors zen-relative",
        c && "hover:zen-bg-zen-muted",
        "data-[active=true]:zen-bg-zen-primary-soft data-[active=true]:zen-text-zen-primary-soft-fg"
      ),
      style: S,
      children: v
    }
  );
  return s ? /* @__PURE__ */ e(Gt, { id: n.column.id, children: I }) : I;
}
function Gt({
  id: n,
  children: i
}) {
  const {
    setNodeRef: s,
    attributes: r,
    listeners: d,
    transform: u,
    transition: c,
    isDragging: l
  } = ae({ id: n }), f = i;
  return m.cloneElement(f, {
    ref: s,
    ...r,
    ...d,
    style: {
      ...f.props.style ?? {},
      transform: Ee.Transform.toString(u),
      transition: c,
      opacity: l ? 0.6 : 1,
      cursor: "grab",
      position: "relative"
    }
  });
}
const yn = ({ state: n }) => n === "asc" ? /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: /* @__PURE__ */ e("polyline", { points: "18 15 12 9 6 15" }) }) : n === "desc" ? /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: /* @__PURE__ */ e("polyline", { points: "6 9 12 15 18 9" }) }) : /* @__PURE__ */ a("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "zen-opacity-60", "aria-hidden": !0, children: [
  /* @__PURE__ */ e("polyline", { points: "8 9 12 5 16 9" }),
  /* @__PURE__ */ e("polyline", { points: "16 15 12 19 8 15" })
] });
function jt({
  table: n,
  maxHeight: i,
  estimatedRowHeight: s,
  emptyMessage: r,
  loading: d,
  enableColumnPinning: u,
  enableColumnResizing: c,
  enableColumnOrdering: l,
  enablePerColumnFilters: f,
  visibleColumnIds: x,
  onColumnDragEnd: h,
  sensors: v,
  editingCell: S,
  onStartEdit: I,
  onCommitEdit: M,
  onCancelEdit: de,
  rowClassName: G,
  headerVariant: $
}) {
  const j = $ === "branded" ? "var(--zen-color-primary-soft)" : "var(--zen-color-background)", T = m.useCallback(
    (p) => {
      if (!u) return;
      const z = p.getIsPinned();
      if (!z) return;
      const y = z === "left" && p.getIsLastColumn("left"), J = z === "right" && p.getIsFirstColumn("right");
      return {
        position: "sticky",
        left: z === "left" ? `${p.getStart("left")}px` : void 0,
        right: z === "right" ? `${p.getAfter("right")}px` : void 0,
        background: "var(--zen-color-background)",
        zIndex: 1,
        boxShadow: y ? "inset -1px 0 0 var(--zen-color-border), 4px 0 6px -4px rgba(0,0,0,0.12)" : J ? "inset 1px 0 0 var(--zen-color-border), -4px 0 6px -4px rgba(0,0,0,0.12)" : void 0
      };
    },
    [u]
  ), B = m.useCallback(
    (p) => {
      const z = T(p);
      if (z)
        return { ...z, background: j };
    },
    [T, j]
  ), X = m.useRef(null), A = n.getRowModel().rows, P = nt({
    count: A.length,
    getScrollElement: () => X.current,
    estimateSize: () => s,
    overscan: 8
  }), O = n.getVisibleLeafColumns(), W = n.getState().columnSizing, N = O.map((p) => {
    const z = W[p.id];
    if (z !== void 0) return `${z}px`;
    const y = p.columnDef.size;
    return y !== void 0 && y !== 150 ? `${y}px` : "minmax(0, 1fr)";
  }).join(" "), Z = O.length;
  return /* @__PURE__ */ a(
    "div",
    {
      ref: X,
      style: { maxHeight: i, overflow: "auto" },
      role: "table",
      "aria-rowcount": A.length + 1,
      "aria-colcount": Z,
      children: [
        /* @__PURE__ */ a(
          "div",
          {
            style: {
              position: "sticky",
              top: 0,
              zIndex: 1,
              background: j,
              borderBottom: $ === "underline" ? "2px solid var(--zen-color-primary)" : "1px solid var(--zen-color-border)"
            },
            children: [
              l ? /* @__PURE__ */ e(
                we,
                {
                  sensors: v,
                  collisionDetection: Ie,
                  onDragEnd: h,
                  children: /* @__PURE__ */ e(
                    ke,
                    {
                      items: x,
                      strategy: hn,
                      children: n.getHeaderGroups().map((p) => /* @__PURE__ */ e(
                        "div",
                        {
                          role: "row",
                          style: { display: "grid", gridTemplateColumns: N },
                          children: p.headers.map((z) => /* @__PURE__ */ e(
                            Bt,
                            {
                              header: z,
                              pinStyle: B(z.column),
                              enableColumnResizing: c,
                              branded: $ === "branded"
                            },
                            z.id
                          ))
                        },
                        p.id
                      ))
                    }
                  )
                }
              ) : n.getHeaderGroups().map((p) => /* @__PURE__ */ e(
                "div",
                {
                  role: "row",
                  style: { display: "grid", gridTemplateColumns: N },
                  children: p.headers.map((z) => /* @__PURE__ */ e(
                    Tt,
                    {
                      header: z,
                      pinStyle: B(z.column),
                      enableColumnResizing: c,
                      branded: $ === "branded"
                    },
                    z.id
                  ))
                },
                p.id
              )),
              f && n.getHeaderGroups().map((p) => /* @__PURE__ */ e(
                "div",
                {
                  role: "row",
                  style: {
                    display: "grid",
                    gridTemplateColumns: N,
                    borderTop: "1px solid var(--zen-color-border)"
                  },
                  children: p.headers.map((z) => {
                    const y = B(z.column);
                    return /* @__PURE__ */ e(
                      "div",
                      {
                        style: {
                          padding: "var(--zen-space-1)",
                          minWidth: 0,
                          background: j,
                          ...y ?? {},
                          ...y ? { zIndex: 2 } : {}
                        },
                        children: z.column.getCanFilter() && !z.id.startsWith("__") ? /* @__PURE__ */ e(bn, { column: z.column }) : null
                      },
                      `${z.id}-filter`
                    );
                  })
                },
                `${p.id}-filter`
              ))
            ]
          }
        ),
        /* @__PURE__ */ e("div", { style: { height: P.getTotalSize(), position: "relative" }, children: d ? /* @__PURE__ */ e(
          "div",
          {
            role: "row",
            style: {
              textAlign: "center",
              padding: "var(--zen-space-4)",
              color: "var(--zen-color-muted-fg)"
            },
            children: "Loading…"
          }
        ) : A.length === 0 ? /* @__PURE__ */ e(
          "div",
          {
            role: "row",
            style: {
              textAlign: "center",
              padding: "var(--zen-space-4)",
              color: "var(--zen-color-muted-fg)"
            },
            children: r
          }
        ) : P.getVirtualItems().map((p) => {
          const z = A[p.index];
          return /* @__PURE__ */ e(
            "div",
            {
              role: "row",
              "data-state": z.getIsSelected() ? "selected" : void 0,
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${p.start}px)`,
                height: p.size,
                display: "grid",
                gridTemplateColumns: N
              },
              className: b(
                "zen-border-b zen-border-zen-border zen-transition-[background-color,box-shadow,outline-color] zen-duration-100",
                "hover:zen-bg-zen-muted/50 hover:zen-shadow-zen-sm",
                // selected — bg + sm shadow + 1px primary inside outline (Zen theme spec)
                z.getIsSelected() && "zen-bg-zen-primary-soft zen-shadow-zen-sm zen-outline zen-outline-1 -zen-outline-offset-1 zen-outline-zen-primary",
                G?.(z)
              ),
              children: z.getVisibleCells().map((y) => {
                const J = T(y.column), F = S?.rowId === z.id && S?.columnId === y.column.id;
                return /* @__PURE__ */ e(
                  "div",
                  {
                    role: "cell",
                    style: {
                      padding: "var(--zen-space-2) var(--zen-space-1)",
                      display: "flex",
                      alignItems: "center",
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      ...J ?? {}
                    },
                    children: /* @__PURE__ */ e(
                      De,
                      {
                        cell: y,
                        editing: F,
                        onStartEdit: () => I(z.id, y.column.id),
                        onCommit: (ee) => M(z.id, y.column.id, ee),
                        onCancel: de,
                        children: D(y.column.columnDef.cell, y.getContext())
                      }
                    )
                  },
                  y.id
                );
              })
            },
            z.id
          );
        }) }),
        /* @__PURE__ */ a("span", { hidden: !0, "aria-hidden": !0, children: [
          Z,
          " columns"
        ] })
      ]
    }
  );
}
function Cn({
  header: n,
  enableColumnResizing: i
}) {
  const s = n.column.getCanSort(), r = n.column.getIsSorted(), d = n.column.getIsResizing();
  return /* @__PURE__ */ a(ce, { children: [
    n.isPlaceholder ? null : s ? /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        onClick: n.column.getToggleSortingHandler(),
        className: "zen-w-full zen-h-full zen-px-2 zen-py-2 zen-inline-flex zen-items-center zen-gap-1 zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-inherit zen-font-inherit focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset",
        children: [
          D(n.column.columnDef.header, n.getContext()),
          /* @__PURE__ */ e(yn, { state: r })
        ]
      }
    ) : /* @__PURE__ */ e("span", { className: "zen-px-2 zen-py-2 zen-inline-flex zen-items-center zen-gap-1", children: D(n.column.columnDef.header, n.getContext()) }),
    i && n.column.getCanResize() ? /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        "aria-label": `Resize ${n.column.id}`,
        onMouseDown: n.getResizeHandler(),
        onTouchStart: n.getResizeHandler(),
        onClick: (u) => u.stopPropagation(),
        onPointerDown: (u) => u.stopPropagation(),
        className: b(
          "zen-absolute zen-right-0 zen-top-0 zen-h-full zen-w-1.5 zen-cursor-col-resize zen-select-none zen-touch-none",
          "zen-bg-transparent zen-border-0 zen-p-0",
          "hover:zen-bg-zen-primary",
          d && "zen-bg-zen-primary"
        )
      }
    ) : null
  ] });
}
function Tt({
  header: n,
  pinStyle: i,
  enableColumnResizing: s,
  branded: r
}) {
  const d = n.column.getCanSort(), u = n.column.getIsSorted();
  return /* @__PURE__ */ e(
    "div",
    {
      role: "columnheader",
      "data-active": u ? "true" : void 0,
      "aria-sort": u === "asc" ? "ascending" : u === "desc" ? "descending" : void 0,
      className: b(
        "zen-text-sm zen-flex zen-items-center zen-transition-colors zen-relative",
        r ? "zen-font-semibold zen-text-zen-primary-soft-fg" : "zen-font-medium zen-text-zen-muted-fg",
        d && "hover:zen-bg-zen-muted",
        "data-[active=true]:zen-bg-zen-primary-soft data-[active=true]:zen-text-zen-primary-soft-fg"
      ),
      style: {
        minWidth: 0,
        ...i ?? {},
        ...i ? { zIndex: 2 } : {}
      },
      children: /* @__PURE__ */ e(
        Cn,
        {
          header: n,
          enableColumnResizing: s
        }
      )
    }
  );
}
function Bt({
  header: n,
  pinStyle: i,
  enableColumnResizing: s,
  branded: r
}) {
  const {
    setNodeRef: d,
    attributes: u,
    listeners: c,
    transform: l,
    transition: f,
    isDragging: x
  } = ae({ id: n.column.id }), h = n.column.getCanSort(), v = n.column.getIsSorted();
  return /* @__PURE__ */ e(
    "div",
    {
      ref: d,
      ...u,
      ...c,
      role: "columnheader",
      "data-active": v ? "true" : void 0,
      "aria-sort": v === "asc" ? "ascending" : v === "desc" ? "descending" : void 0,
      className: b(
        "zen-text-sm zen-flex zen-items-center zen-transition-colors zen-relative",
        r ? "zen-font-semibold zen-text-zen-primary-soft-fg" : "zen-font-medium zen-text-zen-muted-fg",
        h && "hover:zen-bg-zen-muted",
        "data-[active=true]:zen-bg-zen-primary-soft data-[active=true]:zen-text-zen-primary-soft-fg"
      ),
      style: {
        minWidth: 0,
        transform: Ee.Transform.toString(l),
        transition: f,
        opacity: x ? 0.6 : 1,
        cursor: "grab",
        ...i ?? {},
        ...i ? { zIndex: 2 } : {}
      },
      children: /* @__PURE__ */ e(
        Cn,
        {
          header: n,
          enableColumnResizing: s
        }
      )
    }
  );
}
function At({
  table: n,
  enableRowSelection: i,
  pageSizeOptions: s,
  manual: r
}) {
  const { pageIndex: d, pageSize: u } = n.getState().pagination, c = n.getPageCount(), l = n.getSelectedRowModel().rows.length, f = n.getFilteredRowModel().rows.length, x = m.useId();
  return /* @__PURE__ */ a("div", { className: "zen-flex zen-items-center zen-justify-between zen-gap-3 zen-text-sm", children: [
    /* @__PURE__ */ e("div", { className: "zen-text-zen-muted-fg", children: i ? /* @__PURE__ */ a(ce, { children: [
      l,
      " of ",
      f,
      " row(s) selected."
    ] }) : /* @__PURE__ */ a(ce, { children: [
      "Page ",
      d + 1,
      " of ",
      Math.max(c, 1)
    ] }) }),
    /* @__PURE__ */ a("div", { className: "zen-flex zen-items-center zen-gap-3", children: [
      !r && /* @__PURE__ */ a("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
        /* @__PURE__ */ e("span", { id: x, className: "zen-text-zen-muted-fg", children: "Rows per page" }),
        /* @__PURE__ */ e("div", { style: { width: 88 }, children: /* @__PURE__ */ a(
          ct,
          {
            value: String(u),
            onValueChange: (h) => n.setPageSize(Number(h)),
            children: [
              /* @__PURE__ */ e(at, { "aria-labelledby": x, children: /* @__PURE__ */ e(dt, {}) }),
              /* @__PURE__ */ e(ut, { children: s.map((h) => /* @__PURE__ */ e(gt, { value: String(h), children: h }, h)) })
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ a("div", { className: "zen-flex zen-items-center zen-gap-1", children: [
        /* @__PURE__ */ e(
          H,
          {
            variant: "outline",
            color: "neutral",
            size: "sm",
            disabled: !n.getCanPreviousPage(),
            onClick: () => n.setPageIndex(0),
            "aria-label": "First page",
            children: "«"
          }
        ),
        /* @__PURE__ */ e(
          H,
          {
            variant: "outline",
            color: "neutral",
            size: "sm",
            disabled: !n.getCanPreviousPage(),
            onClick: () => n.previousPage(),
            "aria-label": "Previous page",
            children: "‹"
          }
        ),
        /* @__PURE__ */ e(
          H,
          {
            variant: "outline",
            color: "neutral",
            size: "sm",
            disabled: !n.getCanNextPage(),
            onClick: () => n.nextPage(),
            "aria-label": "Next page",
            children: "›"
          }
        ),
        /* @__PURE__ */ e(
          H,
          {
            variant: "outline",
            color: "neutral",
            size: "sm",
            disabled: !n.getCanNextPage(),
            onClick: () => n.setPageIndex(n.getPageCount() - 1),
            "aria-label": "Last page",
            children: "»"
          }
        )
      ] })
    ] })
  ] });
}
export {
  io as DataTable,
  ft as Table,
  mt as TableBody,
  _ as TableCell,
  Re as TableHead,
  zt as TableHeader,
  E as TableRow
};
//# sourceMappingURL=index95.js.map
