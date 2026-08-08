import { jsxs as a, jsx as e } from "react/jsx-runtime";
import * as y from "react";
import { Root as z, Slottable as N } from "./index150.js";
import { buttonVariants as h } from "./index142.js";
import { cn as B } from "./index143.js";
const R = () => /* @__PURE__ */ a(
  "svg",
  {
    className: "zen-animate-spin zen-h-4 zen-w-4",
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    children: [
      /* @__PURE__ */ e(
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
      /* @__PURE__ */ e(
        "path",
        {
          className: "zen-opacity-75",
          fill: "currentColor",
          d: "M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        }
      )
    ]
  }
), S = y.forwardRef(
  ({
    className: s,
    variant: i,
    color: n,
    size: c,
    shape: m,
    multiline: l,
    asChild: o = !1,
    loading: t = !1,
    disabled: p,
    iconLeft: d,
    iconRight: f,
    children: u,
    type: v,
    ...b
  }, w) => {
    const x = o ? z : "button", r = p || t;
    return /* @__PURE__ */ a(
      x,
      {
        ref: w,
        className: B(h({ variant: i, color: n, size: c, shape: m, multiline: l, className: s })),
        type: o ? void 0 : v ?? "button",
        disabled: o ? void 0 : r,
        "aria-disabled": o && r || void 0,
        "aria-busy": t || void 0,
        "data-loading": t || void 0,
        ...b,
        children: [
          t ? /* @__PURE__ */ e(R, {}) : d,
          /* @__PURE__ */ e(N, { children: u }),
          !t && f
        ]
      }
    );
  }
);
S.displayName = "Button";
export {
  S as Button,
  h as buttonVariants
};
//# sourceMappingURL=index64.js.map
