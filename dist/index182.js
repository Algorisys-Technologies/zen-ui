import { jsx as s, jsxs as c } from "react/jsx-runtime";
import { Input as f } from "./index4.js";
import { NumberField as m } from "./index11.js";
import { Select as g, SelectTrigger as h, SelectValue as p, SelectContent as x, SelectItem as d } from "./index36.js";
import { cn as z } from "./index145.js";
const u = (e) => {
  const l = e.columnDef.header;
  return typeof l == "string" ? l : e.id;
}, b = (e) => e == null || typeof e == "string" && e.length === 0, F = (e, l, t) => {
  const n = t, a = typeof n == "object" && n ? n.op : "contains", r = String(typeof n == "object" && n ? n.value : n ?? "").toLowerCase().trim();
  if (!r) return !0;
  const i = String(e.getValue(l) ?? "").toLowerCase();
  switch (a) {
    case "equals":
      return i === r;
    case "starts":
      return i.startsWith(r);
    case "ends":
      return i.endsWith(r);
    default:
      return i.includes(r);
  }
}, N = (e, l, t) => {
  const n = t;
  if (!n || b(n.value)) return !0;
  const a = Number(e.getValue(l));
  if (Number.isNaN(a)) return !1;
  const r = n.value;
  switch (n.op) {
    case "eq":
      return a === r;
    case "ne":
      return a !== r;
    case "gt":
      return a > r;
    case "lt":
      return a < r;
    case "gte":
      return a >= r;
    case "lte":
      return a <= r;
    default:
      return !0;
  }
}, V = (e, l, t) => {
  const [n, a] = t ?? [null, null];
  if (b(n) && b(a)) return !0;
  const r = Number(e.getValue(l));
  return !(Number.isNaN(r) || !b(n) && r < n || !b(a) && r > a);
}, y = (e, l, t) => t == null || t === "" ? !0 : String(e.getValue(l)) === String(t), C = (e, l, t) => t == null || t === "any" ? !0 : !!e.getValue(l) === (t === !0 || t === "true"), A = {
  text: F,
  number: N,
  numberRange: V,
  select: y,
  boolean: C
}, w = [
  { value: "contains", label: "Contains", symbol: "≈" },
  { value: "equals", label: "Equals", symbol: "=" },
  { value: "starts", label: "Starts with", symbol: "a…" },
  { value: "ends", label: "Ends with", symbol: "…a" }
], S = [
  { value: "eq", label: "Equals", symbol: "=" },
  { value: "ne", label: "Not equal", symbol: "≠" },
  { value: "gt", label: "Greater than", symbol: ">" },
  { value: "lt", label: "Less than", symbol: "<" },
  { value: "gte", label: "Greater or equal", symbol: "≥" },
  { value: "lte", label: "Less or equal", symbol: "≤" }
];
function v({
  value: e,
  onChange: l,
  options: t,
  ariaLabel: n
}) {
  const a = t.find((r) => r.value === e) ?? t[0];
  return /* @__PURE__ */ s(
    "select",
    {
      value: e,
      onChange: (r) => l(r.target.value),
      "aria-label": n,
      title: a.label,
      className: z(
        "zen-h-7 zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background",
        "zen-px-1 zen-text-xs zen-cursor-pointer",
        "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring"
      ),
      style: { minWidth: 36 },
      children: t.map((r) => /* @__PURE__ */ s("option", { value: r.value, children: r.symbol }, r.value))
    }
  );
}
function _({
  column: e,
  operators: l = !0
}) {
  const t = e.getFilterValue(), n = typeof t == "object" && t !== null, a = n ? t.op : "contains", r = n ? t.value ?? "" : t ?? "", i = (o) => l ? e.setFilterValue({ op: a, value: r, ...o }) : e.setFilterValue(o.value ?? r);
  return /* @__PURE__ */ c("div", { className: "zen-flex zen-items-center zen-gap-1", children: [
    l ? /* @__PURE__ */ s(
      v,
      {
        value: a,
        onChange: (o) => i({ op: o }),
        options: w,
        ariaLabel: `${u(e)} filter operator`
      }
    ) : null,
    /* @__PURE__ */ s(
      f,
      {
        value: r,
        onChange: (o) => i({ value: o.target.value }),
        placeholder: "Filter…",
        "aria-label": `Filter ${u(e)}`,
        className: "zen-h-7 zen-text-xs zen-flex-1 zen-min-w-0"
      }
    )
  ] });
}
function q({ column: e }) {
  const l = e.getFilterValue(), t = l?.op ?? "eq", n = l?.value ?? null;
  return /* @__PURE__ */ c("div", { className: "zen-flex zen-items-center zen-gap-1", children: [
    /* @__PURE__ */ s(
      v,
      {
        value: t,
        onChange: (a) => e.setFilterValue({ op: a, value: n }),
        options: S,
        ariaLabel: `${u(e)} filter operator`
      }
    ),
    /* @__PURE__ */ s(
      m,
      {
        value: n ?? void 0,
        onValueChange: (a) => e.setFilterValue({
          op: t,
          value: a ?? null
        }),
        placeholder: "…",
        "aria-label": `Filter ${u(e)}`,
        className: "zen-h-7 zen-text-xs zen-flex-1 zen-min-w-0"
      }
    )
  ] });
}
function $({ column: e }) {
  const [l, t] = e.getFilterValue() ?? [
    null,
    null
  ];
  return /* @__PURE__ */ c("div", { className: "zen-flex zen-items-center zen-gap-1", children: [
    /* @__PURE__ */ s(
      m,
      {
        value: l ?? void 0,
        onValueChange: (n) => e.setFilterValue([n ?? null, t]),
        placeholder: "min",
        "aria-label": `${u(e)} minimum`,
        className: "zen-h-7 zen-text-xs zen-min-w-0 zen-flex-1"
      }
    ),
    /* @__PURE__ */ s("span", { className: "zen-text-zen-muted-fg zen-text-xs", "aria-hidden": !0, children: "–" }),
    /* @__PURE__ */ s(
      m,
      {
        value: t ?? void 0,
        onValueChange: (n) => e.setFilterValue([l, n ?? null]),
        placeholder: "max",
        "aria-label": `${u(e)} maximum`,
        className: "zen-h-7 zen-text-xs zen-min-w-0 zen-flex-1"
      }
    )
  ] });
}
function L({
  column: e,
  options: l
}) {
  const t = e.getFilterValue() ?? "";
  return /* @__PURE__ */ c(
    g,
    {
      value: t || "__all__",
      onValueChange: (n) => e.setFilterValue(n === "__all__" ? void 0 : n),
      children: [
        /* @__PURE__ */ s(
          h,
          {
            "aria-label": `Filter ${u(e)}`,
            className: "zen-h-7 zen-text-xs",
            children: /* @__PURE__ */ s(p, { placeholder: "All" })
          }
        ),
        /* @__PURE__ */ c(x, { children: [
          /* @__PURE__ */ s(d, { value: "__all__", children: "All" }),
          l.map((n) => /* @__PURE__ */ s(d, { value: n.value, children: n.label }, n.value))
        ] })
      ]
    }
  );
}
function j({ column: e }) {
  const l = e.getFilterValue();
  return /* @__PURE__ */ c(
    "select",
    {
      value: l === !0 || l === "true" ? "true" : l === !1 || l === "false" ? "false" : "any",
      onChange: (n) => {
        const a = n.target.value;
        e.setFilterValue(a === "any" ? void 0 : a === "true");
      },
      "aria-label": `Filter ${u(e)}`,
      className: z(
        "zen-h-7 zen-w-full zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background",
        "zen-px-2 zen-text-xs zen-cursor-pointer",
        "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring"
      ),
      children: [
        /* @__PURE__ */ s("option", { value: "any", children: "Any" }),
        /* @__PURE__ */ s("option", { value: "true", children: "Yes" }),
        /* @__PURE__ */ s("option", { value: "false", children: "No" })
      ]
    }
  );
}
function W({
  column: e,
  operators: l = !0
}) {
  if (!e.getCanFilter()) return null;
  const t = e.columnDef.meta, n = e;
  switch (t?.filterVariant) {
    case "number":
      return /* @__PURE__ */ s(q, { column: n });
    case "numberRange":
      return /* @__PURE__ */ s($, { column: n });
    case "select":
      return /* @__PURE__ */ s(L, { column: n, options: t.filterOptions ?? [] });
    case "boolean":
      return /* @__PURE__ */ s(j, { column: n });
    default:
      return /* @__PURE__ */ s(_, { column: n, operators: l });
  }
}
export {
  W as FilterCell,
  A as filterFnByVariant
};
//# sourceMappingURL=index182.js.map
