import { jsx as s, jsxs as h, Fragment as ze } from "react/jsx-runtime";
import * as c from "react";
import { cn as z } from "./index143.js";
import "./index24.js";
import { placeAppointment as Ne } from "./index183.js";
import { ganttFitRange as Pe, flattenGanttTasks as Ie, ganttConnectors as Me, formatGanttVariance as ye } from "./index98.js";
import { AvatarGroup as Le, Avatar as $e, AvatarImage as Ee, AvatarFallback as _e } from "./index41.js";
import { Badge as ie } from "./index57.js";
import { EmptyState as Ce, EmptyStateIcon as ke, EmptyStateTitle as De, EmptyStateDescription as Be } from "./index87.js";
import { Icon as he } from "./index56.js";
import { Skeleton as U } from "./index61.js";
import { TooltipProvider as Re, Tooltip as Oe, TooltipTrigger as Xe, TooltipContent as we } from "./index65.js";
import { useScrollerMetrics as Fe, INDENT_PX as oe, useScheduleAxis as Ge, ScheduleGrid as je, ROW_PX as fe } from "./index184.js";
const W = 18, le = (fe - W) / 2, ce = {
  name: 180,
  /* Three xs avatars at "loose" spacing plus a "+N" chip is 84px, and the cell
     costs 16px of padding either side of it. */
  assignees: 96,
  status: 88,
  variance: 72
}, Ve = {
  name: "Task",
  assignees: "Assignees",
  status: "Status",
  variance: "Variance"
}, de = {
  name: 1,
  assignees: 2,
  status: 3,
  variance: 4,
  timeline: 5
}, Ue = ["name", "assignees", "status", "variance"], We = 3, qe = 44, He = 85, Ye = 30, ue = {
  "not-started": "zen-bg-zen-muted zen-border-zen-border",
  "on-track": "zen-bg-zen-info-soft zen-border-zen-info/40",
  delayed: "zen-bg-zen-error-soft zen-border-zen-error/40",
  complete: "zen-bg-zen-success-soft zen-border-zen-success/40"
}, me = {
  "not-started": "zen-bg-zen-neutral/30",
  "on-track": "zen-bg-zen-info",
  delayed: "zen-bg-zen-error",
  complete: "zen-bg-zen-success"
}, Je = {
  "not-started": "zen-text-zen-foreground",
  "on-track": "zen-text-zen-info-fg",
  delayed: "zen-text-zen-error-fg",
  complete: "zen-text-zen-success-fg"
}, Ke = {
  "not-started": "neutral",
  "on-track": "info",
  delayed: "error",
  complete: "success"
}, pe = {
  "not-started": "Not started",
  "on-track": "On track",
  delayed: "Delayed",
  complete: "Complete"
}, Qe = (e) => e.initials ?? e.name.split(/\s+/).filter(Boolean).slice(0, 2).map((t) => t[0]).join("").toUpperCase(), Ze = (e) => {
  const t = [], d = (r) => {
    for (const i of r)
      i.children && i.children.length > 0 && (t.push(i.id), d(i.children));
  };
  return d(e), t;
}, R = (e) => `${e.getDate()} ${e.toLocaleString(void 0, { month: "short" })} ${e.getFullYear()}`, pn = ({
  tasks: e,
  dependencies: t,
  showDependencies: d = !0,
  defaultView: r,
  view: i,
  onViewChange: y,
  views: u,
  defaultDate: q,
  date: b,
  onDateChange: O,
  expanded: v,
  defaultExpanded: X,
  onExpandedChange: g,
  onTaskClick: o,
  now: L,
  calendar: f,
  hourStep: $,
  columnWidth: H,
  hideToolbar: E,
  columns: T,
  loading: m,
  loadingRows: A = 6,
  emptyState: _,
  className: p
}) => {
  const [C, x] = c.useState(r ?? "fit"), [w, ge] = c.useState(q ?? /* @__PURE__ */ new Date()), [be, xe] = c.useState(X ?? null), Y = c.useRef(null), { metrics: J, setMetrics: ve } = Fe(Y), S = i ?? C, F = b ?? w, G = c.useRef(null);
  G.current === null && (G.current = /* @__PURE__ */ new Date());
  const N = L ?? G.current, j = N.getTime(), K = F.getTime(), Q = (n) => {
    b === void 0 && ge(n), O?.(n);
  }, P = v ?? be, V = c.useMemo(
    () => P === null ? null : new Set(P),
    [P]
  ), Z = (n) => {
    const a = P ?? Ze(e), l = a.includes(n) ? a.filter((M) => M !== n) : [...a, n];
    v === void 0 && xe(l), g?.(l);
  }, I = c.useMemo(
    () => S === "fit" ? Pe(e ?? [], { calendar: f }) : null,
    [S, e, f]
  ), ee = T ?? Ue, ne = c.useMemo(
    () => ee.map((n) => ({
      key: n,
      label: Ve[n],
      width: ce[n],
      colIndex: de[n],
      className: n === "name" ? "zen-min-w-0 zen-gap-1 zen-pe-2" : "zen-px-2",
      style: n === "name" ? (a) => ({ paddingInlineStart: 8 + a.depth * oe }) : void 0,
      /* The avatars are decorative and the "+N" chip hides names outright, so
         the cell says who — the tooltip is the pointer's version of it. */
      ariaLabel: n === "assignees" ? (a) => a.task.assignees && a.task.assignees.length > 0 ? a.task.assignees.map((l) => l.name).join(", ") : void 0 : void 0,
      render: (a) => /* @__PURE__ */ s(en, { column: n, row: a, onToggle: Z })
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ee.join(","), P, e]
  ), te = Ge({
    view: S,
    anchor: F,
    fitRange: I,
    now: N,
    calendar: f,
    hourStep: $,
    columnWidth: H,
    paneColumns: ne,
    available: J.width
  }), { range: k, axisWidth: se, minGapMs: ae } = te, { rows: D, rowIndexById: re } = c.useMemo(
    () => Ie(
      e ?? [],
      (n) => V === null ? !0 : V.has(n.id),
      N,
      { calendar: f, minGapMs: ae }
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [e, V, j, f, ae]
  ), B = c.useMemo(() => {
    const n = /* @__PURE__ */ new Map();
    for (const a of D) {
      if (!a.span) continue;
      const l = Ne(a.span, k);
      l && n.set(a.index, l);
    }
    return n;
  }, [D, k]), Te = c.useMemo(() => {
    if (!d || !t || t.length === 0) return [];
    const n = /* @__PURE__ */ new Map();
    for (const [a, l] of re) {
      const M = B.get(l);
      M && n.set(a, { rowIndex: l, startPct: M.startPct, widthPct: M.widthPct });
    }
    return Me(n, t, { axisWidth: se, rowHeight: fe });
  }, [d, t, re, B, se]), Ae = (n) => {
    if (S === "fit" && n !== "fit" && I) {
      const a = I.start.getTime(), l = I.end.getTime();
      (K < a || K >= l) && Q(j >= a && j < l ? N : I.start);
    }
    i === void 0 && x(n), y?.(n);
  }, Se = c.useCallback(
    (n, a) => /* @__PURE__ */ s(
      nn,
      {
        row: n,
        range: k,
        axisWidth: a,
        placement: B.get(n.index) ?? null,
        onTaskClick: o
      }
    ),
    [k, B, o]
  );
  return m ? /* @__PURE__ */ s(
    "div",
    {
      className: z(
        "zen-flex zen-w-full zen-flex-col zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3",
        p
      ),
      role: "status",
      "aria-label": "Loading schedule",
      children: Array.from({ length: A }, (n, a) => /* @__PURE__ */ h("div", { className: "zen-flex zen-items-center zen-gap-3", children: [
        /* @__PURE__ */ s(U, { className: "zen-h-4", style: { width: ce.name - 24 - a % 3 * oe } }),
        /* @__PURE__ */ s(U, { className: "zen-h-4 zen-w-16" }),
        /* @__PURE__ */ s(
          U,
          {
            className: "zen-h-4",
            style: { marginInlineStart: `${a * 37 % 45}%`, width: `${20 + a * 13 % 30}%` }
          }
        )
      ] }, a))
    }
  ) : D.length === 0 ? /* @__PURE__ */ s("div", { className: z("zen-w-full", p), children: _ ?? /* @__PURE__ */ h(Ce, { bordered: !0, children: [
    /* @__PURE__ */ s(ke, { children: /* @__PURE__ */ s(he, { name: "calendar", size: 22 }) }),
    /* @__PURE__ */ s(De, { children: "Nothing scheduled" }),
    /* @__PURE__ */ s(Be, { children: "Add a task with a start and an end date and it will appear on the timeline." })
  ] }) }) : /* @__PURE__ */ s(Re, { delayDuration: 200, children: /* @__PURE__ */ s(
    je,
    {
      rows: D,
      rowId: (n) => n.task.id,
      columns: ne,
      colCount: 5,
      timelineColIndex: de.timeline,
      renderTrack: Se,
      view: S,
      anchor: F,
      now: N,
      connectors: Te,
      views: u,
      hideToolbar: E,
      onViewChange: Ae,
      onDateChange: Q,
      onToggle: (n) => Z(n.task.id),
      onActivate: (n) => o?.(n.task, n),
      ariaLabel: "Project schedule",
      className: p,
      scrollerRef: Y,
      axis: te,
      metrics: J,
      setMetrics: ve
    }
  ) });
}, en = ({
  column: e,
  row: t,
  onToggle: d
}) => {
  const { task: r } = t;
  if (e === "name")
    return /* @__PURE__ */ h(ze, { children: [
      t.hasChildren ? /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          tabIndex: -1,
          onClick: () => d(r.id),
          "aria-label": t.expanded ? `Collapse ${r.name}` : `Expand ${r.name}`,
          className: "zen-flex zen-h-5 zen-w-5 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-text-zen-muted-fg hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          children: /* @__PURE__ */ s(
            he,
            {
              name: t.expanded ? "chevron-down" : "chevron-right",
              size: 14,
              className: t.expanded ? void 0 : "rtl:zen-rotate-180"
            }
          )
        }
      ) : (
        /* A spacer, not a hidden chevron: leaves must line up with their
           siblings' text, or every leaf reads as one level shallower. */
        /* @__PURE__ */ s("span", { "aria-hidden": "true", className: "zen-h-5 zen-w-5 zen-shrink-0" })
      ),
      /* @__PURE__ */ h("span", { className: "zen-min-w-0", children: [
        /* @__PURE__ */ s(
          "span",
          {
            className: z(
              "zen-block zen-truncate zen-text-sm zen-text-zen-foreground",
              t.hasChildren && "zen-font-semibold"
            ),
            title: r.name,
            children: r.name
          }
        ),
        r.subtitle && /* @__PURE__ */ s("span", { className: "zen-block zen-truncate zen-text-[10px] zen-text-zen-muted-fg", children: r.subtitle })
      ] })
    ] });
  if (e === "assignees") return /* @__PURE__ */ s(tn, { assignees: r.assignees });
  if (e === "status")
    return /* @__PURE__ */ s(ie, { variant: "soft", color: Ke[t.status], className: "zen-truncate", children: r.statusLabel ?? pe[t.status] });
  const i = ye(t.variance);
  return i ? /* @__PURE__ */ s(
    ie,
    {
      dir: "ltr",
      variant: "soft",
      color: t.variance === null || t.variance === 0 ? "neutral" : t.variance > 0 ? "error" : "success",
      children: i
    }
  ) : null;
}, nn = ({
  row: e,
  range: t,
  axisWidth: d,
  placement: r,
  onTaskClick: i
}) => {
  const { task: y } = e, u = e.progress ?? 0, b = (r ? r.widthPct / 100 * d : 0) < qe, O = !b && u >= He, v = r ? r.startPct + r.widthPct : 0, X = (100 - v) / 100 * d < Ye, g = c.useMemo(() => {
    if (!e.segments || !e.span) return null;
    const o = Math.max(e.span.start.getTime(), t.start.getTime()), L = Math.min(e.span.end.getTime(), t.end.getTime()), f = L - o;
    if (f <= 0) return null;
    const $ = e.segments.map((m) => m.end.getTime() - m.start.getTime());
    let E = $.reduce((m, A) => m + A, 0) * u / 100;
    const T = [];
    return e.segments.forEach((m, A) => {
      const _ = Math.max(0, Math.min(E, $[A]));
      E -= _;
      const p = Math.max(m.start.getTime(), o), C = Math.min(m.end.getTime(), L);
      if (C <= p) return;
      const x = C - p, w = Math.max(0, Math.min(_ - (p - m.start.getTime()), x));
      T.push({
        key: p,
        startPct: (p - o) / f * 100,
        widthPct: x / f * 100,
        fillPct: x > 0 ? w / x * 100 : 0
      });
    }), T.length > 0 ? T : null;
  }, [e.segments, e.span, u, t]);
  return r ? /* @__PURE__ */ h(ze, { children: [
    /* @__PURE__ */ h(
      "button",
      {
        type: "button",
        onClick: () => i?.(y, e),
        tabIndex: -1,
        "data-gantt-bar": "",
        className: z(
          "zen-absolute zen-rounded-zen-sm",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          /* Drawn as pieces, the button is only the hit area and the focus
             ring — the skin moves onto each piece, or the gaps would be
             filled by the button's own background. */
          g === null && z("zen-overflow-hidden zen-border", ue[e.status]),
          /* Square off a cut edge so a bar continuing past the view does
             not look like it ends there. */
          g === null && r.clippedStart && "zen-rounded-s-none zen-border-s-0",
          g === null && r.clippedEnd && "zen-rounded-e-none zen-border-e-0",
          i && "hover:zen-brightness-95"
        ),
        style: {
          insetInlineStart: `${r.startPct}%`,
          width: `${r.widthPct}%`,
          top: le,
          height: W
        },
        title: `${y.name} · ${R(e.span.start)} – ${R(e.span.end)}${e.progress === null ? "" : ` · ${Math.round(u)}%`}`,
        children: [
          /* @__PURE__ */ s("span", { className: "zen-sr-only", children: `${R(e.span.start)} to ${R(e.span.end)}, ${pe[e.status]}${e.progress === null ? "" : `, ${Math.round(u)} percent complete`}` }),
          g !== null && g.map((o) => /* @__PURE__ */ s(
            "span",
            {
              "aria-hidden": "true",
              className: z("zen-absolute zen-inset-y-0 zen-overflow-hidden", ue[e.status], "zen-rounded-zen-sm zen-border"),
              style: { insetInlineStart: `${o.startPct}%`, width: `${o.widthPct}%` },
              children: e.progress !== null && o.fillPct > 0 && /* @__PURE__ */ s(
                "span",
                {
                  className: z("zen-absolute zen-inset-y-0 zen-start-0", me[e.status]),
                  style: { width: `${o.fillPct}%` }
                }
              )
            },
            o.key
          )),
          g === null && e.progress !== null && /* @__PURE__ */ s(
            "span",
            {
              "aria-hidden": "true",
              className: z("zen-absolute zen-inset-y-0 zen-start-0", me[e.status]),
              style: { width: `${u}%` }
            }
          ),
          e.progress !== null && !b && /* @__PURE__ */ h(
            "span",
            {
              "aria-hidden": "true",
              className: z(
                "zen-absolute zen-inset-y-0 zen-flex zen-items-center zen-text-[10px] zen-font-medium",
                O ? z("zen-start-1", Je[e.status]) : "zen-end-1 zen-text-zen-foreground"
              ),
              children: [
                Math.round(u),
                "%"
              ]
            }
          )
        ]
      }
    ),
    e.progress !== null && b && /* @__PURE__ */ h(
      "span",
      {
        "aria-hidden": "true",
        className: "zen-absolute zen-flex zen-items-center zen-text-[10px] zen-font-medium zen-text-zen-muted-fg",
        style: {
          ...X ? { insetInlineEnd: `calc(${100 - r.startPct}% + 4px)` } : { insetInlineStart: `calc(${v}% + 4px)` },
          top: le,
          height: W
        },
        children: [
          Math.round(u),
          "%"
        ]
      }
    )
  ] }) : /* @__PURE__ */ s("span", { className: "zen-sr-only", children: e.span ? "Not scheduled in this range" : "No dates" });
}, tn = ({ assignees: e }) => !e || e.length === 0 ? null : /* @__PURE__ */ h(Oe, { children: [
  /* @__PURE__ */ s(Xe, { asChild: !0, children: /* @__PURE__ */ s("span", { "aria-hidden": "true", className: "zen-rounded-zen-full", children: /* @__PURE__ */ s(Le, { max: We, size: "xs", spacing: "loose", children: e.map((t) => /* @__PURE__ */ h($e, { size: "xs", children: [
    t.src && /* @__PURE__ */ s(Ee, { src: t.src, alt: t.name }),
    /* @__PURE__ */ s(_e, { children: Qe(t) })
  ] }, t.id)) }) }) }),
  /* @__PURE__ */ s(we, { children: e.map((t) => t.name).join(", ") })
] });
export {
  pn as Gantt
};
//# sourceMappingURL=index97.js.map
