import { jsx as i } from "react/jsx-runtime";
import * as s from "react";
import { cn as t } from "./index145.js";
const a = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e")`, c = s.forwardRef(
  ({ className: e, style: n, ...o }, r) => /* @__PURE__ */ i(
    "select",
    {
      ref: r,
      className: t(
        // Everything Input has except the width.
        "zen-h-10 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2 zen-text-sm",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        // The platform arrow is drawn in the OS's colours and ignores the
        // theme, so it is suppressed and redrawn as the background chevron.
        "zen-appearance-none zen-pe-9",
        e
      ),
      style: {
        backgroundImage: a,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.75rem center",
        backgroundSize: "1rem",
        ...n
      },
      ...o
    }
  )
);
c.displayName = "NativeSelect";
export {
  c as NativeSelect
};
//# sourceMappingURL=index7.js.map
