import { jsx as i, jsxs as y, Fragment as ie } from "react/jsx-runtime";
import * as u from "react";
import { cn as _ } from "./index197.js";
import { directionOf as st } from "./index205.js";
import "./index28.js";
import { placeAppointment as fe } from "./index252.js";
import { ganttFitRange as at, ganttConnectors as it } from "./index110.js";
import { flattenProductionResources as ct, productionLoad as _e, productionSequenceConflicts as lt, productionLateMs as ut } from "./index112.js";
import { durationMessage as dt } from "./index120.js";
import { productionReschedule as mt, PRODUCTION_DRAG_TYPE as Re, snapToMinutes as pt } from "./index113.js";
import { productionCriticalPath as zt } from "./index151.js";
import { Badge as je } from "./index64.js";
import { EmptyState as ht, EmptyStateIcon as ft, EmptyStateTitle as gt, EmptyStateDescription as bt } from "./index99.js";
import { Icon as ge } from "./index63.js";
import { Skeleton as re } from "./index68.js";
import { TooltipProvider as vt } from "./index72.js";
import { useScrollerMetrics as wt, useScheduleAxis as yt, INDENT_PX as Xe, ScheduleGrid as St, ROW_PX as xt } from "./index253.js";
import { useLocale as Q } from "./index90.js";
const ze = {
  resource: 180,
  jobs: 60,
  capacity: 72,
  load: 84,
  float: 84
}, Mt = {
  resource: "productionSchedule.column.resource",
  jobs: "productionSchedule.column.jobs",
  capacity: "productionSchedule.column.capacity",
  load: "productionSchedule.load",
  /* The row's TIGHTEST operation, because a row is only as movable as the job
     on it with the least room. Reporting an average would say a machine has
     four hours of slack while one of its jobs has none. */
  float: "productionSchedule.column.float"
}, Be = {
  resource: 1,
  jobs: 2,
  capacity: 3,
  load: 4,
  float: 5,
  timeline: 6
}, Pt = ["resource", "jobs", "capacity", "load"], G = 16, he = 4, Tt = 14, Oe = 40, Nt = {
  "not-started": "zen-bg-zen-muted zen-border-zen-border",
  "on-track": "zen-bg-zen-info-soft zen-border-zen-info/40",
  delayed: "zen-bg-zen-error-soft zen-border-zen-error/40",
  complete: "zen-bg-zen-success-soft zen-border-zen-success/40"
}, Ct = {
  "not-started": "zen-bg-zen-neutral/30",
  "on-track": "zen-bg-zen-info",
  delayed: "zen-bg-zen-error",
  complete: "zen-bg-zen-success"
}, It = (t) => {
  const o = [], r = (l) => {
    for (const s of l)
      s.children && s.children.length > 0 && (o.push(s.id), r(s.children));
  };
  return r(t), o;
}, se = (t) => `${t.getDate()} ${t.toLocaleString(void 0, { month: "short" })} ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`, Ke = (t) => `${Math.round(t * 100)}%`, Jt = ({
  resources: t,
  operations: o,
  dependencies: r,
  showDependencies: l = !0,
  calendar: s,
  hourStep: g,
  setupMatrix: h,
  defaultView: M,
  view: P,
  onViewChange: p,
  views: z,
  defaultDate: w,
  date: A,
  onDateChange: T,
  expanded: D,
  defaultExpanded: X,
  onExpandedChange: V,
  onOperationClick: C,
  onReschedule: d,
  canReschedule: b,
  onPlace: v,
  maxLanes: R = 3,
  showLoad: K = !0,
  showCriticalPath: Z = !1,
  until: a,
  now: F,
  columnWidth: f,
  hideToolbar: B,
  columns: I,
  loading: O,
  loadingRows: j = 6,
  emptyState: k,
  className: $
}) => {
  const N = Q(), [E, We] = u.useState(M ?? "fit"), [Ge, Ve] = u.useState(w ?? /* @__PURE__ */ new Date()), [He, Ue] = u.useState(X ?? null), be = u.useRef(null), { metrics: ve, setMetrics: qe } = wt(be), H = P ?? E, ce = A ?? Ge, le = u.useRef(null);
  le.current === null && (le.current = /* @__PURE__ */ new Date());
  const ee = F ?? le.current, we = ee.getTime(), ye = ce.getTime(), Se = (e) => {
    A === void 0 && Ve(e), T?.(e);
  }, U = D ?? He, ue = u.useMemo(
    () => U === null ? null : new Set(U),
    [U]
  ), xe = (e) => {
    const n = U ?? It(t), c = n.includes(e) ? n.filter((m) => m !== e) : [...n, e];
    D === void 0 && Ue(c), V?.(c);
  }, q = u.useMemo(() => H !== "fit" ? null : at(
    o.map((e) => ({
      id: e.id,
      start: e.start,
      end: e.end,
      /* Setup claims the machine too, so it belongs inside the range. Without
         it a chart whose first job opens with a two-hour changeover starts
         two hours after the work does. */
      workingMinutes: e.end === void 0 ? (e.setupMinutes ?? 0) + (e.runMinutes ?? 0) : void 0
    })),
    { calendar: s }
  ), [H, o, s]), te = I ?? Pt, Ye = u.useMemo(
    () => te.map((e) => ({ key: e, width: ze[e] })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [te.join(",")]
  ), Me = yt({
    view: H,
    anchor: ce,
    fitRange: q,
    now: ee,
    calendar: s,
    hourStep: g,
    columnWidth: f,
    paneColumns: Ye,
    available: ve.width
  }), { range: L, columns: Pe, axisWidth: ne, minGapMs: Te } = Me, { rows: S, rowIndexById: Ne, operationIndex: Je } = u.useMemo(
    () => ct(
      t ?? [],
      o ?? [],
      (e) => ue === null ? !0 : ue.has(e.id),
      { calendar: s, maxLanes: R, minGapMs: Te, setupMatrix: h }
    ),
    [t, o, ue, s, R, Te, h]
  ), W = Math.max(1, ...S.map((e) => e.lanes.length)), Y = Math.max(
    xt,
    W * G + (W - 1) * he + Tt
  ), Qe = (Y - (W * G + (W - 1) * he)) / 2, de = (e) => Qe + e * (G + he), oe = u.useMemo(() => {
    const e = /* @__PURE__ */ new Map();
    for (const n of S)
      for (const c of n.lanes)
        for (const m of c) e.set(m.operation.id, { placement: m, row: n });
    return e;
  }, [S]), Ze = u.useMemo(() => {
    if (!l || !r || r.length === 0) return [];
    const e = /* @__PURE__ */ new Map();
    for (const [n, c] of oe) {
      const m = fe(c.placement.span, L);
      if (!m) continue;
      const x = Je.get(n)?.lane ?? 0;
      e.set(n, {
        rowIndex: c.row.index,
        startPct: m.startPct,
        widthPct: m.widthPct,
        /* The LANE's centre, not the row's. A routing arrow that pointed at the
           middle of a three-lane row would miss every bar in it. */
        yOffset: de(x) + G / 2
      });
    }
    for (const [n, c] of Ne) {
      if (e.has(n)) continue;
      const x = S[c]?.lanes[0]?.[0];
      if (!x) continue;
      const pe = fe(x.span, L);
      pe && e.set(n, {
        rowIndex: c,
        startPct: pe.startPct,
        widthPct: pe.widthPct,
        yOffset: de(0) + G / 2
      });
    }
    return it(e, r, { axisWidth: ne, rowHeight: Y });
  }, [l, r, oe, Ne, S, L, ne, Y, W]), me = u.useMemo(() => {
    if (!K) return null;
    const e = S.filter((m) => m.parentId === null), n = e.flatMap((m) => m.subtree), c = e.reduce((m, x) => m + x.capacity, 0);
    return _e(n, Pe, { calendar: s, capacity: Math.max(1, c) });
  }, [K, S, Pe, s]), Ce = u.useMemo(() => {
    const e = /* @__PURE__ */ new Map(), n = [
      { start: L.start, end: L.end, label: "", sublabel: "", nonWorking: !1, today: !1 }
    ];
    for (const c of S)
      e.set(
        c.index,
        _e(c.subtree, n, {
          calendar: c.resource.calendar ?? s,
          capacity: c.capacity
        })[0]
      );
    return e;
  }, [S, L, s]), J = u.useMemo(() => Z ? zt(o ?? [], r ?? [], {
    calendar: s,
    setupMatrix: h,
    until: a
  }) : null, [Z, o, r, s, h, a?.getTime()]), Ie = u.useMemo(() => {
    const e = /* @__PURE__ */ new Map();
    if (!J) return e;
    for (const n of S) {
      let c;
      for (const m of n.subtree) {
        const x = J.byOperation.get(m.operation.id);
        x && (!c || x.totalFloatMinutes < c.totalFloatMinutes) && (c = x);
      }
      c && e.set(n.index, c);
    }
    return e;
  }, [J, S]), et = u.useMemo(
    () => te.map((e) => ({
      key: e,
      label: N.t(Mt[e]),
      width: ze[e],
      colIndex: Be[e],
      className: e === "resource" ? "zen-min-w-0 zen-gap-1 zen-pe-2" : "zen-px-2",
      style: e === "resource" ? (n) => ({ paddingInlineStart: 8 + n.depth * Xe }) : void 0,
      render: (n) => /* @__PURE__ */ i(
        kt,
        {
          column: e,
          row: n,
          load: Ce.get(n.index),
          float: Ie.get(n.index),
          onToggle: xe
        }
      )
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [te.join(","), Ce, Ie, U, t]
  ), ke = u.useMemo(() => {
    if (!l || !r || r.length === 0) return null;
    const e = /* @__PURE__ */ new Map();
    for (const [c, m] of oe) e.set(c, m.placement);
    const n = lt(r, e, { calendar: s });
    return new Set(n.map((c) => `${c.operationIds[0]}->${c.operationIds[1]}`));
  }, [l, r, oe, s]), tt = u.useCallback(
    (e) => ke?.has(`${e.from}->${e.to}`) ?? !1,
    [ke]
  ), $e = d !== void 0, Ee = u.useCallback(
    (e) => $e && (b?.(e) ?? !0),
    [$e, b]
  ), Le = ne > 0 ? (L.end.getTime() - L.start.getTime()) / ne : 0, Ae = u.useCallback(
    (e) => {
      const n = (c) => {
        for (const m of c) {
          if (m.id === e) return m.calendar ?? s;
          const x = m.children ? n(m.children) : void 0;
          if (x) return x;
        }
      };
      return n(t ?? []) ?? s;
    },
    [t, s]
  ), De = u.useCallback(
    (e) => {
      d && d(
        mt(o, r ?? [], e, {
          calendar: s,
          calendarFor: Ae,
          resources: t,
          setupMatrix: h
        })
      );
    },
    [d, o, r, s, Ae, t, h]
  ), nt = (e) => {
    if (H === "fit" && e !== "fit" && q) {
      const n = q.start.getTime(), c = q.end.getTime();
      (ye < n || ye >= c) && Se(we >= n && we < c ? ee : q.start);
    }
    P === void 0 && We(e), p?.(e);
  }, Fe = u.useCallback(
    (e) => J?.byOperation.get(e)?.critical ?? !1,
    [J]
  ), ot = u.useCallback(
    (e) => /* @__PURE__ */ i(
      $t,
      {
        row: e,
        range: L,
        laneTop: de,
        onOperationClick: C,
        mayMove: Ee,
        msPerPx: Le,
        onPropose: De,
        isCritical: Fe,
        onPlace: v
      }
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [L, C, Y, W, Ee, Le, De, Fe, v]
  ), rt = u.useCallback(
    (e) => /* @__PURE__ */ i(Lt, { ...e, buckets: me }),
    [me]
  );
  return O ? /* @__PURE__ */ i(
    "div",
    {
      className: _(
        "zen-flex zen-w-full zen-flex-col zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3",
        $
      ),
      role: "status",
      "aria-label": N.t("productionSchedule.loadingProductionSchedule"),
      children: Array.from({ length: j }, (e, n) => /* @__PURE__ */ y("div", { className: "zen-flex zen-items-center zen-gap-3", children: [
        /* @__PURE__ */ i(re, { className: "zen-h-4", style: { width: ze.resource - 24 - n % 3 * Xe } }),
        /* @__PURE__ */ i(re, { className: "zen-h-4 zen-w-12" }),
        /* @__PURE__ */ i(re, { className: "zen-h-4", style: { marginInlineStart: `${n * 29 % 40}%`, width: `${12 + n * 7 % 18}%` } }),
        /* @__PURE__ */ i(re, { className: "zen-h-4", style: { width: `${10 + n * 11 % 20}%` } })
      ] }, n))
    }
  ) : S.length === 0 ? /* @__PURE__ */ i("div", { className: _("zen-w-full", $), children: k ?? /* @__PURE__ */ y(ht, { bordered: !0, children: [
    /* @__PURE__ */ i(ft, { children: /* @__PURE__ */ i(ge, { name: "cog", size: 22 }) }),
    /* @__PURE__ */ i(gt, { children: N.t("productionSchedule.noResources") }),
    /* @__PURE__ */ i(bt, { children: N.t("productionSchedule.addAWorkCentreAnd") })
  ] }) }) : /* @__PURE__ */ i(vt, { delayDuration: 200, children: /* @__PURE__ */ i(
    St,
    {
      rows: S,
      rowId: (e) => e.resource.id,
      columns: et,
      colCount: 6,
      timelineColIndex: Be.timeline,
      renderTrack: ot,
      rowHeight: Y,
      renderFooter: me ? rt : void 0,
      view: H,
      anchor: ce,
      now: ee,
      connectors: Ze,
      connectorAccent: tt,
      views: z,
      hideToolbar: B,
      onViewChange: nt,
      onDateChange: Se,
      onToggle: (e) => xe(e.resource.id),
      onActivate: (e) => {
        const n = e.lanes[0]?.[0];
        n && C?.(n.operation, e);
      },
      ariaLabel: N.t("productionSchedule.productionSchedule"),
      className: $,
      scrollerRef: be,
      axis: Me,
      metrics: ve,
      setMetrics: qe
    }
  ) });
}, ae = (t) => {
  const o = t < 0 ? "-" : "", r = Math.abs(t);
  if (r === 0) return "0";
  if (r < 60) return `${o}${r}m`;
  const l = Math.floor(r / 60), s = r % 60;
  return s === 0 ? `${o}${l}h` : `${o}${l}h ${s}m`;
}, kt = ({
  column: t,
  row: o,
  load: r,
  float: l,
  onToggle: s
}) => {
  const g = Q(), { resource: h } = o;
  if (t === "resource")
    return /* @__PURE__ */ y(ie, { children: [
      o.hasChildren ? /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          tabIndex: -1,
          onClick: () => s(h.id),
          "aria-label": g.t(o.expanded ? "productionSchedule.collapseResource" : "productionSchedule.expandResource", { name: h.name }),
          className: "zen-flex zen-h-5 zen-w-5 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-text-zen-muted-fg hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          children: /* @__PURE__ */ i(
            ge,
            {
              name: o.expanded ? "chevron-down" : "chevron-right",
              size: 14,
              className: o.expanded ? void 0 : "rtl:zen-rotate-180"
            }
          )
        }
      ) : /* @__PURE__ */ i("span", { "aria-hidden": "true", className: "zen-h-5 zen-w-5 zen-shrink-0" }),
      /* @__PURE__ */ y("span", { className: "zen-min-w-0", children: [
        /* @__PURE__ */ i(
          "span",
          {
            className: _(
              "zen-block zen-truncate zen-text-sm zen-text-zen-foreground",
              o.hasChildren && "zen-font-semibold"
            ),
            title: h.name,
            children: h.name
          }
        ),
        h.subtitle && /* @__PURE__ */ i("span", { className: "zen-block zen-truncate zen-text-[10px] zen-text-zen-muted-fg", children: h.subtitle })
      ] }),
      o.overloaded && /* @__PURE__ */ i(
        ge,
        {
          name: "warn",
          size: 13,
          className: "zen-ms-auto zen-shrink-0 zen-text-zen-error",
          title: g.t("productionSchedule.overCapacity")
        }
      )
    ] });
  if (t === "jobs") {
    const M = o.subtree.length;
    return /* @__PURE__ */ y("span", { className: "zen-text-sm zen-text-zen-muted-fg", children: [
      M === 0 ? "—" : M,
      o.overflow > 0 && /* @__PURE__ */ y("span", { className: "zen-ms-1 zen-text-[10px] zen-text-zen-error", children: [
        "+",
        o.overflow
      ] })
    ] });
  }
  return t === "capacity" ? /* @__PURE__ */ i("span", { className: "zen-flex zen-items-center zen-gap-1 zen-text-sm zen-text-zen-muted-fg", children: /* @__PURE__ */ y("span", { dir: "ltr", children: [
    "×",
    o.capacity
  ] }) }) : t === "float" ? l ? /* @__PURE__ */ i(
    je,
    {
      dir: "ltr",
      variant: "soft",
      color: l.totalFloatMinutes < 0 ? "error" : l.critical ? "warning" : "neutral",
      title: l.totalFloatMinutes < 0 ? g.t("productionSchedule.floatLate", { time: ae(-l.totalFloatMinutes) }) : l.freeFloatMinutes < 0 ? g.t("productionSchedule.floatOverlaps", { time: ae(-l.freeFloatMinutes) }) : l.critical ? g.t("productionSchedule.floatCritical") : g.t("productionSchedule.floatFree", { time: ae(l.freeFloatMinutes) }),
      children: l.critical && l.totalFloatMinutes === 0 ? g.t("productionSchedule.critical") : ae(l.totalFloatMinutes)
    }
  ) : /* @__PURE__ */ i("span", { className: "zen-text-sm zen-text-zen-muted-fg", children: "—" }) : !r || r.utilisation === null ? /* @__PURE__ */ i("span", { className: "zen-text-sm zen-text-zen-muted-fg", children: "—" }) : /* @__PURE__ */ i(
    je,
    {
      dir: "ltr",
      variant: "soft",
      color: r.overloaded ? "error" : r.utilisation >= 0.85 ? "warning" : "success",
      children: Ke(r.utilisation)
    }
  );
}, $t = ({
  row: t,
  range: o,
  laneTop: r,
  onOperationClick: l,
  mayMove: s,
  msPerPx: g,
  onPropose: h,
  isCritical: M,
  onPlace: P
}) => {
  const p = Q(), z = P !== void 0 && !t.hasChildren, [w, A] = u.useState(null), T = (d, b) => {
    const v = d.getBoundingClientRect(), R = st(d) === "rtl" ? (v.right - b) / v.width : (b - v.left) / v.width;
    return Math.min(1, Math.max(0, R));
  }, D = (d) => [...d.dataTransfer.types].includes(Re), X = (d) => {
    !z || !D(d) || (d.preventDefault(), d.dataTransfer.dropEffect = "move", A(T(d.currentTarget, d.clientX)));
  }, V = (d) => {
    if (A(null), !z || !D(d)) return;
    d.preventDefault();
    const b = d.dataTransfer.getData(Re);
    if (!b) return;
    const v = o.start.getTime(), R = o.end.getTime() - v, K = new Date(pt(v + T(d.currentTarget, d.clientX) * R, 15));
    P?.({ operationId: b, resourceId: t.resource.id, start: K });
  }, C = /* @__PURE__ */ y(ie, { children: [
    t.lanes.length === 0 && /* An expanded parent draws nothing because its children draw its work —
    which is a fact worth saying, not a blank cell. */
    /* @__PURE__ */ i("span", { className: "zen-sr-only", children: t.hasChildren && t.expanded ? p.t("productionSchedule.workBelow") : p.t("productionSchedule.nothingBooked") }),
    t.lanes.map(
      (d, b) => d.map((v) => /* @__PURE__ */ i(
        Et,
        {
          placement: v,
          row: t,
          range: o,
          top: r(b),
          onOperationClick: l,
          mayMove: s,
          msPerPx: g,
          onPropose: h,
          critical: M(v.operation.id)
        },
        v.operation.id
      ))
    )
  ] });
  return z ? /* @__PURE__ */ y(
    "div",
    {
      "data-drop-target": "",
      className: _("zen-absolute zen-inset-0", w !== null && "zen-bg-zen-primary-soft"),
      onDragOver: X,
      onDragLeave: () => A(null),
      onDrop: V,
      children: [
        C,
        w !== null && w !== 0 && /* @__PURE__ */ i(
          "span",
          {
            "aria-hidden": "true",
            className: "zen-pointer-events-none zen-absolute zen-inset-y-0 zen-w-0.5 zen-bg-zen-primary",
            style: { insetInlineStart: `${w * 100}%` }
          }
        )
      ]
    }
  ) : C;
}, Et = ({
  placement: t,
  row: o,
  range: r,
  top: l,
  onOperationClick: s,
  mayMove: g,
  msPerPx: h,
  onPropose: M,
  critical: P
}) => {
  const p = Q(), { operation: z } = t, w = fe(t.span, r), A = z.status ?? "on-track", T = z.percentComplete ?? null, D = ut(t.span.end, z.due) ?? 0, X = (() => {
    if (D <= 0) return null;
    const a = dt(D);
    return p.t("productionSchedule.late", { duration: p.t(a.key, a.values) });
  })(), V = u.useMemo(() => {
    if (!w) return [];
    const a = Math.max(t.span.start.getTime(), r.start.getTime()), F = Math.min(t.span.end.getTime(), r.end.getTime()), f = F - a;
    if (f <= 0) return [];
    const B = t.setup ? t.setup.end.getTime() : a, I = t.segments ?? [t.span], O = [];
    for (const j of I) {
      const k = Math.max(j.start.getTime(), a), $ = Math.min(j.end.getTime(), F);
      if ($ <= k) continue;
      const N = $ - k, E = Math.max(0, Math.min(B, $) - k);
      O.push({
        key: k,
        startPct: (k - a) / f * 100,
        widthPct: N / f * 100,
        setupPct: E / N * 100
      });
    }
    return O;
  }, [w, t, r]), [C, d] = u.useState(null), b = g(z), v = (a) => new Date(t.span.start.getTime() + a * h), R = (a) => {
    if (!b || a.button !== 0) return;
    const F = a.clientX, f = a.currentTarget;
    f.setPointerCapture(a.pointerId);
    const B = getComputedStyle(f).direction === "rtl";
    let I = 0;
    const O = (E) => {
      I = E.clientX - F, d(I);
    }, j = (E) => {
      f.releasePointerCapture?.(a.pointerId), f.removeEventListener("pointermove", O), f.removeEventListener("pointerup", k), f.removeEventListener("pointercancel", $), window.removeEventListener("keydown", N), d(null), E && Math.abs(I) > 3 ? M({ operationId: z.id, start: v(I * (B ? -1 : 1)) }) : E && s?.(z, o);
    }, k = () => j(!0), $ = () => j(!1), N = (E) => {
      E.key === "Escape" && j(!1);
    };
    f.addEventListener("pointermove", O), f.addEventListener("pointerup", k), f.addEventListener("pointercancel", $), window.addEventListener("keydown", N);
  }, K = (a) => {
    if (!b || !a.altKey) return;
    const F = getComputedStyle(a.currentTarget).direction === "rtl", f = F ? "ArrowLeft" : "ArrowRight", B = F ? "ArrowRight" : "ArrowLeft";
    if (a.key !== f && a.key !== B) return;
    a.preventDefault(), a.stopPropagation();
    const I = (a.shiftKey ? 24 : 1) * 60 * 6e4 * (a.key === f ? 1 : -1);
    M({
      operationId: z.id,
      start: new Date(t.span.start.getTime() + I)
    });
  };
  if (!w) return null;
  const Z = [
    z.name,
    z.order ? p.t("productionSchedule.order", { order: z.order }) : null,
    `${se(t.span.start)} – ${se(t.span.end)}`,
    t.setup ? p.t("productionSchedule.inclChangeover") : null,
    P ? p.t("productionSchedule.onCriticalPath") : null,
    X,
    T === null ? null : `${Math.round(T)}%`
  ].filter(Boolean).join(" · ");
  return /* @__PURE__ */ y(
    "button",
    {
      type: "button",
      tabIndex: -1,
      "data-gantt-bar": "",
      "data-gantt-movable": b ? "" : void 0,
      onClick: () => {
        b || s?.(z, o);
      },
      onPointerDown: R,
      onKeyDown: K,
      className: _(
        "zen-absolute zen-rounded-zen-sm",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        s && "hover:zen-brightness-95",
        /* The affordance IS the gate: an operation the caller will not let
           move simply does not offer to. */
        b && "zen-cursor-grab active:zen-cursor-grabbing",
        /* A RING, not a recolour. The bar's fill already carries status, so
           a critical operation cannot be signalled by hue without taking
           that meaning away — and the Float column says "Critical" in words
           beside it, because a ring on its own is not a legend. */
        P && "zen-ring-2 zen-ring-zen-warning zen-ring-offset-1",
        C !== null && "zen-z-20 zen-opacity-80 zen-shadow-zen-md"
      ),
      style: {
        insetInlineStart: `${w.startPct}%`,
        width: `${w.widthPct}%`,
        top: l,
        height: G,
        /* Logical, so the preview follows the pointer under RTL too. */
        ...C !== null ? { translate: `${C}px` } : null
      },
      title: Z,
      children: [
        /* @__PURE__ */ y("span", { className: "zen-sr-only", children: [
          p.t("productionSchedule.barSpan", {
            name: z.name,
            start: se(t.span.start),
            end: se(t.span.end),
            changeover: t.setup ? p.t("productionSchedule.barChangeover") : "",
            progress: T === null ? "" : p.t("productionSchedule.barProgress", { percent: Math.round(T) })
          }),
          X && /* @__PURE__ */ y(ie, { children: [
            ". ",
            X
          ] })
        ] }),
        V.map((a) => /* @__PURE__ */ y(
          "span",
          {
            "aria-hidden": "true",
            className: _(
              "zen-absolute zen-inset-y-0 zen-overflow-hidden zen-rounded-zen-sm zen-border",
              Nt[A]
            ),
            style: { insetInlineStart: `${a.startPct}%`, width: `${a.widthPct}%` },
            children: [
              a.setupPct > 0 && /* @__PURE__ */ i(
                "span",
                {
                  className: "zen-absolute zen-inset-y-0 zen-start-0 zen-opacity-70",
                  style: {
                    width: `${a.setupPct}%`,
                    backgroundImage: "repeating-linear-gradient(45deg, var(--zen-color-muted-fg) 0 2px, transparent 2px 5px)"
                  }
                }
              ),
              T !== null && a.setupPct < 100 && /* @__PURE__ */ i(
                "span",
                {
                  className: _("zen-absolute zen-inset-y-0", Ct[A]),
                  style: {
                    insetInlineStart: `${a.setupPct}%`,
                    width: `${(100 - a.setupPct) * T / 100}%`
                  }
                }
              )
            ]
          },
          a.key
        )),
        D > 0 && /* @__PURE__ */ i(
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
}, Lt = ({
  columns: t,
  columnWidths: o,
  axisWidth: r,
  paneWidth: l,
  buckets: s
}) => {
  const g = Q();
  return /* @__PURE__ */ y(ie, { children: [
    /* @__PURE__ */ i(
      "div",
      {
        className: "zen-sticky zen-z-40 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-muted zen-px-3 zen-text-xs zen-font-semibold zen-text-zen-muted-fg",
        style: { width: l, insetInlineStart: 0, height: Oe },
        children: g.t("productionSchedule.load")
      }
    ),
    /* @__PURE__ */ i("div", { className: "zen-flex", style: { width: r, height: Oe }, children: t.map((h, M) => {
      const P = s[M], p = P?.utilisation ?? null, z = p === null ? 0 : Math.min(1, p), w = p === null ? 0 : Math.max(0, Math.min(1, p - 1));
      return /* @__PURE__ */ y(
        "div",
        {
          className: _(
            "zen-relative zen-shrink-0 zen-border-e zen-border-zen-border last:zen-border-e-0",
            p === null && "zen-bg-zen-muted"
          ),
          style: { width: o[M] },
          title: p === null ? g.t("productionSchedule.closed") : g.t(P.overloaded ? "productionSchedule.ofCapacityOver" : "productionSchedule.ofCapacity", { percent: Ke(p) }),
          children: [
            /* @__PURE__ */ i(
              "span",
              {
                "aria-hidden": "true",
                className: _(
                  "zen-absolute zen-bottom-0 zen-start-0 zen-end-0",
                  P?.overloaded ? "zen-bg-zen-error/70" : "zen-bg-zen-info/70"
                ),
                style: { height: `${z * 100}%` }
              }
            ),
            w > 0 && /* @__PURE__ */ i(
              "span",
              {
                "aria-hidden": "true",
                className: "zen-absolute zen-start-0 zen-end-0 zen-top-0 zen-bg-zen-error",
                style: { height: `${Math.max(3, w * 100)}%` }
              }
            )
          ]
        },
        h.start.getTime()
      );
    }) })
  ] });
};
export {
  Jt as ProductionSchedule
};
//# sourceMappingURL=index111.js.map
