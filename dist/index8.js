import { jsxs as a, Fragment as i, jsx as n } from "react/jsx-runtime";
import * as m from "react";
import { cva as z } from "./index146.js";
import { cn as c } from "./index145.js";
const p = z("zen-font-medium zen-leading-none zen-text-zen-foreground", {
  variants: {
    size: {
      sm: "zen-text-xs",
      md: "zen-text-sm",
      lg: "zen-text-base"
    },
    disabled: {
      true: "zen-cursor-not-allowed zen-opacity-70",
      false: ""
    }
  },
  defaultVariants: { size: "md", disabled: !1 }
}), f = m.forwardRef(
  ({ className: r, size: s, required: l, disabled: e, children: t, ...d }, o) => /* @__PURE__ */ a(
    "label",
    {
      ref: o,
      "data-disabled": e ? "" : void 0,
      className: c(
        p({ size: s, disabled: !!e }),
        "peer-disabled:zen-cursor-not-allowed peer-disabled:zen-opacity-70",
        r
      ),
      ...d,
      children: [
        t,
        l ? /* @__PURE__ */ a(i, { children: [
          /* @__PURE__ */ n("span", { "aria-hidden": "true", className: "zen-ml-0.5 zen-text-zen-error", children: "*" }),
          /* @__PURE__ */ n("span", { className: "zen-sr-only", children: " (required)" })
        ] }) : null
      ]
    }
  )
);
f.displayName = "Label";
export {
  f as Label,
  p as labelVariants
};
//# sourceMappingURL=index8.js.map
