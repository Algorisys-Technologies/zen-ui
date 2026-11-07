import { jsxs as s, jsx as n } from "react/jsx-runtime";
import * as t from "react";
import { Button as u } from "./index71.js";
import { Popover as $, PopoverTrigger as A, PopoverContent as E } from "./index35.js";
import { Calendar as T } from "./index13.js";
import { useLocale as W } from "./index90.js";
import { cn as q } from "./index160.js";
function g(r) {
  return !!(r?.from && r?.to);
}
const X = ({
  value: r,
  defaultValue: y,
  onValueChange: z,
  placeholder: b,
  disabled: i,
  className: x,
  numberOfMonths: C = 2,
  formatDate: d = (l) => l.toLocaleDateString(),
  cancelLabel: v,
  doneLabel: k
}) => {
  const l = W(), L = b ?? l.t("dateRangePicker.placeholder"), w = v ?? l.t("common.cancel"), R = k ?? l.t("common.done"), [m, f] = t.useState(!1), [S, j] = t.useState(
    y
  ), p = r !== void 0, e = p ? r : S, [c, a] = t.useState(e), h = t.useRef(e);
  t.useEffect(() => {
    m || a(e);
  }, [e, m]);
  const P = t.useCallback(
    (o) => {
      p || j(o), z?.(o);
    },
    [p, z]
  ), B = (o) => {
    o ? (h.current = e, a(e)) : a(h.current), f(o);
  }, N = (o) => {
    a(o);
  }, O = () => {
    g(c) && (P(c), f(!1));
  }, D = () => {
    a(h.current), f(!1);
  }, I = e?.from ? e.to ? `${d(e.from)} – ${d(e.to)}` : d(e.from) : L, M = c?.from ?? e?.from;
  return /* @__PURE__ */ s($, { open: m, onOpenChange: B, children: [
    /* @__PURE__ */ n(A, { asChild: !0, children: /* @__PURE__ */ n(
      u,
      {
        variant: "outline",
        color: "neutral",
        disabled: typeof i == "boolean" ? i : void 0,
        className: q(
          "zen-min-w-[16rem] zen-justify-between zen-font-normal",
          !e?.from && "zen-text-zen-muted-fg",
          x
        ),
        iconLeft: /* @__PURE__ */ n(F, {}),
        children: I
      }
    ) }),
    /* @__PURE__ */ s(E, { className: "zen-w-auto zen-p-0", align: "start", children: [
      /* @__PURE__ */ n(
        T,
        {
          mode: "range",
          selected: c,
          onSelect: N,
          numberOfMonths: C,
          defaultMonth: M,
          disabled: typeof i == "boolean" ? void 0 : i
        }
      ),
      /* @__PURE__ */ s("div", { className: "zen-flex zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-3 zen-py-2", children: [
        /* @__PURE__ */ n(
          u,
          {
            type: "button",
            variant: "ghost",
            color: "neutral",
            size: "sm",
            onClick: D,
            children: w
          }
        ),
        /* @__PURE__ */ n(
          u,
          {
            type: "button",
            variant: "solid",
            color: "primary",
            size: "sm",
            onClick: O,
            disabled: !g(c),
            children: R
          }
        )
      ] })
    ] })
  ] });
}, F = () => /* @__PURE__ */ s(
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
  X as DateRangePicker
};
//# sourceMappingURL=index19.js.map
