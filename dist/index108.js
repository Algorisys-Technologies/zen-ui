import { jsxs as a, jsx as t, Fragment as K } from "react/jsx-runtime";
import * as w from "react";
import { cn as z } from "./index199.js";
import "./index208.js";
import "./index28.js";
import { planningRange as X, planningColumns as q, nowPct as G, placeAppointment as J, layoutLanes as Q, shiftPlanningAnchor as N, planningRangeLabel as U, formatTimeRange as C } from "./index255.js";
import "./index110.js";
import { calendarLanePx as Y } from "./index256.js";
import { Button as l } from "./index71.js";
import { Icon as u } from "./index63.js";
import { useLocale as Z } from "./index90.js";
const k = {
  default: "zen-bg-zen-muted zen-text-zen-foreground zen-border-zen-border",
  info: "zen-bg-zen-info-soft zen-text-zen-info zen-border-zen-info",
  success: "zen-bg-zen-success-soft zen-text-zen-success zen-border-zen-success",
  warning: "zen-bg-zen-warning-soft zen-text-zen-warning zen-border-zen-warning",
  error: "zen-bg-zen-error-soft zen-text-zen-error zen-border-zen-error"
}, ee = {
  day: "planningCalendar.views.day",
  week: "planningCalendar.views.week",
  month: "planningCalendar.views.month"
}, ne = ["day", "week", "month"], te = 3, pe = ({
  rows: y,
  defaultView: L,
  view: f,
  onViewChange: I,
  views: S,
  defaultDate: $,
  date: g,
  onDateChange: P,
  onAppointmentClick: b,
  now: T,
  hideToolbar: D,
  emptyMessage: _,
  laneHeight: E,
  density: R,
  className: V
}) => {
  const i = Z(), d = Math.max(14, Y(R, E)), [W, A] = w.useState(L ?? "week"), [B, M] = w.useState($ ?? /* @__PURE__ */ new Date()), s = f ?? W, o = g ?? B, m = T ?? /* @__PURE__ */ new Date(), j = (e) => {
    f === void 0 && A(e), I?.(e);
  }, c = (e) => {
    g === void 0 && M(e), P?.(e);
  }, h = X(s, o), x = q(s, o, { now: m }), v = G(h, m), p = (y ?? []).map((e) => {
    const n = e.appointments.map((r) => ({ appointment: r, placement: J(r, h) })).filter(
      (r) => r.placement !== null
    ), { lanes: H, laneCount: O } = Q(n.map((r) => r.appointment));
    return {
      row: e,
      blocks: n.map((r, F) => ({ ...r, lane: H[F] })),
      laneCount: Math.max(O, 1)
    };
  });
  return (
    /* w-full, because the grid is a chart: shrink-wrapped to its content it
       reports a 490px week whose columns are too narrow to read, and the caller
       cannot fix that from outside without knowing the internals. */
    /* @__PURE__ */ a("div", { className: z("zen-flex zen-w-full zen-flex-col zen-gap-3", V), children: [
      !D && p.length > 0 && /* @__PURE__ */ a("div", { className: "zen-flex zen-flex-wrap zen-items-center zen-gap-2", children: [
        /* @__PURE__ */ t(
          l,
          {
            variant: "outline",
            size: "sm",
            "aria-label": i.t("planningCalendar.previous"),
            onClick: () => c(N(s, o, -1)),
            children: /* @__PURE__ */ t(u, { name: "chevron-left", size: 14, className: "rtl:zen-rotate-180" })
          }
        ),
        /* @__PURE__ */ t(l, { variant: "outline", size: "sm", onClick: () => c(m), children: i.t("planningCalendar.today") }),
        /* @__PURE__ */ t(
          l,
          {
            variant: "outline",
            size: "sm",
            "aria-label": i.t("planningCalendar.next"),
            onClick: () => c(N(s, o, 1)),
            children: /* @__PURE__ */ t(u, { name: "chevron-right", size: 14, className: "rtl:zen-rotate-180" })
          }
        ),
        /* @__PURE__ */ t("span", { className: "zen-mx-1 zen-text-sm zen-font-medium zen-text-zen-foreground", children: U(s, o) }),
        /* @__PURE__ */ t("div", { className: "zen-ms-auto zen-flex zen-gap-1", role: "group", "aria-label": i.t("planningCalendar.view"), children: (S ?? ne).map((e) => /* @__PURE__ */ t(
          l,
          {
            variant: s === e ? "solid" : "outline",
            size: "sm",
            "aria-pressed": s === e,
            onClick: () => j(e),
            children: i.t(ee[e])
          },
          e
        )) })
      ] }),
      p.length === 0 ? /* @__PURE__ */ t("p", { className: "zen-m-0 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg", children: _ ?? i.t("planningCalendar.noResources") }) : (
        /* One horizontal scroller holding the header and every row, so the time
           axis and the blocks under it cannot scroll out of alignment — the
           failure you get from scrolling them as two panes. */
        /* @__PURE__ */ t("div", { className: "zen-overflow-x-auto zen-rounded-zen-md zen-border zen-border-zen-border", children: /* @__PURE__ */ a("div", { className: "zen-min-w-[45rem]", children: [
          /* @__PURE__ */ a("div", { className: "zen-flex zen-border-b zen-border-zen-border zen-bg-zen-muted", children: [
            /* @__PURE__ */ t("div", { className: "zen-w-40 zen-shrink-0 zen-border-e zen-border-zen-border zen-px-3 zen-py-2 zen-text-xs zen-font-semibold zen-text-zen-muted-fg", children: i.t("planningCalendar.resource") }),
            /* @__PURE__ */ t("div", { className: "zen-flex zen-flex-1", children: x.map((e) => /* @__PURE__ */ a(
              "div",
              {
                className: z(
                  "zen-flex-1 zen-border-e zen-border-zen-border zen-px-1 zen-py-2 zen-text-center last:zen-border-e-0",
                  e.nonWorking && "zen-bg-zen-muted",
                  e.today && "zen-bg-zen-primary-soft"
                ),
                children: [
                  /* @__PURE__ */ t("div", { className: "zen-text-xs zen-font-medium zen-text-zen-foreground", children: e.label }),
                  e.sublabel && /* @__PURE__ */ t("div", { className: "zen-[font-size:var(--zen-schedule-label-font-size)] zen-text-zen-muted-fg", children: e.sublabel })
                ]
              },
              e.start.getTime()
            )) })
          ] }),
          p.map((e) => /* @__PURE__ */ a(
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
                    style: { minHeight: `${e.laneCount * d + 8}px` },
                    children: [
                      /* @__PURE__ */ t("div", { "aria-hidden": "true", className: "zen-absolute zen-inset-0 zen-flex", children: x.map((n) => /* @__PURE__ */ t(
                        "div",
                        {
                          className: z(
                            "zen-flex-1 zen-border-e zen-border-zen-border last:zen-border-e-0",
                            n.nonWorking && "zen-bg-zen-muted",
                            n.today && "zen-bg-zen-primary-soft"
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
                          className: z(
                            "zen-absolute zen-flex zen-items-center zen-gap-1 zen-overflow-hidden zen-rounded-zen-sm zen-border zen-px-1.5 zen-text-start zen-text-xs",
                            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                            k[n.appointment.state ?? "default"],
                            /* Square off the cut edge so a block continuing past the
                               view does not look like it ends there. */
                            n.placement.clippedStart && "zen-rounded-s-none zen-border-s-0",
                            n.placement.clippedEnd && "zen-rounded-e-none zen-border-e-0",
                            b && "hover:zen-brightness-95"
                          ),
                          style: {
                            insetInlineStart: `${n.placement.startPct}%`,
                            width: `${n.placement.widthPct}%`,
                            top: `${n.lane * d + 4}px`,
                            height: `${d - 6}px`
                          },
                          title: `${n.appointment.title} · ${C(n.appointment.start, n.appointment.end)}`,
                          children: [
                            /* @__PURE__ */ t("span", { className: "zen-sr-only", children: C(n.appointment.start, n.appointment.end) }),
                            n.placement.widthPct >= te && /* @__PURE__ */ a(K, { children: [
                              n.appointment.icon && /* @__PURE__ */ t(u, { name: n.appointment.icon, size: 12, className: "zen-shrink-0" }),
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
  pe as PlanningCalendar
};
//# sourceMappingURL=index108.js.map
