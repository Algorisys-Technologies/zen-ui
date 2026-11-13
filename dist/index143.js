import { jsxs as l, jsx as t, Fragment as F } from "react/jsx-runtime";
import * as y from "react";
import { capacityGrid as j } from "./index144.js";
import { useLocale as M } from "./index90.js";
import { cn as u } from "./index197.js";
const N = (n) => n.status === "over" || n.status === "no-capacity" || n.status === "closed" || n.load === null ? {} : {
  backgroundColor: `color-mix(in srgb, var(--zen-color-primary) ${Math.round(Math.min(1, n.load) * 26)}%, var(--zen-color-background))`
}, d = (n) => u(
  "zen-flex zen-h-full zen-min-h-14 zen-w-full zen-flex-col zen-justify-center zen-gap-0.5 zen-px-2 zen-py-1.5 zen-text-end zen-tabular-nums",
  n.status === "over" || n.status === "no-capacity" ? "zen-bg-zen-error-soft zen-text-zen-error-soft-fg zen-outline-solid zen-outline-2 -zen-outline-offset-2 zen-outline-zen-error" : n.status === "closed" ? "zen-bg-zen-muted zen-text-zen-foreground" : "zen-text-zen-foreground"
), $ = y.forwardRef(
  ({ rows: n, periods: r, cells: p, high: b, label: g, showTotals: v, onCellClick: f, className: k, ...C }, w) => {
    const a = M(), o = y.useMemo(() => j({ rows: n, periods: r, cells: p, high: b }), [n, r, p, b]), z = v !== !1, m = (e) => new Intl.NumberFormat(a.locale, { maximumFractionDigits: 1 }).format(e), T = (e) => new Intl.NumberFormat(a.locale, { style: "percent", maximumFractionDigits: 0 }).format(e), h = (e) => e.status === "no-capacity" ? a.t("capacity.noCapacity") : e.status === "closed" ? "—" : T(e.load), x = (e) => e.status === "no-capacity" ? a.t("capacity.booked", { booked: m(e.booked) }) : e.status === "closed" ? a.t("capacity.closed") : a.t("capacity.hours", { booked: m(e.booked), available: m(e.available) }), c = (e) => /* @__PURE__ */ l(F, { children: [
      /* @__PURE__ */ t("span", { className: "zen-text-sm zen-font-semibold", children: h(e) }),
      /* @__PURE__ */ t("span", { className: "zen-text-xs", children: x(e) })
    ] });
    return /* @__PURE__ */ l("div", { ref: w, className: u("zen-flex zen-w-full zen-flex-col zen-gap-2", k), ...C, children: [
      o.overCount > 0 && /* @__PURE__ */ t("p", { className: "zen-m-0 zen-text-sm zen-font-medium zen-text-zen-error", role: "status", children: a.t("capacity.overCount", { count: o.overCount }) }),
      /* @__PURE__ */ t("div", { className: "zen-w-full zen-overflow-x-auto", children: /* @__PURE__ */ l("table", { className: "zen-w-full zen-border-collapse zen-text-sm", children: [
        /* @__PURE__ */ t("caption", { className: "zen-sr-only", children: g ?? a.t("capacity.label") }),
        /* @__PURE__ */ t("thead", { children: /* @__PURE__ */ l("tr", { children: [
          /* @__PURE__ */ t("th", { scope: "col", className: "zen-px-2 zen-py-1.5 zen-text-start zen-font-medium zen-text-zen-muted-fg", children: a.t("capacity.resource") }),
          r.map((e) => /* @__PURE__ */ t("th", { scope: "col", className: "zen-px-2 zen-py-1.5 zen-text-end zen-font-medium zen-text-zen-muted-fg", children: e.label ?? e.id }, e.id)),
          z && /* @__PURE__ */ t("th", { scope: "col", className: "zen-px-2 zen-py-1.5 zen-text-end zen-font-semibold zen-text-zen-foreground", children: a.t("capacity.total") })
        ] }) }),
        /* @__PURE__ */ t("tbody", { children: n.map((e) => /* @__PURE__ */ l("tr", { className: "zen-border-0 zen-border-t zen-border-solid zen-border-zen-border", children: [
          /* @__PURE__ */ t(
            "th",
            {
              scope: "row",
              className: "zen-whitespace-nowrap zen-px-2 zen-py-1.5 zen-text-start zen-font-medium zen-text-zen-foreground",
              children: e.label ?? e.id
            }
          ),
          r.map((i) => {
            const s = o.cells[e.id][i.id];
            return /* @__PURE__ */ t("td", { className: "zen-p-0.5", "data-status": s.status, children: f ? /* @__PURE__ */ t(
              "button",
              {
                type: "button",
                className: u(
                  d(s),
                  "zen-m-0 zen-cursor-pointer zen-rounded-zen-sm zen-border-0 hover:zen-brightness-95 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
                ),
                style: N(s),
                "aria-label": a.t("capacity.cell", {
                  row: e.label ?? e.id,
                  period: i.label ?? i.id,
                  value: `${h(s)}, ${x(s)}`
                }),
                onClick: () => f(e.id, i.id, s),
                children: c(s)
              }
            ) : /* @__PURE__ */ t("div", { className: d(s), style: N(s), children: c(s) }) }, i.id);
          }),
          z && /* @__PURE__ */ t("td", { className: "zen-p-0.5 zen-font-semibold", "data-status": o.rowTotals[e.id]?.status, children: /* @__PURE__ */ t("div", { className: d(o.rowTotals[e.id]), children: c(o.rowTotals[e.id]) }) })
        ] }, e.id)) }),
        z && /* @__PURE__ */ t("tfoot", { children: /* @__PURE__ */ l("tr", { className: "zen-border-0 zen-border-t-2 zen-border-solid zen-border-zen-border", children: [
          /* @__PURE__ */ t("th", { scope: "row", className: "zen-px-2 zen-py-1.5 zen-text-start zen-font-semibold zen-text-zen-foreground", children: a.t("capacity.total") }),
          r.map((e) => /* @__PURE__ */ t("td", { className: "zen-p-0.5", "data-status": o.periodTotals[e.id]?.status, children: /* @__PURE__ */ t("div", { className: d(o.periodTotals[e.id]), children: c(o.periodTotals[e.id]) }) }, e.id)),
          /* @__PURE__ */ t("td", { className: "zen-p-0.5", "data-status": o.total.status, children: /* @__PURE__ */ t("div", { className: d(o.total), children: c(o.total) }) })
        ] }) })
      ] }) })
    ] });
  }
);
$.displayName = "CapacityHeatmap";
export {
  $ as CapacityHeatmap
};
//# sourceMappingURL=index143.js.map
