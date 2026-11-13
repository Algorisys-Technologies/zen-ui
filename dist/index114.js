import { jsxs as l, jsx as a, Fragment as y } from "react/jsx-runtime";
import * as d from "react";
import { cn as z } from "./index197.js";
import "./index28.js";
import "./index110.js";
import { durationMessage as D } from "./index120.js";
import { PRODUCTION_DRAG_TYPE as I } from "./index113.js";
import { useLocale as S } from "./index90.js";
import { NativeSelect as j } from "./index7.js";
import { Button as m } from "./index71.js";
const C = d.forwardRef(
  ({ items: o, resources: h, onPlace: x, now: p, timeZone: b, className: k, ...N }, v) => {
    const t = S(), c = +(p ?? Date.now()), s = (e) => !!e.due && e.due.getTime() < c, B = d.useMemo(() => {
      const e = (n) => +(!!n.due && n.due.getTime() < c);
      return o.map((n, r) => ({ item: n, index: r })).sort(
        (n, r) => e(r.item) - e(n.item) || (n.item.due?.getTime() ?? 1 / 0) - (r.item.due?.getTime() ?? 1 / 0) || n.index - r.index
      ).map((n) => n.item);
    }, [o, c]), [g, i] = d.useState(), [u, f] = d.useState(""), T = (e) => new Intl.DateTimeFormat(t.locale, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: b
    }).format(e), w = (e) => {
      const n = D(e * 6e4);
      return t.t(n.key, n.values);
    };
    return /* @__PURE__ */ l("section", { ref: v, className: z("zen-flex zen-flex-col zen-gap-2", k), "aria-label": t.t("scheduleBacklog.label"), ...N, children: [
      /* @__PURE__ */ l("div", { className: "zen-flex zen-flex-col zen-gap-0.5", children: [
        /* @__PURE__ */ a("h3", { className: "zen-m-0 zen-text-sm zen-font-semibold zen-text-zen-foreground", children: t.t("scheduleBacklog.label") }),
        o.length ? /* @__PURE__ */ l(y, { children: [
          /* @__PURE__ */ a("span", { className: "zen-text-xs zen-text-zen-foreground", children: t.t("scheduleBacklog.count", { count: o.length }) }),
          /* @__PURE__ */ a("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: t.t("scheduleBacklog.hint") })
        ] }) : /* @__PURE__ */ a("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: t.t("scheduleBacklog.empty") })
      ] }),
      /* @__PURE__ */ a("ul", { className: "zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-2 zen-p-0", children: B.map((e) => /* @__PURE__ */ l(
        "li",
        {
          draggable: !0,
          "data-backlog-item": e.id,
          className: z(
            "zen-flex zen-flex-col zen-gap-2 zen-rounded-zen-md zen-border zen-border-solid zen-bg-zen-background zen-p-3 zen-cursor-grab active:zen-cursor-grabbing",
            s(e) ? "zen-border-zen-error" : "zen-border-zen-border"
          ),
          onDragStart: (n) => {
            n.dataTransfer.setData(I, e.id), n.dataTransfer.setData("text/plain", e.name), n.dataTransfer.effectAllowed = "move";
          },
          children: [
            /* @__PURE__ */ l("div", { className: "zen-flex zen-items-start zen-justify-between zen-gap-2", children: [
              /* @__PURE__ */ l("div", { className: "zen-flex zen-min-w-0 zen-flex-col", children: [
                /* @__PURE__ */ a("span", { className: "zen-text-sm zen-font-medium zen-text-zen-foreground", children: e.name }),
                /* @__PURE__ */ a("span", { className: "zen-text-xs zen-tabular-nums zen-text-zen-muted-fg", children: [e.order, e.runMinutes ? w(e.runMinutes) : null].filter(Boolean).join(" · ") }),
                e.due && /* @__PURE__ */ l(
                  "span",
                  {
                    className: z(
                      "zen-text-xs zen-tabular-nums",
                      s(e) ? "zen-font-medium zen-text-zen-error" : "zen-text-zen-foreground"
                    ),
                    children: [
                      s(e) ? [t.t("scheduleBacklog.overdue"), ""].join(" · ") : "",
                      t.t("scheduleBacklog.due", { date: T(e.due) })
                    ]
                  }
                )
              ] }),
              g !== e.id && /* Default size, not sm: this button IS the touch and keyboard
              path, so it follows density up to 48px. */
              /* @__PURE__ */ a(
                m,
                {
                  variant: "outline",
                  onClick: () => {
                    i(e.id), f("");
                  },
                  children: t.t("scheduleBacklog.place")
                }
              )
            ] }),
            g === e.id && /* @__PURE__ */ l("div", { className: "zen-flex zen-flex-wrap zen-items-end zen-gap-2", children: [
              /* @__PURE__ */ l("label", { className: "zen-flex zen-flex-col zen-gap-1 zen-text-xs zen-font-medium zen-text-zen-muted-fg", children: [
                t.t("scheduleBacklog.placeOn"),
                /* @__PURE__ */ l(j, { className: "zen-min-w-40", value: u, onChange: (n) => f(n.currentTarget.value), children: [
                  /* @__PURE__ */ a("option", { value: "", disabled: !0, children: "—" }),
                  h.map((n) => /* @__PURE__ */ a("option", { value: n.id, children: n.name }, n.id))
                ] })
              ] }),
              /* @__PURE__ */ a(
                m,
                {
                  disabled: !u,
                  onClick: () => {
                    x({ operationId: e.id, resourceId: u }), i(void 0);
                  },
                  children: t.t("scheduleBacklog.placeAtEnd")
                }
              ),
              /* @__PURE__ */ a(m, { variant: "ghost", onClick: () => i(void 0), children: t.t("scheduleBacklog.cancel") })
            ] })
          ]
        },
        e.id
      )) })
    ] });
  }
);
C.displayName = "ScheduleBacklog";
export {
  C as ScheduleBacklog
};
//# sourceMappingURL=index114.js.map
