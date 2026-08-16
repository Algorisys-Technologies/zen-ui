import { jsxs as r, jsx as t, Fragment as H } from "react/jsx-runtime";
import * as v from "react";
import { cn as z } from "./index145.js";
import "./index25.js";
import { planningRange as O, planningColumns as X, nowPct as F, placeAppointment as K, layoutLanes as q, shiftPlanningAnchor as w, planningRangeLabel as G, formatTimeRange as N } from "./index185.js";
import "./index100.js";
import { Button as o } from "./index65.js";
import { Icon as c } from "./index57.js";
const J = {
  default: "zen-bg-zen-muted zen-text-zen-foreground zen-border-zen-border",
  info: "zen-bg-zen-info-soft zen-text-zen-info zen-border-zen-info/40",
  success: "zen-bg-zen-success-soft zen-text-zen-success zen-border-zen-success/40",
  warning: "zen-bg-zen-warning-soft zen-text-zen-warning zen-border-zen-warning/40",
  error: "zen-bg-zen-error-soft zen-text-zen-error zen-border-zen-error/40"
}, Q = { day: "Day", week: "Week", month: "Month" }, U = ["day", "week", "month"], p = 30, Y = 3, ie = ({
  rows: y,
  defaultView: C,
  view: u,
  onViewChange: I,
  views: L,
  defaultDate: S,
  date: f,
  onDateChange: T,
  onAppointmentClick: b,
  now: $,
  hideToolbar: D,
  emptyMessage: P,
  className: _
}) => {
  const [E, V] = v.useState(C ?? "week"), [W, A] = v.useState(S ?? /* @__PURE__ */ new Date()), i = u ?? E, s = f ?? W, l = $ ?? /* @__PURE__ */ new Date(), R = (e) => {
    u === void 0 && V(e), I?.(e);
  }, d = (e) => {
    f === void 0 && A(e), T?.(e);
  }, x = O(i, s), h = X(i, s, { now: l }), g = F(x, l), m = (y ?? []).map((e) => {
    const n = e.appointments.map((a) => ({ appointment: a, placement: K(a, x) })).filter(
      (a) => a.placement !== null
    ), { lanes: B, laneCount: M } = q(n.map((a) => a.appointment));
    return {
      row: e,
      blocks: n.map((a, j) => ({ ...a, lane: B[j] })),
      laneCount: Math.max(M, 1)
    };
  });
  return (
    /* w-full, because the grid is a chart: shrink-wrapped to its content it
       reports a 490px week whose columns are too narrow to read, and the caller
       cannot fix that from outside without knowing the internals. */
    /* @__PURE__ */ r("div", { className: z("zen-flex zen-w-full zen-flex-col zen-gap-3", _), children: [
      !D && m.length > 0 && /* @__PURE__ */ r("div", { className: "zen-flex zen-flex-wrap zen-items-center zen-gap-2", children: [
        /* @__PURE__ */ t(
          o,
          {
            variant: "outline",
            size: "sm",
            "aria-label": "Previous",
            onClick: () => d(w(i, s, -1)),
            children: /* @__PURE__ */ t(c, { name: "chevron-left", size: 14, className: "rtl:zen-rotate-180" })
          }
        ),
        /* @__PURE__ */ t(o, { variant: "outline", size: "sm", onClick: () => d(l), children: "Today" }),
        /* @__PURE__ */ t(
          o,
          {
            variant: "outline",
            size: "sm",
            "aria-label": "Next",
            onClick: () => d(w(i, s, 1)),
            children: /* @__PURE__ */ t(c, { name: "chevron-right", size: 14, className: "rtl:zen-rotate-180" })
          }
        ),
        /* @__PURE__ */ t("span", { className: "zen-mx-1 zen-text-sm zen-font-medium zen-text-zen-foreground", children: G(i, s) }),
        /* @__PURE__ */ t("div", { className: "zen-ms-auto zen-flex zen-gap-1", role: "group", "aria-label": "View", children: (L ?? U).map((e) => /* @__PURE__ */ t(
          o,
          {
            variant: i === e ? "solid" : "outline",
            size: "sm",
            "aria-pressed": i === e,
            onClick: () => R(e),
            children: Q[e]
          },
          e
        )) })
      ] }),
      m.length === 0 ? /* @__PURE__ */ t("p", { className: "zen-m-0 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg", children: P ?? "No resources" }) : (
        /* One horizontal scroller holding the header and every row, so the time
           axis and the blocks under it cannot scroll out of alignment — the
           failure you get from scrolling them as two panes. */
        /* @__PURE__ */ t("div", { className: "zen-overflow-x-auto zen-rounded-zen-md zen-border zen-border-zen-border", children: /* @__PURE__ */ r("div", { className: "zen-min-w-[45rem]", children: [
          /* @__PURE__ */ r("div", { className: "zen-flex zen-border-b zen-border-zen-border zen-bg-zen-muted/30", children: [
            /* @__PURE__ */ t("div", { className: "zen-w-40 zen-shrink-0 zen-border-e zen-border-zen-border zen-px-3 zen-py-2 zen-text-xs zen-font-semibold zen-text-zen-muted-fg", children: "Resource" }),
            /* @__PURE__ */ t("div", { className: "zen-flex zen-flex-1", children: h.map((e) => /* @__PURE__ */ r(
              "div",
              {
                className: z(
                  "zen-flex-1 zen-border-e zen-border-zen-border zen-px-1 zen-py-2 zen-text-center last:zen-border-e-0",
                  e.nonWorking && "zen-bg-zen-muted/40",
                  e.today && "zen-bg-zen-primary-soft"
                ),
                children: [
                  /* @__PURE__ */ t("div", { className: "zen-text-xs zen-font-medium zen-text-zen-foreground", children: e.label }),
                  e.sublabel && /* @__PURE__ */ t("div", { className: "zen-text-[10px] zen-text-zen-muted-fg", children: e.sublabel })
                ]
              },
              e.start.getTime()
            )) })
          ] }),
          m.map((e) => /* @__PURE__ */ r(
            "div",
            {
              className: "zen-flex zen-border-b zen-border-zen-border last:zen-border-b-0",
              children: [
                /* @__PURE__ */ r("div", { className: "zen-w-40 zen-shrink-0 zen-border-e zen-border-zen-border zen-px-3 zen-py-2", children: [
                  /* @__PURE__ */ t("div", { className: "zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground", children: e.row.title }),
                  e.row.subtitle && /* @__PURE__ */ t("div", { className: "zen-truncate zen-text-xs zen-text-zen-muted-fg", children: e.row.subtitle })
                ] }),
                /* @__PURE__ */ r(
                  "div",
                  {
                    className: "zen-relative zen-flex-1",
                    style: { minHeight: `${e.laneCount * p + 8}px` },
                    children: [
                      /* @__PURE__ */ t("div", { "aria-hidden": "true", className: "zen-absolute zen-inset-0 zen-flex", children: h.map((n) => /* @__PURE__ */ t(
                        "div",
                        {
                          className: z(
                            "zen-flex-1 zen-border-e zen-border-zen-border last:zen-border-e-0",
                            n.nonWorking && "zen-bg-zen-muted/30",
                            n.today && "zen-bg-zen-primary-soft/40"
                          )
                        },
                        n.start.getTime()
                      )) }),
                      g !== null && /* @__PURE__ */ t(
                        "div",
                        {
                          "aria-hidden": "true",
                          className: "zen-absolute zen-top-0 zen-bottom-0 zen-w-px zen-bg-zen-error",
                          style: { insetInlineStart: `${g}%` }
                        }
                      ),
                      e.blocks.map((n) => /* @__PURE__ */ r(
                        "button",
                        {
                          type: "button",
                          onClick: () => b?.(n.appointment, e.row),
                          className: z(
                            "zen-absolute zen-flex zen-items-center zen-gap-1 zen-overflow-hidden zen-rounded-zen-sm zen-border zen-px-1.5 zen-text-start zen-text-xs",
                            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                            J[n.appointment.state ?? "default"],
                            /* Square off the cut edge so a block continuing past the
                               view does not look like it ends there. */
                            n.placement.clippedStart && "zen-rounded-s-none zen-border-s-0",
                            n.placement.clippedEnd && "zen-rounded-e-none zen-border-e-0",
                            b && "hover:zen-brightness-95"
                          ),
                          style: {
                            insetInlineStart: `${n.placement.startPct}%`,
                            width: `${n.placement.widthPct}%`,
                            top: `${n.lane * p + 4}px`,
                            height: `${p - 6}px`
                          },
                          title: `${n.appointment.title} · ${N(n.appointment.start, n.appointment.end)}`,
                          children: [
                            /* @__PURE__ */ t("span", { className: "zen-sr-only", children: N(n.appointment.start, n.appointment.end) }),
                            n.placement.widthPct >= Y && /* @__PURE__ */ r(H, { children: [
                              n.appointment.icon && /* @__PURE__ */ t(c, { name: n.appointment.icon, size: 12, className: "zen-shrink-0" }),
                              /* @__PURE__ */ t("span", { className: "zen-truncate zen-font-medium", children: n.appointment.title }),
                              n.appointment.subtitle && /* @__PURE__ */ t("span", { className: "zen-truncate zen-opacity-70", children: n.appointment.subtitle })
                            ] })
                          ]
                        },
                        n.appointment.id
                      ))
                    ]
                  }
                )
              ]
            },
            e.row.id
          ))
        ] }) })
      )
    ] })
  );
};
export {
  ie as PlanningCalendar
};
//# sourceMappingURL=index98.js.map
