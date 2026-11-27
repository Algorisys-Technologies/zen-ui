import { jsx as a } from "react/jsx-runtime";
import * as z from "react";
import { cn as f } from "./index199.js";
import { arrowStep as S } from "./index207.js";
import "./index208.js";
import { toColorOption as j, normalizeHex as l, contrastingInk as L, colorLabel as d } from "./index210.js";
import "./index28.js";
import "./index110.js";
const N = { sm: "zen-h-6 zen-w-6", md: "zen-h-8 zen-w-8", lg: "zen-h-10 zen-w-10" }, A = z.forwardRef(
  ({ colors: v, value: c, defaultValue: h, onValueChange: g, label: w, size: k = "md", disabled: r, className: y, ...x }, b) => {
    const s = v.map(j), [C, I] = z.useState(() => l(h ?? "") ?? ""), u = c !== void 0, m = u ? l(c) ?? "" : C, p = (e) => {
      const o = l(e) ?? e;
      u || I(o), g?.(o);
    }, i = s.findIndex((e) => l(e.value) === m);
    return /* @__PURE__ */ a(
      "div",
      {
        ref: b,
        role: "radiogroup",
        "aria-label": w,
        "aria-disabled": r || void 0,
        onKeyDown: (e) => {
          if (r) return;
          const o = s.length - 1, n = (D) => {
            e.preventDefault(), p(s[Math.max(0, Math.min(o, D))].value);
          }, t = S(e.key, e.currentTarget);
          t === 1 || e.key === "ArrowDown" ? n(i < 0 ? 0 : i + 1) : t === -1 || e.key === "ArrowUp" ? n(i < 0 ? 0 : i - 1) : e.key === "Home" ? n(0) : e.key === "End" && n(o);
        },
        className: f("zen-flex zen-flex-wrap zen-gap-1.5", r && "zen-opacity-50", y),
        ...x,
        children: s.map((e, o) => {
          const n = l(e.value) ?? e.value, t = n === m;
          return /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              role: "radio",
              "aria-checked": t,
              "aria-label": d(e),
              title: d(e),
              disabled: r,
              tabIndex: t || i < 0 && o === 0 ? 0 : -1,
              onClick: () => !r && p(e.value),
              className: f(
                "zen-inline-flex zen-items-center zen-justify-center zen-rounded-zen-sm",
                "zen-cursor-pointer zen-border zen-border-zen-border zen-p-0 zen-transition-transform",
                "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
                r && "zen-cursor-not-allowed",
                N[k]
              ),
              style: { backgroundColor: n },
              children: t ? /* @__PURE__ */ a(
                "svg",
                {
                  width: "12",
                  height: "12",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: L(n),
                  strokeWidth: "3",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  "aria-hidden": !0,
                  children: /* @__PURE__ */ a("polyline", { points: "20 6 9 17 4 12" })
                }
              ) : null
            },
            `${n}-${o}`
          );
        })
      }
    );
  }
);
A.displayName = "ColorPalette";
export {
  A as ColorPalette
};
//# sourceMappingURL=index26.js.map
