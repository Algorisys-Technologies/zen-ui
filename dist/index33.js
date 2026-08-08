import { jsx as e } from "react/jsx-runtime";
import * as a from "react";
import { RadioGroup as i, Item as s, Indicator as t } from "./index153.js";
import { cn as z } from "./index143.js";
const l = a.forwardRef(({ className: n, ...r }, o) => /* @__PURE__ */ e(
  i,
  {
    ref: o,
    className: z("zen-grid zen-gap-2", n),
    ...r
  }
));
l.displayName = i.displayName;
const m = {
  sm: "zen-h-3.5 zen-w-3.5",
  md: "zen-h-4 zen-w-4",
  lg: "zen-h-5 zen-w-5"
}, c = a.forwardRef(({ className: n, size: r = "md", ...o }, d) => /* @__PURE__ */ e(
  s,
  {
    ref: d,
    className: z(
      "zen-aspect-square zen-rounded-zen-full zen-border zen-border-zen-border zen-text-zen-primary",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
      "data-[state=checked]:zen-border-zen-primary",
      m[r],
      n
    ),
    ...o,
    children: /* @__PURE__ */ e(t, { className: "zen-flex zen-items-center zen-justify-center", children: /* @__PURE__ */ e("span", { className: "zen-block zen-h-2 zen-w-2 zen-rounded-zen-full zen-bg-zen-primary" }) })
  }
));
c.displayName = s.displayName;
export {
  l as RadioGroup,
  c as RadioGroupItem
};
//# sourceMappingURL=index33.js.map
