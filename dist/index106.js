import { jsx as d, jsxs as v } from "react/jsx-runtime";
import * as u from "react";
import { Badge as H } from "./index64.js";
import { DataTable as J } from "./index105.js";
import { Search as Q } from "./index9.js";
import { useLocale as X } from "./index90.js";
import { cn as y } from "./index160.js";
const $ = 350, Y = {
  sort: "sort",
  filters: "filters",
  search: "search",
  page: "page"
};
function Z(r) {
  if (!r) return [];
  const a = [];
  for (const t of r.split(",")) {
    const [i, o] = t.split(":");
    i && (o === "asc" || o === "desc") && a.push({ id: i, desc: o === "desc" });
  }
  return a;
}
function ee(r) {
  return r.map((a) => `${a.id}:${a.desc ? "desc" : "asc"}`).join(",");
}
const ne = /* @__PURE__ */ new Set([
  "contains",
  "equals",
  "starts",
  "ends",
  "eq",
  "ne",
  "gt",
  "lt",
  "gte",
  "lte"
]);
function E(r) {
  if (!r) return [];
  const a = [];
  for (const t of r.split(",")) {
    const i = t.indexOf(":");
    if (i <= 0) continue;
    const o = t.slice(0, i), c = t.slice(i + 1);
    if (!o || !c) continue;
    const m = c.indexOf(":");
    if (m > 0 && ne.has(c.slice(0, m))) {
      a.push({ id: o, value: { op: c.slice(0, m), value: c.slice(m + 1) } });
      continue;
    }
    a.push({ id: o, value: c });
  }
  return a;
}
function te(r) {
  const a = [];
  for (const t of r) {
    const i = t.value;
    if (i != null) {
      if (typeof i == "object") {
        const { op: o, value: c } = i;
        if (c == null || String(c).trim() === "") continue;
        a.push(o ? `${t.id}:${o}:${c}` : `${t.id}:${c}`);
        continue;
      }
      String(i).trim() !== "" && a.push(`${t.id}:${i}`);
    }
  }
  return a.join(",");
}
function C(r, a, t) {
  t ? r.set(a, t) : r.delete(a);
}
function ce({
  columns: r,
  rows: a,
  params: t,
  onParamsChange: i,
  search: o = !1,
  searchPlaceholder: c,
  filters: m,
  actions: N,
  actionsLabel: M,
  page: O = 1,
  pageCount: j = 1,
  pageSize: L,
  totalCount: D,
  emptyMessage: _,
  loading: U,
  paramNames: A,
  className: R
}) {
  const h = X(), T = c ?? h.t("dataTable.search"), k = M ?? h.t("dataTable.actions"), l = { ...Y, ...A }, q = u.useMemo(
    () => Z(t.get(l.sort)),
    [t, l.sort]
  ), p = t.get(l.filters) ?? "", z = t.get(l.search) ?? "", [S, P] = u.useState(z), [x, F] = u.useState(
    () => E(p)
  );
  u.useEffect(() => P(z), [z]), u.useEffect(() => F(E(p)), [p]);
  const g = u.useCallback(
    (n, e) => {
      const s = new URLSearchParams(t);
      n(s), e?.keepPage || s.delete(l.page), i(s);
    },
    [t, i, l.page]
  ), B = u.useCallback(
    (n) => g((e) => C(e, l.sort, ee(n))),
    [g, l.sort]
  );
  u.useEffect(() => {
    if (S.trim() === z) return;
    const n = setTimeout(
      () => g((e) => C(e, l.search, S.trim())),
      $
    );
    return () => clearTimeout(n);
  }, [S, z, g, l.search]), u.useEffect(() => {
    const n = te(x);
    if (n === p) return;
    const e = setTimeout(
      () => g((s) => C(s, l.filters, n)),
      $
    );
    return () => clearTimeout(e);
  }, [x, p, g, l.filters]);
  const K = u.useCallback(
    (n) => g((e) => C(e, l.page, String(n + 1)), {
      keepPage: !0
    }),
    [g, l.page]
  ), V = u.useCallback((n, e) => {
    F((s) => {
      const b = s.filter((f) => f.id !== n);
      return e ? [...b, { id: n, value: e }] : b;
    });
  }, []), I = u.useMemo(() => {
    const n = r.map((e) => ({
      id: e.key,
      accessorKey: e.key,
      header: e.label,
      size: e.width,
      enableSorting: !!e.sort,
      enableColumnFilter: !!e.search,
      cell: (s) => {
        const b = s.row.original;
        if (e.render) return e.render(b);
        const f = b[e.key];
        if (u.isValidElement(f)) return f;
        if (typeof f == "boolean")
          return f ? /* @__PURE__ */ d("span", { className: "zen-font-medium zen-text-zen-success", children: h.t("dataTable.yes") }) : /* @__PURE__ */ d("span", { className: "zen-text-zen-muted-fg", children: h.t("dataTable.no") });
        if (f == null || f === "")
          return /* @__PURE__ */ d("span", { className: "zen-text-zen-muted-fg", children: "—" });
        if (e.isDate) {
          const w = new Date(f);
          return Number.isNaN(w.getTime()) ? String(f) : w.toDateString();
        }
        return e.highlight ? /* @__PURE__ */ d(H, { variant: "soft", children: String(f) }) : String(f);
      }
    }));
    return N && n.push({
      id: "__actions",
      header: () => /* @__PURE__ */ d("div", { className: "zen-text-center", children: k }),
      enableSorting: !1,
      enableColumnFilter: !1,
      cell: (e) => /* @__PURE__ */ d("div", { className: "zen-whitespace-nowrap zen-text-center", children: N(e.row.original) })
    }), n;
  }, [r, N, k, h]), W = r.some((n) => n.search), G = r.some((n) => n.sort);
  return /* @__PURE__ */ v("div", { className: y("zen-flex zen-flex-col zen-gap-3", R), children: [
    (o || m && m.length > 0) && /* @__PURE__ */ v("div", { className: "zen-flex zen-flex-wrap zen-items-center zen-gap-2 zen-p-px", children: [
      m?.map((n) => {
        const e = x.find((s) => s.id === n.key)?.value ?? "";
        return /* @__PURE__ */ v("label", { className: "zen-flex zen-items-center zen-gap-1.5", children: [
          /* @__PURE__ */ d("span", { className: "zen-sr-only", children: n.label }),
          /* @__PURE__ */ v(
            "select",
            {
              className: y(
                "zen-h-9 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background",
                "zen-px-2 zen-text-sm zen-text-zen-foreground",
                "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
              ),
              value: String(e),
              onChange: (s) => V(n.key, s.target.value),
              children: [
                /* @__PURE__ */ d("option", { value: "", children: n.label }),
                n.values.map((s) => /* @__PURE__ */ d("option", { value: s.value, children: s.label }, s.value))
              ]
            }
          )
        ] }, n.key);
      }),
      o && /* @__PURE__ */ d(
        Q,
        {
          value: S,
          onValueChange: P,
          onClear: () => P(""),
          placeholder: T,
          "aria-label": T,
          className: "zen-w-64"
        }
      )
    ] }),
    /* @__PURE__ */ d(
      J,
      {
        data: a,
        columns: I,
        manualSorting: !0,
        manualFiltering: !0,
        manualPagination: {
          pageIndex: Math.max(0, O - 1),
          pageCount: Math.max(1, j),
          pageSize: L,
          onPageChange: K
        },
        enableSorting: G,
        enableMultiSort: !1,
        enablePagination: !0,
        enableColumnFilters: !1,
        enablePerColumnFilters: W,
        enableFilterOperators: !1,
        sorting: q,
        onSortingChange: B,
        columnFilters: x,
        onColumnFiltersChange: F,
        emptyMessage: _,
        loading: U
      }
    ),
    typeof D == "number" && /* @__PURE__ */ d("p", { className: "zen-m-0 zen-text-xs zen-text-zen-muted-fg", children: h.t("urlDataTable.showing", { shown: a.length, total: D }) })
  ] });
}
export {
  ce as UrlDataTable,
  E as parseFilterParam,
  Z as parseSortParam,
  te as serializeFilterParam,
  ee as serializeSortParam
};
//# sourceMappingURL=index106.js.map
