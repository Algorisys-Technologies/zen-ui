import { jsx as r } from "react/jsx-runtime";
import * as z from "react";
import { cn as i } from "./index160.js";
const t = z.forwardRef(
  ({ className: e, ...n }, o) => /* @__PURE__ */ r(
    "textarea",
    {
      ref: o,
      className: i(
        "zen-flex zen-min-h-20 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-zen-control-x zen-py-2 zen-text-sm",
        "placeholder:zen-text-zen-muted-fg",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        e
      ),
      ...n
    }
  )
);
t.displayName = "Textarea";
export {
  t as Textarea
};
//# sourceMappingURL=index5.js.map
