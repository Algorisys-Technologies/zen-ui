import { jsx as i } from "react/jsx-runtime";
import * as a from "react";
import { Root as c, Content as t, Trigger as s } from "./index173.js";
import { cn as r } from "./index143.js";
const b = c, d = a.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ i(
  s,
  {
    ref: o,
    className: r(
      "zen-bg-transparent zen-border-0 zen-p-0 zen-text-inherit zen-cursor-pointer",
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2 zen-rounded-zen-sm",
      e
    ),
    ...n
  }
));
d.displayName = s.displayName;
const p = a.forwardRef(({ className: e, style: n, ...o }, l) => /* @__PURE__ */ i(
  t,
  {
    ref: l,
    style: {
      "--zen-collapsible-content-height": "var(--radix-collapsible-content-height)",
      ...n
    },
    className: r(
      "zen-overflow-hidden zen-text-sm",
      "data-[state=closed]:zen-anim-accordion-up data-[state=open]:zen-anim-accordion-down",
      e
    ),
    ...o
  }
));
p.displayName = t.displayName;
export {
  b as Collapsible,
  p as CollapsibleContent,
  d as CollapsibleTrigger
};
//# sourceMappingURL=index85.js.map
