import { jsxs as l, jsx as z } from "react/jsx-runtime";
import * as v from "react";
import { cn as f } from "./index145.js";
import { arrowStep as P } from "./index150.js";
import "./index25.js";
import "./index100.js";
const i = (s) => s <= 6 ? "detractor" : s <= 8 ? "passive" : "promoter", C = {
  detractor: "Detractor",
  passive: "Passive",
  promoter: "Promoter"
}, E = v.forwardRef(
  ({
    value: s,
    defaultValue: x,
    onValueChange: b,
    label: h = "How likely are you to recommend us?",
    lowLabel: u = "Not at all likely",
    highLabel: m = "Extremely likely",
    disabled: t,
    readOnly: c,
    className: y,
    name: d,
    showBucket: w = !0
  }, k) => {
    const [N, D] = v.useState(x), p = s !== void 0, n = p ? s : N, g = !t && !c, a = (e) => {
      p || D(e), b?.(e);
    }, j = (e) => {
      if (!g || n === void 0) return;
      const r = P(e.key, e.currentTarget);
      r ? (e.preventDefault(), a(Math.max(0, Math.min(10, n + r)))) : e.key === "Home" ? (e.preventDefault(), a(0)) : e.key === "End" && (e.preventDefault(), a(10));
    }, S = Array.from({ length: 11 }, (e, r) => r);
    return /* @__PURE__ */ l(
      "div",
      {
        ref: k,
        role: "radiogroup",
        "aria-label": h,
        "aria-disabled": t || void 0,
        "aria-readonly": c || void 0,
        onKeyDown: j,
        className: f(
          // flex (not inline-flex) + max-w-full so it fits its container; the
          // 0–10 strip scrolls horizontally on narrow widths instead of clipping
          "zen-flex zen-flex-col zen-gap-2 zen-max-w-full",
          t && "zen-opacity-50",
          y
        ),
        children: [
          /* @__PURE__ */ z("div", { className: "zen-flex zen-items-center zen-gap-1 zen-overflow-x-auto", children: S.map((e) => {
            const r = n === e, o = i(e);
            return /* @__PURE__ */ z(
              "button",
              {
                type: "button",
                role: "radio",
                "aria-checked": r,
                "aria-label": `${e}${e === 0 ? " — " + u : e === 10 ? " — " + m : ""}`,
                disabled: t,
                tabIndex: r || n === void 0 && e === 0 ? 0 : -1,
                onClick: () => g && a(e),
                className: f(
                  "zen-h-9 zen-min-w-9 zen-px-2",
                  "zen-inline-flex zen-items-center zen-justify-center",
                  "zen-text-sm zen-font-medium zen-tabular-nums",
                  "zen-rounded-zen-sm zen-border zen-cursor-pointer zen-transition-colors",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                  /* unselected — soft bucket tint */
                  !r && [
                    "zen-bg-zen-background",
                    o === "detractor" && "zen-border-zen-error-soft zen-text-zen-error-soft-fg hover:zen-bg-zen-error-soft",
                    o === "passive" && "zen-border-zen-warning-soft zen-text-zen-warning-soft-fg hover:zen-bg-zen-warning-soft",
                    o === "promoter" && "zen-border-zen-success-soft zen-text-zen-success-soft-fg hover:zen-bg-zen-success-soft"
                  ],
                  /* selected — saturated bucket fill */
                  r && [
                    o === "detractor" && "zen-bg-zen-error zen-text-zen-error-fg zen-border-zen-error",
                    o === "passive" && "zen-bg-zen-warning zen-text-zen-warning-fg zen-border-zen-warning",
                    o === "promoter" && "zen-bg-zen-success zen-text-zen-success-fg zen-border-zen-success"
                  ],
                  (t || c) && "zen-cursor-default",
                  t && "hover:!zen-bg-zen-background"
                ),
                children: e
              },
              e
            );
          }) }),
          /* @__PURE__ */ l("div", { className: "zen-flex zen-justify-between zen-text-xs zen-text-zen-muted-fg zen-px-1", children: [
            /* @__PURE__ */ z("span", { children: u }),
            /* @__PURE__ */ z("span", { children: m })
          ] }),
          w && n !== void 0 ? /* @__PURE__ */ l(
            "p",
            {
              className: f(
                "zen-text-xs zen-mt-1 zen-m-0 zen-font-medium",
                i(n) === "detractor" && "zen-text-zen-error",
                i(n) === "passive" && "zen-text-zen-warning-soft-fg",
                i(n) === "promoter" && "zen-text-zen-success"
              ),
              "aria-live": "polite",
              children: [
                n,
                " · ",
                C[i(n)]
              ]
            }
          ) : null,
          d && n !== void 0 ? /* @__PURE__ */ z("input", { type: "hidden", name: d, value: n }) : null
        ]
      }
    );
  }
);
E.displayName = "NPS";
export {
  E as NPS
};
//# sourceMappingURL=index14.js.map
