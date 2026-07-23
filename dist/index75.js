import { template as y, insert as c, createComponent as t, effect as R, className as V, setAttribute as I, memo as S, use as me, setStyleProperty as O, style as de, addEventListener as sn, spread as We, mergeProps as ze, delegateEvents as cn } from "solid-js/web";
import { splitProps as mn, createSignal as p, createMemo as q, createEffect as zn, onMount as bn, Show as v, For as P } from "solid-js";
import { createSolidTable as hn, flexRender as B } from "./index138.js";
import { createVirtualizer as fn } from "./index139.js";
import { DragDropProvider as be, closestCenter as he, DragDropSensors as fe, SortableProvider as ve, createSortable as Q } from "./index140.js";
import { Button as T } from "./index5.js";
import { Checkbox as se } from "./index49.js";
import { DropdownMenu as Ce, DropdownMenuTrigger as xe, DropdownMenuContent as ye, DropdownMenuLabel as we, DropdownMenuSeparator as Se, DropdownMenuItem as Ge, DropdownMenuCheckboxItem as qe } from "./index60.js";
import { Input as vn } from "./index64.js";
import { Select as Cn } from "./index61.js";
import { Table as xn, TableBody as yn, TableCell as W, TableRow as j, TableHeader as wn, TableHead as Y } from "./index73.js";
import { filterFnByVariant as Sn, FilterCell as Ye } from "./index141.js";
import { EditableCell as ce } from "./index142.js";
import { cn as $ } from "./index106.js";
import { getCoreRowModel as $n, getGroupedRowModel as Rn, getExpandedRowModel as kn, getPaginationRowModel as Pn, getFilteredRowModel as In, getSortedRowModel as Fn } from "./index143.js";
var En = /* @__PURE__ */ y("<span class=zen-sr-only>Reorder"), _n = /* @__PURE__ */ y("<span class=zen-sr-only>Expand"), Vn = /* @__PURE__ */ y('<button type=button><svg width=12 height=12 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2.5 stroke-linecap=round stroke-linejoin=round aria-hidden=true><polyline points="9 6 15 12 9 18">'), pn = /* @__PURE__ */ y('<div class="zen-inline-flex zen-items-center zen-gap-1.5"><button type=button><svg width=10 height=10 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2.5 stroke-linecap=round stroke-linejoin=round aria-hidden=true><polyline points="9 6 15 12 9 18"></polyline></svg></button><span class=zen-font-medium></span><span class="zen-text-xs zen-text-zen-muted-fg">(<!>)'), Dn = /* @__PURE__ */ y('<div><div class="zen-rounded-zen-md zen-border zen-border-zen-border">'), Hn = /* @__PURE__ */ y('<div class="zen-flex zen-items-center zen-gap-2"><div class="zen-ml-auto zen-flex zen-items-center zen-gap-2">'), Mn = /* @__PURE__ */ y("<button type=button>Select all <!> matching"), On = /* @__PURE__ */ y('<div role=toolbar aria-label="Bulk actions for selected rows"><span class="zen-text-sm zen-font-medium"aria-live=polite aria-atomic=true> selected</span><div class="zen-ml-auto zen-flex zen-items-center zen-gap-2"><button type=button aria-label="Clear selection"><svg width=12 height=12 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=3 stroke-linecap=round stroke-linejoin=round aria-hidden=true><line x1=18 y1=6 x2=6 y2=18></line><line x1=6 y1=6 x2=18 y2=18>'), An = /* @__PURE__ */ y('<div class="zen-flex zen-flex-wrap zen-items-center zen-gap-2"role=group aria-label="Active filters"><span class="zen-text-xs zen-text-zen-muted-fg">Filters:</span><button type=button>Clear all'), Bn = /* @__PURE__ */ y('<span><span></span><button type=button><svg width=10 height=10 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=3 stroke-linecap=round stroke-linejoin=round aria-hidden=true><line x1=18 y1=6 x2=6 y2=18></line><line x1=6 y1=6 x2=18 y2=18>'), Gn = /* @__PURE__ */ y('<div class="zen-flex zen-items-center zen-gap-2 zen-px-2 zen-py-1.5 zen-text-sm"><span class="zen-flex-1 zen-truncate">'), X = /* @__PURE__ */ y("<button type=button>"), Tn = /* @__PURE__ */ y('<button type=button><svg width=14 height=14 viewBox="0 0 24 24"fill=currentColor aria-hidden=true><circle cx=9 cy=6 r=1.6></circle><circle cx=15 cy=6 r=1.6></circle><circle cx=9 cy=12 r=1.6></circle><circle cx=15 cy=12 r=1.6></circle><circle cx=9 cy=18 r=1.6></circle><circle cx=15 cy=18 r=1.6>'), jn = /* @__PURE__ */ y('<span aria-hidden=true class="zen-text-[1rem] zen-font-semibold zen-text-zen-muted-fg zen-ml-0.5">'), Xe = /* @__PURE__ */ y('<span class="zen-px-2 zen-py-2 zen-inline-flex zen-items-center zen-gap-1">'), Nn = /* @__PURE__ */ y('<svg width=12 height=12 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=zen-opacity-30 aria-hidden=true><polyline points="8 9 12 5 16 9"></polyline><polyline points="16 15 12 19 8 15">'), Ln = /* @__PURE__ */ y('<svg width=12 height=12 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round aria-hidden=true><polyline points="18 15 12 9 6 15">'), Un = /* @__PURE__ */ y('<svg width=12 height=12 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round aria-hidden=true><polyline points="6 9 12 15 18 9">'), Jn = /* @__PURE__ */ y("<div role=table style=overflow:auto><div style=position:sticky;top:0;z-index:1></div><div style=position:relative>"), Te = /* @__PURE__ */ y("<div role=row style=display:grid>"), Kn = /* @__PURE__ */ y('<div role=row style="display:grid;border-top:1px solid var(--zen-color-border)">'), Wn = /* @__PURE__ */ y("<div style=padding:var(--zen-space-1);min-width:0>"), qn = /* @__PURE__ */ y("<div role=row style=text-align:center;padding:var(--zen-space-4);color:var(--zen-color-muted-fg)>"), Yn = /* @__PURE__ */ y("<div role=row style=position:absolute;top:0;left:0;width:100%;display:grid>"), Xn = /* @__PURE__ */ y('<div role=cell style="padding:var(--zen-space-2) var(--zen-space-1);display:flex;align-items:center;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'), Qn = /* @__PURE__ */ y('<button type=button class="zen-w-full zen-h-full zen-px-2 zen-py-2 zen-inline-flex zen-items-center zen-gap-1 zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-inherit zen-font-inherit focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset">'), Zn = /* @__PURE__ */ y("<div role=columnheader style=min-width:0>"), et = /* @__PURE__ */ y("<div>"), nt = /* @__PURE__ */ y('<div class="zen-flex zen-items-center zen-gap-2"><span class=zen-text-zen-muted-fg>Rows per page</span><div style=width:88px>'), tt = /* @__PURE__ */ y('<div class="zen-flex zen-items-center zen-justify-between zen-gap-3 zen-text-sm"><div class=zen-text-zen-muted-fg></div><div class="zen-flex zen-items-center zen-gap-3"><div class="zen-flex zen-items-center zen-gap-1">');
const Qe = "zen-dt:";
function rt(e) {
  if (!e || typeof window > "u") return null;
  try {
    const n = window.localStorage.getItem(Qe + e);
    if (!n) return null;
    const i = JSON.parse(n);
    return i && i.v === 1 ? i : null;
  } catch {
    return null;
  }
}
function it(e, n) {
  if (!(!e || typeof window > "u"))
    try {
      window.localStorage.setItem(Qe + e, JSON.stringify({
        v: 1,
        ...n
      }));
    } catch {
    }
}
const lt = (e) => typeof e.columnDef.header == "string" ? e.columnDef.header : e.id, je = (e) => {
  if (e == null) return "";
  const n = String(e);
  return /[",\n\r]/.test(n) ? `"${n.replace(/"/g, '""')}"` : n;
}, Ne = (e, n) => {
  if (typeof window > "u") return;
  const i = URL.createObjectURL(e), o = document.createElement("a");
  o.href = i, o.download = n, o.style.display = "none", document.body.appendChild(o), o.click(), document.body.removeChild(o), URL.revokeObjectURL(i);
};
function Ht(e) {
  const [n] = mn(e, ["data", "columns", "enableSorting", "enableMultiSort", "enablePagination", "enableColumnFilters", "enableRowSelection", "enableColumnVisibility", "enableVirtualization", "enableColumnSeparators", "enableRowOrdering", "onRowOrderChange", "getRowId", "persistKey", "rowClassName", "renderBulkActions", "renderSubRow", "expanded", "onExpandedChange", "enableGrouping", "grouping", "initialGrouping", "onGroupingChange", "enableColumnOrdering", "onColumnOrderChange", "enableColumnResizing", "enablePerColumnFilters", "enableExport", "exportFilename", "exportOnlySelected", "stickyHeader", "enableColumnPinning", "columnPinning", "initialColumnPinning", "onColumnPinningChange", "onCellEdit", "headerVariant", "pageSize", "pageSizeOptions", "maxBodyHeight", "rowEstimatedHeight", "globalFilterPlaceholder", "emptyMessage", "loading", "class", "manualPagination", "manualSorting", "manualFiltering", "sorting", "onSortingChange", "columnFilters", "onColumnFiltersChange", "rowSelection", "onRowSelectionChange", "columnVisibility", "onColumnVisibilityChange", "globalFilter", "onGlobalFilterChange"]), i = rt(n.persistKey), [o, r] = p([]), [a, m] = p([]), [s, f] = p({}), [d, g] = p(i?.columnVisibility ?? {}), [b, h] = p(""), [x, F] = p({
    pageIndex: 0,
    // Seeds the INITIAL page size; the user owns it after that via the
    // page-size selector.
    // eslint-disable-next-line solid/reactivity
    pageSize: n.pageSize ?? 10
  }), [E, w] = p(i?.columnOrder ?? []), [_, H] = p(i?.columnSizing ?? {}), [nn, tn] = p(i?.columnPinning ?? n.initialColumnPinning ?? {
    left: [],
    right: []
  }), [rn, ln] = p({}), [on, an] = p(n.initialGrouping ?? []), $e = () => n.sorting ?? o(), Re = () => n.columnFilters ?? a(), ke = () => n.rowSelection ?? s(), Z = () => n.columnVisibility ?? d(), Pe = () => n.globalFilter ?? b(), ee = () => n.columnPinning ?? nn(), Ie = () => n.expanded ?? rn(), Fe = () => n.grouping ?? on(), [ne, te] = p(null), re = (l, u) => te({
    rowId: l,
    columnId: u
  }), ie = (l, u, z) => {
    te(null), n.onCellEdit?.({
      rowId: l,
      columnId: u,
      value: z
    });
  }, le = () => te(null), Ee = () => !!n.enableRowOrdering && !n.enableVirtualization, L = () => !!n.enableGrouping && !n.enableVirtualization, gn = () => !!n.renderSubRow && !n.enableVirtualization, oe = () => gn() || L(), un = q(() => {
    const l = [];
    Ee() && l.push({
      id: "__drag__",
      header: () => En(),
      cell: ({
        row: z
      }) => t(ct, {
        get id() {
          return z.id;
        }
      }),
      enableSorting: !1,
      enableHiding: !1,
      size: 32
    }), oe() && l.push({
      id: "__expand__",
      header: () => _n(),
      cell: ({
        row: z
      }) => (() => {
        var C = Vn();
        return C.$$click = () => z.toggleExpanded(), R((k) => {
          var D = z.getIsExpanded(), A = z.getIsExpanded() ? "Collapse row" : "Expand row", N = $("zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6", "zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer", "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", "zen-transition-transform", z.getIsExpanded() && "zen-rotate-90");
          return D !== k.e && I(C, "aria-expanded", k.e = D), A !== k.t && I(C, "aria-label", k.t = A), N !== k.a && V(C, k.a = N), k;
        }, {
          e: void 0,
          t: void 0,
          a: void 0
        }), C;
      })(),
      enableSorting: !1,
      enableHiding: !1,
      size: 32
    }), n.enableRowSelection && l.push({
      id: "__select__",
      header: ({
        table: z
      }) => t(se, {
        get checked() {
          return z.getIsAllRowsSelected();
        },
        get indeterminate() {
          return S(() => !z.getIsAllRowsSelected())() && z.getIsSomeRowsSelected();
        },
        onChange: (C) => z.toggleAllRowsSelected(C),
        "aria-label": "Select all rows"
      }),
      cell: ({
        row: z
      }) => t(se, {
        get checked() {
          return z.getIsSelected();
        },
        onChange: (C) => z.toggleSelected(C),
        get "aria-label"() {
          return `Select row ${z.index + 1}`;
        }
      }),
      enableSorting: !1,
      enableHiding: !1,
      size: 36
    });
    const u = n.columns.map((z) => {
      const C = z.meta;
      return C?.filterVariant && !z.filterFn ? {
        ...z,
        filterFn: Sn[C.filterVariant]
      } : z;
    });
    return [...l, ...u];
  }), M = hn({
    get data() {
      return n.data;
    },
    get columns() {
      return un();
    },
    state: {
      get sorting() {
        return $e();
      },
      get columnFilters() {
        return Re();
      },
      get rowSelection() {
        return ke();
      },
      get columnVisibility() {
        return Z();
      },
      get globalFilter() {
        return Pe();
      },
      get columnOrder() {
        return E();
      },
      get columnSizing() {
        return _();
      },
      get columnPinning() {
        return ee();
      },
      get expanded() {
        return Ie();
      },
      get grouping() {
        return Fe();
      },
      get pagination() {
        return n.manualPagination ? {
          pageIndex: n.manualPagination.pageIndex,
          pageSize: n.manualPagination.pageSize ?? n.pageSize ?? 10
        } : n.enablePagination ? x() : {
          pageIndex: 0,
          pageSize: n.data.length || 10
        };
      }
    },
    get enableSorting() {
      return !!n.enableSorting;
    },
    get enableMultiSort() {
      return !!n.enableMultiSort;
    },
    get enableRowSelection() {
      return !!n.enableRowSelection;
    },
    get enableColumnFilters() {
      return !!(n.enableColumnFilters || n.enablePerColumnFilters);
    },
    get enableColumnResizing() {
      return !!n.enableColumnResizing;
    },
    columnResizeMode: "onChange",
    get enableColumnPinning() {
      return !!n.enableColumnPinning;
    },
    get enableGrouping() {
      return L();
    },
    get getRowId() {
      return n.getRowId;
    },
    get manualPagination() {
      return !!n.manualPagination;
    },
    get manualSorting() {
      return !!n.manualSorting;
    },
    get manualFiltering() {
      return !!n.manualFiltering;
    },
    get pageCount() {
      return n.manualPagination?.pageCount;
    },
    onColumnOrderChange: (l) => {
      const u = typeof l == "function" ? l(E()) : l;
      w(u), n.onColumnOrderChange?.(u);
    },
    onColumnSizingChange: (l) => {
      const u = typeof l == "function" ? l(_()) : l;
      H(u);
    },
    onColumnPinningChange: (l) => {
      const u = typeof l == "function" ? l(ee()) : l;
      n.columnPinning === void 0 && tn(u), n.onColumnPinningChange?.(u);
    },
    onExpandedChange: (l) => {
      const u = typeof l == "function" ? l(Ie()) : l;
      n.expanded === void 0 && ln(u), n.onExpandedChange?.(u);
    },
    onGroupingChange: (l) => {
      const u = typeof l == "function" ? l(Fe()) : l;
      n.grouping === void 0 && an(u), n.onGroupingChange?.(u);
    },
    onSortingChange: (l) => {
      const u = typeof l == "function" ? l($e()) : l;
      n.sorting === void 0 && r(u), n.onSortingChange?.(u);
    },
    onColumnFiltersChange: (l) => {
      const u = typeof l == "function" ? l(Re()) : l;
      n.columnFilters === void 0 && m(u), n.onColumnFiltersChange?.(u);
    },
    onRowSelectionChange: (l) => {
      const u = typeof l == "function" ? l(ke()) : l;
      n.rowSelection === void 0 && f(u), n.onRowSelectionChange?.(u);
    },
    onColumnVisibilityChange: (l) => {
      const u = typeof l == "function" ? l(Z()) : l;
      n.columnVisibility === void 0 && g(u), n.onColumnVisibilityChange?.(u);
    },
    onGlobalFilterChange: (l) => {
      n.globalFilter === void 0 && h(l), n.onGlobalFilterChange?.(l);
    },
    onPaginationChange: (l) => {
      if (n.manualPagination) {
        const u = typeof l == "function" ? l({
          pageIndex: n.manualPagination.pageIndex,
          pageSize: n.manualPagination.pageSize ?? n.pageSize ?? 10
        }) : l;
        n.manualPagination.onPageChange(u.pageIndex);
      } else {
        const u = typeof l == "function" ? l(x()) : l;
        F(u);
      }
    },
    getCoreRowModel: $n(),
    get getSortedRowModel() {
      return n.enableSorting && !n.manualSorting ? Fn() : void 0;
    },
    get getFilteredRowModel() {
      return (n.enableColumnFilters || n.enablePerColumnFilters) && !n.manualFiltering ? In() : void 0;
    },
    get getPaginationRowModel() {
      return n.enablePagination && !n.manualPagination ? Pn() : void 0;
    },
    get getExpandedRowModel() {
      return oe() ? kn() : void 0;
    },
    get getGroupedRowModel() {
      return L() ? Rn() : void 0;
    }
  });
  zn(() => {
    it(n.persistKey, {
      columnOrder: E(),
      columnSizing: _(),
      columnVisibility: Z(),
      columnPinning: ee()
    });
  }), bn(() => {
    n.enableVirtualization && (n.enableRowOrdering && console.warn("[DataTable] `enableRowOrdering` is not supported with `enableVirtualization`. Drag handle column hidden."), n.renderSubRow && console.warn("[DataTable] `renderSubRow` is not supported with `enableVirtualization`. Sub-rows won't render."), n.enableGrouping && console.error("[DataTable] `enableGrouping` is not supported with `enableVirtualization`. Disable virt to use grouping."));
  });
  const _e = () => n.enableColumnSeparators ? "zen-border-r zen-border-zen-border last:zen-border-r-0" : "", Ve = () => n.enableColumnSeparators ? "[&>th]:zen-border-r [&>th]:zen-border-zen-border [&>th:last-child]:zen-border-r-0" : "", ae = () => !!n.stickyHeader && !n.enableVirtualization, U = (l) => {
    if (!n.enableColumnPinning) return;
    const u = l.getIsPinned();
    if (!u) return;
    const z = u === "left" && l.getIsLastColumn("left"), C = u === "right" && l.getIsFirstColumn("right");
    return {
      position: "sticky",
      left: u === "left" ? `${l.getStart("left")}px` : void 0,
      right: u === "right" ? `${l.getAfter("right")}px` : void 0,
      background: "var(--zen-color-background)",
      "z-index": 1,
      "box-shadow": z ? "inset -1px 0 0 var(--zen-color-border), 4px 0 6px -4px rgba(0,0,0,0.12)" : C ? "inset 1px 0 0 var(--zen-color-border), -4px 0 6px -4px rgba(0,0,0,0.12)" : void 0
    };
  }, J = () => n.headerVariant === "branded" ? "var(--zen-color-primary-soft)" : "var(--zen-color-background)", ge = (l) => {
    const u = U(l);
    if (u)
      return {
        ...u,
        background: J()
      };
  }, pe = () => n.headerVariant === "branded" ? "zen-bg-zen-primary-soft [&>th]:zen-text-zen-primary-soft-fg [&>th]:zen-font-semibold" : "", De = () => n.headerVariant === "underline" ? "[&_tr:last-child]:zen-border-b-2 [&_tr:last-child]:zen-border-zen-primary" : "", He = () => ae() ? n.headerVariant === "branded" ? "zen-sticky zen-top-0 zen-z-10" : "zen-sticky zen-top-0 zen-z-10 zen-bg-zen-background" : "", K = q(() => M.getVisibleLeafColumns().map((l) => l.id)), ue = (l) => {
    const {
      draggable: u,
      droppable: z
    } = l;
    if (!z || u.id === z.id) return;
    const C = K(), k = C.indexOf(String(u.id)), D = C.indexOf(String(z.id));
    if (k < 0 || D < 0) return;
    const A = Ke(C, k, D);
    w(A), n.onColumnOrderChange?.(A);
  }, dn = (l) => {
    const {
      draggable: u,
      droppable: z
    } = l;
    if (!z || u.id === z.id) return;
    const C = M.getRowModel().rows.map((A) => A.id), k = C.indexOf(String(u.id)), D = C.indexOf(String(z.id));
    k < 0 || D < 0 || n.onRowOrderChange?.(Ke(C, k, D));
  }, Me = (l) => {
    if (l.getIsGrouped()) {
      const u = l.row;
      return (() => {
        var z = pn(), C = z.firstChild, k = C.nextSibling, D = k.nextSibling, A = D.firstChild, N = A.nextSibling;
        return N.nextSibling, sn(C, "click", u.getToggleExpandedHandler(), !0), c(k, () => B(l.column.columnDef.cell, l.getContext())), c(D, () => u.subRows.length, N), R((G) => {
          var Oe = u.getIsExpanded(), Ae = u.getIsExpanded() ? "Collapse group" : "Expand group", Be = $("zen-inline-flex zen-items-center zen-justify-center zen-h-5 zen-w-5 zen-rounded-zen-sm", "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-transition-transform", "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", u.getIsExpanded() && "zen-rotate-90");
          return Oe !== G.e && I(C, "aria-expanded", G.e = Oe), Ae !== G.t && I(C, "aria-label", G.t = Ae), Be !== G.a && V(C, G.a = Be), G;
        }, {
          e: void 0,
          t: void 0,
          a: void 0
        }), z;
      })();
    }
    return l.getIsAggregated() ? B(l.column.columnDef.aggregatedCell ?? l.column.columnDef.cell, l.getContext()) : l.getIsPlaceholder() ? null : B(l.column.columnDef.cell, l.getContext());
  };
  return (() => {
    var l = Dn(), u = l.firstChild;
    return c(l, t(ot, {
      table: M,
      get enableColumnFilters() {
        return !!n.enableColumnFilters;
      },
      get enableColumnVisibility() {
        return !!n.enableColumnVisibility;
      },
      get enableColumnPinning() {
        return !!n.enableColumnPinning;
      },
      get enableGrouping() {
        return L();
      },
      get enableExport() {
        return !!n.enableExport;
      },
      get exportFilename() {
        return n.exportFilename ?? "data-table";
      },
      get exportOnlySelected() {
        return !!n.exportOnlySelected;
      },
      get globalFilter() {
        return Pe();
      },
      get globalFilterPlaceholder() {
        return n.globalFilterPlaceholder ?? "Search…";
      },
      onGlobalFilterChange: (z) => {
        n.globalFilter === void 0 && h(z), n.onGlobalFilterChange?.(z);
      }
    }), u), c(l, t(gt, {
      table: M,
      get renderBulkActions() {
        return n.renderBulkActions;
      }
    }), u), c(l, t(ut, {
      table: M
    }), u), c(u, t(v, {
      get when() {
        return n.enableVirtualization;
      },
      get fallback() {
        return t(v, {
          get when() {
            return Ee();
          },
          get fallback() {
            return t(Je, {
              table: M,
              get loading() {
                return !!n.loading;
              },
              get emptyMessage() {
                return n.emptyMessage ?? "No results.";
              },
              get maxBodyHeight() {
                return n.maxBodyHeight ?? 480;
              },
              get stickyHeaderActive() {
                return ae();
              },
              get sepHeadClass() {
                return Ve();
              },
              get sepCellClass() {
                return _e();
              },
              get stickyRowClass() {
                return He();
              },
              get headerVariantThead() {
                return De();
              },
              get headerVariantRow() {
                return pe();
              },
              get headerStickyBg() {
                return J();
              },
              headerPinStyle: ge,
              pinStyle: U,
              get enableColumnResizing() {
                return !!n.enableColumnResizing;
              },
              get enableColumnOrdering() {
                return !!n.enableColumnOrdering;
              },
              get enablePerColumnFilters() {
                return !!n.enablePerColumnFilters;
              },
              get visibleColumnIds() {
                return K();
              },
              onColumnDragEnd: ue,
              get editingCell() {
                return ne();
              },
              startEdit: re,
              commitEdit: ie,
              cancelEdit: le,
              get rowClassName() {
                return n.rowClassName;
              },
              renderCell: Me,
              get expansionEnabled() {
                return oe();
              },
              get renderSubRow() {
                return n.renderSubRow;
              }
            });
          },
          get children() {
            return t(be, {
              collisionDetector: he,
              onDragEnd: dn,
              get children() {
                return [t(fe, {}), t(ve, {
                  get ids() {
                    return M.getRowModel().rows.map((z) => z.id);
                  },
                  get children() {
                    return t(Je, {
                      table: M,
                      get loading() {
                        return !!n.loading;
                      },
                      get emptyMessage() {
                        return n.emptyMessage ?? "No results.";
                      },
                      get maxBodyHeight() {
                        return n.maxBodyHeight ?? 480;
                      },
                      get stickyHeaderActive() {
                        return ae();
                      },
                      get sepHeadClass() {
                        return Ve();
                      },
                      get sepCellClass() {
                        return _e();
                      },
                      get stickyRowClass() {
                        return He();
                      },
                      get headerVariantThead() {
                        return De();
                      },
                      get headerVariantRow() {
                        return pe();
                      },
                      get headerStickyBg() {
                        return J();
                      },
                      headerPinStyle: ge,
                      pinStyle: U,
                      get enableColumnResizing() {
                        return !!n.enableColumnResizing;
                      },
                      get enableColumnOrdering() {
                        return !!n.enableColumnOrdering;
                      },
                      get enablePerColumnFilters() {
                        return !!n.enablePerColumnFilters;
                      },
                      get visibleColumnIds() {
                        return K();
                      },
                      onColumnDragEnd: ue,
                      get editingCell() {
                        return ne();
                      },
                      startEdit: re,
                      commitEdit: ie,
                      cancelEdit: le,
                      get rowClassName() {
                        return n.rowClassName;
                      },
                      renderCell: Me,
                      expansionEnabled: !1,
                      renderSubRow: void 0,
                      rowOrderingActive: !0
                    });
                  }
                })];
              }
            });
          }
        });
      },
      get children() {
        return t(ht, {
          table: M,
          get maxHeight() {
            return n.maxBodyHeight ?? 480;
          },
          get estimatedRowHeight() {
            return n.rowEstimatedHeight ?? 44;
          },
          get emptyMessage() {
            return n.emptyMessage ?? "No results.";
          },
          get loading() {
            return !!n.loading;
          },
          get enableColumnPinning() {
            return !!n.enableColumnPinning;
          },
          get enableColumnResizing() {
            return !!n.enableColumnResizing;
          },
          get enableColumnOrdering() {
            return !!n.enableColumnOrdering;
          },
          get enablePerColumnFilters() {
            return !!n.enablePerColumnFilters;
          },
          get visibleColumnIds() {
            return K();
          },
          onColumnDragEnd: ue,
          get editingCell() {
            return ne();
          },
          onStartEdit: re,
          onCommitEdit: ie,
          onCancelEdit: le,
          get rowClassName() {
            return n.rowClassName;
          },
          get headerVariant() {
            return n.headerVariant ?? "plain";
          },
          pinStyle: U,
          headerPinStyle: ge,
          get headerStickyBg() {
            return J();
          }
        });
      }
    })), c(l, t(v, {
      get when() {
        return n.enablePagination || n.manualPagination;
      },
      get children() {
        return t(Ct, {
          table: M,
          get enableRowSelection() {
            return !!n.enableRowSelection;
          },
          get pageSizeOptions() {
            return n.pageSizeOptions ?? [10, 20, 50, 100];
          },
          get manual() {
            return !!n.manualPagination;
          }
        });
      }
    }), null), R((z) => {
      var C = $("zen-space-y-3", n.class), k = n.loading || void 0;
      return C !== z.e && V(l, z.e = C), k !== z.t && I(u, "aria-busy", z.t = k), z;
    }, {
      e: void 0,
      t: void 0
    }), l;
  })();
}
function ot(e) {
  const n = () => e.enableColumnFilters || e.enableColumnVisibility || e.enableGrouping || e.enableExport;
  return t(v, {
    get when() {
      return n();
    },
    get children() {
      var i = Hn(), o = i.firstChild;
      return c(i, t(v, {
        get when() {
          return e.enableColumnFilters;
        },
        get children() {
          return t(vn, {
            get value() {
              return e.globalFilter;
            },
            onInput: (r) => e.onGlobalFilterChange(r.currentTarget.value),
            get placeholder() {
              return e.globalFilterPlaceholder;
            },
            class: "zen-max-w-xs"
          });
        }
      }), o), c(o, t(v, {
        get when() {
          return e.enableExport;
        },
        get children() {
          return t(dt, {
            get table() {
              return e.table;
            },
            get filename() {
              return e.exportFilename;
            },
            get onlySelected() {
              return e.exportOnlySelected;
            }
          });
        }
      }), null), c(o, t(v, {
        get when() {
          return e.enableGrouping;
        },
        get children() {
          return t(at, {
            get table() {
              return e.table;
            }
          });
        }
      }), null), c(o, t(v, {
        get when() {
          return e.enableColumnVisibility;
        },
        get children() {
          return t(st, {
            get table() {
              return e.table;
            },
            get enableColumnPinning() {
              return e.enableColumnPinning;
            }
          });
        }
      }), null), i;
    }
  });
}
function at(e) {
  const n = q(() => e.table.getAllColumns().filter((o) => o.getCanGroup())), i = () => e.table.getState().grouping.length;
  return t(v, {
    get when() {
      return n().length > 0;
    },
    get children() {
      return t(Ce, {
        get children() {
          return [t(xe, {
            as: T,
            variant: "outline",
            color: "neutral",
            size: "sm",
            get children() {
              return S(() => !!i())() ? `Group by (${i()})` : "Group by";
            }
          }), t(ye, {
            class: "zen-min-w-44",
            get children() {
              return [t(we, {
                children: "Group rows by"
              }), t(Se, {}), t(P, {
                get each() {
                  return n();
                },
                children: (o) => {
                  const r = typeof o.columnDef.header == "string" ? o.columnDef.header : o.id;
                  return t(qe, {
                    get checked() {
                      return o.getIsGrouped();
                    },
                    onChange: () => o.toggleGrouping(),
                    children: r
                  });
                }
              })];
            }
          })];
        }
      });
    }
  });
}
function gt(e) {
  const n = () => e.table.getSelectedRowModel().rows, i = () => n().length;
  return t(v, {
    get when() {
      return S(() => i() > 0)() && e.renderBulkActions;
    },
    get children() {
      return (() => {
        const o = () => e.table.getFilteredRowModel().rows, r = () => o().length, a = () => i() === r(), m = () => e.table.getIsAllPageRowsSelected(), s = () => r() > i(), f = () => m() && !a() && s(), d = () => e.table.resetRowSelection(), g = () => {
          const b = {};
          o().forEach((h) => b[h.id] = !0), e.table.setRowSelection(b);
        };
        return (() => {
          var b = On(), h = b.firstChild, x = h.firstChild, F = h.nextSibling, E = F.firstChild;
          return c(h, i, x), c(b, t(v, {
            get when() {
              return f();
            },
            get children() {
              var w = Mn(), _ = w.firstChild, H = _.nextSibling;
              return H.nextSibling, w.$$click = g, c(w, r, H), R(() => V(w, $("zen-text-xs zen-underline zen-underline-offset-2", "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-inherit", "hover:zen-opacity-80", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2"))), w;
            }
          }), F), c(F, () => e.renderBulkActions({
            table: e.table,
            rows: n(),
            clear: d
          }), E), E.$$click = d, R((w) => {
            var _ = $("zen-flex zen-items-center zen-gap-3 zen-px-3 zen-py-2", "zen-rounded-zen-md zen-bg-zen-primary-soft zen-border zen-border-zen-primary-soft", "zen-text-zen-primary-soft-fg"), H = $("zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6", "zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer", "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10", "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring");
            return _ !== w.e && V(b, w.e = _), H !== w.t && V(E, w.t = H), w;
          }, {
            e: void 0,
            t: void 0
          }), b;
        })();
      })();
    }
  });
}
function ut(e) {
  const n = () => e.table.getState().columnFilters, i = () => e.table.getState().globalFilter ?? "", o = () => i().length > 0, r = () => n().length > 0 || o(), a = (s) => {
    const d = e.table.getColumn(s)?.columnDef.header;
    return typeof d == "string" ? d : s;
  }, m = (s) => {
    if (s == null || s === "") return "";
    if (Array.isArray(s)) {
      const [f, d] = s;
      return f == null && d == null ? "" : f == null ? `≤ ${d}` : d == null ? `≥ ${f}` : `${f} – ${d}`;
    }
    if (typeof s == "object") {
      const f = s;
      return f.op && f.value !== void 0 && f.value !== null && f.value !== "" ? `${{
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
      }[f.op] ?? f.op} ${f.value}` : "";
    }
    return typeof s == "boolean" ? s ? "Yes" : "No" : String(s);
  };
  return t(v, {
    get when() {
      return r();
    },
    get children() {
      var s = An(), f = s.firstChild, d = f.nextSibling;
      return c(s, t(v, {
        get when() {
          return o();
        },
        get children() {
          return t(Le, {
            get label() {
              return `Search: ${i()}`;
            },
            onRemove: () => e.table.setGlobalFilter("")
          });
        }
      }), d), c(s, t(P, {
        get each() {
          return n();
        },
        children: (g) => {
          const b = m(g.value);
          return t(v, {
            when: b,
            get children() {
              return t(Le, {
                get label() {
                  return `${a(g.id)}: ${b}`;
                },
                onRemove: () => e.table.getColumn(g.id)?.setFilterValue(void 0)
              });
            }
          });
        }
      }), d), d.$$click = () => {
        e.table.resetColumnFilters(), e.table.setGlobalFilter("");
      }, R(() => V(d, $("zen-ml-1 zen-inline-flex zen-items-center zen-text-xs zen-px-2 zen-py-0.5 zen-rounded-zen-sm", "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted", "zen-bg-transparent zen-border-0 zen-cursor-pointer", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"))), s;
    }
  });
}
function Le(e) {
  return (() => {
    var n = Bn(), i = n.firstChild, o = i.nextSibling;
    return c(i, () => e.label), o.$$click = () => e.onRemove(), R((r) => {
      var a = $("zen-inline-flex zen-items-center zen-gap-1 zen-px-2 zen-py-0.5", "zen-text-xs zen-font-medium", "zen-rounded-zen-full zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg", "zen-border zen-border-zen-primary-soft"), m = `Remove ${e.label}`, s = $("zen-inline-flex zen-items-center zen-justify-center", "zen-h-4 zen-w-4 zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer", "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10", "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring");
      return a !== r.e && V(n, r.e = a), m !== r.t && I(o, "aria-label", r.t = m), s !== r.a && V(o, r.a = s), r;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    }), n;
  })();
}
function dt(e) {
  const n = () => {
    const a = e.onlySelected ? e.table.getSelectedRowModel().rows : e.table.getFilteredRowModel().rows;
    return e.onlySelected && a.length === 0 ? e.table.getFilteredRowModel().rows : a;
  }, i = () => e.table.getVisibleLeafColumns().filter((a) => !a.id.startsWith("__")), o = () => {
    const a = i(), s = n().map((f) => {
      const d = {};
      return a.forEach((g) => {
        d[g.id] = f.getValue(g.id);
      }), d;
    });
    Ne(new Blob([JSON.stringify(s, null, 2)], {
      type: "application/json"
    }), `${e.filename}.json`);
  }, r = () => {
    const a = i(), m = n(), s = a.map((d) => je(lt(d))).join(","), f = m.map((d) => a.map((g) => je(d.getValue(g.id))).join(",")).join(`
`);
    Ne(new Blob([`${s}
${f}`], {
      type: "text/csv;charset=utf-8"
    }), `${e.filename}.csv`);
  };
  return t(Ce, {
    get children() {
      return [t(xe, {
        as: T,
        variant: "outline",
        color: "neutral",
        size: "sm",
        children: "Export"
      }), t(ye, {
        class: "zen-min-w-44",
        get children() {
          return [t(we, {
            get children() {
              return ["Export ", S(() => e.onlySelected ? "selected" : "visible"), " rows"];
            }
          }), t(Se, {}), t(Ge, {
            onSelect: r,
            children: "CSV (.csv)"
          }), t(Ge, {
            onSelect: o,
            children: "JSON (.json)"
          })];
        }
      })];
    }
  });
}
function st(e) {
  const n = () => e.table.getAllColumns().filter((i) => i.getCanHide());
  return t(v, {
    get when() {
      return n().length > 0;
    },
    get children() {
      return t(Ce, {
        get children() {
          return [t(xe, {
            as: T,
            variant: "outline",
            color: "neutral",
            size: "sm",
            children: "Columns"
          }), t(ye, {
            class: "zen-min-w-56",
            get children() {
              return [t(we, {
                get children() {
                  return e.enableColumnPinning ? "Manage columns" : "Toggle columns";
                }
              }), t(Se, {}), t(P, {
                get each() {
                  return n();
                },
                children: (i) => {
                  const o = () => typeof i.columnDef.header == "string" ? i.columnDef.header : i.id;
                  return t(v, {
                    get when() {
                      return e.enableColumnPinning;
                    },
                    get fallback() {
                      return t(qe, {
                        get checked() {
                          return i.getIsVisible();
                        },
                        onChange: (r) => i.toggleVisibility(r),
                        get children() {
                          return o();
                        }
                      });
                    },
                    get children() {
                      var r = Gn(), a = r.firstChild;
                      return c(r, t(se, {
                        get checked() {
                          return i.getIsVisible();
                        },
                        onChange: (m) => i.toggleVisibility(m),
                        get "aria-label"() {
                          return `Toggle visibility of ${o()}`;
                        }
                      }), a), c(a, o), c(r, t(Ue, {
                        get active() {
                          return i.getIsPinned() === "left";
                        },
                        side: "left",
                        get label() {
                          return o();
                        },
                        onClick: (m) => {
                          m.preventDefault(), i.pin(i.getIsPinned() === "left" ? !1 : "left");
                        }
                      }), null), c(r, t(Ue, {
                        get active() {
                          return i.getIsPinned() === "right";
                        },
                        side: "right",
                        get label() {
                          return o();
                        },
                        onClick: (m) => {
                          m.preventDefault(), i.pin(i.getIsPinned() === "right" ? !1 : "right");
                        }
                      }), null), r;
                    }
                  });
                }
              })];
            }
          })];
        }
      });
    }
  });
}
function Ue(e) {
  return (() => {
    var n = X();
    return n.$$click = (i) => e.onClick(i), c(n, () => e.side === "left" ? "◀" : "▶"), R((i) => {
      var o = e.active ? `Unpin ${e.label} from ${e.side}` : `Pin ${e.label} to ${e.side}`, r = e.active, a = e.active ? `Unpin from ${e.side}` : `Pin to ${e.side}`, m = $("zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6 zen-rounded-zen-sm", "zen-border-0 zen-cursor-pointer zen-text-xs", e.active ? "zen-bg-zen-primary zen-text-zen-primary-fg" : "zen-bg-transparent zen-text-zen-muted-fg hover:zen-bg-zen-muted hover:zen-text-zen-foreground", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring");
      return o !== i.e && I(n, "aria-label", i.e = o), r !== i.t && I(n, "aria-pressed", i.t = r), a !== i.a && I(n, "title", i.a = a), m !== i.o && V(n, i.o = m), i;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0
    }), n;
  })();
}
function Je(e) {
  const n = () => e.table.getRowModel().rows, i = () => e.table.getAllLeafColumns().length, o = () => t(wn, {
    get class() {
      return e.headerVariantThead;
    },
    get children() {
      return [t(P, {
        get each() {
          return e.table.getHeaderGroups();
        },
        children: (r) => t(j, {
          get class() {
            return $(e.sepHeadClass, e.stickyRowClass, e.headerVariantRow);
          },
          get children() {
            return t(P, {
              get each() {
                return r.headers;
              },
              children: (a) => t(zt, {
                header: a,
                get enableColumnResizing() {
                  return e.enableColumnResizing;
                },
                get enableColumnOrdering() {
                  return e.enableColumnOrdering;
                },
                get pinStyle() {
                  return e.headerPinStyle(a.column);
                },
                get stickyHeader() {
                  return e.stickyHeaderActive;
                },
                get stickyBg() {
                  return e.headerStickyBg;
                }
              })
            });
          }
        })
      }), t(v, {
        get when() {
          return e.enablePerColumnFilters;
        },
        get children() {
          return t(P, {
            get each() {
              return e.table.getHeaderGroups();
            },
            children: (r) => t(j, {
              get class() {
                return $(e.sepHeadClass, e.stickyRowClass, e.headerVariantRow);
              },
              get style() {
                return e.stickyHeaderActive ? {
                  top: "var(--zen-dt-header-h, 40px)"
                } : void 0;
              },
              get children() {
                return t(P, {
                  get each() {
                    return r.headers;
                  },
                  children: (a) => {
                    const m = e.headerPinStyle(a.column);
                    return t(Y, {
                      class: "zen-px-2 zen-py-1",
                      get style() {
                        return m ? {
                          ...m,
                          "z-index": e.stickyHeaderActive ? 11 : 1
                        } : e.stickyHeaderActive ? {
                          background: e.headerStickyBg
                        } : void 0;
                      },
                      get children() {
                        return t(v, {
                          get when() {
                            return S(() => !!a.column.getCanFilter())() && !a.id.startsWith("__");
                          },
                          get children() {
                            return t(Ye, {
                              get column() {
                                return a.column;
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            })
          });
        }
      })];
    }
  });
  return t(xn, {
    get containerStyle() {
      return S(() => !!e.stickyHeaderActive)() ? {
        "max-height": `${e.maxBodyHeight}px`
      } : void 0;
    },
    get children() {
      return [t(v, {
        get when() {
          return e.enableColumnOrdering;
        },
        get fallback() {
          return t(o, {});
        },
        get children() {
          return t(be, {
            collisionDetector: he,
            get onDragEnd() {
              return e.onColumnDragEnd;
            },
            get children() {
              return [t(fe, {}), t(ve, {
                get ids() {
                  return e.visibleColumnIds;
                },
                get children() {
                  return t(o, {});
                }
              })];
            }
          });
        }
      }), t(yn, {
        get children() {
          return t(v, {
            get when() {
              return S(() => !e.loading)() && n().length > 0;
            },
            get fallback() {
              return t(j, {
                get children() {
                  return t(W, {
                    get colSpan() {
                      return i();
                    },
                    class: "zen-text-center zen-text-zen-muted-fg zen-py-6",
                    get children() {
                      return S(() => !!e.loading)() ? "Loading…" : e.emptyMessage;
                    }
                  });
                }
              });
            },
            get children() {
              return t(P, {
                get each() {
                  return n();
                },
                children: (r) => t(v, {
                  get when() {
                    return e.rowOrderingActive;
                  },
                  get fallback() {
                    return [t(j, {
                      get "data-state"() {
                        return r.getIsSelected() ? "selected" : void 0;
                      },
                      get "data-grouped"() {
                        return r.getIsGrouped() ? "true" : void 0;
                      },
                      get class() {
                        return $(r.getIsGrouped() && "zen-bg-zen-muted/40 zen-font-medium", e.rowClassName?.(r));
                      },
                      get children() {
                        return t(P, {
                          get each() {
                            return r.getVisibleCells();
                          },
                          children: (a) => {
                            const m = e.pinStyle(a.column), s = () => e.editingCell?.rowId === r.id && e.editingCell?.columnId === a.column.id, f = () => !a.getIsGrouped() && !a.getIsAggregated() && !a.getIsPlaceholder();
                            return t(W, {
                              get class() {
                                return e.sepCellClass;
                              },
                              style: m,
                              get children() {
                                return t(v, {
                                  get when() {
                                    return f();
                                  },
                                  get fallback() {
                                    return e.renderCell(a);
                                  },
                                  get children() {
                                    return t(ce, {
                                      cell: a,
                                      get editing() {
                                        return s();
                                      },
                                      onStartEdit: () => e.startEdit(r.id, a.column.id),
                                      onCommit: (d) => e.commitEdit(r.id, a.column.id, d),
                                      get onCancel() {
                                        return e.cancelEdit;
                                      },
                                      get children() {
                                        return e.renderCell(a);
                                      }
                                    });
                                  }
                                });
                              }
                            });
                          }
                        });
                      }
                    }), t(v, {
                      get when() {
                        return S(() => !!(e.expansionEnabled && r.getIsExpanded()))() && e.renderSubRow;
                      },
                      get children() {
                        return t(j, {
                          get "data-expanded-of"() {
                            return r.id;
                          },
                          get children() {
                            return t(W, {
                              get colSpan() {
                                return r.getVisibleCells().length;
                              },
                              class: "zen-p-0 zen-bg-zen-muted/30",
                              get children() {
                                return e.renderSubRow(r);
                              }
                            });
                          }
                        });
                      }
                    })];
                  },
                  get children() {
                    return t(mt, {
                      get id() {
                        return r.id;
                      },
                      get selected() {
                        return r.getIsSelected();
                      },
                      get class() {
                        return e.rowClassName?.(r);
                      },
                      get children() {
                        return t(P, {
                          get each() {
                            return r.getVisibleCells();
                          },
                          children: (a) => {
                            const m = e.pinStyle(a.column), s = () => e.editingCell?.rowId === r.id && e.editingCell?.columnId === a.column.id;
                            return t(W, {
                              get class() {
                                return e.sepCellClass;
                              },
                              style: m,
                              get children() {
                                return t(ce, {
                                  cell: a,
                                  get editing() {
                                    return s();
                                  },
                                  onStartEdit: () => e.startEdit(r.id, a.column.id),
                                  onCommit: (f) => e.commitEdit(r.id, a.column.id, f),
                                  get onCancel() {
                                    return e.cancelEdit;
                                  },
                                  get children() {
                                    return e.renderCell(a);
                                  }
                                });
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                })
              });
            }
          });
        }
      })];
    }
  });
}
function ct(e) {
  const n = Q(e.id);
  return (() => {
    var i = Tn(), o = n.ref;
    return typeof o == "function" ? me(o, i) : n.ref = i, We(i, ze(() => n.dragActivators, {
      "aria-label": "Drag to reorder row",
      get class() {
        return $("zen-cursor-grab active:zen-cursor-grabbing zen-inline-flex zen-items-center zen-justify-center", "zen-h-6 zen-w-6 zen-rounded-zen-sm zen-bg-transparent zen-border-0", "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring");
      }
    }), !1, !0), i;
  })();
}
function mt(e) {
  const n = Q(e.id);
  return t(j, {
    ref(i) {
      var o = n.ref;
      typeof o == "function" ? o(i) : n.ref = i;
    },
    get "data-state"() {
      return e.selected ? "selected" : void 0;
    },
    get class() {
      return e.class;
    },
    get style() {
      return S(() => !!n.transform)() ? {
        transform: `translate3d(${n.transform.x}px, ${n.transform.y}px, 0)`,
        opacity: n.isActiveDraggable ? 0.6 : 1,
        position: n.isActiveDraggable ? "relative" : void 0,
        "z-index": n.isActiveDraggable ? 1 : void 0
      } : void 0;
    },
    get children() {
      return e.children;
    }
  });
}
function zt(e) {
  const n = () => e.header, i = () => n().column.getCanSort(), o = () => n().column.getIsSorted(), r = () => n().column.getSortIndex() >= 0 ? n().column.getSortIndex() + 1 : null, a = () => n().column.getIsResizing(), m = () => o() === "asc" ? "ascending" : o() === "desc" ? "descending" : "none", s = () => [t(v, {
    get when() {
      return i();
    },
    get fallback() {
      return (() => {
        var d = Xe();
        return c(d, () => B(n().column.columnDef.header, n().getContext())), d;
      })();
    },
    get children() {
      var d = X();
      return d.$$click = (g) => n().column.getToggleSortingHandler()?.(g), c(d, () => B(n().column.columnDef.header, n().getContext()), null), c(d, t(Ze, {
        get state() {
          return o();
        }
      }), null), c(d, t(v, {
        get when() {
          return r() !== null;
        },
        get children() {
          var g = jn();
          return c(g, r), R(() => I(g, "title", `Sort priority ${r()}`)), g;
        }
      }), null), R((g) => {
        var b = `Sort by ${typeof n().column.columnDef.header == "string" ? n().column.columnDef.header : n().column.id}, currently ${m()}`, h = $("zen-w-full zen-h-full zen-px-2 zen-py-2", "zen-inline-flex zen-items-center zen-gap-1 zen-text-start zen-font-inherit zen-text-inherit", "zen-bg-transparent zen-border-0 zen-cursor-pointer", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset");
        return b !== g.e && I(d, "aria-label", g.e = b), h !== g.t && V(d, g.t = h), g;
      }, {
        e: void 0,
        t: void 0
      }), d;
    }
  }), t(v, {
    get when() {
      return S(() => !!e.enableColumnResizing)() && n().column.getCanResize();
    },
    get children() {
      var d = X();
      return d.$$click = (g) => g.stopPropagation(), d.$$touchstart = (g) => n().getResizeHandler()(g), d.$$mousedown = (g) => n().getResizeHandler()(g), R((g) => {
        var b = `Resize ${n().column.id}`, h = $("zen-absolute zen-right-0 zen-top-0 zen-h-full zen-w-1.5 zen-cursor-col-resize zen-select-none zen-touch-none", "zen-bg-transparent zen-border-0 zen-p-0", "hover:zen-bg-zen-primary", a() && "zen-bg-zen-primary");
        return b !== g.e && I(d, "aria-label", g.e = b), h !== g.t && V(d, g.t = h), g;
      }, {
        e: void 0,
        t: void 0
      }), d;
    }
  })], f = () => ({
    width: `${n().column.getSize()}px`,
    ...e.pinStyle ?? {},
    ...e.pinStyle ? {
      "z-index": e.stickyHeader ? 11 : 1
    } : {},
    ...e.stickyHeader && !e.pinStyle ? {
      background: e.stickyBg ?? "var(--zen-color-background)"
    } : {}
  });
  return t(v, {
    get when() {
      return !n().isPlaceholder;
    },
    get fallback() {
      return t(Y, {});
    },
    get children() {
      return t(v, {
        get when() {
          return e.enableColumnOrdering;
        },
        get fallback() {
          return t(Y, {
            get "data-active"() {
              return o() ? "true" : void 0;
            },
            get "aria-sort"() {
              return S(() => o() === "asc")() ? "ascending" : o() === "desc" ? "descending" : void 0;
            },
            get class() {
              return $("zen-p-0 zen-transition-colors zen-relative", i() && "hover:zen-bg-zen-muted", "data-[active=true]:zen-bg-zen-primary-soft data-[active=true]:zen-text-zen-primary-soft-fg");
            },
            get style() {
              return f();
            },
            get children() {
              return s();
            }
          });
        },
        get children() {
          return t(bt, {
            get id() {
              return n().column.id;
            },
            get sorted() {
              return o();
            },
            get canSort() {
              return i();
            },
            get style() {
              return f();
            },
            get children() {
              return s();
            }
          });
        }
      });
    }
  });
}
function bt(e) {
  const n = Q(e.id), i = () => ({
    ...e.style,
    ...n.transform ? {
      transform: `translate3d(${n.transform.x}px, ${n.transform.y}px, 0)`,
      opacity: n.isActiveDraggable ? 0.6 : 1
    } : {},
    cursor: "grab",
    position: "relative"
  });
  return t(Y, ze({
    ref(o) {
      var r = n.ref;
      typeof r == "function" ? r(o) : n.ref = o;
    }
  }, () => n.dragActivators, {
    get "data-active"() {
      return e.sorted ? "true" : void 0;
    },
    get "aria-sort"() {
      return S(() => e.sorted === "asc")() ? "ascending" : e.sorted === "desc" ? "descending" : void 0;
    },
    get class() {
      return $("zen-p-0 zen-transition-colors", e.canSort && "hover:zen-bg-zen-muted", "data-[active=true]:zen-bg-zen-primary-soft data-[active=true]:zen-text-zen-primary-soft-fg");
    },
    get style() {
      return i();
    },
    get children() {
      return e.children;
    }
  }));
}
function Ze(e) {
  return t(v, {
    get when() {
      return e.state;
    },
    get fallback() {
      return Nn();
    },
    children: (n) => t(v, {
      get when() {
        return n() === "asc";
      },
      get fallback() {
        return Un();
      },
      get children() {
        return Ln();
      }
    })
  });
}
function ht(e) {
  let n;
  const i = () => e.table.getRowModel().rows, o = fn({
    get count() {
      return i().length;
    },
    getScrollElement: () => n ?? null,
    estimateSize: () => e.estimatedRowHeight,
    overscan: 8
  }), r = () => e.table.getVisibleLeafColumns(), a = q(() => {
    const m = e.table.getState().columnSizing;
    return r().map((s) => {
      const f = m[s.id];
      if (f !== void 0) return `${f}px`;
      const d = s.columnDef.size;
      return d !== void 0 && d !== 150 ? `${d}px` : "minmax(0, 1fr)";
    }).join(" ");
  });
  return (() => {
    var m = Jn(), s = m.firstChild, f = s.nextSibling, d = n;
    return typeof d == "function" ? me(d, m) : n = m, c(s, t(v, {
      get when() {
        return e.enableColumnOrdering;
      },
      get fallback() {
        return t(P, {
          get each() {
            return e.table.getHeaderGroups();
          },
          children: (g) => (() => {
            var b = Te();
            return c(b, t(P, {
              get each() {
                return g.headers;
              },
              children: (h) => t(ft, {
                header: h,
                get pinStyle() {
                  return e.headerPinStyle(h.column);
                },
                get enableColumnResizing() {
                  return e.enableColumnResizing;
                },
                get branded() {
                  return e.headerVariant === "branded";
                }
              })
            })), R((h) => O(b, "grid-template-columns", a())), b;
          })()
        });
      },
      get children() {
        return t(be, {
          collisionDetector: he,
          get onDragEnd() {
            return e.onColumnDragEnd;
          },
          get children() {
            return [t(fe, {}), t(ve, {
              get ids() {
                return e.visibleColumnIds;
              },
              get children() {
                return t(P, {
                  get each() {
                    return e.table.getHeaderGroups();
                  },
                  children: (g) => (() => {
                    var b = Te();
                    return c(b, t(P, {
                      get each() {
                        return g.headers;
                      },
                      children: (h) => t(vt, {
                        header: h,
                        get pinStyle() {
                          return e.headerPinStyle(h.column);
                        },
                        get enableColumnResizing() {
                          return e.enableColumnResizing;
                        },
                        get branded() {
                          return e.headerVariant === "branded";
                        }
                      })
                    })), R((h) => O(b, "grid-template-columns", a())), b;
                  })()
                });
              }
            })];
          }
        });
      }
    }), null), c(s, t(v, {
      get when() {
        return e.enablePerColumnFilters;
      },
      get children() {
        return t(P, {
          get each() {
            return e.table.getHeaderGroups();
          },
          children: (g) => (() => {
            var b = Kn();
            return c(b, t(P, {
              get each() {
                return g.headers;
              },
              children: (h) => {
                const x = e.headerPinStyle(h.column);
                return (() => {
                  var F = Wn();
                  return c(F, t(v, {
                    get when() {
                      return S(() => !!h.column.getCanFilter())() && !h.id.startsWith("__");
                    },
                    get children() {
                      return t(Ye, {
                        get column() {
                          return h.column;
                        }
                      });
                    }
                  })), R((E) => de(F, {
                    background: e.headerStickyBg,
                    ...x ?? {},
                    ...x ? {
                      "z-index": 2
                    } : {}
                  }, E)), F;
                })();
              }
            })), R((h) => O(b, "grid-template-columns", a())), b;
          })()
        });
      }
    }), null), c(f, t(v, {
      get when() {
        return S(() => !e.loading)() && i().length > 0;
      },
      get fallback() {
        return (() => {
          var g = qn();
          return c(g, (() => {
            var b = S(() => !!e.loading);
            return () => b() ? "Loading…" : e.emptyMessage;
          })()), g;
        })();
      },
      get children() {
        return t(P, {
          get each() {
            return o.getVirtualItems();
          },
          children: (g) => {
            const b = i()[g.index];
            return (() => {
              var h = Yn();
              return c(h, t(P, {
                get each() {
                  return b.getVisibleCells();
                },
                children: (x) => {
                  const F = e.pinStyle(x.column), E = () => e.editingCell?.rowId === b.id && e.editingCell?.columnId === x.column.id;
                  return (() => {
                    var w = Xn();
                    return c(w, t(ce, {
                      cell: x,
                      get editing() {
                        return E();
                      },
                      onStartEdit: () => e.onStartEdit(b.id, x.column.id),
                      onCommit: (_) => e.onCommitEdit(b.id, x.column.id, _),
                      get onCancel() {
                        return e.onCancelEdit;
                      },
                      get children() {
                        return B(x.column.columnDef.cell, x.getContext());
                      }
                    })), R((_) => de(w, {
                      ...F ?? {}
                    }, _)), w;
                  })();
                }
              })), R((x) => {
                var F = b.getIsSelected() ? "selected" : void 0, E = `translateY(${g.start}px)`, w = `${g.size}px`, _ = a(), H = $("zen-border-b zen-border-zen-border zen-transition-[background-color,box-shadow,outline-color] zen-duration-100", "hover:zen-bg-zen-muted/50 hover:zen-shadow-zen-sm", b.getIsSelected() && "zen-bg-zen-primary-soft zen-shadow-zen-sm zen-outline zen-outline-1 -zen-outline-offset-1 zen-outline-zen-primary", e.rowClassName?.(b));
                return F !== x.e && I(h, "data-state", x.e = F), E !== x.t && O(h, "transform", x.t = E), w !== x.a && O(h, "height", x.a = w), _ !== x.o && O(h, "grid-template-columns", x.o = _), H !== x.i && V(h, x.i = H), x;
              }, {
                e: void 0,
                t: void 0,
                a: void 0,
                o: void 0,
                i: void 0
              }), h;
            })();
          }
        });
      }
    })), R((g) => {
      var b = `${e.maxHeight}px`, h = i().length + 1, x = r().length, F = e.headerStickyBg, E = e.headerVariant === "underline" ? "2px solid var(--zen-color-primary)" : "1px solid var(--zen-color-border)", w = `${o.getTotalSize()}px`;
      return b !== g.e && O(m, "max-height", g.e = b), h !== g.t && I(m, "aria-rowcount", g.t = h), x !== g.a && I(m, "aria-colcount", g.a = x), F !== g.o && O(s, "background", g.o = F), E !== g.i && O(s, "border-bottom", g.i = E), w !== g.n && O(f, "height", g.n = w), g;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0,
      n: void 0
    }), m;
  })();
}
function en(e) {
  const n = () => e.header.column.getCanSort(), i = () => e.header.column.getIsSorted(), o = () => e.header.column.getIsResizing();
  return [t(v, {
    get when() {
      return !e.header.isPlaceholder;
    },
    fallback: null,
    get children() {
      return t(v, {
        get when() {
          return n();
        },
        get fallback() {
          return (() => {
            var r = Xe();
            return c(r, () => B(e.header.column.columnDef.header, e.header.getContext())), r;
          })();
        },
        get children() {
          var r = Qn();
          return r.$$click = (a) => e.header.column.getToggleSortingHandler()?.(a), c(r, () => B(e.header.column.columnDef.header, e.header.getContext()), null), c(r, t(Ze, {
            get state() {
              return i();
            }
          }), null), r;
        }
      });
    }
  }), t(v, {
    get when() {
      return S(() => !!e.enableColumnResizing)() && e.header.column.getCanResize();
    },
    get children() {
      var r = X();
      return r.$$pointerdown = (a) => a.stopPropagation(), r.$$click = (a) => a.stopPropagation(), r.$$touchstart = (a) => e.header.getResizeHandler()(a), r.$$mousedown = (a) => e.header.getResizeHandler()(a), R((a) => {
        var m = `Resize ${e.header.column.id}`, s = $("zen-absolute zen-right-0 zen-top-0 zen-h-full zen-w-1.5 zen-cursor-col-resize zen-select-none zen-touch-none", "zen-bg-transparent zen-border-0 zen-p-0", "hover:zen-bg-zen-primary", o() && "zen-bg-zen-primary");
        return m !== a.e && I(r, "aria-label", a.e = m), s !== a.t && V(r, a.t = s), a;
      }, {
        e: void 0,
        t: void 0
      }), r;
    }
  })];
}
function ft(e) {
  const n = () => e.header.column.getCanSort(), i = () => e.header.column.getIsSorted();
  return (() => {
    var o = Zn();
    return c(o, t(en, {
      get header() {
        return e.header;
      },
      get enableColumnResizing() {
        return e.enableColumnResizing;
      }
    })), R((r) => {
      var a = i() ? "true" : void 0, m = i() === "asc" ? "ascending" : i() === "desc" ? "descending" : void 0, s = $("zen-text-sm zen-flex zen-items-center zen-transition-colors zen-relative", e.branded ? "zen-font-semibold zen-text-zen-primary-soft-fg" : "zen-font-medium zen-text-zen-muted-fg", n() && "hover:zen-bg-zen-muted", "data-[active=true]:zen-bg-zen-primary-soft data-[active=true]:zen-text-zen-primary-soft-fg"), f = {
        ...e.pinStyle ?? {},
        ...e.pinStyle ? {
          "z-index": 2
        } : {}
      };
      return a !== r.e && I(o, "data-active", r.e = a), m !== r.t && I(o, "aria-sort", r.t = m), s !== r.a && V(o, r.a = s), r.o = de(o, f, r.o), r;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0
    }), o;
  })();
}
function vt(e) {
  const n = Q(e.header.column.id), i = () => e.header.column.getCanSort(), o = () => e.header.column.getIsSorted();
  return (() => {
    var r = et(), a = n.ref;
    return typeof a == "function" ? me(a, r) : n.ref = r, We(r, ze(() => n.dragActivators, {
      role: "columnheader",
      get "data-active"() {
        return o() ? "true" : void 0;
      },
      get "aria-sort"() {
        return S(() => o() === "asc")() ? "ascending" : o() === "desc" ? "descending" : void 0;
      },
      get class() {
        return $("zen-text-sm zen-flex zen-items-center zen-transition-colors zen-relative", e.branded ? "zen-font-semibold zen-text-zen-primary-soft-fg" : "zen-font-medium zen-text-zen-muted-fg", i() && "hover:zen-bg-zen-muted", "data-[active=true]:zen-bg-zen-primary-soft data-[active=true]:zen-text-zen-primary-soft-fg");
      },
      get style() {
        return {
          "min-width": 0,
          ...n.transform ? {
            transform: `translate3d(${n.transform.x}px, ${n.transform.y}px, 0)`,
            opacity: n.isActiveDraggable ? 0.6 : 1
          } : {},
          cursor: "grab",
          ...e.pinStyle ?? {},
          ...e.pinStyle ? {
            "z-index": 2
          } : {}
        };
      }
    }), !1, !0), c(r, t(en, {
      get header() {
        return e.header;
      },
      get enableColumnResizing() {
        return e.enableColumnResizing;
      }
    })), r;
  })();
}
function Ct(e) {
  const n = () => e.table.getState().pagination, i = () => e.table.getPageCount(), o = () => e.table.getSelectedRowModel().rows.length, r = () => e.table.getFilteredRowModel().rows.length;
  return (() => {
    var a = tt(), m = a.firstChild, s = m.nextSibling, f = s.firstChild;
    return c(m, t(v, {
      get when() {
        return e.enableRowSelection;
      },
      get fallback() {
        return ["Page ", S(() => n().pageIndex + 1), " of ", S(() => Math.max(i(), 1))];
      },
      get children() {
        return [S(() => o()), " of ", S(() => r()), " row(s) selected."];
      }
    })), c(s, t(v, {
      get when() {
        return !e.manual;
      },
      get children() {
        var d = nt(), g = d.firstChild, b = g.nextSibling;
        return c(b, t(Cn, {
          get options() {
            return e.pageSizeOptions.map((h) => ({
              value: String(h),
              label: String(h)
            }));
          },
          get value() {
            return String(n().pageSize);
          },
          onChange: (h) => h && e.table.setPageSize(Number(h))
        })), d;
      }
    }), f), c(f, t(T, {
      variant: "outline",
      color: "neutral",
      size: "sm",
      get disabled() {
        return !e.table.getCanPreviousPage();
      },
      onClick: () => e.table.setPageIndex(0),
      "aria-label": "First page",
      children: "«"
    }), null), c(f, t(T, {
      variant: "outline",
      color: "neutral",
      size: "sm",
      get disabled() {
        return !e.table.getCanPreviousPage();
      },
      onClick: () => e.table.previousPage(),
      "aria-label": "Previous page",
      children: "‹"
    }), null), c(f, t(T, {
      variant: "outline",
      color: "neutral",
      size: "sm",
      get disabled() {
        return !e.table.getCanNextPage();
      },
      onClick: () => e.table.nextPage(),
      "aria-label": "Next page",
      children: "›"
    }), null), c(f, t(T, {
      variant: "outline",
      color: "neutral",
      size: "sm",
      get disabled() {
        return !e.table.getCanNextPage();
      },
      onClick: () => e.table.setPageIndex(e.table.getPageCount() - 1),
      "aria-label": "Last page",
      children: "»"
    }), null), a;
  })();
}
function Ke(e, n, i) {
  const o = [...e], [r] = o.splice(n, 1);
  return o.splice(i, 0, r), o;
}
cn(["click", "mousedown", "touchstart", "pointerdown"]);
export {
  Ht as DataTable
};
//# sourceMappingURL=index75.js.map
