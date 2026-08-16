import { jsx as n } from "react/jsx-runtime";
import * as l from "react";
import { Root as o, Indicator as i } from "./index165.js";
import { cn as r } from "./index145.js";
const f = {
  sm: "zen-h-1",
  md: "zen-h-2",
  lg: "zen-h-3"
}, c = {
  primary: "zen-bg-zen-primary",
  neutral: "zen-bg-zen-neutral",
  info: "zen-bg-zen-info",
  success: "zen-bg-zen-success",
  warning: "zen-bg-zen-warning",
  error: "zen-bg-zen-error"
}, d = l.forwardRef(({ className: z, value: e, size: s = "md", color: a = "primary", ...t }, m) => /* @__PURE__ */ n(
  o,
  {
    ref: m,
    value: e,
    className: r(
      "zen-relative zen-w-full zen-overflow-hidden zen-rounded-zen-full zen-bg-zen-muted",
      f[s],
      z
    ),
    ...t,
    children: /* @__PURE__ */ n(
      i,
      {
        className: r(
          "zen-h-full zen-w-full zen-flex-1 zen-transition-transform",
          c[a]
        ),
        style: {
          transform: `translateX(-${100 - (e ?? 0)}%)`
        }
      }
    )
  }
));
d.displayName = o.displayName;
export {
  d as Progress
};
//# sourceMappingURL=index60.js.map
