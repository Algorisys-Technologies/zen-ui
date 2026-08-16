import { jsxs as l, jsx as o } from "react/jsx-runtime";
import * as D from "react";
import { Calendar as C } from "./index12.js";
import { Button as k } from "./index65.js";
import { Popover as N, PopoverTrigger as $, PopoverContent as H } from "./index32.js";
import { TimePicker as L } from "./index18.js";
import { cn as P } from "./index145.js";
const d = (e) => e.toString().padStart(2, "0"), j = (e, i) => {
  if (!e) return;
  const n = `${d(e.getHours())}:${d(e.getMinutes())}`;
  return i ? `${n}:${d(e.getSeconds())}` : n;
}, M = (e, i) => {
  if (!i) {
    const r = new Date(e);
    return r.setHours(0, 0, 0, 0), r;
  }
  const n = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(i);
  if (!n) return e;
  const a = new Date(e);
  return a.setHours(Number(n[1]), Number(n[2]), n[3] ? Number(n[3]) : 0, 0), a;
}, B = (e) => e.toLocaleDateString(), F = (e, i) => e.toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
  hour12: i === "12h"
}), G = ({
  value: e,
  defaultValue: i,
  onValueChange: n,
  placeholder: a = "Pick date & time",
  disabled: r,
  className: h,
  format: m = "24h",
  showSeconds: g = !1,
  minuteStep: x = 1,
  formatDate: z = B,
  formatTime: y = F
}) => {
  const [b, v] = D.useState(i), f = e !== void 0, t = f ? e : b, c = (s) => {
    f || v(s), n?.(s);
  }, w = (s) => {
    if (!s) {
      c(void 0);
      return;
    }
    if (!t) {
      const p = new Date(s);
      p.setHours(0, 0, 0, 0), c(p);
      return;
    }
    const u = new Date(s);
    u.setHours(
      t.getHours(),
      t.getMinutes(),
      t.getSeconds(),
      t.getMilliseconds()
    ), c(u);
  }, S = (s) => {
    c(M(t ?? /* @__PURE__ */ new Date(), s));
  }, T = t ? `${z(t)} ${y(t, m)}` : a;
  return /* @__PURE__ */ l(N, { children: [
    /* @__PURE__ */ o($, { asChild: !0, children: /* @__PURE__ */ o(
      k,
      {
        variant: "outline",
        color: "neutral",
        disabled: typeof r == "boolean" ? r : void 0,
        className: P(
          "zen-w-72 zen-justify-between zen-font-normal",
          !t && "zen-text-zen-muted-fg",
          h
        ),
        iconLeft: /* @__PURE__ */ o(I, {}),
        children: T
      }
    ) }),
    /* @__PURE__ */ l(H, { className: "zen-w-auto zen-p-0", align: "start", children: [
      /* @__PURE__ */ o(
        C,
        {
          mode: "single",
          selected: t,
          onSelect: w,
          disabled: typeof r == "boolean" ? void 0 : r
        }
      ),
      /* @__PURE__ */ l("div", { className: "zen-flex zen-items-center zen-justify-between zen-gap-3 zen-border-t zen-border-zen-border zen-px-3 zen-py-2.5", children: [
        /* @__PURE__ */ o("label", { className: "zen-text-xs zen-text-zen-muted-fg", children: "Time" }),
        /* @__PURE__ */ o(
          L,
          {
            value: j(t, g),
            onValueChange: S,
            format: m,
            showSeconds: g,
            minuteStep: x,
            disabled: typeof r == "boolean" ? r : void 0
          }
        )
      ] })
    ] })
  ] });
}, I = () => /* @__PURE__ */ l("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
  /* @__PURE__ */ o("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }),
  /* @__PURE__ */ o("line", { x1: "16", y1: "2", x2: "16", y2: "6" }),
  /* @__PURE__ */ o("line", { x1: "8", y1: "2", x2: "8", y2: "6" }),
  /* @__PURE__ */ o("line", { x1: "3", y1: "10", x2: "21", y2: "10" })
] });
export {
  G as DateTimePicker
};
//# sourceMappingURL=index19.js.map
