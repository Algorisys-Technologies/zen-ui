import { jsxs as b, jsx as e, Fragment as re } from "react/jsx-runtime";
import * as h from "react";
import { flushSync as Wt } from "react-dom";
import { useReactTable as Kt, flexRender as B } from "./index240.js";
import { useVirtualizer as qt } from "./index241.js";
import { useSensors as Ut, useSensor as Vn, DndContext as Be, closestCenter as Pe, KeyboardSensor as Jt, PointerSensor as Xt } from "./index242.js";
import { SortableContext as Ge, horizontalListSortingStrategy as jn, arrayMove as Ae, sortableKeyboardCoordinates as Yt, verticalListSortingStrategy as Qt, useSortable as $e } from "./index243.js";
import { CSS as Hn } from "./index244.js";
import { Button as H } from "./index71.js";
import { Checkbox as je } from "./index36.js";
import { DropdownMenu as fe, DropdownMenuTrigger as me, DropdownMenuContent as pe, DropdownMenuLabel as he, DropdownMenuItem as ze, DropdownMenuSeparator as ie, DropdownMenuCheckboxItem as Oe } from "./index73.js";
import { Input as Zt } from "./index4.js";
import { Select as eo, SelectTrigger as no, SelectValue as to, SelectContent as oo, SelectItem as ro } from "./index39.js";
import { TableHeader as io, TableRow as Ve, TableHead as He, TableFooter as so, TableCell as lo } from "./index104.js";
import { Table as Ir, TableBody as Rr } from "./index104.js";
import { filterFnByVariant as ao, FilterCell as _n, textFilterFn as co } from "./index245.js";
import { useLocale as M } from "./index90.js";
import { totalPrecision as uo, aggregate as go } from "./index246.js";
import { columnLabel as be, columnMinWidth as zo, columnResizeDelta as fo, clampColumnSize as mo, respectsColumnSizes as po, moveColumn as ho } from "./index247.js";
import { formatNumber as bo, validLocale as xo } from "./index199.js";
import { buildExportRequest as vo, EXPORT_FILE as yo } from "./index248.js";
import { EditableCell as Co } from "./index249.js";
import { BodyTable as wo, RowDragContext as So } from "./index250.js";
import { ContextMenu as ko, ContextMenuTrigger as To, ContextMenuContent as Io } from "./index75.js";
import { cn as S } from "./index197.js";
import { getGroupedRowModel as Ro, getExpandedRowModel as No, getPaginationRowModel as Do, getFilteredRowModel as Mo, getSortedRowModel as Fo, getCoreRowModel as Eo } from "./index251.js";
function Sr({
  data: n,
  columns: s,
  enableSorting: c = !1,
  enableMultiSort: a = !1,
  enablePagination: i = !1,
  enableColumnFilters: l = !1,
  enableRowSelection: g = !1,
  enableKeyboardNavigation: u = !1,
  onRowActivate: o,
  rowLabel: d,
  enableColumnVisibility: x = !1,
  toolbarPlacement: f = "top",
  enableVirtualization: m = !1,
  enableRowVirtualization: y = !1,
  enableColumnSeparators: N = !1,
  enableRowOrdering: D = !1,
  onRowOrderChange: q,
  getRowId: P,
  persistKey: v,
  rowClassName: I,
  renderBulkActions: F,
  renderSubRow: T,
  expanded: G,
  onExpandedChange: A,
  enableGrouping: J = !1,
  grouping: X,
  initialGrouping: xe,
  onGroupingChange: U,
  enableColumnOrdering: _ = !1,
  onColumnOrderChange: C,
  enableColumnResizing: p = !1,
  enablePerColumnFilters: w = !1,
  enableFilterOperators: Y = !0,
  enableExport: ve = !1,
  exportFilename: ye = "data-table",
  exportOnlySelected: Yn = !1,
  onExport: Ce,
  exportFormats: Qn,
  exportContext: Zn,
  exportTitle: et,
  stickyHeader: nt = !1,
  fillHeight: Q = !1,
  totalsOver: We,
  enableColumnPinning: $ = !1,
  respectColumnSizes: tt,
  columnPinning: Ke,
  initialColumnPinning: qe,
  onColumnPinningChange: ot,
  onCellEdit: we,
  onCellsEdit: Ue,
  enableCellNavigation: Je = !1,
  contextMenu: Se,
  headerVariant: Z = "plain",
  pageSize: ke = 10,
  pageSizeOptions: rt = [10, 20, 50, 100],
  maxBodyHeight: Xe = 480,
  rowEstimatedHeight: Ye,
  globalFilterPlaceholder: it,
  emptyMessage: st,
  loading: Te = !1,
  className: lt,
  manualPagination: E,
  manualSorting: Qe = !1,
  manualFiltering: Ze = !1,
  sorting: en,
  onSortingChange: at,
  columnFilters: nn,
  onColumnFiltersChange: ct,
  rowSelection: tn,
  onRowSelectionChange: dt,
  columnVisibility: on,
  onColumnVisibilityChange: ut,
  globalFilter: Ie,
  onGlobalFilterChange: rn
}) {
  const se = h.useMemo(
    () => _o(v),
    [v]
  ), [gt, zt] = h.useState([]), [ft, mt] = h.useState([]), [pt, ht] = h.useState({}), [bt, xt] = h.useState(
    () => se?.columnVisibility ?? {}
  ), [vt, sn] = h.useState(""), [ln, yt] = h.useState({
    pageIndex: 0,
    pageSize: ke
  }), [ee, an] = h.useState(
    () => se?.columnOrder ?? []
  ), [le, Ct] = h.useState(
    () => se?.columnSizing ?? {}
  ), [wt, St] = h.useState(
    () => se?.columnPinning ?? qe ?? { left: [], right: [] }
  ), ae = Ke ?? wt, [kt, Tt] = h.useState({}), cn = G ?? kt, [It, Rt] = h.useState(
    () => xe ?? []
  ), dn = X ?? It, [un, Re] = h.useState(null), gn = h.useCallback(
    (t, r, z) => Re(z === void 0 ? { rowId: t, columnId: r } : { rowId: t, columnId: r, seed: z }),
    []
  ), Nt = (t) => {
    if (t.length !== 0)
      if (Ue) Ue(t);
      else for (const r of t) we?.(r);
  }, zn = h.useCallback(
    (t, r, z) => {
      Re(null), we?.({ rowId: t, columnId: r, value: z });
    },
    [we]
  ), fn = h.useCallback(() => Re(null), []), mn = en ?? gt, pn = nn ?? ft, hn = tn ?? pt, ne = on ?? bt, Ne = Ie ?? vt, ce = y, j = m && !ce, O = D && !j, De = O && ce, de = J && !j, ue = !!T && !j || de;
  h.useEffect(() => {
  }, [j, D, T, J]);
  const bn = h.useRef(null), V = M(), Dt = it ?? V.t("dataTable.search"), xn = st ?? V.t("dataTable.noResults"), ge = h.useMemo(() => {
    const t = [];
    O && t.push({
      id: "__drag__",
      header: () => /* @__PURE__ */ e("span", { className: "zen-sr-only", children: V.t("dataTable.reorder") }),
      cell: ({ row: z }) => /* @__PURE__ */ e(Oo, { id: z.id }),
      enableSorting: !1,
      enableHiding: !1,
      size: 32
    }), ue && t.push({
      id: "__expand__",
      header: () => /* @__PURE__ */ e("span", { className: "zen-sr-only", children: V.t("dataTable.expand") }),
      cell: ({ row: z }) => /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          onClick: () => z.toggleExpanded(),
          "aria-expanded": z.getIsExpanded(),
          "aria-label": V.t(z.getIsExpanded() ? "dataTable.collapseRow" : "dataTable.expandRow"),
          className: S(
            "zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6",
            "zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer",
            "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            "zen-transition-transform",
            z.getIsExpanded() && "zen-rotate-90"
          ),
          children: /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: /* @__PURE__ */ e("polyline", { points: "9 6 15 12 9 18" }) })
        }
      ),
      enableSorting: !1,
      enableHiding: !1,
      size: 32
    }), g && t.push({
      id: "__select__",
      header: ({ table: z }) => /* @__PURE__ */ e(
        je,
        {
          checked: z.getIsAllRowsSelected() ? !0 : z.getIsSomeRowsSelected() ? "indeterminate" : !1,
          onCheckedChange: (R) => z.toggleAllRowsSelected(R === !0),
          "aria-label": V.t("dataTable.selectAll")
        }
      ),
      cell: ({ row: z }) => /* @__PURE__ */ e(
        je,
        {
          checked: z.getIsSelected(),
          onCheckedChange: (R) => z.toggleSelected(R === !0),
          "aria-label": V.t("dataTable.selectRow", { n: z.index + 1 })
        }
      ),
      enableSorting: !1,
      enableHiding: !1,
      size: 36
    });
    const r = s.map((z) => {
      const R = z.meta;
      if (R?.filterVariant && !z.filterFn)
        return {
          ...z,
          // The variant filterFns are data-shape-agnostic — they read via
          // row.getValue(columnId) and compare against the filter value —
          // so widening to FilterFn<TData> is safe.
          filterFn: ao[R.filterVariant]
        };
      if (!R?.filterVariant && !z.filterFn) {
        const L = z.id ?? z.accessorKey;
        if (L) return { ...z, filterFn: Ao(String(L), bn) };
      }
      return z;
    });
    return [...t, ...Lo(r, V, We)];
  }, [s, g, O, ue, V, We]), k = Kt({
    data: n,
    columns: ge,
    state: {
      sorting: mn,
      columnFilters: pn,
      rowSelection: hn,
      columnVisibility: ne,
      globalFilter: Ne,
      columnOrder: ee,
      columnSizing: le,
      columnPinning: ae,
      expanded: cn,
      grouping: dn,
      ...E ? {
        pagination: {
          pageIndex: E.pageIndex,
          pageSize: E.pageSize ?? ke
        }
      } : i ? { pagination: ln } : {}
    },
    enableSorting: c,
    enableMultiSort: a,
    enableRowSelection: g,
    enableColumnFilters: l || w,
    enableColumnResizing: p,
    columnResizeMode: "onChange",
    enableColumnPinning: $,
    enableGrouping: de,
    getRowId: P,
    manualPagination: !!E,
    manualSorting: Qe,
    manualFiltering: Ze,
    pageCount: E?.pageCount,
    onColumnOrderChange: (t) => {
      const r = typeof t == "function" ? t(ee) : t;
      an(r), C?.(r);
    },
    onColumnSizingChange: Ct,
    onColumnPinningChange: (t) => {
      const r = typeof t == "function" ? t(ae) : t;
      Ke === void 0 && St(r), ot?.(r);
    },
    onExpandedChange: (t) => {
      const r = typeof t == "function" ? t(cn) : t;
      G === void 0 && Tt(r), A?.(r);
    },
    onGroupingChange: (t) => {
      const r = typeof t == "function" ? t(dn) : t;
      X === void 0 && Rt(r), U?.(r);
    },
    onSortingChange: (t) => {
      const r = typeof t == "function" ? t(mn) : t;
      en === void 0 && zt(r), at?.(r);
    },
    onColumnFiltersChange: (t) => {
      const r = typeof t == "function" ? t(pn) : t;
      nn === void 0 && mt(r), ct?.(r);
    },
    onRowSelectionChange: (t) => {
      const r = typeof t == "function" ? t(hn) : t;
      tn === void 0 && ht(r), dt?.(r);
    },
    onColumnVisibilityChange: (t) => {
      const r = typeof t == "function" ? t(ne) : t;
      on === void 0 && xt(r), ut?.(r);
    },
    onGlobalFilterChange: (t) => {
      Ie === void 0 && sn(t), rn?.(t);
    },
    onPaginationChange: E ? (t) => {
      const r = typeof t == "function" ? t({
        pageIndex: E.pageIndex,
        pageSize: E.pageSize ?? ke
      }) : t;
      E.onPageChange(r.pageIndex);
    } : (t) => {
      const r = typeof t == "function" ? t(ln) : t;
      yt(r);
    },
    getCoreRowModel: Eo(),
    /* Skip the row-model functions when their corresponding manual flag
     * is set — TanStack will then trust the source data array as-is. */
    getSortedRowModel: c && !Qe ? Fo() : void 0,
    getFilteredRowModel: (l || w) && !Ze ? Mo() : void 0,
    getPaginationRowModel: i && !E ? Do() : void 0,
    getExpandedRowModel: ue ? No() : void 0,
    /* groupingActive (not enableGrouping) — gated off when virtualized
     * so getGroupedRowModel doesn't produce group rows that the virt
     * body would render as misleading data rows. */
    getGroupedRowModel: de ? Ro() : void 0
  });
  bn.current = k;
  const vn = k.getRowModel().rows, Mt = h.useCallback(
    (t) => {
      if (t.getIsGrouped()) {
        const r = t.row;
        return /* @__PURE__ */ b("div", { className: "zen-inline-flex zen-items-center zen-gap-1.5", children: [
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              onClick: r.getToggleExpandedHandler(),
              "aria-expanded": r.getIsExpanded(),
              "aria-label": V.t(r.getIsExpanded() ? "dataTable.collapseGroup" : "dataTable.expandGroup"),
              className: S(
                "zen-inline-flex zen-items-center zen-justify-center zen-h-5 zen-w-5 zen-rounded-zen-sm",
                "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-transition-transform",
                "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
                "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                r.getIsExpanded() && "zen-rotate-90"
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
          /* @__PURE__ */ e("span", { className: "zen-font-medium", children: B(t.column.columnDef.cell, t.getContext()) }),
          /* @__PURE__ */ b("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: [
            "(",
            r.subRows.length,
            ")"
          ] })
        ] });
      }
      return t.getIsAggregated() ? B(
        t.column.columnDef.aggregatedCell ?? t.column.columnDef.cell,
        t.getContext()
      ) : t.getIsPlaceholder() ? null : B(t.column.columnDef.cell, t.getContext());
    },
    [V]
  ), Ft = () => {
    k.setColumnOrder([]), k.setColumnSizing({}), k.setColumnVisibility({}), k.setColumnPinning(qe ?? { left: [], right: [] });
  }, yn = f === "pagination" && (i || !!E), Cn = {
    table: k,
    enableColumnVisibility: x,
    enableColumnPinning: $,
    enableColumnOrdering: _,
    onResetColumns: Ft,
    enableGrouping: de,
    enableExport: ve || !!Ce,
    exportFilename: ye,
    exportOnlySelected: Yn,
    serverExport: Ce ? {
      onExport: Ce,
      formats: Qn ?? ["xlsx", "pdf", "csv"],
      context: Zn,
      title: et,
      search: Ne
    } : void 0
  };
  h.useEffect(() => {
    $o(v, {
      columnOrder: ee,
      columnSizing: le,
      columnVisibility: ne,
      columnPinning: ae
    });
  }, [v, ee, le, ne, ae]);
  const Me = Ut(
    Vn(Xt, { activationConstraint: { distance: 5 } }),
    Vn(Jt, { coordinateGetter: Yt })
  ), te = h.useMemo(() => vn.map((t) => t.id), [vn]), Et = (t, r) => {
    q?.(Ae(te, t, r));
  }, Lt = (t) => {
    const { active: r, over: z } = t;
    if (!z || r.id === z.id) return;
    const R = te.indexOf(String(r.id)), L = te.indexOf(String(z.id));
    if (R < 0 || L < 0) return;
    const K = Ae(te, R, L);
    q?.(K);
  }, At = N ? "zen-border-r zen-border-zen-border last:zen-border-r-0" : "", wn = N ? "[&>th]:zen-border-r [&>th]:zen-border-zen-border [&>th:last-child]:zen-border-r-0" : "", Sn = h.useCallback(
    (t) => {
      if (!$) return;
      const r = t.getIsPinned();
      if (!r) return;
      const z = r === "left" && t.getIsLastColumn("left"), R = r === "right" && t.getIsFirstColumn("right");
      return {
        position: "sticky",
        left: r === "left" ? `${t.getStart("left")}px` : void 0,
        right: r === "right" ? `${t.getAfter("right")}px` : void 0,
        background: "var(--zen-color-background)",
        // Body cells: z=1 so they sit above non-pinned cells while scrolling.
        // Sticky-header cells override to z=11 below.
        zIndex: 1,
        boxShadow: z ? "inset -1px 0 0 var(--zen-color-border), 4px 0 6px -4px rgba(0,0,0,0.12)" : R ? "inset 1px 0 0 var(--zen-color-border), -4px 0 6px -4px rgba(0,0,0,0.12)" : void 0
      };
    },
    [$]
  ), W = (nt || Q || ce) && !j, oe = h.useMemo(
    () => k.getVisibleLeafColumns().map((t) => t.id),
    // re-derive when column order or visibility changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [k, ee, ne]
  ), kn = (t) => {
    const { active: r, over: z } = t;
    if (!z || r.id === z.id) return;
    const R = oe.indexOf(String(r.id)), L = oe.indexOf(String(z.id));
    if (R < 0 || L < 0) return;
    const K = Ae(oe, R, L);
    an(K), C?.(K);
  }, Tn = Z === "branded" ? "zen-bg-zen-primary-soft [&>th]:zen-text-zen-primary-soft-fg [&>th]:zen-font-semibold" : "", Vt = Z === "underline" ? "[&_tr:last-child]:zen-border-b-2 [&_tr:last-child]:zen-border-zen-primary" : "", Fe = Z === "branded" ? "var(--zen-color-primary-soft)" : "var(--zen-color-background)", In = W ? Z === "branded" ? "zen-sticky zen-top-0 zen-z-10" : "zen-sticky zen-top-0 zen-z-10 zen-bg-zen-background" : "", Rn = (t) => {
    const r = Sn(t);
    if (r)
      return { ...r, background: Fe };
  }, Nn = po({ respectColumnSizes: tt, enableColumnPinning: $, enableColumnResizing: p }) && !j, Bt = (t) => t.columns.length ? void 0 : zo(Nn, {
    size: t.getSize(),
    explicitSize: t.columnDef.size,
    resized: le[t.id] !== void 0,
    pinned: $ && !!t.getIsPinned()
  }), Pt = h.useMemo(
    () => ge.some((t) => t.footer !== void 0),
    [ge]
  ), Dn = (t) => !!t.columnDef.meta?.aggregate, Mn = k.getAllLeafColumns().some(Dn), Fn = /* @__PURE__ */ b(io, { className: Vt, children: [
    k.getHeaderGroups().map((t) => /* @__PURE__ */ e(
      Ve,
      {
        className: S(wn, In, Tn),
        children: t.headers.map((r) => /* @__PURE__ */ e(
          qo,
          {
            header: r,
            enableColumnResizing: p,
            enableColumnOrdering: _,
            pinStyle: Rn(r.column),
            minWidth: Bt(r.column),
            stickyHeader: W,
            stickyBg: Fe
          },
          r.id
        ))
      },
      t.id
    )),
    w && k.getHeaderGroups().map((t) => /* @__PURE__ */ e(
      Ve,
      {
        className: S(wn, In, Tn),
        style: W ? { top: "var(--zen-dt-header-h, 40px)" } : void 0,
        children: t.headers.map((r) => {
          const z = Rn(r.column);
          return /* @__PURE__ */ e(
            He,
            {
              className: "zen-px-2 zen-py-1",
              style: z ? { ...z, zIndex: W ? 11 : 1 } : W ? { background: Fe } : void 0,
              children: r.column.getCanFilter() && !r.id.startsWith("__") ? /* @__PURE__ */ e(_n, { column: r.column, operators: Y }) : null
            },
            `${r.id}-filter`
          );
        })
      },
      `${t.id}-filter`
    ))
  ] }), Gt = W && !Q ? { maxHeight: Xe } : void 0, jt = Pt ? /* @__PURE__ */ e(so, { "data-totals": Mn ? "" : void 0, children: k.getFooterGroups().map((t) => /* @__PURE__ */ e(Ve, { children: t.headers.map((r) => /* @__PURE__ */ e(
    lo,
    {
      colSpan: r.colSpan,
      className: Mn ? S(
        Dn(r.column) && "zen-text-end zen-tabular-nums",
        W && "zen-sticky zen-bottom-0 zen-z-[1] zen-bg-zen-muted"
      ) : void 0,
      children: r.isPlaceholder ? null : B(r.column.columnDef.footer, r.getContext())
    },
    r.id
  )) }, t.id)) }) : null, Ee = O && !De, En = /* @__PURE__ */ e(
    wo,
    {
      table: k,
      header: _ ? /* @__PURE__ */ e(Be, { sensors: Me, collisionDetection: Pe, onDragEnd: kn, children: /* @__PURE__ */ e(Ge, { items: oe, strategy: jn, children: Fn }) }) : Fn,
      footer: jt,
      loading: Te,
      emptyMessage: xn,
      colSpan: ge.length,
      containerClassName: Q ? "zen-min-h-0 zen-flex-1" : void 0,
      containerStyle: Gt,
      sepCellClass: At,
      pinStyle: Sn,
      editingCell: un,
      startEdit: gn,
      commitEdit: zn,
      cancelEdit: fn,
      rowClassName: I,
      renderCell: Mt,
      expansionEnabled: O ? !1 : ue,
      renderSubRow: O ? void 0 : T,
      rowOrderingActive: O && !De,
      keyboard: !Ee && u && !Je,
      cellNav: !Ee && Je,
      virtualize: ce,
      estimatedRowHeight: Ye,
      headerRowCount: k.getHeaderGroups().length * (w ? 2 : 1),
      rowDrag: De,
      onRowMove: Et,
      editCells: Nt,
      selectable: g,
      onRowActivate: o,
      rowLabel: d,
      menuTargets: !!Se
    }
  ), Ht = (t) => {
    const r = t, z = r?.closest?.("tr[data-row-id], tr[data-expanded-of]"), R = z?.dataset.rowId ?? z?.dataset.expandedOf;
    if (!R) return null;
    let L;
    try {
      L = k.getRow(R);
    } catch {
      return null;
    }
    const K = r?.closest?.("td[data-column]")?.dataset.column, $t = K ? k.getColumn(K) : void 0, Ot = L.getIsSelected() ? k.getSelectedRowModel().rows : [L];
    return { row: L, column: $t, selection: Ot };
  }, [Le, _t] = h.useState(null), Ln = (t) => {
    const r = Ht(t);
    Wt(() => _t(r));
  }, An = j ? /* @__PURE__ */ e(
    Jo,
    {
      table: k,
      maxHeight: Xe,
      estimatedRowHeight: Ye ?? 44,
      emptyMessage: xn,
      loading: Te,
      enableColumnPinning: $,
      enableColumnResizing: p,
      enableColumnOrdering: _,
      enablePerColumnFilters: w,
      visibleColumnIds: oe,
      onColumnDragEnd: kn,
      sensors: Me,
      editingCell: un,
      onStartEdit: gn,
      onCommitEdit: zn,
      onCancelEdit: fn,
      rowClassName: I,
      headerVariant: Z
    }
  ) : Ee ? /* @__PURE__ */ e(
    Be,
    {
      sensors: Me,
      collisionDetection: Pe,
      onDragEnd: Lt,
      children: /* @__PURE__ */ e(Ge, { items: te, strategy: Qt, children: En })
    }
  ) : En;
  return /* @__PURE__ */ b(
    "div",
    {
      className: S(
        "zen-space-y-3",
        // Wider than its container, the table scrolls inside it; without this
        // a flex parent grows the whole DataTable to the table's width instead.
        Nn && "zen-min-w-0",
        Q && "zen-flex zen-h-full zen-min-h-0 zen-flex-col [&>*]:zen-shrink-0",
        lt
      ),
      children: [
        /* @__PURE__ */ e(
          Vo,
          {
            ...Cn,
            enableColumnFilters: l,
            menusInPager: yn,
            globalFilter: Ne,
            globalFilterPlaceholder: Dt,
            onGlobalFilterChange: (t) => {
              Ie === void 0 && sn(t), rn?.(t);
            }
          }
        ),
        /* @__PURE__ */ e(Po, { table: k, renderBulkActions: F }),
        /* @__PURE__ */ e(Go, { table: k }),
        /* @__PURE__ */ e(
          "div",
          {
            className: S(
              "zen-rounded-zen-md zen-border zen-border-zen-border",
              Q && "!zen-shrink zen-flex zen-min-h-0 zen-flex-1 zen-flex-col"
            ),
            "aria-busy": Te || void 0,
            children: Se ? /* @__PURE__ */ b(ko, { children: [
              /* @__PURE__ */ e(
                To,
                {
                  className: "zen-contents",
                  disabled: !Le,
                  onContextMenuCapture: (t) => Ln(t.target),
                  onKeyDownCapture: (t) => {
                    (t.key === "ContextMenu" || t.shiftKey && t.key === "F10") && Ln(document.activeElement);
                  },
                  children: An
                }
              ),
              /* @__PURE__ */ e(Io, { className: "zen-min-w-48", children: Le && Se(Le) })
            ] }) : An
          }
        ),
        (i || E) && /* @__PURE__ */ e(
          Qo,
          {
            table: k,
            enableRowSelection: g,
            pageSizeOptions: rt,
            manual: !!E,
            menus: yn ? /* @__PURE__ */ e($n, { ...Cn }) : void 0
          }
        )
      ]
    }
  );
}
function Lo(n, s, c) {
  const a = (o) => o.meta;
  if (!n.some((o) => a(o)?.aggregate)) return n;
  const i = (o) => o.id ?? o.accessorKey ?? "", l = (o, d, x) => typeof o.aggregate == "function" ? o.aggregate(d, x) : go(d, o.aggregate), g = (o, d, x) => {
    if (o.formatTotal) return o.formatTotal(d);
    if (d == null) return "";
    const f = typeof o.aggregate == "string" ? o.aggregate : "sum";
    return typeof d == "number" ? bo(d, { locale: s.locale, precision: uo(x, f) }) : d instanceof Date ? d.toLocaleDateString(xo(s.locale)) : String(d);
  }, u = new Set(
    n.filter((o) => !a(o)?.aggregate && o.footer === void 0).map(i)
  );
  return n.map((o) => {
    const d = a(o);
    if (!d?.aggregate)
      return u.has(i(o)) ? {
        ...o,
        footer: (m) => m.table.getVisibleLeafColumns().find((y) => u.has(y.id))?.id === m.column.id ? s.t("dataTable.total") : ""
      } : o;
    const x = i(o), f = { ...o };
    return o.footer === void 0 && (f.footer = (m) => {
      const y = c === "page" ? m.table.getRowModel().rows.filter((D) => !D.getIsGrouped()) : m.table.getFilteredRowModel().rows, N = y.map((D) => D.getValue(x));
      return g(d, l(d, N, y), N);
    }), o.aggregationFn || (f.aggregationFn = (m, y) => l(d, y.map((N) => N.getValue(m)), y)), o.aggregatedCell || (f.aggregatedCell = (m) => g(d, m.getValue(), m.row.getLeafRows().map((y) => y.getValue(m.column.id)))), f;
  });
}
function Ao(n, s) {
  const c = () => s.current?.getColumn(n)?.getAutoFilterFn(), a = (l) => !!l && typeof l == "object" && "op" in l, i = (l, g, u, o) => {
    if (a(u)) return co(l, g, u);
    const d = c();
    return d ? d(l, g, u, o) : !0;
  };
  return i.autoRemove = (l, g) => a(l) ? String(l.value ?? "").trim() === "" : c()?.autoRemove?.(l, g) ?? !1, i.resolveFilterValue = (l) => a(l) ? l : c()?.resolveFilterValue?.(l) ?? l, i;
}
function Vo({
  enableColumnFilters: n,
  menusInPager: s,
  globalFilter: c,
  globalFilterPlaceholder: a,
  onGlobalFilterChange: i,
  ...l
}) {
  const g = !s && (l.enableColumnVisibility || l.enableGrouping || l.enableExport);
  return !n && !g ? null : /* @__PURE__ */ b("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
    n && /* @__PURE__ */ e(
      Zt,
      {
        value: c,
        onChange: (u) => i(u.target.value),
        placeholder: a,
        className: "zen-max-w-xs"
      }
    ),
    g && /* @__PURE__ */ e($n, { ...l, className: "zen-ml-auto" })
  ] });
}
function $n({
  table: n,
  enableColumnVisibility: s,
  enableColumnPinning: c,
  enableColumnOrdering: a,
  onResetColumns: i,
  enableGrouping: l,
  enableExport: g,
  exportFilename: u,
  exportOnlySelected: o,
  serverExport: d,
  className: x
}) {
  return /* @__PURE__ */ b("div", { className: S("zen-flex zen-items-center zen-gap-2", x), children: [
    g && d ? /* @__PURE__ */ e(Ho, { table: n, filename: u, config: d }) : g && /* @__PURE__ */ e(
      jo,
      {
        table: n,
        filename: u,
        onlySelected: o
      }
    ),
    l && /* @__PURE__ */ e(Bo, { table: n }),
    s && /* @__PURE__ */ e(
      Ko,
      {
        table: n,
        enableColumnPinning: c,
        enableColumnOrdering: a,
        onReset: i
      }
    )
  ] });
}
function Bo({ table: n }) {
  const s = M(), c = n.getAllColumns().filter((i) => i.getCanGroup());
  if (c.length === 0) return null;
  const a = n.getState().grouping.length;
  return /* @__PURE__ */ b(fe, { children: [
    /* @__PURE__ */ e(me, { asChild: !0, children: /* @__PURE__ */ e(H, { variant: "outline", color: "neutral", size: "sm", children: a ? s.t("dataTable.groupByCount", { count: a }) : s.t("dataTable.groupBy") }) }),
    /* @__PURE__ */ b(pe, { align: "end", className: "zen-min-w-44", children: [
      /* @__PURE__ */ e(he, { children: s.t("dataTable.groupRowsBy") }),
      /* @__PURE__ */ e(ie, {}),
      c.map((i) => {
        const l = typeof i.columnDef.header == "string" && i.columnDef.header || i.id;
        return /* @__PURE__ */ e(
          Oe,
          {
            checked: i.getIsGrouped(),
            onCheckedChange: () => i.toggleGrouping(),
            children: l
          },
          i.id
        );
      })
    ] })
  ] });
}
function Po({
  table: n,
  renderBulkActions: s
}) {
  const c = M(), a = n.getSelectedRowModel().rows, i = a.length;
  if (i === 0 || !s) return null;
  const l = n.getFilteredRowModel().rows, g = l.length, u = i === g, o = n.getIsAllPageRowsSelected(), d = g > i, x = o && !u && d, f = () => n.resetRowSelection(), m = () => {
    const y = {};
    l.forEach((N) => {
      y[N.id] = !0;
    }), n.setRowSelection(y);
  };
  return /* @__PURE__ */ b(
    "div",
    {
      className: S(
        "zen-flex zen-items-center zen-gap-3 zen-px-3 zen-py-2",
        "zen-rounded-zen-md zen-bg-zen-primary-soft zen-border zen-border-zen-primary-soft",
        "zen-text-zen-primary-soft-fg"
      ),
      role: "toolbar",
      "aria-label": c.t("dataTable.bulkActions"),
      children: [
        /* @__PURE__ */ e(
          "span",
          {
            className: "zen-text-sm zen-font-medium",
            "aria-live": "polite",
            "aria-atomic": "true",
            children: c.t("dataTable.nSelected", { count: i })
          }
        ),
        x ? /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: m,
            className: S(
              "zen-text-xs zen-underline zen-underline-offset-2",
              "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-inherit",
              "hover:zen-opacity-80",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2"
            ),
            children: c.t("dataTable.selectAllMatching", { count: g })
          }
        ) : null,
        /* @__PURE__ */ b("div", { className: "zen-ml-auto zen-flex zen-items-center zen-gap-2", children: [
          s({ table: n, rows: a, clear: f }),
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              onClick: f,
              "aria-label": c.t("dataTable.clearSelection"),
              className: S(
                "zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6",
                "zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer",
                "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10",
                "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring"
              ),
              children: /* @__PURE__ */ b("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
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
function Go({
  table: n
}) {
  const s = M(), c = n.getState().columnFilters, a = n.getState().globalFilter, i = typeof a == "string" && a.length > 0;
  if (c.length === 0 && !i) return null;
  const l = (u) => {
    const d = n.getColumn(u)?.columnDef.header;
    return typeof d == "string" ? d : u;
  }, g = (u) => {
    if (u == null || u === "") return "";
    if (Array.isArray(u)) {
      const [o, d] = u;
      return o == null && d == null ? "" : o == null ? `≤ ${d}` : d == null ? `≥ ${o}` : `${o} – ${d}`;
    }
    if (typeof u == "object") {
      const o = u;
      return o.op && o.value !== void 0 && o.value !== null && o.value !== "" ? `${{
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
      }[o.op] ?? o.op} ${o.value}` : "";
    }
    return typeof u == "boolean" ? u ? s.t("dataTable.yes") : s.t("dataTable.no") : String(u);
  };
  return /* @__PURE__ */ b(
    "div",
    {
      className: "zen-flex zen-flex-wrap zen-items-center zen-gap-2",
      role: "group",
      "aria-label": s.t("dataTable.activeFilters"),
      children: [
        /* @__PURE__ */ e("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: s.t("dataTable.filtersLabel") }),
        i ? /* @__PURE__ */ e(
          Bn,
          {
            label: s.t("dataTable.searchChip", { value: a }),
            onRemove: () => n.setGlobalFilter("")
          }
        ) : null,
        c.map((u) => {
          const o = g(u.value);
          return o ? /* @__PURE__ */ e(
            Bn,
            {
              label: s.t("dataTable.filterChip", { column: l(u.id), value: o }),
              onRemove: () => n.getColumn(u.id)?.setFilterValue(void 0)
            },
            u.id
          ) : null;
        }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: () => {
              n.resetColumnFilters(), n.setGlobalFilter("");
            },
            className: S(
              "zen-ml-1 zen-inline-flex zen-items-center zen-text-xs zen-px-2 zen-py-0.5 zen-rounded-zen-sm",
              "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
              "zen-bg-transparent zen-border-0 zen-cursor-pointer",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
            ),
            children: s.t("dataTable.clearAll")
          }
        )
      ]
    }
  );
}
function Bn({
  label: n,
  onRemove: s
}) {
  const c = M();
  return /* @__PURE__ */ b(
    "span",
    {
      className: S(
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
            onClick: s,
            "aria-label": c.t("dataTable.removeChip", { label: n }),
            className: S(
              "zen-inline-flex zen-items-center zen-justify-center",
              "zen-h-4 zen-w-4 zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer",
              "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10",
              "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring"
            ),
            children: /* @__PURE__ */ b("svg", { width: "10", height: "10", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
              /* @__PURE__ */ e("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
              /* @__PURE__ */ e("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
            ] })
          }
        )
      ]
    }
  );
}
function jo({
  table: n,
  filename: s,
  onlySelected: c
}) {
  const a = M(), i = h.useCallback(() => {
    const o = c ? n.getSelectedRowModel().rows : n.getFilteredRowModel().rows;
    return c && o.length === 0 ? n.getFilteredRowModel().rows : o;
  }, [n, c]), l = () => n.getVisibleLeafColumns().filter((o) => !o.id.startsWith("__")), g = () => {
    const o = l(), x = i().map((f) => {
      const m = {};
      return o.forEach((y) => {
        m[y.id] = f.getValue(y.id);
      }), m;
    });
    _e(
      new Blob([JSON.stringify(x, null, 2)], { type: "application/json" }),
      `${s}.json`
    );
  }, u = () => {
    const o = l(), d = i(), x = o.map((m) => Pn(On(m))).join(","), f = d.map(
      (m) => o.map((y) => Pn(m.getValue(y.id))).join(",")
    ).join(`
`);
    _e(
      new Blob([`${x}
${f}`], { type: "text/csv;charset=utf-8" }),
      `${s}.csv`
    );
  };
  return /* @__PURE__ */ b(fe, { children: [
    /* @__PURE__ */ e(me, { asChild: !0, children: /* @__PURE__ */ e(H, { variant: "outline", color: "neutral", size: "sm", children: a.t("dataTable.export") }) }),
    /* @__PURE__ */ b(pe, { align: "end", className: "zen-min-w-44", children: [
      /* @__PURE__ */ e(he, { children: c ? a.t("dataTable.exportSelectedRows") : a.t("dataTable.exportVisibleRows") }),
      /* @__PURE__ */ e(ie, {}),
      /* @__PURE__ */ e(ze, { onSelect: u, children: a.t("dataTable.exportCsv") }),
      /* @__PURE__ */ e(ze, { onSelect: g, children: a.t("dataTable.exportJson") })
    ] })
  ] });
}
function Ho({
  table: n,
  filename: s,
  config: c
}) {
  const a = M(), [i, l] = h.useState(null), [g, u] = h.useState(""), [o, d] = h.useState(""), [x, f] = h.useState(!1), m = n.getState().rowSelection ?? {}, y = Object.keys(m).filter((v) => m[v]), N = () => n.getVisibleLeafColumns().filter((v) => !v.id.startsWith("__")).map((v) => {
    const I = v.columnDef.meta ?? {}, F = I.exportFormat ?? (I.aggregate || I.filterVariant === "number" || I.filterVariant === "numberRange" ? { kind: "number" } : { kind: "text" }), T = F.kind !== "text" && F.kind !== "date" && F.kind !== "datetime" && F.kind !== "boolean";
    return {
      id: v.id,
      header: On(v),
      width: Math.round(v.getSize()),
      align: T ? "end" : "start",
      format: F,
      ...I.aggregate ? { total: typeof I.aggregate == "string" ? I.aggregate : "custom" } : {}
    };
  }), D = h.useRef(!1), q = async (v) => {
    if (D.current) return;
    D.current = !0, u(""), d(a.t("dataTable.exportPreparing")), l(v);
    const I = n.getState(), F = vo({
      format: v,
      filename: s,
      title: c.title,
      locale: a.locale ?? (typeof navigator < "u" ? navigator.language : void 0),
      selectedIds: x ? y : null,
      columns: N(),
      sort: I.sorting,
      search: c.search,
      columnFilters: I.columnFilters,
      grouping: I.grouping,
      context: c.context
    });
    try {
      const T = await c.onExport(v, F), G = `${s}.${yo[v].extension}`;
      if (T instanceof Blob) _e(T, G);
      else if (T && typeof T == "object" && "url" in T) {
        const A = document.createElement("a");
        A.href = T.url, A.download = T.filename ?? G, document.body.appendChild(A), A.click(), A.remove();
      }
      d(a.t("dataTable.exportReady"));
    } catch (T) {
      u(a.t("dataTable.exportFailed", { error: String(T?.message ?? T) })), d("");
    } finally {
      D.current = !1, l(null);
    }
  }, P = (v) => a.t(v === "xlsx" ? "dataTable.exportExcel" : v === "pdf" ? "dataTable.exportPdf" : "dataTable.exportCsv");
  return /* @__PURE__ */ b("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
    g ? /* @__PURE__ */ e("span", { role: "alert", className: "zen-text-sm zen-text-zen-error", "data-export-error": "", children: g }) : null,
    /* @__PURE__ */ e("span", { className: "zen-sr-only", role: "status", children: o }),
    /* @__PURE__ */ b(fe, { children: [
      /* @__PURE__ */ e(me, { asChild: !0, disabled: !!i, children: /* @__PURE__ */ e(H, { variant: "outline", color: "neutral", size: "sm", loading: !!i, children: i ? a.t("dataTable.exportPreparing") : a.t("dataTable.export") }) }),
      /* @__PURE__ */ b(pe, { align: "end", className: "zen-min-w-52", children: [
        /* @__PURE__ */ e(he, { children: a.t("dataTable.exportTo") }),
        c.formats.map((v) => /* @__PURE__ */ e(ze, { onSelect: () => {
          q(v);
        }, children: P(v) }, v)),
        y.length > 0 ? /* @__PURE__ */ b(re, { children: [
          /* @__PURE__ */ e(ie, {}),
          /* @__PURE__ */ e(
            Oe,
            {
              checked: x,
              onCheckedChange: (v) => f(v === !0),
              onSelect: (v) => v.preventDefault(),
              children: a.t("dataTable.exportOnlySelected", { count: y.length })
            }
          )
        ] }) : null
      ] })
    ] })
  ] });
}
const On = be, Pn = (n) => {
  if (n == null) return "";
  const s = String(n);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}, _e = (n, s) => {
  if (typeof window > "u") return;
  const c = URL.createObjectURL(n), a = document.createElement("a");
  a.href = c, a.download = s, a.style.display = "none", document.body.appendChild(a), a.click(), document.body.removeChild(a), URL.revokeObjectURL(c);
}, Wn = "zen-dt:";
function _o(n) {
  if (!n || typeof window > "u") return null;
  try {
    const s = window.localStorage.getItem(Wn + n);
    if (!s) return null;
    const c = JSON.parse(s);
    return c && c.v === 1 ? c : null;
  } catch {
    return null;
  }
}
function $o(n, s) {
  if (!(!n || typeof window > "u"))
    try {
      window.localStorage.setItem(
        Wn + n,
        JSON.stringify({ v: 1, ...s })
      );
    } catch {
    }
}
const Kn = S(
  "zen-cursor-grab active:zen-cursor-grabbing zen-inline-flex zen-items-center zen-justify-center",
  "zen-h-6 zen-w-6 zen-rounded-zen-sm zen-bg-transparent zen-border-0",
  "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
), qn = () => /* @__PURE__ */ b("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": !0, children: [
  /* @__PURE__ */ e("circle", { cx: "9", cy: "6", r: "1.6" }),
  /* @__PURE__ */ e("circle", { cx: "15", cy: "6", r: "1.6" }),
  /* @__PURE__ */ e("circle", { cx: "9", cy: "12", r: "1.6" }),
  /* @__PURE__ */ e("circle", { cx: "15", cy: "12", r: "1.6" }),
  /* @__PURE__ */ e("circle", { cx: "9", cy: "18", r: "1.6" }),
  /* @__PURE__ */ e("circle", { cx: "15", cy: "18", r: "1.6" })
] });
function Oo({ id: n }) {
  const s = M(), c = h.useContext(So);
  return c?.active ? /* @__PURE__ */ e(
    "button",
    {
      type: "button",
      "aria-label": s.t("dataTable.dragRow"),
      className: S(Kn, "zen-touch-none"),
      onPointerDown: (a) => c.start(n, a),
      children: /* @__PURE__ */ e(qn, {})
    }
  ) : /* @__PURE__ */ e(Wo, { id: n });
}
function Wo({ id: n }) {
  const s = M(), { attributes: c, listeners: a, setActivatorNodeRef: i } = $e({ id: n });
  return /* @__PURE__ */ e(
    "button",
    {
      type: "button",
      ref: i,
      ...c,
      ...a,
      "aria-label": s.t("dataTable.dragRow"),
      className: Kn,
      children: /* @__PURE__ */ e(qn, {})
    }
  );
}
function Ko({
  table: n,
  enableColumnPinning: s,
  enableColumnOrdering: c,
  onReset: a
}) {
  const i = M(), l = h.useRef(null), g = n.getAllLeafColumns().filter((o) => o.getCanHide());
  if (g.length === 0) return null;
  const u = (o, d) => {
    if (!c || !o.altKey || o.ctrlKey || o.metaKey) return;
    const x = o.key === "ArrowUp" ? "earlier" : o.key === "ArrowDown" ? "later" : null;
    if (!x) return;
    o.preventDefault(), o.stopPropagation();
    const f = ho(
      n.getAllLeafColumns().map((m) => m.id),
      d,
      x,
      g.map((m) => m.id)
    );
    f && (n.setColumnOrder(f), requestAnimationFrame(
      () => l.current?.querySelector(`[data-column-id="${window.CSS.escape(d)}"]`)?.focus()
    ));
  };
  return /* @__PURE__ */ b(fe, { children: [
    /* @__PURE__ */ e(me, { asChild: !0, children: /* @__PURE__ */ e(H, { variant: "outline", color: "neutral", size: "sm", children: i.t("dataTable.columns") }) }),
    /* @__PURE__ */ b(pe, { ref: l, align: "end", className: "zen-min-w-56", children: [
      /* @__PURE__ */ e(he, { children: s ? i.t("dataTable.manageColumns") : i.t("dataTable.toggleColumns") }),
      /* @__PURE__ */ e(ie, {}),
      g.map((o) => {
        const d = be(o);
        if (!s)
          return /* @__PURE__ */ e(
            Oe,
            {
              "data-column-id": o.id,
              "aria-keyshortcuts": c ? "Alt+ArrowUp Alt+ArrowDown" : void 0,
              checked: o.getIsVisible(),
              onCheckedChange: (f) => o.toggleVisibility(f === !0),
              onKeyDown: (f) => u(f, o.id),
              children: d
            },
            o.id
          );
        const x = o.getIsPinned();
        return /* @__PURE__ */ b(
          "div",
          {
            className: "zen-flex zen-items-center zen-gap-2 zen-px-2 zen-py-1.5 zen-text-sm",
            children: [
              /* @__PURE__ */ e(
                je,
                {
                  checked: o.getIsVisible(),
                  onCheckedChange: (f) => o.toggleVisibility(f === !0),
                  "aria-label": i.t("dataTable.toggleColumn", { label: d })
                }
              ),
              /* @__PURE__ */ e("span", { className: "zen-flex-1 zen-truncate", children: d }),
              /* @__PURE__ */ e(
                Gn,
                {
                  active: x === "left",
                  side: "left",
                  label: d,
                  onClick: (f) => {
                    f.preventDefault(), o.pin(x === "left" ? !1 : "left");
                  }
                }
              ),
              /* @__PURE__ */ e(
                Gn,
                {
                  active: x === "right",
                  side: "right",
                  label: d,
                  onClick: (f) => {
                    f.preventDefault(), o.pin(x === "right" ? !1 : "right");
                  }
                }
              )
            ]
          },
          o.id
        );
      }),
      /* @__PURE__ */ e(ie, {}),
      /* @__PURE__ */ e(ze, { onSelect: () => a(), children: i.t("dataTable.resetColumns") }),
      c && !s ? /* @__PURE__ */ e("p", { className: "zen-m-0 zen-px-2 zen-pb-1 zen-pt-1.5 zen-text-xs zen-text-zen-muted-fg", "aria-hidden": "true", children: i.t("dataTable.moveColumnHint") }) : null
    ] })
  ] });
}
function Gn({
  active: n,
  side: s,
  label: c,
  onClick: a
}) {
  const i = M(), l = i.t(s === "left" ? "dataTable.sideLeft" : "dataTable.sideRight");
  return /* @__PURE__ */ e(
    "button",
    {
      type: "button",
      onClick: a,
      "aria-label": i.t(n ? "dataTable.unpinColumnFrom" : "dataTable.pinColumnTo", { label: c, side: l }),
      "aria-pressed": n,
      title: i.t(n ? "dataTable.unpinFrom" : "dataTable.pinTo", { side: l }),
      className: S(
        "zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6 zen-rounded-zen-sm",
        "zen-border-0 zen-cursor-pointer zen-text-xs",
        n ? "zen-bg-zen-primary zen-text-zen-primary-fg" : "zen-bg-transparent zen-text-zen-muted-fg hover:zen-bg-zen-muted hover:zen-text-zen-foreground",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
      ),
      children: s === "left" ? "◀" : "▶"
    }
  );
}
function Un({
  header: n,
  resizing: s,
  stopPointerDown: c
}) {
  const a = M(), i = n.column, l = i.columnDef.maxSize;
  return /* @__PURE__ */ e(
    "div",
    {
      role: "separator",
      tabIndex: 0,
      "aria-orientation": "vertical",
      "aria-label": a.t("dataTable.resize", { column: be(i) }),
      "aria-valuenow": Math.round(i.getSize()),
      "aria-valuemin": i.columnDef.minSize ?? 20,
      "aria-valuemax": l !== void 0 && l < Number.MAX_SAFE_INTEGER ? l : void 0,
      onMouseDown: n.getResizeHandler(),
      onTouchStart: n.getResizeHandler(),
      onClick: (g) => g.stopPropagation(),
      onPointerDown: c ? (g) => g.stopPropagation() : void 0,
      onKeyDown: (g) => {
        const u = getComputedStyle(g.currentTarget).direction === "rtl", o = fo(g.key, { shift: g.shiftKey, rtl: u });
        if (o === null) return;
        g.preventDefault(), g.stopPropagation();
        const d = mo(i.getSize(), o, i.columnDef.minSize, i.columnDef.maxSize);
        n.getContext().table.setColumnSizing((x) => ({ ...x, [i.id]: d }));
      },
      className: S(
        "zen-absolute zen-right-0 zen-top-0 zen-h-full zen-w-1.5 zen-cursor-col-resize zen-select-none zen-touch-none",
        "zen-bg-transparent zen-border-0 zen-p-0",
        "hover:zen-bg-zen-primary focus-visible:zen-bg-zen-primary focus-visible:zen-outline-none",
        s && "zen-bg-zen-primary"
      )
    }
  );
}
function qo({
  header: n,
  enableColumnResizing: s,
  enableColumnOrdering: c,
  pinStyle: a,
  minWidth: i,
  stickyHeader: l,
  stickyBg: g
}) {
  const u = M();
  if (n.isPlaceholder) return /* @__PURE__ */ e(He, {});
  const o = n.column.getCanSort(), d = n.column.getIsSorted(), x = d === "asc" ? u.t("dataTable.sortAscending") : d === "desc" ? u.t("dataTable.sortDescending") : u.t("dataTable.sortNone"), f = n.getContext().table.getState().sorting.length > 1 && n.column.getSortIndex() >= 0 ? n.column.getSortIndex() + 1 : null, m = n.column.getIsResizing(), y = /* @__PURE__ */ b(re, { children: [
    o ? /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        onClick: n.column.getToggleSortingHandler(),
        "aria-label": u.t("dataTable.sortBy", {
          column: be(n.column),
          state: x
        }),
        className: S(
          "zen-w-full zen-h-full zen-[padding-inline:var(--zen-table-cell-padding-x)] zen-py-2",
          // A <button> resets text-transform and letter-spacing in the UA
          // stylesheet, so without these the header's head tokens (uppercase,
          // tracking) stopped at the label.
          "zen-inline-flex zen-items-center zen-gap-1 zen-text-start zen-font-inherit zen-text-inherit zen-[text-transform:inherit] zen-[letter-spacing:inherit]",
          "zen-bg-transparent zen-border-0 zen-cursor-pointer",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset"
        ),
        children: [
          B(n.column.columnDef.header, n.getContext()),
          /* @__PURE__ */ e(Jn, { state: d }),
          f !== null ? /* @__PURE__ */ e(
            "span",
            {
              "aria-hidden": !0,
              className: "zen-font-semibold zen-text-zen-muted-fg zen-ml-0.5",
              title: u.t("dataTable.sortPriority", { n: f }),
              children: f
            }
          ) : null
        ]
      }
    ) : /* @__PURE__ */ e("span", { className: "zen-[padding-inline:var(--zen-table-cell-padding-x)] zen-py-2 zen-inline-flex zen-items-center zen-gap-1", children: B(n.column.columnDef.header, n.getContext()) }),
    s && n.column.getCanResize() ? /* @__PURE__ */ e(Un, { header: n, resizing: m }) : null
  ] }), N = {
    width: n.column.getSize(),
    ...i !== void 0 ? { minWidth: i } : {},
    ...a ?? {},
    ...a ? { zIndex: l ? 11 : 1 } : {},
    ...l && !a ? { background: g ?? "var(--zen-color-background)" } : {}
  }, D = /* @__PURE__ */ e(
    He,
    {
      "data-active": d ? "true" : void 0,
      "aria-sort": d === "asc" ? "ascending" : d === "desc" ? "descending" : void 0,
      className: S(
        "zen-p-0 zen-transition-colors zen-relative",
        o && "hover:zen-bg-zen-muted",
        "data-[active=true]:zen-bg-zen-primary-soft data-[active=true]:zen-text-zen-primary-soft-fg"
      ),
      style: N,
      children: y
    }
  );
  return c ? /* @__PURE__ */ e(Uo, { id: n.column.id, children: D }) : D;
}
function Uo({
  id: n,
  children: s
}) {
  const {
    setNodeRef: c,
    attributes: a,
    listeners: i,
    transform: l,
    transition: g,
    isDragging: u
  } = $e({ id: n }), o = s;
  return h.cloneElement(o, {
    ref: c,
    ...a,
    ...i,
    style: {
      ...o.props.style ?? {},
      transform: Hn.Transform.toString(l),
      transition: g,
      opacity: u ? 0.6 : 1,
      cursor: "grab",
      position: "relative"
    }
  });
}
const Jn = ({ state: n }) => n === "asc" ? /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: /* @__PURE__ */ e("polyline", { points: "18 15 12 9 6 15" }) }) : n === "desc" ? /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: /* @__PURE__ */ e("polyline", { points: "6 9 12 15 18 9" }) }) : /* @__PURE__ */ b("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "zen-opacity-60", "aria-hidden": !0, children: [
  /* @__PURE__ */ e("polyline", { points: "8 9 12 5 16 9" }),
  /* @__PURE__ */ e("polyline", { points: "16 15 12 19 8 15" })
] });
function Jo({
  table: n,
  maxHeight: s,
  estimatedRowHeight: c,
  emptyMessage: a,
  loading: i,
  enableColumnPinning: l,
  enableColumnResizing: g,
  enableColumnOrdering: u,
  enablePerColumnFilters: o,
  visibleColumnIds: d,
  onColumnDragEnd: x,
  sensors: f,
  editingCell: m,
  onStartEdit: y,
  onCommitEdit: N,
  onCancelEdit: D,
  rowClassName: q,
  headerVariant: P
}) {
  const v = M(), I = P === "branded" ? "var(--zen-color-primary-soft)" : "var(--zen-color-background)", F = h.useCallback(
    (C) => {
      if (!l) return;
      const p = C.getIsPinned();
      if (!p) return;
      const w = p === "left" && C.getIsLastColumn("left"), Y = p === "right" && C.getIsFirstColumn("right");
      return {
        position: "sticky",
        left: p === "left" ? `${C.getStart("left")}px` : void 0,
        right: p === "right" ? `${C.getAfter("right")}px` : void 0,
        background: "var(--zen-color-background)",
        zIndex: 1,
        boxShadow: w ? "inset -1px 0 0 var(--zen-color-border), 4px 0 6px -4px rgba(0,0,0,0.12)" : Y ? "inset 1px 0 0 var(--zen-color-border), -4px 0 6px -4px rgba(0,0,0,0.12)" : void 0
      };
    },
    [l]
  ), T = h.useCallback(
    (C) => {
      const p = F(C);
      if (p)
        return { ...p, background: I };
    },
    [F, I]
  ), G = h.useRef(null), A = n.getRowModel().rows, J = qt({
    count: A.length,
    getScrollElement: () => G.current,
    estimateSize: () => c,
    overscan: 8
  }), X = n.getVisibleLeafColumns(), xe = n.getState().columnSizing, U = X.map((C) => {
    const p = xe[C.id];
    if (p !== void 0) return `${p}px`;
    const w = C.columnDef.size;
    return w !== void 0 && w !== 150 ? `${w}px` : "minmax(0, 1fr)";
  }).join(" "), _ = X.length;
  return /* @__PURE__ */ b(
    "div",
    {
      ref: G,
      style: { maxHeight: s, overflow: "auto" },
      role: "table",
      "aria-rowcount": A.length + 1,
      "aria-colcount": _,
      children: [
        /* @__PURE__ */ b(
          "div",
          {
            style: {
              position: "sticky",
              top: 0,
              zIndex: 1,
              background: I,
              borderBottom: P === "underline" ? "2px solid var(--zen-color-primary)" : "1px solid var(--zen-color-border)"
            },
            children: [
              u ? /* @__PURE__ */ e(
                Be,
                {
                  sensors: f,
                  collisionDetection: Pe,
                  onDragEnd: x,
                  children: /* @__PURE__ */ e(
                    Ge,
                    {
                      items: d,
                      strategy: jn,
                      children: n.getHeaderGroups().map((C) => /* @__PURE__ */ e(
                        "div",
                        {
                          role: "row",
                          style: { display: "grid", gridTemplateColumns: U },
                          children: C.headers.map((p) => /* @__PURE__ */ e(
                            Yo,
                            {
                              header: p,
                              pinStyle: T(p.column),
                              enableColumnResizing: g,
                              branded: P === "branded"
                            },
                            p.id
                          ))
                        },
                        C.id
                      ))
                    }
                  )
                }
              ) : n.getHeaderGroups().map((C) => /* @__PURE__ */ e(
                "div",
                {
                  role: "row",
                  style: { display: "grid", gridTemplateColumns: U },
                  children: C.headers.map((p) => /* @__PURE__ */ e(
                    Xo,
                    {
                      header: p,
                      pinStyle: T(p.column),
                      enableColumnResizing: g,
                      branded: P === "branded"
                    },
                    p.id
                  ))
                },
                C.id
              )),
              o && n.getHeaderGroups().map((C) => /* @__PURE__ */ e(
                "div",
                {
                  role: "row",
                  style: {
                    display: "grid",
                    gridTemplateColumns: U,
                    borderTop: "1px solid var(--zen-color-border)"
                  },
                  children: C.headers.map((p) => {
                    const w = T(p.column);
                    return /* @__PURE__ */ e(
                      "div",
                      {
                        style: {
                          padding: "var(--zen-space-1)",
                          minWidth: 0,
                          background: I,
                          ...w ?? {},
                          ...w ? { zIndex: 2 } : {}
                        },
                        children: p.column.getCanFilter() && !p.id.startsWith("__") ? /* @__PURE__ */ e(_n, { column: p.column }) : null
                      },
                      `${p.id}-filter`
                    );
                  })
                },
                `${C.id}-filter`
              ))
            ]
          }
        ),
        /* @__PURE__ */ e("div", { style: { height: J.getTotalSize(), position: "relative" }, children: i ? /* @__PURE__ */ e(
          "div",
          {
            role: "row",
            style: {
              textAlign: "center",
              padding: "var(--zen-space-4)",
              color: "var(--zen-color-muted-fg)"
            },
            children: v.t("dataTable.loading")
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
            children: a
          }
        ) : J.getVirtualItems().map((C) => {
          const p = A[C.index];
          return /* @__PURE__ */ e(
            "div",
            {
              role: "row",
              "data-state": p.getIsSelected() ? "selected" : void 0,
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${C.start}px)`,
                height: C.size,
                display: "grid",
                gridTemplateColumns: U
              },
              className: S(
                "zen-border-b zen-border-zen-border zen-transition-[background-color,box-shadow,outline-color] zen-duration-100",
                "hover:zen-bg-zen-muted/50 hover:zen-shadow-zen-sm",
                // selected — bg + sm shadow + 1px primary inside outline (Zen theme spec)
                p.getIsSelected() && "zen-bg-zen-primary-soft zen-shadow-zen-sm zen-outline zen-outline-1 -zen-outline-offset-1 zen-outline-zen-primary",
                q?.(p)
              ),
              children: p.getVisibleCells().map((w) => {
                const Y = F(w.column), ve = m?.rowId === p.id && m?.columnId === w.column.id;
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
                      ...Y ?? {}
                    },
                    children: /* @__PURE__ */ e(
                      Co,
                      {
                        cell: w,
                        editing: ve,
                        onStartEdit: () => y(p.id, w.column.id),
                        onCommit: (ye) => N(p.id, w.column.id, ye),
                        onCancel: D,
                        children: B(w.column.columnDef.cell, w.getContext())
                      }
                    )
                  },
                  w.id
                );
              })
            },
            p.id
          );
        }) }),
        /* @__PURE__ */ b("span", { hidden: !0, "aria-hidden": !0, children: [
          _,
          " columns"
        ] })
      ]
    }
  );
}
function Xn({
  header: n,
  enableColumnResizing: s
}) {
  const c = n.column.getCanSort(), a = n.column.getIsSorted(), i = n.column.getIsResizing();
  return /* @__PURE__ */ b(re, { children: [
    n.isPlaceholder ? null : c ? /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        onClick: n.column.getToggleSortingHandler(),
        className: "zen-w-full zen-h-full zen-[padding-inline:var(--zen-table-cell-padding-x)] zen-py-2 zen-inline-flex zen-items-center zen-gap-1 zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-inherit zen-font-inherit zen-[text-transform:inherit] zen-[letter-spacing:inherit] focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset",
        children: [
          B(n.column.columnDef.header, n.getContext()),
          /* @__PURE__ */ e(Jn, { state: a })
        ]
      }
    ) : /* @__PURE__ */ e("span", { className: "zen-[padding-inline:var(--zen-table-cell-padding-x)] zen-py-2 zen-inline-flex zen-items-center zen-gap-1", children: B(n.column.columnDef.header, n.getContext()) }),
    s && n.column.getCanResize() ? /* @__PURE__ */ e(Un, { header: n, resizing: i, stopPointerDown: !0 }) : null
  ] });
}
function Xo({
  header: n,
  pinStyle: s,
  enableColumnResizing: c,
  branded: a
}) {
  const i = n.column.getCanSort(), l = n.column.getIsSorted();
  return /* @__PURE__ */ e(
    "div",
    {
      role: "columnheader",
      "data-active": l ? "true" : void 0,
      "aria-sort": l === "asc" ? "ascending" : l === "desc" ? "descending" : void 0,
      className: S(
        "zen-text-sm zen-flex zen-items-center zen-transition-colors zen-relative",
        a ? "zen-font-semibold zen-text-zen-primary-soft-fg" : "zen-font-medium zen-text-zen-muted-fg",
        i && "hover:zen-bg-zen-muted",
        "data-[active=true]:zen-bg-zen-primary-soft data-[active=true]:zen-text-zen-primary-soft-fg"
      ),
      style: {
        minWidth: 0,
        ...s ?? {},
        ...s ? { zIndex: 2 } : {}
      },
      children: /* @__PURE__ */ e(
        Xn,
        {
          header: n,
          enableColumnResizing: c
        }
      )
    }
  );
}
function Yo({
  header: n,
  pinStyle: s,
  enableColumnResizing: c,
  branded: a
}) {
  const {
    setNodeRef: i,
    attributes: l,
    listeners: g,
    transform: u,
    transition: o,
    isDragging: d
  } = $e({ id: n.column.id }), x = n.column.getCanSort(), f = n.column.getIsSorted();
  return /* @__PURE__ */ e(
    "div",
    {
      ref: i,
      ...l,
      ...g,
      role: "columnheader",
      "data-active": f ? "true" : void 0,
      "aria-sort": f === "asc" ? "ascending" : f === "desc" ? "descending" : void 0,
      className: S(
        "zen-text-sm zen-flex zen-items-center zen-transition-colors zen-relative",
        a ? "zen-font-semibold zen-text-zen-primary-soft-fg" : "zen-font-medium zen-text-zen-muted-fg",
        x && "hover:zen-bg-zen-muted",
        "data-[active=true]:zen-bg-zen-primary-soft data-[active=true]:zen-text-zen-primary-soft-fg"
      ),
      style: {
        minWidth: 0,
        transform: Hn.Transform.toString(u),
        transition: o,
        opacity: d ? 0.6 : 1,
        cursor: "grab",
        ...s ?? {},
        ...s ? { zIndex: 2 } : {}
      },
      children: /* @__PURE__ */ e(
        Xn,
        {
          header: n,
          enableColumnResizing: c
        }
      )
    }
  );
}
function Qo({
  table: n,
  enableRowSelection: s,
  pageSizeOptions: c,
  manual: a,
  menus: i
}) {
  const l = M(), { pageIndex: g, pageSize: u } = n.getState().pagination, o = n.getPageCount(), d = n.getSelectedRowModel().rows.length, x = n.getFilteredRowModel().rows.length, f = h.useId();
  return /* @__PURE__ */ b("div", { className: "zen-flex zen-items-center zen-justify-between zen-gap-3 zen-text-sm", children: [
    /* @__PURE__ */ e("div", { className: "zen-text-zen-muted-fg", children: s ? /* @__PURE__ */ e(re, { children: l.t("dataTable.selectedOf", { selected: d, total: x }) }) : /* @__PURE__ */ e(re, { children: l.t("dataTable.pageOf", { page: g + 1, pages: Math.max(o, 1) }) }) }),
    /* @__PURE__ */ b("div", { className: "zen-flex zen-items-center zen-gap-3", children: [
      i,
      !a && /* @__PURE__ */ b("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
        /* @__PURE__ */ e("span", { id: f, className: "zen-text-zen-muted-fg", children: l.t("dataTable.rowsPerPage") }),
        /* @__PURE__ */ e("div", { style: { width: 88 }, children: /* @__PURE__ */ b(
          eo,
          {
            value: String(u),
            onValueChange: (m) => n.setPageSize(Number(m)),
            children: [
              /* @__PURE__ */ e(no, { "aria-labelledby": f, children: /* @__PURE__ */ e(to, {}) }),
              /* @__PURE__ */ e(oo, { children: c.map((m) => /* @__PURE__ */ e(ro, { value: String(m), children: m }, m)) })
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ b("div", { className: "zen-flex zen-items-center zen-gap-1", children: [
        /* @__PURE__ */ e(
          H,
          {
            variant: "outline",
            color: "neutral",
            size: "sm",
            disabled: !n.getCanPreviousPage(),
            onClick: () => n.setPageIndex(0),
            "aria-label": l.t("dataTable.firstPage"),
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
            "aria-label": l.t("dataTable.previousPage"),
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
            "aria-label": l.t("dataTable.nextPage"),
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
            "aria-label": l.t("dataTable.lastPage"),
            children: "»"
          }
        )
      ] })
    ] })
  ] });
}
export {
  Sr as DataTable,
  Ir as Table,
  Rr as TableBody,
  lo as TableCell,
  He as TableHead,
  io as TableHeader,
  Ve as TableRow
};
//# sourceMappingURL=index105.js.map
