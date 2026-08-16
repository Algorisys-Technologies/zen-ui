import { jsx as l, jsxs as t } from "react/jsx-runtime";
import * as a from "react";
import { cn as J } from "./index145.js";
import "./index25.js";
import "./index100.js";
import { Dialog as U, DialogContent as X, DialogTitle as Y, DialogDescription as Z } from "./index71.js";
import { Button as m } from "./index65.js";
import { Input as w } from "./index4.js";
import { Checkbox as ee } from "./index33.js";
import { Tabs as ne, TabsList as le, TabsTrigger as C, TabsContent as k } from "./index88.js";
import { Select as te, SelectTrigger as ae, SelectValue as re, SelectContent as oe, SelectItem as ie } from "./index36.js";
import { SelectSearchField as se, SelectListBody as ce } from "./index162.js";
import { filterItems as de } from "./index163.js";
const E = {
  EQ: "equals",
  Contains: "contains",
  StartsWith: "starts with",
  EndsWith: "ends with",
  BT: "between",
  LT: "less than",
  LE: "less or equal",
  GT: "greater than",
  GE: "greater or equal"
}, ze = Object.keys(E), me = (o) => o.value.trim() !== "" && (o.operator !== "BT" || (o.valueTo ?? "").trim() !== ""), ue = ({
  open: o,
  onOpenChange: u,
  title: R,
  description: f,
  items: h,
  multiple: V = !1,
  selectedIds: b,
  conditions: N,
  onConfirm: B,
  searchable: D = !0,
  searchPlaceholder: L = "Search",
  onSearch: p,
  emptyText: I = "No matching items",
  confirmLabel: O = "OK",
  cancelLabel: j = "Cancel",
  selectTabLabel: q = "Select from list",
  conditionsTabLabel: A = "Define conditions",
  addConditionLabel: P = "Add condition",
  className: Q
}) => {
  const [x, T] = a.useState(""), [y, g] = a.useState([]), [i, d] = a.useState([]), G = a.useRef(0), H = () => ({
    id: `vh-${G.current++}`,
    exclude: !1,
    operator: "EQ",
    value: ""
  }), v = a.useRef({ selectedIds: b, conditions: N });
  a.useEffect(() => {
    v.current = { selectedIds: b, conditions: N };
  }), a.useEffect(() => {
    o && (g(v.current.selectedIds ?? []), d((v.current.conditions ?? []).map((e) => ({ ...e }))), T(""));
  }, [o]);
  const W = a.useMemo(
    () => de(h, x, !!p),
    [h, x, p]
  ), $ = (e) => g((n) => n.includes(e) ? n.filter((r) => r !== e) : [...n, e]), F = (e) => g([e]), z = (e, n) => d((r) => r.map((s) => s.id === e ? { ...s, ...n } : s)), K = (e) => {
    const n = new Set(e), r = h.filter((c) => n.has(c.id)).map((c) => c.id), s = new Set(r);
    return [...r, ...e.filter((c) => !s.has(c))];
  }, M = () => {
    B({ ids: K(y), conditions: i.filter(me) }), u(!1);
  }, _ = (e) => {
    T(e), p?.(e);
  }, S = a.useId();
  return /* @__PURE__ */ l(U, { open: o, onOpenChange: u, children: /* @__PURE__ */ t(
    X,
    {
      className: J(
        "zen-flex zen-max-h-[85vh] zen-w-full zen-max-w-2xl zen-flex-col zen-overflow-hidden zen-p-0",
        Q
      ),
      "aria-describedby": f ? S : void 0,
      children: [
        /* @__PURE__ */ t("div", { className: "zen-flex zen-flex-col zen-gap-2 zen-border-b zen-border-zen-border zen-px-6 zen-py-4", children: [
          /* @__PURE__ */ l(Y, { className: "zen-pr-8", children: R }),
          f ? /* @__PURE__ */ l(Z, { id: S, children: f }) : null
        ] }),
        /* @__PURE__ */ t(ne, { defaultValue: "select", className: "zen-flex zen-min-h-0 zen-flex-1 zen-flex-col", children: [
          /* @__PURE__ */ t(le, { className: "zen-mx-6 zen-mt-3", children: [
            /* @__PURE__ */ l(C, { value: "select", children: q }),
            /* @__PURE__ */ t(C, { value: "conditions", children: [
              A,
              i.length > 0 ? /* @__PURE__ */ l("span", { className: "zen-ml-2 zen-rounded-zen-full zen-bg-zen-primary-soft zen-px-1.5 zen-text-xs zen-text-zen-primary-soft-fg", children: i.length }) : null
            ] })
          ] }),
          /* @__PURE__ */ t(
            k,
            {
              value: "select",
              className: "zen-flex zen-min-h-0 zen-flex-1 zen-flex-col zen-gap-2 zen-overflow-hidden",
              children: [
                D ? /* @__PURE__ */ l(
                  se,
                  {
                    value: x,
                    onValueChange: _,
                    placeholder: L,
                    className: "zen-mx-6 zen-mt-1"
                  }
                ) : null,
                /* @__PURE__ */ l("div", { className: "zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-pb-2", children: /* @__PURE__ */ l(
                  ce,
                  {
                    items: W,
                    multiple: V,
                    selected: y,
                    onToggle: $,
                    onPick: F,
                    emptyText: I
                  }
                ) })
              ]
            }
          ),
          /* @__PURE__ */ t(
            k,
            {
              value: "conditions",
              className: "zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-6 zen-pb-2 zen-pt-1",
              children: [
                i.length === 0 ? /* @__PURE__ */ l("p", { className: "zen-m-0 zen-py-8 zen-text-center zen-text-sm zen-text-zen-muted-fg", children: "No conditions yet." }) : /* @__PURE__ */ l("ul", { className: "zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-2 zen-p-0", children: i.map((e) => /* @__PURE__ */ t("li", { className: "zen-flex zen-items-center zen-gap-2", children: [
                  /* @__PURE__ */ t("label", { className: "zen-flex zen-shrink-0 zen-items-center zen-gap-1.5 zen-text-xs zen-text-zen-muted-fg", children: [
                    /* @__PURE__ */ l(
                      ee,
                      {
                        checked: e.exclude,
                        onCheckedChange: (n) => z(e.id, { exclude: n === !0 }),
                        "aria-label": `Exclude condition ${e.id}`
                      }
                    ),
                    "Exclude"
                  ] }),
                  /* @__PURE__ */ t(
                    te,
                    {
                      value: e.operator,
                      onValueChange: (n) => z(e.id, { operator: n }),
                      children: [
                        /* @__PURE__ */ l(ae, { className: "zen-w-40 zen-shrink-0", "aria-label": "Operator", children: /* @__PURE__ */ l(re, {}) }),
                        /* @__PURE__ */ l(oe, { children: ze.map((n) => /* @__PURE__ */ l(ie, { value: n, children: E[n] }, n)) })
                      ]
                    }
                  ),
                  /* @__PURE__ */ l(
                    w,
                    {
                      value: e.value,
                      onChange: (n) => z(e.id, { value: n.target.value }),
                      placeholder: "Value",
                      "aria-label": "Value"
                    }
                  ),
                  e.operator === "BT" ? /* @__PURE__ */ l(
                    w,
                    {
                      value: e.valueTo ?? "",
                      onChange: (n) => z(e.id, { valueTo: n.target.value }),
                      placeholder: "To",
                      "aria-label": "To value"
                    }
                  ) : null,
                  /* @__PURE__ */ l(
                    m,
                    {
                      type: "button",
                      variant: "ghost",
                      color: "neutral",
                      size: "sm",
                      "aria-label": "Remove condition",
                      onClick: () => d((n) => n.filter((r) => r.id !== e.id)),
                      children: "✕"
                    }
                  )
                ] }, e.id)) }),
                /* @__PURE__ */ l(
                  m,
                  {
                    type: "button",
                    variant: "outline",
                    color: "neutral",
                    size: "sm",
                    className: "zen-mt-3",
                    onClick: () => d((e) => [...e, H()]),
                    children: P
                  }
                )
              ]
            }
          )
        ] }),
        /* @__PURE__ */ t("div", { className: "zen-flex zen-items-center zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-6 zen-py-3", children: [
          /* @__PURE__ */ l(
            m,
            {
              type: "button",
              variant: "outline",
              color: "neutral",
              size: "sm",
              onClick: () => u(!1),
              children: j
            }
          ),
          /* @__PURE__ */ l(m, { type: "button", size: "sm", onClick: M, children: O })
        ] })
      ]
    }
  ) });
};
ue.displayName = "ValueHelp";
export {
  ue as ValueHelp
};
//# sourceMappingURL=index52.js.map
