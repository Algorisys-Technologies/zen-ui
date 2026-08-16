import { jsxs as i, jsx as l } from "react/jsx-runtime";
import * as z from "react";
import { Root as p, Portal as d, Provider as m, Trigger as c, Content as o, Arrow as f } from "./index167.js";
import { cn as x } from "./index145.js";
const h = m, y = p, N = c, P = d, g = z.forwardRef(({ className: t, sideOffset: e = 6, arrow: n = !1, children: r, ...a }, s) => /* @__PURE__ */ i(
  o,
  {
    ref: s,
    sideOffset: e,
    className: x(
      "zen-z-50 zen-max-w-xs zen-px-2.5 zen-py-1.5",
      "zen-rounded-zen-md zen-bg-zen-neutral zen-text-xs zen-text-zen-neutral-fg",
      "zen-shadow-md",
      // Radix sets data-state="delayed-open" / "instant-open" / "closed".
      // Open uses a small transition; closed unmounts so we don't fade out.
      "zen-transition-opacity zen-duration-100 data-[state=closed]:zen-opacity-0",
      t
    ),
    ...a,
    children: [
      r,
      n ? /* @__PURE__ */ l(f, { className: "zen-fill-zen-neutral", width: 10, height: 5 }) : null
    ]
  }
));
g.displayName = o.displayName;
export {
  y as Tooltip,
  g as TooltipContent,
  P as TooltipPortal,
  h as TooltipProvider,
  N as TooltipTrigger
};
//# sourceMappingURL=index66.js.map
