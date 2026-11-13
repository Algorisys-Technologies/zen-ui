import { jsxs as s, jsx as o } from "react/jsx-runtime";
import * as m from "react";
import { DATE_RANGE_OPERATORS as A, operatorMeta as I, resolveDateRange as E, formatDateRangeValue as H, toISODate as p, parseISODate as w } from "./index28.js";
import { useLocale as J } from "./index90.js";
import { Button as O } from "./index71.js";
import { Icon as K } from "./index63.js";
import { Input as X } from "./index4.js";
import { Popover as Z, PopoverTrigger as ee, PopoverContent as ne } from "./index35.js";
import { Calendar as $ } from "./index13.js";
import { cn as S } from "./index197.js";
const te = ["Day", "Week", "Month", "Quarter", "Year", "Rolling", "Fixed"], oe = ({
  value: a,
  defaultValue: d,
  onValueChange: u,
  operators: y,
  weekStartsOn: f = 0,
  now: b,
  placeholder: W,
  disabled: B,
  formatDate: v = (r) => r.toLocaleDateString(),
  className: L
}) => {
  const r = J(), _ = W ?? r.t("dynamicDateRange.selectAPeriod"), R = (n, t) => r.t(n, t), [g, N] = m.useState(!1), [F, G] = m.useState(d), M = a !== void 0, c = M ? a : F, x = m.useMemo(() => b ?? /* @__PURE__ */ new Date(), [b, g]), P = m.useMemo(
    () => y ? A.filter((n) => y.includes(n.operator)) : A,
    [y]
  ), V = m.useMemo(() => {
    const n = /* @__PURE__ */ new Map();
    for (const t of P) {
      const i = n.get(t.group) ?? [];
      i.push(t), n.set(t.group, i);
    }
    return te.filter((t) => n.has(t)).map((t) => [t, n.get(t)]);
  }, [P]), [e, l] = m.useState(c);
  m.useEffect(() => {
    g && l(c);
  }, [g]);
  const h = e?.operator, z = h ? I(h) : void 0, D = m.useMemo(
    () => E(e, x, { weekStartsOn: f }),
    [e, x, f]
  ), T = !!(D.from || D.to), Q = (n) => {
    const t = I(n);
    if (!t) return;
    const i = e && "count" in e ? e.count : 1, q = e && "includeCurrent" in e ? e.includeCurrent : !1, k = p(x);
    t.arity === "count" ? l({ operator: n, count: i, includeCurrent: q }) : t.arity === "date" ? l({ operator: n, date: e && "date" in e ? e.date : k }) : t.arity === "range" ? l({
      operator: "BETWEEN",
      from: e && "from" in e ? e.from : k,
      to: e && "to" in e ? e.to : k
    }) : l({ operator: n });
  }, U = (n) => {
    M || G(n), u?.(n, E(n, b ?? /* @__PURE__ */ new Date(), { weekStartsOn: f })), N(!1);
  }, Y = c ? H(c, v, R) : _, C = c ? E(c, x, { weekStartsOn: f }) : {};
  return /* @__PURE__ */ s(Z, { open: g, onOpenChange: N, children: [
    /* @__PURE__ */ o(ee, { asChild: !0, children: /* @__PURE__ */ s(
      O,
      {
        variant: "outline",
        color: "neutral",
        disabled: B,
        className: S("zen-justify-start zen-gap-2 zen-font-normal", L),
        children: [
          /* @__PURE__ */ o(K, { name: "calendar", size: 16, className: "zen-shrink-0 zen-text-zen-muted-fg" }),
          /* @__PURE__ */ o("span", { className: S(!c && "zen-text-zen-muted-fg"), children: Y }),
          c && (C.from || C.to) ? (
            // The trigger says "Last 7 days"; this says which 7. Both matter —
            // the name is the intent, the dates are the fact.
            /* @__PURE__ */ s("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: [
              "(",
              j(C, v, R),
              ")"
            ] })
          ) : null
        ]
      }
    ) }),
    /* @__PURE__ */ o(ne, { className: "zen-w-auto zen-p-0", align: "start", children: /* @__PURE__ */ s("div", { className: "zen-flex zen-max-w-[34rem] zen-flex-col zen-gap-0 sm:zen-flex-row", children: [
      /* @__PURE__ */ o(
        "div",
        {
          role: "listbox",
          "aria-label": r.t("dynamicDateRange.period"),
          className: "zen-max-h-72 zen-w-48 zen-shrink-0 zen-overflow-y-auto zen-border-b zen-border-zen-border zen-p-1 sm:zen-border-b-0 sm:zen-border-r",
          children: V.map(([n, t]) => /* @__PURE__ */ s("div", { children: [
            /* @__PURE__ */ o("div", { className: "zen-px-2 zen-pb-1 zen-pt-2 zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg", children: r.t(`dateRange.group.${n}`) }),
            t.map((i) => /* @__PURE__ */ o(
              "button",
              {
                type: "button",
                role: "option",
                "aria-selected": h === i.operator,
                onClick: () => Q(i.operator),
                className: S(
                  "zen-flex zen-w-full zen-cursor-pointer zen-items-center zen-rounded-zen-sm zen-border-0 zen-px-2 zen-py-1.5",
                  "zen-text-start zen-text-sm zen-transition-colors",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                  h === i.operator ? "zen-bg-zen-primary zen-text-zen-primary-fg" : "zen-bg-transparent zen-text-zen-foreground hover:zen-bg-zen-muted"
                ),
                children: r.t(`dateRange.op.${i.operator}`)
              },
              i.operator
            ))
          ] }, n))
        }
      ),
      /* @__PURE__ */ s("div", { className: "zen-flex zen-min-w-[16rem] zen-flex-col zen-gap-3 zen-p-3", children: [
        e ? null : /* @__PURE__ */ o("p", { className: "zen-m-0 zen-py-8 zen-text-center zen-text-sm zen-text-zen-muted-fg", children: r.t("dynamicDateRange.pickAPeriodOnThe") }),
        z?.arity === "count" && e && "count" in e ? /* @__PURE__ */ s("div", { className: "zen-flex zen-flex-col zen-gap-2", children: [
          /* @__PURE__ */ s("label", { className: "zen-flex zen-items-center zen-gap-2 zen-text-sm", children: [
            /* @__PURE__ */ o("span", { className: "zen-text-zen-muted-fg", children: e.operator.startsWith("LAST") ? r.t("dynamicDateRange.last") : r.t("dynamicDateRange.next") }),
            /* @__PURE__ */ o(
              X,
              {
                type: "number",
                min: 0,
                value: String(e.count),
                onChange: (n) => {
                  const t = Number(n.target.value);
                  l({ ...e, count: Number.isFinite(t) ? t : 0 });
                },
                "aria-label": r.t(`dynamicDateRange.numberOf.${z.unit}`),
                className: "zen-h-8 zen-w-20"
              }
            ),
            /* @__PURE__ */ o("span", { className: "zen-text-zen-muted-fg", children: r.t(`dynamicDateRange.units.${z.unit}`) })
          ] }),
          /* @__PURE__ */ s("label", { className: "zen-flex zen-cursor-pointer zen-items-center zen-gap-2 zen-text-sm zen-text-zen-muted-fg", children: [
            /* @__PURE__ */ o(
              "input",
              {
                type: "checkbox",
                checked: !!e.includeCurrent,
                onChange: (n) => l({ ...e, includeCurrent: n.target.checked })
              }
            ),
            r.t(`dynamicDateRange.includeCurrent.${z.unit}`)
          ] })
        ] }) : null,
        z?.arity === "date" && e && "date" in e ? /* @__PURE__ */ o(
          $,
          {
            mode: "single",
            selected: w(e.date) ?? void 0,
            onSelect: (n) => n && l({ ...e, date: p(n) })
          }
        ) : null,
        z?.arity === "range" && e && "from" in e ? /* @__PURE__ */ o(
          $,
          {
            mode: "range",
            selected: { from: w(e.from) ?? void 0, to: w(e.to) ?? void 0 },
            onSelect: (n) => l({
              operator: "BETWEEN",
              from: n?.from ? p(n.from) : e.from,
              to: n?.to ? p(n.to) : n?.from ? p(n.from) : e.to
            })
          }
        ) : null,
        e ? /* @__PURE__ */ o(
          "div",
          {
            "aria-live": "polite",
            className: "zen-rounded-zen-md zen-bg-zen-muted zen-px-3 zen-py-2 zen-text-xs zen-text-zen-muted-fg",
            children: T ? j(D, v, R) : "—"
          }
        ) : null,
        /* @__PURE__ */ s("div", { className: "zen-flex zen-justify-end zen-gap-2", children: [
          /* @__PURE__ */ o(O, { variant: "ghost", color: "neutral", size: "sm", onClick: () => N(!1), children: r.t("dynamicDateRange.cancel") }),
          /* @__PURE__ */ o(O, { size: "sm", disabled: !e || !T, onClick: () => U(e), children: r.t("dynamicDateRange.apply") })
        ] })
      ] })
    ] }) })
  ] });
};
oe.displayName = "DynamicDateRange";
const j = (a, d, u) => a.from && a.to ? u("dateRange.span", { from: d(a.from), to: d(a.to) }) : a.from ? u("dateRange.from", { date: d(a.from) }) : a.to ? u("dateRange.until", { date: d(a.to) }) : "—";
export {
  oe as DynamicDateRange
};
//# sourceMappingURL=index27.js.map
