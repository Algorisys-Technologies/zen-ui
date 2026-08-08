import { jsx as e } from "react/jsx-runtime";
import * as s from "react";
import { Checkbox as t, CheckboxIndicator as d } from "./index152.js";
import { cn as r } from "./index143.js";
const c = {
  sm: "zen-h-3.5 zen-w-3.5",
  md: "zen-h-4 zen-w-4",
  lg: "zen-h-5 zen-w-5"
}, z = s.forwardRef(({ className: i, size: o = "md", ...n }, a) => /* @__PURE__ */ e(
  t,
  {
    ref: a,
    className: r(
      "zen-peer zen-shrink-0 zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
      "data-[state=checked]:zen-bg-zen-primary data-[state=checked]:zen-border-zen-primary data-[state=checked]:zen-text-zen-primary-fg",
      "data-[state=indeterminate]:zen-bg-zen-primary data-[state=indeterminate]:zen-border-zen-primary data-[state=indeterminate]:zen-text-zen-primary-fg",
      c[o],
      i
    ),
    ...n,
    children: /* @__PURE__ */ e(
      d,
      {
        className: r("zen-flex zen-items-center zen-justify-center zen-text-current"),
        children: n.checked === "indeterminate" ? /* @__PURE__ */ e(m, {}) : /* @__PURE__ */ e(l, {})
      }
    )
  }
));
z.displayName = t.displayName;
const l = () => /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", width: "100%", height: "100%", children: /* @__PURE__ */ e("polyline", { points: "20 6 9 17 4 12" }) }), m = () => /* @__PURE__ */ e("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", width: "100%", height: "100%", children: /* @__PURE__ */ e("line", { x1: "6", y1: "12", x2: "18", y2: "12" }) });
export {
  z as Checkbox
};
//# sourceMappingURL=index32.js.map
