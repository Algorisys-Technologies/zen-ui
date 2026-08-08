import { jsx as p } from "react/jsx-runtime";
import * as t from "react";
import { Root as o } from "./index162.js";
import { cn as l } from "./index143.js";
const z = t.forwardRef(
  ({ className: e, orientation: r = "horizontal", decorative: a = !0, ...m }, n) => /* @__PURE__ */ p(
    o,
    {
      ref: n,
      decorative: a,
      orientation: r,
      className: l(
        "zen-shrink-0 zen-bg-zen-border",
        r === "horizontal" ? "zen-h-px zen-w-full" : "zen-h-full zen-w-px",
        e
      ),
      ...m
    }
  )
);
z.displayName = o.displayName;
export {
  z as Separator
};
//# sourceMappingURL=index58.js.map
