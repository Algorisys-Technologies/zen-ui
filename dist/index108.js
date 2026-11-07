import { jsxs as a, jsx as t, Fragment as O } from "react/jsx-runtime";
import * as w from "react";
import { cn as o } from "./index160.js";
import "./index28.js";
import { planningRange as X, planningColumns as F, nowPct as K, placeAppointment as q, layoutLanes as G, shiftPlanningAnchor as N, planningRangeLabel as J, formatTimeRange as C } from "./index215.js";
import "./index110.js";
import { Button as l } from "./index71.js";
import { Icon as p } from "./index63.js";
import { useLocale as Q } from "./index90.js";
const U = {
  default: "zen-bg-zen-muted zen-text-zen-foreground zen-border-zen-border",
  info: "zen-bg-zen-info-soft zen-text-zen-info zen-border-zen-info/40",
  success: "zen-bg-zen-success-soft zen-text-zen-success zen-border-zen-success/40",
  warning: "zen-bg-zen-warning-soft zen-text-zen-warning zen-border-zen-warning/40",
  error: "zen-bg-zen-error-soft zen-text-zen-error zen-border-zen-error/40"
}, Y = {
  day: "planningCalendar.views.day",
  week: "planningCalendar.views.week",
  month: "planningCalendar.views.month"
}, Z = ["day", "week", "month"], u = 30, k = 3, oe = ({
  rows: y,
  defaultView: L,
  view: g,
  onViewChange: I,
  views: S,
  defaultDate: $,
  date: f,
  onDateChange: T,
  onAppointmentClick: b,
  now: _,
  hideToolbar: D,
  emptyMessage: E,
  className: P
}) => {
  const i = Q(), [A, R] = w.useState(L ?? "week"), [V, W] = w.useState($ ?? /* @__PURE__ */ new Date()), s = g ?? A, z = f ?? V, d = _ ?? /* @__PURE__ */ new Date(), B = (e) => {
    g === void 0 && R(e), I?.(e);
  }, m = (e) => {
    f === void 0 && W(e), T?.(e);
  }, x = X(s, z), h = F(s, z, { now: d }), v = K(x, d), c = (y ?? []).map((e) => {
    const n = e.appointments.map((r) => ({ appointment: r, placement: q(r, x) })).filter(
      (r) => r.placement !== null
    ), { lanes: j, laneCount: H } = G(n.map((r) => r.appointment));
    return {
      row: e,
      blocks: n.map((r, M) => ({ ...r, lane: j[M] })),
      laneCount: Math.max(H, 1)
    };
  });
  return (
    /* w-full, because the grid is a chart: shrink-wrapped to its content it
       reports a 490px week whose columns are too narrow to read, and the caller
       cannot fix that from outside without knowing the internals. */
    /* @__PURE__ */ a("div", { className: o("zen-flex zen-w-full zen-flex-col zen-gap-3", P), children: [
      !D && c.length > 0 && /* @__PURE__ */ a("div", { className: "zen-flex zen-flex-wrap zen-items-center zen-gap-2", children: [
        /* @__PURE__ */ t(
          l,
          {
            variant: "outline",
            size: "sm",
            "aria-label": i.t("planningCalendar.previous"),
            onClick: () => m(N(s, z, -1)),
            children: /* @__PURE__ */ t(p, { name: "chevron-left", size: 14, className: "rtl:zen-rotate-180" })
          }
        ),
        /* @__PURE__ */ t(l, { variant: "outline", size: "sm", onClick: () => m(d), children: i.t("planningCalendar.today") }),
        /* @__PURE__ */ t(
          l,
          {
            variant: "outline",
            size: "sm",
            "aria-label": i.t("planningCalendar.next"),
            onClick: () => m(N(s, z, 1)),
            children: /* @__PURE__ */ t(p, { name: "chevron-right", size: 14, className: "rtl:zen-rotate-180" })
          }
        ),
        /* @__PURE__ */ t("span", { className: "zen-mx-1 zen-text-sm zen-font-medium zen-text-zen-foreground", children: J(s, z) }),
        /* @__PURE__ */ t("div", { className: "zen-ms-auto zen-flex zen-gap-1", role: "group", "aria-label": i.t("planningCalendar.view"), children: (S ?? Z).map((e) => /* @__PURE__ */ t(
          l,
          {
            variant: s === e ? "solid" : "outline",
            size: "sm",
            "aria-pressed": s === e,
            onClick: () => B(e),
            children: i.t(Y[e])
          },
          e
        )) })
      ] }),
      c.length === 0 ? /* @__PURE__ */ t("p", { className: "zen-m-0 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg", children: E ?? i.t("planningCalendar.noResources") }) : (
        /* One horizontal scroller holding the header and every row, so the time
           axis and the blocks under it cannot scroll out of alignment — the
           failure you get from scrolling them as two panes. */
        /* @__PURE__ */ t("div", { className: "zen-overflow-x-auto zen-rounded-zen-md zen-border zen-border-zen-border", children: /* @__PURE__ */ a("div", { className: "zen-min-w-[45rem]", children: [
          /* @__PURE__ */ a("div", { className: "zen-flex zen-border-b zen-border-zen-border zen-bg-zen-muted/30", children: [
            /* @__PURE__ */ t("div", { className: "zen-w-40 zen-shrink-0 zen-border-e zen-border-zen-border zen-px-3 zen-py-2 zen-text-xs zen-font-semibold zen-text-zen-muted-fg", children: i.t("planningCalendar.resource") }),
            /* @__PURE__ */ t("div", { className: "zen-flex zen-flex-1", children: h.map((e) => /* @__PURE__ */ a(
              "div",
              {
                className: o(
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
          c.map((e) => /* @__PURE__ */ a(
            "div",
            {
              className: "zen-flex zen-border-b zen-border-zen-border last:zen-border-b-0",
              children: [
                /* @__PURE__ */ a("div", { className: "zen-w-40 zen-shrink-0 zen-border-e zen-border-zen-border zen-px-3 zen-py-2", children: [
                  /* @__PURE__ */ t("div", { className: "zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground", children: e.row.title }),
                  e.row.subtitle && /* @__PURE__ */ t("div", { className: "zen-truncate zen-text-xs zen-text-zen-muted-fg", children: e.row.subtitle })
                ] }),
                /* @__PURE__ */ a(
                  "div",
                  {
                    className: "zen-relative zen-flex-1",
                    style: { minHeight: `${e.laneCount * u + 8}px` },
                    children: [
                      /* @__PURE__ */ t("div", { "aria-hidden": "true", className: "zen-absolute zen-inset-0 zen-flex", children: h.map((n) => /* @__PURE__ */ t(
                        "div",
                        {
                          className: o(
                            "zen-flex-1 zen-border-e zen-border-zen-border last:zen-border-e-0",
                            n.nonWorking && "zen-bg-zen-muted/30",
                            n.today && "zen-bg-zen-primary-soft/40"
                          )
                        },
                        n.start.getTime()
                      )) }),
                      v !== null && /* @__PURE__ */ t(
                        "div",
                        {
                          "aria-hidden": "true",
                          className: "zen-absolute zen-top-0 zen-bottom-0 zen-w-px zen-bg-zen-error",
                          style: { insetInlineStart: `${v}%` }
                        }
                      ),
                      e.blocks.map((n) => /* @__PURE__ */ a(
                        "button",
                        {
                          type: "button",
                          onClick: () => b?.(n.appointment, e.row),
                          className: o(
                            "zen-absolute zen-flex zen-items-center zen-gap-1 zen-overflow-hidden zen-rounded-zen-sm zen-border zen-px-1.5 zen-text-start zen-text-xs",
                            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                            U[n.appointment.state ?? "default"],
                            /* Square off the cut edge so a block continuing past the
                               view does not look like it ends there. */
                            n.placement.clippedStart && "zen-rounded-s-none zen-border-s-0",
                            n.placement.clippedEnd && "zen-rounded-e-none zen-border-e-0",
                            b && "hover:zen-brightness-95"
                          ),
                          style: {
                            insetInlineStart: `${n.placement.startPct}%`,
                            width: `${n.placement.widthPct}%`,
                            top: `${n.lane * u + 4}px`,
                            height: `${u - 6}px`
                          },
                          title: `${n.appointment.title} · ${C(n.appointment.start, n.appointment.end)}`,
                          children: [
                            /* @__PURE__ */ t("span", { className: "zen-sr-only", children: C(n.appointment.start, n.appointment.end) }),
                            n.placement.widthPct >= k && /* @__PURE__ */ a(O, { children: [
                              n.appointment.icon && /* @__PURE__ */ t(p, { name: n.appointment.icon, size: 12, className: "zen-shrink-0" }),
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
  oe as PlanningCalendar
};
//# sourceMappingURL=index108.js.map
