import { jsxs as p, jsx as f } from "react/jsx-runtime";
import * as g from "react";
import { machineStateTone as u, machineStateMessageKey as m } from "./index116.js";
import { useLocale as c } from "./index90.js";
import { cn as z } from "./index197.js";
const b = {
  running: "zen-bg-zen-state-running-soft zen-text-zen-state-running-soft-fg",
  down: "zen-bg-zen-state-down-soft zen-text-zen-state-down-soft-fg",
  setup: "zen-bg-zen-state-setup-soft zen-text-zen-state-setup-soft-fg",
  planned: "zen-bg-zen-state-planned-soft zen-text-zen-state-planned-soft-fg",
  idle: "zen-bg-zen-state-idle-soft zen-text-zen-state-idle-soft-fg",
  unknown: "zen-bg-zen-state-unknown-soft zen-text-zen-state-unknown-soft-fg zen-border zen-border-dashed zen-border-zen-state-unknown"
}, w = {
  running: "zen-bg-zen-state-running",
  down: "zen-bg-zen-state-down",
  setup: "zen-bg-zen-state-setup",
  planned: "zen-bg-zen-state-planned",
  idle: "zen-bg-zen-state-idle",
  unknown: "zen-border zen-border-solid zen-border-zen-state-unknown"
}, x = {
  sm: { pill: "zen-gap-1 zen-px-1.5 zen-py-px zen-text-xs", dot: "zen-h-1.5 zen-w-1.5" },
  md: { pill: "zen-gap-1.5 zen-px-2 zen-py-0.5 zen-text-sm", dot: "zen-h-2 zen-w-2" }
}, h = g.forwardRef(
  ({ state: e, tone: s, size: o, className: a, children: d, ...r }, i) => {
    const l = c(), n = s ?? (e ? u(e) : "unknown"), t = x[o ?? "md"];
    return /* @__PURE__ */ p(
      "span",
      {
        ref: i,
        "data-tone": n,
        "data-state": e,
        className: z(
          "zen-inline-flex zen-items-center zen-whitespace-nowrap zen-rounded-zen-full zen-font-medium zen-leading-tight",
          t.pill,
          b[n],
          a
        ),
        ...r,
        children: [
          /* @__PURE__ */ f("span", { "aria-hidden": "true", className: z("zen-shrink-0 zen-rounded-zen-full", t.dot, w[n]) }),
          d ?? (e ? l.t(m(e)) : null)
        ]
      }
    );
  }
);
h.displayName = "StatePill";
export {
  h as StatePill
};
//# sourceMappingURL=index115.js.map
