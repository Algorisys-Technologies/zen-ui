import { jsxs as f, jsx as i } from "react/jsx-runtime";
import * as v from "react";
import { cn as u } from "./index160.js";
import { arrowStep as M } from "./index168.js";
import "./index28.js";
import "./index110.js";
import { useLocale as R } from "./index90.js";
const z = (s) => s <= 6 ? "detractor" : s <= 8 ? "passive" : "promoter", T = {
  detractor: "nps.detractor",
  passive: "nps.passive",
  promoter: "nps.promoter"
}, $ = v.forwardRef(
  ({
    value: s,
    defaultValue: x,
    onValueChange: h,
    label: w,
    lowLabel: y,
    highLabel: k,
    disabled: t,
    readOnly: l,
    className: L,
    name: p,
    showBucket: N = !0
  }, j) => {
    const a = R(), A = w ?? a.t("nps.howLikelyAreYouTo"), m = y ?? a.t("nps.notAtAllLikely"), d = k ?? a.t("nps.extremelyLikely"), [D, S] = v.useState(x), g = s !== void 0, n = g ? s : D, b = !t && !l, c = (e) => {
      g || S(e), h?.(e);
    }, C = (e) => {
      if (!b || n === void 0) return;
      const r = M(e.key, e.currentTarget);
      r ? (e.preventDefault(), c(Math.max(0, Math.min(10, n + r)))) : e.key === "Home" ? (e.preventDefault(), c(0)) : e.key === "End" && (e.preventDefault(), c(10));
    }, I = Array.from({ length: 11 }, (e, r) => r);
    return /* @__PURE__ */ f(
      "div",
      {
        ref: j,
        role: "radiogroup",
        "aria-label": A,
        "aria-disabled": t || void 0,
        "aria-readonly": l || void 0,
        onKeyDown: C,
        className: u(
          // flex (not inline-flex) + max-w-full so it fits its container; the
          // 0–10 strip scrolls horizontally on narrow widths instead of clipping
          "zen-flex zen-flex-col zen-gap-2 zen-max-w-full",
          t && "zen-opacity-50",
          L
        ),
        children: [
          /* @__PURE__ */ i("div", { className: "zen-flex zen-items-center zen-gap-1 zen-overflow-x-auto", children: I.map((e) => {
            const r = n === e, o = z(e);
            return /* @__PURE__ */ i(
              "button",
              {
                type: "button",
                role: "radio",
                "aria-checked": r,
                "aria-label": `${e}${e === 0 ? " — " + m : e === 10 ? " — " + d : ""}`,
                disabled: t,
                tabIndex: r || n === void 0 && e === 0 ? 0 : -1,
                onClick: () => b && c(e),
                className: u(
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
                  (t || l) && "zen-cursor-default",
                  t && "hover:!zen-bg-zen-background"
                ),
                children: e
              },
              e
            );
          }) }),
          /* @__PURE__ */ f("div", { className: "zen-flex zen-justify-between zen-text-xs zen-text-zen-muted-fg zen-px-1", children: [
            /* @__PURE__ */ i("span", { children: m }),
            /* @__PURE__ */ i("span", { children: d })
          ] }),
          N && n !== void 0 ? /* @__PURE__ */ f(
            "p",
            {
              className: u(
                "zen-text-xs zen-mt-1 zen-m-0 zen-font-medium",
                z(n) === "detractor" && "zen-text-zen-error",
                z(n) === "passive" && "zen-text-zen-warning-soft-fg",
                z(n) === "promoter" && "zen-text-zen-success"
              ),
              "aria-live": "polite",
              children: [
                n,
                " · ",
                a.t(T[z(n)])
              ]
            }
          ) : null,
          p && n !== void 0 ? /* @__PURE__ */ i("input", { type: "hidden", name: p, value: n }) : null
        ]
      }
    );
  }
);
$.displayName = "NPS";
export {
  $ as NPS
};
//# sourceMappingURL=index16.js.map
