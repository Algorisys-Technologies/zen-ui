import { jsx as o, jsxs as v, Fragment as de } from "react/jsx-runtime";
import * as d from "react";
import { cn as R } from "./index199.js";
import { directionOf as bt } from "./index207.js";
import "./index208.js";
import "./index28.js";
import { placeAppointment as ye } from "./index255.js";
import { ganttFitRange as vt, ganttConnectors as wt } from "./index110.js";
import { flattenProductionResources as St, productionLoad as Ue, productionSequenceConflicts as yt, productionLateMs as xt } from "./index112.js";
import { durationMessage as Mt } from "./index120.js";
import { laneBarPx as Pt, scheduleRowPx as Tt } from "./index256.js";
import { productionReschedule as Ct, PRODUCTION_DRAG_TYPE as qe, snapToMinutes as Nt } from "./index113.js";
import { productionCriticalPath as It } from "./index153.js";
import { Badge as Ye } from "./index64.js";
import { EmptyState as kt, EmptyStateIcon as $t, EmptyStateTitle as Et, EmptyStateDescription as Lt } from "./index99.js";
import { Icon as xe } from "./index63.js";
import { Skeleton as ie } from "./index68.js";
import { TooltipProvider as Dt } from "./index72.js";
import { useScrollerMetrics as At, useScheduleAxis as Ft, INDENT_PX as Je, ScheduleGrid as Rt } from "./index257.js";
import { useLocale as ne } from "./index90.js";
const we = {
  resource: 180,
  jobs: 60,
  capacity: 72,
  load: 84,
  float: 84
}, _t = {
  resource: "productionSchedule.column.resource",
  jobs: "productionSchedule.column.jobs",
  capacity: "productionSchedule.column.capacity",
  load: "productionSchedule.load",
  /* The row's TIGHTEST operation, because a row is only as movable as the job
     on it with the least room. Reporting an average would say a machine has
     four hours of slack while one of its jobs has none. */
  float: "productionSchedule.column.float"
}, Qe = {
  resource: 1,
  jobs: 2,
  capacity: 3,
  load: 4,
  float: 5,
  timeline: 6
}, jt = ["resource", "jobs", "capacity", "load"], Se = 4, Bt = 14, Ze = 40, Xt = {
  "not-started": "zen-bg-zen-muted zen-border-zen-border",
  "on-track": "zen-bg-zen-info-soft zen-border-zen-info",
  delayed: "zen-bg-zen-error-soft zen-border-zen-error",
  complete: "zen-bg-zen-success-soft zen-border-zen-success"
}, Ot = {
  "not-started": "zen-bg-zen-neutral",
  "on-track": "zen-bg-zen-info",
  delayed: "zen-bg-zen-error",
  complete: "zen-bg-zen-success"
}, Gt = (t) => {
  const r = [], s = (l) => {
    for (const a of l)
      a.children && a.children.length > 0 && (r.push(a.id), s(a.children));
  };
  return s(t), r;
}, ce = (t) => `${t.getDate()} ${t.toLocaleString(void 0, { month: "short" })} ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`, et = (t) => `${Math.round(t * 100)}%`, pn = ({
  resources: t,
  operations: r,
  dependencies: s,
  showDependencies: l = !0,
  calendar: a,
  hourStep: g,
  setupMatrix: z,
  defaultView: P,
  view: T,
  onViewChange: S,
  views: _,
  defaultDate: j,
  date: w,
  onDateChange: p,
  expanded: y,
  defaultExpanded: B,
  onExpandedChange: C,
  onOperationClick: I,
  onReschedule: k,
  canReschedule: W,
  onPlace: A,
  maxLanes: u = 3,
  showLoad: b = !0,
  showCriticalPath: h = !1,
  until: X,
  now: Y,
  columnWidth: ue,
  hideToolbar: i,
  columns: F,
  loading: f,
  loadingRows: K = 6,
  emptyState: $,
  rowHeight: H,
  maxBodyHeight: O,
  headerClassName: E,
  headerGroups: G,
  continuous: L,
  density: N,
  rowClassName: Me,
  barClassName: Pe,
  barAccent: Te,
  dependencyStyle: me,
  className: ze
}) => {
  const J = ne(), [tt, nt] = d.useState(P ?? "fit"), [ot, rt] = d.useState(j ?? /* @__PURE__ */ new Date()), [st, at] = d.useState(B ?? null), Ce = d.useRef(null), { metrics: Ne, setMetrics: it } = At(Ce), U = T ?? tt, pe = w ?? ot, he = d.useRef(null);
  he.current === null && (he.current = /* @__PURE__ */ new Date());
  const oe = Y ?? he.current, Ie = oe.getTime(), ke = pe.getTime(), $e = (e) => {
    w === void 0 && rt(e), p?.(e);
  }, Q = y ?? st, fe = d.useMemo(
    () => Q === null ? null : new Set(Q),
    [Q]
  ), Ee = (e) => {
    const n = Q ?? Gt(t), c = n.includes(e) ? n.filter((m) => m !== e) : [...n, e];
    y === void 0 && at(c), C?.(c);
  }, Le = d.useMemo(() => U !== "fit" && !L ? null : vt(
    r.map((e) => ({
      id: e.id,
      start: e.start,
      end: e.end,
      /* Setup claims the machine too, so it belongs inside the range. Without
         it a chart whose first job opens with a two-hour changeover starts
         two hours after the work does. */
      workingMinutes: e.end === void 0 ? (e.setupMinutes ?? 0) + (e.runMinutes ?? 0) : void 0
    })),
    { calendar: a }
  ), [U, L, r, a]), Z = U === "fit" ? Le : null, De = G ?? !!L, re = F ?? jt, ct = d.useMemo(
    () => re.map((e) => ({ key: e, width: we[e] })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [re.join(",")]
  ), Ae = Ft({
    view: U,
    anchor: pe,
    fitRange: Z,
    now: oe,
    calendar: a,
    hourStep: g,
    columnWidth: ue,
    paneColumns: ct,
    available: Ne.width,
    grouped: De,
    continuous: L,
    plan: Le
  }), { range: D, columns: Fe, axisWidth: se, minGapMs: Re } = Ae, { rows: x, rowIndexById: _e, operationIndex: lt } = d.useMemo(
    () => St(
      t ?? [],
      r ?? [],
      (e) => fe === null ? !0 : fe.has(e.id),
      { calendar: a, maxLanes: u, minGapMs: Re, setupMatrix: z }
    ),
    [t, r, fe, a, u, Re, z]
  ), q = Math.max(1, ...x.map((e) => e.lanes.length)), V = Pt(N), ee = Math.max(
    Tt(N, H),
    q * V + (q - 1) * Se + Bt
  ), dt = (ee - (q * V + (q - 1) * Se)) / 2, ge = (e) => dt + e * (V + Se), ae = d.useMemo(() => {
    const e = /* @__PURE__ */ new Map();
    for (const n of x)
      for (const c of n.lanes)
        for (const m of c) e.set(m.operation.id, { placement: m, row: n });
    return e;
  }, [x]), ut = d.useMemo(() => {
    if (!l || !s || s.length === 0) return [];
    const e = /* @__PURE__ */ new Map();
    for (const [n, c] of ae) {
      const m = ye(c.placement.span, D);
      if (!m) continue;
      const M = lt.get(n)?.lane ?? 0;
      e.set(n, {
        rowIndex: c.row.index,
        startPct: m.startPct,
        widthPct: m.widthPct,
        /* The LANE's centre, not the row's. A routing arrow that pointed at the
           middle of a three-lane row would miss every bar in it. */
        yOffset: ge(M) + V / 2
      });
    }
    for (const [n, c] of _e) {
      if (e.has(n)) continue;
      const M = x[c]?.lanes[0]?.[0];
      if (!M) continue;
      const ve = ye(M.span, D);
      ve && e.set(n, {
        rowIndex: c,
        startPct: ve.startPct,
        widthPct: ve.widthPct,
        yOffset: ge(0) + V / 2
      });
    }
    return wt(e, s, { axisWidth: se, rowHeight: ee });
  }, [l, s, ae, _e, x, D, se, ee, q]), be = d.useMemo(() => {
    if (!b) return null;
    const e = x.filter((m) => m.parentId === null), n = e.flatMap((m) => m.subtree), c = e.reduce((m, M) => m + M.capacity, 0);
    return Ue(n, Fe, { calendar: a, capacity: Math.max(1, c) });
  }, [b, x, Fe, a]), je = d.useMemo(() => {
    const e = /* @__PURE__ */ new Map(), n = [
      { start: D.start, end: D.end, label: "", sublabel: "", nonWorking: !1, today: !1 }
    ];
    for (const c of x)
      e.set(
        c.index,
        Ue(c.subtree, n, {
          calendar: c.resource.calendar ?? a,
          capacity: c.capacity
        })[0]
      );
    return e;
  }, [x, D, a]), te = d.useMemo(() => h ? It(r ?? [], s ?? [], {
    calendar: a,
    setupMatrix: z,
    until: X
  }) : null, [h, r, s, a, z, X?.getTime()]), Be = d.useMemo(() => {
    const e = /* @__PURE__ */ new Map();
    if (!te) return e;
    for (const n of x) {
      let c;
      for (const m of n.subtree) {
        const M = te.byOperation.get(m.operation.id);
        M && (!c || M.totalFloatMinutes < c.totalFloatMinutes) && (c = M);
      }
      c && e.set(n.index, c);
    }
    return e;
  }, [te, x]), mt = d.useMemo(
    () => re.map((e) => ({
      key: e,
      label: J.t(_t[e]),
      width: we[e],
      colIndex: Qe[e],
      className: e === "resource" ? "zen-min-w-0 zen-gap-1 zen-pe-2" : "zen-px-2",
      style: e === "resource" ? (n) => ({ paddingInlineStart: 8 + n.depth * Je }) : void 0,
      render: (n) => /* @__PURE__ */ o(
        Kt,
        {
          column: e,
          row: n,
          load: je.get(n.index),
          float: Be.get(n.index),
          onToggle: Ee
        }
      )
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [re.join(","), je, Be, Q, t]
  ), Xe = d.useMemo(() => {
    if (!l || !s || s.length === 0) return null;
    const e = /* @__PURE__ */ new Map();
    for (const [c, m] of ae) e.set(c, m.placement);
    const n = yt(s, e, { calendar: a });
    return new Set(n.map((c) => `${c.operationIds[0]}->${c.operationIds[1]}`));
  }, [l, s, ae, a]), zt = d.useCallback(
    (e) => Xe?.has(`${e.from}->${e.to}`) ?? !1,
    [Xe]
  ), pt = d.useMemo(
    () => me ? (e) => me(e.dependency) : void 0,
    [me]
  ), Oe = k !== void 0, Ge = d.useCallback(
    (e) => Oe && (W?.(e) ?? !0),
    [Oe, W]
  ), Ke = se > 0 ? (D.end.getTime() - D.start.getTime()) / se : 0, He = d.useCallback(
    (e) => {
      const n = (c) => {
        for (const m of c) {
          if (m.id === e) return m.calendar ?? a;
          const M = m.children ? n(m.children) : void 0;
          if (M) return M;
        }
      };
      return n(t ?? []) ?? a;
    },
    [t, a]
  ), Ve = d.useCallback(
    (e) => {
      k && k(
        Ct(r, s ?? [], e, {
          calendar: a,
          calendarFor: He,
          resources: t,
          setupMatrix: z
        })
      );
    },
    [k, r, s, a, He, t, z]
  ), ht = (e) => {
    if (U === "fit" && e !== "fit" && Z) {
      const n = Z.start.getTime(), c = Z.end.getTime();
      (ke < n || ke >= c) && $e(Ie >= n && Ie < c ? oe : Z.start);
    }
    T === void 0 && nt(e), S?.(e);
  }, We = d.useCallback(
    (e) => te?.byOperation.get(e)?.critical ?? !1,
    [te]
  ), ft = d.useCallback(
    (e) => /* @__PURE__ */ o(
      Ht,
      {
        row: e,
        range: D,
        laneTop: ge,
        onOperationClick: I,
        mayMove: Ge,
        msPerPx: Ke,
        onPropose: Ve,
        isCritical: We,
        onPlace: A,
        barClass: Pe,
        accent: Te,
        barPx: V
      }
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [D, I, ee, q, Ge, Ke, Ve, We, A, Pe, Te, V]
  ), gt = d.useCallback(
    (e) => /* @__PURE__ */ o(Wt, { ...e, buckets: be }),
    [be]
  );
  return f ? /* @__PURE__ */ o(
    "div",
    {
      className: R(
        "zen-flex zen-w-full zen-flex-col zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3",
        ze
      ),
      role: "status",
      "aria-label": J.t("productionSchedule.loadingProductionSchedule"),
      children: Array.from({ length: K }, (e, n) => /* @__PURE__ */ v("div", { className: "zen-flex zen-items-center zen-gap-3", children: [
        /* @__PURE__ */ o(ie, { className: "zen-h-4", style: { width: we.resource - 24 - n % 3 * Je } }),
        /* @__PURE__ */ o(ie, { className: "zen-h-4 zen-w-12" }),
        /* @__PURE__ */ o(ie, { className: "zen-h-4", style: { marginInlineStart: `${n * 29 % 40}%`, width: `${12 + n * 7 % 18}%` } }),
        /* @__PURE__ */ o(ie, { className: "zen-h-4", style: { width: `${10 + n * 11 % 20}%` } })
      ] }, n))
    }
  ) : x.length === 0 ? /* @__PURE__ */ o("div", { className: R("zen-w-full", ze), children: $ ?? /* @__PURE__ */ v(kt, { bordered: !0, children: [
    /* @__PURE__ */ o($t, { children: /* @__PURE__ */ o(xe, { name: "cog", size: 22 }) }),
    /* @__PURE__ */ o(Et, { children: J.t("productionSchedule.noResources") }),
    /* @__PURE__ */ o(Lt, { children: J.t("productionSchedule.addAWorkCentreAnd") })
  ] }) }) : /* @__PURE__ */ o(Dt, { delayDuration: 200, children: /* @__PURE__ */ o(
    Rt,
    {
      rows: x,
      rowId: (e) => e.resource.id,
      columns: mt,
      colCount: 6,
      timelineColIndex: Qe.timeline,
      renderTrack: ft,
      rowHeight: ee,
      rowClass: Me ? (e) => Me(e.resource, e) : void 0,
      maxBodyHeight: O,
      headerClassName: E,
      headerGroups: De,
      renderFooter: be ? gt : void 0,
      view: U,
      anchor: pe,
      now: oe,
      connectors: ut,
      connectorAccent: zt,
      connectorStyle: pt,
      views: _,
      hideToolbar: i,
      onViewChange: ht,
      onDateChange: $e,
      onToggle: (e) => Ee(e.resource.id),
      onActivate: (e) => {
        const n = e.lanes[0]?.[0];
        n && I?.(n.operation, e);
      },
      ariaLabel: J.t("productionSchedule.productionSchedule"),
      className: ze,
      scrollerRef: Ce,
      axis: Ae,
      metrics: Ne,
      setMetrics: it
    }
  ) });
}, le = (t) => {
  const r = t < 0 ? "-" : "", s = Math.abs(t);
  if (s === 0) return "0";
  if (s < 60) return `${r}${s}m`;
  const l = Math.floor(s / 60), a = s % 60;
  return a === 0 ? `${r}${l}h` : `${r}${l}h ${a}m`;
}, Kt = ({
  column: t,
  row: r,
  load: s,
  float: l,
  onToggle: a
}) => {
  const g = ne(), { resource: z } = r;
  if (t === "resource")
    return /* @__PURE__ */ v(de, { children: [
      r.hasChildren ? /* @__PURE__ */ o(
        "button",
        {
          type: "button",
          tabIndex: -1,
          onClick: () => a(z.id),
          "aria-label": g.t(r.expanded ? "productionSchedule.collapseResource" : "productionSchedule.expandResource", { name: z.name }),
          className: "zen-flex zen-h-5 zen-w-5 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-text-zen-muted-fg hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          children: /* @__PURE__ */ o(
            xe,
            {
              name: r.expanded ? "chevron-down" : "chevron-right",
              size: 14,
              className: r.expanded ? void 0 : "rtl:zen-rotate-180"
            }
          )
        }
      ) : /* @__PURE__ */ o("span", { "aria-hidden": "true", className: "zen-h-5 zen-w-5 zen-shrink-0" }),
      /* @__PURE__ */ v("span", { className: "zen-min-w-0", children: [
        /* @__PURE__ */ o(
          "span",
          {
            className: R(
              "zen-block zen-truncate zen-text-sm zen-text-zen-foreground",
              r.hasChildren && "zen-font-semibold"
            ),
            title: z.name,
            children: z.name
          }
        ),
        z.subtitle && /* @__PURE__ */ o("span", { className: "zen-block zen-truncate zen-[font-size:var(--zen-schedule-label-font-size)] zen-text-zen-muted-fg", children: z.subtitle })
      ] }),
      r.overloaded && /* @__PURE__ */ o(
        xe,
        {
          name: "warn",
          size: 13,
          className: "zen-ms-auto zen-shrink-0 zen-text-zen-error",
          title: g.t("productionSchedule.overCapacity")
        }
      )
    ] });
  if (t === "jobs") {
    const P = r.subtree.length;
    return /* @__PURE__ */ v("span", { className: "zen-text-sm zen-text-zen-muted-fg", children: [
      P === 0 ? "—" : P,
      r.overflow > 0 && /* @__PURE__ */ v("span", { className: "zen-ms-1 zen-[font-size:var(--zen-schedule-label-font-size)] zen-text-zen-error", children: [
        "+",
        r.overflow
      ] })
    ] });
  }
  return t === "capacity" ? /* @__PURE__ */ o("span", { className: "zen-flex zen-items-center zen-gap-1 zen-text-sm zen-text-zen-muted-fg", children: /* @__PURE__ */ v("span", { dir: "ltr", children: [
    "×",
    r.capacity
  ] }) }) : t === "float" ? l ? /* @__PURE__ */ o(
    Ye,
    {
      dir: "ltr",
      variant: "soft",
      color: l.totalFloatMinutes < 0 ? "error" : l.critical ? "warning" : "neutral",
      title: l.totalFloatMinutes < 0 ? g.t("productionSchedule.floatLate", { time: le(-l.totalFloatMinutes) }) : l.freeFloatMinutes < 0 ? g.t("productionSchedule.floatOverlaps", { time: le(-l.freeFloatMinutes) }) : l.critical ? g.t("productionSchedule.floatCritical") : g.t("productionSchedule.floatFree", { time: le(l.freeFloatMinutes) }),
      children: l.critical && l.totalFloatMinutes === 0 ? g.t("productionSchedule.critical") : le(l.totalFloatMinutes)
    }
  ) : /* @__PURE__ */ o("span", { className: "zen-text-sm zen-text-zen-muted-fg", children: "—" }) : !s || s.utilisation === null ? /* @__PURE__ */ o("span", { className: "zen-text-sm zen-text-zen-muted-fg", children: "—" }) : /* @__PURE__ */ o(
    Ye,
    {
      dir: "ltr",
      variant: "soft",
      color: s.overloaded ? "error" : s.utilisation >= 0.85 ? "warning" : "success",
      children: et(s.utilisation)
    }
  );
}, Ht = ({
  row: t,
  range: r,
  laneTop: s,
  onOperationClick: l,
  mayMove: a,
  msPerPx: g,
  onPropose: z,
  isCritical: P,
  onPlace: T,
  barClass: S,
  accent: _,
  barPx: j
}) => {
  const w = ne(), p = T !== void 0 && !t.hasChildren, [y, B] = d.useState(null), C = (u, b) => {
    const h = u.getBoundingClientRect(), X = bt(u) === "rtl" ? (h.right - b) / h.width : (b - h.left) / h.width;
    return Math.min(1, Math.max(0, X));
  }, I = (u) => [...u.dataTransfer.types].includes(qe), k = (u) => {
    !p || !I(u) || (u.preventDefault(), u.dataTransfer.dropEffect = "move", B(C(u.currentTarget, u.clientX)));
  }, W = (u) => {
    if (B(null), !p || !I(u)) return;
    u.preventDefault();
    const b = u.dataTransfer.getData(qe);
    if (!b) return;
    const h = r.start.getTime(), X = r.end.getTime() - h, Y = new Date(Nt(h + C(u.currentTarget, u.clientX) * X, 15));
    T?.({ operationId: b, resourceId: t.resource.id, start: Y });
  }, A = /* @__PURE__ */ v(de, { children: [
    t.lanes.length === 0 && /* An expanded parent draws nothing because its children draw its work —
    which is a fact worth saying, not a blank cell. */
    /* @__PURE__ */ o("span", { className: "zen-sr-only", children: t.hasChildren && t.expanded ? w.t("productionSchedule.workBelow") : w.t("productionSchedule.nothingBooked") }),
    t.lanes.map(
      (u, b) => u.map((h) => /* @__PURE__ */ o(
        Vt,
        {
          placement: h,
          row: t,
          range: r,
          top: s(b),
          onOperationClick: l,
          mayMove: a,
          msPerPx: g,
          onPropose: z,
          critical: P(h.operation.id),
          barClass: S?.(h.operation) || void 0,
          accent: _?.(h.operation) || void 0,
          barPx: j
        },
        h.operation.id
      ))
    )
  ] });
  return p ? /* @__PURE__ */ v(
    "div",
    {
      "data-drop-target": "",
      className: R("zen-absolute zen-inset-0", y !== null && "zen-bg-zen-primary-soft"),
      onDragOver: k,
      onDragLeave: () => B(null),
      onDrop: W,
      children: [
        A,
        y !== null && y !== 0 && /* @__PURE__ */ o(
          "span",
          {
            "aria-hidden": "true",
            className: "zen-pointer-events-none zen-absolute zen-inset-y-0 zen-w-0.5 zen-bg-zen-primary",
            style: { insetInlineStart: `${y * 100}%` }
          }
        )
      ]
    }
  ) : A;
}, Vt = ({
  placement: t,
  row: r,
  range: s,
  top: l,
  onOperationClick: a,
  mayMove: g,
  msPerPx: z,
  onPropose: P,
  critical: T,
  barClass: S,
  accent: _,
  barPx: j
}) => {
  const w = ne(), { operation: p } = t, y = ye(t.span, s), B = p.status ?? "on-track", C = p.percentComplete ?? null, I = xt(t.span.end, p.due) ?? 0, k = (() => {
    if (I <= 0) return null;
    const i = Mt(I);
    return w.t("productionSchedule.late", { duration: w.t(i.key, i.values) });
  })(), W = d.useMemo(() => {
    if (!y) return [];
    const i = Math.max(t.span.start.getTime(), s.start.getTime()), F = Math.min(t.span.end.getTime(), s.end.getTime()), f = F - i;
    if (f <= 0) return [];
    const K = t.setup ? t.setup.end.getTime() : i, $ = t.segments ?? [t.span], H = [];
    for (const O of $) {
      const E = Math.max(O.start.getTime(), i), G = Math.min(O.end.getTime(), F);
      if (G <= E) continue;
      const L = G - E, N = Math.max(0, Math.min(K, G) - E);
      H.push({
        key: E,
        startPct: (E - i) / f * 100,
        widthPct: L / f * 100,
        setupPct: N / L * 100
      });
    }
    return H;
  }, [y, t, s]), [A, u] = d.useState(null), b = g(p), h = (i) => new Date(t.span.start.getTime() + i * z), X = (i) => {
    if (!b || i.button !== 0) return;
    const F = i.clientX, f = i.currentTarget;
    f.setPointerCapture(i.pointerId);
    const K = getComputedStyle(f).direction === "rtl";
    let $ = 0;
    const H = (N) => {
      $ = N.clientX - F, u($);
    }, O = (N) => {
      f.releasePointerCapture?.(i.pointerId), f.removeEventListener("pointermove", H), f.removeEventListener("pointerup", E), f.removeEventListener("pointercancel", G), window.removeEventListener("keydown", L), u(null), N && Math.abs($) > 3 ? P({ operationId: p.id, start: h($ * (K ? -1 : 1)) }) : N && a?.(p, r);
    }, E = () => O(!0), G = () => O(!1), L = (N) => {
      N.key === "Escape" && O(!1);
    };
    f.addEventListener("pointermove", H), f.addEventListener("pointerup", E), f.addEventListener("pointercancel", G), window.addEventListener("keydown", L);
  }, Y = (i) => {
    if (!b || !i.altKey) return;
    const F = getComputedStyle(i.currentTarget).direction === "rtl", f = F ? "ArrowLeft" : "ArrowRight", K = F ? "ArrowRight" : "ArrowLeft";
    if (i.key !== f && i.key !== K) return;
    i.preventDefault(), i.stopPropagation();
    const $ = (i.shiftKey ? 24 : 1) * 60 * 6e4 * (i.key === f ? 1 : -1);
    P({
      operationId: p.id,
      start: new Date(t.span.start.getTime() + $)
    });
  };
  if (!y) return null;
  const ue = [
    p.name,
    p.order ? w.t("productionSchedule.order", { order: p.order }) : null,
    `${ce(t.span.start)} – ${ce(t.span.end)}`,
    t.setup ? w.t("productionSchedule.inclChangeover") : null,
    T ? w.t("productionSchedule.onCriticalPath") : null,
    k,
    C === null ? null : `${Math.round(C)}%`
  ].filter(Boolean).join(" · ");
  return /* @__PURE__ */ v(
    "button",
    {
      type: "button",
      tabIndex: -1,
      "data-gantt-bar": "",
      "data-gantt-movable": b ? "" : void 0,
      onClick: () => {
        b || a?.(p, r);
      },
      onPointerDown: X,
      onKeyDown: Y,
      className: R(
        "zen-absolute zen-rounded-zen-sm",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        a && "hover:zen-brightness-95",
        /* The affordance IS the gate: an operation the caller will not let
           move simply does not offer to. */
        b && "zen-cursor-grab active:zen-cursor-grabbing",
        /* A RING, not a recolour. The bar's fill already carries status, so
           a critical operation cannot be signalled by hue without taking
           that meaning away — and the Float column says "Critical" in words
           beside it, because a ring on its own is not a legend. */
        T && "zen-ring-2 zen-ring-zen-warning zen-ring-offset-1",
        A !== null && "zen-z-20 zen-opacity-80 zen-shadow-zen-md"
      ),
      style: {
        insetInlineStart: `${y.startPct}%`,
        width: `${y.widthPct}%`,
        top: l,
        height: j,
        /* Logical, so the preview follows the pointer under RTL too. */
        ...A !== null ? { translate: `${A}px` } : null
      },
      title: ue,
      children: [
        /* @__PURE__ */ v("span", { className: "zen-sr-only", children: [
          w.t("productionSchedule.barSpan", {
            name: p.name,
            start: ce(t.span.start),
            end: ce(t.span.end),
            changeover: t.setup ? w.t("productionSchedule.barChangeover") : "",
            progress: C === null ? "" : w.t("productionSchedule.barProgress", { percent: Math.round(C) })
          }),
          k && /* @__PURE__ */ v(de, { children: [
            ". ",
            k
          ] })
        ] }),
        W.map((i) => /* @__PURE__ */ v(
          "span",
          {
            "aria-hidden": "true",
            className: R(
              "zen-absolute zen-inset-y-0 zen-overflow-hidden zen-rounded-zen-sm zen-border",
              Xt[B],
              S
            ),
            style: { insetInlineStart: `${i.startPct}%`, width: `${i.widthPct}%` },
            children: [
              i.setupPct > 0 && /* @__PURE__ */ o(
                "span",
                {
                  className: "zen-absolute zen-inset-y-0 zen-start-0 zen-opacity-70",
                  style: {
                    width: `${i.setupPct}%`,
                    backgroundImage: "repeating-linear-gradient(45deg, var(--zen-color-muted-fg) 0 2px, transparent 2px 5px)"
                  }
                }
              ),
              C !== null && i.setupPct < 100 && /* @__PURE__ */ o(
                "span",
                {
                  className: R("zen-absolute zen-inset-y-0", Ot[B]),
                  style: {
                    insetInlineStart: `${i.setupPct}%`,
                    width: `${(100 - i.setupPct) * C / 100}%`
                  }
                }
              )
            ]
          },
          i.key
        )),
        _ && /* @__PURE__ */ o(
          "span",
          {
            "aria-hidden": "true",
            "data-production-accent": "",
            className: "zen-absolute zen-inset-y-0 zen-start-0 zen-w-1 zen-rounded-s-zen-sm",
            style: { backgroundColor: _ }
          }
        ),
        I > 0 && /* @__PURE__ */ o(
          "span",
          {
            "aria-hidden": "true",
            "data-late": "",
            className: "zen-absolute zen-inset-y-0 zen-end-0 zen-w-1.5 zen-rounded-e-zen-sm zen-bg-zen-error"
          }
        )
      ]
    }
  );
}, Wt = ({
  columns: t,
  columnWidths: r,
  axisWidth: s,
  paneWidth: l,
  buckets: a
}) => {
  const g = ne();
  return /* @__PURE__ */ v(de, { children: [
    /* @__PURE__ */ o(
      "div",
      {
        className: "zen-sticky zen-z-40 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-muted zen-px-3 zen-text-xs zen-font-semibold zen-text-zen-muted-fg",
        style: { width: l, insetInlineStart: 0, height: Ze },
        children: g.t("productionSchedule.load")
      }
    ),
    /* @__PURE__ */ o("div", { className: "zen-flex", style: { width: s, height: Ze }, children: t.map((z, P) => {
      const T = a[P], S = T?.utilisation ?? null, _ = S === null ? 0 : Math.min(1, S), j = S === null ? 0 : Math.max(0, Math.min(1, S - 1));
      return /* @__PURE__ */ v(
        "div",
        {
          className: R(
            "zen-relative zen-shrink-0 zen-border-e zen-border-zen-border last:zen-border-e-0",
            S === null && "zen-bg-zen-muted"
          ),
          style: { width: r[P] },
          title: S === null ? g.t("productionSchedule.closed") : g.t(T.overloaded ? "productionSchedule.ofCapacityOver" : "productionSchedule.ofCapacity", { percent: et(S) }),
          children: [
            /* @__PURE__ */ o(
              "span",
              {
                "aria-hidden": "true",
                className: R(
                  "zen-absolute zen-bottom-0 zen-start-0 zen-end-0",
                  T?.overloaded ? "zen-bg-zen-error" : "zen-bg-zen-info"
                ),
                style: { height: `${_ * 100}%` }
              }
            ),
            j > 0 && /* @__PURE__ */ o(
              "span",
              {
                "aria-hidden": "true",
                className: "zen-absolute zen-start-0 zen-end-0 zen-top-0 zen-bg-zen-error",
                style: { height: `${Math.max(3, j * 100)}%` }
              }
            )
          ]
        },
        z.start.getTime()
      );
    }) })
  ] });
};
export {
  pn as ProductionSchedule
};
//# sourceMappingURL=index111.js.map
