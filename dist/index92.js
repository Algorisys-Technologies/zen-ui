import { jsxs as r, jsx as e, Fragment as C } from "react/jsx-runtime";
import * as E from "react";
import { cardVariants as T } from "./index91.js";
import { Icon as D } from "./index63.js";
import { Skeleton as f } from "./index68.js";
import { useLocale as L } from "./index90.js";
import { cn as a } from "./index160.js";
const x = {
  primary: "zen-text-zen-primary",
  neutral: "zen-text-zen-muted-fg",
  info: "zen-text-zen-info",
  success: "zen-text-zen-success",
  warning: "zen-text-zen-warning-text",
  error: "zen-text-zen-error"
}, j = {
  up: "success",
  down: "error",
  flat: "neutral"
}, O = { up: "arrow-up", down: "arrow-down", flat: "arrow-right" }, S = { up: "statCard.trendingUp", down: "statCard.trendingDown", flat: "statCard.flat" }, _ = E.forwardRef(
  ({ label: p, value: h, icon: z, description: d, color: g = "neutral", trend: n, onClick: s, href: i, loading: t, chart: m, size: w, className: N, ...v }, o) => {
    const b = L(), y = !!(i || s), R = a(
      // The surface is Card's, not a copy of it.
      T({ variant: "outlined", padding: "md" }),
      // A linked card would otherwise underline every word in it: zen-ui ships
      // no element reset (the preflight is opt-in), so an <a> keeps the
      // browser's text-decoration.
      "zen-block zen-w-full zen-text-start zen-no-underline",
      y && "zen-cursor-pointer zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      N
    ), u = /* @__PURE__ */ r("div", { className: "zen-flex zen-items-start zen-justify-between zen-gap-3", children: [
      /* @__PURE__ */ r("div", { className: "zen-flex zen-min-w-0 zen-flex-col zen-gap-1.5", children: [
        /* @__PURE__ */ e("span", { className: "zen-truncate zen-text-sm zen-text-zen-muted-fg", children: p }),
        t ? /* @__PURE__ */ e(f, { className: "zen-h-7 zen-w-24" }) : /* @__PURE__ */ e(
          "span",
          {
            className: a(
              w === "lg" ? "zen-text-4xl" : "zen-text-2xl",
              "zen-font-semibold zen-leading-none zen-text-zen-foreground"
            ),
            children: h
          }
        ),
        n && !t ? /* @__PURE__ */ r(
          "span",
          {
            className: a(
              "zen-inline-flex zen-items-center zen-gap-1 zen-text-xs",
              x[n.color ?? j[n.direction]]
            ),
            children: [
              /* @__PURE__ */ e(
                D,
                {
                  name: O[n.direction],
                  size: 13,
                  title: b.t(S[n.direction])
                }
              ),
              n.value
            ]
          }
        ) : null,
        d && !t ? /* @__PURE__ */ e("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: d }) : null
      ] }),
      z ? (
        // Bare: no tile, no chip, no rounded square. See the note above.
        /* @__PURE__ */ e("span", { "aria-hidden": !0, className: a("zen-shrink-0", x[g]), children: z })
      ) : null
    ] }), l = m ? /* @__PURE__ */ r(C, { children: [
      u,
      /* @__PURE__ */ e("div", { className: "zen-mt-3", "data-stat-chart": "", children: t ? /* @__PURE__ */ e(f, { className: "zen-h-12 zen-w-full" }) : m })
    ] }) : u, c = { className: R, "aria-busy": t || void 0, ...v };
    return i ? /* @__PURE__ */ e("a", { ref: o, href: i, ...c, children: l }) : s ? /* @__PURE__ */ e(
      "button",
      {
        ref: o,
        type: "button",
        onClick: s,
        ...c,
        children: l
      }
    ) : /* @__PURE__ */ e("div", { ref: o, ...c, children: l });
  }
);
_.displayName = "StatCard";
export {
  _ as StatCard
};
//# sourceMappingURL=index92.js.map
