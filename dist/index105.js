import { jsxs as b, jsx as e, Fragment as ae } from "react/jsx-runtime";
import * as h from "react";
import { flushSync as io } from "react-dom";
import { useReactTable as lo, flexRender as G } from "./index243.js";
import { useVirtualizer as so } from "./index244.js";
import { useSensors as ao, useSensor as jn, DndContext as _e, closestCenter as $e, KeyboardSensor as co, PointerSensor as uo } from "./index245.js";
import { SortableContext as Oe, horizontalListSortingStrategy as Kn, arrayMove as Be, sortableKeyboardCoordinates as go, verticalListSortingStrategy as zo, useSortable as Ue } from "./index246.js";
import { CSS as Un } from "./index247.js";
import { Button as $ } from "./index71.js";
import { Checkbox as _n } from "./index36.js";
import { DropdownMenu as he, DropdownMenuTrigger as be, DropdownMenuContent as xe, DropdownMenuLabel as ve, DropdownMenuItem as me, DropdownMenuSeparator as Y, DropdownMenuCheckboxItem as pe, DropdownMenuSub as fo, DropdownMenuSubTrigger as mo, DropdownMenuSubContent as po, DropdownMenuRadioGroup as ho, DropdownMenuRadioItem as He } from "./index73.js";
import { Input as bo } from "./index4.js";
import { Select as xo, SelectTrigger as vo, SelectValue as yo, SelectContent as wo, SelectItem as So } from "./index39.js";
import { TableHeader as Co, TableRow as je, TableHead as We, TableFooter as ko, TableCell as Io } from "./index104.js";
import { Table as Kr, TableBody as Ur } from "./index104.js";
import { filterFnByVariant as To, FilterCell as qn, textFilterFn as Ro } from "./index248.js";
import { useLocale as M } from "./index90.js";
import { totalPrecision as Do, aggregate as No } from "./index249.js";
import { withUtilityPins as $n, columnCellClass as Jn, withoutUtilityPins as Mo, columnLabel as ye, columnHeaderClass as qe, columnMinWidth as Fo, columnResizeDelta as Eo, clampColumnSize as Lo, respectsColumnSizes as Ao, moveColumn as Vo } from "./index250.js";
import { formatNumber as Po, validLocale as Go } from "./index201.js";
import { buildExportRequest as Bo, EXPORT_FILE as Ho } from "./index251.js";
import { EditableCell as jo } from "./index252.js";
import { BodyTable as _o, RowDragContext as $o } from "./index253.js";
import { ContextMenu as Oo, ContextMenuTrigger as Wo, ContextMenuContent as Ko } from "./index75.js";
import { cn as k } from "./index199.js";
import { getGroupedRowModel as Uo, getExpandedRowModel as qo, getPaginationRowModel as Jo, getFilteredRowModel as Xo, getSortedRowModel as Yo, getCoreRowModel as Qo } from "./index254.js";
function $r({
  data: n,
  columns: l,
  enableSorting: c = !1,
  enableMultiSort: a = !1,
  enablePagination: i = !1,
  enableColumnFilters: s = !1,
  enableRowSelection: g = !1,
  enableKeyboardNavigation: u = !1,
  onRowActivate: o,
  rowLabel: d,
  enableColumnVisibility: f = !1,
  toolbarPlacement: x = "top",
  enableVirtualization: m = !1,
  enableRowVirtualization: y = !1,
  enableColumnSeparators: D = !1,
  enableRowOrdering: N = !1,
  onRowOrderChange: U,
  getRowId: B,
  persistKey: v,
  rowClassName: R,
  renderBulkActions: F,
  renderSubRow: I,
  expanded: H,
  onExpandedChange: A,
  enableGrouping: Q = !1,
  grouping: Z,
  initialGrouping: we,
  onGroupingChange: q,
  enableColumnOrdering: O = !1,
  onColumnOrderChange: w,
  enableColumnResizing: p = !1,
  enablePerColumnFilters: S = !1,
  enableFilterOperators: ee = !0,
  enableExport: Se = !1,
  exportFilename: Ce = "data-table",
  exportOnlySelected: rt = !1,
  onExport: ke,
  exportFormats: it,
  exportContext: lt,
  exportTitle: st,
  stickyHeader: at = !1,
  stickyFooter: ct = !1,
  enableRowPinning: Je = !1,
  rowPinning: Xe,
  initialRowPinning: dt,
  onRowPinningChange: ut,
  fillHeight: ne = !1,
  totalsOver: Ye,
  enableColumnPinning: P = !1,
  respectColumnSizes: gt,
  columnPinning: Qe,
  initialColumnPinning: Ze,
  onColumnPinningChange: zt,
  onCellEdit: Ie,
  onCellsEdit: en,
  enableCellNavigation: nn = !1,
  contextMenu: Te,
  headerVariant: te = "plain",
  pageSize: Re = 10,
  pageSizeOptions: ft = [10, 20, 50, 100],
  maxBodyHeight: tn = 480,
  rowEstimatedHeight: on,
  globalFilterPlaceholder: mt,
  emptyMessage: pt,
  loading: De = !1,
  className: ht,
  style: bt,
  manualPagination: E,
  manualSorting: rn = !1,
  manualFiltering: ln = !1,
  sorting: sn,
  onSortingChange: xt,
  columnFilters: an,
  onColumnFiltersChange: vt,
  rowSelection: cn,
  onRowSelectionChange: yt,
  columnVisibility: dn,
  onColumnVisibilityChange: wt,
  globalFilter: Ne,
  onGlobalFilterChange: un
}) {
  const ce = h.useMemo(
    () => sr(v),
    [v]
  ), [St, Ct] = h.useState([]), [kt, It] = h.useState([]), [Tt, Rt] = h.useState({}), [Dt, Nt] = h.useState(
    () => ce?.columnVisibility ?? {}
  ), [Mt, gn] = h.useState(""), [zn, Ft] = h.useState({
    pageIndex: 0,
    pageSize: Re
  }), [oe, fn] = h.useState(
    () => ce?.columnOrder ?? []
  ), [de, Et] = h.useState(
    () => ce?.columnSizing ?? {}
  ), [Lt, At] = h.useState(
    () => ce?.columnPinning ?? Ze ?? { left: [], right: [] }
  ), J = Qe ?? Lt, [Vt, Pt] = h.useState(
    () => dt ?? { top: [], bottom: [] }
  ), mn = Xe ?? Vt, [Gt, Bt] = h.useState({}), pn = H ?? Gt, [Ht, jt] = h.useState(
    () => we ?? []
  ), hn = Z ?? Ht, [bn, Me] = h.useState(null), xn = h.useCallback(
    (t, r, z) => Me(z === void 0 ? { rowId: t, columnId: r } : { rowId: t, columnId: r, seed: z }),
    []
  ), _t = (t) => {
    if (t.length !== 0)
      if (en) en(t);
      else for (const r of t) Ie?.(r);
  }, vn = h.useCallback(
    (t, r, z) => {
      Me(null), Ie?.({ rowId: t, columnId: r, value: z });
    },
    [Ie]
  ), yn = h.useCallback(() => Me(null), []), wn = sn ?? St, Sn = an ?? kt, Cn = cn ?? Tt, re = dn ?? Dt, Fe = Ne ?? Mt, ie = y, j = m && !ie, W = N && !j, Ee = W && ie, ue = Q && !j, ge = !!I && !j || ue;
  h.useEffect(() => {
  }, [j, N, I, Q]);
  const kn = h.useRef(null), V = M(), $t = mt ?? V.t("dataTable.search"), In = pt ?? V.t("dataTable.noResults"), X = h.useMemo(() => {
    const t = [];
    W && t.push({
      id: "__drag__",
      header: () => /* @__PURE__ */ e("span", { className: "zen-sr-only", children: V.t("dataTable.reorder") }),
      cell: ({ row: z }) => /* @__PURE__ */ e(cr, { id: z.id }),
      enableSorting: !1,
      enableHiding: !1,
      size: 32
    }), ge && t.push({
      id: "__expand__",
      header: () => /* @__PURE__ */ e("span", { className: "zen-sr-only", children: V.t("dataTable.expand") }),
      cell: ({ row: z }) => /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          onClick: () => z.toggleExpanded(),
          "aria-expanded": z.getIsExpanded(),
          "aria-label": V.t(z.getIsExpanded() ? "dataTable.collapseRow" : "dataTable.expandRow"),
          className: k(
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
        _n,
        {
          checked: z.getIsAllRowsSelected() ? !0 : z.getIsSomeRowsSelected() ? "indeterminate" : !1,
          onCheckedChange: (T) => z.toggleAllRowsSelected(T === !0),
          "aria-label": V.t("dataTable.selectAll")
        }
      ),
      cell: ({ row: z }) => /* @__PURE__ */ e(
        _n,
        {
          checked: z.getIsSelected(),
          onCheckedChange: (T) => z.toggleSelected(T === !0),
          "aria-label": V.t("dataTable.selectRow", { n: z.index + 1 })
        }
      ),
      enableSorting: !1,
      enableHiding: !1,
      size: 36
    });
    const r = l.map((z) => {
      const T = z.meta;
      if (T?.filterVariant && !z.filterFn)
        return {
          ...z,
          // The variant filterFns are data-shape-agnostic — they read via
          // row.getValue(columnId) and compare against the filter value —
          // so widening to FilterFn<TData> is safe.
          filterFn: To[T.filterVariant]
        };
      if (!T?.filterVariant && !z.filterFn) {
        const L = z.id ?? z.accessorKey;
        if (L) return { ...z, filterFn: er(String(L), kn) };
      }
      return z;
    });
    return [...t, ...Zo(r, V, Ye)];
  }, [l, g, W, ge, V, Ye]), C = lo({
    data: n,
    columns: X,
    state: {
      sorting: wn,
      columnFilters: Sn,
      rowSelection: Cn,
      columnVisibility: re,
      globalFilter: Fe,
      columnOrder: oe,
      columnSizing: de,
      // What the table renders: the select / drag / expand columns stick with
      // anything pinned left, so a row's checkbox does not scroll away from it.
      columnPinning: P ? $n(J, X.map((t) => t.id ?? "")) : J,
      rowPinning: mn,
      expanded: pn,
      grouping: hn,
      ...E ? {
        pagination: {
          pageIndex: E.pageIndex,
          pageSize: E.pageSize ?? Re
        }
      } : i ? { pagination: zn } : {}
    },
    enableSorting: c,
    enableMultiSort: a,
    enableRowSelection: g,
    enableColumnFilters: s || S,
    enableColumnResizing: p,
    columnResizeMode: "onChange",
    enableColumnPinning: P,
    enableRowPinning: Je,
    onRowPinningChange: (t) => {
      const r = typeof t == "function" ? t(mn) : t;
      Xe === void 0 && Pt(r), ut?.(r);
    },
    enableGrouping: ue,
    getRowId: B,
    manualPagination: !!E,
    manualSorting: rn,
    manualFiltering: ln,
    pageCount: E?.pageCount,
    onColumnOrderChange: (t) => {
      const r = typeof t == "function" ? t(oe) : t;
      fn(r), w?.(r);
    },
    onColumnSizingChange: Et,
    onColumnPinningChange: (t) => {
      const r = P ? $n(J, X.map((T) => T.id ?? "")) : J, z = Mo(
        typeof t == "function" ? t(r) : t
      );
      Qe === void 0 && At(z), zt?.(z);
    },
    onExpandedChange: (t) => {
      const r = typeof t == "function" ? t(pn) : t;
      H === void 0 && Bt(r), A?.(r);
    },
    onGroupingChange: (t) => {
      const r = typeof t == "function" ? t(hn) : t;
      Z === void 0 && jt(r), q?.(r);
    },
    onSortingChange: (t) => {
      const r = typeof t == "function" ? t(wn) : t;
      sn === void 0 && Ct(r), xt?.(r);
    },
    onColumnFiltersChange: (t) => {
      const r = typeof t == "function" ? t(Sn) : t;
      an === void 0 && It(r), vt?.(r);
    },
    onRowSelectionChange: (t) => {
      const r = typeof t == "function" ? t(Cn) : t;
      cn === void 0 && Rt(r), yt?.(r);
    },
    onColumnVisibilityChange: (t) => {
      const r = typeof t == "function" ? t(re) : t;
      dn === void 0 && Nt(r), wt?.(r);
    },
    onGlobalFilterChange: (t) => {
      Ne === void 0 && gn(t), un?.(t);
    },
    onPaginationChange: E ? (t) => {
      const r = typeof t == "function" ? t({
        pageIndex: E.pageIndex,
        pageSize: E.pageSize ?? Re
      }) : t;
      E.onPageChange(r.pageIndex);
    } : (t) => {
      const r = typeof t == "function" ? t(zn) : t;
      Ft(r);
    },
    getCoreRowModel: Qo(),
    /* Skip the row-model functions when their corresponding manual flag
     * is set — TanStack will then trust the source data array as-is. */
    getSortedRowModel: c && !rn ? Yo() : void 0,
    getFilteredRowModel: (s || S) && !ln ? Xo() : void 0,
    getPaginationRowModel: i && !E ? Jo() : void 0,
    getExpandedRowModel: ge ? qo() : void 0,
    /* groupingActive (not enableGrouping) — gated off when virtualized
     * so getGroupedRowModel doesn't produce group rows that the virt
     * body would render as misleading data rows. */
    getGroupedRowModel: ue ? Uo() : void 0
  });
  kn.current = C;
  const Tn = C.getRowModel().rows, Ot = h.useCallback(
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
              className: k(
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
          /* @__PURE__ */ e("span", { className: "zen-font-medium", children: G(t.column.columnDef.cell, t.getContext()) }),
          /* @__PURE__ */ b("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: [
            "(",
            r.subRows.length,
            ")"
          ] })
        ] });
      }
      return t.getIsAggregated() ? G(
        t.column.columnDef.aggregatedCell ?? t.column.columnDef.cell,
        t.getContext()
      ) : t.getIsPlaceholder() ? null : G(t.column.columnDef.cell, t.getContext());
    },
    [V]
  ), Wt = () => {
    C.setColumnOrder([]), C.setColumnSizing({}), C.setColumnVisibility({}), C.setColumnPinning(Ze ?? { left: [], right: [] });
  }, Rn = x === "pagination" && (i || !!E), Dn = {
    table: C,
    enableColumnVisibility: f,
    enableColumnPinning: P,
    enableColumnOrdering: O,
    onResetColumns: Wt,
    enableGrouping: ue,
    enableExport: Se || !!ke,
    exportFilename: Ce,
    exportOnlySelected: rt,
    serverExport: ke ? {
      onExport: ke,
      formats: it ?? ["xlsx", "pdf", "csv"],
      context: lt,
      title: st,
      search: Fe
    } : void 0
  };
  h.useEffect(() => {
    ar(v, {
      columnOrder: oe,
      columnSizing: de,
      columnVisibility: re,
      columnPinning: J
    });
  }, [v, oe, de, re, J]);
  const Le = ao(
    jn(uo, { activationConstraint: { distance: 5 } }),
    jn(co, { coordinateGetter: go })
  ), le = h.useMemo(() => Tn.map((t) => t.id), [Tn]), Kt = (t, r) => {
    U?.(Be(le, t, r));
  }, Ut = (t) => {
    const { active: r, over: z } = t;
    if (!z || r.id === z.id) return;
    const T = le.indexOf(String(r.id)), L = le.indexOf(String(z.id));
    if (T < 0 || L < 0) return;
    const K = Be(le, T, L);
    U?.(K);
  }, qt = D ? "zen-border-r zen-border-zen-border last:zen-border-r-0" : "", Nn = D ? "[&>th]:zen-border-r [&>th]:zen-border-zen-border [&>th:last-child]:zen-border-r-0" : "", Ae = h.useCallback(
    (t) => {
      if (!P) return;
      const r = t.getIsPinned();
      if (!r) return;
      const z = r === "left" && t.getIsLastColumn("left"), T = r === "right" && t.getIsFirstColumn("right");
      return {
        position: "sticky",
        // Logical sides: "left" is the START edge, the right edge in an RTL page.
        insetInlineStart: r === "left" ? `${t.getStart("left")}px` : void 0,
        insetInlineEnd: r === "right" ? `${t.getAfter("right")}px` : void 0,
        background: "var(--zen-color-background)",
        // Body cells: z=1 so they sit above non-pinned cells while scrolling.
        // Sticky-header cells override to z=11 below.
        zIndex: 1,
        boxShadow: z ? "inset calc(-1px * var(--zen-pin-dir, 1)) 0 0 var(--zen-color-border), calc(4px * var(--zen-pin-dir, 1)) 0 6px -4px rgba(0,0,0,0.12)" : T ? "inset calc(1px * var(--zen-pin-dir, 1)) 0 0 var(--zen-color-border), calc(-4px * var(--zen-pin-dir, 1)) 0 6px -4px rgba(0,0,0,0.12)" : void 0
      };
    },
    [P]
  ), _ = (at || ne || ie) && !j, se = h.useMemo(
    () => C.getVisibleLeafColumns().map((t) => t.id),
    // re-derive when column order or visibility changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [C, oe, re]
  ), Mn = (t) => {
    const { active: r, over: z } = t;
    if (!z || r.id === z.id) return;
    const T = se.indexOf(String(r.id)), L = se.indexOf(String(z.id));
    if (T < 0 || L < 0) return;
    const K = Be(se, T, L);
    fn(K), w?.(K);
  }, Fn = te === "branded" ? "zen-bg-zen-primary-soft [&>th]:zen-text-zen-primary-soft-fg [&>th]:zen-font-semibold" : "", Jt = te === "underline" ? "[&_tr:last-child]:zen-border-b-2 [&_tr:last-child]:zen-border-zen-primary" : "", Ve = te === "branded" ? "var(--zen-color-primary-soft)" : "var(--zen-color-background)", En = _ ? te === "branded" ? "zen-sticky zen-top-0 zen-z-10" : "zen-sticky zen-top-0 zen-z-10 zen-bg-zen-background" : "", Ln = (t) => {
    const r = Ae(t);
    if (r)
      return { ...r, background: Ve };
  }, An = Ao({ respectColumnSizes: gt, enableColumnPinning: P, enableColumnResizing: p }) && !j, Xt = (t) => t.columns.length ? void 0 : Fo(An, {
    size: t.getSize(),
    explicitSize: t.columnDef.size,
    resized: de[t.id] !== void 0,
    pinned: P && !!t.getIsPinned()
  }), Yt = h.useMemo(
    () => X.some((t) => t.footer !== void 0),
    [X]
  ), Vn = (t) => !!t.columnDef.meta?.aggregate, Pe = C.getAllLeafColumns().some(Vn), Pn = /* @__PURE__ */ b(Co, { className: Jt, children: [
    C.getHeaderGroups().map((t) => /* @__PURE__ */ e(
      je,
      {
        className: k(Nn, En, Fn),
        children: t.headers.map((r) => /* @__PURE__ */ e(
          gr,
          {
            header: r,
            enableColumnResizing: p,
            enableColumnOrdering: O,
            pinStyle: Ln(r.column),
            minWidth: Xt(r.column),
            stickyHeader: _,
            stickyBg: Ve
          },
          r.id
        ))
      },
      t.id
    )),
    S && C.getHeaderGroups().map((t) => /* @__PURE__ */ e(
      je,
      {
        className: k(Nn, En, Fn),
        style: _ ? { top: "var(--zen-dt-header-h, 40px)" } : void 0,
        children: t.headers.map((r) => {
          const z = Ln(r.column);
          return /* @__PURE__ */ e(
            We,
            {
              className: "zen-px-2 zen-py-1",
              style: z ? { ...z, zIndex: _ ? 11 : 1 } : _ ? { background: Ve } : void 0,
              children: r.column.getCanFilter() && !r.id.startsWith("__") ? /* @__PURE__ */ e(qn, { column: r.column, operators: ee }) : null
            },
            `${r.id}-filter`
          );
        })
      },
      `${t.id}-filter`
    ))
  ] }), Qt = _ && !ne ? { maxHeight: tn } : void 0, ze = _ && (Pe || ct), Zt = (t) => {
    const r = Ae(t);
    if (r)
      return {
        ...r,
        background: ze ? "var(--zen-color-muted)" : "color-mix(in srgb, var(--zen-color-muted) 50%, var(--zen-color-background))",
        zIndex: ze ? 2 : 1
      };
  }, eo = Yt ? /* @__PURE__ */ e(ko, { "data-totals": Pe ? "" : void 0, children: C.getFooterGroups().map((t) => /* @__PURE__ */ e(je, { children: t.headers.map((r) => /* @__PURE__ */ e(
    Io,
    {
      colSpan: r.colSpan,
      className: k(
        Pe && Vn(r.column) && "zen-text-end zen-tabular-nums",
        ze && "zen-sticky zen-bottom-0 zen-z-[1] zen-bg-zen-muted",
        Jn(r.column.columnDef.meta)
      ) || void 0,
      style: Zt(r.column),
      children: r.isPlaceholder ? null : G(r.column.columnDef.footer, r.getContext())
    },
    r.id
  )) }, t.id)) }) : null, fe = W && !Ee, Gn = /* @__PURE__ */ e(
    _o,
    {
      table: C,
      header: O ? /* @__PURE__ */ e(_e, { sensors: Le, collisionDetection: $e, onDragEnd: Mn, children: /* @__PURE__ */ e(Oe, { items: se, strategy: Kn, children: Pn }) }) : Pn,
      footer: eo,
      loading: De,
      emptyMessage: In,
      colSpan: X.length,
      containerClassName: ne ? "zen-min-h-0 zen-flex-1" : void 0,
      containerStyle: Qt,
      sepCellClass: qt,
      pinStyle: Ae,
      editingCell: bn,
      startEdit: xn,
      commitEdit: vn,
      cancelEdit: yn,
      rowClassName: R,
      renderCell: Ot,
      expansionEnabled: W ? !1 : ge,
      renderSubRow: W ? void 0 : I,
      rowOrderingActive: W && !Ee,
      keyboard: !fe && u && !nn,
      cellNav: !fe && nn,
      virtualize: ie,
      rowPinning: Je && !ie && !fe,
      stickyHeaderActive: _,
      footerSticky: ze,
      estimatedRowHeight: on,
      headerRowCount: C.getHeaderGroups().length * (S ? 2 : 1),
      rowDrag: Ee,
      onRowMove: Kt,
      editCells: _t,
      selectable: g,
      onRowActivate: o,
      rowLabel: d,
      menuTargets: !!Te
    }
  ), no = (t) => {
    const r = t, z = r?.closest?.("tr[data-row-id], tr[data-expanded-of]"), T = z?.dataset.rowId ?? z?.dataset.expandedOf;
    if (!T) return null;
    let L;
    try {
      L = C.getRow(T);
    } catch {
      return null;
    }
    const K = r?.closest?.("td[data-column]")?.dataset.column, oo = K ? C.getColumn(K) : void 0, ro = L.getIsSelected() ? C.getSelectedRowModel().rows : [L];
    return { row: L, column: oo, selection: ro };
  }, [Ge, to] = h.useState(null), Bn = (t) => {
    const r = no(t);
    io(() => to(r));
  }, Hn = j ? /* @__PURE__ */ e(
    fr,
    {
      table: C,
      maxHeight: tn,
      estimatedRowHeight: on ?? 44,
      emptyMessage: In,
      loading: De,
      enableColumnPinning: P,
      enableColumnResizing: p,
      enableColumnOrdering: O,
      enablePerColumnFilters: S,
      visibleColumnIds: se,
      onColumnDragEnd: Mn,
      sensors: Le,
      editingCell: bn,
      onStartEdit: xn,
      onCommitEdit: vn,
      onCancelEdit: yn,
      rowClassName: R,
      headerVariant: te
    }
  ) : fe ? /* @__PURE__ */ e(
    _e,
    {
      sensors: Le,
      collisionDetection: $e,
      onDragEnd: Ut,
      children: /* @__PURE__ */ e(Oe, { items: le, strategy: zo, children: Gn })
    }
  ) : Gn;
  return /* @__PURE__ */ b(
    "div",
    {
      className: k(
        "zen-space-y-3",
        // Wider than its container, the table scrolls inside it; without this
        // a flex parent grows the whole DataTable to the table's width instead.
        An && "zen-min-w-0",
        ne && "zen-flex zen-h-full zen-min-h-0 zen-flex-col [&>*]:zen-shrink-0",
        P && "rtl:zen-[--zen-pin-dir:-1]",
        ht
      ),
      style: bt,
      children: [
        /* @__PURE__ */ e(
          nr,
          {
            ...Dn,
            enableColumnFilters: s,
            menusInPager: Rn,
            globalFilter: Fe,
            globalFilterPlaceholder: $t,
            onGlobalFilterChange: (t) => {
              Ne === void 0 && gn(t), un?.(t);
            }
          }
        ),
        /* @__PURE__ */ e(or, { table: C, renderBulkActions: F }),
        /* @__PURE__ */ e(rr, { table: C }),
        /* @__PURE__ */ e(
          "div",
          {
            className: k(
              "zen-rounded-zen-md zen-border zen-border-zen-border",
              ne && "!zen-shrink zen-flex zen-min-h-0 zen-flex-1 zen-flex-col"
            ),
            "aria-busy": De || void 0,
            children: Te ? /* @__PURE__ */ b(Oo, { children: [
              /* @__PURE__ */ e(
                Wo,
                {
                  className: "zen-contents",
                  disabled: !Ge,
                  onContextMenuCapture: (t) => Bn(t.target),
                  onKeyDownCapture: (t) => {
                    (t.key === "ContextMenu" || t.shiftKey && t.key === "F10") && Bn(document.activeElement);
                  },
                  children: Hn
                }
              ),
              /* @__PURE__ */ e(Ko, { className: "zen-min-w-48", children: Ge && Te(Ge) })
            ] }) : Hn
          }
        ),
        (i || E) && /* @__PURE__ */ e(
          hr,
          {
            table: C,
            enableRowSelection: g,
            pageSizeOptions: ft,
            manual: !!E,
            menus: Rn ? /* @__PURE__ */ e(Xn, { ...Dn }) : void 0
          }
        )
      ]
    }
  );
}
function Zo(n, l, c) {
  const a = (o) => o.meta;
  if (!n.some((o) => a(o)?.aggregate)) return n;
  const i = (o) => o.id ?? o.accessorKey ?? "", s = (o, d, f) => typeof o.aggregate == "function" ? o.aggregate(d, f) : No(d, o.aggregate), g = (o, d, f) => {
    if (o.formatTotal) return o.formatTotal(d);
    if (d == null) return "";
    const x = typeof o.aggregate == "string" ? o.aggregate : "sum";
    return typeof d == "number" ? Po(d, { locale: l.locale, precision: Do(f, x) }) : d instanceof Date ? d.toLocaleDateString(Go(l.locale)) : String(d);
  }, u = new Set(
    n.filter((o) => !a(o)?.aggregate && o.footer === void 0).map(i)
  );
  return n.map((o) => {
    const d = a(o);
    if (!d?.aggregate)
      return u.has(i(o)) ? {
        ...o,
        footer: (m) => m.table.getVisibleLeafColumns().find((y) => u.has(y.id))?.id === m.column.id ? l.t("dataTable.total") : ""
      } : o;
    const f = i(o), x = { ...o };
    return o.footer === void 0 && (x.footer = (m) => {
      const y = c === "page" ? m.table.getRowModel().rows.filter((N) => !N.getIsGrouped()) : m.table.getFilteredRowModel().rows, D = y.map((N) => N.getValue(f));
      return g(d, s(d, D, y), D);
    }), o.aggregationFn || (x.aggregationFn = (m, y) => s(d, y.map((D) => D.getValue(m)), y)), o.aggregatedCell || (x.aggregatedCell = (m) => g(d, m.getValue(), m.row.getLeafRows().map((y) => y.getValue(m.column.id)))), x;
  });
}
function er(n, l) {
  const c = () => l.current?.getColumn(n)?.getAutoFilterFn(), a = (s) => !!s && typeof s == "object" && "op" in s, i = (s, g, u, o) => {
    if (a(u)) return Ro(s, g, u);
    const d = c();
    return d ? d(s, g, u, o) : !0;
  };
  return i.autoRemove = (s, g) => a(s) ? String(s.value ?? "").trim() === "" : c()?.autoRemove?.(s, g) ?? !1, i.resolveFilterValue = (s) => a(s) ? s : c()?.resolveFilterValue?.(s) ?? s, i;
}
function nr({
  enableColumnFilters: n,
  menusInPager: l,
  globalFilter: c,
  globalFilterPlaceholder: a,
  onGlobalFilterChange: i,
  ...s
}) {
  const g = !l && (s.enableColumnVisibility || s.enableGrouping || s.enableExport);
  return !n && !g ? null : /* @__PURE__ */ b("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
    n && /* @__PURE__ */ e(
      bo,
      {
        value: c,
        onChange: (u) => i(u.target.value),
        placeholder: a,
        className: "zen-max-w-xs"
      }
    ),
    g && /* @__PURE__ */ e(Xn, { ...s, className: "zen-ml-auto" })
  ] });
}
function Xn({
  table: n,
  enableColumnVisibility: l,
  enableColumnPinning: c,
  enableColumnOrdering: a,
  onResetColumns: i,
  enableGrouping: s,
  enableExport: g,
  exportFilename: u,
  exportOnlySelected: o,
  serverExport: d,
  className: f
}) {
  return /* @__PURE__ */ b("div", { className: k("zen-flex zen-items-center zen-gap-2", f), children: [
    g && d ? /* @__PURE__ */ e(lr, { table: n, filename: u, config: d }) : g && /* @__PURE__ */ e(
      ir,
      {
        table: n,
        filename: u,
        onlySelected: o
      }
    ),
    s && /* @__PURE__ */ e(tr, { table: n }),
    l && /* @__PURE__ */ e(
      ur,
      {
        table: n,
        enableColumnPinning: c,
        enableColumnOrdering: a,
        onReset: i
      }
    )
  ] });
}
function tr({ table: n }) {
  const l = M(), c = n.getAllColumns().filter((i) => i.getCanGroup());
  if (c.length === 0) return null;
  const a = n.getState().grouping.length;
  return /* @__PURE__ */ b(he, { children: [
    /* @__PURE__ */ e(be, { asChild: !0, children: /* @__PURE__ */ e($, { variant: "outline", color: "neutral", size: "sm", children: a ? l.t("dataTable.groupByCount", { count: a }) : l.t("dataTable.groupBy") }) }),
    /* @__PURE__ */ b(xe, { align: "end", className: "zen-min-w-44", children: [
      /* @__PURE__ */ e(ve, { children: l.t("dataTable.groupRowsBy") }),
      /* @__PURE__ */ e(Y, {}),
      c.map((i) => {
        const s = typeof i.columnDef.header == "string" && i.columnDef.header || i.id;
        return /* @__PURE__ */ e(
          pe,
          {
            checked: i.getIsGrouped(),
            onCheckedChange: () => i.toggleGrouping(),
            children: s
          },
          i.id
        );
      })
    ] })
  ] });
}
function or({
  table: n,
  renderBulkActions: l
}) {
  const c = M(), a = n.getSelectedRowModel().rows, i = a.length;
  if (i === 0 || !l) return null;
  const s = n.getFilteredRowModel().rows, g = s.length, u = i === g, o = n.getIsAllPageRowsSelected(), d = g > i, f = o && !u && d, x = () => n.resetRowSelection(), m = () => {
    const y = {};
    s.forEach((D) => {
      y[D.id] = !0;
    }), n.setRowSelection(y);
  };
  return /* @__PURE__ */ b(
    "div",
    {
      className: k(
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
        f ? /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: m,
            className: k(
              "zen-text-xs zen-underline zen-underline-offset-2",
              "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-inherit",
              "hover:zen-opacity-80",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2"
            ),
            children: c.t("dataTable.selectAllMatching", { count: g })
          }
        ) : null,
        /* @__PURE__ */ b("div", { className: "zen-ml-auto zen-flex zen-items-center zen-gap-2", children: [
          l({ table: n, rows: a, clear: x }),
          /* @__PURE__ */ e(
            "button",
            {
              type: "button",
              onClick: x,
              "aria-label": c.t("dataTable.clearSelection"),
              className: k(
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
function rr({
  table: n
}) {
  const l = M(), c = n.getState().columnFilters, a = n.getState().globalFilter, i = typeof a == "string" && a.length > 0;
  if (c.length === 0 && !i) return null;
  const s = (u) => {
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
    return typeof u == "boolean" ? u ? l.t("dataTable.yes") : l.t("dataTable.no") : String(u);
  };
  return /* @__PURE__ */ b(
    "div",
    {
      className: "zen-flex zen-flex-wrap zen-items-center zen-gap-2",
      role: "group",
      "aria-label": l.t("dataTable.activeFilters"),
      children: [
        /* @__PURE__ */ e("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: l.t("dataTable.filtersLabel") }),
        i ? /* @__PURE__ */ e(
          On,
          {
            label: l.t("dataTable.searchChip", { value: a }),
            onRemove: () => n.setGlobalFilter("")
          }
        ) : null,
        c.map((u) => {
          const o = g(u.value);
          return o ? /* @__PURE__ */ e(
            On,
            {
              label: l.t("dataTable.filterChip", { column: s(u.id), value: o }),
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
            className: k(
              "zen-ml-1 zen-inline-flex zen-items-center zen-text-xs zen-px-2 zen-py-0.5 zen-rounded-zen-sm",
              "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
              "zen-bg-transparent zen-border-0 zen-cursor-pointer",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
            ),
            children: l.t("dataTable.clearAll")
          }
        )
      ]
    }
  );
}
function On({
  label: n,
  onRemove: l
}) {
  const c = M();
  return /* @__PURE__ */ b(
    "span",
    {
      className: k(
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
            onClick: l,
            "aria-label": c.t("dataTable.removeChip", { label: n }),
            className: k(
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
function ir({
  table: n,
  filename: l,
  onlySelected: c
}) {
  const a = M(), i = h.useCallback(() => {
    const o = c ? n.getSelectedRowModel().rows : n.getFilteredRowModel().rows;
    return c && o.length === 0 ? n.getFilteredRowModel().rows : o;
  }, [n, c]), s = () => n.getVisibleLeafColumns().filter((o) => !o.id.startsWith("__")), g = () => {
    const o = s(), f = i().map((x) => {
      const m = {};
      return o.forEach((y) => {
        m[y.id] = x.getValue(y.id);
      }), m;
    });
    Ke(
      new Blob([JSON.stringify(f, null, 2)], { type: "application/json" }),
      `${l}.json`
    );
  }, u = () => {
    const o = s(), d = i(), f = o.map((m) => Wn(Yn(m))).join(","), x = d.map(
      (m) => o.map((y) => Wn(m.getValue(y.id))).join(",")
    ).join(`
`);
    Ke(
      new Blob([`${f}
${x}`], { type: "text/csv;charset=utf-8" }),
      `${l}.csv`
    );
  };
  return /* @__PURE__ */ b(he, { children: [
    /* @__PURE__ */ e(be, { asChild: !0, children: /* @__PURE__ */ e($, { variant: "outline", color: "neutral", size: "sm", children: a.t("dataTable.export") }) }),
    /* @__PURE__ */ b(xe, { align: "end", className: "zen-min-w-44", children: [
      /* @__PURE__ */ e(ve, { children: c ? a.t("dataTable.exportSelectedRows") : a.t("dataTable.exportVisibleRows") }),
      /* @__PURE__ */ e(Y, {}),
      /* @__PURE__ */ e(me, { onSelect: u, children: a.t("dataTable.exportCsv") }),
      /* @__PURE__ */ e(me, { onSelect: g, children: a.t("dataTable.exportJson") })
    ] })
  ] });
}
function lr({
  table: n,
  filename: l,
  config: c
}) {
  const a = M(), [i, s] = h.useState(null), [g, u] = h.useState(""), [o, d] = h.useState(""), [f, x] = h.useState(!1), m = n.getState().rowSelection ?? {}, y = Object.keys(m).filter((v) => m[v]), D = () => n.getVisibleLeafColumns().filter((v) => !v.id.startsWith("__")).map((v) => {
    const R = v.columnDef.meta ?? {}, F = R.exportFormat ?? (R.aggregate || R.filterVariant === "number" || R.filterVariant === "numberRange" ? { kind: "number" } : { kind: "text" }), I = F.kind !== "text" && F.kind !== "date" && F.kind !== "datetime" && F.kind !== "boolean";
    return {
      id: v.id,
      header: Yn(v),
      width: Math.round(v.getSize()),
      align: I ? "end" : "start",
      format: F,
      ...R.aggregate ? { total: typeof R.aggregate == "string" ? R.aggregate : "custom" } : {}
    };
  }), N = h.useRef(!1), U = async (v) => {
    if (N.current) return;
    N.current = !0, u(""), d(a.t("dataTable.exportPreparing")), s(v);
    const R = n.getState(), F = Bo({
      format: v,
      filename: l,
      title: c.title,
      locale: a.locale ?? (typeof navigator < "u" ? navigator.language : void 0),
      selectedIds: f ? y : null,
      columns: D(),
      sort: R.sorting,
      search: c.search,
      columnFilters: R.columnFilters,
      grouping: R.grouping,
      context: c.context
    });
    try {
      const I = await c.onExport(v, F), H = `${l}.${Ho[v].extension}`;
      if (I instanceof Blob) Ke(I, H);
      else if (I && typeof I == "object" && "url" in I) {
        const A = document.createElement("a");
        A.href = I.url, A.download = I.filename ?? H, document.body.appendChild(A), A.click(), A.remove();
      }
      d(a.t("dataTable.exportReady"));
    } catch (I) {
      u(a.t("dataTable.exportFailed", { error: String(I?.message ?? I) })), d("");
    } finally {
      N.current = !1, s(null);
    }
  }, B = (v) => a.t(v === "xlsx" ? "dataTable.exportExcel" : v === "pdf" ? "dataTable.exportPdf" : "dataTable.exportCsv");
  return /* @__PURE__ */ b("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
    g ? /* @__PURE__ */ e("span", { role: "alert", className: "zen-text-sm zen-text-zen-error", "data-export-error": "", children: g }) : null,
    /* @__PURE__ */ e("span", { className: "zen-sr-only", role: "status", children: o }),
    /* @__PURE__ */ b(he, { children: [
      /* @__PURE__ */ e(be, { asChild: !0, disabled: !!i, children: /* @__PURE__ */ e($, { variant: "outline", color: "neutral", size: "sm", loading: !!i, children: i ? a.t("dataTable.exportPreparing") : a.t("dataTable.export") }) }),
      /* @__PURE__ */ b(xe, { align: "end", className: "zen-min-w-52", children: [
        /* @__PURE__ */ e(ve, { children: a.t("dataTable.exportTo") }),
        c.formats.map((v) => /* @__PURE__ */ e(me, { onSelect: () => {
          U(v);
        }, children: B(v) }, v)),
        y.length > 0 ? /* @__PURE__ */ b(ae, { children: [
          /* @__PURE__ */ e(Y, {}),
          /* @__PURE__ */ e(
            pe,
            {
              checked: f,
              onCheckedChange: (v) => x(v === !0),
              onSelect: (v) => v.preventDefault(),
              children: a.t("dataTable.exportOnlySelected", { count: y.length })
            }
          )
        ] }) : null
      ] })
    ] })
  ] });
}
const Yn = ye, Wn = (n) => {
  if (n == null) return "";
  const l = String(n);
  return /[",\n\r]/.test(l) ? `"${l.replace(/"/g, '""')}"` : l;
}, Ke = (n, l) => {
  if (typeof window > "u") return;
  const c = URL.createObjectURL(n), a = document.createElement("a");
  a.href = c, a.download = l, a.style.display = "none", document.body.appendChild(a), a.click(), document.body.removeChild(a), URL.revokeObjectURL(c);
}, Qn = "zen-dt:";
function sr(n) {
  if (!n || typeof window > "u") return null;
  try {
    const l = window.localStorage.getItem(Qn + n);
    if (!l) return null;
    const c = JSON.parse(l);
    return c && c.v === 1 ? c : null;
  } catch {
    return null;
  }
}
function ar(n, l) {
  if (!(!n || typeof window > "u"))
    try {
      window.localStorage.setItem(
        Qn + n,
        JSON.stringify({ v: 1, ...l })
      );
    } catch {
    }
}
const Zn = k(
  "zen-cursor-grab active:zen-cursor-grabbing zen-inline-flex zen-items-center zen-justify-center",
  "zen-h-6 zen-w-6 zen-rounded-zen-sm zen-bg-transparent zen-border-0",
  "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
), et = () => /* @__PURE__ */ b("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": !0, children: [
  /* @__PURE__ */ e("circle", { cx: "9", cy: "6", r: "1.6" }),
  /* @__PURE__ */ e("circle", { cx: "15", cy: "6", r: "1.6" }),
  /* @__PURE__ */ e("circle", { cx: "9", cy: "12", r: "1.6" }),
  /* @__PURE__ */ e("circle", { cx: "15", cy: "12", r: "1.6" }),
  /* @__PURE__ */ e("circle", { cx: "9", cy: "18", r: "1.6" }),
  /* @__PURE__ */ e("circle", { cx: "15", cy: "18", r: "1.6" })
] });
function cr({ id: n }) {
  const l = M(), c = h.useContext($o);
  return c?.active ? /* @__PURE__ */ e(
    "button",
    {
      type: "button",
      "aria-label": l.t("dataTable.dragRow"),
      className: k(Zn, "zen-touch-none"),
      onPointerDown: (a) => c.start(n, a),
      children: /* @__PURE__ */ e(et, {})
    }
  ) : /* @__PURE__ */ e(dr, { id: n });
}
function dr({ id: n }) {
  const l = M(), { attributes: c, listeners: a, setActivatorNodeRef: i } = Ue({ id: n });
  return /* @__PURE__ */ e(
    "button",
    {
      type: "button",
      ref: i,
      ...c,
      ...a,
      "aria-label": l.t("dataTable.dragRow"),
      className: Zn,
      children: /* @__PURE__ */ e(et, {})
    }
  );
}
function ur({
  table: n,
  enableColumnPinning: l,
  enableColumnOrdering: c,
  onReset: a
}) {
  const i = M(), s = h.useRef(null), g = n.getAllLeafColumns().filter((o) => o.getCanHide());
  if (g.length === 0) return null;
  const u = (o, d) => {
    if (!c || !o.altKey || o.ctrlKey || o.metaKey) return;
    const f = o.key === "ArrowUp" ? "earlier" : o.key === "ArrowDown" ? "later" : null;
    if (!f) return;
    o.preventDefault(), o.stopPropagation();
    const x = Vo(
      n.getAllLeafColumns().map((m) => m.id),
      d,
      f,
      g.map((m) => m.id)
    );
    x && (n.setColumnOrder(x), requestAnimationFrame(
      () => s.current?.querySelector(`[data-column-id="${window.CSS.escape(d)}"]`)?.focus()
    ));
  };
  return /* @__PURE__ */ b(he, { children: [
    /* @__PURE__ */ e(be, { asChild: !0, children: /* @__PURE__ */ e($, { variant: "outline", color: "neutral", size: "sm", children: i.t("dataTable.columns") }) }),
    /* @__PURE__ */ b(xe, { ref: s, align: "end", className: "zen-min-w-56", children: [
      /* @__PURE__ */ e(ve, { children: l ? i.t("dataTable.manageColumns") : i.t("dataTable.toggleColumns") }),
      /* @__PURE__ */ e(Y, {}),
      g.map((o) => {
        const d = ye(o);
        return l ? /* @__PURE__ */ b(fo, { children: [
          /* @__PURE__ */ e(mo, { "data-column-id": o.id, children: /* @__PURE__ */ e("span", { className: "zen-flex-1 zen-truncate", children: d }) }),
          /* @__PURE__ */ b(po, { children: [
            /* @__PURE__ */ e(
              pe,
              {
                checked: o.getIsVisible(),
                onCheckedChange: (f) => o.toggleVisibility(f === !0),
                onSelect: (f) => f.preventDefault(),
                children: i.t("dataTable.showColumn")
              }
            ),
            /* @__PURE__ */ e(Y, {}),
            /* @__PURE__ */ b(
              ho,
              {
                value: o.getIsPinned() || "none",
                onValueChange: (f) => o.pin(f === "left" || f === "right" ? f : !1),
                children: [
                  /* @__PURE__ */ e(He, { value: "none", children: i.t("dataTable.pinNone") }),
                  /* @__PURE__ */ e(He, { value: "left", children: i.t("dataTable.pinTo", { side: i.t("dataTable.sideLeft") }) }),
                  /* @__PURE__ */ e(He, { value: "right", children: i.t("dataTable.pinTo", { side: i.t("dataTable.sideRight") }) })
                ]
              }
            )
          ] })
        ] }, o.id) : /* @__PURE__ */ e(
          pe,
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
      }),
      /* @__PURE__ */ e(Y, {}),
      /* @__PURE__ */ e(me, { onSelect: () => a(), children: i.t("dataTable.resetColumns") }),
      c && !l ? /* @__PURE__ */ e("p", { className: "zen-m-0 zen-px-2 zen-pb-1 zen-pt-1.5 zen-text-xs zen-text-zen-muted-fg", "aria-hidden": "true", children: i.t("dataTable.moveColumnHint") }) : null
    ] })
  ] });
}
function nt({
  header: n,
  resizing: l,
  stopPointerDown: c
}) {
  const a = M(), i = n.column, s = i.columnDef.maxSize;
  return /* @__PURE__ */ e(
    "div",
    {
      role: "separator",
      tabIndex: 0,
      "aria-orientation": "vertical",
      "aria-label": a.t("dataTable.resize", { column: ye(i) }),
      "aria-valuenow": Math.round(i.getSize()),
      "aria-valuemin": i.columnDef.minSize ?? 20,
      "aria-valuemax": s !== void 0 && s < Number.MAX_SAFE_INTEGER ? s : void 0,
      onMouseDown: n.getResizeHandler(),
      onTouchStart: n.getResizeHandler(),
      onClick: (g) => g.stopPropagation(),
      onPointerDown: c ? (g) => g.stopPropagation() : void 0,
      onKeyDown: (g) => {
        const u = getComputedStyle(g.currentTarget).direction === "rtl", o = Eo(g.key, { shift: g.shiftKey, rtl: u });
        if (o === null) return;
        g.preventDefault(), g.stopPropagation();
        const d = Lo(i.getSize(), o, i.columnDef.minSize, i.columnDef.maxSize);
        n.getContext().table.setColumnSizing((f) => ({ ...f, [i.id]: d }));
      },
      className: k(
        "zen-absolute zen-right-0 zen-top-0 zen-h-full zen-w-1.5 zen-cursor-col-resize zen-select-none zen-touch-none",
        "zen-bg-transparent zen-border-0 zen-p-0",
        "hover:zen-bg-zen-primary focus-visible:zen-bg-zen-primary focus-visible:zen-outline-none",
        l && "zen-bg-zen-primary"
      )
    }
  );
}
function gr({
  header: n,
  enableColumnResizing: l,
  enableColumnOrdering: c,
  pinStyle: a,
  minWidth: i,
  stickyHeader: s,
  stickyBg: g
}) {
  const u = M();
  if (n.isPlaceholder) return /* @__PURE__ */ e(We, {});
  const o = n.column.getCanSort(), d = n.column.getIsSorted(), f = d === "asc" ? u.t("dataTable.sortAscending") : d === "desc" ? u.t("dataTable.sortDescending") : u.t("dataTable.sortNone"), x = n.getContext().table.getState().sorting.length > 1 && n.column.getSortIndex() >= 0 ? n.column.getSortIndex() + 1 : null, m = n.column.getIsResizing(), y = /* @__PURE__ */ b(ae, { children: [
    o ? /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        onClick: n.column.getToggleSortingHandler(),
        "aria-label": u.t("dataTable.sortBy", {
          column: ye(n.column),
          state: f
        }),
        className: k(
          "zen-w-full zen-h-full zen-[padding-inline:var(--zen-table-cell-padding-x)] zen-py-2",
          // A <button> resets text-transform and letter-spacing in the UA
          // stylesheet, so without these the header's head tokens (uppercase,
          // tracking) stopped at the label.
          "zen-inline-flex zen-items-center zen-gap-1 zen-text-start zen-font-inherit zen-text-inherit zen-[text-transform:inherit] zen-[letter-spacing:inherit]",
          "zen-bg-transparent zen-border-0 zen-cursor-pointer",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset"
        ),
        children: [
          G(n.column.columnDef.header, n.getContext()),
          /* @__PURE__ */ e(tt, { state: d }),
          x !== null ? /* @__PURE__ */ e(
            "span",
            {
              "aria-hidden": !0,
              className: "zen-font-semibold zen-text-zen-muted-fg zen-ml-0.5",
              title: u.t("dataTable.sortPriority", { n: x }),
              children: x
            }
          ) : null
        ]
      }
    ) : /* @__PURE__ */ e("span", { className: "zen-[padding-inline:var(--zen-table-cell-padding-x)] zen-py-2 zen-inline-flex zen-items-center zen-gap-1", children: G(n.column.columnDef.header, n.getContext()) }),
    l && n.column.getCanResize() ? /* @__PURE__ */ e(nt, { header: n, resizing: m }) : null
  ] }), D = {
    width: n.column.getSize(),
    ...i !== void 0 ? { minWidth: i } : {},
    ...a ?? {},
    ...a ? { zIndex: s ? 11 : 1 } : {},
    ...s && !a ? { background: g ?? "var(--zen-color-background)" } : {}
  }, N = /* @__PURE__ */ e(
    We,
    {
      "data-active": d ? "true" : void 0,
      "aria-sort": d === "asc" ? "ascending" : d === "desc" ? "descending" : void 0,
      className: k(
        "zen-p-0 zen-transition-colors zen-relative",
        o && "hover:zen-bg-zen-muted",
        "data-[active=true]:zen-bg-zen-primary-soft data-[active=true]:zen-text-zen-primary-soft-fg",
        qe(n.column.columnDef.meta)
      ),
      style: D,
      children: y
    }
  );
  return c ? /* @__PURE__ */ e(zr, { id: n.column.id, children: N }) : N;
}
function zr({
  id: n,
  children: l
}) {
  const {
    setNodeRef: c,
    attributes: a,
    listeners: i,
    transform: s,
    transition: g,
    isDragging: u
  } = Ue({ id: n }), o = l;
  return h.cloneElement(o, {
    ref: c,
    ...a,
    ...i,
    style: {
      ...o.props.style ?? {},
      transform: Un.Transform.toString(s),
      transition: g,
      opacity: u ? 0.6 : 1,
      cursor: "grab",
      position: "relative"
    }
  });
}
const tt = ({ state: n }) => n === "asc" ? /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: /* @__PURE__ */ e("polyline", { points: "18 15 12 9 6 15" }) }) : n === "desc" ? /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: /* @__PURE__ */ e("polyline", { points: "6 9 12 15 18 9" }) }) : /* @__PURE__ */ b("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "zen-opacity-60", "aria-hidden": !0, children: [
  /* @__PURE__ */ e("polyline", { points: "8 9 12 5 16 9" }),
  /* @__PURE__ */ e("polyline", { points: "16 15 12 19 8 15" })
] });
function fr({
  table: n,
  maxHeight: l,
  estimatedRowHeight: c,
  emptyMessage: a,
  loading: i,
  enableColumnPinning: s,
  enableColumnResizing: g,
  enableColumnOrdering: u,
  enablePerColumnFilters: o,
  visibleColumnIds: d,
  onColumnDragEnd: f,
  sensors: x,
  editingCell: m,
  onStartEdit: y,
  onCommitEdit: D,
  onCancelEdit: N,
  rowClassName: U,
  headerVariant: B
}) {
  const v = M(), R = B === "branded" ? "var(--zen-color-primary-soft)" : "var(--zen-color-background)", F = h.useCallback(
    (w) => {
      if (!s) return;
      const p = w.getIsPinned();
      if (!p) return;
      const S = p === "left" && w.getIsLastColumn("left"), ee = p === "right" && w.getIsFirstColumn("right");
      return {
        position: "sticky",
        // Logical sides: "left" is the START edge, the right edge in an RTL page.
        insetInlineStart: p === "left" ? `${w.getStart("left")}px` : void 0,
        insetInlineEnd: p === "right" ? `${w.getAfter("right")}px` : void 0,
        background: "var(--zen-color-background)",
        zIndex: 1,
        boxShadow: S ? "inset calc(-1px * var(--zen-pin-dir, 1)) 0 0 var(--zen-color-border), calc(4px * var(--zen-pin-dir, 1)) 0 6px -4px rgba(0,0,0,0.12)" : ee ? "inset calc(1px * var(--zen-pin-dir, 1)) 0 0 var(--zen-color-border), calc(-4px * var(--zen-pin-dir, 1)) 0 6px -4px rgba(0,0,0,0.12)" : void 0
      };
    },
    [s]
  ), I = h.useCallback(
    (w) => {
      const p = F(w);
      if (p)
        return { ...p, background: R };
    },
    [F, R]
  ), H = h.useRef(null), A = n.getRowModel().rows, Q = so({
    count: A.length,
    getScrollElement: () => H.current,
    estimateSize: () => c,
    overscan: 8
  }), Z = n.getVisibleLeafColumns(), we = n.getState().columnSizing, q = Z.map((w) => {
    const p = we[w.id];
    if (p !== void 0) return `${p}px`;
    const S = w.columnDef.size;
    return S !== void 0 && S !== 150 ? `${S}px` : "minmax(0, 1fr)";
  }).join(" "), O = Z.length;
  return /* @__PURE__ */ b(
    "div",
    {
      ref: H,
      style: { maxHeight: l, overflow: "auto" },
      role: "table",
      "aria-rowcount": A.length + 1,
      "aria-colcount": O,
      children: [
        /* @__PURE__ */ b(
          "div",
          {
            style: {
              position: "sticky",
              top: 0,
              zIndex: 1,
              background: R,
              borderBottom: B === "underline" ? "2px solid var(--zen-color-primary)" : "1px solid var(--zen-color-border)"
            },
            children: [
              u ? /* @__PURE__ */ e(
                _e,
                {
                  sensors: x,
                  collisionDetection: $e,
                  onDragEnd: f,
                  children: /* @__PURE__ */ e(
                    Oe,
                    {
                      items: d,
                      strategy: Kn,
                      children: n.getHeaderGroups().map((w) => /* @__PURE__ */ e(
                        "div",
                        {
                          role: "row",
                          style: { display: "grid", gridTemplateColumns: q },
                          children: w.headers.map((p) => /* @__PURE__ */ e(
                            pr,
                            {
                              header: p,
                              pinStyle: I(p.column),
                              enableColumnResizing: g,
                              branded: B === "branded"
                            },
                            p.id
                          ))
                        },
                        w.id
                      ))
                    }
                  )
                }
              ) : n.getHeaderGroups().map((w) => /* @__PURE__ */ e(
                "div",
                {
                  role: "row",
                  style: { display: "grid", gridTemplateColumns: q },
                  children: w.headers.map((p) => /* @__PURE__ */ e(
                    mr,
                    {
                      header: p,
                      pinStyle: I(p.column),
                      enableColumnResizing: g,
                      branded: B === "branded"
                    },
                    p.id
                  ))
                },
                w.id
              )),
              o && n.getHeaderGroups().map((w) => /* @__PURE__ */ e(
                "div",
                {
                  role: "row",
                  style: {
                    display: "grid",
                    gridTemplateColumns: q,
                    borderTop: "1px solid var(--zen-color-border)"
                  },
                  children: w.headers.map((p) => {
                    const S = I(p.column);
                    return /* @__PURE__ */ e(
                      "div",
                      {
                        style: {
                          padding: "var(--zen-space-1)",
                          minWidth: 0,
                          background: R,
                          ...S ?? {},
                          ...S ? { zIndex: 2 } : {}
                        },
                        children: p.column.getCanFilter() && !p.id.startsWith("__") ? /* @__PURE__ */ e(qn, { column: p.column }) : null
                      },
                      `${p.id}-filter`
                    );
                  })
                },
                `${w.id}-filter`
              ))
            ]
          }
        ),
        /* @__PURE__ */ e("div", { style: { height: Q.getTotalSize(), position: "relative" }, children: i ? /* @__PURE__ */ e(
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
        ) : Q.getVirtualItems().map((w) => {
          const p = A[w.index];
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
                transform: `translateY(${w.start}px)`,
                height: w.size,
                display: "grid",
                gridTemplateColumns: q
              },
              className: k(
                "zen-border-b zen-border-zen-border zen-transition-[background-color,box-shadow,outline-color] zen-duration-100",
                "hover:zen-bg-zen-muted hover:zen-shadow-zen-sm",
                // selected — bg + sm shadow + 1px primary inside outline (Zen theme spec)
                p.getIsSelected() && "zen-bg-zen-primary-soft zen-shadow-zen-sm zen-outline zen-outline-1 -zen-outline-offset-1 zen-outline-zen-primary",
                U?.(p)
              ),
              children: p.getVisibleCells().map((S) => {
                const ee = F(S.column), Se = m?.rowId === p.id && m?.columnId === S.column.id;
                return /* @__PURE__ */ e(
                  "div",
                  {
                    role: "cell",
                    className: Jn(S.column.columnDef.meta, p),
                    style: {
                      padding: "var(--zen-space-2) var(--zen-space-1)",
                      display: "flex",
                      alignItems: "center",
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      ...ee ?? {}
                    },
                    children: /* @__PURE__ */ e(
                      jo,
                      {
                        cell: S,
                        editing: Se,
                        onStartEdit: () => y(p.id, S.column.id),
                        onCommit: (Ce) => D(p.id, S.column.id, Ce),
                        onCancel: N,
                        children: G(S.column.columnDef.cell, S.getContext())
                      }
                    )
                  },
                  S.id
                );
              })
            },
            p.id
          );
        }) }),
        /* @__PURE__ */ b("span", { hidden: !0, "aria-hidden": !0, children: [
          O,
          " columns"
        ] })
      ]
    }
  );
}
function ot({
  header: n,
  enableColumnResizing: l
}) {
  const c = n.column.getCanSort(), a = n.column.getIsSorted(), i = n.column.getIsResizing();
  return /* @__PURE__ */ b(ae, { children: [
    n.isPlaceholder ? null : c ? /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        onClick: n.column.getToggleSortingHandler(),
        className: "zen-w-full zen-h-full zen-[padding-inline:var(--zen-table-cell-padding-x)] zen-py-2 zen-inline-flex zen-items-center zen-gap-1 zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-inherit zen-font-inherit zen-[text-transform:inherit] zen-[letter-spacing:inherit] focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset",
        children: [
          G(n.column.columnDef.header, n.getContext()),
          /* @__PURE__ */ e(tt, { state: a })
        ]
      }
    ) : /* @__PURE__ */ e("span", { className: "zen-[padding-inline:var(--zen-table-cell-padding-x)] zen-py-2 zen-inline-flex zen-items-center zen-gap-1", children: G(n.column.columnDef.header, n.getContext()) }),
    l && n.column.getCanResize() ? /* @__PURE__ */ e(nt, { header: n, resizing: i, stopPointerDown: !0 }) : null
  ] });
}
function mr({
  header: n,
  pinStyle: l,
  enableColumnResizing: c,
  branded: a
}) {
  const i = n.column.getCanSort(), s = n.column.getIsSorted();
  return /* @__PURE__ */ e(
    "div",
    {
      role: "columnheader",
      "data-active": s ? "true" : void 0,
      "aria-sort": s === "asc" ? "ascending" : s === "desc" ? "descending" : void 0,
      className: k(
        "zen-text-sm zen-flex zen-items-center zen-transition-colors zen-relative",
        a ? "zen-font-semibold zen-text-zen-primary-soft-fg" : "zen-font-medium zen-text-zen-muted-fg",
        i && "hover:zen-bg-zen-muted",
        "data-[active=true]:zen-bg-zen-primary-soft data-[active=true]:zen-text-zen-primary-soft-fg",
        qe(n.column.columnDef.meta)
      ),
      style: {
        minWidth: 0,
        ...l ?? {},
        ...l ? { zIndex: 2 } : {}
      },
      children: /* @__PURE__ */ e(
        ot,
        {
          header: n,
          enableColumnResizing: c
        }
      )
    }
  );
}
function pr({
  header: n,
  pinStyle: l,
  enableColumnResizing: c,
  branded: a
}) {
  const {
    setNodeRef: i,
    attributes: s,
    listeners: g,
    transform: u,
    transition: o,
    isDragging: d
  } = Ue({ id: n.column.id }), f = n.column.getCanSort(), x = n.column.getIsSorted();
  return /* @__PURE__ */ e(
    "div",
    {
      ref: i,
      ...s,
      ...g,
      role: "columnheader",
      "data-active": x ? "true" : void 0,
      "aria-sort": x === "asc" ? "ascending" : x === "desc" ? "descending" : void 0,
      className: k(
        "zen-text-sm zen-flex zen-items-center zen-transition-colors zen-relative",
        a ? "zen-font-semibold zen-text-zen-primary-soft-fg" : "zen-font-medium zen-text-zen-muted-fg",
        f && "hover:zen-bg-zen-muted",
        "data-[active=true]:zen-bg-zen-primary-soft data-[active=true]:zen-text-zen-primary-soft-fg",
        qe(n.column.columnDef.meta)
      ),
      style: {
        minWidth: 0,
        transform: Un.Transform.toString(u),
        transition: o,
        opacity: d ? 0.6 : 1,
        cursor: "grab",
        ...l ?? {},
        ...l ? { zIndex: 2 } : {}
      },
      children: /* @__PURE__ */ e(
        ot,
        {
          header: n,
          enableColumnResizing: c
        }
      )
    }
  );
}
function hr({
  table: n,
  enableRowSelection: l,
  pageSizeOptions: c,
  manual: a,
  menus: i
}) {
  const s = M(), { pageIndex: g, pageSize: u } = n.getState().pagination, o = n.getPageCount(), d = n.getSelectedRowModel().rows.length, f = n.getFilteredRowModel().rows.length, x = h.useId();
  return /* @__PURE__ */ b("div", { className: "zen-flex zen-items-center zen-justify-between zen-gap-3 zen-text-sm", children: [
    /* @__PURE__ */ e("div", { className: "zen-text-zen-muted-fg", children: l ? /* @__PURE__ */ e(ae, { children: s.t("dataTable.selectedOf", { selected: d, total: f }) }) : /* @__PURE__ */ e(ae, { children: s.t("dataTable.pageOf", { page: g + 1, pages: Math.max(o, 1) }) }) }),
    /* @__PURE__ */ b("div", { className: "zen-flex zen-items-center zen-gap-3", children: [
      i,
      !a && /* @__PURE__ */ b("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
        /* @__PURE__ */ e("span", { id: x, className: "zen-text-zen-muted-fg", children: s.t("dataTable.rowsPerPage") }),
        /* @__PURE__ */ e("div", { style: { width: 88 }, children: /* @__PURE__ */ b(
          xo,
          {
            value: String(u),
            onValueChange: (m) => n.setPageSize(Number(m)),
            children: [
              /* @__PURE__ */ e(vo, { "aria-labelledby": x, children: /* @__PURE__ */ e(yo, {}) }),
              /* @__PURE__ */ e(wo, { children: c.map((m) => /* @__PURE__ */ e(So, { value: String(m), children: m }, m)) })
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ b("div", { className: "zen-flex zen-items-center zen-gap-1", children: [
        /* @__PURE__ */ e(
          $,
          {
            variant: "outline",
            color: "neutral",
            size: "sm",
            disabled: !n.getCanPreviousPage(),
            onClick: () => n.setPageIndex(0),
            "aria-label": s.t("dataTable.firstPage"),
            children: "«"
          }
        ),
        /* @__PURE__ */ e(
          $,
          {
            variant: "outline",
            color: "neutral",
            size: "sm",
            disabled: !n.getCanPreviousPage(),
            onClick: () => n.previousPage(),
            "aria-label": s.t("dataTable.previousPage"),
            children: "‹"
          }
        ),
        /* @__PURE__ */ e(
          $,
          {
            variant: "outline",
            color: "neutral",
            size: "sm",
            disabled: !n.getCanNextPage(),
            onClick: () => n.nextPage(),
            "aria-label": s.t("dataTable.nextPage"),
            children: "›"
          }
        ),
        /* @__PURE__ */ e(
          $,
          {
            variant: "outline",
            color: "neutral",
            size: "sm",
            disabled: !n.getCanNextPage(),
            onClick: () => n.setPageIndex(n.getPageCount() - 1),
            "aria-label": s.t("dataTable.lastPage"),
            children: "»"
          }
        )
      ] })
    ] })
  ] });
}
export {
  $r as DataTable,
  Kr as Table,
  Ur as TableBody,
  Io as TableCell,
  We as TableHead,
  Co as TableHeader,
  je as TableRow
};
//# sourceMappingURL=index105.js.map
