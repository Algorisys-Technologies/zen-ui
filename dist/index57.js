import { jsx as l } from "react/jsx-runtime";
import * as c from "react";
import { ZEN_ICONS as n } from "./index143.js";
import { ZEN_ICON_NAMES as k } from "./index143.js";
import { cn as m } from "./index145.js";
const s = (r) => r.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"), p = c.forwardRef(
  ({ name: r, size: e = 16, title: o, className: i, ...a }, t) => /* @__PURE__ */ l(
    "svg",
    {
      ref: t,
      width: e,
      height: e,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className: m("zen-inline-block zen-shrink-0", i),
      role: o ? "img" : void 0,
      "aria-hidden": o ? void 0 : !0,
      "aria-label": o,
      dangerouslySetInnerHTML: {
        __html: o ? `<title>${s(o)}</title>${n[r]}` : n[r]
      },
      ...a
    }
  )
);
p.displayName = "Icon";
export {
  p as Icon,
  k as ZEN_ICON_NAMES
};
//# sourceMappingURL=index57.js.map
