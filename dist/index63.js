import { jsxs as d, jsx as r } from "react/jsx-runtime";
import * as a from "react";
import { Root as z, Viewport as i, Corner as m, ScrollAreaScrollbar as s, ScrollAreaThumb as f } from "./index166.js";
import { cn as t } from "./index145.js";
const p = a.forwardRef(({ className: l, children: e, ...n }, o) => /* @__PURE__ */ d(
  z,
  {
    ref: o,
    className: t("zen-relative zen-overflow-hidden", l),
    ...n,
    children: [
      /* @__PURE__ */ r(i, { className: "zen-h-full zen-w-full zen-rounded-[inherit]", children: e }),
      /* @__PURE__ */ r(c, {}),
      /* @__PURE__ */ r(m, {})
    ]
  }
));
p.displayName = z.displayName;
const c = a.forwardRef(({ className: l, orientation: e = "vertical", ...n }, o) => /* @__PURE__ */ r(
  s,
  {
    ref: o,
    orientation: e,
    className: t(
      "zen-flex zen-touch-none zen-select-none zen-transition-colors",
      e === "vertical" && "zen-h-full zen-w-2.5 zen-border-l zen-border-l-transparent zen-p-px",
      e === "horizontal" && "zen-h-2.5 zen-flex-col zen-border-t zen-border-t-transparent zen-p-px",
      l
    ),
    ...n,
    children: /* @__PURE__ */ r(f, { className: "zen-relative zen-flex-1 zen-rounded-zen-full zen-bg-zen-border" })
  }
));
c.displayName = s.displayName;
export {
  p as ScrollArea,
  c as ScrollBar
};
//# sourceMappingURL=index63.js.map
