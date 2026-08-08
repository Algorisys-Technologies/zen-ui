import { jsxs as a, jsx as r } from "react/jsx-runtime";
import * as c from "react";
import { DATE_RANGE_OPERATORS as M, operatorMeta as P, resolveDateRange as k, formatDateRangeValue as U, toISODate as u, parseISODate as R } from "./index24.js";
import { Button as E } from "./index64.js";
import { Icon as Y } from "./index56.js";
import { Input as q } from "./index4.js";
import { Popover as H, PopoverTrigger as J, PopoverContent as K } from "./index31.js";
import { Calendar as O } from "./index11.js";
import { cn as w } from "./index143.js";
const X = ["Day", "Week", "Month", "Quarter", "Year", "Rolling", "Fixed"], Z = ({
  value: o,
  defaultValue: m,
  onValueChange: A,
  operators: x,
  weekStartsOn: p = 0,
  now: h,
  placeholder: $ = "Select a period",
  disabled: j,
  formatDate: b = (z) => z.toLocaleDateString(),
  className: W
}) => {
  const [z, v] = c.useState(!1), [B, L] = c.useState(m), D = o !== void 0, l = D ? o : B, f = c.useMemo(() => h ?? /* @__PURE__ */ new Date(), [h, z]), S = c.useMemo(
    () => x ? M.filter((n) => x.includes(n.operator)) : M,
    [x]
  ), _ = c.useMemo(() => {
    const n = /* @__PURE__ */ new Map();
    for (const t of S) {
      const i = n.get(t.group) ?? [];
      i.push(t), n.set(t.group, i);
    }
    return X.filter((t) => n.has(t)).map((t) => [t, n.get(t)]);
  }, [S]), [e, s] = c.useState(l);
  c.useEffect(() => {
    z && s(l);
  }, [z]);
  const g = e?.operator, d = g ? P(g) : void 0, N = c.useMemo(
    () => k(e, f, { weekStartsOn: p }),
    [e, f, p]
  ), I = !!(N.from || N.to), F = (n) => {
    const t = P(n);
    if (!t) return;
    const i = e && "count" in e ? e.count : 1, Q = e && "includeCurrent" in e ? e.includeCurrent : !1, C = u(f);
    t.arity === "count" ? s({ operator: n, count: i, includeCurrent: Q }) : t.arity === "date" ? s({ operator: n, date: e && "date" in e ? e.date : C }) : t.arity === "range" ? s({
      operator: "BETWEEN",
      from: e && "from" in e ? e.from : C,
      to: e && "to" in e ? e.to : C
    }) : s({ operator: n });
  }, G = (n) => {
    D || L(n), A?.(n, k(n, h ?? /* @__PURE__ */ new Date(), { weekStartsOn: p })), v(!1);
  }, V = l ? U(l, b) : $, y = l ? k(l, f, { weekStartsOn: p }) : {};
  return /* @__PURE__ */ a(H, { open: z, onOpenChange: v, children: [
    /* @__PURE__ */ r(J, { asChild: !0, children: /* @__PURE__ */ a(
      E,
      {
        variant: "outline",
        color: "neutral",
        disabled: j,
        className: w("zen-justify-start zen-gap-2 zen-font-normal", W),
        children: [
          /* @__PURE__ */ r(Y, { name: "calendar", size: 16, className: "zen-shrink-0 zen-text-zen-muted-fg" }),
          /* @__PURE__ */ r("span", { className: w(!l && "zen-text-zen-muted-fg"), children: V }),
          l && (y.from || y.to) ? (
            // The trigger says "Last 7 days"; this says which 7. Both matter —
            // the name is the intent, the dates are the fact.
            /* @__PURE__ */ a("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: [
              "(",
              T(y, b),
              ")"
            ] })
          ) : null
        ]
      }
    ) }),
    /* @__PURE__ */ r(K, { className: "zen-w-auto zen-p-0", align: "start", children: /* @__PURE__ */ a("div", { className: "zen-flex zen-max-w-[34rem] zen-flex-col zen-gap-0 sm:zen-flex-row", children: [
      /* @__PURE__ */ r(
        "div",
        {
          role: "listbox",
          "aria-label": "Period",
          className: "zen-max-h-72 zen-w-48 zen-shrink-0 zen-overflow-y-auto zen-border-b zen-border-zen-border zen-p-1 sm:zen-border-b-0 sm:zen-border-r",
          children: _.map(([n, t]) => /* @__PURE__ */ a("div", { children: [
            /* @__PURE__ */ r("div", { className: "zen-px-2 zen-pb-1 zen-pt-2 zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg", children: n }),
            t.map((i) => /* @__PURE__ */ r(
              "button",
              {
                type: "button",
                role: "option",
                "aria-selected": g === i.operator,
                onClick: () => F(i.operator),
                className: w(
                  "zen-flex zen-w-full zen-cursor-pointer zen-items-center zen-rounded-zen-sm zen-border-0 zen-px-2 zen-py-1.5",
                  "zen-text-start zen-text-sm zen-transition-colors",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                  g === i.operator ? "zen-bg-zen-primary zen-text-zen-primary-fg" : "zen-bg-transparent zen-text-zen-foreground hover:zen-bg-zen-muted"
                ),
                children: i.label
              },
              i.operator
            ))
          ] }, n))
        }
      ),
      /* @__PURE__ */ a("div", { className: "zen-flex zen-min-w-[16rem] zen-flex-col zen-gap-3 zen-p-3", children: [
        e ? null : /* @__PURE__ */ r("p", { className: "zen-m-0 zen-py-8 zen-text-center zen-text-sm zen-text-zen-muted-fg", children: "Pick a period on the left." }),
        d?.arity === "count" && e && "count" in e ? /* @__PURE__ */ a("div", { className: "zen-flex zen-flex-col zen-gap-2", children: [
          /* @__PURE__ */ a("label", { className: "zen-flex zen-items-center zen-gap-2 zen-text-sm", children: [
            /* @__PURE__ */ r("span", { className: "zen-text-zen-muted-fg", children: e.operator.startsWith("LAST") ? "Last" : "Next" }),
            /* @__PURE__ */ r(
              q,
              {
                type: "number",
                min: 0,
                value: String(e.count),
                onChange: (n) => {
                  const t = Number(n.target.value);
                  s({ ...e, count: Number.isFinite(t) ? t : 0 });
                },
                "aria-label": `Number of ${d.unit}s`,
                className: "zen-h-8 zen-w-20"
              }
            ),
            /* @__PURE__ */ a("span", { className: "zen-text-zen-muted-fg", children: [
              d.unit,
              "s"
            ] })
          ] }),
          /* @__PURE__ */ a("label", { className: "zen-flex zen-cursor-pointer zen-items-center zen-gap-2 zen-text-sm zen-text-zen-muted-fg", children: [
            /* @__PURE__ */ r(
              "input",
              {
                type: "checkbox",
                checked: !!e.includeCurrent,
                onChange: (n) => s({ ...e, includeCurrent: n.target.checked })
              }
            ),
            "Include the current ",
            d.unit
          ] })
        ] }) : null,
        d?.arity === "date" && e && "date" in e ? /* @__PURE__ */ r(
          O,
          {
            mode: "single",
            selected: R(e.date) ?? void 0,
            onSelect: (n) => n && s({ ...e, date: u(n) })
          }
        ) : null,
        d?.arity === "range" && e && "from" in e ? /* @__PURE__ */ r(
          O,
          {
            mode: "range",
            selected: { from: R(e.from) ?? void 0, to: R(e.to) ?? void 0 },
            onSelect: (n) => s({
              operator: "BETWEEN",
              from: n?.from ? u(n.from) : e.from,
              to: n?.to ? u(n.to) : n?.from ? u(n.from) : e.to
            })
          }
        ) : null,
        e ? /* @__PURE__ */ r(
          "div",
          {
            "aria-live": "polite",
            className: "zen-rounded-zen-md zen-bg-zen-muted zen-px-3 zen-py-2 zen-text-xs zen-text-zen-muted-fg",
            children: I ? T(N, b) : "—"
          }
        ) : null,
        /* @__PURE__ */ a("div", { className: "zen-flex zen-justify-end zen-gap-2", children: [
          /* @__PURE__ */ r(E, { variant: "ghost", color: "neutral", size: "sm", onClick: () => v(!1), children: "Cancel" }),
          /* @__PURE__ */ r(E, { size: "sm", disabled: !e || !I, onClick: () => G(e), children: "Apply" })
        ] })
      ] })
    ] }) })
  ] });
};
Z.displayName = "DynamicDateRange";
const T = (o, m) => o.from && o.to ? `${m(o.from)} – ${m(o.to)}` : o.from ? `from ${m(o.from)}` : o.to ? `until ${m(o.to)}` : "—";
export {
  Z as DynamicDateRange
};
//# sourceMappingURL=index23.js.map
