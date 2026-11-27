import { jsx as n, jsxs as r, Fragment as J } from "react/jsx-runtime";
import * as f from "react";
import { cn as o } from "./index199.js";
import "./index208.js";
import "./index28.js";
import { nowPct as Ee, placeAppointment as Ne } from "./index255.js";
import { ganttFitRange as ot, flattenGanttTasks as ct, ganttLegendItems as dt, ganttConnectors as ut, formatGanttVariance as zt, ganttLabelFits as Le, ganttLabelPx as Ce, GANTT_STATUS_COLOR as mt, ganttActualLayout as et, ganttMilestoneLayout as pt } from "./index110.js";
import { scheduleRowPx as ht, ganttBarPx as gt } from "./index256.js";
import { AvatarGroup as ft, Avatar as bt, AvatarImage as vt, AvatarFallback as xt } from "./index45.js";
import { Badge as Je } from "./index64.js";
import { EmptyState as St, EmptyStateIcon as kt, EmptyStateTitle as yt, EmptyStateDescription as Pt } from "./index99.js";
import { Icon as tt } from "./index63.js";
import { Skeleton as Me } from "./index68.js";
import { TooltipProvider as Tt, Tooltip as It, TooltipTrigger as Nt, TooltipContent as $t } from "./index72.js";
import { useScrollerMetrics as At, INDENT_PX as Ke, useScheduleAxis as Mt, ScheduleGrid as Et } from "./index257.js";
import { useLocale as xe } from "./index90.js";
const Ze = {
  name: 180,
  /* Three xs avatars at "loose" spacing plus a "+N" chip is 84px, and the cell
     costs 16px of padding either side of it. */
  assignees: 96,
  status: 88,
  variance: 72
}, Lt = {
  name: "gantt.column.name",
  assignees: "gantt.column.assignees",
  status: "gantt.column.status",
  variance: "gantt.column.variance"
}, we = {
  name: 1,
  assignees: 2,
  status: 3,
  variance: 4,
  timeline: 5
}, Ct = ["name", "assignees", "status", "variance"], _t = 3, nt = (e, a) => `color-mix(in srgb, ${e} ${a}%, var(--zen-color-background))`, _e = (e) => ({ backgroundColor: nt(e, 18), borderColor: e }), Re = "zen-inset-y-0.5 zen-start-1 zen-rounded-zen-sm zen-px-1 zen-text-zen-foreground", De = {
  backgroundColor: "color-mix(in srgb, var(--zen-color-background) 80%, transparent)"
}, Rt = ({ items: e }) => {
  const a = xe();
  return /* @__PURE__ */ n("ul", { "aria-label": a.t("gantt.legend"), className: "zen-m-0 zen-flex zen-list-none zen-flex-wrap zen-items-center zen-gap-x-3 zen-gap-y-1 zen-p-0", children: e.map((u) => /* @__PURE__ */ r("li", { className: "zen-flex zen-items-center zen-gap-1.5 zen-text-xs zen-text-zen-muted-fg", children: [
    /* @__PURE__ */ n(
      "span",
      {
        "aria-hidden": "true",
        className: "zen-inline-block zen-h-2.5 zen-w-2.5 zen-shrink-0 zen-rounded-full zen-border zen-border-zen-border",
        style: { backgroundColor: u.color }
      }
    ),
    u.label
  ] }, `${u.label}\0${u.color}`)) });
}, at = 44, Dt = 85, jt = 30, Ie = {
  "not-started": "zen-bg-zen-muted zen-border-zen-border",
  "on-track": "zen-bg-zen-info-soft zen-border-zen-info",
  delayed: "zen-bg-zen-error-soft zen-border-zen-error",
  complete: "zen-bg-zen-success-soft zen-border-zen-success"
}, ve = {
  "not-started": "zen-bg-zen-neutral",
  "on-track": "zen-bg-zen-info",
  delayed: "zen-bg-zen-error",
  complete: "zen-bg-zen-success"
}, Gt = {
  "not-started": "zen-text-zen-foreground",
  "on-track": "zen-text-zen-info-fg",
  delayed: "zen-text-zen-error-fg",
  complete: "zen-text-zen-success-fg"
}, Bt = {
  "not-started": "neutral",
  "on-track": "info",
  delayed: "error",
  complete: "success"
}, le = {
  "not-started": "gantt.status.notStarted",
  "on-track": "gantt.status.onTrack",
  delayed: "gantt.status.delayed",
  complete: "gantt.status.complete"
}, Ot = (e) => e.initials ?? e.name.split(/\s+/).filter(Boolean).slice(0, 2).map((a) => a[0]).join("").toUpperCase(), Ft = (e) => {
  const a = [], u = (l) => {
    for (const p of l)
      p.children && p.children.length > 0 && (a.push(p.id), u(p.children));
  };
  return u(e), a;
}, g = (e) => `${e.getDate()} ${e.toLocaleString(void 0, { month: "short" })} ${e.getFullYear()}`, on = ({
  tasks: e,
  dependencies: a,
  showDependencies: u = !0,
  defaultView: l,
  view: p,
  onViewChange: b,
  views: F,
  defaultDate: H,
  date: y,
  onDateChange: K,
  expanded: X,
  defaultExpanded: U,
  onExpandedChange: P,
  onTaskClick: x,
  now: T,
  calendar: j,
  hourStep: c,
  columnWidth: z,
  hideToolbar: d,
  columns: h,
  loading: A,
  loadingRows: L = 6,
  emptyState: M,
  rowHeight: v,
  maxBodyHeight: V,
  headerClassName: Z,
  headerGroups: ae,
  continuous: G,
  density: Q,
  rowClassName: I,
  barClassName: C,
  barAccent: _,
  actualLayout: w = "strip",
  deriveFromActuals: re,
  actualBarClassName: oe,
  actualBarColor: R,
  barLabel: E,
  actualBarLabel: ce,
  progressOn: de = "planned",
  statusColor: S,
  legend: ee,
  monthColumns: Se,
  dependencyStyle: ue,
  className: se
}) => {
  const i = xe(), m = gt(Q), N = Math.max(m + 4, ht(Q, v)), [te, ze] = f.useState(l ?? "fit"), [ne, B] = f.useState(H ?? /* @__PURE__ */ new Date()), [k, me] = f.useState(U ?? null), pe = f.useRef(null), { metrics: q, setMetrics: ke } = At(pe), D = p ?? te, he = y ?? ne, $e = f.useRef(null);
  $e.current === null && ($e.current = /* @__PURE__ */ new Date());
  const ie = T ?? $e.current, ye = ie.getTime(), je = he.getTime(), Ge = (t) => {
    y === void 0 && B(t), K?.(t);
  }, ge = X ?? k, Ae = f.useMemo(
    () => ge === null ? null : new Set(ge),
    [ge]
  ), Be = (t) => {
    const s = ge ?? Ft(e), $ = s.includes(t) ? s.filter((O) => O !== t) : [...s, t];
    X === void 0 && me($), P?.($);
  }, Oe = f.useMemo(
    () => D === "fit" || G ? ot(e ?? [], { calendar: j, now: ie }) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- nowTime is `now`, by value
    [D, G, e, j, ye]
  ), fe = D === "fit" ? Oe : null, Fe = ae ?? !!G, He = h ?? Ct, Xe = f.useMemo(
    () => He.map((t) => ({
      key: t,
      label: i.t(Lt[t]),
      width: Ze[t],
      colIndex: we[t],
      className: t === "name" ? "zen-min-w-0 zen-gap-1 zen-pe-2" : "zen-px-2",
      style: t === "name" ? (s) => ({ paddingInlineStart: 8 + s.depth * Ke }) : void 0,
      /* The avatars are decorative and the "+N" chip hides names outright, so
         the cell says who — the tooltip is the pointer's version of it. */
      ariaLabel: t === "assignees" ? (s) => s.task.assignees && s.task.assignees.length > 0 ? s.task.assignees.map(($) => $.name).join(", ") : void 0 : void 0,
      render: (s) => /* @__PURE__ */ n(Ht, { column: t, row: s, onToggle: Be, tone: S?.(s.task, s) || void 0 })
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [He.join(","), ge, e, i, S]
  ), Ue = Mt({
    view: D,
    anchor: he,
    fitRange: fe,
    now: ie,
    calendar: j,
    hourStep: c,
    columnWidth: z,
    paneColumns: Xe,
    available: q.width,
    grouped: Fe,
    continuous: G,
    plan: Oe,
    monthUnit: Se
  }), { range: W, axisWidth: Pe, minGapMs: Ve } = Ue, { rows: Y, rowIndexById: Qe } = f.useMemo(
    () => ct(
      e ?? [],
      (t) => Ae === null ? !0 : Ae.has(t.id),
      ie,
      { calendar: j, minGapMs: Ve, deriveFromActuals: re }
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [e, Ae, ye, j, Ve, re]
  ), We = f.useMemo(() => ee ? Array.isArray(ee) ? ee : dt(Y, (t) => ({
    label: t.task.statusLabel ?? i.t(le[t.status]),
    color: S?.(t.task, t) || mt[t.status]
  })) : [], [ee, Y, S, i]), be = f.useMemo(() => {
    const t = /* @__PURE__ */ new Map();
    for (const s of Y) {
      if (!s.span) continue;
      if (s.task.milestone) {
        const O = Ee(W, s.span.start);
        O !== null && t.set(s.index, { startPct: O, widthPct: 0, clippedStart: !1, clippedEnd: !1 });
        continue;
      }
      const $ = Ne(s.span, W);
      $ && t.set(s.index, $);
    }
    return t;
  }, [Y, W]), Ye = f.useCallback(
    (t) => {
      if (!t.actual) return null;
      if (!t.task.milestone) return Ne(t.actual, W);
      const s = Ee(W, t.actual.start);
      return s === null ? null : { startPct: s, widthPct: 0, clippedStart: !1, clippedEnd: !1 };
    },
    [W]
  ), st = f.useMemo(() => {
    if (!u || !a || a.length === 0) return [];
    const t = /* @__PURE__ */ new Map(), s = Pe > 0 ? m / 2 / Pe * 100 : 0;
    for (const [$, O] of Qe) {
      const qe = Y[O], Te = (w === "primary" && qe?.actual ? Ye(qe) : null) ?? be.get(O);
      Te && (Y[O]?.task.milestone ? t.set($, { rowIndex: O, startPct: Te.startPct - s, widthPct: 2 * s }) : t.set($, { rowIndex: O, startPct: Te.startPct, widthPct: Te.widthPct }));
    }
    return ut(t, a, { axisWidth: Pe, rowHeight: N });
  }, [u, a, Qe, be, Y, Pe, N, m, w, Ye]), it = (t) => {
    if (D === "fit" && t !== "fit" && fe) {
      const s = fe.start.getTime(), $ = fe.end.getTime();
      (je < s || je >= $) && Ge(ye >= s && ye < $ ? ie : fe.start);
    }
    p === void 0 && ze(t), b?.(t);
  }, lt = f.useCallback(
    (t, s) => (
      /* "primary": the actual bar IS the bar — its own component (not a branch
         inside GanttTrack, whose hooks must run in the same order whether or
         not a row has actual dates yet). Only rows with actual dates take it. */
      w === "primary" && t.actual && !t.task.milestone ? /* @__PURE__ */ n(
        Ut,
        {
          row: t,
          range: W,
          axisWidth: s,
          placement: be.get(t.index) ?? null,
          onTaskClick: x,
          rowHeight: N,
          barPx: m,
          barClass: C?.(t.task) || void 0,
          accent: _?.(t.task) || void 0,
          tone: S?.(t.task, t) || void 0,
          plannedLabel: E?.(t.task, t) || void 0,
          actualLabel: ce?.(t.task, t) || void 0,
          actualClass: oe?.(t.task) || void 0,
          actualColor: R?.(t.task) || void 0
        }
      ) : /* @__PURE__ */ n(
        Xt,
        {
          row: t,
          range: W,
          axisWidth: s,
          placement: be.get(t.index) ?? null,
          onTaskClick: x,
          rowHeight: N,
          barPx: m,
          barClass: C?.(t.task) || void 0,
          accent: _?.(t.task) || void 0,
          tone: S?.(t.task, t) || void 0,
          plannedLabel: E?.(t.task, t) || void 0,
          actualLabel: ce?.(t.task, t) || void 0,
          progressOn: de,
          actualLayout: w,
          actualClass: oe?.(t.task) || void 0,
          actualColor: R?.(t.task) || void 0
        }
      )
    ),
    [
      W,
      be,
      x,
      N,
      m,
      C,
      _,
      w,
      oe,
      R,
      S,
      E,
      ce,
      de
    ]
  ), rt = f.useMemo(
    () => ue ? (t) => ue(t.dependency) : void 0,
    [ue]
  );
  return A ? /* @__PURE__ */ n(
    "div",
    {
      className: o(
        "zen-flex zen-w-full zen-flex-col zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3",
        se
      ),
      role: "status",
      "aria-label": i.t("gantt.loadingSchedule"),
      children: Array.from({ length: L }, (t, s) => /* @__PURE__ */ r("div", { className: "zen-flex zen-items-center zen-gap-3", children: [
        /* @__PURE__ */ n(Me, { className: "zen-h-4", style: { width: Ze.name - 24 - s % 3 * Ke } }),
        /* @__PURE__ */ n(Me, { className: "zen-h-4 zen-w-16" }),
        /* @__PURE__ */ n(
          Me,
          {
            className: "zen-h-4",
            style: { marginInlineStart: `${s * 37 % 45}%`, width: `${20 + s * 13 % 30}%` }
          }
        )
      ] }, s))
    }
  ) : Y.length === 0 ? /* @__PURE__ */ n("div", { className: o("zen-w-full", se), children: M ?? /* @__PURE__ */ r(St, { bordered: !0, children: [
    /* @__PURE__ */ n(kt, { children: /* @__PURE__ */ n(tt, { name: "calendar", size: 22 }) }),
    /* @__PURE__ */ n(yt, { children: i.t("gantt.nothingScheduled") }),
    /* @__PURE__ */ n(Pt, { children: i.t("gantt.addATaskWithA") })
  ] }) }) : /* @__PURE__ */ n(Tt, { delayDuration: 200, children: /* @__PURE__ */ n(
    Et,
    {
      rows: Y,
      rowId: (t) => t.task.id,
      columns: Xe,
      colCount: 5,
      timelineColIndex: we.timeline,
      renderTrack: lt,
      rowHeight: N,
      rowClass: I ? (t) => I(t.task, t) : void 0,
      maxBodyHeight: V,
      headerClassName: Z,
      headerGroups: Fe,
      view: D,
      anchor: he,
      now: ie,
      connectors: st,
      connectorStyle: rt,
      views: F,
      hideToolbar: d,
      legend: We.length > 0 ? /* @__PURE__ */ n(Rt, { items: We }) : void 0,
      onViewChange: it,
      onDateChange: Ge,
      onToggle: (t) => Be(t.task.id),
      onActivate: (t) => x?.(t.task, t),
      ariaLabel: i.t("gantt.projectSchedule"),
      className: se,
      scrollerRef: pe,
      axis: Ue,
      metrics: q,
      setMetrics: ke
    }
  ) });
}, Ht = ({
  column: e,
  row: a,
  onToggle: u,
  tone: l
}) => {
  const p = xe(), { task: b } = a;
  if (e === "name")
    return /* @__PURE__ */ r(J, { children: [
      a.hasChildren ? /* @__PURE__ */ n(
        "button",
        {
          type: "button",
          tabIndex: -1,
          onClick: () => u(b.id),
          "aria-label": p.t(a.expanded ? "gantt.collapseTask" : "gantt.expandTask", { name: b.name }),
          className: "zen-flex zen-h-5 zen-w-5 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-text-zen-muted-fg hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          children: /* @__PURE__ */ n(
            tt,
            {
              name: a.expanded ? "chevron-down" : "chevron-right",
              size: 14,
              className: a.expanded ? void 0 : "rtl:zen-rotate-180"
            }
          )
        }
      ) : (
        /* A spacer, not a hidden chevron: leaves must line up with their
           siblings' text, or every leaf reads as one level shallower. */
        /* @__PURE__ */ n("span", { "aria-hidden": "true", className: "zen-h-5 zen-w-5 zen-shrink-0" })
      ),
      /* @__PURE__ */ r("span", { className: "zen-min-w-0", children: [
        /* @__PURE__ */ n(
          "span",
          {
            className: o(
              "zen-block zen-truncate zen-text-sm zen-text-zen-foreground",
              a.hasChildren && "zen-font-semibold"
            ),
            title: b.name,
            children: b.name
          }
        ),
        (b.subtitle === void 0 ? [] : [].concat(b.subtitle)).map((H, y) => /* @__PURE__ */ n("span", { className: "zen-block zen-truncate zen-[font-size:var(--zen-schedule-label-font-size)] zen-text-zen-muted-fg", children: H }, y))
      ] })
    ] });
  if (e === "assignees") return /* @__PURE__ */ n(Vt, { assignees: b.assignees });
  if (e === "status")
    return /* @__PURE__ */ n(
      Je,
      {
        variant: "soft",
        color: l ? "neutral" : Bt[a.status],
        className: "zen-truncate",
        style: l ? { backgroundColor: nt(l, 22), color: "var(--zen-color-foreground)" } : void 0,
        children: b.statusLabel ?? p.t(le[a.status])
      }
    );
  const F = zt(a.variance);
  return F ? /* @__PURE__ */ n(
    Je,
    {
      dir: "ltr",
      variant: "soft",
      color: a.variance === null || a.variance === 0 ? "neutral" : a.variance > 0 ? "error" : "success",
      children: F
    }
  ) : null;
}, Xt = ({
  row: e,
  range: a,
  axisWidth: u,
  placement: l,
  onTaskClick: p,
  rowHeight: b,
  barPx: F,
  barClass: H,
  accent: y,
  actualLayout: K,
  actualClass: X,
  actualColor: U,
  tone: P,
  plannedLabel: x,
  actualLabel: T,
  progressOn: j
}) => {
  const c = xe(), { task: z } = e, d = et(b, F, K), h = e.actual && !z.milestone ? Ne(e.actual, a) : null, A = !e.actual || z.milestone ? "" : e.actual.open ? c.t("gantt.actualRunning", { start: g(e.actual.start) }) : c.t("gantt.actualSpan", { start: g(e.actual.start), end: g(e.actual.end) }), L = e.progress ?? 0, M = `${Math.round(L)}%`, v = j === "actual" && !!e.actual && !z.milestone, V = e.progress !== null && !v, Z = v ? Ie["not-started"] : P ? "" : Ie[e.status], ae = !v && P ? _e(P) : {}, G = P ? "" : ve[e.status], Q = P ? { backgroundColor: P } : {}, I = x ?? (V ? M : null), C = l ? l.widthPct / 100 * u : 0, _ = x ? !Le(x, C) : C < at, w = V && !_ && L >= Dt, re = l ? l.startPct + l.widthPct : 0, oe = (100 - re) / 100 * u < (x ? Ce(x) : jt), R = f.useMemo(() => {
    if (!e.segments || !e.span) return null;
    const i = Math.max(e.span.start.getTime(), a.start.getTime()), m = Math.min(e.span.end.getTime(), a.end.getTime()), N = m - i;
    if (N <= 0) return null;
    const te = e.segments.map((k) => k.end.getTime() - k.start.getTime());
    let ne = te.reduce((k, me) => k + me, 0) * L / 100;
    const B = [];
    return e.segments.forEach((k, me) => {
      const pe = Math.max(0, Math.min(ne, te[me]));
      ne -= pe;
      const q = Math.max(k.start.getTime(), i), ke = Math.min(k.end.getTime(), m);
      if (ke <= q) return;
      const D = ke - q, he = Math.max(0, Math.min(pe - (q - k.start.getTime()), D));
      B.push({
        key: q,
        startPct: (q - i) / N * 100,
        widthPct: D / N * 100,
        fillPct: D > 0 ? he / D * 100 : 0
      });
    }), B.length > 0 ? B : null;
  }, [e.segments, e.span, L, a]), E = U ?? P, ce = h ? h.widthPct / 100 * u : 0, de = v && e.progress !== null, S = T ?? (de ? M : null), ee = !!S && d.actualHeight >= 12 && Le(S, ce), Se = h ? h.startPct + h.widthPct : 0, ue = (100 - Se) / 100 * u < Ce(S ?? ""), se = h && /* @__PURE__ */ r(J, { children: [
    /* @__PURE__ */ r(
      "span",
      {
        "aria-hidden": "true",
        "data-gantt-actual": "",
        "data-gantt-actual-open": e.actual?.open ? "" : void 0,
        className: o(
          "zen-pointer-events-none zen-absolute zen-overflow-hidden zen-rounded-zen-sm",
          v ? o("zen-border", !E && Ie[e.status]) : !E && ve[e.status],
          h.clippedStart && "zen-rounded-s-none",
          (h.clippedEnd || e.actual?.open) && "zen-rounded-e-none",
          X
        ),
        style: {
          insetInlineStart: `${h.startPct}%`,
          width: `${h.widthPct}%`,
          top: d.actualTop,
          height: d.actualHeight,
          ...E ? v ? _e(E) : { backgroundColor: E } : {}
        },
        children: [
          de && /* @__PURE__ */ n(
            "span",
            {
              className: o("zen-absolute zen-inset-y-0 zen-start-0", !E && ve[e.status]),
              style: { width: `${L}%`, ...E ? { backgroundColor: E } : {} }
            }
          ),
          ee && /* @__PURE__ */ n(
            "span",
            {
              className: o(
                "zen-absolute zen-flex zen-items-center zen-whitespace-nowrap zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium",
                Re
              ),
              style: De,
              children: S
            }
          )
        ]
      }
    ),
    S && !ee && /* @__PURE__ */ n(
      "span",
      {
        "aria-hidden": "true",
        className: "zen-pointer-events-none zen-absolute zen-flex zen-items-center zen-whitespace-nowrap zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium zen-text-zen-muted-fg",
        style: {
          ...ue ? { insetInlineEnd: `calc(${100 - h.startPct}% + 4px)` } : { insetInlineStart: `calc(${Se}% + 4px)` },
          top: d.actualTop,
          height: d.actualHeight
        },
        children: S
      }
    )
  ] });
  if (z.milestone) {
    const i = pt(b, F, K), m = K === "primary" && !!e.actual, N = e.actual ? Ee(a, e.actual.start) : null, te = l?.startPct ?? null, ze = m ? N : te, ne = m ? te : N, B = e.actual ? c.t("gantt.actualOn", { date: g(e.actual.start) }) : null, k = U ?? P;
    return /* @__PURE__ */ r(J, { children: [
      e.span && ze !== null ? /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          onClick: () => p?.(z, e),
          tabIndex: -1,
          "data-gantt-bar": "",
          "data-gantt-milestone": "",
          "data-gantt-actual": m ? "" : void 0,
          className: o(
            "zen-absolute zen-flex zen-items-center zen-justify-center zen-rounded-zen-sm",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
          ),
          style: {
            insetInlineStart: `calc(${ze}% - ${i.mainSize / 2}px)`,
            top: i.mainTop,
            width: i.mainSize,
            height: i.mainSize
          },
          title: [z.name, g(e.span.start), B].filter(Boolean).join(" · "),
          children: [
            /* @__PURE__ */ n("span", { className: "zen-sr-only", children: [
              c.t("gantt.milestone", {
                date: g(e.span.start),
                status: c.t(le[e.status])
              }),
              B
            ].filter(Boolean).join(", ") }),
            /* @__PURE__ */ n(
              "span",
              {
                "aria-hidden": "true",
                "data-gantt-accent": y ? "" : void 0,
                className: o("zen-block zen-shrink-0 zen-rotate-45 zen-rounded-[2px]", G, H),
                style: {
                  width: i.mainSize / Math.SQRT2,
                  height: i.mainSize / Math.SQRT2,
                  ...Q,
                  ...m && U ? { backgroundColor: U } : {},
                  ...y ? { boxSizing: "border-box", borderWidth: 2, borderStyle: "solid", borderColor: y } : {}
                }
              }
            )
          ]
        }
      ) : /* @__PURE__ */ r("span", { className: "zen-sr-only", children: [
        e.span ? c.t("gantt.notInRange") : c.t("gantt.noDates"),
        B ? `, ${B}` : ""
      ] }),
      ne !== null && (m || !!e.actual) && /* @__PURE__ */ n(
        "span",
        {
          "aria-hidden": "true",
          "data-gantt-actual": m ? void 0 : "",
          "data-gantt-plan": m ? "" : void 0,
          className: "zen-pointer-events-none zen-absolute zen-flex zen-items-center zen-justify-center",
          style: {
            insetInlineStart: `calc(${ne}% - ${i.markSize / 2}px)`,
            top: i.markTop,
            width: i.markSize,
            height: i.markSize
          },
          children: /* @__PURE__ */ n(
            "span",
            {
              className: o(
                "zen-block zen-shrink-0 zen-rotate-45 zen-rounded-[1px]",
                m ? "zen-border zen-border-zen-muted-fg" : o(!k && ve[e.status], X)
              ),
              style: {
                width: i.markSize / Math.SQRT2,
                height: i.markSize / Math.SQRT2,
                ...!m && k ? { backgroundColor: k } : {}
              }
            }
          )
        }
      )
    ] });
  }
  return l ? /* @__PURE__ */ r(J, { children: [
    /* @__PURE__ */ r(
      "button",
      {
        type: "button",
        onClick: () => p?.(z, e),
        tabIndex: -1,
        "data-gantt-bar": "",
        className: o(
          "zen-absolute zen-rounded-zen-sm",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          /* Drawn as pieces, the button is only the hit area and the focus
             ring — the skin moves onto each piece, or the gaps would be
             filled by the button's own background. */
          R === null && o("zen-overflow-hidden zen-border", Z, H),
          /* Square off a cut edge so a bar continuing past the view does
             not look like it ends there. */
          R === null && l.clippedStart && "zen-rounded-s-none zen-border-s-0",
          R === null && l.clippedEnd && "zen-rounded-e-none zen-border-e-0",
          p && "hover:zen-brightness-95"
        ),
        style: {
          insetInlineStart: `${l.startPct}%`,
          width: `${l.widthPct}%`,
          top: d.barTop,
          height: d.barHeight,
          ...R === null ? ae : {}
        },
        title: `${z.name} · ${g(e.span.start)} – ${g(e.span.end)}${e.progress === null ? "" : ` · ${M}`}${A ? ` · ${A}` : ""}`,
        children: [
          /* @__PURE__ */ r("span", { className: "zen-sr-only", children: [
            c.t(e.progress === null ? "gantt.barSpan" : "gantt.barSpanProgress", {
              start: g(e.span.start),
              end: g(e.span.end),
              status: c.t(le[e.status]),
              percent: Math.round(L)
            }),
            A ? `, ${A}` : ""
          ] }),
          R !== null && R.map((i) => /* @__PURE__ */ n(
            "span",
            {
              "aria-hidden": "true",
              className: o("zen-absolute zen-inset-y-0 zen-overflow-hidden", Z, "zen-rounded-zen-sm zen-border", H),
              style: { insetInlineStart: `${i.startPct}%`, width: `${i.widthPct}%`, ...ae },
              children: V && i.fillPct > 0 && /* @__PURE__ */ n(
                "span",
                {
                  className: o("zen-absolute zen-inset-y-0 zen-start-0", G),
                  style: { width: `${i.fillPct}%`, ...Q }
                }
              )
            },
            i.key
          )),
          R === null && V && /* @__PURE__ */ n(
            "span",
            {
              "aria-hidden": "true",
              className: o("zen-absolute zen-inset-y-0 zen-start-0", G),
              style: { width: `${L}%`, ...Q }
            }
          ),
          I && !_ && /* @__PURE__ */ n(
            "span",
            {
              "aria-hidden": "true",
              className: o(
                "zen-absolute zen-flex zen-items-center zen-whitespace-nowrap zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium",
                x ? Re : w ? o("zen-inset-y-0 zen-start-1", P ? "zen-text-zen-foreground" : Gt[e.status]) : "zen-inset-y-0 zen-end-1 zen-text-zen-foreground"
              ),
              style: x ? De : void 0,
              children: I
            }
          ),
          y && /* @__PURE__ */ n(
            "span",
            {
              "aria-hidden": "true",
              "data-gantt-accent": "",
              className: "zen-absolute zen-inset-y-0 zen-start-0 zen-w-1 zen-rounded-s-zen-sm",
              style: { backgroundColor: y }
            }
          )
        ]
      }
    ),
    I && _ && /* @__PURE__ */ n(
      "span",
      {
        "aria-hidden": "true",
        className: "zen-absolute zen-flex zen-items-center zen-whitespace-nowrap zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium zen-text-zen-muted-fg",
        style: {
          ...oe ? { insetInlineEnd: `calc(${100 - l.startPct}% + 4px)` } : { insetInlineStart: `calc(${re}% + 4px)` },
          top: d.barTop,
          height: d.barHeight
        },
        children: I
      }
    ),
    se
  ] }) : /* @__PURE__ */ r(J, { children: [
    /* @__PURE__ */ r("span", { className: "zen-sr-only", children: [
      e.span ? c.t("gantt.notInRange") : c.t("gantt.noDates"),
      A ? `, ${A}` : ""
    ] }),
    se
  ] });
}, Ut = ({
  row: e,
  range: a,
  axisWidth: u,
  placement: l,
  onTaskClick: p,
  rowHeight: b,
  barPx: F,
  barClass: H,
  accent: y,
  tone: K,
  plannedLabel: X,
  actualLabel: U,
  actualClass: P,
  actualColor: x
}) => {
  const T = xe(), { task: j } = e, c = e.actual, z = et(b, F, "primary"), d = Ne(c, a), h = c.open ? T.t("gantt.actualRunning", { start: g(c.start) }) : T.t("gantt.actualSpan", { start: g(c.start), end: g(c.end) }), A = e.progress ?? 0, L = `${Math.round(A)}%`, M = x ?? K, v = U ?? (e.progress !== null ? L : null), V = d ? d.widthPct / 100 * u : 0, Z = !!v && (U ? Le(v, V) : V >= at), ae = (I, C, _) => (100 - I - C) / 100 * u < Ce(_) ? "before" : "after", G = [
    j.name,
    h,
    e.span ? T.t("gantt.barSpan", {
      start: g(e.span.start),
      end: g(e.span.end),
      status: T.t(le[e.status])
    }) : null
  ].filter(Boolean).join(" · "), Q = (I, C, _) => ae(I, C, _) === "before" ? { insetInlineEnd: `calc(${100 - I}% + 4px)` } : { insetInlineStart: `calc(${I + C}% + 4px)` };
  return /* @__PURE__ */ r(J, { children: [
    l && /* @__PURE__ */ r(J, { children: [
      /* @__PURE__ */ n(
        "span",
        {
          "aria-hidden": "true",
          "data-gantt-plan": "",
          className: o(
            "zen-pointer-events-none zen-absolute zen-rounded-zen-sm zen-border zen-border-dashed zen-border-zen-muted-fg",
            l.clippedStart && "zen-rounded-s-none",
            l.clippedEnd && "zen-rounded-e-none",
            H
          ),
          style: {
            insetInlineStart: `${l.startPct}%`,
            width: `${l.widthPct}%`,
            top: z.actualTop,
            height: z.actualHeight
          }
        }
      ),
      X && /* @__PURE__ */ n(
        "span",
        {
          "aria-hidden": "true",
          className: "zen-pointer-events-none zen-absolute zen-flex zen-items-center zen-whitespace-nowrap zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium zen-text-zen-muted-fg",
          style: { ...Q(l.startPct, l.widthPct, X), top: z.actualTop, height: z.actualHeight },
          children: X
        }
      )
    ] }),
    d ? /* @__PURE__ */ r(J, { children: [
      /* @__PURE__ */ r(
        "button",
        {
          type: "button",
          onClick: () => p?.(j, e),
          tabIndex: -1,
          "data-gantt-bar": "",
          "data-gantt-actual": "",
          "data-gantt-actual-open": c.open ? "" : void 0,
          className: o(
            "zen-absolute zen-overflow-hidden zen-rounded-zen-sm zen-border",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            !M && Ie[e.status],
            d.clippedStart && "zen-rounded-s-none zen-border-s-0",
            (d.clippedEnd || c.open) && "zen-rounded-e-none",
            p && "hover:zen-brightness-95",
            P
          ),
          style: {
            insetInlineStart: `${d.startPct}%`,
            width: `${d.widthPct}%`,
            top: z.barTop,
            height: z.barHeight,
            ...M ? _e(M) : {}
          },
          title: G,
          children: [
            /* @__PURE__ */ r("span", { className: "zen-sr-only", children: [
              e.span ? T.t(e.progress === null ? "gantt.barSpan" : "gantt.barSpanProgress", {
                start: g(e.span.start),
                end: g(e.span.end),
                status: T.t(le[e.status]),
                percent: Math.round(A)
              }) : T.t("gantt.noDates"),
              `, ${h}`
            ] }),
            e.progress !== null && /* @__PURE__ */ n(
              "span",
              {
                "aria-hidden": "true",
                className: o("zen-absolute zen-inset-y-0 zen-start-0", !M && ve[e.status]),
                style: { width: `${A}%`, ...M ? { backgroundColor: M } : {} }
              }
            ),
            Z && /* @__PURE__ */ n(
              "span",
              {
                "aria-hidden": "true",
                className: o(
                  "zen-absolute zen-flex zen-items-center zen-whitespace-nowrap zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium",
                  Re
                ),
                style: De,
                children: v
              }
            ),
            y && /* @__PURE__ */ n(
              "span",
              {
                "aria-hidden": "true",
                "data-gantt-accent": "",
                className: "zen-absolute zen-inset-y-0 zen-start-0 zen-w-1 zen-rounded-s-zen-sm",
                style: { backgroundColor: y }
              }
            )
          ]
        }
      ),
      v && !Z && /* @__PURE__ */ n(
        "span",
        {
          "aria-hidden": "true",
          className: "zen-pointer-events-none zen-absolute zen-flex zen-items-center zen-whitespace-nowrap zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium zen-text-zen-muted-fg",
          style: { ...Q(d.startPct, d.widthPct, v), top: z.barTop, height: z.barHeight },
          children: v
        }
      )
    ] }) : /* @__PURE__ */ r("span", { className: "zen-sr-only", children: [
      e.span ? T.t("gantt.notInRange") : T.t("gantt.noDates"),
      `, ${h}`
    ] })
  ] });
}, Vt = ({ assignees: e }) => !e || e.length === 0 ? null : /* @__PURE__ */ r(It, { children: [
  /* @__PURE__ */ n(Nt, { asChild: !0, children: /* @__PURE__ */ n("span", { "aria-hidden": "true", className: "zen-rounded-zen-full", children: /* @__PURE__ */ n(ft, { max: _t, size: "xs", spacing: "loose", children: e.map((a) => /* @__PURE__ */ r(bt, { size: "xs", children: [
    a.src && /* @__PURE__ */ n(vt, { src: a.src, alt: a.name }),
    /* @__PURE__ */ n(xt, { children: Ot(a) })
  ] }, a.id)) }) }) }),
  /* @__PURE__ */ n($t, { children: e.map((a) => a.name).join(", ") })
] });
export {
  on as Gantt
};
//# sourceMappingURL=index109.js.map
