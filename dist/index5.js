import { jsx as o } from "react/jsx-runtime";
import * as z from "react";
import { cn as i } from "./index145.js";
const a = z.forwardRef(
  ({ className: e, ...n }, r) => /* @__PURE__ */ o(
    "textarea",
    {
      ref: r,
      className: i(
        "zen-flex zen-min-h-20 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2 zen-text-sm",
        "placeholder:zen-text-zen-muted-fg",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        e
      ),
      ...n
    }
  )
);
a.displayName = "Textarea";
export {
  a as Textarea
};
//# sourceMappingURL=index5.js.map
