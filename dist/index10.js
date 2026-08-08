import { jsxs as F, jsx as u } from "react/jsx-runtime";
import * as p from "react";
import { cn as a } from "./index143.js";
const M = p.forwardRef(
  ({
    className: f,
    value: z,
    defaultValue: m,
    min: n,
    max: o,
    step: l = 1,
    onValueChange: g,
    disabled: r,
    ...v
  }, y) => {
    const [x, h] = p.useState(
      m ?? null
    ), c = z !== void 0, t = c ? z : x, s = (e) => {
      c || h(e), g?.(e);
    }, i = (e) => typeof n == "number" && e < n ? n : typeof o == "number" && e > o ? o : e, w = () => {
      s(i((t ?? n ?? 0) - l));
    }, N = () => {
      s(i((t ?? n ?? 0) + l));
    }, k = typeof n == "number" && t !== null && t <= n, C = typeof o == "number" && t !== null && t >= o;
    return /* @__PURE__ */ F(
      "div",
      {
        className: a(
          "zen-inline-flex zen-h-10 zen-items-stretch zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-overflow-hidden",
          r && "zen-opacity-50 zen-cursor-not-allowed",
          f
        ),
        children: [
          /* @__PURE__ */ u(
            "button",
            {
              type: "button",
              "aria-label": "Decrement",
              onClick: w,
              disabled: r || k,
              className: a(
                "zen-px-3 zen-text-base zen-text-zen-foreground zen-bg-transparent",
                "hover:zen-bg-zen-muted disabled:zen-opacity-50 disabled:zen-cursor-not-allowed",
                "focus-visible:zen-outline-none focus-visible:zen-bg-zen-muted"
              ),
              children: "−"
            }
          ),
          /* @__PURE__ */ u(
            "input",
            {
              ref: y,
              type: "number",
              inputMode: "decimal",
              value: t ?? "",
              min: n,
              max: o,
              step: l,
              disabled: r,
              onChange: (e) => {
                const b = e.target.value;
                if (b === "") {
                  s(null);
                  return;
                }
                const d = Number(b);
                Number.isFinite(d) && s(i(d));
              },
              className: a(
                "zen-min-w-0 zen-flex-1 zen-text-center zen-text-sm zen-bg-transparent",
                "zen-border-x zen-border-zen-border",
                "focus:zen-outline-none focus-visible:zen-bg-zen-primary-soft",
                "disabled:zen-cursor-not-allowed",
                // hide native spinners
                "zen-[appearance:textfield] [&::-webkit-inner-spin-button]:zen-appearance-none [&::-webkit-outer-spin-button]:zen-appearance-none"
              ),
              ...v
            }
          ),
          /* @__PURE__ */ u(
            "button",
            {
              type: "button",
              "aria-label": "Increment",
              onClick: N,
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
M.displayName = "NumberField";
export {
  M as NumberField
};
//# sourceMappingURL=index10.js.map
