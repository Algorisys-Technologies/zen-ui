import { jsxs as r, jsx as a, Fragment as S } from "react/jsx-runtime";
import * as z from "react";
import { plannedVsActual as q, planAt as B } from "./index138.js";
import { timelineTicks as X } from "./index120.js";
import { useLocale as Y } from "./index90.js";
import { cn as v } from "./index197.js";
const G = z.forwardRef(
  ({ start: V, end: j, now: g, plan: m, planTotal: f, actual: u, unit: b, tolerance: w, timeZone: p, hideChart: D, className: M, ...E }, I) => {
    const l = Y(), [T, N] = z.useState(() => Date.now()), k = g === void 0;
    z.useEffect(() => {
      if (!k) return;
      N(Date.now());
      const e = setInterval(() => N(Date.now()), 3e4);
      return () => clearInterval(e);
    }, [k]);
    const n = +V, s = +j, y = +(g ?? T), t = z.useMemo(
      () => q({ start: n, end: s, now: y, plan: m, planTotal: f, actual: u, tolerance: w }),
      [n, s, y, m, f, u, w]
    ), A = (e) => new Intl.NumberFormat(l.locale, { maximumFractionDigits: 0 }).format(e), c = (e) => b ? `${A(e)} ${b}` : A(e), W = t.status === "on" ? l.t("plannedVsActual.on") : l.t(t.status === "behind" ? "plannedVsActual.behind" : "plannedVsActual.ahead", { count: c(Math.abs(t.gap)) });
    let h;
    if (t.final)
      h = l.t("plannedVsActual.final", { actual: c(t.actualNow), total: c(t.planTotal) });
    else {
      const e = l.t("plannedVsActual.made", { actual: c(t.actualNow), plan: c(t.planNow) });
      h = t.projected === null ? e : `${e}. ${l.t("plannedVsActual.projection", { projected: c(t.projected), total: c(t.planTotal) })}`;
    }
    const o = (e) => s > n ? (e - n) / (s - n) * 100 : 0, F = Math.max(t.planTotal, ...u.map((e) => e.value), t.projected ?? 0, 1) * 1.08, i = (e) => 100 - e / F * 100, $ = m ?? [{ at: n, value: 0 }, { at: s, value: f ?? 0 }], P = [n, ...$.map((e) => +e.at).filter((e) => e > n && e < s), s].sort((e, d) => e - d).map((e, d) => `${d ? "L" : "M"}${o(e)} ${i(B($, e))}`).join(" "), R = u.map((e) => ({ t: +e.at, v: e.value })).filter((e) => e.t >= n && e.t <= t.at).sort((e, d) => e.t - d.t);
    let x = `M${o(n)} ${i(0)}`;
    for (const e of R) x += ` H${o(e.t)} V${i(e.v)}`;
    x += ` H${o(t.at)}`;
    const C = z.useMemo(() => X(n, s, { timeZone: p, maxTicks: 6 }), [n, s, p]), H = (e) => new Intl.DateTimeFormat(l.locale, { hour: "2-digit", minute: "2-digit", timeZone: p }).format(e), L = t.status === "behind" ? "zen-text-zen-error" : t.status === "ahead" ? "zen-text-zen-success-soft-fg" : "zen-text-zen-foreground";
    return /* @__PURE__ */ r("div", { ref: I, className: v("zen-flex zen-w-full zen-flex-col zen-gap-3", M), "data-status": t.status, ...E, children: [
      /* @__PURE__ */ r("div", { className: "zen-flex zen-flex-col zen-gap-0.5", children: [
        /* @__PURE__ */ a("span", { className: v("zen-text-2xl zen-font-bold zen-tabular-nums zen-leading-tight", L), children: W }),
        /* @__PURE__ */ a("span", { className: "zen-text-sm zen-tabular-nums zen-text-zen-foreground", children: h })
      ] }),
      D ? null : /* @__PURE__ */ r("div", { className: "zen-flex zen-flex-col zen-gap-1", "aria-hidden": "true", children: [
        /* @__PURE__ */ r("div", { className: "zen-flex zen-gap-4 zen-text-xs zen-text-zen-muted-fg", children: [
          /* @__PURE__ */ r("span", { className: "zen-inline-flex zen-items-center zen-gap-1.5", children: [
            /* @__PURE__ */ a("svg", { width: "18", height: "6", className: "zen-overflow-visible", children: /* @__PURE__ */ a("line", { x1: "0", y1: "3", x2: "18", y2: "3", stroke: "currentColor", strokeWidth: "2", strokeDasharray: "4 3" }) }),
            l.t("plannedVsActual.plan")
          ] }),
          /* @__PURE__ */ r("span", { className: "zen-inline-flex zen-items-center zen-gap-1.5", children: [
            /* @__PURE__ */ a("span", { className: "zen-h-0.5 zen-w-4 zen-bg-zen-primary" }),
            l.t("plannedVsActual.actual")
          ] })
        ] }),
        /* @__PURE__ */ a("div", { className: "zen-relative zen-h-40 zen-w-full zen-border-0 zen-border-b zen-border-s zen-border-solid zen-border-zen-border", children: /* @__PURE__ */ r("svg", { viewBox: "0 0 100 100", preserveAspectRatio: "none", className: "zen-absolute zen-inset-0 zen-h-full zen-w-full zen-overflow-visible rtl:-zen-scale-x-100", children: [
          /* @__PURE__ */ a("path", { d: P, fill: "none", stroke: "var(--zen-color-muted-fg)", strokeWidth: "2", strokeDasharray: "6 4", vectorEffect: "non-scaling-stroke" }),
          /* @__PURE__ */ a("path", { d: x, fill: "none", stroke: "var(--zen-color-primary)", strokeWidth: "2.5", vectorEffect: "non-scaling-stroke" }),
          !t.final && t.at > n ? /* @__PURE__ */ r(S, { children: [
            /* @__PURE__ */ a("line", { x1: o(t.at), x2: o(t.at), y1: "0", y2: "100", stroke: "var(--zen-color-border)", strokeWidth: "1", vectorEffect: "non-scaling-stroke" }),
            /* @__PURE__ */ a(
              "line",
              {
                "data-part": "gap",
                x1: o(t.at),
                x2: o(t.at),
                y1: i(t.actualNow),
                y2: i(t.planNow),
                stroke: t.status === "behind" ? "var(--zen-color-error)" : t.status === "ahead" ? "var(--zen-color-success)" : "var(--zen-color-muted-fg)",
                strokeWidth: "4",
                vectorEffect: "non-scaling-stroke"
              }
            )
          ] }) : null
        ] }) }),
        /* @__PURE__ */ a("div", { className: "zen-relative zen-h-4 zen-text-xs zen-tabular-nums zen-text-zen-muted-fg", children: C.ticks.map((e) => /* @__PURE__ */ a(
          "span",
          {
            className: v(
              "zen-absolute zen-top-0 zen-whitespace-nowrap",
              e.left < 0.04 ? "" : e.left > 0.96 ? "-zen-translate-x-full rtl:zen-translate-x-full" : "-zen-translate-x-1/2 rtl:zen-translate-x-1/2"
            ),
            style: { insetInlineStart: `${e.left * 100}%` },
            children: H(e.at)
          },
          e.at
        )) })
      ] })
    ] });
  }
);
G.displayName = "PlannedVsActual";
export {
  G as PlannedVsActual
};
//# sourceMappingURL=index137.js.map
