import { jsx as e } from "react/jsx-runtime";
import * as p from "react";
import { Root as f } from "./index171.js";
import { badgeVariants as i } from "./index159.js";
import { cn as n } from "./index160.js";
const c = p.forwardRef(
  ({ className: o, variant: r, color: a, asChild: m = !1, ...t }, s) => /* @__PURE__ */ e(
    m ? f : "span",
    {
      ref: s,
      className: n(i({ variant: r, color: a, className: o })),
      ...t
    }
  )
);
c.displayName = "Badge";
export {
  c as Badge,
  i as badgeVariants
};
//# sourceMappingURL=index64.js.map
