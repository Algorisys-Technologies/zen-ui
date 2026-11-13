import { jsxs as u, jsx as r } from "react/jsx-runtime";
import * as m from "react";
import { productionProgress as $, segmentFill as F } from "./index128.js";
import { useLocale as j } from "./index90.js";
import { cn as l } from "./index197.js";
const M = m.forwardRef(
  ({ target: p, good: g, scrap: f, label: i, segments: o, size: b, hideText: h, className: N, ...w }, P) => {
    const a = j(), e = m.useMemo(() => $({ target: p, good: g, scrap: f }), [p, g, f]), t = (n) => new Intl.NumberFormat(a.locale).format(n), s = [a.t("productionProgress.goodOfTarget", { good: t(e.good), target: t(e.target) })];
    e.scrap > 0 && s.push(a.t("productionProgress.scrap", { scrap: t(e.scrap) })), e.over > 0 ? s.push(a.t("productionProgress.over", { over: t(e.over) })) : s.push(e.done ? a.t("productionProgress.done") : a.t("productionProgress.remaining", { remaining: t(e.remaining) }));
    const d = s.join(" · "), z = o?.size, c = o?.count, x = m.useMemo(
      () => z !== void 0 && c !== void 0 ? F(e.good, z, c) : [],
      [e.good, z, c]
    ), v = o ? a.t("productionProgress.segments", {
      full: t(x.filter((n) => n >= 1).length),
      count: t(o.count),
      unit: o.unit
    }) : "";
    return /* @__PURE__ */ u("div", { ref: P, className: l("zen-flex zen-w-full zen-flex-col zen-gap-1.5", N), ...w, children: [
      i ? /* @__PURE__ */ r("span", { className: "zen-text-sm zen-font-medium zen-text-zen-foreground", children: i }) : null,
      /* @__PURE__ */ u(
        "div",
        {
          role: "progressbar",
          "aria-label": i,
          "aria-valuemin": 0,
          "aria-valuemax": e.target,
          "aria-valuenow": Math.min(e.good, e.target),
          "aria-valuetext": o ? `${d}. ${v}` : d,
          className: l(
            "zen-relative zen-flex zen-w-full zen-overflow-hidden zen-rounded-zen-full zen-bg-zen-muted",
            b === "sm" ? "zen-h-1.5" : "zen-h-3"
          ),
          children: [
            e.good > 0 ? /* @__PURE__ */ r(
              "div",
              {
                "data-part": "good",
                className: l("zen-h-full", e.done ? "zen-bg-zen-success" : "zen-bg-zen-primary"),
                style: { width: `${e.goodFraction * 100}%`, minWidth: "2px" }
              }
            ) : null,
            e.scrap > 0 ? /* @__PURE__ */ r(
              "div",
              {
                "data-part": "scrap",
                className: "zen-h-full zen-bg-zen-error",
                style: { width: `${e.scrapFraction * 100}%`, minWidth: "2px" }
              }
            ) : null
          ]
        }
      ),
      h ? null : /* @__PURE__ */ r("span", { className: "zen-text-sm zen-tabular-nums zen-text-zen-foreground", children: d }),
      o ? /* @__PURE__ */ u("div", { className: "zen-flex zen-flex-col zen-gap-1", children: [
        /* @__PURE__ */ r("div", { className: "zen-flex zen-flex-wrap zen-gap-1", "aria-hidden": "true", children: x.map((n, y) => /* @__PURE__ */ r(
          "span",
          {
            "data-fill": n,
            className: l(
              "zen-relative zen-h-4 zen-w-4 zen-overflow-hidden zen-rounded-zen-sm zen-border zen-border-solid",
              n >= 1 ? "zen-border-zen-primary zen-bg-zen-primary" : "zen-border-zen-border zen-bg-zen-background"
            ),
            children: n > 0 && n < 1 ? /* @__PURE__ */ r("span", { className: "zen-absolute zen-inset-x-0 zen-bottom-0 zen-bg-zen-primary", style: { height: `${n * 100}%` } }) : null
          },
          y
        )) }),
        h ? null : /* @__PURE__ */ r("span", { className: "zen-text-xs zen-tabular-nums zen-text-zen-muted-fg", children: v })
      ] }) : null
    ] });
  }
);
M.displayName = "ProductionProgress";
export {
  M as ProductionProgress
};
//# sourceMappingURL=index127.js.map
