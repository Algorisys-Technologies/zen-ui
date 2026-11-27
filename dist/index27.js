import { jsxs as s, jsx as o } from "react/jsx-runtime";
import * as l from "react";
import { DATE_RANGE_OPERATORS as I, operatorMeta as $, resolveDateRange as E, formatDateRangeValue as K, toISODate as p, parseISODate as w } from "./index28.js";
import { useLocale as X } from "./index90.js";
import { Button as S } from "./index71.js";
import { Icon as Z } from "./index63.js";
import { Input as ee } from "./index4.js";
import { Popover as ne, PopoverTrigger as te, PopoverContent as oe } from "./index35.js";
import { Calendar as j } from "./index13.js";
import { cn as O } from "./index199.js";
const re = ["Day", "Week", "Month", "Quarter", "Year", "Rolling", "Fixed"], ae = ({
  value: r,
  defaultValue: d,
  onValueChange: u,
  operators: y,
  weekStartsOn: f = 0,
  now: b,
  placeholder: W,
  disabled: B,
  formatDate: v = (a) => a.toLocaleDateString(),
  className: L
}) => {
  const a = X(), _ = W ?? a.t("dynamicDateRange.selectAPeriod"), R = (n, t) => a.t(n, t), [g, N] = l.useState(!1), [F, P] = l.useState(d), M = r !== void 0, [G, Q] = l.useState(r);
  r !== G && (Q(r), r === void 0 && P(void 0));
  const m = M ? r : F, x = l.useMemo(() => b ?? /* @__PURE__ */ new Date(), [b, g]), T = l.useMemo(
    () => y ? I.filter((n) => y.includes(n.operator)) : I,
    [y]
  ), U = l.useMemo(() => {
    const n = /* @__PURE__ */ new Map();
    for (const t of T) {
      const i = n.get(t.group) ?? [];
      i.push(t), n.set(t.group, i);
    }
    return re.filter((t) => n.has(t)).map((t) => [t, n.get(t)]);
  }, [T]), [e, c] = l.useState(m);
  l.useEffect(() => {
    g && c(m);
  }, [g]);
  const h = e?.operator, z = h ? $(h) : void 0, D = l.useMemo(
    () => E(e, x, { weekStartsOn: f }),
    [e, x, f]
  ), A = !!(D.from || D.to), Y = (n) => {
    const t = $(n);
    if (!t) return;
    const i = e && "count" in e ? e.count : 1, J = e && "includeCurrent" in e ? e.includeCurrent : !1, k = p(x);
    t.arity === "count" ? c({ operator: n, count: i, includeCurrent: J }) : t.arity === "date" ? c({ operator: n, date: e && "date" in e ? e.date : k }) : t.arity === "range" ? c({
      operator: "BETWEEN",
      from: e && "from" in e ? e.from : k,
      to: e && "to" in e ? e.to : k
    }) : c({ operator: n });
  }, q = (n) => {
    M || P(n), u?.(n, E(n, b ?? /* @__PURE__ */ new Date(), { weekStartsOn: f })), N(!1);
  }, H = m ? K(m, v, R) : _, C = m ? E(m, x, { weekStartsOn: f }) : {};
  return /* @__PURE__ */ s(ne, { open: g, onOpenChange: N, children: [
    /* @__PURE__ */ o(te, { asChild: !0, children: /* @__PURE__ */ s(
      S,
      {
        variant: "outline",
        color: "neutral",
        disabled: B,
        className: O("zen-justify-start zen-gap-2 zen-font-normal", L),
        children: [
          /* @__PURE__ */ o(Z, { name: "calendar", size: 16, className: "zen-shrink-0 zen-text-zen-muted-fg" }),
          /* @__PURE__ */ o("span", { className: O(!m && "zen-text-zen-muted-fg"), children: H }),
          m && (C.from || C.to) ? (
            // The trigger says "Last 7 days"; this says which 7. Both matter —
            // the name is the intent, the dates are the fact.
            /* @__PURE__ */ s("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: [
              "(",
              V(C, v, R),
              ")"
            ] })
          ) : null
        ]
      }
    ) }),
    /* @__PURE__ */ o(oe, { className: "zen-w-auto zen-p-0", align: "start", children: /* @__PURE__ */ s("div", { className: "zen-flex zen-max-w-[34rem] zen-flex-col zen-gap-0 sm:zen-flex-row", children: [
      /* @__PURE__ */ o(
        "div",
        {
          role: "listbox",
          "aria-label": a.t("dynamicDateRange.period"),
          className: "zen-max-h-72 zen-w-48 zen-shrink-0 zen-overflow-y-auto zen-border-b zen-border-zen-border zen-p-1 sm:zen-border-b-0 sm:zen-border-r",
          children: U.map(([n, t]) => /* @__PURE__ */ s("div", { children: [
            /* @__PURE__ */ o("div", { className: "zen-px-2 zen-pb-1 zen-pt-2 zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg", children: a.t(`dateRange.group.${n}`) }),
            t.map((i) => /* @__PURE__ */ o(
              "button",
              {
                type: "button",
                role: "option",
                "aria-selected": h === i.operator,
                onClick: () => Y(i.operator),
                className: O(
                  "zen-flex zen-w-full zen-cursor-pointer zen-items-center zen-rounded-zen-sm zen-border-0 zen-px-2 zen-py-1.5",
                  "zen-text-start zen-text-sm zen-transition-colors",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                  h === i.operator ? "zen-bg-zen-primary zen-text-zen-primary-fg" : "zen-bg-transparent zen-text-zen-foreground hover:zen-bg-zen-muted"
                ),
                children: a.t(`dateRange.op.${i.operator}`)
              },
              i.operator
            ))
          ] }, n))
        }
      ),
      /* @__PURE__ */ s("div", { className: "zen-flex zen-min-w-[16rem] zen-flex-col zen-gap-3 zen-p-3", children: [
        e ? null : /* @__PURE__ */ o("p", { className: "zen-m-0 zen-py-8 zen-text-center zen-text-sm zen-text-zen-muted-fg", children: a.t("dynamicDateRange.pickAPeriodOnThe") }),
        z?.arity === "count" && e && "count" in e ? /* @__PURE__ */ s("div", { className: "zen-flex zen-flex-col zen-gap-2", children: [
          /* @__PURE__ */ s("label", { className: "zen-flex zen-items-center zen-gap-2 zen-text-sm", children: [
            /* @__PURE__ */ o("span", { className: "zen-text-zen-muted-fg", children: e.operator.startsWith("LAST") ? a.t("dynamicDateRange.last") : a.t("dynamicDateRange.next") }),
            /* @__PURE__ */ o(
              ee,
              {
                type: "number",
                min: 0,
                value: String(e.count),
                onChange: (n) => {
                  const t = Number(n.target.value);
                  c({ ...e, count: Number.isFinite(t) ? t : 0 });
                },
                "aria-label": a.t(`dynamicDateRange.numberOf.${z.unit}`),
                className: "zen-h-8 zen-w-20"
              }
            ),
            /* @__PURE__ */ o("span", { className: "zen-text-zen-muted-fg", children: a.t(`dynamicDateRange.units.${z.unit}`) })
          ] }),
          /* @__PURE__ */ s("label", { className: "zen-flex zen-cursor-pointer zen-items-center zen-gap-2 zen-text-sm zen-text-zen-muted-fg", children: [
            /* @__PURE__ */ o(
              "input",
              {
                type: "checkbox",
                checked: !!e.includeCurrent,
                onChange: (n) => c({ ...e, includeCurrent: n.target.checked })
              }
            ),
            a.t(`dynamicDateRange.includeCurrent.${z.unit}`)
          ] })
        ] }) : null,
        z?.arity === "date" && e && "date" in e ? /* @__PURE__ */ o(
          j,
          {
            mode: "single",
            selected: w(e.date) ?? void 0,
            onSelect: (n) => n && c({ ...e, date: p(n) })
          }
        ) : null,
        z?.arity === "range" && e && "from" in e ? /* @__PURE__ */ o(
          j,
          {
            mode: "range",
            selected: { from: w(e.from) ?? void 0, to: w(e.to) ?? void 0 },
            onSelect: (n) => c({
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
            children: A ? V(D, v, R) : "—"
          }
        ) : null,
        /* @__PURE__ */ s("div", { className: "zen-flex zen-justify-end zen-gap-2", children: [
          /* @__PURE__ */ o(S, { variant: "ghost", color: "neutral", size: "sm", onClick: () => N(!1), children: a.t("dynamicDateRange.cancel") }),
          /* @__PURE__ */ o(S, { size: "sm", disabled: !e || !A, onClick: () => q(e), children: a.t("dynamicDateRange.apply") })
        ] })
      ] })
    ] }) })
  ] });
};
ae.displayName = "DynamicDateRange";
const V = (r, d, u) => r.from && r.to ? u("dateRange.span", { from: d(r.from), to: d(r.to) }) : r.from ? u("dateRange.from", { date: d(r.from) }) : r.to ? u("dateRange.until", { date: d(r.to) }) : "—";
export {
  ae as DynamicDateRange
};
//# sourceMappingURL=index27.js.map
