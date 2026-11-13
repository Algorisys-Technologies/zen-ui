import { jsx as l, jsxs as a } from "react/jsx-runtime";
import * as o from "react";
import { cn as ne } from "./index197.js";
import "./index28.js";
import "./index110.js";
import { Dialog as le, DialogContent as te, DialogTitle as ae, DialogDescription as oe } from "./index79.js";
import { Button as z } from "./index71.js";
import { Input as H } from "./index4.js";
import { Checkbox as re } from "./index36.js";
import { Tabs as ie, TabsList as se, TabsTrigger as k, TabsContent as S } from "./index98.js";
import { Select as ce, SelectTrigger as de, SelectValue as ue, SelectContent as me, SelectItem as ze } from "./index39.js";
import { SelectSearchField as pe, SelectListBody as fe } from "./index220.js";
import { filterItems as he } from "./index222.js";
import { useLocale as xe } from "./index90.js";
const be = ["EQ", "Contains", "StartsWith", "EndsWith", "BT", "LT", "LE", "GT", "GE"], ve = (i) => i.value.trim() !== "" && (i.operator !== "BT" || (i.valueTo ?? "").trim() !== ""), ge = ({
  open: i,
  onOpenChange: p,
  title: w,
  description: f,
  items: h,
  multiple: R = !1,
  selectedIds: T,
  conditions: C,
  onConfirm: E,
  searchable: V = !0,
  searchPlaceholder: B,
  onSearch: x,
  emptyText: D,
  confirmLabel: I,
  cancelLabel: P,
  selectTabLabel: j,
  conditionsTabLabel: Q,
  addConditionLabel: G,
  className: W
}) => {
  const t = xe(), $ = B ?? t.t("common.search"), q = I ?? t.t("common.ok"), A = P ?? t.t("common.cancel"), F = j ?? t.t("valueHelp.selectTab"), M = Q ?? t.t("valueHelp.conditionsTab"), O = G ?? t.t("valueHelp.addCondition"), [b, N] = o.useState(""), [y, v] = o.useState([]), [s, u] = o.useState([]), J = o.useRef(0), K = () => ({
    id: `vh-${J.current++}`,
    exclude: !1,
    operator: "EQ",
    value: ""
  }), g = o.useRef({ selectedIds: T, conditions: C });
  o.useEffect(() => {
    g.current = { selectedIds: T, conditions: C };
  }), o.useEffect(() => {
    i && (v(g.current.selectedIds ?? []), u((g.current.conditions ?? []).map((e) => ({ ...e }))), N(""));
  }, [i]);
  const U = o.useMemo(
    () => he(h, b, !!x),
    [h, b, x]
  ), X = (e) => v((n) => n.includes(e) ? n.filter((r) => r !== e) : [...n, e]), Y = (e) => v([e]), m = (e, n) => u((r) => r.map((c) => c.id === e ? { ...c, ...n } : c)), Z = (e) => {
    const n = new Set(e), r = h.filter((d) => n.has(d.id)).map((d) => d.id), c = new Set(r);
    return [...r, ...e.filter((d) => !c.has(d))];
  }, _ = () => {
    E({ ids: Z(y), conditions: s.filter(ve) }), p(!1);
  }, ee = (e) => {
    N(e), x?.(e);
  }, L = o.useId();
  return /* @__PURE__ */ l(le, { open: i, onOpenChange: p, children: /* @__PURE__ */ a(
    te,
    {
      className: ne(
        "zen-flex zen-max-h-[85vh] zen-w-full zen-max-w-2xl zen-flex-col zen-overflow-hidden zen-p-0",
        W
      ),
      "aria-describedby": f ? L : void 0,
      children: [
        /* @__PURE__ */ a("div", { className: "zen-flex zen-flex-col zen-gap-2 zen-border-b zen-border-zen-border zen-px-6 zen-py-4", children: [
          /* @__PURE__ */ l(ae, { className: "zen-pr-8", children: w }),
          f ? /* @__PURE__ */ l(oe, { id: L, children: f }) : null
        ] }),
        /* @__PURE__ */ a(ie, { defaultValue: "select", className: "zen-flex zen-min-h-0 zen-flex-1 zen-flex-col", children: [
          /* @__PURE__ */ a(se, { className: "zen-mx-6 zen-mt-3", children: [
            /* @__PURE__ */ l(k, { value: "select", children: F }),
            /* @__PURE__ */ a(k, { value: "conditions", children: [
              M,
              s.length > 0 ? /* @__PURE__ */ l("span", { className: "zen-ml-2 zen-rounded-zen-full zen-bg-zen-primary-soft zen-px-1.5 zen-text-xs zen-text-zen-primary-soft-fg", children: s.length }) : null
            ] })
          ] }),
          /* @__PURE__ */ a(
            S,
            {
              value: "select",
              className: "zen-flex zen-min-h-0 zen-flex-1 zen-flex-col zen-gap-2 zen-overflow-hidden",
              children: [
                V ? /* @__PURE__ */ l(
                  pe,
                  {
                    value: b,
                    onValueChange: ee,
                    placeholder: $,
                    className: "zen-mx-6 zen-mt-1"
                  }
                ) : null,
                /* @__PURE__ */ l("div", { className: "zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-pb-2", children: /* @__PURE__ */ l(
                  fe,
                  {
                    items: U,
                    multiple: R,
                    selected: y,
                    onToggle: X,
                    onPick: Y,
                    emptyText: D
                  }
                ) })
              ]
            }
          ),
          /* @__PURE__ */ a(
            S,
            {
              value: "conditions",
              className: "zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-6 zen-pb-2 zen-pt-1",
              children: [
                s.length === 0 ? /* @__PURE__ */ l("p", { className: "zen-m-0 zen-py-8 zen-text-center zen-text-sm zen-text-zen-muted-fg", children: t.t("valueHelp.noConditions") }) : /* @__PURE__ */ l("ul", { className: "zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-2 zen-p-0", children: s.map((e) => /* @__PURE__ */ a("li", { className: "zen-flex zen-items-center zen-gap-2", children: [
                  /* @__PURE__ */ a("label", { className: "zen-flex zen-shrink-0 zen-items-center zen-gap-1.5 zen-text-xs zen-text-zen-muted-fg", children: [
                    /* @__PURE__ */ l(
                      re,
                      {
                        checked: e.exclude,
                        onCheckedChange: (n) => m(e.id, { exclude: n === !0 }),
                        "aria-label": t.t("valueHelp.exclude", { id: e.id })
                      }
                    ),
                    t.t("valueHelp.excludeLabel")
                  ] }),
                  /* @__PURE__ */ a(
                    ce,
                    {
                      value: e.operator,
                      onValueChange: (n) => m(e.id, { operator: n }),
                      children: [
                        /* @__PURE__ */ l(de, { className: "zen-w-40 zen-shrink-0", "aria-label": t.t("valueHelp.operator"), children: /* @__PURE__ */ l(ue, {}) }),
                        /* @__PURE__ */ l(me, { children: be.map((n) => /* @__PURE__ */ l(ze, { value: n, children: t.t(`valueHelp.op.${n}`) }, n)) })
                      ]
                    }
                  ),
                  /* @__PURE__ */ l(
                    H,
                    {
                      value: e.value,
                      onChange: (n) => m(e.id, { value: n.target.value }),
                      placeholder: t.t("valueHelp.value"),
                      "aria-label": t.t("valueHelp.value")
                    }
                  ),
                  e.operator === "BT" ? /* @__PURE__ */ l(
                    H,
                    {
                      value: e.valueTo ?? "",
                      onChange: (n) => m(e.id, { valueTo: n.target.value }),
                      placeholder: t.t("valueHelp.to"),
                      "aria-label": t.t("valueHelp.toValue")
                    }
                  ) : null,
                  /* @__PURE__ */ l(
                    z,
                    {
                      type: "button",
                      variant: "ghost",
                      color: "neutral",
                      size: "sm",
                      "aria-label": t.t("valueHelp.removeCondition"),
                      onClick: () => u((n) => n.filter((r) => r.id !== e.id)),
                      children: "✕"
                    }
                  )
                ] }, e.id)) }),
                /* @__PURE__ */ l(
                  z,
                  {
                    type: "button",
                    variant: "outline",
                    color: "neutral",
                    size: "sm",
                    className: "zen-mt-3",
                    onClick: () => u((e) => [...e, K()]),
                    children: O
                  }
                )
              ]
            }
          )
        ] }),
        /* @__PURE__ */ a("div", { className: "zen-flex zen-items-center zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-6 zen-py-3", children: [
          /* @__PURE__ */ l(
            z,
            {
              type: "button",
              variant: "outline",
              color: "neutral",
              size: "sm",
              onClick: () => p(!1),
              children: A
            }
          ),
          /* @__PURE__ */ l(z, { type: "button", size: "sm", onClick: _, children: q })
        ] })
      ]
    }
  ) });
};
ge.displayName = "ValueHelp";
export {
  ge as ValueHelp
};
//# sourceMappingURL=index58.js.map
