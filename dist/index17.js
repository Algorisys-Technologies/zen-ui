import { jsxs as c, jsx as n } from "react/jsx-runtime";
import * as t from "react";
import { Button as h } from "./index65.js";
import { Popover as N, PopoverTrigger as O, PopoverContent as I } from "./index32.js";
import { Calendar as M } from "./index12.js";
import { cn as $ } from "./index145.js";
function z(r) {
  return !!(r?.from && r?.to);
}
const G = ({
  value: r,
  defaultValue: g,
  onValueChange: p,
  placeholder: y = "Pick a date range",
  disabled: s,
  className: x,
  numberOfMonths: C = 2,
  formatDate: d = (i) => i.toLocaleDateString(),
  cancelLabel: v = "Cancel",
  doneLabel: b = "Done"
}) => {
  const [i, f] = t.useState(!1), [k, w] = t.useState(
    g
  ), m = r !== void 0, e = m ? r : k, [a, l] = t.useState(e), u = t.useRef(e);
  t.useEffect(() => {
    i || l(e);
  }, [e, i]);
  const S = t.useCallback(
    (o) => {
      m || w(o), p?.(o);
    },
    [m, p]
  ), j = (o) => {
    o ? (u.current = e, l(e)) : l(u.current), f(o);
  }, P = (o) => {
    l(o);
  }, R = () => {
    z(a) && (S(a), f(!1));
  }, L = () => {
    l(u.current), f(!1);
  }, B = e?.from ? e.to ? `${d(e.from)} – ${d(e.to)}` : d(e.from) : y, D = a?.from ?? e?.from;
  return /* @__PURE__ */ c(N, { open: i, onOpenChange: j, children: [
    /* @__PURE__ */ n(O, { asChild: !0, children: /* @__PURE__ */ n(
      h,
      {
        variant: "outline",
        color: "neutral",
        disabled: typeof s == "boolean" ? s : void 0,
        className: $(
          "zen-min-w-[16rem] zen-justify-between zen-font-normal",
          !e?.from && "zen-text-zen-muted-fg",
          x
        ),
        iconLeft: /* @__PURE__ */ n(A, {}),
        children: B
      }
    ) }),
    /* @__PURE__ */ c(I, { className: "zen-w-auto zen-p-0", align: "start", children: [
      /* @__PURE__ */ n(
        M,
        {
          mode: "range",
          selected: a,
          onSelect: P,
          numberOfMonths: C,
          defaultMonth: D,
          disabled: typeof s == "boolean" ? void 0 : s
        }
      ),
      /* @__PURE__ */ c("div", { className: "zen-flex zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-3 zen-py-2", children: [
        /* @__PURE__ */ n(
          h,
          {
            type: "button",
            variant: "ghost",
            color: "neutral",
            size: "sm",
            onClick: L,
            children: v
          }
        ),
        /* @__PURE__ */ n(
          h,
          {
            type: "button",
            variant: "solid",
            color: "primary",
            size: "sm",
            onClick: R,
            disabled: !z(a),
            children: b
          }
        )
      ] })
    ] })
  ] });
}, A = () => /* @__PURE__ */ c(
  "svg",
  {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": !0,
    children: [
      /* @__PURE__ */ n("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }),
      /* @__PURE__ */ n("line", { x1: "16", y1: "2", x2: "16", y2: "6" }),
      /* @__PURE__ */ n("line", { x1: "8", y1: "2", x2: "8", y2: "6" }),
      /* @__PURE__ */ n("line", { x1: "3", y1: "10", x2: "21", y2: "10" })
    ]
  }
);
export {
  G as DateRangePicker
};
//# sourceMappingURL=index17.js.map
