import { jsxs as r, jsx as n } from "react/jsx-runtime";
import * as z from "react";
import { cva as d } from "./index198.js";
import { useLocale as p } from "./index90.js";
import { cn as m } from "./index197.js";
const f = d("zen-animate-spin", {
  variants: {
    size: {
      sm: "zen-h-3 zen-w-3",
      md: "zen-h-4 zen-w-4",
      lg: "zen-h-6 zen-w-6",
      xl: "zen-h-10 zen-w-10"
    },
    color: {
      primary: "zen-text-zen-primary",
      neutral: "zen-text-zen-foreground",
      info: "zen-text-zen-info",
      success: "zen-text-zen-success",
      warning: "zen-text-zen-warning",
      error: "zen-text-zen-error",
      current: "zen-text-current"
    }
  },
  defaultVariants: {
    size: "md",
    color: "primary"
  }
}), h = z.forwardRef(
  ({ className: t, size: a, color: i, label: o, ...s }, l) => {
    const c = p(), e = o ?? c.t("loading.label");
    return /* @__PURE__ */ r("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 }, children: [
      /* @__PURE__ */ r(
        "svg",
        {
          ref: l,
          role: e ? "status" : "presentation",
          "aria-label": e || void 0,
          "aria-hidden": e ? void 0 : !0,
          viewBox: "0 0 24 24",
          fill: "none",
          className: m(f({ size: a, color: i, className: t })),
          ...s,
          children: [
            /* @__PURE__ */ n(
              "circle",
              {
                className: "zen-opacity-25",
                cx: "12",
                cy: "12",
                r: "10",
                stroke: "currentColor",
                strokeWidth: "4"
              }
            ),
            /* @__PURE__ */ n(
              "path",
              {
                className: "zen-opacity-75",
                fill: "currentColor",
                d: "M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              }
            )
          ]
        }
      ),
      e ? /* @__PURE__ */ n(
        "span",
        {
          style: {
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0,0,0,0)",
            whiteSpace: "nowrap",
            border: 0
          },
          children: e
        }
      ) : null
    ] });
  }
);
h.displayName = "Loading";
export {
  h as Loading,
  f as spinnerVariants
};
//# sourceMappingURL=index67.js.map
