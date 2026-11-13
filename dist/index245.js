import { jsx as u, jsxs as c } from "react/jsx-runtime";
import { columnLabel as p } from "./index247.js";
import { Input as h } from "./index4.js";
import { NumberField as m } from "./index11.js";
import { Select as x, SelectTrigger as F, SelectValue as T, SelectContent as V, SelectItem as z } from "./index39.js";
import { useLocale as b } from "./index90.js";
import { cn as v } from "./index197.js";
const s = (e) => p(e), d = (e) => e == null || typeof e == "string" && e.length === 0, y = (e, n, t) => {
  const l = t, a = typeof l == "object" && l ? l.op : "contains", r = String(typeof l == "object" && l ? l.value : l ?? "").toLowerCase().trim();
  if (!r) return !0;
  const o = String(e.getValue(n) ?? "").toLowerCase();
  switch (a) {
    case "equals":
      return o === r;
    case "starts":
      return o.startsWith(r);
    case "ends":
      return o.endsWith(r);
    default:
      return o.includes(r);
  }
}, N = (e, n, t) => {
  const l = t;
  if (!l || d(l.value)) return !0;
  const a = Number(e.getValue(n));
  if (Number.isNaN(a)) return !1;
  const r = l.value;
  switch (l.op) {
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
}, C = (e, n, t) => {
  const [l, a] = t ?? [null, null];
  if (d(l) && d(a)) return !0;
  const r = Number(e.getValue(n));
  return !(Number.isNaN(r) || !d(l) && r < l || !d(a) && r > a);
}, O = (e, n, t) => t == null || t === "" ? !0 : String(e.getValue(n)) === String(t), _ = (e, n, t) => t == null || t === "any" ? !0 : !!e.getValue(n) === (t === !0 || t === "true"), U = {
  text: y,
  number: N,
  numberRange: C,
  select: O,
  boolean: _
}, S = [
  { value: "contains", label: "dataTable.textOp.contains", symbol: "≈" },
  { value: "equals", label: "dataTable.textOp.equals", symbol: "=" },
  { value: "starts", label: "dataTable.textOp.starts", symbol: "a…" },
  { value: "ends", label: "dataTable.textOp.ends", symbol: "…a" }
], w = [
  { value: "eq", label: "dataTable.numberOp.eq", symbol: "=" },
  { value: "ne", label: "dataTable.numberOp.ne", symbol: "≠" },
  { value: "gt", label: "dataTable.numberOp.gt", symbol: ">" },
  { value: "lt", label: "dataTable.numberOp.lt", symbol: "<" },
  { value: "gte", label: "dataTable.numberOp.gte", symbol: "≥" },
  { value: "lte", label: "dataTable.numberOp.lte", symbol: "≤" }
];
function g({
  value: e,
  onChange: n,
  options: t,
  ariaLabel: l
}) {
  const a = b(), r = t.find((o) => o.value === e) ?? t[0];
  return /* @__PURE__ */ u(
    "select",
    {
      value: e,
      onChange: (o) => n(o.target.value),
      "aria-label": l,
      title: a.t(r.label),
      className: v(
        "zen-h-7 zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background",
        "zen-px-1 zen-text-xs zen-cursor-pointer",
        "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring"
      ),
      style: { minWidth: 36 },
      children: t.map((o) => /* @__PURE__ */ u("option", { value: o.value, children: o.symbol }, o.value))
    }
  );
}
function q({
  column: e,
  operators: n = !0
}) {
  const t = b(), l = e.getFilterValue(), a = typeof l == "object" && l !== null, r = a ? l.op : "contains", o = a ? l.value ?? "" : l ?? "", f = (i) => n ? e.setFilterValue({ op: r, value: o, ...i }) : e.setFilterValue(i.value ?? o);
  return /* @__PURE__ */ c("div", { className: "zen-flex zen-items-center zen-gap-1", children: [
    n ? /* @__PURE__ */ u(
      g,
      {
        value: r,
        onChange: (i) => f({ op: i }),
        options: S,
        ariaLabel: t.t("dataTable.filterOperator", { column: s(e) })
      }
    ) : null,
    /* @__PURE__ */ u(
      h,
      {
        value: o,
        onChange: (i) => f({ value: i.target.value }),
        placeholder: t.t("dataTable.filterPlaceholder"),
        "aria-label": t.t("dataTable.filterColumn", { column: s(e) }),
        className: "zen-h-7 zen-text-xs zen-flex-1 zen-min-w-0"
      }
    )
  ] });
}
function L({ column: e }) {
  const n = b(), t = e.getFilterValue(), l = t?.op ?? "eq", a = t?.value ?? null;
  return /* @__PURE__ */ c("div", { className: "zen-flex zen-items-center zen-gap-1", children: [
    /* @__PURE__ */ u(
      g,
      {
        value: l,
        onChange: (r) => e.setFilterValue({ op: r, value: a }),
        options: w,
        ariaLabel: n.t("dataTable.filterOperator", { column: s(e) })
      }
    ),
    /* @__PURE__ */ u(
      m,
      {
        value: a ?? void 0,
        onValueChange: (r) => e.setFilterValue({
          op: l,
          value: r ?? null
        }),
        placeholder: "…",
        "aria-label": n.t("dataTable.filterColumn", { column: s(e) }),
        className: "zen-h-7 zen-text-xs zen-flex-1 zen-min-w-0"
      }
    )
  ] });
}
function j({ column: e }) {
  const n = b(), [t, l] = e.getFilterValue() ?? [
    null,
    null
  ];
  return /* @__PURE__ */ c("div", { className: "zen-flex zen-items-center zen-gap-1", children: [
    /* @__PURE__ */ u(
      m,
      {
        value: t ?? void 0,
        onValueChange: (a) => e.setFilterValue([a ?? null, l]),
        placeholder: n.t("dataTable.min"),
        "aria-label": n.t("dataTable.columnMinimum", { column: s(e) }),
        className: "zen-h-7 zen-text-xs zen-min-w-0 zen-flex-1"
      }
    ),
    /* @__PURE__ */ u("span", { className: "zen-text-zen-muted-fg zen-text-xs", "aria-hidden": !0, children: "–" }),
    /* @__PURE__ */ u(
      m,
      {
        value: l ?? void 0,
        onValueChange: (a) => e.setFilterValue([t, a ?? null]),
        placeholder: n.t("dataTable.max"),
        "aria-label": n.t("dataTable.columnMaximum", { column: s(e) }),
        className: "zen-h-7 zen-text-xs zen-min-w-0 zen-flex-1"
      }
    )
  ] });
}
function R({
  column: e,
  options: n
}) {
  const t = b(), l = e.getFilterValue() ?? "";
  return /* @__PURE__ */ c(
    x,
    {
      value: l || "__all__",
      onValueChange: (a) => e.setFilterValue(a === "__all__" ? void 0 : a),
      children: [
        /* @__PURE__ */ u(
          F,
          {
            "aria-label": t.t("dataTable.filterColumn", { column: s(e) }),
            className: "zen-h-7 zen-text-xs",
            children: /* @__PURE__ */ u(T, { placeholder: t.t("dataTable.all") })
          }
        ),
        /* @__PURE__ */ c(V, { children: [
          /* @__PURE__ */ u(z, { value: "__all__", children: t.t("dataTable.all") }),
          n.map((a) => /* @__PURE__ */ u(z, { value: a.value, children: a.label }, a.value))
        ] })
      ]
    }
  );
}
function B({ column: e }) {
  const n = b(), t = e.getFilterValue();
  return /* @__PURE__ */ c(
    "select",
    {
      value: t === !0 || t === "true" ? "true" : t === !1 || t === "false" ? "false" : "any",
      onChange: (a) => {
        const r = a.target.value;
        e.setFilterValue(r === "any" ? void 0 : r === "true");
      },
      "aria-label": n.t("dataTable.filterColumn", { column: s(e) }),
      className: v(
        "zen-h-7 zen-w-full zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background",
        "zen-px-2 zen-text-xs zen-cursor-pointer",
        "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring"
      ),
      children: [
        /* @__PURE__ */ u("option", { value: "any", children: n.t("dataTable.any") }),
        /* @__PURE__ */ u("option", { value: "true", children: n.t("dataTable.yes") }),
        /* @__PURE__ */ u("option", { value: "false", children: n.t("dataTable.no") })
      ]
    }
  );
}
function X({
  column: e,
  operators: n = !0
}) {
  if (!e.getCanFilter()) return null;
  const t = e.columnDef.meta, l = e;
  switch (t?.filterVariant) {
    case "number":
      return /* @__PURE__ */ u(L, { column: l });
    case "numberRange":
      return /* @__PURE__ */ u(j, { column: l });
    case "select":
      return /* @__PURE__ */ u(R, { column: l, options: t.filterOptions ?? [] });
    case "boolean":
      return /* @__PURE__ */ u(B, { column: l });
    default:
      return /* @__PURE__ */ u(q, { column: l, operators: n });
  }
}
export {
  X as FilterCell,
  U as filterFnByVariant,
  y as textFilterFn
};
//# sourceMappingURL=index245.js.map
