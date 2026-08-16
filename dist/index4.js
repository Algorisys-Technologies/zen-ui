import { jsx as i } from "react/jsx-runtime";
import * as z from "react";
import { cn as t } from "./index145.js";
const s = z.forwardRef(
  ({ className: e, type: n, ...o }, r) => /* @__PURE__ */ i(
    "input",
    {
      type: n,
      ref: r,
      className: t(
        "zen-flex zen-h-10 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2 zen-text-sm",
        "placeholder:zen-text-zen-muted-fg",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        "file:zen-border-0 file:zen-bg-transparent file:zen-text-sm file:zen-font-medium",
        e
      ),
      ...o
    }
  )
);
s.displayName = "Input";
export {
  s as Input
};
//# sourceMappingURL=index4.js.map
