import { jsxs as l, jsx as e } from "react/jsx-runtime";
import * as N from "react";
import { cardVariants as b } from "./index81.js";
import { Icon as v } from "./index56.js";
import { Skeleton as y } from "./index61.js";
import { cn as z } from "./index143.js";
const d = {
  primary: "zen-text-zen-primary",
  neutral: "zen-text-zen-muted-fg",
  info: "zen-text-zen-info",
  success: "zen-text-zen-success",
  warning: "zen-text-zen-warning",
  error: "zen-text-zen-error"
}, T = {
  up: "success",
  down: "error",
  flat: "neutral"
}, R = { up: "arrow-up", down: "arrow-down", flat: "arrow-right" }, E = { up: "Trending up", down: "Trending down", flat: "Flat" }, j = N.forwardRef(
  ({ label: m, value: f, icon: c, description: u, color: p = "neutral", trend: n, onClick: r, href: s, loading: t, className: x, ...g }, a) => {
    const w = !!(s || r), h = z(
      // The surface is Card's, not a copy of it.
      b({ variant: "outlined", padding: "md" }),
      "zen-block zen-w-full zen-text-start",
      w && "zen-cursor-pointer zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      x
    ), i = /* @__PURE__ */ l("div", { className: "zen-flex zen-items-start zen-justify-between zen-gap-3", children: [
      /* @__PURE__ */ l("div", { className: "zen-flex zen-min-w-0 zen-flex-col zen-gap-1.5", children: [
        /* @__PURE__ */ e("span", { className: "zen-truncate zen-text-sm zen-text-zen-muted-fg", children: m }),
        t ? /* @__PURE__ */ e(y, { className: "zen-h-7 zen-w-24" }) : /* @__PURE__ */ e("span", { className: "zen-text-2xl zen-font-semibold zen-leading-none zen-text-zen-foreground", children: f }),
        n && !t ? /* @__PURE__ */ l(
          "span",
          {
            className: z(
              "zen-inline-flex zen-items-center zen-gap-1 zen-text-xs",
              d[n.color ?? T[n.direction]]
            ),
            children: [
              /* @__PURE__ */ e(
                v,
                {
                  name: R[n.direction],
                  size: 13,
                  title: E[n.direction]
                }
              ),
              n.value
            ]
          }
        ) : null,
        u && !t ? /* @__PURE__ */ e("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: u }) : null
      ] }),
      c ? (
        // Bare: no tile, no chip, no rounded square. See the note above.
        /* @__PURE__ */ e("span", { "aria-hidden": !0, className: z("zen-shrink-0", d[p]), children: c })
      ) : null
    ] }), o = { className: h, "aria-busy": t || void 0, ...g };
    return s ? /* @__PURE__ */ e("a", { ref: a, href: s, ...o, children: i }) : r ? /* @__PURE__ */ e(
      "button",
      {
        ref: a,
        type: "button",
        onClick: r,
        ...o,
        children: i
      }
    ) : /* @__PURE__ */ e("div", { ref: a, ...o, children: i });
  }
);
j.displayName = "StatCard";
export {
  j as StatCard
};
//# sourceMappingURL=index82.js.map
