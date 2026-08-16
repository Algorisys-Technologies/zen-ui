import { jsx as t } from "react/jsx-runtime";
import * as z from "react";
import { cva as s } from "./index146.js";
import { Button as p } from "./index65.js";
import { cn as o } from "./index145.js";
const f = s("zen-fixed zen-z-40", {
  variants: {
    position: {
      "bottom-right": "zen-bottom-6 zen-right-6",
      "bottom-left": "zen-bottom-6 zen-left-6",
      "top-right": "zen-top-6 zen-right-6",
      "top-left": "zen-top-6 zen-left-6"
    }
  },
  defaultVariants: {
    position: "bottom-right"
  }
}), l = {
  md: "zen-h-12 zen-w-12",
  lg: "zen-h-14 zen-w-14",
  xl: "zen-h-16 zen-w-16"
}, h = z.forwardRef(
  ({ position: e, size: n = "lg", className: r, color: i = "primary", ...a }, m) => /* @__PURE__ */ t("div", { className: o(f({ position: e })), children: /* @__PURE__ */ t(
    p,
    {
      ref: m,
      color: i,
      shape: "circle",
      className: o(
        "zen-shadow-md hover:zen-shadow-lg",
        l[n],
        r
      ),
      ...a
    }
  ) })
);
h.displayName = "FAB";
export {
  h as FAB
};
//# sourceMappingURL=index68.js.map
