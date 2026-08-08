import { jsxs as r, jsx as n } from "react/jsx-runtime";
import * as c from "react";
import { cva as z } from "./index144.js";
import { cn as l } from "./index143.js";
const d = z("zen-animate-spin", {
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
}), p = c.forwardRef(
  ({ className: t, size: i, color: a, label: e = "Loading", ...o }, s) => /* @__PURE__ */ r("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 }, children: [
    /* @__PURE__ */ r(
      "svg",
      {
        ref: s,
        role: e ? "status" : "presentation",
        "aria-label": e || void 0,
        "aria-hidden": e ? void 0 : !0,
        viewBox: "0 0 24 24",
        fill: "none",
        className: l(d({ size: i, color: a, className: t })),
        ...o,
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
  ] })
);
p.displayName = "Loading";
export {
  p as Loading,
  d as spinnerVariants
};
//# sourceMappingURL=index60.js.map
