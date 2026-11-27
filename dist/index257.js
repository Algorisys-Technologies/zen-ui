import { jsx as n, jsxs as I, Fragment as Ie } from "react/jsx-runtime";
import * as s from "react";
import { cn as G } from "./index199.js";
import "./index208.js";
import "./index28.js";
import { nowPct as je } from "./index255.js";
import { ganttFitUnit as Ye, ganttFitHourStep as Je, ganttRange as $e, ganttContinuousRange as Qe, ganttRangeColumns as Ce, ganttViewUnit as _e, ganttColumns as Ze, ganttPaneColumns as et, ganttColumnWidths as tt, ganttHeaderGroups as nt, ganttColumnWindow as rt, ganttRowWindow as it, shiftGanttAnchor as Ee, ganttSpanLabel as st, ganttRangeLabel as at } from "./index110.js";
import { Button as de } from "./index71.js";
import { Icon as Re } from "./index63.js";
import { useLocale as ot } from "./index90.js";
const lt = 36, ct = 44, ye = 22, Nt = 14, Ae = {
  day: 56,
  week: 128,
  month: 44,
  /* Sized to FIT, not to breathe: a year you have to scroll sideways to reach
     December in is not showing you the year, which is the only reason the view
     exists. 14 × 72 and 12 × 80 both land near 1000px — inside a normal content
     column — and "13 Jul" and "Sep" are comfortable at those widths. */
  quarter: 72,
  year: 80
}, dt = {
  hour: 40,
  day: 20,
  /* 26, not the quarter view's 72: a fit week column draws "13" with the month
     only where it changes, not "13 Jul" twenty times over. */
  week: 26,
  month: 30
}, Fe = { min: 64, max: 180 }, ut = {
  day: 34,
  week: 44,
  month: 20,
  quarter: 38,
  year: 30
}, Pe = 280, ue = 5, ht = 512, We = "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-inset focus-visible:zen-ring-zen-ring", mt = {
  fit: "scheduleGrid.views.fit",
  day: "scheduleGrid.views.day",
  week: "scheduleGrid.views.week",
  month: "scheduleGrid.views.month",
  quarter: "scheduleGrid.views.quarter",
  year: "scheduleGrid.views.year"
}, zt = ["fit", "day", "week", "month", "quarter", "year"];
function St(i) {
  const { view: E, anchor: w, fitRange: a, now: o, calendar: u, hourStep: l, columnWidth: M, paneColumns: k, available: R, grouped: x, plan: X } = i, g = !!i.continuous && E !== "fit", N = i.monthUnit === "week" && E === "month" && !g, c = N ? "week" : void 0, d = E === "fit", h = d ? "month" : E, H = w.getTime(), he = o.getTime(), F = a ? Ye(a.end.getTime() - a.start.getTime()) : null, te = F === "hour" && l === void 0 && a ? Je(a.end.getTime() - a.start.getTime()) : l, me = s.useMemo(() => $e(h, w), [h, H]), V = X?.start.getTime(), ne = X?.end.getTime(), B = s.useMemo(
    () => g ? Qe(h, X ?? null, w) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [g, h, V, ne, H]
  ), K = a ?? B?.range ?? me, S = s.useMemo(
    () => a && F ? Ce(a, F, { now: o, calendar: u, hourStep: te, grouped: x }) : B ? Ce(B.range, _e(h), { now: o, calendar: u, hourStep: l, grouped: x }) : Ze(h, w, { now: o, calendar: u, hourStep: l, grouped: x, monthUnit: c }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [a, F, h, H, he, u, te, x, B, c]
  ), m = g ? Pe : M !== void 0 ? S.length * M : F ? S.length * dt[F] : N ? S.length * Fe.min : S.length * ut[h], z = M !== void 0 ? S.length * M : F ? Number.POSITIVE_INFINITY : N ? S.length * Fe.max : S.length * Ae[h], p = s.useMemo(() => {
    const T = {};
    for (const j of k) T[j.key] = j.width;
    return T;
  }, [k]), ze = k.map((T) => T.key).join(","), O = s.useMemo(
    () => et(
      k.map((T) => T.key),
      p,
      R,
      Math.max(Pe, m)
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ze, p, R, m]
  ), P = O.reduce((T, j) => T + (p[j] ?? 0), 0), U = S.length * (M ?? Ae[h]), y = g ? R > 0 ? Math.max(U, R - P) : U : R > 0 ? Math.min(z, Math.max(m, R - P)) : Number.isFinite(z) ? z : m, L = s.useMemo(
    () => tt(S, K, y),
    [S, K, y]
  ), f = s.useMemo(
    () => y > 0 ? (K.end.getTime() - K.start.getTime()) / y : 0,
    [K, y]
  ), re = F ?? (N ? "week" : _e(h)), ie = B?.clamped ?? !1;
  return { range: K, columns: S, columnWidths: L, axisWidth: y, paneWidth: P, isFit: d, unit: re, continuous: g, clamped: ie, minGapMs: f, paneKeys: O };
}
function Lt(i) {
  const [E, w] = s.useState({ top: 0, height: ht, width: 0, left: 0 }), a = s.useCallback(() => {
    const o = i.current;
    if (!o) return;
    const u = Math.abs(o.scrollLeft);
    w(
      (l) => l.top === o.scrollTop && l.height === o.clientHeight && l.width === o.clientWidth && l.left === u ? l : { top: o.scrollTop, height: o.clientHeight, width: o.clientWidth, left: u }
    );
  }, [i]);
  return s.useLayoutEffect(() => {
    const o = i.current;
    if (!o) return;
    let u = 0;
    const l = () => {
      u = 0, a();
    }, M = () => {
      u === 0 && (u = requestAnimationFrame(l));
    };
    o.addEventListener("scroll", M, { passive: !0 });
    const k = new ResizeObserver(M);
    return k.observe(o), () => {
      u !== 0 && cancelAnimationFrame(u), o.removeEventListener("scroll", M), k.disconnect();
    };
  }, [i, a]), s.useLayoutEffect(a), { metrics: E, setMetrics: w, measure: a };
}
function Tt({
  rows: i,
  rowId: E,
  columns: w,
  colCount: a,
  timelineColIndex: o,
  renderTrack: u,
  rowHeight: l = lt,
  rowClass: M,
  maxBodyHeight: k,
  headerClassName: R,
  headerGroups: x,
  renderFooter: X,
  view: g,
  anchor: N,
  now: c,
  connectors: d,
  connectorAccent: h,
  connectorStyle: H,
  views: he,
  hideToolbar: F,
  legend: te,
  onViewChange: me,
  onDateChange: V,
  onToggle: ne,
  onActivate: B,
  ariaLabel: K,
  className: S,
  scrollerRef: m,
  axis: z,
  metrics: p,
  setMetrics: ze
}) {
  const O = ot(), { range: P, columns: U, columnWidths: y, axisWidth: L, paneWidth: f, isFit: re, paneKeys: ie } = z, T = ct + (x ? ye : 0), j = s.useMemo(
    () => x ? nt(U, z.unit) : [],
    [x, U, z.unit]
  ), ve = (e) => y.slice(e.firstColumn, e.firstColumn + e.columnCount).reduce((t, r) => t + r, 0), Ge = (e) => ve(e) >= e.label.length * 7 + 16 ? e.label : e.shortLabel, Q = Math.max(0, p.width - f), se = s.useMemo(
    () => z.continuous ? rt(y, p.left, Q, Math.max(Q, 400)) : null,
    [z.continuous, y, p.left, Q]
  ), we = (e, t, r) => /* @__PURE__ */ I(
    "div",
    {
      className: G(
        "zen-flex zen-shrink-0 zen-flex-col zen-items-center zen-justify-center zen-overflow-hidden zen-border-e zen-border-zen-border last:zen-border-e-0",
        r !== void 0 && "zen-absolute zen-inset-y-0",
        e.nonWorking && "zen-bg-zen-muted",
        e.today && "zen-bg-zen-primary-soft"
      ),
      style: r !== void 0 ? { width: t, insetInlineStart: r } : { width: t },
      children: [
        /* @__PURE__ */ n("span", { className: "zen-text-xs zen-font-medium zen-text-zen-foreground", children: e.label }),
        e.sublabel && /* @__PURE__ */ n("span", { className: "zen-[font-size:var(--zen-schedule-label-font-size)] zen-text-zen-muted-fg", children: e.sublabel })
      ]
    },
    e.start.getTime()
  ), Me = se ? (
    // Windowed: positioned cells in a full-width box, so the header still spans
    // the whole axis and lines up with the rows below it.
    /* @__PURE__ */ n("div", { "data-schedule-windowed": "", className: "zen-relative zen-h-full zen-w-full", children: se.offsets.map((e, t) => {
      const r = se.first + t;
      return we(U[r], y[r], e);
    }) })
  ) : U.map((e, t) => we(e, y[t])), ae = g === "fit" ? "month" : g, Xe = (e) => z.minGapMs > 0 ? (e.getTime() - P.start.getTime()) / z.minGapMs : 0, fe = new Date(P.start.getTime() + (p.left + Q / 2) * z.minGapMs), ke = z.continuous ? fe : N, Ne = s.useRef(""), ge = `${g}|${N.getTime()}|${P.start.getTime()}|${P.end.getTime()}`;
  s.useEffect(() => {
    if (!z.continuous || p.width === 0 || Ne.current === ge) return;
    Ne.current = ge;
    const e = Xe($e(ae, N).start), t = requestAnimationFrame(() => {
      const r = m.current;
      if (!r) return;
      const b = Math.max(0, e);
      r.scrollLeft = getComputedStyle(r).direction === "rtl" ? -b : b;
    });
    return () => cancelAnimationFrame(t);
  }, [z.continuous, p.width > 0, ge]);
  const [Y, Oe] = s.useState({ x: 0, y: 0, edge: 0 });
  s.useLayoutEffect(() => {
    const e = m.current;
    if (!e) return;
    const t = e.clientTop, r = Math.max(0, e.offsetHeight - e.clientHeight - t * 2), b = Math.max(0, e.offsetWidth - e.clientWidth - t * 2);
    Oe((v) => v.x === r && v.y === b && v.edge === t ? v : { x: r, y: b, edge: t });
  });
  const Z = Y.x > 0 && f > 0 && Q > 0, oe = s.useRef(null), be = (e, t) => {
    e && t && Math.abs(t.scrollLeft - e.scrollLeft) >= 1 && (t.scrollLeft = e.scrollLeft);
  };
  s.useEffect(() => {
    const e = m.current;
    if (!Z || !e) return;
    const t = () => be(e, oe.current);
    return e.addEventListener("scroll", t, { passive: !0 }), () => e.removeEventListener("scroll", t);
  }, [Z, m]), s.useLayoutEffect(() => {
    Z && be(m.current, oe.current);
  }, [Z, L, p.width, m]);
  const Se = je(P, c), ee = i.length * l, xe = s.useMemo(
    () => ie.map((e) => w.find((t) => t.key === e)).filter(Boolean),
    [ie, w]
  ), pe = xe.length + 1, W = it(i.length, l, p.top, p.height), Ue = i.slice(W.startIndex, W.endIndex), Ke = s.useMemo(() => !d || d.length === 0 ? null : (
    /* Mirrored under RTL rather than recomputed: the bars are placed with
       logical inset properties, so the axis is already flipped and the routes
       have to flip with it — arrowheads included. */
    /* @__PURE__ */ n(
      "svg",
      {
        "aria-hidden": "true",
        className: "zen-pointer-events-none zen-absolute zen-top-0 zen-z-10 rtl:-zen-scale-x-100",
        width: L,
        height: ee,
        viewBox: `0 0 ${L} ${ee}`,
        style: { insetInlineStart: f },
        children: d.map((e) => {
          const t = h?.(e) ?? !1, r = H?.(e), b = t ? "var(--zen-color-error)" : r?.color ?? "var(--zen-color-muted-fg)";
          return /* @__PURE__ */ I("g", { children: [
            /* @__PURE__ */ n(
              "path",
              {
                d: e.d,
                fill: "none",
                stroke: b,
                strokeDasharray: r?.dash,
                strokeWidth: t ? 2.25 : 1.5
              }
            ),
            /* @__PURE__ */ n(
              "polygon",
              {
                points: [
                  `${e.arrow.x},${e.arrow.y}`,
                  `${e.arrow.x - e.arrow.dir * ue * 1.6},${e.arrow.y - ue}`,
                  `${e.arrow.x - e.arrow.dir * ue * 1.6},${e.arrow.y + ue}`
                ].join(" "),
                fill: b
              }
            )
          ] }, e.id);
        })
      }
    )
  ), [d, h, H, L, ee, f]), [Le, Te] = s.useState({ row: 0, col: 0 }), q = Math.min(Math.max(Le.row, 0), Math.max(i.length - 1, 0)), D = Math.min(Math.max(Le.col, 0), pe - 1), qe = Math.min(Math.max(q, W.startIndex), Math.max(W.endIndex - 1, 0)), le = s.useRef(null), ce = s.useRef(!1), Be = s.useCallback((e, t) => {
    Te((r) => r.row === e && r.col === t ? r : { row: e, col: t });
  }, []), De = (e) => {
    const t = m.current;
    if (!t) return;
    const r = T + e * l, b = r - T, v = r + l - t.clientHeight, C = Math.max(0, Math.min(Math.max(t.scrollTop, v), b));
    C !== t.scrollTop && (t.scrollTop = C, ze(($) => $.top === C ? $ : { ...$, top: C }));
  }, He = (e, t) => {
    Te({ row: e, col: t }), le.current = { row: e, col: t }, De(e);
  };
  s.useLayoutEffect(() => {
    const e = le.current, t = m.current;
    if (!e || !t) return;
    const r = t.querySelector(`[data-gantt-cell="${e.row}:${e.col}"]`);
    if (!r) return;
    le.current = null, ce.current = !0, r.focus({ preventScroll: !0 });
    const b = r.querySelector("[data-gantt-bar]");
    if (!b) return;
    const v = b.getBoundingClientRect(), C = t.getBoundingClientRect(), $ = getComputedStyle(t).direction === "rtl", _ = $ ? C.left : C.left + f, A = $ ? C.right - f : C.right;
    v.left < _ ? t.scrollLeft -= _ - v.left : v.right > A && (t.scrollLeft += Math.min(v.right - A, v.left - _));
  });
  const Ve = (e) => {
    if (e.altKey || e.metaKey) return;
    const t = m.current, r = t ? getComputedStyle(t).direction === "rtl" : !1, b = r ? "ArrowLeft" : "ArrowRight", v = r ? "ArrowRight" : "ArrowLeft", C = Math.max(1, Math.floor((p.height - T) / l)), $ = i.length - 1, _ = i[q];
    let A = q, J = D;
    switch (e.key) {
      case "ArrowDown":
        A = Math.min($, q + 1);
        break;
      case "ArrowUp":
        A = Math.max(0, q - 1);
        break;
      case b:
        if (D === 0 && _?.hasChildren && !_.expanded) {
          e.preventDefault(), ne(_);
          return;
        }
        J = Math.min(pe - 1, D + 1);
        break;
      case v:
        if (D === 0 && _?.hasChildren && _.expanded) {
          e.preventDefault(), ne(_);
          return;
        }
        J = Math.max(0, D - 1);
        break;
      case "Home":
        J = 0, e.ctrlKey && (A = 0);
        break;
      case "End":
        J = pe - 1, e.ctrlKey && (A = $);
        break;
      case "PageDown":
        A = Math.min($, q + C);
        break;
      case "PageUp":
        A = Math.max(0, q - C);
        break;
      case "Enter":
      case " ":
        e.preventDefault(), _ && B?.(_);
        return;
      default:
        return;
    }
    e.preventDefault(), !(A === q && J === D) && He(A, J);
  };
  return s.useEffect(() => {
    const e = m.current;
    if (e && !le.current && !e.contains(document.activeElement)) {
      if (ce.current && document.activeElement === document.body) {
        e.focus({ preventScroll: !0 });
        return;
      }
      ce.current = !1;
    }
  }, [W.startIndex, W.endIndex, m]), /* Positioned only so the axis scrollbar can be pinned to the foot of the
     scroller, which is always the last thing in here. A sibling of the
     scroller rather than a wrapper around it: the scroller stays the grid's
     parent and the toolbar's next sibling, which is how callers find it. */
  /* @__PURE__ */ I("div", { className: G("zen-relative zen-flex zen-w-full zen-flex-col zen-gap-3", S), children: [
    !F && /* @__PURE__ */ I("div", { className: "zen-flex zen-flex-wrap zen-items-center zen-gap-2", children: [
      !re && /* @__PURE__ */ I(Ie, { children: [
        /* @__PURE__ */ n(
          de,
          {
            variant: "outline",
            size: "sm",
            "aria-label": O.t("scheduleGrid.previous"),
            onClick: () => V(Ee(ae, ke, -1)),
            children: /* @__PURE__ */ n(Re, { name: "chevron-left", size: 14, className: "rtl:zen-rotate-180" })
          }
        ),
        /* @__PURE__ */ n(de, { variant: "outline", size: "sm", onClick: () => V(c), children: O.t("scheduleGrid.today") }),
        /* @__PURE__ */ n(
          de,
          {
            variant: "outline",
            size: "sm",
            "aria-label": O.t("scheduleGrid.next"),
            onClick: () => V(Ee(ae, ke, 1)),
            children: /* @__PURE__ */ n(Re, { name: "chevron-right", size: 14, className: "rtl:zen-rotate-180" })
          }
        )
      ] }),
      /* @__PURE__ */ n(
        "span",
        {
          dir: "auto",
          className: "zen-mx-1 zen-text-sm zen-font-medium zen-text-zen-foreground",
          children: re ? st(P) : at(ae, z.continuous ? fe : N)
        }
      ),
      /* @__PURE__ */ n("div", { className: "zen-ms-auto zen-flex zen-gap-1", role: "group", "aria-label": O.t("scheduleGrid.view"), children: (he ?? zt).map((e) => /* @__PURE__ */ n(
        de,
        {
          variant: g === e ? "solid" : "outline",
          size: "sm",
          "aria-pressed": g === e,
          onClick: () => {
            z.continuous && e !== "fit" && V(fe), me(e);
          },
          children: O.t(mt[e])
        },
        e
      )) })
    ] }),
    te,
    /* @__PURE__ */ I(
      "div",
      {
        ref: m,
        tabIndex: -1,
        onFocus: () => {
          ce.current = !0;
        },
        className: G(
          "zen-relative zen-overflow-auto zen-rounded-zen-md zen-border zen-border-zen-border focus-visible:zen-outline-none",
          k === void 0 && "zen-max-h-[32rem]"
        ),
        style: k === void 0 ? void 0 : { maxHeight: k },
        children: [
          /* @__PURE__ */ I(
            "div",
            {
              style: { width: f + L },
              role: "treegrid",
              "aria-rowcount": i.length + 1,
              "aria-colcount": a,
              "aria-label": K,
              onKeyDown: Ve,
              children: [
                /* @__PURE__ */ I(
                  "div",
                  {
                    role: "row",
                    "aria-rowindex": 1,
                    className: G("zen-sticky zen-top-0 zen-z-30 zen-flex zen-border-b zen-border-zen-border zen-bg-zen-muted", R),
                    style: { height: T, boxSizing: "border-box" },
                    children: [
                      /* @__PURE__ */ n(
                        "div",
                        {
                          className: G(
                            "zen-sticky zen-z-40 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-muted zen-text-xs zen-font-semibold zen-text-zen-muted-fg",
                            R
                          ),
                          style: { width: f, insetInlineStart: 0 },
                          children: xe.map((e) => /* @__PURE__ */ n(
                            "div",
                            {
                              role: "columnheader",
                              "aria-colindex": e.colIndex,
                              className: G("zen-truncate", e.className ?? "zen-px-2"),
                              style: { width: e.width },
                              children: e.label
                            },
                            e.key
                          ))
                        }
                      ),
                      /* @__PURE__ */ n(
                        "div",
                        {
                          role: "columnheader",
                          "aria-colindex": o,
                          "aria-label": O.t("scheduleGrid.timeline"),
                          className: x ? "zen-flex zen-flex-col" : "zen-flex",
                          style: { width: L },
                          children: x ? /* @__PURE__ */ I(Ie, { children: [
                            /* @__PURE__ */ n(
                              "div",
                              {
                                "aria-hidden": "true",
                                "data-schedule-groups": "",
                                className: "zen-flex zen-shrink-0 zen-border-b zen-border-zen-border",
                                style: { height: ye, boxSizing: "border-box" },
                                children: j.map((e) => (
                                  /* No overflow clipping here: a clipping ancestor becomes the
                                     label's scroll container and `sticky` stops working. */
                                  /* @__PURE__ */ n(
                                    "div",
                                    {
                                      "data-schedule-group": "",
                                      className: "zen-shrink-0 zen-border-e zen-border-zen-border last:zen-border-e-0",
                                      style: { width: ve(e) },
                                      children: /* @__PURE__ */ n(
                                        "span",
                                        {
                                          className: "zen-sticky zen-inline-block zen-max-w-full zen-truncate zen-px-2 zen-align-top zen-text-xs zen-font-semibold zen-text-zen-foreground",
                                          style: { insetInlineStart: f, lineHeight: `${ye - 1}px` },
                                          children: Ge(e)
                                        }
                                      )
                                    },
                                    e.start.getTime()
                                  )
                                ))
                              }
                            ),
                            /* @__PURE__ */ n("div", { "data-schedule-axis-row": "", className: "zen-flex zen-min-h-0 zen-flex-1", children: Me })
                          ] }) : Me
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ I("div", { className: "zen-relative", style: { height: ee }, children: [
                  W.paddingTop > 0 && /* @__PURE__ */ n("div", { "aria-hidden": "true", style: { height: W.paddingTop } }),
                  Ue.map((e) => /* @__PURE__ */ n(
                    ft,
                    {
                      row: e,
                      columns: xe,
                      axisColumns: U,
                      columnWidths: y,
                      columnWindow: se,
                      axisWidth: L,
                      paneWidth: f,
                      timelineColIndex: o,
                      renderTrack: u,
                      rowHeight: l,
                      rowClass: M?.(e),
                      tabCol: e.index === qe ? D : -1,
                      onFocusCell: Be
                    },
                    E(e)
                  )),
                  W.paddingBottom > 0 && /* @__PURE__ */ n("div", { "aria-hidden": "true", style: { height: W.paddingBottom } }),
                  Se !== null && /* @__PURE__ */ n(
                    "div",
                    {
                      "aria-hidden": "true",
                      className: "zen-pointer-events-none zen-absolute zen-top-0 zen-z-10 zen-w-px zen-bg-zen-error",
                      style: {
                        height: ee,
                        insetInlineStart: f + Se / 100 * L
                      }
                    }
                  ),
                  Ke
                ] })
              ]
            }
          ),
          X && /* @__PURE__ */ n(
            "div",
            {
              className: "zen-sticky zen-bottom-0 zen-z-30 zen-flex zen-border-t zen-border-zen-border zen-bg-zen-muted",
              style: { width: f + L },
              children: X({ columns: U, columnWidths: y, axisWidth: L, paneWidth: f })
            }
          )
        ]
      }
    ),
    Z && /* @__PURE__ */ I(
      "div",
      {
        "aria-hidden": "true",
        "data-schedule-scrollbar": "",
        className: "zen-absolute zen-z-40 zen-flex zen-bg-zen-background",
        style: {
          bottom: Y.edge,
          insetInlineStart: Y.edge,
          /* Short of the corner the vertical scrollbar ends in. */
          insetInlineEnd: Y.edge + Y.y,
          height: Y.x
        },
        children: [
          /* @__PURE__ */ n(
            "div",
            {
              className: "zen-shrink-0 zen-border-e zen-border-zen-border",
              style: { width: f, boxSizing: "border-box" }
            }
          ),
          /* @__PURE__ */ n(
            "div",
            {
              ref: oe,
              tabIndex: -1,
              onScroll: () => be(oe.current, m.current),
              className: "zen-min-w-0 zen-flex-1 zen-overflow-x-scroll zen-overflow-y-hidden",
              children: /* @__PURE__ */ n("div", { style: { width: L, height: 1 } })
            }
          )
        ]
      }
    )
  ] });
}
function ft({
  row: i,
  columns: E,
  axisColumns: w,
  columnWindow: a,
  columnWidths: o,
  axisWidth: u,
  paneWidth: l,
  timelineColIndex: M,
  renderTrack: k,
  rowHeight: R,
  rowClass: x,
  tabCol: X,
  onFocusCell: g
}) {
  const N = E.length;
  return /* @__PURE__ */ I(
    "div",
    {
      role: "row",
      "aria-rowindex": i.index + 2,
      "aria-level": i.depth + 1,
      "aria-expanded": i.hasChildren ? i.expanded : void 0,
      className: G(
        "zen-flex zen-border-b zen-border-zen-border last:zen-border-b-0",
        /* The frozen pane is the row's CHILD, so it covers the row's content
           box and stops one pixel short of its bottom border. Whatever is drawn
           over the axis at that height then shows through the pane as it
           scrolls under: a dependency line routed along a row boundary crossed
           the whole pane, and the today marker left a dot on every rule. The
           pane redraws the rule itself, one pixel below its own box and at its
           own stacking level. Not on the last row, which has no rule to cover. */
        "[&:not(:last-child)>div:first-child]:zen-shadow-[0_1px_0_0_var(--zen-color-border)]",
        x
      ),
      style: { height: R, boxSizing: "border-box" },
      children: [
        /* @__PURE__ */ n(
          "div",
          {
            className: "zen-sticky zen-z-20 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-background",
            style: { width: l, insetInlineStart: 0 },
            children: E.map((c, d) => /* @__PURE__ */ n(
              "div",
              {
                role: "gridcell",
                "aria-colindex": c.colIndex,
                "data-gantt-cell": `${i.index}:${d}`,
                tabIndex: X === d ? 0 : -1,
                onFocus: () => g(i.index, d),
                "aria-label": c.ariaLabel?.(i),
                className: G("zen-flex zen-items-center", c.className ?? "zen-px-2", We),
                style: { width: c.width, ...c.style?.(i) },
                children: c.render(i)
              },
              c.key
            ))
          }
        ),
        /* @__PURE__ */ I(
          "div",
          {
            role: "gridcell",
            "aria-colindex": M,
            "data-gantt-cell": `${i.index}:${N}`,
            tabIndex: X === N ? 0 : -1,
            onFocus: () => g(i.index, N),
            className: G("zen-relative zen-shrink-0", We),
            style: { width: u },
            children: [
              /* @__PURE__ */ n("div", { "aria-hidden": "true", className: "zen-absolute zen-inset-0 zen-flex", children: (a ? a.offsets.map((c, d) => a.first + d) : w.map((c, d) => d)).map((c) => {
                const d = w[c], h = a ? a.offsets[c - a.first] : void 0;
                return /* @__PURE__ */ n(
                  "div",
                  {
                    className: G(
                      "zen-shrink-0 zen-border-e zen-border-zen-border last:zen-border-e-0",
                      h !== void 0 && "zen-absolute zen-inset-y-0",
                      d.nonWorking && (x ? "zen-bg-[color-mix(in_srgb,var(--zen-color-muted)_40%,transparent)]" : "zen-bg-zen-muted"),
                      d.today && (x ? "zen-bg-[color-mix(in_srgb,var(--zen-color-primary-soft)_40%,transparent)]" : "zen-bg-zen-primary-soft")
                    ),
                    style: h !== void 0 ? { width: o[c], insetInlineStart: h } : { width: o[c] }
                  },
                  d.start.getTime()
                );
              }) }),
              k(i, u)
            ]
          }
        )
      ]
    }
  );
}
export {
  zt as ALL_VIEWS,
  ye as GROUP_PX,
  ct as HEADER_PX,
  Nt as INDENT_PX,
  lt as ROW_PX,
  Tt as ScheduleGrid,
  St as useScheduleAxis,
  Lt as useScrollerMetrics
};
//# sourceMappingURL=index257.js.map
