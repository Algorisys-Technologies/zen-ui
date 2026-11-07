import { jsx as s, jsxs as f, Fragment as he } from "react/jsx-runtime";
import * as l from "react";
import { cn as h } from "./index160.js";
import "./index28.js";
import { placeAppointment as Ne } from "./index215.js";
import { ganttFitRange as Me, flattenGanttTasks as ye, ganttConnectors as Le, formatGanttVariance as Ee } from "./index110.js";
import { AvatarGroup as _e, Avatar as ke, AvatarImage as Ce, AvatarFallback as $e } from "./index45.js";
import { Badge as le } from "./index64.js";
import { EmptyState as De, EmptyStateIcon as Re, EmptyStateTitle as Be, EmptyStateDescription as Xe } from "./index99.js";
import { Icon as fe } from "./index63.js";
import { Skeleton as q } from "./index68.js";
import { TooltipProvider as Fe, Tooltip as Ge, TooltipTrigger as Oe, TooltipContent as je } from "./index72.js";
import { useScrollerMetrics as we, INDENT_PX as ce, useScheduleAxis as Ve, ScheduleGrid as Ue, ROW_PX as pe } from "./index216.js";
import { useLocale as Y } from "./index90.js";
const H = 18, de = (pe - H) / 2, ue = {
  name: 180,
  /* Three xs avatars at "loose" spacing plus a "+N" chip is 84px, and the cell
     costs 16px of padding either side of it. */
  assignees: 96,
  status: 88,
  variance: 72
}, We = {
  name: "gantt.column.name",
  assignees: "gantt.column.assignees",
  status: "gantt.column.status",
  variance: "gantt.column.variance"
}, me = {
  name: 1,
  assignees: 2,
  status: 3,
  variance: 4,
  timeline: 5
}, qe = ["name", "assignees", "status", "variance"], He = 3, Ye = 44, Je = 85, Ke = 30, ze = {
  "not-started": "zen-bg-zen-muted zen-border-zen-border",
  "on-track": "zen-bg-zen-info-soft zen-border-zen-info/40",
  delayed: "zen-bg-zen-error-soft zen-border-zen-error/40",
  complete: "zen-bg-zen-success-soft zen-border-zen-success/40"
}, ge = {
  "not-started": "zen-bg-zen-neutral/30",
  "on-track": "zen-bg-zen-info",
  delayed: "zen-bg-zen-error",
  complete: "zen-bg-zen-success"
}, Qe = {
  "not-started": "zen-text-zen-foreground",
  "on-track": "zen-text-zen-info-fg",
  delayed: "zen-text-zen-error-fg",
  complete: "zen-text-zen-success-fg"
}, Ze = {
  "not-started": "neutral",
  "on-track": "info",
  delayed: "error",
  complete: "success"
}, be = {
  "not-started": "gantt.status.notStarted",
  "on-track": "gantt.status.onTrack",
  delayed: "gantt.status.delayed",
  complete: "gantt.status.complete"
}, et = (e) => e.initials ?? e.name.split(/\s+/).filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase(), tt = (e) => {
  const n = [], u = (o) => {
    for (const r of o)
      r.children && r.children.length > 0 && (n.push(r.id), u(r.children));
  };
  return u(e), n;
}, F = (e) => `${e.getDate()} ${e.toLocaleString(void 0, { month: "short" })} ${e.getFullYear()}`, bt = ({
  tasks: e,
  dependencies: n,
  showDependencies: u = !0,
  defaultView: o,
  view: r,
  onViewChange: p,
  views: E,
  defaultDate: m,
  date: G,
  onDateChange: T,
  expanded: _,
  defaultExpanded: k,
  onExpandedChange: O,
  onTaskClick: z,
  now: d,
  calendar: b,
  hourStep: S,
  columnWidth: C,
  hideToolbar: J,
  columns: $,
  loading: A,
  loadingRows: g = 6,
  emptyState: P,
  className: x
}) => {
  const c = Y(), [D, v] = l.useState(o ?? "fit"), [j, xe] = l.useState(m ?? /* @__PURE__ */ new Date()), [ve, Te] = l.useState(k ?? null), K = l.useRef(null), { metrics: Q, setMetrics: Se } = we(K), I = r ?? D, w = G ?? j, V = l.useRef(null);
  V.current === null && (V.current = /* @__PURE__ */ new Date());
  const N = d ?? V.current, U = N.getTime(), Z = w.getTime(), ee = (t) => {
    G === void 0 && xe(t), T?.(t);
  }, M = _ ?? ve, W = l.useMemo(
    () => M === null ? null : new Set(M),
    [M]
  ), te = (t) => {
    const a = M ?? tt(e), i = a.includes(t) ? a.filter((L) => L !== t) : [...a, t];
    _ === void 0 && Te(i), O?.(i);
  }, y = l.useMemo(
    () => I === "fit" ? Me(e ?? [], { calendar: b }) : null,
    [I, e, b]
  ), ne = $ ?? qe, se = l.useMemo(
    () => ne.map((t) => ({
      key: t,
      label: c.t(We[t]),
      width: ue[t],
      colIndex: me[t],
      className: t === "name" ? "zen-min-w-0 zen-gap-1 zen-pe-2" : "zen-px-2",
      style: t === "name" ? (a) => ({ paddingInlineStart: 8 + a.depth * ce }) : void 0,
      /* The avatars are decorative and the "+N" chip hides names outright, so
         the cell says who — the tooltip is the pointer's version of it. */
      ariaLabel: t === "assignees" ? (a) => a.task.assignees && a.task.assignees.length > 0 ? a.task.assignees.map((i) => i.name).join(", ") : void 0 : void 0,
      render: (a) => /* @__PURE__ */ s(nt, { column: t, row: a, onToggle: te })
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ne.join(","), M, e, c]
  ), ae = Ve({
    view: I,
    anchor: w,
    fitRange: y,
    now: N,
    calendar: b,
    hourStep: S,
    columnWidth: C,
    paneColumns: se,
    available: Q.width
  }), { range: R, axisWidth: re, minGapMs: oe } = ae, { rows: B, rowIndexById: ie } = l.useMemo(
    () => ye(
      e ?? [],
      (t) => W === null ? !0 : W.has(t.id),
      N,
      { calendar: b, minGapMs: oe }
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [e, W, U, b, oe]
  ), X = l.useMemo(() => {
    const t = /* @__PURE__ */ new Map();
    for (const a of B) {
      if (!a.span) continue;
      const i = Ne(a.span, R);
      i && t.set(a.index, i);
    }
    return t;
  }, [B, R]), Ae = l.useMemo(() => {
    if (!u || !n || n.length === 0) return [];
    const t = /* @__PURE__ */ new Map();
    for (const [a, i] of ie) {
      const L = X.get(i);
      L && t.set(a, { rowIndex: i, startPct: L.startPct, widthPct: L.widthPct });
    }
    return Le(t, n, { axisWidth: re, rowHeight: pe });
  }, [u, n, ie, X, re]), Pe = (t) => {
    if (I === "fit" && t !== "fit" && y) {
      const a = y.start.getTime(), i = y.end.getTime();
      (Z < a || Z >= i) && ee(U >= a && U < i ? N : y.start);
    }
    r === void 0 && v(t), p?.(t);
  }, Ie = l.useCallback(
    (t, a) => /* @__PURE__ */ s(
      st,
      {
        row: t,
        range: R,
        axisWidth: a,
        placement: X.get(t.index) ?? null,
        onTaskClick: z
      }
    ),
    [R, X, z]
  );
  return A ? /* @__PURE__ */ s(
    "div",
    {
      className: h(
        "zen-flex zen-w-full zen-flex-col zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3",
        x
      ),
      role: "status",
      "aria-label": c.t("gantt.loadingSchedule"),
      children: Array.from({ length: g }, (t, a) => /* @__PURE__ */ f("div", { className: "zen-flex zen-items-center zen-gap-3", children: [
        /* @__PURE__ */ s(q, { className: "zen-h-4", style: { width: ue.name - 24 - a % 3 * ce } }),
        /* @__PURE__ */ s(q, { className: "zen-h-4 zen-w-16" }),
        /* @__PURE__ */ s(
          q,
          {
            className: "zen-h-4",
            style: { marginInlineStart: `${a * 37 % 45}%`, width: `${20 + a * 13 % 30}%` }
          }
        )
      ] }, a))
    }
  ) : B.length === 0 ? /* @__PURE__ */ s("div", { className: h("zen-w-full", x), children: P ?? /* @__PURE__ */ f(De, { bordered: !0, children: [
    /* @__PURE__ */ s(Re, { children: /* @__PURE__ */ s(fe, { name: "calendar", size: 22 }) }),
    /* @__PURE__ */ s(Be, { children: c.t("gantt.nothingScheduled") }),
    /* @__PURE__ */ s(Xe, { children: c.t("gantt.addATaskWithA") })
  ] }) }) : /* @__PURE__ */ s(Fe, { delayDuration: 200, children: /* @__PURE__ */ s(
    Ue,
    {
      rows: B,
      rowId: (t) => t.task.id,
      columns: se,
      colCount: 5,
      timelineColIndex: me.timeline,
      renderTrack: Ie,
      view: I,
      anchor: w,
      now: N,
      connectors: Ae,
      views: E,
      hideToolbar: J,
      onViewChange: Pe,
      onDateChange: ee,
      onToggle: (t) => te(t.task.id),
      onActivate: (t) => z?.(t.task, t),
      ariaLabel: c.t("gantt.projectSchedule"),
      className: x,
      scrollerRef: K,
      axis: ae,
      metrics: Q,
      setMetrics: Se
    }
  ) });
}, nt = ({
  column: e,
  row: n,
  onToggle: u
}) => {
  const o = Y(), { task: r } = n;
  if (e === "name")
    return /* @__PURE__ */ f(he, { children: [
      n.hasChildren ? /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          tabIndex: -1,
          onClick: () => u(r.id),
          "aria-label": o.t(n.expanded ? "gantt.collapseTask" : "gantt.expandTask", { name: r.name }),
          className: "zen-flex zen-h-5 zen-w-5 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-text-zen-muted-fg hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          children: /* @__PURE__ */ s(
            fe,
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
      /* @__PURE__ */ f("span", { className: "zen-min-w-0", children: [
        /* @__PURE__ */ s(
          "span",
          {
            className: h(
              "zen-block zen-truncate zen-text-sm zen-text-zen-foreground",
              n.hasChildren && "zen-font-semibold"
            ),
            title: r.name,
            children: r.name
          }
        ),
        r.subtitle && /* @__PURE__ */ s("span", { className: "zen-block zen-truncate zen-text-[10px] zen-text-zen-muted-fg", children: r.subtitle })
      ] })
    ] });
  if (e === "assignees") return /* @__PURE__ */ s(at, { assignees: r.assignees });
  if (e === "status")
    return /* @__PURE__ */ s(le, { variant: "soft", color: Ze[n.status], className: "zen-truncate", children: r.statusLabel ?? o.t(be[n.status]) });
  const p = Ee(n.variance);
  return p ? /* @__PURE__ */ s(
    le,
    {
      dir: "ltr",
      variant: "soft",
      color: n.variance === null || n.variance === 0 ? "neutral" : n.variance > 0 ? "error" : "success",
      children: p
    }
  ) : null;
}, st = ({
  row: e,
  range: n,
  axisWidth: u,
  placement: o,
  onTaskClick: r
}) => {
  const p = Y(), { task: E } = e, m = e.progress ?? 0, T = (o ? o.widthPct / 100 * u : 0) < Ye, _ = !T && m >= Je, k = o ? o.startPct + o.widthPct : 0, O = (100 - k) / 100 * u < Ke, z = l.useMemo(() => {
    if (!e.segments || !e.span) return null;
    const d = Math.max(e.span.start.getTime(), n.start.getTime()), b = Math.min(e.span.end.getTime(), n.end.getTime()), S = b - d;
    if (S <= 0) return null;
    const C = e.segments.map((g) => g.end.getTime() - g.start.getTime());
    let $ = C.reduce((g, P) => g + P, 0) * m / 100;
    const A = [];
    return e.segments.forEach((g, P) => {
      const x = Math.max(0, Math.min($, C[P]));
      $ -= x;
      const c = Math.max(g.start.getTime(), d), D = Math.min(g.end.getTime(), b);
      if (D <= c) return;
      const v = D - c, j = Math.max(0, Math.min(x - (c - g.start.getTime()), v));
      A.push({
        key: c,
        startPct: (c - d) / S * 100,
        widthPct: v / S * 100,
        fillPct: v > 0 ? j / v * 100 : 0
      });
    }), A.length > 0 ? A : null;
  }, [e.segments, e.span, m, n]);
  return o ? /* @__PURE__ */ f(he, { children: [
    /* @__PURE__ */ f(
      "button",
      {
        type: "button",
        onClick: () => r?.(E, e),
        tabIndex: -1,
        "data-gantt-bar": "",
        className: h(
          "zen-absolute zen-rounded-zen-sm",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          /* Drawn as pieces, the button is only the hit area and the focus
             ring — the skin moves onto each piece, or the gaps would be
             filled by the button's own background. */
          z === null && h("zen-overflow-hidden zen-border", ze[e.status]),
          /* Square off a cut edge so a bar continuing past the view does
             not look like it ends there. */
          z === null && o.clippedStart && "zen-rounded-s-none zen-border-s-0",
          z === null && o.clippedEnd && "zen-rounded-e-none zen-border-e-0",
          r && "hover:zen-brightness-95"
        ),
        style: {
          insetInlineStart: `${o.startPct}%`,
          width: `${o.widthPct}%`,
          top: de,
          height: H
        },
        title: `${E.name} · ${F(e.span.start)} – ${F(e.span.end)}${e.progress === null ? "" : ` · ${Math.round(m)}%`}`,
        children: [
          /* @__PURE__ */ s("span", { className: "zen-sr-only", children: p.t(e.progress === null ? "gantt.barSpan" : "gantt.barSpanProgress", {
            start: F(e.span.start),
            end: F(e.span.end),
            status: p.t(be[e.status]),
            percent: Math.round(m)
          }) }),
          z !== null && z.map((d) => /* @__PURE__ */ s(
            "span",
            {
              "aria-hidden": "true",
              className: h("zen-absolute zen-inset-y-0 zen-overflow-hidden", ze[e.status], "zen-rounded-zen-sm zen-border"),
              style: { insetInlineStart: `${d.startPct}%`, width: `${d.widthPct}%` },
              children: e.progress !== null && d.fillPct > 0 && /* @__PURE__ */ s(
                "span",
                {
                  className: h("zen-absolute zen-inset-y-0 zen-start-0", ge[e.status]),
                  style: { width: `${d.fillPct}%` }
                }
              )
            },
            d.key
          )),
          z === null && e.progress !== null && /* @__PURE__ */ s(
            "span",
            {
              "aria-hidden": "true",
              className: h("zen-absolute zen-inset-y-0 zen-start-0", ge[e.status]),
              style: { width: `${m}%` }
            }
          ),
          e.progress !== null && !T && /* @__PURE__ */ f(
            "span",
            {
              "aria-hidden": "true",
              className: h(
                "zen-absolute zen-inset-y-0 zen-flex zen-items-center zen-text-[10px] zen-font-medium",
                _ ? h("zen-start-1", Qe[e.status]) : "zen-end-1 zen-text-zen-foreground"
              ),
              children: [
                Math.round(m),
                "%"
              ]
            }
          )
        ]
      }
    ),
    e.progress !== null && T && /* @__PURE__ */ f(
      "span",
      {
        "aria-hidden": "true",
        className: "zen-absolute zen-flex zen-items-center zen-text-[10px] zen-font-medium zen-text-zen-muted-fg",
        style: {
          ...O ? { insetInlineEnd: `calc(${100 - o.startPct}% + 4px)` } : { insetInlineStart: `calc(${k}% + 4px)` },
          top: de,
          height: H
        },
        children: [
          Math.round(m),
          "%"
        ]
      }
    )
  ] }) : /* @__PURE__ */ s("span", { className: "zen-sr-only", children: e.span ? p.t("gantt.notInRange") : p.t("gantt.noDates") });
}, at = ({ assignees: e }) => !e || e.length === 0 ? null : /* @__PURE__ */ f(Ge, { children: [
  /* @__PURE__ */ s(Oe, { asChild: !0, children: /* @__PURE__ */ s("span", { "aria-hidden": "true", className: "zen-rounded-zen-full", children: /* @__PURE__ */ s(_e, { max: He, size: "xs", spacing: "loose", children: e.map((n) => /* @__PURE__ */ f(ke, { size: "xs", children: [
    n.src && /* @__PURE__ */ s(Ce, { src: n.src, alt: n.name }),
    /* @__PURE__ */ s($e, { children: et(n) })
  ] }, n.id)) }) }) }),
  /* @__PURE__ */ s(je, { children: e.map((n) => n.name).join(", ") })
] });
export {
  bt as Gantt
};
//# sourceMappingURL=index109.js.map
