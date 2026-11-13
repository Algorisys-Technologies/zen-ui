import { jsxs as l, jsx as o } from "react/jsx-runtime";
import * as C from "react";
import { Calendar as L } from "./index13.js";
import { Button as N } from "./index71.js";
import { Popover as P, PopoverTrigger as $, PopoverContent as H } from "./index35.js";
import { TimePicker as j } from "./index20.js";
import { useLocale as M } from "./index90.js";
import { cn as B } from "./index197.js";
const u = (e) => e.toString().padStart(2, "0"), F = (e, i) => {
  if (!e) return;
  const n = `${u(e.getHours())}:${u(e.getMinutes())}`;
  return i ? `${n}:${u(e.getSeconds())}` : n;
}, I = (e, i) => {
  if (!i) {
    const r = new Date(e);
    return r.setHours(0, 0, 0, 0), r;
  }
  const n = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(i);
  if (!n) return e;
  const a = new Date(e);
  return a.setHours(Number(n[1]), Number(n[2]), n[3] ? Number(n[3]) : 0, 0), a;
}, R = (e) => e.toLocaleDateString(), V = (e, i) => e.toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
  hour12: i === "12h"
}), Q = ({
  value: e,
  defaultValue: i,
  onValueChange: n,
  placeholder: a,
  disabled: r,
  className: x,
  format: m = "24h",
  showSeconds: g = !1,
  minuteStep: z = 1,
  formatDate: y = R,
  formatTime: b = V
}) => {
  const p = M(), v = a ?? p.t("dateTimePicker.placeholder"), [w, T] = C.useState(i), f = e !== void 0, t = f ? e : w, c = (s) => {
    f || T(s), n?.(s);
  }, S = (s) => {
    if (!s) {
      c(void 0);
      return;
    }
    if (!t) {
      const h = new Date(s);
      h.setHours(0, 0, 0, 0), c(h);
      return;
    }
    const d = new Date(s);
    d.setHours(
      t.getHours(),
      t.getMinutes(),
      t.getSeconds(),
      t.getMilliseconds()
    ), c(d);
  }, D = (s) => {
    c(I(t ?? /* @__PURE__ */ new Date(), s));
  }, k = t ? `${y(t)} ${b(t, m)}` : v;
  return /* @__PURE__ */ l(P, { children: [
    /* @__PURE__ */ o($, { asChild: !0, children: /* @__PURE__ */ o(
      N,
      {
        variant: "outline",
        color: "neutral",
        disabled: typeof r == "boolean" ? r : void 0,
        className: B(
          "zen-w-72 zen-justify-between zen-font-normal",
          !t && "zen-text-zen-muted-fg",
          x
        ),
        iconLeft: /* @__PURE__ */ o(W, {}),
        children: k
      }
    ) }),
    /* @__PURE__ */ l(H, { className: "zen-w-auto zen-p-0", align: "start", children: [
      /* @__PURE__ */ o(
        L,
        {
          mode: "single",
          selected: t,
          onSelect: S,
          disabled: typeof r == "boolean" ? void 0 : r
        }
      ),
      /* @__PURE__ */ l("div", { className: "zen-flex zen-items-center zen-justify-between zen-gap-3 zen-border-t zen-border-zen-border zen-px-3 zen-py-2.5", children: [
        /* @__PURE__ */ o("label", { className: "zen-text-xs zen-text-zen-muted-fg", children: p.t("dateTimePicker.time") }),
        /* @__PURE__ */ o(
          j,
          {
            value: F(t, g),
            onValueChange: D,
            format: m,
            showSeconds: g,
            minuteStep: z,
            disabled: typeof r == "boolean" ? r : void 0
          }
        )
      ] })
    ] })
  ] });
}, W = () => /* @__PURE__ */ l("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
  /* @__PURE__ */ o("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }),
  /* @__PURE__ */ o("line", { x1: "16", y1: "2", x2: "16", y2: "6" }),
  /* @__PURE__ */ o("line", { x1: "8", y1: "2", x2: "8", y2: "6" }),
  /* @__PURE__ */ o("line", { x1: "3", y1: "10", x2: "21", y2: "10" })
] });
export {
  Q as DateTimePicker
};
//# sourceMappingURL=index21.js.map
