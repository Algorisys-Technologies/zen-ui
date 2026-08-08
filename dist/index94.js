import { jsx as d, jsxs as b } from "react/jsx-runtime";
import * as u from "react";
import { Badge as L } from "./index57.js";
import { DataTable as W } from "./index93.js";
import { Search as Y } from "./index8.js";
import { cn as w } from "./index143.js";
const y = 350, G = {
  sort: "sort",
  filters: "filters",
  search: "search",
  page: "page"
};
function H(s) {
  if (!s) return [];
  const r = [];
  for (const t of s.split(",")) {
    const [i, c] = t.split(":");
    i && (c === "asc" || c === "desc") && r.push({ id: i, desc: c === "desc" });
  }
  return r;
}
function J(s) {
  return s.map((r) => `${r.id}:${r.desc ? "desc" : "asc"}`).join(",");
}
const Q = /* @__PURE__ */ new Set([
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
function $(s) {
  if (!s) return [];
  const r = [];
  for (const t of s.split(",")) {
    const i = t.indexOf(":");
    if (i <= 0) continue;
    const c = t.slice(0, i), l = t.slice(i + 1);
    if (!c || !l) continue;
    const m = l.indexOf(":");
    if (m > 0 && Q.has(l.slice(0, m))) {
      r.push({ id: c, value: { op: l.slice(0, m), value: l.slice(m + 1) } });
      continue;
    }
    r.push({ id: c, value: l });
  }
  return r;
}
function X(s) {
  const r = [];
  for (const t of s) {
    const i = t.value;
    if (i != null) {
      if (typeof i == "object") {
        const { op: c, value: l } = i;
        if (l == null || String(l).trim() === "") continue;
        r.push(c ? `${t.id}:${c}:${l}` : `${t.id}:${l}`);
        continue;
      }
      String(i).trim() !== "" && r.push(`${t.id}:${i}`);
    }
  }
  return r.join(",");
}
function v(s, r, t) {
  t ? s.set(r, t) : s.delete(r);
}
function se({
  columns: s,
  rows: r,
  params: t,
  onParamsChange: i,
  search: c = !1,
  searchPlaceholder: l = "Search…",
  filters: m,
  actions: C,
  actionsLabel: D = "Actions",
  page: E = 1,
  pageCount: T = 1,
  pageSize: M,
  totalCount: P,
  emptyMessage: O,
  loading: j,
  paramNames: _,
  className: A
}) {
  const o = { ...G, ..._ }, U = u.useMemo(
    () => H(t.get(o.sort)),
    [t, o.sort]
  ), h = t.get(o.filters) ?? "", p = t.get(o.search) ?? "", [S, N] = u.useState(p), [x, F] = u.useState(
    () => $(h)
  );
  u.useEffect(() => N(p), [p]), u.useEffect(() => F($(h)), [h]);
  const g = u.useCallback(
    (n, e) => {
      const a = new URLSearchParams(t);
      n(a), e?.keepPage || a.delete(o.page), i(a);
    },
    [t, i, o.page]
  ), R = u.useCallback(
    (n) => g((e) => v(e, o.sort, J(n))),
    [g, o.sort]
  );
  u.useEffect(() => {
    if (S.trim() === p) return;
    const n = setTimeout(
      () => g((e) => v(e, o.search, S.trim())),
      y
    );
    return () => clearTimeout(n);
  }, [S, p, g, o.search]), u.useEffect(() => {
    const n = X(x);
    if (n === h) return;
    const e = setTimeout(
      () => g((a) => v(a, o.filters, n)),
      y
    );
    return () => clearTimeout(e);
  }, [x, h, g, o.filters]);
  const q = u.useCallback(
    (n) => g((e) => v(e, o.page, String(n + 1)), {
      keepPage: !0
    }),
    [g, o.page]
  ), B = u.useCallback((n, e) => {
    F((a) => {
      const z = a.filter((f) => f.id !== n);
      return e ? [...z, { id: n, value: e }] : z;
    });
  }, []), K = u.useMemo(() => {
    const n = s.map((e) => ({
      id: e.key,
      accessorKey: e.key,
      header: e.label,
      size: e.width,
      enableSorting: !!e.sort,
      enableColumnFilter: !!e.search,
      cell: (a) => {
        const z = a.row.original;
        if (e.render) return e.render(z);
        const f = z[e.key];
        if (u.isValidElement(f)) return f;
        if (typeof f == "boolean")
          return f ? /* @__PURE__ */ d("span", { className: "zen-font-medium zen-text-zen-success", children: "Yes" }) : /* @__PURE__ */ d("span", { className: "zen-text-zen-muted-fg", children: "No" });
        if (f == null || f === "")
          return /* @__PURE__ */ d("span", { className: "zen-text-zen-muted-fg", children: "—" });
        if (e.isDate) {
          const k = new Date(f);
          return Number.isNaN(k.getTime()) ? String(f) : k.toDateString();
        }
        return e.highlight ? /* @__PURE__ */ d(L, { variant: "soft", children: String(f) }) : String(f);
      }
    }));
    return C && n.push({
      id: "__actions",
      header: () => /* @__PURE__ */ d("div", { className: "zen-text-center", children: D }),
      enableSorting: !1,
      enableColumnFilter: !1,
      cell: (e) => /* @__PURE__ */ d("div", { className: "zen-whitespace-nowrap zen-text-center", children: C(e.row.original) })
    }), n;
  }, [s, C, D]), V = s.some((n) => n.search), I = s.some((n) => n.sort);
  return /* @__PURE__ */ b("div", { className: w("zen-flex zen-flex-col zen-gap-3", A), children: [
    (c || m && m.length > 0) && /* @__PURE__ */ b("div", { className: "zen-flex zen-flex-wrap zen-items-center zen-gap-2 zen-p-px", children: [
      m?.map((n) => {
        const e = x.find((a) => a.id === n.key)?.value ?? "";
        return /* @__PURE__ */ b("label", { className: "zen-flex zen-items-center zen-gap-1.5", children: [
          /* @__PURE__ */ d("span", { className: "zen-sr-only", children: n.label }),
          /* @__PURE__ */ b(
            "select",
            {
              className: w(
                "zen-h-9 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background",
                "zen-px-2 zen-text-sm zen-text-zen-foreground",
                "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
              ),
              value: String(e),
              onChange: (a) => B(n.key, a.target.value),
              children: [
                /* @__PURE__ */ d("option", { value: "", children: n.label }),
                n.values.map((a) => /* @__PURE__ */ d("option", { value: a.value, children: a.label }, a.value))
              ]
            }
          )
        ] }, n.key);
      }),
      c && /* @__PURE__ */ d(
        Y,
        {
          value: S,
          onValueChange: N,
          onClear: () => N(""),
          placeholder: l,
          "aria-label": l,
          className: "zen-w-64"
        }
      )
    ] }),
    /* @__PURE__ */ d(
      W,
      {
        data: r,
        columns: K,
        manualSorting: !0,
        manualFiltering: !0,
        manualPagination: {
          pageIndex: Math.max(0, E - 1),
          pageCount: Math.max(1, T),
          pageSize: M,
          onPageChange: q
        },
        enableSorting: I,
        enableMultiSort: !1,
        enablePagination: !0,
        enableColumnFilters: !1,
        enablePerColumnFilters: V,
        enableFilterOperators: !1,
        sorting: U,
        onSortingChange: R,
        columnFilters: x,
        onColumnFiltersChange: F,
        emptyMessage: O,
        loading: j
      }
    ),
    typeof P == "number" && /* @__PURE__ */ b("p", { className: "zen-m-0 zen-text-xs zen-text-zen-muted-fg", children: [
      "Showing ",
      r.length,
      " of ",
      P
    ] })
  ] });
}
export {
  se as UrlDataTable,
  $ as parseFilterParam,
  H as parseSortParam,
  X as serializeFilterParam,
  J as serializeSortParam
};
//# sourceMappingURL=index94.js.map
