import { createComponent as a, template as v, insert as i, effect as m, setAttribute as b, className as f } from "solid-js/web";
import { Show as F, For as x } from "solid-js";
import { Input as y } from "./index61.js";
import { NumberField as g } from "./index65.js";
import { Select as V } from "./index58.js";
import { cn as z } from "./index103.js";
var _ = /* @__PURE__ */ v("<select style=min-width:36px>"), w = /* @__PURE__ */ v("<option>"), d = /* @__PURE__ */ v('<div class="zen-flex zen-items-center zen-gap-1">'), N = /* @__PURE__ */ v('<div class="zen-flex zen-items-center zen-gap-1"><span class="zen-text-zen-muted-fg zen-text-xs"aria-hidden>–'), $ = /* @__PURE__ */ v("<select><option value=any>Any</option><option value=true>Yes</option><option value=false>No");
const c = (e) => e == null || typeof e == "string" && e.length === 0, C = (e, t, n) => {
  const l = n, r = typeof l == "object" && l ? l.op : "contains", u = String(typeof l == "object" && l ? l.value : l ?? "").toLowerCase().trim();
  if (!u) return !0;
  const o = String(e.getValue(t) ?? "").toLowerCase();
  switch (r) {
    case "equals":
      return o === u;
    case "starts":
      return o.startsWith(u);
    case "ends":
      return o.endsWith(u);
    default:
      return o.includes(u);
  }
}, p = (e, t, n) => {
  const l = n;
  if (!l || c(l.value)) return !0;
  const r = Number(e.getValue(t));
  if (Number.isNaN(r)) return !1;
  const u = l.value;
  switch (l.op) {
    case "eq":
      return r === u;
    case "ne":
      return r !== u;
    case "gt":
      return r > u;
    case "lt":
      return r < u;
    case "gte":
      return r >= u;
    case "lte":
      return r <= u;
    default:
      return !0;
  }
}, S = (e, t, n) => {
  const [l, r] = n ?? [null, null];
  if (c(l) && c(r)) return !0;
  const u = Number(e.getValue(t));
  return !(Number.isNaN(u) || !c(l) && u < l || !c(r) && u > r);
}, q = (e, t, n) => n == null || n === "" ? !0 : String(e.getValue(t)) === String(n), L = (e, t, n) => n == null || n === "any" ? !0 : !!e.getValue(t) === (n === !0 || n === "true"), M = {
  text: C,
  number: p,
  numberRange: S,
  select: q,
  boolean: L
}, E = [{
  value: "contains",
  label: "Contains",
  symbol: "≈"
}, {
  value: "equals",
  label: "Equals",
  symbol: "="
}, {
  value: "starts",
  label: "Starts with",
  symbol: "a…"
}, {
  value: "ends",
  label: "Ends with",
  symbol: "…a"
}], T = [{
  value: "eq",
  label: "Equals",
  symbol: "="
}, {
  value: "ne",
  label: "Not equal",
  symbol: "≠"
}, {
  value: "gt",
  label: "Greater than",
  symbol: ">"
}, {
  value: "lt",
  label: "Less than",
  symbol: "<"
}, {
  value: "gte",
  label: "Greater or equal",
  symbol: "≥"
}, {
  value: "lte",
  label: "Less or equal",
  symbol: "≤"
}], s = (e) => {
  const t = e.columnDef.header;
  return typeof t == "string" ? t : e.id;
};
function h(e) {
  return (() => {
    var t = _();
    return t.addEventListener("change", (n) => e.onChange(n.currentTarget.value)), i(t, a(x, {
      get each() {
        return e.options;
      },
      children: (n) => (() => {
        var l = w();
        return i(l, () => n.symbol), m(() => l.value = n.value), l;
      })()
    })), m((n) => {
      var l = e.ariaLabel, r = z("zen-h-7 zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background", "zen-px-1 zen-text-xs zen-cursor-pointer", "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring");
      return l !== n.e && b(t, "aria-label", n.e = l), r !== n.t && f(t, n.t = r), n;
    }, {
      e: void 0,
      t: void 0
    }), m(() => t.value = e.value), t;
  })();
}
function R(e) {
  const t = () => e.column.getFilterValue(), n = () => t()?.op ?? "contains", l = () => t()?.value ?? "", r = (u) => e.column.setFilterValue({
    op: n(),
    value: l(),
    ...u
  });
  return (() => {
    var u = d();
    return i(u, a(h, {
      get value() {
        return n();
      },
      onChange: (o) => r({
        op: o
      }),
      options: E,
      get ariaLabel() {
        return `${s(e.column)} filter operator`;
      }
    }), null), i(u, a(y, {
      get value() {
        return l();
      },
      onInput: (o) => r({
        value: o.currentTarget.value
      }),
      placeholder: "Filter…",
      get "aria-label"() {
        return `Filter ${s(e.column)}`;
      },
      class: "zen-h-7 zen-text-xs zen-flex-1 zen-min-w-0"
    }), null), u;
  })();
}
function B(e) {
  const t = () => e.column.getFilterValue(), n = () => t()?.op ?? "eq", l = () => t()?.value ?? null;
  return (() => {
    var r = d();
    return i(r, a(h, {
      get value() {
        return n();
      },
      onChange: (u) => e.column.setFilterValue({
        op: u,
        value: l()
      }),
      options: T,
      get ariaLabel() {
        return `${s(e.column)} filter operator`;
      }
    }), null), i(r, a(g, {
      get value() {
        return l() ?? void 0;
      },
      onValueChange: (u) => e.column.setFilterValue({
        op: n(),
        value: u ?? null
      }),
      placeholder: "…",
      get "aria-label"() {
        return `Filter ${s(e.column)}`;
      },
      class: "zen-h-7 zen-text-xs zen-flex-1 zen-min-w-0"
    }), null), r;
  })();
}
function O(e) {
  const t = () => e.column.getFilterValue() ?? [null, null];
  return (() => {
    var n = N(), l = n.firstChild;
    return i(n, a(g, {
      get value() {
        return t()[0] ?? void 0;
      },
      onValueChange: (r) => e.column.setFilterValue([r ?? null, t()[1]]),
      placeholder: "min",
      get "aria-label"() {
        return `${s(e.column)} minimum`;
      },
      class: "zen-h-7 zen-text-xs zen-min-w-0 zen-flex-1"
    }), l), i(n, a(g, {
      get value() {
        return t()[1] ?? void 0;
      },
      onValueChange: (r) => e.column.setFilterValue([t()[0], r ?? null]),
      placeholder: "max",
      get "aria-label"() {
        return `${s(e.column)} maximum`;
      },
      class: "zen-h-7 zen-text-xs zen-min-w-0 zen-flex-1"
    }), null), n;
  })();
}
function A(e) {
  const t = () => e.column.getFilterValue() ?? "";
  return a(V, {
    get options() {
      return [{
        value: "__all__",
        label: "All"
      }, ...e.options];
    },
    get value() {
      return t() || "__all__";
    },
    onChange: (n) => e.column.setFilterValue(n === "__all__" ? void 0 : n)
  });
}
function j(e) {
  const t = () => e.column.getFilterValue(), n = () => t() === !0 || t() === "true" ? "true" : t() === !1 || t() === "false" ? "false" : "any";
  return (() => {
    var l = $();
    return l.addEventListener("change", (r) => {
      const u = r.currentTarget.value;
      e.column.setFilterValue(u === "any" ? void 0 : u === "true");
    }), m((r) => {
      var u = `Filter ${s(e.column)}`, o = z("zen-h-7 zen-w-full zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background", "zen-px-2 zen-text-xs zen-cursor-pointer", "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring");
      return u !== r.e && b(l, "aria-label", r.e = u), o !== r.t && f(l, r.t = o), r;
    }, {
      e: void 0,
      t: void 0
    }), m(() => l.value = n()), l;
  })();
}
function U(e) {
  return a(F, {
    get when() {
      return e.column.getCanFilter();
    },
    get children() {
      return (() => {
        const t = e.column.columnDef.meta, n = e.column;
        switch (t?.filterVariant) {
          case "number":
            return a(B, {
              column: n
            });
          case "numberRange":
            return a(O, {
              column: n
            });
          case "select":
            return a(A, {
              column: n,
              get options() {
                return t.filterOptions ?? [];
              }
            });
          case "boolean":
            return a(j, {
              column: n
            });
          default:
            return a(R, {
              column: n
            });
        }
      })();
    }
  });
}
export {
  U as FilterCell,
  M as filterFnByVariant
};
//# sourceMappingURL=index138.js.map
