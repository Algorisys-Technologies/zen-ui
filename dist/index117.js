import { jsxs as s, jsx as n } from "react/jsx-runtime";
import * as D from "react";
import { arcPath as c } from "./index185.js";
import { oeeBand as _, DEFAULT_OEE_BANDS as k, gaugeAngle as z } from "./index118.js";
import { useLocale as w } from "./index90.js";
import { cn as E } from "./index197.js";
const p = {
  poor: "var(--zen-color-error)",
  fair: "var(--zen-color-warning)",
  good: "var(--zen-color-success)"
}, B = {
  poor: "oee.band.poor",
  fair: "oee.band.fair",
  good: "oee.band.good"
}, C = {
  sm: "zen-w-28",
  md: "zen-w-44",
  lg: "zen-w-60"
}, d = 60, m = 62, g = 52, h = 38, R = 57.5, I = 55.5, M = D.forwardRef(
  ({ value: a, factors: r, bands: x, label: v, size: N, className: y, ...O }, T) => {
    const t = w(), o = x ?? k, l = _(a, o), i = v ?? t.t("oee.label"), f = (e) => new Intl.NumberFormat(t.locale, { style: "percent", maximumFractionDigits: 1 }).format(e), u = a === null ? "—" : f(a), b = l ? t.t(B[l]) : t.t("oee.noData"), A = [
      { band: "poor", from: 0, to: o.fair },
      { band: "fair", from: o.fair, to: o.good },
      { band: "good", from: o.good, to: 1 }
    ];
    return /* @__PURE__ */ s(
      "div",
      {
        ref: T,
        role: "meter",
        "aria-label": i,
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuenow": a === null ? void 0 : Math.min(100, Math.max(0, Math.round(a * 1e3) / 10)),
        "aria-valuetext": a === null ? t.t("oee.valueTextNoData", { label: i }) : t.t("oee.valueText", { label: i, value: u, band: b }),
        "data-band": l ?? "none",
        className: E("zen-inline-flex zen-flex-col zen-items-center zen-gap-1", C[N ?? "md"], y),
        ...O,
        children: [
          /* @__PURE__ */ n("span", { className: "zen-text-sm zen-font-medium zen-text-zen-muted-fg", children: i }),
          /* @__PURE__ */ s("svg", { viewBox: "0 0 120 66", className: "zen-block zen-w-full", "aria-hidden": "true", children: [
            A.map((e) => /* @__PURE__ */ n(
              "path",
              {
                d: c(d, m, R, I, z(e.from), z(e.to)),
                style: { fill: p[e.band] }
              },
              e.band
            )),
            /* @__PURE__ */ n("path", { d: c(d, m, g, h, -90, 90), style: { fill: "var(--zen-color-muted)" } }),
            a !== null && a > 0 && l ? /* @__PURE__ */ n(
              "path",
              {
                d: c(d, m, g, h, -90, z(a)),
                style: { fill: p[l] }
              }
            ) : null,
            /* @__PURE__ */ n(
              "text",
              {
                x: d,
                y: m - 4,
                textAnchor: "middle",
                style: { fill: "var(--zen-color-foreground)", fontSize: "17px", fontWeight: 600 },
                children: u
              }
            )
          ] }),
          /* @__PURE__ */ n("span", { className: "zen-text-sm zen-text-zen-foreground", children: b }),
          r ? /* @__PURE__ */ n("dl", { className: "zen-mt-2 zen-grid zen-w-full zen-gap-1.5 zen-text-xs", children: [
            { key: "oee.availability", v: r.availability },
            { key: "oee.performance", v: r.performance },
            { key: "oee.quality", v: r.quality }
          ].map((e) => (
            // A <div> in a <dl> may hold only <dt> and <dd>, so the bar
            // lives inside the <dd>, positioned under the whole row.
            /* @__PURE__ */ s("div", { className: "zen-relative zen-flex zen-items-center zen-justify-between zen-gap-2 zen-pb-2", children: [
              /* @__PURE__ */ n("dt", { className: "zen-text-zen-muted-fg", children: t.t(e.key) }),
              /* @__PURE__ */ s("dd", { className: "zen-m-0 zen-font-medium zen-tabular-nums", children: [
                e.v === null ? "—" : f(e.v),
                /* @__PURE__ */ n(
                  "span",
                  {
                    className: "zen-absolute zen-bottom-0 zen-left-0 zen-right-0 zen-h-1 zen-rounded-zen-full zen-bg-zen-muted",
                    "aria-hidden": "true",
                    children: e.v !== null && e.v > 0 ? /* @__PURE__ */ n(
                      "span",
                      {
                        className: "zen-block zen-h-full zen-rounded-zen-full zen-bg-zen-foreground",
                        style: { width: `${Math.min(1, e.v) * 100}%` }
                      }
                    ) : null
                  }
                )
              ] })
            ] }, e.key)
          )) }) : null
        ]
      }
    );
  }
);
M.displayName = "OeeGauge";
export {
  M as OeeGauge
};
//# sourceMappingURL=index117.js.map
