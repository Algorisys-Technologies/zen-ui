import { jsx as z } from "react/jsx-runtime";
import * as i from "react";
import { cn as t } from "./index197.js";
const l = i.forwardRef(
  ({ className: e, type: n, ...r }, o) => /* @__PURE__ */ z(
    "input",
    {
      type: n,
      ref: o,
      className: t(
        "zen-flex zen-h-zen-control zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-zen-control-x zen-py-2 zen-text-sm",
        "placeholder:zen-text-zen-muted-fg",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        // Marked invalid by the form (aria-invalid="true"): the error border,
        // as Select and Combobox show theirs.
        "aria-[invalid=true]:zen-border-zen-error",
        "file:zen-border-0 file:zen-bg-transparent file:zen-text-sm file:zen-font-medium",
        e
      ),
      ...r
    }
  )
);
l.displayName = "Input";
export {
  l as Input
};
//# sourceMappingURL=index4.js.map
