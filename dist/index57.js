import { jsxs as g, jsx as t, Fragment as E } from "react/jsx-runtime";
import * as b from "react";
import { newGroup as G, operatorsFor as U, operatorLabel as K, describeFilter as Q, updateNode as D, newCondition as T, operatorArity as W, changeField as X, changeOperator as Z, removeNode as ee, addNode as V } from "./index221.js";
import { Button as I } from "./index71.js";
import { Input as ne } from "./index4.js";
import { NumberField as te } from "./index11.js";
import { Select as re, SelectTrigger as oe, SelectValue as le, SelectContent as ie, SelectItem as ae } from "./index39.js";
import { DateInput as se } from "./index14.js";
import { MultiCombobox as de } from "./index177.js";
import { Icon as k } from "./index63.js";
import { useLocale as ue } from "./index90.js";
import { cn as F } from "./index197.js";
const ce = ["all", "any", "none", "notAll"], me = (e) => e.join === "and" ? e.not ? "notAll" : "all" : e.not ? "none" : "any", fe = (e) => ({
  join: e === "all" || e === "notAll" ? "and" : "or",
  not: e === "none" || e === "notAll"
}), pe = (e) => {
  if (typeof e != "string") return null;
  const s = /^(\d{4})-(\d{2})-(\d{2})$/.exec(e);
  return s ? new Date(Number(s[1]), Number(s[2]) - 1, Number(s[3])) : null;
}, ze = (e) => {
  if (!e) return null;
  const s = (o) => String(o).padStart(2, "0");
  return `${e.getFullYear()}-${s(e.getMonth() + 1)}-${s(e.getDate())}`;
}, L = ({
  id: e,
  options: s,
  value: o,
  onChange: r,
  className: i,
  "aria-label": c
}) => /* @__PURE__ */ g(re, { value: o, onValueChange: (d) => d && d !== o && r(d), children: [
  /* @__PURE__ */ t(oe, { id: e, "aria-label": c, className: i, children: /* @__PURE__ */ t(le, {}) }),
  /* @__PURE__ */ t(ie, { children: s.map((d) => /* @__PURE__ */ t(ae, { value: d.value, children: d.label }, d.value)) })
] }), he = ({ c: e, parent: s, ctx: o }) => {
  const { loc: r } = o, i = o.numbers.get(e.id) ?? 0, c = o.fieldOf(e.field)?.type, d = W(e.op), h = o.fieldOf(e.field)?.options, N = (a) => {
    const m = e;
    Object.entries(a).every(([u, z]) => JSON.stringify(m[u]) === JSON.stringify(z)) || o.edit((u) => D(u, e.id, a));
  }, v = (a, m) => /* @__PURE__ */ t("label", { htmlFor: o.controlId(e.id, a), className: "zen-sr-only", children: m }), O = (a) => {
    const m = o.controlId(e.id, a), u = e[a];
    return c === "number" ? /* @__PURE__ */ t(
      te,
      {
        id: m,
        value: typeof u == "number" ? u : null,
        onValueChange: (z) => N({ [a]: z }),
        className: "zen-w-44"
      },
      `${a}-number`
    ) : c === "date" ? /* @__PURE__ */ t(se, { id: m, value: pe(u), onValueChange: (z) => N({ [a]: ze(z) }) }, `${a}-date`) : c === "text" ? /* @__PURE__ */ t(
      ne,
      {
        id: m,
        value: typeof u == "string" ? u : "",
        onChange: (z) => N({ [a]: z.currentTarget.value }),
        className: "zen-w-48"
      },
      `${a}-text`
    ) : null;
  };
  return /* @__PURE__ */ g("div", { className: "zen-flex zen-flex-wrap zen-items-center zen-gap-2", "data-filter-condition": e.id, children: [
    /* @__PURE__ */ t(
      L,
      {
        id: o.controlId(e.id, "field"),
        "aria-label": r.t("filterBuilder.field", { n: i }),
        options: o.fieldOptions,
        value: e.field,
        onChange: (a) => {
          const m = o.fieldOf(a);
          m && o.edit((u) => X(u, e.id, m, o.fields));
        },
        className: "zen-w-40"
      }
    ),
    /* @__PURE__ */ t(
      L,
      {
        id: o.controlId(e.id, "op"),
        "aria-label": r.t("filterBuilder.operator", { n: i }),
        options: c ? o.operatorOptions(c) : M,
        value: e.op,
        onChange: (a) => o.edit((m) => Z(m, e.id, a)),
        className: "zen-w-44"
      }
    ),
    d === "list" && /* @__PURE__ */ t("div", { className: "zen-min-w-48 zen-flex-1", children: /* @__PURE__ */ t(
      de,
      {
        "aria-label": r.t("filterBuilder.values", { n: i }),
        options: h ?? M,
        value: Array.isArray(e.value) ? e.value : ve,
        onValueChange: (a) => N({ value: a }),
        placeholder: r.t("filterBuilder.choose")
      }
    ) }),
    (d === 1 || d === 2) && /* @__PURE__ */ g(E, { children: [
      v("value", r.t(d === 2 ? "filterBuilder.from" : "filterBuilder.value", { n: i })),
      O("value")
    ] }),
    d === 2 && /* @__PURE__ */ g(E, { children: [
      /* @__PURE__ */ t("span", { className: "zen-text-sm zen-text-zen-muted-fg", "aria-hidden": "true", children: r.t("filterBuilder.and") }),
      v("valueTo", r.t("filterBuilder.to", { n: i })),
      O("valueTo")
    ] }),
    /* @__PURE__ */ t(
      I,
      {
        variant: "ghost",
        color: "neutral",
        shape: "square",
        size: "sm",
        "aria-label": r.t("filterBuilder.removeConditionN", { n: i }),
        title: r.t("filterBuilder.removeCondition"),
        onClick: () => o.remove(e.id, s),
        className: "zen-ms-auto zen-shrink-0",
        children: /* @__PURE__ */ t(k, { name: "x", size: 16 })
      }
    )
  ] });
}, R = ({ g: e, depth: s, parent: o, ctx: r }) => {
  const { loc: i } = r, c = s > 0, d = me(e);
  return /* @__PURE__ */ g(
    "div",
    {
      role: "group",
      "aria-label": c ? i.t("filterBuilder.groupLabel", { match: i.t(`filterBuilder.${d}`).toLowerCase() }) : r.ariaLabel ?? i.t("filterBuilder.label"),
      "data-filter-group": e.id,
      className: F(
        "zen-flex zen-flex-col zen-gap-2",
        c && "zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-muted/40 zen-p-3"
      ),
      children: [
        /* @__PURE__ */ g("div", { className: "zen-flex zen-flex-wrap zen-items-center zen-gap-2", children: [
          /* @__PURE__ */ t("label", { htmlFor: r.controlId(e.id, "match"), className: "zen-text-sm zen-text-zen-muted-fg", children: i.t("filterBuilder.match") }),
          /* @__PURE__ */ t(
            L,
            {
              id: r.controlId(e.id, "match"),
              options: r.matchOptions,
              value: d,
              onChange: (h) => r.edit((N) => D(N, e.id, fe(h))),
              className: "zen-w-36"
            }
          ),
          /* @__PURE__ */ t("span", { className: "zen-text-sm zen-text-zen-muted-fg", children: i.t("filterBuilder.theseConditions") }),
          c && o && /* @__PURE__ */ t(I, { variant: "ghost", color: "neutral", size: "sm", onClick: () => r.remove(e.id, o), className: "zen-ms-auto", children: i.t("filterBuilder.removeGroup") })
        ] }),
        /* @__PURE__ */ g("div", { className: F("zen-flex zen-flex-col zen-gap-2", c ? "" : "zen-ps-0"), children: [
          e.children.map(
            (h) => h.kind === "group" ? /* @__PURE__ */ t(R, { g: h, depth: s + 1, parent: e, ctx: r }, h.id) : /* @__PURE__ */ t(he, { c: h, parent: e, ctx: r }, h.id)
          ),
          e.children.length === 0 && /* @__PURE__ */ t("p", { className: "zen-m-0 zen-text-sm zen-text-zen-muted-fg", children: c ? i.t("filterBuilder.emptyGroup") : i.t("filterBuilder.emptyRoot") })
        ] }),
        /* @__PURE__ */ g("div", { className: "zen-flex zen-flex-wrap zen-gap-2", children: [
          /* @__PURE__ */ t(
            I,
            {
              id: r.controlId(e.id, "add"),
              variant: "outline",
              color: "neutral",
              size: "sm",
              iconLeft: /* @__PURE__ */ t(k, { name: "plus", size: 14 }),
              onClick: () => r.addCondition(e.id),
              children: i.t("filterBuilder.addCondition")
            }
          ),
          s + 1 < r.maxDepth && /* @__PURE__ */ t(
            I,
            {
              variant: "ghost",
              color: "neutral",
              size: "sm",
              iconLeft: /* @__PURE__ */ t(k, { name: "plus", size: 14 }),
              onClick: () => r.addGroup(e.id),
              children: i.t("filterBuilder.addGroup")
            }
          )
        ] })
      ]
    }
  );
}, M = [], ve = [], be = ["text", "number", "date", "enum", "boolean"], Fe = ({
  fields: e,
  value: s,
  defaultValue: o,
  onValueChange: r,
  maxDepth: i = 3,
  showSummary: c = !0,
  formatValue: d,
  "aria-label": h,
  className: N
}) => {
  const v = ue(), O = b.useId(), [a, m] = b.useState(() => o ?? G()), u = s ?? a, z = b.useRef(u);
  z.current = u;
  const y = (n) => {
    const l = n(z.current);
    z.current = l, s === void 0 && m(l), r?.(l);
  }, B = b.useRef(null);
  b.useEffect(() => {
    const n = B.current;
    n && (B.current = null, document.getElementById(n)?.focus());
  });
  const C = (n, l) => `${O}-${n}-${l}`, j = b.useMemo(() => {
    const n = /* @__PURE__ */ new Map();
    let l = 0;
    const p = (f) => {
      f.kind === "condition" ? n.set(f.id, ++l) : f.children.forEach(p);
    };
    return p(u), n;
  }, [u]), _ = b.useMemo(
    () => ce.map((n) => ({ value: n, label: v.t(`filterBuilder.${n}`) })),
    [v]
  ), J = b.useMemo(() => e.map((n) => ({ value: n.id, label: n.label })), [e]), S = b.useCallback(
    (n, l) => v.t(n, l),
    [v]
  ), P = b.useMemo(
    () => new Map(
      be.map((n) => [n, U(n).map((l) => ({ value: l, label: K(l, n, S) }))])
    ),
    [S]
  ), Y = (n) => P.get(n) ?? M, x = (n, l) => {
    if (n.kind === "group") {
      if (n.id === l) return n;
      for (const p of n.children) {
        const f = x(p, l);
        if (f) return f;
      }
    }
  }, q = {
    loc: v,
    fields: e,
    maxDepth: i,
    ariaLabel: h,
    numbers: j,
    controlId: C,
    fieldOf: (n) => e.find((l) => l.id === n),
    fieldOptions: J,
    matchOptions: _,
    operatorOptions: Y,
    edit: y,
    addCondition: (n) => {
      const l = e[0];
      if (!l) return;
      const p = T(l);
      y((f) => V(f, n, p)), B.current = C(p.id, "field");
    },
    addGroup: (n) => {
      const l = e[0];
      if (!l) return;
      const p = T(l);
      y((f) => V(f, n, G("and", [p]))), B.current = C(p.id, "field");
    },
    /** Remove a node; focus goes to the next row's first control, else the previous one's, else the group's "Condition" button. */
    remove: (n, l) => {
      const p = x(z.current, l.id) ?? l, f = p.children, A = f.findIndex(($) => $.id === n), w = f[A + 1] ?? f[A - 1];
      y(($) => ee($, n)), B.current = w ? C(w.id, w.kind === "condition" ? "field" : "match") : C(p.id, "add");
    }
  }, H = Q(u, e, d, S);
  return /* @__PURE__ */ g("div", { className: F("zen-flex zen-flex-col zen-gap-3", N), children: [
    /* @__PURE__ */ t(R, { g: u, depth: 0, ctx: q }),
    c && /* @__PURE__ */ g("p", { className: "zen-m-0 zen-text-sm", "aria-live": "polite", "data-filter-summary": "", children: [
      /* @__PURE__ */ t("span", { className: "zen-text-zen-muted-fg", children: v.t("filterBuilder.shows") }),
      H || v.t("filterBuilder.showsEverything")
    ] })
  ] });
};
export {
  Fe as FilterBuilder
};
//# sourceMappingURL=index57.js.map
