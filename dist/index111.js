import { jsx as s, jsxs as v, Fragment as ze } from "react/jsx-runtime";
import * as u from "react";
import { cn as L } from "./index160.js";
import "./index28.js";
import { placeAppointment as pe } from "./index215.js";
import { ganttFitRange as ot, ganttConnectors as rt } from "./index110.js";
import { flattenProductionResources as st, productionLoad as Fe, productionSequenceConflicts as it } from "./index112.js";
import { productionReschedule as at } from "./index113.js";
import { productionCriticalPath as ct } from "./index114.js";
import { Badge as De } from "./index64.js";
import { EmptyState as lt, EmptyStateIcon as ut, EmptyStateTitle as dt, EmptyStateDescription as mt } from "./index99.js";
import { Icon as he } from "./index63.js";
import { Skeleton as ne } from "./index68.js";
import { TooltipProvider as pt } from "./index72.js";
import { useScrollerMetrics as ht, useScheduleAxis as zt, INDENT_PX as _e, ScheduleGrid as ft, ROW_PX as gt } from "./index216.js";
import { useLocale as G } from "./index90.js";
const de = {
  resource: 180,
  jobs: 60,
  capacity: 72,
  load: 84,
  float: 84
}, bt = {
  resource: "productionSchedule.column.resource",
  jobs: "productionSchedule.column.jobs",
  capacity: "productionSchedule.column.capacity",
  load: "productionSchedule.load",
  /* The row's TIGHTEST operation, because a row is only as movable as the job
     on it with the least room. Reporting an average would say a machine has
     four hours of slack while one of its jobs has none. */
  float: "productionSchedule.column.float"
}, Re = {
  resource: 1,
  jobs: 2,
  capacity: 3,
  load: 4,
  float: 5,
  timeline: 6
}, wt = ["resource", "jobs", "capacity", "load"], R = 16, me = 4, St = 14, je = 40, xt = {
  "not-started": "zen-bg-zen-muted zen-border-zen-border",
  "on-track": "zen-bg-zen-info-soft zen-border-zen-info/40",
  delayed: "zen-bg-zen-error-soft zen-border-zen-error/40",
  complete: "zen-bg-zen-success-soft zen-border-zen-success/40"
}, yt = {
  "not-started": "zen-bg-zen-neutral/30",
  "on-track": "zen-bg-zen-info",
  delayed: "zen-bg-zen-error",
  complete: "zen-bg-zen-success"
}, vt = (t) => {
  const i = [], o = (l) => {
    for (const r of l)
      r.children && r.children.length > 0 && (i.push(r.id), o(r.children));
  };
  return o(t), i;
}, oe = (t) => `${t.getDate()} ${t.toLocaleString(void 0, { month: "short" })} ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`, Xe = (t) => `${Math.round(t * 100)}%`, Kt = ({
  resources: t,
  operations: i,
  dependencies: o,
  showDependencies: l = !0,
  calendar: r,
  hourStep: z,
  setupMatrix: m,
  defaultView: x,
  view: y,
  onViewChange: p,
  views: f,
  defaultDate: g,
  date: j,
  onDateChange: k,
  expanded: q,
  defaultExpanded: X,
  onExpandedChange: H,
  onOperationClick: I,
  onReschedule: D,
  canReschedule: U,
  maxLanes: J = 3,
  showLoad: Q = !0,
  showCriticalPath: a = !1,
  until: M,
  now: h,
  columnWidth: A,
  hideToolbar: P,
  columns: F,
  loading: $,
  loadingRows: N = 6,
  emptyState: E,
  className: T
}) => {
  const b = G(), [Be, Oe] = u.useState(x ?? "fit"), [Ke, We] = u.useState(g ?? /* @__PURE__ */ new Date()), [Ve, Ge] = u.useState(X ?? null), fe = u.useRef(null), { metrics: ge, setMetrics: qe } = ht(fe), B = y ?? Be, se = j ?? Ke, ie = u.useRef(null);
  ie.current === null && (ie.current = /* @__PURE__ */ new Date());
  const Y = h ?? ie.current, be = Y.getTime(), we = se.getTime(), Se = (e) => {
    j === void 0 && We(e), k?.(e);
  }, O = q ?? Ve, ae = u.useMemo(
    () => O === null ? null : new Set(O),
    [O]
  ), xe = (e) => {
    const n = O ?? vt(t), c = n.includes(e) ? n.filter((d) => d !== e) : [...n, e];
    q === void 0 && Ge(c), H?.(c);
  }, K = u.useMemo(() => B !== "fit" ? null : ot(
    i.map((e) => ({
      id: e.id,
      start: e.start,
      end: e.end,
      /* Setup claims the machine too, so it belongs inside the range. Without
         it a chart whose first job opens with a two-hour changeover starts
         two hours after the work does. */
      workingMinutes: e.end === void 0 ? (e.setupMinutes ?? 0) + (e.runMinutes ?? 0) : void 0
    })),
    { calendar: r }
  ), [B, i, r]), Z = F ?? wt, He = u.useMemo(
    () => Z.map((e) => ({ key: e, width: de[e] })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Z.join(",")]
  ), ye = zt({
    view: B,
    anchor: se,
    fitRange: K,
    now: Y,
    calendar: r,
    hourStep: z,
    columnWidth: A,
    paneColumns: He,
    available: ge.width
  }), { range: C, columns: ve, axisWidth: ee, minGapMs: Me } = ye, { rows: w, rowIndexById: Pe, operationIndex: Ue } = u.useMemo(
    () => st(
      t ?? [],
      i ?? [],
      (e) => ae === null ? !0 : ae.has(e.id),
      { calendar: r, maxLanes: J, minGapMs: Me, setupMatrix: m }
    ),
    [t, i, ae, r, J, Me, m]
  ), _ = Math.max(1, ...w.map((e) => e.lanes.length)), W = Math.max(
    gt,
    _ * R + (_ - 1) * me + St
  ), Je = (W - (_ * R + (_ - 1) * me)) / 2, ce = (e) => Je + e * (R + me), te = u.useMemo(() => {
    const e = /* @__PURE__ */ new Map();
    for (const n of w)
      for (const c of n.lanes)
        for (const d of c) e.set(d.operation.id, { placement: d, row: n });
    return e;
  }, [w]), Qe = u.useMemo(() => {
    if (!l || !o || o.length === 0) return [];
    const e = /* @__PURE__ */ new Map();
    for (const [n, c] of te) {
      const d = pe(c.placement.span, C);
      if (!d) continue;
      const S = Ue.get(n)?.lane ?? 0;
      e.set(n, {
        rowIndex: c.row.index,
        startPct: d.startPct,
        widthPct: d.widthPct,
        /* The LANE's centre, not the row's. A routing arrow that pointed at the
           middle of a three-lane row would miss every bar in it. */
        yOffset: ce(S) + R / 2
      });
    }
    for (const [n, c] of Pe) {
      if (e.has(n)) continue;
      const S = w[c]?.lanes[0]?.[0];
      if (!S) continue;
      const ue = pe(S.span, C);
      ue && e.set(n, {
        rowIndex: c,
        startPct: ue.startPct,
        widthPct: ue.widthPct,
        yOffset: ce(0) + R / 2
      });
    }
    return rt(e, o, { axisWidth: ee, rowHeight: W });
  }, [l, o, te, Pe, w, C, ee, W, _]), le = u.useMemo(() => {
    if (!Q) return null;
    const e = w.filter((d) => d.parentId === null), n = e.flatMap((d) => d.subtree), c = e.reduce((d, S) => d + S.capacity, 0);
    return Fe(n, ve, { calendar: r, capacity: Math.max(1, c) });
  }, [Q, w, ve, r]), Ne = u.useMemo(() => {
    const e = /* @__PURE__ */ new Map(), n = [
      { start: C.start, end: C.end, label: "", sublabel: "", nonWorking: !1, today: !1 }
    ];
    for (const c of w)
      e.set(
        c.index,
        Fe(c.subtree, n, {
          calendar: c.resource.calendar ?? r,
          capacity: c.capacity
        })[0]
      );
    return e;
  }, [w, C, r]), V = u.useMemo(() => a ? ct(i ?? [], o ?? [], {
    calendar: r,
    setupMatrix: m,
    until: M
  }) : null, [a, i, o, r, m, M?.getTime()]), Ce = u.useMemo(() => {
    const e = /* @__PURE__ */ new Map();
    if (!V) return e;
    for (const n of w) {
      let c;
      for (const d of n.subtree) {
        const S = V.byOperation.get(d.operation.id);
        S && (!c || S.totalFloatMinutes < c.totalFloatMinutes) && (c = S);
      }
      c && e.set(n.index, c);
    }
    return e;
  }, [V, w]), Ye = u.useMemo(
    () => Z.map((e) => ({
      key: e,
      label: b.t(bt[e]),
      width: de[e],
      colIndex: Re[e],
      className: e === "resource" ? "zen-min-w-0 zen-gap-1 zen-pe-2" : "zen-px-2",
      style: e === "resource" ? (n) => ({ paddingInlineStart: 8 + n.depth * _e }) : void 0,
      render: (n) => /* @__PURE__ */ s(
        Mt,
        {
          column: e,
          row: n,
          load: Ne.get(n.index),
          float: Ce.get(n.index),
          onToggle: xe
        }
      )
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Z.join(","), Ne, Ce, O, t]
  ), Ie = u.useMemo(() => {
    if (!l || !o || o.length === 0) return null;
    const e = /* @__PURE__ */ new Map();
    for (const [c, d] of te) e.set(c, d.placement);
    const n = it(o, e, { calendar: r });
    return new Set(n.map((c) => `${c.operationIds[0]}->${c.operationIds[1]}`));
  }, [l, o, te, r]), Ze = u.useCallback(
    (e) => Ie?.has(`${e.from}->${e.to}`) ?? !1,
    [Ie]
  ), Te = D !== void 0, ke = u.useCallback(
    (e) => Te && (U?.(e) ?? !0),
    [Te, U]
  ), $e = ee > 0 ? (C.end.getTime() - C.start.getTime()) / ee : 0, Ee = u.useCallback(
    (e) => {
      const n = (c) => {
        for (const d of c) {
          if (d.id === e) return d.calendar ?? r;
          const S = d.children ? n(d.children) : void 0;
          if (S) return S;
        }
      };
      return n(t ?? []) ?? r;
    },
    [t, r]
  ), Le = u.useCallback(
    (e) => {
      D && D(
        at(i, o ?? [], e, {
          calendar: r,
          calendarFor: Ee,
          resources: t,
          setupMatrix: m
        })
      );
    },
    [D, i, o, r, Ee, t, m]
  ), et = (e) => {
    if (B === "fit" && e !== "fit" && K) {
      const n = K.start.getTime(), c = K.end.getTime();
      (we < n || we >= c) && Se(be >= n && be < c ? Y : K.start);
    }
    y === void 0 && Oe(e), p?.(e);
  }, Ae = u.useCallback(
    (e) => V?.byOperation.get(e)?.critical ?? !1,
    [V]
  ), tt = u.useCallback(
    (e) => /* @__PURE__ */ s(
      Pt,
      {
        row: e,
        range: C,
        laneTop: ce,
        onOperationClick: I,
        mayMove: ke,
        msPerPx: $e,
        onPropose: Le,
        isCritical: Ae
      }
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [C, I, W, _, ke, $e, Le, Ae]
  ), nt = u.useCallback(
    (e) => /* @__PURE__ */ s(Ct, { ...e, buckets: le }),
    [le]
  );
  return $ ? /* @__PURE__ */ s(
    "div",
    {
      className: L(
        "zen-flex zen-w-full zen-flex-col zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3",
        T
      ),
      role: "status",
      "aria-label": b.t("productionSchedule.loadingProductionSchedule"),
      children: Array.from({ length: N }, (e, n) => /* @__PURE__ */ v("div", { className: "zen-flex zen-items-center zen-gap-3", children: [
        /* @__PURE__ */ s(ne, { className: "zen-h-4", style: { width: de.resource - 24 - n % 3 * _e } }),
        /* @__PURE__ */ s(ne, { className: "zen-h-4 zen-w-12" }),
        /* @__PURE__ */ s(ne, { className: "zen-h-4", style: { marginInlineStart: `${n * 29 % 40}%`, width: `${12 + n * 7 % 18}%` } }),
        /* @__PURE__ */ s(ne, { className: "zen-h-4", style: { width: `${10 + n * 11 % 20}%` } })
      ] }, n))
    }
  ) : w.length === 0 ? /* @__PURE__ */ s("div", { className: L("zen-w-full", T), children: E ?? /* @__PURE__ */ v(lt, { bordered: !0, children: [
    /* @__PURE__ */ s(ut, { children: /* @__PURE__ */ s(he, { name: "cog", size: 22 }) }),
    /* @__PURE__ */ s(dt, { children: b.t("productionSchedule.noResources") }),
    /* @__PURE__ */ s(mt, { children: b.t("productionSchedule.addAWorkCentreAnd") })
  ] }) }) : /* @__PURE__ */ s(pt, { delayDuration: 200, children: /* @__PURE__ */ s(
    ft,
    {
      rows: w,
      rowId: (e) => e.resource.id,
      columns: Ye,
      colCount: 6,
      timelineColIndex: Re.timeline,
      renderTrack: tt,
      rowHeight: W,
      renderFooter: le ? nt : void 0,
      view: B,
      anchor: se,
      now: Y,
      connectors: Qe,
      connectorAccent: Ze,
      views: f,
      hideToolbar: P,
      onViewChange: et,
      onDateChange: Se,
      onToggle: (e) => xe(e.resource.id),
      onActivate: (e) => {
        const n = e.lanes[0]?.[0];
        n && I?.(n.operation, e);
      },
      ariaLabel: b.t("productionSchedule.productionSchedule"),
      className: T,
      scrollerRef: fe,
      axis: ye,
      metrics: ge,
      setMetrics: qe
    }
  ) });
}, re = (t) => {
  const i = t < 0 ? "-" : "", o = Math.abs(t);
  if (o === 0) return "0";
  if (o < 60) return `${i}${o}m`;
  const l = Math.floor(o / 60), r = o % 60;
  return r === 0 ? `${i}${l}h` : `${i}${l}h ${r}m`;
}, Mt = ({
  column: t,
  row: i,
  load: o,
  float: l,
  onToggle: r
}) => {
  const z = G(), { resource: m } = i;
  if (t === "resource")
    return /* @__PURE__ */ v(ze, { children: [
      i.hasChildren ? /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          tabIndex: -1,
          onClick: () => r(m.id),
          "aria-label": z.t(i.expanded ? "productionSchedule.collapseResource" : "productionSchedule.expandResource", { name: m.name }),
          className: "zen-flex zen-h-5 zen-w-5 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-text-zen-muted-fg hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          children: /* @__PURE__ */ s(
            he,
            {
              name: i.expanded ? "chevron-down" : "chevron-right",
              size: 14,
              className: i.expanded ? void 0 : "rtl:zen-rotate-180"
            }
          )
        }
      ) : /* @__PURE__ */ s("span", { "aria-hidden": "true", className: "zen-h-5 zen-w-5 zen-shrink-0" }),
      /* @__PURE__ */ v("span", { className: "zen-min-w-0", children: [
        /* @__PURE__ */ s(
          "span",
          {
            className: L(
              "zen-block zen-truncate zen-text-sm zen-text-zen-foreground",
              i.hasChildren && "zen-font-semibold"
            ),
            title: m.name,
            children: m.name
          }
        ),
        m.subtitle && /* @__PURE__ */ s("span", { className: "zen-block zen-truncate zen-text-[10px] zen-text-zen-muted-fg", children: m.subtitle })
      ] }),
      i.overloaded && /* @__PURE__ */ s(
        he,
        {
          name: "warn",
          size: 13,
          className: "zen-ms-auto zen-shrink-0 zen-text-zen-error",
          title: z.t("productionSchedule.overCapacity")
        }
      )
    ] });
  if (t === "jobs") {
    const x = i.subtree.length;
    return /* @__PURE__ */ v("span", { className: "zen-text-sm zen-text-zen-muted-fg", children: [
      x === 0 ? "—" : x,
      i.overflow > 0 && /* @__PURE__ */ v("span", { className: "zen-ms-1 zen-text-[10px] zen-text-zen-error", children: [
        "+",
        i.overflow
      ] })
    ] });
  }
  return t === "capacity" ? /* @__PURE__ */ s("span", { className: "zen-flex zen-items-center zen-gap-1 zen-text-sm zen-text-zen-muted-fg", children: /* @__PURE__ */ v("span", { dir: "ltr", children: [
    "×",
    i.capacity
  ] }) }) : t === "float" ? l ? /* @__PURE__ */ s(
    De,
    {
      dir: "ltr",
      variant: "soft",
      color: l.totalFloatMinutes < 0 ? "error" : l.critical ? "warning" : "neutral",
      title: l.totalFloatMinutes < 0 ? z.t("productionSchedule.floatLate", { time: re(-l.totalFloatMinutes) }) : l.freeFloatMinutes < 0 ? z.t("productionSchedule.floatOverlaps", { time: re(-l.freeFloatMinutes) }) : l.critical ? z.t("productionSchedule.floatCritical") : z.t("productionSchedule.floatFree", { time: re(l.freeFloatMinutes) }),
      children: l.critical && l.totalFloatMinutes === 0 ? z.t("productionSchedule.critical") : re(l.totalFloatMinutes)
    }
  ) : /* @__PURE__ */ s("span", { className: "zen-text-sm zen-text-zen-muted-fg", children: "—" }) : !o || o.utilisation === null ? /* @__PURE__ */ s("span", { className: "zen-text-sm zen-text-zen-muted-fg", children: "—" }) : /* @__PURE__ */ s(
    De,
    {
      dir: "ltr",
      variant: "soft",
      color: o.overloaded ? "error" : o.utilisation >= 0.85 ? "warning" : "success",
      children: Xe(o.utilisation)
    }
  );
}, Pt = ({
  row: t,
  range: i,
  laneTop: o,
  onOperationClick: l,
  mayMove: r,
  msPerPx: z,
  onPropose: m,
  isCritical: x
}) => {
  const y = G();
  return /* @__PURE__ */ v(ze, { children: [
    t.lanes.length === 0 && /* An expanded parent draws nothing because its children draw its work —
    which is a fact worth saying, not a blank cell. */
    /* @__PURE__ */ s("span", { className: "zen-sr-only", children: t.hasChildren && t.expanded ? y.t("productionSchedule.workBelow") : y.t("productionSchedule.nothingBooked") }),
    t.lanes.map(
      (p, f) => p.map((g) => /* @__PURE__ */ s(
        Nt,
        {
          placement: g,
          row: t,
          range: i,
          top: o(f),
          onOperationClick: l,
          mayMove: r,
          msPerPx: z,
          onPropose: m,
          critical: x(g.operation.id)
        },
        g.operation.id
      ))
    )
  ] });
}, Nt = ({
  placement: t,
  row: i,
  range: o,
  top: l,
  onOperationClick: r,
  mayMove: z,
  msPerPx: m,
  onPropose: x,
  critical: y
}) => {
  const p = G(), { operation: f } = t, g = pe(t.span, o), j = f.status ?? "on-track", k = f.percentComplete ?? null, q = u.useMemo(() => {
    if (!g) return [];
    const a = Math.max(t.span.start.getTime(), o.start.getTime()), M = Math.min(t.span.end.getTime(), o.end.getTime()), h = M - a;
    if (h <= 0) return [];
    const A = t.setup ? t.setup.end.getTime() : a, P = t.segments ?? [t.span], F = [];
    for (const $ of P) {
      const N = Math.max($.start.getTime(), a), E = Math.min($.end.getTime(), M);
      if (E <= N) continue;
      const T = E - N, b = Math.max(0, Math.min(A, E) - N);
      F.push({
        key: N,
        startPct: (N - a) / h * 100,
        widthPct: T / h * 100,
        setupPct: b / T * 100
      });
    }
    return F;
  }, [g, t, o]), [X, H] = u.useState(null), I = z(f), D = (a) => new Date(t.span.start.getTime() + a * m), U = (a) => {
    if (!I || a.button !== 0) return;
    const M = a.clientX, h = a.currentTarget;
    h.setPointerCapture(a.pointerId);
    const A = getComputedStyle(h).direction === "rtl";
    let P = 0;
    const F = (b) => {
      P = b.clientX - M, H(P);
    }, $ = (b) => {
      h.releasePointerCapture?.(a.pointerId), h.removeEventListener("pointermove", F), h.removeEventListener("pointerup", N), h.removeEventListener("pointercancel", E), window.removeEventListener("keydown", T), H(null), b && Math.abs(P) > 3 ? x({ operationId: f.id, start: D(P * (A ? -1 : 1)) }) : b && r?.(f, i);
    }, N = () => $(!0), E = () => $(!1), T = (b) => {
      b.key === "Escape" && $(!1);
    };
    h.addEventListener("pointermove", F), h.addEventListener("pointerup", N), h.addEventListener("pointercancel", E), window.addEventListener("keydown", T);
  }, J = (a) => {
    if (!I || !a.altKey) return;
    const M = getComputedStyle(a.currentTarget).direction === "rtl", h = M ? "ArrowLeft" : "ArrowRight", A = M ? "ArrowRight" : "ArrowLeft";
    if (a.key !== h && a.key !== A) return;
    a.preventDefault(), a.stopPropagation();
    const P = (a.shiftKey ? 24 : 1) * 60 * 6e4 * (a.key === h ? 1 : -1);
    x({
      operationId: f.id,
      start: new Date(t.span.start.getTime() + P)
    });
  };
  if (!g) return null;
  const Q = [
    f.name,
    f.order ? p.t("productionSchedule.order", { order: f.order }) : null,
    `${oe(t.span.start)} – ${oe(t.span.end)}`,
    t.setup ? p.t("productionSchedule.inclChangeover") : null,
    y ? p.t("productionSchedule.onCriticalPath") : null,
    k === null ? null : `${Math.round(k)}%`
  ].filter(Boolean).join(" · ");
  return /* @__PURE__ */ v(
    "button",
    {
      type: "button",
      tabIndex: -1,
      "data-gantt-bar": "",
      "data-gantt-movable": I ? "" : void 0,
      onClick: () => {
        I || r?.(f, i);
      },
      onPointerDown: U,
      onKeyDown: J,
      className: L(
        "zen-absolute zen-rounded-zen-sm",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        r && "hover:zen-brightness-95",
        /* The affordance IS the gate: an operation the caller will not let
           move simply does not offer to. */
        I && "zen-cursor-grab active:zen-cursor-grabbing",
        /* A RING, not a recolour. The bar's fill already carries status, so
           a critical operation cannot be signalled by hue without taking
           that meaning away — and the Float column says "Critical" in words
           beside it, because a ring on its own is not a legend. */
        y && "zen-ring-2 zen-ring-zen-warning zen-ring-offset-1",
        X !== null && "zen-z-20 zen-opacity-80 zen-shadow-zen-md"
      ),
      style: {
        insetInlineStart: `${g.startPct}%`,
        width: `${g.widthPct}%`,
        top: l,
        height: R,
        /* Logical, so the preview follows the pointer under RTL too. */
        ...X !== null ? { translate: `${X}px` } : null
      },
      title: Q,
      children: [
        /* @__PURE__ */ s("span", { className: "zen-sr-only", children: p.t("productionSchedule.barSpan", {
          name: f.name,
          start: oe(t.span.start),
          end: oe(t.span.end),
          changeover: t.setup ? p.t("productionSchedule.barChangeover") : "",
          progress: k === null ? "" : p.t("productionSchedule.barProgress", { percent: Math.round(k) })
        }) }),
        q.map((a) => /* @__PURE__ */ v(
          "span",
          {
            "aria-hidden": "true",
            className: L(
              "zen-absolute zen-inset-y-0 zen-overflow-hidden zen-rounded-zen-sm zen-border",
              xt[j]
            ),
            style: { insetInlineStart: `${a.startPct}%`, width: `${a.widthPct}%` },
            children: [
              a.setupPct > 0 && /* @__PURE__ */ s(
                "span",
                {
                  className: "zen-absolute zen-inset-y-0 zen-start-0 zen-opacity-70",
                  style: {
                    width: `${a.setupPct}%`,
                    backgroundImage: "repeating-linear-gradient(45deg, var(--zen-color-muted-fg) 0 2px, transparent 2px 5px)"
                  }
                }
              ),
              k !== null && a.setupPct < 100 && /* @__PURE__ */ s(
                "span",
                {
                  className: L("zen-absolute zen-inset-y-0", yt[j]),
                  style: {
                    insetInlineStart: `${a.setupPct}%`,
                    width: `${(100 - a.setupPct) * k / 100}%`
                  }
                }
              )
            ]
          },
          a.key
        ))
      ]
    }
  );
}, Ct = ({
  columns: t,
  columnWidths: i,
  axisWidth: o,
  paneWidth: l,
  buckets: r
}) => {
  const z = G();
  return /* @__PURE__ */ v(ze, { children: [
    /* @__PURE__ */ s(
      "div",
      {
        className: "zen-sticky zen-z-40 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-muted zen-px-3 zen-text-xs zen-font-semibold zen-text-zen-muted-fg",
        style: { width: l, insetInlineStart: 0, height: je },
        children: z.t("productionSchedule.load")
      }
    ),
    /* @__PURE__ */ s("div", { className: "zen-flex", style: { width: o, height: je }, children: t.map((m, x) => {
      const y = r[x], p = y?.utilisation ?? null, f = p === null ? 0 : Math.min(1, p), g = p === null ? 0 : Math.max(0, Math.min(1, p - 1));
      return /* @__PURE__ */ v(
        "div",
        {
          className: L(
            "zen-relative zen-shrink-0 zen-border-e zen-border-zen-border last:zen-border-e-0",
            p === null && "zen-bg-zen-muted"
          ),
          style: { width: i[x] },
          title: p === null ? z.t("productionSchedule.closed") : z.t(y.overloaded ? "productionSchedule.ofCapacityOver" : "productionSchedule.ofCapacity", { percent: Xe(p) }),
          children: [
            /* @__PURE__ */ s(
              "span",
              {
                "aria-hidden": "true",
                className: L(
                  "zen-absolute zen-bottom-0 zen-start-0 zen-end-0",
                  y?.overloaded ? "zen-bg-zen-error/70" : "zen-bg-zen-info/70"
                ),
                style: { height: `${f * 100}%` }
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
        m.start.getTime()
      );
    }) })
  ] });
};
export {
  Kt as ProductionSchedule
};
//# sourceMappingURL=index111.js.map
