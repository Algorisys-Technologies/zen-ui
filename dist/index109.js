import { jsx as s, jsxs as m, Fragment as Me } from "react/jsx-runtime";
import * as l from "react";
import { cn as d } from "./index199.js";
import "./index208.js";
import "./index28.js";
import { nowPct as Fe, placeAppointment as Xe } from "./index255.js";
import { ganttFitRange as Oe, flattenGanttTasks as Ve, ganttConnectors as we, formatGanttVariance as Ue } from "./index110.js";
import { scheduleRowPx as We, ganttBarPx as qe } from "./index256.js";
import { AvatarGroup as Qe, Avatar as Ye, AvatarImage as He, AvatarFallback as Je } from "./index45.js";
import { Badge as Te } from "./index64.js";
import { EmptyState as Ke, EmptyStateIcon as Ze, EmptyStateTitle as et, EmptyStateDescription as tt } from "./index99.js";
import { Icon as Ne } from "./index63.js";
import { Skeleton as se } from "./index68.js";
import { TooltipProvider as nt, Tooltip as st, TooltipTrigger as at, TooltipContent as rt } from "./index72.js";
import { useScrollerMetrics as it, INDENT_PX as Ie, useScheduleAxis as ot, ScheduleGrid as lt } from "./index257.js";
import { useLocale as oe } from "./index90.js";
const ae = (e, n) => (e - n) / 2, Pe = {
  name: 180,
  /* Three xs avatars at "loose" spacing plus a "+N" chip is 84px, and the cell
     costs 16px of padding either side of it. */
  assignees: 96,
  status: 88,
  variance: 72
}, ct = {
  name: "gantt.column.name",
  assignees: "gantt.column.assignees",
  status: "gantt.column.status",
  variance: "gantt.column.variance"
}, ye = {
  name: 1,
  assignees: 2,
  status: 3,
  variance: 4,
  timeline: 5
}, dt = ["name", "assignees", "status", "variance"], ut = 3, mt = 44, zt = 85, ht = 30, Ae = {
  "not-started": "zen-bg-zen-muted zen-border-zen-border",
  "on-track": "zen-bg-zen-info-soft zen-border-zen-info",
  delayed: "zen-bg-zen-error-soft zen-border-zen-error",
  complete: "zen-bg-zen-success-soft zen-border-zen-success"
}, re = {
  "not-started": "zen-bg-zen-neutral",
  "on-track": "zen-bg-zen-info",
  delayed: "zen-bg-zen-error",
  complete: "zen-bg-zen-success"
}, gt = {
  "not-started": "zen-text-zen-foreground",
  "on-track": "zen-text-zen-info-fg",
  delayed: "zen-text-zen-error-fg",
  complete: "zen-text-zen-success-fg"
}, ft = {
  "not-started": "neutral",
  "on-track": "info",
  delayed: "error",
  complete: "success"
}, ie = {
  "not-started": "gantt.status.notStarted",
  "on-track": "gantt.status.onTrack",
  delayed: "gantt.status.delayed",
  complete: "gantt.status.complete"
}, pt = (e) => e.initials ?? e.name.split(/\s+/).filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase(), bt = (e) => {
  const n = [], z = (i) => {
    for (const r of i)
      r.children && r.children.length > 0 && (n.push(r.id), z(r.children));
  };
  return z(e), n;
}, L = (e) => `${e.getDate()} ${e.toLocaleString(void 0, { month: "short" })} ${e.getFullYear()}`, Bt = ({
  tasks: e,
  dependencies: n,
  showDependencies: z = !0,
  defaultView: i,
  view: r,
  onViewChange: p,
  views: u,
  defaultDate: E,
  date: b,
  onDateChange: v,
  expanded: x,
  defaultExpanded: h,
  onExpandedChange: le,
  onTaskClick: P,
  now: Y,
  calendar: S,
  hourStep: H,
  columnWidth: T,
  hideToolbar: o,
  columns: O,
  loading: $,
  loadingRows: V = 6,
  emptyState: ce,
  rowHeight: w,
  maxBodyHeight: _,
  headerClassName: g,
  headerGroups: C,
  continuous: y,
  density: I,
  rowClassName: D,
  barClassName: A,
  barAccent: U,
  dependencyStyle: J,
  className: K
}) => {
  const M = oe(), R = qe(I), B = Math.max(R + 4, We(I, w)), [ke, Le] = l.useState(i ?? "fit"), [Ee, $e] = l.useState(E ?? /* @__PURE__ */ new Date()), [_e, Ce] = l.useState(h ?? null), de = l.useRef(null), { metrics: ue, setMetrics: De } = it(de), N = r ?? ke, Z = b ?? Ee, ee = l.useRef(null);
  ee.current === null && (ee.current = /* @__PURE__ */ new Date());
  const G = Y ?? ee.current, te = G.getTime(), me = Z.getTime(), ze = (t) => {
    b === void 0 && $e(t), v?.(t);
  }, j = x ?? _e, ne = l.useMemo(
    () => j === null ? null : new Set(j),
    [j]
  ), he = (t) => {
    const a = j ?? bt(e), c = a.includes(t) ? a.filter((f) => f !== t) : [...a, t];
    x === void 0 && Ce(c), le?.(c);
  }, ge = l.useMemo(
    () => N === "fit" || y ? Oe(e ?? [], { calendar: S }) : null,
    [N, y, e, S]
  ), F = N === "fit" ? ge : null, fe = C ?? !!y, pe = O ?? dt, be = l.useMemo(
    () => pe.map((t) => ({
      key: t,
      label: M.t(ct[t]),
      width: Pe[t],
      colIndex: ye[t],
      className: t === "name" ? "zen-min-w-0 zen-gap-1 zen-pe-2" : "zen-px-2",
      style: t === "name" ? (a) => ({ paddingInlineStart: 8 + a.depth * Ie }) : void 0,
      /* The avatars are decorative and the "+N" chip hides names outright, so
         the cell says who — the tooltip is the pointer's version of it. */
      ariaLabel: t === "assignees" ? (a) => a.task.assignees && a.task.assignees.length > 0 ? a.task.assignees.map((c) => c.name).join(", ") : void 0 : void 0,
      render: (a) => /* @__PURE__ */ s(vt, { column: t, row: a, onToggle: he })
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pe.join(","), j, e, M]
  ), ve = ot({
    view: N,
    anchor: Z,
    fitRange: F,
    now: G,
    calendar: S,
    hourStep: H,
    columnWidth: T,
    paneColumns: be,
    available: ue.width,
    grouped: fe,
    continuous: y,
    plan: ge
  }), { range: X, axisWidth: W, minGapMs: xe } = ve, { rows: k, rowIndexById: Se } = l.useMemo(
    () => Ve(
      e ?? [],
      (t) => ne === null ? !0 : ne.has(t.id),
      G,
      { calendar: S, minGapMs: xe }
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [e, ne, te, S, xe]
  ), q = l.useMemo(() => {
    const t = /* @__PURE__ */ new Map();
    for (const a of k) {
      if (!a.span) continue;
      if (a.task.milestone) {
        const f = Fe(X, a.span.start);
        f !== null && t.set(a.index, { startPct: f, widthPct: 0, clippedStart: !1, clippedEnd: !1 });
        continue;
      }
      const c = Xe(a.span, X);
      c && t.set(a.index, c);
    }
    return t;
  }, [k, X]), Re = l.useMemo(() => {
    if (!z || !n || n.length === 0) return [];
    const t = /* @__PURE__ */ new Map(), a = W > 0 ? R / 2 / W * 100 : 0;
    for (const [c, f] of Se) {
      const Q = q.get(f);
      Q && (k[f]?.task.milestone ? t.set(c, { rowIndex: f, startPct: Q.startPct - a, widthPct: 2 * a }) : t.set(c, { rowIndex: f, startPct: Q.startPct, widthPct: Q.widthPct }));
    }
    return we(t, n, { axisWidth: W, rowHeight: B });
  }, [z, n, Se, q, k, W, B, R]), Be = (t) => {
    if (N === "fit" && t !== "fit" && F) {
      const a = F.start.getTime(), c = F.end.getTime();
      (me < a || me >= c) && ze(te >= a && te < c ? G : F.start);
    }
    r === void 0 && Le(t), p?.(t);
  }, Ge = l.useCallback(
    (t, a) => /* @__PURE__ */ s(
      xt,
      {
        row: t,
        range: X,
        axisWidth: a,
        placement: q.get(t.index) ?? null,
        onTaskClick: P,
        rowHeight: B,
        barPx: R,
        barClass: A?.(t.task) || void 0,
        accent: U?.(t.task) || void 0
      }
    ),
    [X, q, P, B, R, A, U]
  ), je = l.useMemo(
    () => J ? (t) => J(t.dependency) : void 0,
    [J]
  );
  return $ ? /* @__PURE__ */ s(
    "div",
    {
      className: d(
        "zen-flex zen-w-full zen-flex-col zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3",
        K
      ),
      role: "status",
      "aria-label": M.t("gantt.loadingSchedule"),
      children: Array.from({ length: V }, (t, a) => /* @__PURE__ */ m("div", { className: "zen-flex zen-items-center zen-gap-3", children: [
        /* @__PURE__ */ s(se, { className: "zen-h-4", style: { width: Pe.name - 24 - a % 3 * Ie } }),
        /* @__PURE__ */ s(se, { className: "zen-h-4 zen-w-16" }),
        /* @__PURE__ */ s(
          se,
          {
            className: "zen-h-4",
            style: { marginInlineStart: `${a * 37 % 45}%`, width: `${20 + a * 13 % 30}%` }
          }
        )
      ] }, a))
    }
  ) : k.length === 0 ? /* @__PURE__ */ s("div", { className: d("zen-w-full", K), children: ce ?? /* @__PURE__ */ m(Ke, { bordered: !0, children: [
    /* @__PURE__ */ s(Ze, { children: /* @__PURE__ */ s(Ne, { name: "calendar", size: 22 }) }),
    /* @__PURE__ */ s(et, { children: M.t("gantt.nothingScheduled") }),
    /* @__PURE__ */ s(tt, { children: M.t("gantt.addATaskWithA") })
  ] }) }) : /* @__PURE__ */ s(nt, { delayDuration: 200, children: /* @__PURE__ */ s(
    lt,
    {
      rows: k,
      rowId: (t) => t.task.id,
      columns: be,
      colCount: 5,
      timelineColIndex: ye.timeline,
      renderTrack: Ge,
      rowHeight: B,
      rowClass: D ? (t) => D(t.task, t) : void 0,
      maxBodyHeight: _,
      headerClassName: g,
      headerGroups: fe,
      view: N,
      anchor: Z,
      now: G,
      connectors: Re,
      connectorStyle: je,
      views: u,
      hideToolbar: o,
      onViewChange: Be,
      onDateChange: ze,
      onToggle: (t) => he(t.task.id),
      onActivate: (t) => P?.(t.task, t),
      ariaLabel: M.t("gantt.projectSchedule"),
      className: K,
      scrollerRef: de,
      axis: ve,
      metrics: ue,
      setMetrics: De
    }
  ) });
}, vt = ({
  column: e,
  row: n,
  onToggle: z
}) => {
  const i = oe(), { task: r } = n;
  if (e === "name")
    return /* @__PURE__ */ m(Me, { children: [
      n.hasChildren ? /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          tabIndex: -1,
          onClick: () => z(r.id),
          "aria-label": i.t(n.expanded ? "gantt.collapseTask" : "gantt.expandTask", { name: r.name }),
          className: "zen-flex zen-h-5 zen-w-5 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-text-zen-muted-fg hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          children: /* @__PURE__ */ s(
            Ne,
            {
              name: n.expanded ? "chevron-down" : "chevron-right",
              size: 14,
              className: n.expanded ? void 0 : "rtl:zen-rotate-180"
            }
          )
        }
      ) : (
        /* A spacer, not a hidden chevron: leaves must line up with their
           siblings' text, or every leaf reads as one level shallower. */
        /* @__PURE__ */ s("span", { "aria-hidden": "true", className: "zen-h-5 zen-w-5 zen-shrink-0" })
      ),
      /* @__PURE__ */ m("span", { className: "zen-min-w-0", children: [
        /* @__PURE__ */ s(
          "span",
          {
            className: d(
              "zen-block zen-truncate zen-text-sm zen-text-zen-foreground",
              n.hasChildren && "zen-font-semibold"
            ),
            title: r.name,
            children: r.name
          }
        ),
        r.subtitle && /* @__PURE__ */ s("span", { className: "zen-block zen-truncate zen-[font-size:var(--zen-schedule-label-font-size)] zen-text-zen-muted-fg", children: r.subtitle })
      ] })
    ] });
  if (e === "assignees") return /* @__PURE__ */ s(St, { assignees: r.assignees });
  if (e === "status")
    return /* @__PURE__ */ s(Te, { variant: "soft", color: ft[n.status], className: "zen-truncate", children: r.statusLabel ?? i.t(ie[n.status]) });
  const p = Ue(n.variance);
  return p ? /* @__PURE__ */ s(
    Te,
    {
      dir: "ltr",
      variant: "soft",
      color: n.variance === null || n.variance === 0 ? "neutral" : n.variance > 0 ? "error" : "success",
      children: p
    }
  ) : null;
}, xt = ({
  row: e,
  range: n,
  axisWidth: z,
  placement: i,
  onTaskClick: r,
  rowHeight: p,
  barPx: u,
  barClass: E,
  accent: b
}) => {
  const v = oe(), { task: x } = e, h = e.progress ?? 0, P = (i ? i.widthPct / 100 * z : 0) < mt, Y = !P && h >= zt, S = i ? i.startPct + i.widthPct : 0, H = (100 - S) / 100 * z < ht, T = l.useMemo(() => {
    if (!e.segments || !e.span) return null;
    const o = Math.max(e.span.start.getTime(), n.start.getTime()), O = Math.min(e.span.end.getTime(), n.end.getTime()), $ = O - o;
    if ($ <= 0) return null;
    const V = e.segments.map((g) => g.end.getTime() - g.start.getTime());
    let w = V.reduce((g, C) => g + C, 0) * h / 100;
    const _ = [];
    return e.segments.forEach((g, C) => {
      const y = Math.max(0, Math.min(w, V[C]));
      w -= y;
      const I = Math.max(g.start.getTime(), o), D = Math.min(g.end.getTime(), O);
      if (D <= I) return;
      const A = D - I, U = Math.max(0, Math.min(y - (I - g.start.getTime()), A));
      _.push({
        key: I,
        startPct: (I - o) / $ * 100,
        widthPct: A / $ * 100,
        fillPct: A > 0 ? U / A * 100 : 0
      });
    }), _.length > 0 ? _ : null;
  }, [e.segments, e.span, h, n]);
  if (!i)
    return /* @__PURE__ */ s("span", { className: "zen-sr-only", children: e.span ? v.t("gantt.notInRange") : v.t("gantt.noDates") });
  if (x.milestone) {
    const o = u / Math.SQRT2;
    return /* @__PURE__ */ m(
      "button",
      {
        type: "button",
        onClick: () => r?.(x, e),
        tabIndex: -1,
        "data-gantt-bar": "",
        "data-gantt-milestone": "",
        className: d(
          "zen-absolute zen-flex zen-items-center zen-justify-center zen-rounded-zen-sm",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
        ),
        style: {
          insetInlineStart: `calc(${i.startPct}% - ${u / 2}px)`,
          top: ae(p, u),
          width: u,
          height: u
        },
        title: `${x.name} · ${L(e.span.start)}`,
        children: [
          /* @__PURE__ */ s("span", { className: "zen-sr-only", children: v.t("gantt.milestone", {
            date: L(e.span.start),
            status: v.t(ie[e.status])
          }) }),
          /* @__PURE__ */ s(
            "span",
            {
              "aria-hidden": "true",
              "data-gantt-accent": b ? "" : void 0,
              className: d("zen-block zen-shrink-0 zen-rotate-45 zen-rounded-[2px]", re[e.status], E),
              style: {
                width: o,
                height: o,
                ...b ? { boxSizing: "border-box", borderWidth: 2, borderStyle: "solid", borderColor: b } : {}
              }
            }
          )
        ]
      }
    );
  }
  return /* @__PURE__ */ m(Me, { children: [
    /* @__PURE__ */ m(
      "button",
      {
        type: "button",
        onClick: () => r?.(x, e),
        tabIndex: -1,
        "data-gantt-bar": "",
        className: d(
          "zen-absolute zen-rounded-zen-sm",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          /* Drawn as pieces, the button is only the hit area and the focus
             ring — the skin moves onto each piece, or the gaps would be
             filled by the button's own background. */
          T === null && d("zen-overflow-hidden zen-border", Ae[e.status], E),
          /* Square off a cut edge so a bar continuing past the view does
             not look like it ends there. */
          T === null && i.clippedStart && "zen-rounded-s-none zen-border-s-0",
          T === null && i.clippedEnd && "zen-rounded-e-none zen-border-e-0",
          r && "hover:zen-brightness-95"
        ),
        style: {
          insetInlineStart: `${i.startPct}%`,
          width: `${i.widthPct}%`,
          top: ae(p, u),
          height: u
        },
        title: `${x.name} · ${L(e.span.start)} – ${L(e.span.end)}${e.progress === null ? "" : ` · ${Math.round(h)}%`}`,
        children: [
          /* @__PURE__ */ s("span", { className: "zen-sr-only", children: v.t(e.progress === null ? "gantt.barSpan" : "gantt.barSpanProgress", {
            start: L(e.span.start),
            end: L(e.span.end),
            status: v.t(ie[e.status]),
            percent: Math.round(h)
          }) }),
          T !== null && T.map((o) => /* @__PURE__ */ s(
            "span",
            {
              "aria-hidden": "true",
              className: d("zen-absolute zen-inset-y-0 zen-overflow-hidden", Ae[e.status], "zen-rounded-zen-sm zen-border", E),
              style: { insetInlineStart: `${o.startPct}%`, width: `${o.widthPct}%` },
              children: e.progress !== null && o.fillPct > 0 && /* @__PURE__ */ s(
                "span",
                {
                  className: d("zen-absolute zen-inset-y-0 zen-start-0", re[e.status]),
                  style: { width: `${o.fillPct}%` }
                }
              )
            },
            o.key
          )),
          T === null && e.progress !== null && /* @__PURE__ */ s(
            "span",
            {
              "aria-hidden": "true",
              className: d("zen-absolute zen-inset-y-0 zen-start-0", re[e.status]),
              style: { width: `${h}%` }
            }
          ),
          e.progress !== null && !P && /* @__PURE__ */ m(
            "span",
            {
              "aria-hidden": "true",
              className: d(
                "zen-absolute zen-inset-y-0 zen-flex zen-items-center zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium",
                Y ? d("zen-start-1", gt[e.status]) : "zen-end-1 zen-text-zen-foreground"
              ),
              children: [
                Math.round(h),
                "%"
              ]
            }
          ),
          b && /* @__PURE__ */ s(
            "span",
            {
              "aria-hidden": "true",
              "data-gantt-accent": "",
              className: "zen-absolute zen-inset-y-0 zen-start-0 zen-w-1 zen-rounded-s-zen-sm",
              style: { backgroundColor: b }
            }
          )
        ]
      }
    ),
    e.progress !== null && P && /* @__PURE__ */ m(
      "span",
      {
        "aria-hidden": "true",
        className: "zen-absolute zen-flex zen-items-center zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium zen-text-zen-muted-fg",
        style: {
          ...H ? { insetInlineEnd: `calc(${100 - i.startPct}% + 4px)` } : { insetInlineStart: `calc(${S}% + 4px)` },
          top: ae(p, u),
          height: u
        },
        children: [
          Math.round(h),
          "%"
        ]
      }
    )
  ] });
}, St = ({ assignees: e }) => !e || e.length === 0 ? null : /* @__PURE__ */ m(st, { children: [
  /* @__PURE__ */ s(at, { asChild: !0, children: /* @__PURE__ */ s("span", { "aria-hidden": "true", className: "zen-rounded-zen-full", children: /* @__PURE__ */ s(Qe, { max: ut, size: "xs", spacing: "loose", children: e.map((n) => /* @__PURE__ */ m(Ye, { size: "xs", children: [
    n.src && /* @__PURE__ */ s(He, { src: n.src, alt: n.name }),
    /* @__PURE__ */ s(Je, { children: pt(n) })
  ] }, n.id)) }) }) }),
  /* @__PURE__ */ s(rt, { children: e.map((n) => n.name).join(", ") })
] });
export {
  Bt as Gantt
};
//# sourceMappingURL=index109.js.map
