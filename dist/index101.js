import { jsx as s, jsxs as y, Fragment as ze } from "react/jsx-runtime";
import * as d from "react";
import { cn as T } from "./index145.js";
import "./index25.js";
import { placeAppointment as ue } from "./index185.js";
import { ganttFitRange as tt, ganttConnectors as nt } from "./index100.js";
import { flattenProductionResources as ot, productionLoad as Le, productionSequenceConflicts as rt } from "./index102.js";
import { productionReschedule as st } from "./index103.js";
import { productionCriticalPath as at } from "./index104.js";
import { Badge as Ae } from "./index58.js";
import { EmptyState as it, EmptyStateIcon as ct, EmptyStateTitle as lt, EmptyStateDescription as dt } from "./index89.js";
import { Icon as me } from "./index57.js";
import { Skeleton as Z } from "./index62.js";
import { TooltipProvider as ut } from "./index66.js";
import { useScrollerMetrics as mt, useScheduleAxis as zt, INDENT_PX as Fe, ScheduleGrid as ft, ROW_PX as ht } from "./index186.js";
const le = {
  resource: 180,
  jobs: 60,
  capacity: 72,
  load: 84,
  float: 84
}, pt = {
  resource: "Resource",
  jobs: "Jobs",
  capacity: "Capacity",
  load: "Load",
  /* The row's TIGHTEST operation, because a row is only as movable as the job
     on it with the least room. Reporting an average would say a machine has
     four hours of slack while one of its jobs has none. */
  float: "Float"
}, De = {
  resource: 1,
  jobs: 2,
  capacity: 3,
  load: 4,
  float: 5,
  timeline: 6
}, gt = ["resource", "jobs", "capacity", "load"], j = 16, de = 4, bt = 14, _e = 40, wt = {
  "not-started": "zen-bg-zen-muted zen-border-zen-border",
  "on-track": "zen-bg-zen-info-soft zen-border-zen-info/40",
  delayed: "zen-bg-zen-error-soft zen-border-zen-error/40",
  complete: "zen-bg-zen-success-soft zen-border-zen-success/40"
}, xt = {
  "not-started": "zen-bg-zen-neutral/30",
  "on-track": "zen-bg-zen-info",
  delayed: "zen-bg-zen-error",
  complete: "zen-bg-zen-success"
}, yt = (t) => {
  const a = [], o = (l) => {
    for (const r of l)
      r.children && r.children.length > 0 && (a.push(r.id), o(r.children));
  };
  return o(t), a;
}, ee = (t) => `${t.getDate()} ${t.toLocaleString(void 0, { month: "short" })} ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`, je = (t) => `${Math.round(t * 100)}%`, Xt = ({
  resources: t,
  operations: a,
  dependencies: o,
  showDependencies: l = !0,
  calendar: r,
  hourStep: h,
  setupMatrix: f,
  defaultView: v,
  view: p,
  onViewChange: z,
  views: g,
  defaultDate: V,
  date: S,
  onDateChange: ne,
  expanded: F,
  defaultExpanded: G,
  onExpandedChange: C,
  onOperationClick: R,
  onReschedule: D,
  canReschedule: q,
  maxLanes: H = 3,
  showLoad: i = !0,
  showCriticalPath: M = !1,
  until: m,
  now: E,
  columnWidth: P,
  hideToolbar: L,
  columns: I,
  loading: $,
  loadingRows: k = 6,
  emptyState: A,
  className: x
}) => {
  const [Re, Xe] = d.useState(v ?? "fit"), [Be, Oe] = d.useState(V ?? /* @__PURE__ */ new Date()), [Ke, We] = d.useState(G ?? null), fe = d.useRef(null), { metrics: he, setMetrics: Ve } = mt(fe), X = p ?? Re, oe = S ?? Be, re = d.useRef(null);
  re.current === null && (re.current = /* @__PURE__ */ new Date());
  const U = E ?? re.current, pe = U.getTime(), ge = oe.getTime(), be = (e) => {
    S === void 0 && Oe(e), ne?.(e);
  }, B = F ?? Ke, se = d.useMemo(
    () => B === null ? null : new Set(B),
    [B]
  ), we = (e) => {
    const n = B ?? yt(t), c = n.includes(e) ? n.filter((u) => u !== e) : [...n, e];
    F === void 0 && We(c), C?.(c);
  }, O = d.useMemo(() => X !== "fit" ? null : tt(
    a.map((e) => ({
      id: e.id,
      start: e.start,
      end: e.end,
      /* Setup claims the machine too, so it belongs inside the range. Without
         it a chart whose first job opens with a two-hour changeover starts
         two hours after the work does. */
      workingMinutes: e.end === void 0 ? (e.setupMinutes ?? 0) + (e.runMinutes ?? 0) : void 0
    })),
    { calendar: r }
  ), [X, a, r]), J = I ?? gt, Ge = d.useMemo(
    () => J.map((e) => ({ key: e, width: le[e] })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [J.join(",")]
  ), xe = zt({
    view: X,
    anchor: oe,
    fitRange: O,
    now: U,
    calendar: r,
    hourStep: h,
    columnWidth: P,
    paneColumns: Ge,
    available: he.width
  }), { range: N, columns: ye, axisWidth: Q, minGapMs: ve } = xe, { rows: b, rowIndexById: Me, operationIndex: qe } = d.useMemo(
    () => ot(
      t ?? [],
      a ?? [],
      (e) => se === null ? !0 : se.has(e.id),
      { calendar: r, maxLanes: H, minGapMs: ve, setupMatrix: f }
    ),
    [t, a, se, r, H, ve, f]
  ), _ = Math.max(1, ...b.map((e) => e.lanes.length)), K = Math.max(
    ht,
    _ * j + (_ - 1) * de + bt
  ), He = (K - (_ * j + (_ - 1) * de)) / 2, ae = (e) => He + e * (j + de), Y = d.useMemo(() => {
    const e = /* @__PURE__ */ new Map();
    for (const n of b)
      for (const c of n.lanes)
        for (const u of c) e.set(u.operation.id, { placement: u, row: n });
    return e;
  }, [b]), Ue = d.useMemo(() => {
    if (!l || !o || o.length === 0) return [];
    const e = /* @__PURE__ */ new Map();
    for (const [n, c] of Y) {
      const u = ue(c.placement.span, N);
      if (!u) continue;
      const w = qe.get(n)?.lane ?? 0;
      e.set(n, {
        rowIndex: c.row.index,
        startPct: u.startPct,
        widthPct: u.widthPct,
        /* The LANE's centre, not the row's. A routing arrow that pointed at the
           middle of a three-lane row would miss every bar in it. */
        yOffset: ae(w) + j / 2
      });
    }
    for (const [n, c] of Me) {
      if (e.has(n)) continue;
      const w = b[c]?.lanes[0]?.[0];
      if (!w) continue;
      const ce = ue(w.span, N);
      ce && e.set(n, {
        rowIndex: c,
        startPct: ce.startPct,
        widthPct: ce.widthPct,
        yOffset: ae(0) + j / 2
      });
    }
    return nt(e, o, { axisWidth: Q, rowHeight: K });
  }, [l, o, Y, Me, b, N, Q, K, _]), ie = d.useMemo(() => {
    if (!i) return null;
    const e = b.filter((u) => u.parentId === null), n = e.flatMap((u) => u.subtree), c = e.reduce((u, w) => u + w.capacity, 0);
    return Le(n, ye, { calendar: r, capacity: Math.max(1, c) });
  }, [i, b, ye, r]), Pe = d.useMemo(() => {
    const e = /* @__PURE__ */ new Map(), n = [
      { start: N.start, end: N.end, label: "", sublabel: "", nonWorking: !1, today: !1 }
    ];
    for (const c of b)
      e.set(
        c.index,
        Le(c.subtree, n, {
          calendar: c.resource.calendar ?? r,
          capacity: c.capacity
        })[0]
      );
    return e;
  }, [b, N, r]), W = d.useMemo(() => M ? at(a ?? [], o ?? [], {
    calendar: r,
    setupMatrix: f,
    until: m
  }) : null, [M, a, o, r, f, m?.getTime()]), $e = d.useMemo(() => {
    const e = /* @__PURE__ */ new Map();
    if (!W) return e;
    for (const n of b) {
      let c;
      for (const u of n.subtree) {
        const w = W.byOperation.get(u.operation.id);
        w && (!c || w.totalFloatMinutes < c.totalFloatMinutes) && (c = w);
      }
      c && e.set(n.index, c);
    }
    return e;
  }, [W, b]), Je = d.useMemo(
    () => J.map((e) => ({
      key: e,
      label: pt[e],
      width: le[e],
      colIndex: De[e],
      className: e === "resource" ? "zen-min-w-0 zen-gap-1 zen-pe-2" : "zen-px-2",
      style: e === "resource" ? (n) => ({ paddingInlineStart: 8 + n.depth * Fe }) : void 0,
      render: (n) => /* @__PURE__ */ s(
        vt,
        {
          column: e,
          row: n,
          load: Pe.get(n.index),
          float: $e.get(n.index),
          onToggle: we
        }
      )
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [J.join(","), Pe, $e, B, t]
  ), Ne = d.useMemo(() => {
    if (!l || !o || o.length === 0) return null;
    const e = /* @__PURE__ */ new Map();
    for (const [c, u] of Y) e.set(c, u.placement);
    const n = rt(o, e, { calendar: r });
    return new Set(n.map((c) => `${c.operationIds[0]}->${c.operationIds[1]}`));
  }, [l, o, Y, r]), Qe = d.useCallback(
    (e) => Ne?.has(`${e.from}->${e.to}`) ?? !1,
    [Ne]
  ), Se = D !== void 0, Ie = d.useCallback(
    (e) => Se && (q?.(e) ?? !0),
    [Se, q]
  ), ke = Q > 0 ? (N.end.getTime() - N.start.getTime()) / Q : 0, Te = d.useCallback(
    (e) => {
      const n = (c) => {
        for (const u of c) {
          if (u.id === e) return u.calendar ?? r;
          const w = u.children ? n(u.children) : void 0;
          if (w) return w;
        }
      };
      return n(t ?? []) ?? r;
    },
    [t, r]
  ), Ce = d.useCallback(
    (e) => {
      D && D(
        st(a, o ?? [], e, {
          calendar: r,
          calendarFor: Te,
          resources: t,
          setupMatrix: f
        })
      );
    },
    [D, a, o, r, Te, t, f]
  ), Ye = (e) => {
    if (X === "fit" && e !== "fit" && O) {
      const n = O.start.getTime(), c = O.end.getTime();
      (ge < n || ge >= c) && be(pe >= n && pe < c ? U : O.start);
    }
    p === void 0 && Xe(e), z?.(e);
  }, Ee = d.useCallback(
    (e) => W?.byOperation.get(e)?.critical ?? !1,
    [W]
  ), Ze = d.useCallback(
    (e) => /* @__PURE__ */ s(
      Mt,
      {
        row: e,
        range: N,
        laneTop: ae,
        onOperationClick: R,
        mayMove: Ie,
        msPerPx: ke,
        onPropose: Ce,
        isCritical: Ee
      }
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [N, R, K, _, Ie, ke, Ce, Ee]
  ), et = d.useCallback(
    (e) => /* @__PURE__ */ s($t, { ...e, buckets: ie }),
    [ie]
  );
  return $ ? /* @__PURE__ */ s(
    "div",
    {
      className: T(
        "zen-flex zen-w-full zen-flex-col zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3",
        x
      ),
      role: "status",
      "aria-label": "Loading production schedule",
      children: Array.from({ length: k }, (e, n) => /* @__PURE__ */ y("div", { className: "zen-flex zen-items-center zen-gap-3", children: [
        /* @__PURE__ */ s(Z, { className: "zen-h-4", style: { width: le.resource - 24 - n % 3 * Fe } }),
        /* @__PURE__ */ s(Z, { className: "zen-h-4 zen-w-12" }),
        /* @__PURE__ */ s(Z, { className: "zen-h-4", style: { marginInlineStart: `${n * 29 % 40}%`, width: `${12 + n * 7 % 18}%` } }),
        /* @__PURE__ */ s(Z, { className: "zen-h-4", style: { width: `${10 + n * 11 % 20}%` } })
      ] }, n))
    }
  ) : b.length === 0 ? /* @__PURE__ */ s("div", { className: T("zen-w-full", x), children: A ?? /* @__PURE__ */ y(it, { bordered: !0, children: [
    /* @__PURE__ */ s(ct, { children: /* @__PURE__ */ s(me, { name: "cog", size: 22 }) }),
    /* @__PURE__ */ s(lt, { children: "No resources" }),
    /* @__PURE__ */ s(dt, { children: "Add a work centre and book an operation on it, and the schedule will appear here." })
  ] }) }) : /* @__PURE__ */ s(ut, { delayDuration: 200, children: /* @__PURE__ */ s(
    ft,
    {
      rows: b,
      rowId: (e) => e.resource.id,
      columns: Je,
      colCount: 6,
      timelineColIndex: De.timeline,
      renderTrack: Ze,
      rowHeight: K,
      renderFooter: ie ? et : void 0,
      view: X,
      anchor: oe,
      now: U,
      connectors: Ue,
      connectorAccent: Qe,
      views: g,
      hideToolbar: L,
      onViewChange: Ye,
      onDateChange: be,
      onToggle: (e) => we(e.resource.id),
      onActivate: (e) => {
        const n = e.lanes[0]?.[0];
        n && R?.(n.operation, e);
      },
      ariaLabel: "Production schedule",
      className: x,
      scrollerRef: fe,
      axis: xe,
      metrics: he,
      setMetrics: Ve
    }
  ) });
}, te = (t) => {
  const a = t < 0 ? "-" : "", o = Math.abs(t);
  if (o === 0) return "0";
  if (o < 60) return `${a}${o}m`;
  const l = Math.floor(o / 60), r = o % 60;
  return r === 0 ? `${a}${l}h` : `${a}${l}h ${r}m`;
}, vt = ({
  column: t,
  row: a,
  load: o,
  float: l,
  onToggle: r
}) => {
  const { resource: h } = a;
  if (t === "resource")
    return /* @__PURE__ */ y(ze, { children: [
      a.hasChildren ? /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          tabIndex: -1,
          onClick: () => r(h.id),
          "aria-label": a.expanded ? `Collapse ${h.name}` : `Expand ${h.name}`,
          className: "zen-flex zen-h-5 zen-w-5 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-text-zen-muted-fg hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          children: /* @__PURE__ */ s(
            me,
            {
              name: a.expanded ? "chevron-down" : "chevron-right",
              size: 14,
              className: a.expanded ? void 0 : "rtl:zen-rotate-180"
            }
          )
        }
      ) : /* @__PURE__ */ s("span", { "aria-hidden": "true", className: "zen-h-5 zen-w-5 zen-shrink-0" }),
      /* @__PURE__ */ y("span", { className: "zen-min-w-0", children: [
        /* @__PURE__ */ s(
          "span",
          {
            className: T(
              "zen-block zen-truncate zen-text-sm zen-text-zen-foreground",
              a.hasChildren && "zen-font-semibold"
            ),
            title: h.name,
            children: h.name
          }
        ),
        h.subtitle && /* @__PURE__ */ s("span", { className: "zen-block zen-truncate zen-text-[10px] zen-text-zen-muted-fg", children: h.subtitle })
      ] }),
      a.overloaded && /* @__PURE__ */ s(
        me,
        {
          name: "warn",
          size: 13,
          className: "zen-ms-auto zen-shrink-0 zen-text-zen-error",
          title: "Over capacity"
        }
      )
    ] });
  if (t === "jobs") {
    const f = a.subtree.length;
    return /* @__PURE__ */ y("span", { className: "zen-text-sm zen-text-zen-muted-fg", children: [
      f === 0 ? "—" : f,
      a.overflow > 0 && /* @__PURE__ */ y("span", { className: "zen-ms-1 zen-text-[10px] zen-text-zen-error", children: [
        "+",
        a.overflow
      ] })
    ] });
  }
  return t === "capacity" ? /* @__PURE__ */ s("span", { className: "zen-flex zen-items-center zen-gap-1 zen-text-sm zen-text-zen-muted-fg", children: /* @__PURE__ */ y("span", { dir: "ltr", children: [
    "×",
    a.capacity
  ] }) }) : t === "float" ? l ? /* @__PURE__ */ s(
    Ae,
    {
      dir: "ltr",
      variant: "soft",
      color: l.totalFloatMinutes < 0 ? "error" : l.critical ? "warning" : "neutral",
      title: l.totalFloatMinutes < 0 ? `Past the date it is measured against by ${te(-l.totalFloatMinutes)}` : l.freeFloatMinutes < 0 ? `Already overlaps the next operation by ${te(-l.freeFloatMinutes)}` : l.critical ? "On the critical path — no room to move" : `${te(l.freeFloatMinutes)} before it disturbs the next operation`,
      children: l.critical && l.totalFloatMinutes === 0 ? "Critical" : te(l.totalFloatMinutes)
    }
  ) : /* @__PURE__ */ s("span", { className: "zen-text-sm zen-text-zen-muted-fg", children: "—" }) : !o || o.utilisation === null ? /* @__PURE__ */ s("span", { className: "zen-text-sm zen-text-zen-muted-fg", children: "—" }) : /* @__PURE__ */ s(
    Ae,
    {
      dir: "ltr",
      variant: "soft",
      color: o.overloaded ? "error" : o.utilisation >= 0.85 ? "warning" : "success",
      children: je(o.utilisation)
    }
  );
}, Mt = ({
  row: t,
  range: a,
  laneTop: o,
  onOperationClick: l,
  mayMove: r,
  msPerPx: h,
  onPropose: f,
  isCritical: v
}) => /* @__PURE__ */ y(ze, { children: [
  t.lanes.length === 0 && /* An expanded parent draws nothing because its children draw its work —
  which is a fact worth saying, not a blank cell. */
  /* @__PURE__ */ s("span", { className: "zen-sr-only", children: t.hasChildren && t.expanded ? "Work shown on the rows below" : "Nothing booked in this range" }),
  t.lanes.map(
    (p, z) => p.map((g) => /* @__PURE__ */ s(
      Pt,
      {
        placement: g,
        row: t,
        range: a,
        top: o(z),
        onOperationClick: l,
        mayMove: r,
        msPerPx: h,
        onPropose: f,
        critical: v(g.operation.id)
      },
      g.operation.id
    ))
  )
] }), Pt = ({
  placement: t,
  row: a,
  range: o,
  top: l,
  onOperationClick: r,
  mayMove: h,
  msPerPx: f,
  onPropose: v,
  critical: p
}) => {
  const { operation: z } = t, g = ue(t.span, o), V = z.status ?? "on-track", S = z.percentComplete ?? null, ne = d.useMemo(() => {
    if (!g) return [];
    const i = Math.max(t.span.start.getTime(), o.start.getTime()), M = Math.min(t.span.end.getTime(), o.end.getTime()), m = M - i;
    if (m <= 0) return [];
    const E = t.setup ? t.setup.end.getTime() : i, P = t.segments ?? [t.span], L = [];
    for (const I of P) {
      const $ = Math.max(I.start.getTime(), i), k = Math.min(I.end.getTime(), M);
      if (k <= $) continue;
      const A = k - $, x = Math.max(0, Math.min(E, k) - $);
      L.push({
        key: $,
        startPct: ($ - i) / m * 100,
        widthPct: A / m * 100,
        setupPct: x / A * 100
      });
    }
    return L;
  }, [g, t, o]), [F, G] = d.useState(null), C = h(z), R = (i) => new Date(t.span.start.getTime() + i * f), D = (i) => {
    if (!C || i.button !== 0) return;
    const M = i.clientX, m = i.currentTarget;
    m.setPointerCapture(i.pointerId);
    const E = getComputedStyle(m).direction === "rtl";
    let P = 0;
    const L = (x) => {
      P = x.clientX - M, G(P);
    }, I = (x) => {
      m.releasePointerCapture?.(i.pointerId), m.removeEventListener("pointermove", L), m.removeEventListener("pointerup", $), m.removeEventListener("pointercancel", k), window.removeEventListener("keydown", A), G(null), x && Math.abs(P) > 3 ? v({ operationId: z.id, start: R(P * (E ? -1 : 1)) }) : x && r?.(z, a);
    }, $ = () => I(!0), k = () => I(!1), A = (x) => {
      x.key === "Escape" && I(!1);
    };
    m.addEventListener("pointermove", L), m.addEventListener("pointerup", $), m.addEventListener("pointercancel", k), window.addEventListener("keydown", A);
  }, q = (i) => {
    if (!C || !i.altKey) return;
    const M = getComputedStyle(i.currentTarget).direction === "rtl", m = M ? "ArrowLeft" : "ArrowRight", E = M ? "ArrowRight" : "ArrowLeft";
    if (i.key !== m && i.key !== E) return;
    i.preventDefault(), i.stopPropagation();
    const P = (i.shiftKey ? 24 : 1) * 60 * 6e4 * (i.key === m ? 1 : -1);
    v({
      operationId: z.id,
      start: new Date(t.span.start.getTime() + P)
    });
  };
  if (!g) return null;
  const H = [
    z.name,
    z.order ? `Order ${z.order}` : null,
    `${ee(t.span.start)} – ${ee(t.span.end)}`,
    t.setup ? "incl. changeover" : null,
    p ? "on the critical path" : null,
    S === null ? null : `${Math.round(S)}%`
  ].filter(Boolean).join(" · ");
  return /* @__PURE__ */ y(
    "button",
    {
      type: "button",
      tabIndex: -1,
      "data-gantt-bar": "",
      "data-gantt-movable": C ? "" : void 0,
      onClick: () => {
        C || r?.(z, a);
      },
      onPointerDown: D,
      onKeyDown: q,
      className: T(
        "zen-absolute zen-rounded-zen-sm",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        r && "hover:zen-brightness-95",
        /* The affordance IS the gate: an operation the caller will not let
           move simply does not offer to. */
        C && "zen-cursor-grab active:zen-cursor-grabbing",
        /* A RING, not a recolour. The bar's fill already carries status, so
           a critical operation cannot be signalled by hue without taking
           that meaning away — and the Float column says "Critical" in words
           beside it, because a ring on its own is not a legend. */
        p && "zen-ring-2 zen-ring-zen-warning zen-ring-offset-1",
        F !== null && "zen-z-20 zen-opacity-80 zen-shadow-zen-md"
      ),
      style: {
        insetInlineStart: `${g.startPct}%`,
        width: `${g.widthPct}%`,
        top: l,
        height: j,
        /* Logical, so the preview follows the pointer under RTL too. */
        ...F !== null ? { translate: `${F}px` } : null
      },
      title: H,
      children: [
        /* @__PURE__ */ s("span", { className: "zen-sr-only", children: `${z.name}, ${ee(t.span.start)} to ${ee(t.span.end)}${t.setup ? ", including changeover" : ""}${S === null ? "" : `, ${Math.round(S)} percent complete`}` }),
        ne.map((i) => /* @__PURE__ */ y(
          "span",
          {
            "aria-hidden": "true",
            className: T(
              "zen-absolute zen-inset-y-0 zen-overflow-hidden zen-rounded-zen-sm zen-border",
              wt[V]
            ),
            style: { insetInlineStart: `${i.startPct}%`, width: `${i.widthPct}%` },
            children: [
              i.setupPct > 0 && /* @__PURE__ */ s(
                "span",
                {
                  className: "zen-absolute zen-inset-y-0 zen-start-0 zen-opacity-70",
                  style: {
                    width: `${i.setupPct}%`,
                    backgroundImage: "repeating-linear-gradient(45deg, var(--zen-color-muted-fg) 0 2px, transparent 2px 5px)"
                  }
                }
              ),
              S !== null && i.setupPct < 100 && /* @__PURE__ */ s(
                "span",
                {
                  className: T("zen-absolute zen-inset-y-0", xt[V]),
                  style: {
                    insetInlineStart: `${i.setupPct}%`,
                    width: `${(100 - i.setupPct) * S / 100}%`
                  }
                }
              )
            ]
          },
          i.key
        ))
      ]
    }
  );
}, $t = ({
  columns: t,
  columnWidths: a,
  axisWidth: o,
  paneWidth: l,
  buckets: r
}) => /* @__PURE__ */ y(ze, { children: [
  /* @__PURE__ */ s(
    "div",
    {
      className: "zen-sticky zen-z-40 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-muted zen-px-3 zen-text-xs zen-font-semibold zen-text-zen-muted-fg",
      style: { width: l, insetInlineStart: 0, height: _e },
      children: "Load"
    }
  ),
  /* @__PURE__ */ s("div", { className: "zen-flex", style: { width: o, height: _e }, children: t.map((h, f) => {
    const v = r[f], p = v?.utilisation ?? null, z = p === null ? 0 : Math.min(1, p), g = p === null ? 0 : Math.max(0, Math.min(1, p - 1));
    return /* @__PURE__ */ y(
      "div",
      {
        className: T(
          "zen-relative zen-shrink-0 zen-border-e zen-border-zen-border last:zen-border-e-0",
          p === null && "zen-bg-zen-muted"
        ),
        style: { width: a[f] },
        title: p === null ? "Closed" : `${je(p)} of capacity${v.overloaded ? " — over" : ""}`,
        children: [
          /* @__PURE__ */ s(
            "span",
            {
              "aria-hidden": "true",
              className: T(
                "zen-absolute zen-bottom-0 zen-start-0 zen-end-0",
                v?.overloaded ? "zen-bg-zen-error/70" : "zen-bg-zen-info/70"
              ),
              style: { height: `${z * 100}%` }
            }
          ),
          g > 0 && /* @__PURE__ */ s(
            "span",
            {
              "aria-hidden": "true",
              className: "zen-absolute zen-start-0 zen-end-0 zen-top-0 zen-bg-zen-error",
              style: { height: `${Math.max(3, g * 100)}%` }
            }
          )
        ]
      },
      h.start.getTime()
    );
  }) })
] });
export {
  Xt as ProductionSchedule
};
//# sourceMappingURL=index101.js.map
