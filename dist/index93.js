import { jsxs as a, jsx as n, Fragment as ce } from "react/jsx-runtime";
import * as m from "react";
import { useReactTable as Zn, flexRender as D } from "./index175.js";
import { useVirtualizer as et } from "./index176.js";
import { useSensors as nt, useSensor as dn, DndContext as we, closestCenter as Ie, KeyboardSensor as tt, PointerSensor as ot } from "./index177.js";
import { SortableContext as ke, horizontalListSortingStrategy as hn, verticalListSortingStrategy as rt, arrayMove as un, sortableKeyboardCoordinates as it, useSortable as ae } from "./index178.js";
import { CSS as Ee } from "./index179.js";
import { Button as H } from "./index64.js";
import { Checkbox as Ne } from "./index32.js";
import { DropdownMenu as Me, DropdownMenuTrigger as $e, DropdownMenuContent as Le, DropdownMenuLabel as Fe, DropdownMenuSeparator as He, DropdownMenuItem as gn, DropdownMenuCheckboxItem as xn } from "./index66.js";
import { Input as st } from "./index4.js";
import { Select as lt, SelectTrigger as ct, SelectValue as at, SelectContent as dt, SelectItem as ut } from "./index35.js";
import { TableHeader as gt, TableRow as F, TableHead as Re, Table as zt, TableBody as ft, TableCell as Q } from "./index92.js";
import { filterFnByVariant as mt, FilterCell as bn } from "./index180.js";
import { EditableCell as De } from "./index181.js";
import { cn as b } from "./index143.js";
import { getGroupedRowModel as pt, getExpandedRowModel as ht, getPaginationRowModel as xt, getFilteredRowModel as bt, getSortedRowModel as vt, getCoreRowModel as yt } from "./index182.js";
function oo({
  data: e,
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
  rowClassName: E,
  renderBulkActions: de,
  renderSubRow: j,
  expanded: M,
  onExpandedChange: G,
  enableGrouping: T = !1,
  grouping: B,
  initialGrouping: X,
  onGroupingChange: A,
  enableColumnOrdering: V = !1,
  onColumnOrderChange: _,
  enableColumnResizing: O = !1,
  enablePerColumnFilters: N = !1,
  enableFilterOperators: Z = !0,
  enableExport: p = !1,
  exportFilename: z = "data-table",
  exportOnlySelected: y = !1,
  stickyHeader: W = !1,
  enableColumnPinning: $ = !1,
  columnPinning: ee,
  initialColumnPinning: Sn,
  onColumnPinningChange: wn,
  onCellEdit: je,
  headerVariant: J = "plain",
  pageSize: ue = 10,
  pageSizeOptions: In = [10, 20, 50, 100],
  maxBodyHeight: Ge = 480,
  rowEstimatedHeight: kn = 44,
  globalFilterPlaceholder: Nn = "Search…",
  emptyMessage: Te = "No results.",
  loading: ge = !1,
  className: Rn,
  manualPagination: w,
  manualSorting: Be = !1,
  manualFiltering: Ae = !1,
  sorting: Ve,
  onSortingChange: Dn,
  columnFilters: Pe,
  onColumnFiltersChange: En,
  rowSelection: _e,
  onRowSelectionChange: Mn,
  columnVisibility: Oe,
  onColumnVisibilityChange: $n,
  globalFilter: ze,
  onGlobalFilterChange: We
}) {
  const ne = m.useMemo(
    () => Rt(I),
    [I]
  ), [Ln, Fn] = m.useState([]), [Hn, jn] = m.useState([]), [Gn, Tn] = m.useState({}), [Bn, An] = m.useState(
    () => ne?.columnVisibility ?? {}
  ), [Vn, Je] = m.useState(""), [Ue, Pn] = m.useState({
    pageIndex: 0,
    pageSize: ue
  }), [U, qe] = m.useState(
    () => ne?.columnOrder ?? []
  ), [fe, _n] = m.useState(
    () => ne?.columnSizing ?? {}
  ), [On, Wn] = m.useState(
    () => ne?.columnPinning ?? Sn ?? { left: [], right: [] }
  ), te = ee ?? On, [Jn, Un] = m.useState({}), Ye = M ?? Jn, [qn, Yn] = m.useState(
    () => X ?? []
  ), Ke = B ?? qn, [q, me] = m.useState(null), pe = m.useCallback(
    (t, o) => me({ rowId: t, columnId: o }),
    []
  ), he = m.useCallback(
    (t, o, g) => {
      me(null), je?.({ rowId: t, columnId: o, value: g });
    },
    [je]
  ), xe = m.useCallback(() => me(null), []), Qe = Ve ?? Ln, Xe = Pe ?? Hn, Ze = _e ?? Gn, Y = Oe ?? Bn, en = ze ?? Vn, oe = h && !f, re = T && !f, ie = !!j && !f || re;
  m.useEffect(() => {
  }, [f, h, j, T]);
  const be = m.useMemo(() => {
    const t = [];
    oe && t.push({
      id: "__drag__",
      header: () => /* @__PURE__ */ n("span", { className: "zen-sr-only", children: "Reorder" }),
      cell: ({ row: g }) => /* @__PURE__ */ n(Et, { id: g.id }),
      enableSorting: !1,
      enableHiding: !1,
      size: 32
    }), ie && t.push({
      id: "__expand__",
      header: () => /* @__PURE__ */ n("span", { className: "zen-sr-only", children: "Expand" }),
      cell: ({ row: g }) => /* @__PURE__ */ n(
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
          children: /* @__PURE__ */ n("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: /* @__PURE__ */ n("polyline", { points: "9 6 15 12 9 18" }) })
        }
      ),
      enableSorting: !1,
      enableHiding: !1,
      size: 32
    }), c && t.push({
      id: "__select__",
      header: ({ table: g }) => /* @__PURE__ */ n(
        Ne,
        {
          checked: g.getIsAllRowsSelected() ? !0 : g.getIsSomeRowsSelected() ? "indeterminate" : !1,
          onCheckedChange: (C) => g.toggleAllRowsSelected(C === !0),
          "aria-label": "Select all rows"
        }
      ),
      cell: ({ row: g }) => /* @__PURE__ */ n(
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
        filterFn: mt[C.filterVariant]
      } : g;
    });
    return [...t, ...o];
  }, [i, c, oe, ie]), k = Zn({
    data: e,
    columns: be,
    state: {
      sorting: Qe,
      columnFilters: Xe,
      rowSelection: Ze,
      columnVisibility: Y,
      globalFilter: en,
      columnOrder: U,
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
    enableColumnResizing: O,
    columnResizeMode: "onChange",
    enableColumnPinning: $,
    enableGrouping: re,
    getRowId: S,
    manualPagination: !!w,
    manualSorting: Be,
    manualFiltering: Ae,
    pageCount: w?.pageCount,
    onColumnOrderChange: (t) => {
      const o = typeof t == "function" ? t(U) : t;
      qe(o), _?.(o);
    },
    onColumnSizingChange: _n,
    onColumnPinningChange: (t) => {
      const o = typeof t == "function" ? t(te) : t;
      ee === void 0 && Wn(o), wn?.(o);
    },
    onExpandedChange: (t) => {
      const o = typeof t == "function" ? t(Ye) : t;
      M === void 0 && Un(o), G?.(o);
    },
    onGroupingChange: (t) => {
      const o = typeof t == "function" ? t(Ke) : t;
      B === void 0 && Yn(o), A?.(o);
    },
    onSortingChange: (t) => {
      const o = typeof t == "function" ? t(Qe) : t;
      Ve === void 0 && Fn(o), Dn?.(o);
    },
    onColumnFiltersChange: (t) => {
      const o = typeof t == "function" ? t(Xe) : t;
      Pe === void 0 && jn(o), En?.(o);
    },
    onRowSelectionChange: (t) => {
      const o = typeof t == "function" ? t(Ze) : t;
      _e === void 0 && Tn(o), Mn?.(o);
    },
    onColumnVisibilityChange: (t) => {
      const o = typeof t == "function" ? t(Y) : t;
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
      Pn(o);
    },
    getCoreRowModel: yt(),
    /* Skip the row-model functions when their corresponding manual flag
     * is set — TanStack will then trust the source data array as-is. */
    getSortedRowModel: s && !Be ? vt() : void 0,
    getFilteredRowModel: (u || N) && !Ae ? bt() : void 0,
    getPaginationRowModel: d && !w ? xt() : void 0,
    getExpandedRowModel: ie ? ht() : void 0,
    /* groupingActive (not enableGrouping) — gated off when virtualized
     * so getGroupedRowModel doesn't produce group rows that the virt
     * body would render as misleading data rows. */
    getGroupedRowModel: re ? pt() : void 0
  }), se = k.getRowModel().rows, nn = m.useCallback(
    (t) => {
      if (t.getIsGrouped()) {
        const o = t.row;
        return /* @__PURE__ */ a("div", { className: "zen-inline-flex zen-items-center zen-gap-1.5", children: [
          /* @__PURE__ */ n(
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
              children: /* @__PURE__ */ n(
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
                  children: /* @__PURE__ */ n("polyline", { points: "9 6 15 12 9 18" })
                }
              )
            }
          ),
          /* @__PURE__ */ n("span", { className: "zen-font-medium", children: D(t.column.columnDef.cell, t.getContext()) }),
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
    Dt(I, {
      columnOrder: U,
      columnSizing: fe,
      columnVisibility: Y,
      columnPinning: te
    });
  }, [I, U, fe, Y, te]);
  const ve = nt(
    dn(ot, { activationConstraint: { distance: 5 } }),
    dn(tt, { coordinateGetter: it })
  ), le = m.useMemo(() => se.map((t) => t.id), [se]), Kn = (t) => {
    const { active: o, over: g } = t;
    if (!g || o.id === g.id) return;
    const C = le.indexOf(String(o.id)), R = le.indexOf(String(g.id));
    if (C < 0 || R < 0) return;
    const L = un(le, C, R);
    v?.(L);
  }, ye = x ? "zen-border-r zen-border-zen-border last:zen-border-r-0" : "", tn = x ? "[&>th]:zen-border-r [&>th]:zen-border-zen-border [&>th:last-child]:zen-border-r-0" : "", Ce = m.useCallback(
    (t) => {
      if (!$) return;
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
    [$]
  ), P = W && !f, K = m.useMemo(
    () => k.getVisibleLeafColumns().map((t) => t.id),
    // re-derive when column order or visibility changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [k, U, Y]
  ), on = (t) => {
    const { active: o, over: g } = t;
    if (!g || o.id === g.id) return;
    const C = K.indexOf(String(o.id)), R = K.indexOf(String(g.id));
    if (C < 0 || R < 0) return;
    const L = un(K, C, R);
    qe(L), _?.(L);
  }, rn = J === "branded" ? "zen-bg-zen-primary-soft [&>th]:zen-text-zen-primary-soft-fg [&>th]:zen-font-semibold" : "", Qn = J === "underline" ? "[&_tr:last-child]:zen-border-b-2 [&_tr:last-child]:zen-border-zen-primary" : "", Se = J === "branded" ? "var(--zen-color-primary-soft)" : "var(--zen-color-background)", sn = P ? J === "branded" ? "zen-sticky zen-top-0 zen-z-10" : "zen-sticky zen-top-0 zen-z-10 zen-bg-zen-background" : "", ln = (t) => {
    const o = Ce(t);
    if (o)
      return { ...o, background: Se };
  }, cn = /* @__PURE__ */ a(gt, { className: Qn, children: [
    k.getHeaderGroups().map((t) => /* @__PURE__ */ n(
      F,
      {
        className: b(tn, sn, rn),
        children: t.headers.map((o) => /* @__PURE__ */ n(
          Lt,
          {
            header: o,
            enableColumnResizing: O,
            enableColumnOrdering: V,
            pinStyle: ln(o.column),
            stickyHeader: P,
            stickyBg: Se
          },
          o.id
        ))
      },
      t.id
    )),
    N && k.getHeaderGroups().map((t) => /* @__PURE__ */ n(
      F,
      {
        className: b(tn, sn, rn),
        style: P ? { top: "var(--zen-dt-header-h, 40px)" } : void 0,
        children: t.headers.map((o) => {
          const g = ln(o.column);
          return /* @__PURE__ */ n(
            Re,
            {
              className: "zen-px-2 zen-py-1",
              style: g ? { ...g, zIndex: P ? 11 : 1 } : P ? { background: Se } : void 0,
              children: o.column.getCanFilter() && !o.id.startsWith("__") ? /* @__PURE__ */ n(bn, { column: o.column, operators: Z }) : null
            },
            `${o.id}-filter`
          );
        })
      },
      `${t.id}-filter`
    ))
  ] }), an = /* @__PURE__ */ a(zt, { containerStyle: P ? { maxHeight: Ge } : void 0, children: [
    V ? /* @__PURE__ */ n(
      we,
      {
        sensors: ve,
        collisionDetection: Ie,
        onDragEnd: on,
        children: /* @__PURE__ */ n(
          ke,
          {
            items: K,
            strategy: hn,
            children: cn
          }
        )
      }
    ) : cn,
    /* @__PURE__ */ n(ft, { children: ge ? /* @__PURE__ */ n(F, { children: /* @__PURE__ */ n(
      Q,
      {
        colSpan: be.length,
        className: "zen-text-center zen-text-zen-muted-fg zen-py-6",
        children: "Loading…"
      }
    ) }) : se.length === 0 ? /* @__PURE__ */ n(F, { children: /* @__PURE__ */ n(
      Q,
      {
        colSpan: be.length,
        className: "zen-text-center zen-text-zen-muted-fg zen-py-6",
        children: Te
      }
    ) }) : se.map(
      (t) => oe ? /* @__PURE__ */ n(
        Mt,
        {
          id: t.id,
          selected: t.getIsSelected(),
          cellClassName: ye,
          className: E?.(t),
          children: t.getVisibleCells().map((o) => {
            const g = Ce(o.column), C = q?.rowId === t.id && q?.columnId === o.column.id;
            return /* @__PURE__ */ n(
              Q,
              {
                className: ye,
                style: g,
                children: /* @__PURE__ */ n(
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
        /* @__PURE__ */ n(
          F,
          {
            "data-state": t.getIsSelected() ? "selected" : void 0,
            "data-grouped": t.getIsGrouped() ? "true" : void 0,
            className: b(
              t.getIsGrouped() && "zen-bg-zen-muted/40 zen-font-medium",
              E?.(t)
            ),
            children: t.getVisibleCells().map((o) => {
              const g = Ce(o.column), C = q?.rowId === t.id && q?.columnId === o.column.id, R = !o.getIsGrouped() && !o.getIsAggregated() && !o.getIsPlaceholder(), L = nn(o);
              return /* @__PURE__ */ n(
                Q,
                {
                  className: ye,
                  style: g,
                  children: R ? /* @__PURE__ */ n(
                    De,
                    {
                      cell: o,
                      editing: C,
                      onStartEdit: () => pe(t.id, o.column.id),
                      onCommit: (Xn) => he(t.id, o.column.id, Xn),
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
        ie && t.getIsExpanded() && j ? /* @__PURE__ */ n(F, { "data-expanded-of": t.id, children: /* @__PURE__ */ n(
          Q,
          {
            colSpan: t.getVisibleCells().length,
            className: "zen-p-0 zen-bg-zen-muted/30",
            children: j(t)
          }
        ) }) : null
      ] }, t.id)
    ) })
  ] });
  return /* @__PURE__ */ a("div", { className: b("zen-space-y-3", Rn), children: [
    /* @__PURE__ */ n(
      Ct,
      {
        table: k,
        enableColumnFilters: u,
        enableColumnVisibility: l,
        enableColumnPinning: $,
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
    /* @__PURE__ */ n(wt, { table: k, renderBulkActions: de }),
    /* @__PURE__ */ n(It, { table: k }),
    /* @__PURE__ */ n(
      "div",
      {
        className: "zen-rounded-zen-md zen-border zen-border-zen-border",
        "aria-busy": ge || void 0,
        children: f ? /* @__PURE__ */ n(
          Ht,
          {
            table: k,
            maxHeight: Ge,
            estimatedRowHeight: kn,
            emptyMessage: Te,
            loading: ge,
            enableColumnPinning: $,
            enableColumnResizing: O,
            enableColumnOrdering: V,
            enablePerColumnFilters: N,
            visibleColumnIds: K,
            onColumnDragEnd: on,
            sensors: ve,
            editingCell: q,
            onStartEdit: pe,
            onCommitEdit: he,
            onCancelEdit: xe,
            rowClassName: E,
            headerVariant: J
          }
        ) : oe ? /* @__PURE__ */ n(
          we,
          {
            sensors: ve,
            collisionDetection: Ie,
            onDragEnd: Kn,
            children: /* @__PURE__ */ n(ke, { items: le, strategy: rt, children: an })
          }
        ) : an
      }
    ),
    (d || w) && /* @__PURE__ */ n(
      Tt,
      {
        table: k,
        enableRowSelection: c,
        pageSizeOptions: In,
        manual: !!w
      }
    )
  ] });
}
function Ct({
  table: e,
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
    i && /* @__PURE__ */ n(
      st,
      {
        value: f,
        onChange: (v) => h(v.target.value),
        placeholder: x,
        className: "zen-max-w-xs"
      }
    ),
    /* @__PURE__ */ a("div", { className: "zen-ml-auto zen-flex zen-items-center zen-gap-2", children: [
      u && /* @__PURE__ */ n(
        kt,
        {
          table: e,
          filename: c,
          onlySelected: l
        }
      ),
      d && /* @__PURE__ */ n(St, { table: e }),
      s && /* @__PURE__ */ n($t, { table: e, enableColumnPinning: r })
    ] })
  ] });
}
function St({ table: e }) {
  const i = e.getAllColumns().filter((r) => r.getCanGroup());
  if (i.length === 0) return null;
  const s = e.getState().grouping.length;
  return /* @__PURE__ */ a(Me, { children: [
    /* @__PURE__ */ n($e, { asChild: !0, children: /* @__PURE__ */ n(H, { variant: "outline", color: "neutral", size: "sm", children: s ? `Group by (${s})` : "Group by" }) }),
    /* @__PURE__ */ a(Le, { align: "end", className: "zen-min-w-44", children: [
      /* @__PURE__ */ n(Fe, { children: "Group rows by" }),
      /* @__PURE__ */ n(He, {}),
      i.map((r) => {
        const d = typeof r.columnDef.header == "string" && r.columnDef.header || r.id;
        return /* @__PURE__ */ n(
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
function wt({
  table: e,
  renderBulkActions: i
}) {
  const s = e.getSelectedRowModel().rows, r = s.length;
  if (r === 0 || !i) return null;
  const d = e.getFilteredRowModel().rows, u = d.length, c = r === u, l = e.getIsAllPageRowsSelected(), f = u > r, x = l && !c && f, h = () => e.resetRowSelection(), v = () => {
    const S = {};
    d.forEach((I) => {
      S[I.id] = !0;
    }), e.setRowSelection(S);
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
          i({ table: e, rows: s, clear: h }),
          /* @__PURE__ */ n(
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
                /* @__PURE__ */ n("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                /* @__PURE__ */ n("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
              ] })
            }
          )
        ] })
      ]
    }
  );
}
function It({
  table: e
}) {
  const i = e.getState().columnFilters, s = e.getState().globalFilter, r = typeof s == "string" && s.length > 0;
  if (i.length === 0 && !r) return null;
  const d = (c) => {
    const f = e.getColumn(c)?.columnDef.header;
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
        /* @__PURE__ */ n("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: "Filters:" }),
        r ? /* @__PURE__ */ n(
          zn,
          {
            label: `Search: ${s}`,
            onRemove: () => e.setGlobalFilter("")
          }
        ) : null,
        i.map((c) => {
          const l = u(c.value);
          return l ? /* @__PURE__ */ n(
            zn,
            {
              label: `${d(c.id)}: ${l}`,
              onRemove: () => e.getColumn(c.id)?.setFilterValue(void 0)
            },
            c.id
          ) : null;
        }),
        /* @__PURE__ */ n(
          "button",
          {
            type: "button",
            onClick: () => {
              e.resetColumnFilters(), e.setGlobalFilter("");
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
  label: e,
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
        /* @__PURE__ */ n("span", { children: e }),
        /* @__PURE__ */ n(
          "button",
          {
            type: "button",
            onClick: i,
            "aria-label": `Remove ${e}`,
            className: b(
              "zen-inline-flex zen-items-center zen-justify-center",
              "zen-h-4 zen-w-4 zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer",
              "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10",
              "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring"
            ),
            children: /* @__PURE__ */ a("svg", { width: "10", height: "10", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
              /* @__PURE__ */ n("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
              /* @__PURE__ */ n("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
            ] })
          }
        )
      ]
    }
  );
}
function kt({
  table: e,
  filename: i,
  onlySelected: s
}) {
  const r = m.useCallback(() => {
    const l = s ? e.getSelectedRowModel().rows : e.getFilteredRowModel().rows;
    return s && l.length === 0 ? e.getFilteredRowModel().rows : l;
  }, [e, s]), d = () => e.getVisibleLeafColumns().filter((l) => !l.id.startsWith("__"));
  return /* @__PURE__ */ a(Me, { children: [
    /* @__PURE__ */ n($e, { asChild: !0, children: /* @__PURE__ */ n(H, { variant: "outline", color: "neutral", size: "sm", children: "Export" }) }),
    /* @__PURE__ */ a(Le, { align: "end", className: "zen-min-w-44", children: [
      /* @__PURE__ */ a(Fe, { children: [
        "Export ",
        s ? "selected" : "visible",
        " rows"
      ] }),
      /* @__PURE__ */ n(He, {}),
      /* @__PURE__ */ n(gn, { onSelect: () => {
        const l = d(), f = r(), x = l.map((v) => fn(Nt(v))).join(","), h = f.map(
          (v) => l.map((S) => fn(v.getValue(S.id))).join(",")
        ).join(`
`);
        mn(
          new Blob([`${x}
${h}`], { type: "text/csv;charset=utf-8" }),
          `${i}.csv`
        );
      }, children: "CSV (.csv)" }),
      /* @__PURE__ */ n(gn, { onSelect: () => {
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
const Nt = (e) => typeof e.columnDef.header == "string" ? e.columnDef.header : e.id, fn = (e) => {
  if (e == null) return "";
  const i = String(e);
  return /[",\n\r]/.test(i) ? `"${i.replace(/"/g, '""')}"` : i;
}, mn = (e, i) => {
  if (typeof window > "u") return;
  const s = URL.createObjectURL(e), r = document.createElement("a");
  r.href = s, r.download = i, r.style.display = "none", document.body.appendChild(r), r.click(), document.body.removeChild(r), URL.revokeObjectURL(s);
}, vn = "zen-dt:";
function Rt(e) {
  if (!e || typeof window > "u") return null;
  try {
    const i = window.localStorage.getItem(vn + e);
    if (!i) return null;
    const s = JSON.parse(i);
    return s && s.v === 1 ? s : null;
  } catch {
    return null;
  }
}
function Dt(e, i) {
  if (!(!e || typeof window > "u"))
    try {
      window.localStorage.setItem(
        vn + e,
        JSON.stringify({ v: 1, ...i })
      );
    } catch {
    }
}
function Et({ id: e }) {
  const { attributes: i, listeners: s, setActivatorNodeRef: r } = ae({ id: e });
  return /* @__PURE__ */ n(
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
        /* @__PURE__ */ n("circle", { cx: "9", cy: "6", r: "1.6" }),
        /* @__PURE__ */ n("circle", { cx: "15", cy: "6", r: "1.6" }),
        /* @__PURE__ */ n("circle", { cx: "9", cy: "12", r: "1.6" }),
        /* @__PURE__ */ n("circle", { cx: "15", cy: "12", r: "1.6" }),
        /* @__PURE__ */ n("circle", { cx: "9", cy: "18", r: "1.6" }),
        /* @__PURE__ */ n("circle", { cx: "15", cy: "18", r: "1.6" })
      ] })
    }
  );
}
function Mt({
  id: e,
  selected: i,
  className: s,
  children: r
}) {
  const {
    setNodeRef: d,
    transform: u,
    transition: c,
    isDragging: l
  } = ae({ id: e });
  return /* @__PURE__ */ n(
    F,
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
function $t({
  table: e,
  enableColumnPinning: i
}) {
  const s = e.getAllColumns().filter((r) => r.getCanHide());
  return s.length === 0 ? null : /* @__PURE__ */ a(Me, { children: [
    /* @__PURE__ */ n($e, { asChild: !0, children: /* @__PURE__ */ n(H, { variant: "outline", color: "neutral", size: "sm", children: "Columns" }) }),
    /* @__PURE__ */ a(Le, { align: "end", className: "zen-min-w-56", children: [
      /* @__PURE__ */ n(Fe, { children: i ? "Manage columns" : "Toggle columns" }),
      /* @__PURE__ */ n(He, {}),
      s.map((r) => {
        const d = typeof r.columnDef.header == "string" && r.columnDef.header || r.id;
        if (!i)
          return /* @__PURE__ */ n(
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
              /* @__PURE__ */ n(
                Ne,
                {
                  checked: r.getIsVisible(),
                  onCheckedChange: (c) => r.toggleVisibility(c === !0),
                  "aria-label": `Toggle visibility of ${d}`
                }
              ),
              /* @__PURE__ */ n("span", { className: "zen-flex-1 zen-truncate", children: d }),
              /* @__PURE__ */ n(
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
              /* @__PURE__ */ n(
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
  active: e,
  side: i,
  label: s,
  onClick: r
}) {
  return /* @__PURE__ */ n(
    "button",
    {
      type: "button",
      onClick: r,
      "aria-label": e ? `Unpin ${s} from ${i}` : `Pin ${s} to ${i}`,
      "aria-pressed": e,
      title: e ? `Unpin from ${i}` : `Pin to ${i}`,
      className: b(
        "zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6 zen-rounded-zen-sm",
        "zen-border-0 zen-cursor-pointer zen-text-xs",
        e ? "zen-bg-zen-primary zen-text-zen-primary-fg" : "zen-bg-transparent zen-text-zen-muted-fg hover:zen-bg-zen-muted hover:zen-text-zen-foreground",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
      ),
      children: i === "left" ? "◀" : "▶"
    }
  );
}
function Lt({
  header: e,
  enableColumnResizing: i,
  enableColumnOrdering: s,
  pinStyle: r,
  stickyHeader: d,
  stickyBg: u
}) {
  if (e.isPlaceholder) return /* @__PURE__ */ n(Re, {});
  const c = e.column.getCanSort(), l = e.column.getIsSorted(), f = l === "asc" ? "ascending" : l === "desc" ? "descending" : "none", x = e.column.getSortIndex() >= 0 ? e.column.getSortIndex() + 1 : null, h = e.column.getIsResizing(), v = /* @__PURE__ */ a(ce, { children: [
    c ? /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        onClick: e.column.getToggleSortingHandler(),
        "aria-label": `Sort by ${typeof e.column.columnDef.header == "string" ? e.column.columnDef.header : e.column.id}, currently ${f}`,
        className: b(
          "zen-w-full zen-h-full zen-px-2 zen-py-2",
          "zen-inline-flex zen-items-center zen-gap-1 zen-text-start zen-font-inherit zen-text-inherit",
          "zen-bg-transparent zen-border-0 zen-cursor-pointer",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset"
        ),
        children: [
          D(e.column.columnDef.header, e.getContext()),
          /* @__PURE__ */ n(yn, { state: l }),
          x !== null ? /* @__PURE__ */ n(
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
    ) : /* @__PURE__ */ n("span", { className: "zen-px-2 zen-py-2 zen-inline-flex zen-items-center zen-gap-1", children: D(e.column.columnDef.header, e.getContext()) }),
    i && e.column.getCanResize() ? /* @__PURE__ */ n(
      "button",
      {
        type: "button",
        "aria-label": `Resize ${e.column.id}`,
        onMouseDown: e.getResizeHandler(),
        onTouchStart: e.getResizeHandler(),
        onClick: (E) => E.stopPropagation(),
        className: b(
          "zen-absolute zen-right-0 zen-top-0 zen-h-full zen-w-1.5 zen-cursor-col-resize zen-select-none zen-touch-none",
          "zen-bg-transparent zen-border-0 zen-p-0",
          "hover:zen-bg-zen-primary",
          h && "zen-bg-zen-primary"
        )
      }
    ) : null
  ] }), S = {
    width: e.column.getSize(),
    ...r ?? {},
    ...r ? { zIndex: d ? 11 : 1 } : {},
    ...d && !r ? { background: u ?? "var(--zen-color-background)" } : {}
  }, I = /* @__PURE__ */ n(
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
  return s ? /* @__PURE__ */ n(Ft, { id: e.column.id, children: I }) : I;
}
function Ft({
  id: e,
  children: i
}) {
  const {
    setNodeRef: s,
    attributes: r,
    listeners: d,
    transform: u,
    transition: c,
    isDragging: l
  } = ae({ id: e }), f = i;
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
const yn = ({ state: e }) => e === "asc" ? /* @__PURE__ */ n("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: /* @__PURE__ */ n("polyline", { points: "18 15 12 9 6 15" }) }) : e === "desc" ? /* @__PURE__ */ n("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: /* @__PURE__ */ n("polyline", { points: "6 9 12 15 18 9" }) }) : /* @__PURE__ */ a("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "zen-opacity-60", "aria-hidden": !0, children: [
  /* @__PURE__ */ n("polyline", { points: "8 9 12 5 16 9" }),
  /* @__PURE__ */ n("polyline", { points: "16 15 12 19 8 15" })
] });
function Ht({
  table: e,
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
  onCommitEdit: E,
  onCancelEdit: de,
  rowClassName: j,
  headerVariant: M
}) {
  const G = M === "branded" ? "var(--zen-color-primary-soft)" : "var(--zen-color-background)", T = m.useCallback(
    (p) => {
      if (!u) return;
      const z = p.getIsPinned();
      if (!z) return;
      const y = z === "left" && p.getIsLastColumn("left"), W = z === "right" && p.getIsFirstColumn("right");
      return {
        position: "sticky",
        left: z === "left" ? `${p.getStart("left")}px` : void 0,
        right: z === "right" ? `${p.getAfter("right")}px` : void 0,
        background: "var(--zen-color-background)",
        zIndex: 1,
        boxShadow: y ? "inset -1px 0 0 var(--zen-color-border), 4px 0 6px -4px rgba(0,0,0,0.12)" : W ? "inset 1px 0 0 var(--zen-color-border), -4px 0 6px -4px rgba(0,0,0,0.12)" : void 0
      };
    },
    [u]
  ), B = m.useCallback(
    (p) => {
      const z = T(p);
      if (z)
        return { ...z, background: G };
    },
    [T, G]
  ), X = m.useRef(null), A = e.getRowModel().rows, V = et({
    count: A.length,
    getScrollElement: () => X.current,
    estimateSize: () => s,
    overscan: 8
  }), _ = e.getVisibleLeafColumns(), O = e.getState().columnSizing, N = _.map((p) => {
    const z = O[p.id];
    if (z !== void 0) return `${z}px`;
    const y = p.columnDef.size;
    return y !== void 0 && y !== 150 ? `${y}px` : "minmax(0, 1fr)";
  }).join(" "), Z = _.length;
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
              background: G,
              borderBottom: M === "underline" ? "2px solid var(--zen-color-primary)" : "1px solid var(--zen-color-border)"
            },
            children: [
              l ? /* @__PURE__ */ n(
                we,
                {
                  sensors: v,
                  collisionDetection: Ie,
                  onDragEnd: h,
                  children: /* @__PURE__ */ n(
                    ke,
                    {
                      items: x,
                      strategy: hn,
                      children: e.getHeaderGroups().map((p) => /* @__PURE__ */ n(
                        "div",
                        {
                          role: "row",
                          style: { display: "grid", gridTemplateColumns: N },
                          children: p.headers.map((z) => /* @__PURE__ */ n(
                            Gt,
                            {
                              header: z,
                              pinStyle: B(z.column),
                              enableColumnResizing: c,
                              branded: M === "branded"
                            },
                            z.id
                          ))
                        },
                        p.id
                      ))
                    }
                  )
                }
              ) : e.getHeaderGroups().map((p) => /* @__PURE__ */ n(
                "div",
                {
                  role: "row",
                  style: { display: "grid", gridTemplateColumns: N },
                  children: p.headers.map((z) => /* @__PURE__ */ n(
                    jt,
                    {
                      header: z,
                      pinStyle: B(z.column),
                      enableColumnResizing: c,
                      branded: M === "branded"
                    },
                    z.id
                  ))
                },
                p.id
              )),
              f && e.getHeaderGroups().map((p) => /* @__PURE__ */ n(
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
                    return /* @__PURE__ */ n(
                      "div",
                      {
                        style: {
                          padding: "var(--zen-space-1)",
                          minWidth: 0,
                          background: G,
                          ...y ?? {},
                          ...y ? { zIndex: 2 } : {}
                        },
                        children: z.column.getCanFilter() && !z.id.startsWith("__") ? /* @__PURE__ */ n(bn, { column: z.column }) : null
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
        /* @__PURE__ */ n("div", { style: { height: V.getTotalSize(), position: "relative" }, children: d ? /* @__PURE__ */ n(
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
        ) : A.length === 0 ? /* @__PURE__ */ n(
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
        ) : V.getVirtualItems().map((p) => {
          const z = A[p.index];
          return /* @__PURE__ */ n(
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
                j?.(z)
              ),
              children: z.getVisibleCells().map((y) => {
                const W = T(y.column), $ = S?.rowId === z.id && S?.columnId === y.column.id;
                return /* @__PURE__ */ n(
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
                      ...W ?? {}
                    },
                    children: /* @__PURE__ */ n(
                      De,
                      {
                        cell: y,
                        editing: $,
                        onStartEdit: () => I(z.id, y.column.id),
                        onCommit: (ee) => E(z.id, y.column.id, ee),
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
  header: e,
  enableColumnResizing: i
}) {
  const s = e.column.getCanSort(), r = e.column.getIsSorted(), d = e.column.getIsResizing();
  return /* @__PURE__ */ a(ce, { children: [
    e.isPlaceholder ? null : s ? /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        onClick: e.column.getToggleSortingHandler(),
        className: "zen-w-full zen-h-full zen-px-2 zen-py-2 zen-inline-flex zen-items-center zen-gap-1 zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-inherit zen-font-inherit focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset",
        children: [
          D(e.column.columnDef.header, e.getContext()),
          /* @__PURE__ */ n(yn, { state: r })
        ]
      }
    ) : /* @__PURE__ */ n("span", { className: "zen-px-2 zen-py-2 zen-inline-flex zen-items-center zen-gap-1", children: D(e.column.columnDef.header, e.getContext()) }),
    i && e.column.getCanResize() ? /* @__PURE__ */ n(
      "button",
      {
        type: "button",
        "aria-label": `Resize ${e.column.id}`,
        onMouseDown: e.getResizeHandler(),
        onTouchStart: e.getResizeHandler(),
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
function jt({
  header: e,
  pinStyle: i,
  enableColumnResizing: s,
  branded: r
}) {
  const d = e.column.getCanSort(), u = e.column.getIsSorted();
  return /* @__PURE__ */ n(
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
      children: /* @__PURE__ */ n(
        Cn,
        {
          header: e,
          enableColumnResizing: s
        }
      )
    }
  );
}
function Gt({
  header: e,
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
  } = ae({ id: e.column.id }), h = e.column.getCanSort(), v = e.column.getIsSorted();
  return /* @__PURE__ */ n(
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
      children: /* @__PURE__ */ n(
        Cn,
        {
          header: e,
          enableColumnResizing: s
        }
      )
    }
  );
}
function Tt({
  table: e,
  enableRowSelection: i,
  pageSizeOptions: s,
  manual: r
}) {
  const { pageIndex: d, pageSize: u } = e.getState().pagination, c = e.getPageCount(), l = e.getSelectedRowModel().rows.length, f = e.getFilteredRowModel().rows.length, x = m.useId();
  return /* @__PURE__ */ a("div", { className: "zen-flex zen-items-center zen-justify-between zen-gap-3 zen-text-sm", children: [
    /* @__PURE__ */ n("div", { className: "zen-text-zen-muted-fg", children: i ? /* @__PURE__ */ a(ce, { children: [
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
        /* @__PURE__ */ n("span", { id: x, className: "zen-text-zen-muted-fg", children: "Rows per page" }),
        /* @__PURE__ */ n("div", { style: { width: 88 }, children: /* @__PURE__ */ a(
          lt,
          {
            value: String(u),
            onValueChange: (h) => e.setPageSize(Number(h)),
            children: [
              /* @__PURE__ */ n(ct, { "aria-labelledby": x, children: /* @__PURE__ */ n(at, {}) }),
              /* @__PURE__ */ n(dt, { children: s.map((h) => /* @__PURE__ */ n(ut, { value: String(h), children: h }, h)) })
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ a("div", { className: "zen-flex zen-items-center zen-gap-1", children: [
        /* @__PURE__ */ n(
          H,
          {
            variant: "outline",
            color: "neutral",
            size: "sm",
            disabled: !e.getCanPreviousPage(),
            onClick: () => e.setPageIndex(0),
            "aria-label": "First page",
            children: "«"
          }
        ),
        /* @__PURE__ */ n(
          H,
          {
            variant: "outline",
            color: "neutral",
            size: "sm",
            disabled: !e.getCanPreviousPage(),
            onClick: () => e.previousPage(),
            "aria-label": "Previous page",
            children: "‹"
          }
        ),
        /* @__PURE__ */ n(
          H,
          {
            variant: "outline",
            color: "neutral",
            size: "sm",
            disabled: !e.getCanNextPage(),
            onClick: () => e.nextPage(),
            "aria-label": "Next page",
            children: "›"
          }
        ),
        /* @__PURE__ */ n(
          H,
          {
            variant: "outline",
            color: "neutral",
            size: "sm",
            disabled: !e.getCanNextPage(),
            onClick: () => e.setPageIndex(e.getPageCount() - 1),
            "aria-label": "Last page",
            children: "»"
          }
        )
      ] })
    ] })
  ] });
}
export {
  oo as DataTable,
  zt as Table,
  ft as TableBody,
  Q as TableCell,
  Re as TableHead,
  gt as TableHeader,
  F as TableRow
};
//# sourceMappingURL=index93.js.map
