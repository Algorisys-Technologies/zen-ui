import { jsxs as M, jsx as c } from "react/jsx-runtime";
import * as f from "react";
import { useLocale as j } from "./index90.js";
import { cn as a } from "./index197.js";
const R = f.forwardRef(
  ({
    className: m,
    value: u,
    defaultValue: g,
    min: n,
    max: o,
    step: l = 1,
    onValueChange: v,
    disabled: r,
    ...y
  }, x) => {
    const z = j(), [h, w] = f.useState(
      g ?? null
    ), b = u !== void 0, t = b ? u : h, s = (e) => {
      b || w(e), v?.(e);
    }, i = (e) => typeof n == "number" && e < n ? n : typeof o == "number" && e > o ? o : e, N = () => {
      s(i((t ?? n ?? 0) - l));
    }, k = () => {
      s(i((t ?? n ?? 0) + l));
    }, F = typeof n == "number" && t !== null && t <= n, C = typeof o == "number" && t !== null && t >= o;
    return /* @__PURE__ */ M(
      "div",
      {
        className: a(
          "zen-inline-flex zen-h-zen-control zen-items-stretch zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-overflow-hidden",
          r && "zen-opacity-50 zen-cursor-not-allowed",
          m
        ),
        children: [
          /* @__PURE__ */ c(
            "button",
            {
              type: "button",
              "aria-label": z.t("numberField.decrement"),
              onClick: N,
              disabled: r || F,
              className: a(
                "zen-px-3 zen-text-base zen-text-zen-foreground zen-bg-transparent",
                "hover:zen-bg-zen-muted disabled:zen-opacity-50 disabled:zen-cursor-not-allowed",
                "focus-visible:zen-outline-none focus-visible:zen-bg-zen-muted"
              ),
              children: "−"
            }
          ),
          /* @__PURE__ */ c(
            "input",
            {
              ref: x,
              type: "number",
              inputMode: "decimal",
              value: t ?? "",
              min: n,
              max: o,
              step: l,
              disabled: r,
              onChange: (e) => {
                const d = e.target.value;
                if (d === "") {
                  s(null);
                  return;
                }
                const p = Number(d);
                Number.isFinite(p) && s(i(p));
              },
              className: a(
                "zen-min-w-0 zen-flex-1 zen-text-center zen-text-sm zen-bg-transparent",
                "zen-border-x zen-border-zen-border",
                "focus:zen-outline-none focus-visible:zen-bg-zen-primary-soft",
                "disabled:zen-cursor-not-allowed",
                // hide native spinners
                "zen-[appearance:textfield] [&::-webkit-inner-spin-button]:zen-appearance-none [&::-webkit-outer-spin-button]:zen-appearance-none"
              ),
              ...y
            }
          ),
          /* @__PURE__ */ c(
            "button",
            {
              type: "button",
              "aria-label": z.t("numberField.increment"),
              onClick: k,
              disabled: r || C,
              className: a(
                "zen-px-3 zen-text-base zen-text-zen-foreground zen-bg-transparent",
                "hover:zen-bg-zen-muted disabled:zen-opacity-50 disabled:zen-cursor-not-allowed",
                "focus-visible:zen-outline-none focus-visible:zen-bg-zen-muted"
              ),
              children: "+"
            }
          )
        ]
      }
    );
  }
);
R.displayName = "NumberField";
export {
  R as NumberField
};
//# sourceMappingURL=index11.js.map
