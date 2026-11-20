import { jsx as n, jsxs as k, Fragment as Le } from "react/jsx-runtime";
import * as a from "react";
import { cn as W } from "./index199.js";
import "./index208.js";
import "./index28.js";
import { nowPct as Ve } from "./index255.js";
import { ganttFitUnit as He, ganttFitHourStep as je, ganttRange as Fe, ganttContinuousRange as Ye, ganttRangeColumns as Ie, ganttViewUnit as Te, ganttColumns as Je, ganttPaneColumns as Qe, ganttColumnWidths as Ze, ganttHeaderGroups as et, ganttColumnWindow as tt, ganttRowWindow as nt, shiftGanttAnchor as Ce, ganttSpanLabel as rt, ganttRangeLabel as it } from "./index110.js";
import { Button as ce } from "./index71.js";
import { Icon as _e } from "./index63.js";
import { useLocale as st } from "./index90.js";
const at = 36, ot = 44, xe = 22, Mt = 14, Ee = {
  day: 56,
  week: 128,
  month: 44,
  /* Sized to FIT, not to breathe: a year you have to scroll sideways to reach
     December in is not showing you the year, which is the only reason the view
     exists. 14 × 72 and 12 × 80 both land near 1000px — inside a normal content
     column — and "13 Jul" and "Sep" are comfortable at those widths. */
  quarter: 72,
  year: 80
}, lt = {
  hour: 40,
  day: 20,
  /* 26, not the quarter view's 72: a fit week column draws "13" with the month
     only where it changes, not "13 Jul" twenty times over. */
  week: 26,
  month: 30
}, ct = {
  day: 34,
  week: 44,
  month: 20,
  quarter: 38,
  year: 30
}, Re = 280, de = 5, dt = 512, Ae = "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-inset focus-visible:zen-ring-zen-ring", ut = {
  fit: "scheduleGrid.views.fit",
  day: "scheduleGrid.views.day",
  week: "scheduleGrid.views.week",
  month: "scheduleGrid.views.month",
  quarter: "scheduleGrid.views.quarter",
  year: "scheduleGrid.views.year"
}, ht = ["fit", "day", "week", "month", "quarter", "year"];
function kt(s) {
  const { view: A, anchor: x, fitRange: o, now: l, calendar: u, hourStep: c, columnWidth: p, paneColumns: y, available: I, grouped: v, plan: G } = s, g = !!s.continuous && A !== "fit", T = A === "fit", i = T ? "month" : A, d = x.getTime(), K = l.getTime(), C = o ? He(o.end.getTime() - o.start.getTime()) : null, te = C === "hour" && c === void 0 && o ? je(o.end.getTime() - o.start.getTime()) : c, ue = a.useMemo(() => Fe(i, x), [i, d]), he = G?.start.getTime(), H = G?.end.getTime(), U = a.useMemo(
    () => g ? Ye(i, G ?? null, x) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [g, i, he, H, d]
  ), B = o ?? U?.range ?? ue, _ = a.useMemo(
    () => o && C ? Ie(o, C, { now: l, calendar: u, hourStep: te, grouped: v }) : U ? Ie(U.range, Te(i), { now: l, calendar: u, hourStep: c, grouped: v }) : Je(i, x, { now: l, calendar: u, hourStep: c }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [o, C, i, d, K, u, te, v, U]
  ), j = g ? Re : p !== void 0 ? _.length * p : C ? _.length * lt[C] : _.length * ct[i], h = p !== void 0 ? _.length * p : C ? Number.POSITIVE_INFINITY : _.length * Ee[i], z = a.useMemo(() => {
    const E = {};
    for (const q of y) E[q.key] = q.width;
    return E;
  }, [y]), N = y.map((E) => E.key).join(","), ne = a.useMemo(
    () => Qe(
      y.map((E) => E.key),
      z,
      I,
      Math.max(Re, j)
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [N, z, I, j]
  ), F = ne.reduce((E, q) => E + (z[q] ?? 0), 0), X = _.length * (p ?? Ee[i]), w = g ? I > 0 ? Math.max(X, I - F) : X : I > 0 ? Math.min(h, Math.max(j, I - F)) : Number.isFinite(h) ? h : j, O = a.useMemo(
    () => Ze(_, B, w),
    [_, B, w]
  ), M = a.useMemo(
    () => w > 0 ? (B.end.getTime() - B.start.getTime()) / w : 0,
    [B, w]
  ), m = C ?? Te(i), re = U?.clamped ?? !1;
  return { range: B, columns: _, columnWidths: O, axisWidth: w, paneWidth: F, isFit: T, unit: m, continuous: g, clamped: re, minGapMs: M, paneKeys: ne };
}
function Nt(s) {
  const [A, x] = a.useState({ top: 0, height: dt, width: 0, left: 0 }), o = a.useCallback(() => {
    const l = s.current;
    if (!l) return;
    const u = Math.abs(l.scrollLeft);
    x(
      (c) => c.top === l.scrollTop && c.height === l.clientHeight && c.width === l.clientWidth && c.left === u ? c : { top: l.scrollTop, height: l.clientHeight, width: l.clientWidth, left: u }
    );
  }, [s]);
  return a.useLayoutEffect(() => {
    const l = s.current;
    if (!l) return;
    let u = 0;
    const c = () => {
      u = 0, o();
    }, p = () => {
      u === 0 && (u = requestAnimationFrame(c));
    };
    l.addEventListener("scroll", p, { passive: !0 });
    const y = new ResizeObserver(p);
    return y.observe(l), () => {
      u !== 0 && cancelAnimationFrame(u), l.removeEventListener("scroll", p), y.disconnect();
    };
  }, [s, o]), a.useLayoutEffect(o), { metrics: A, setMetrics: x, measure: o };
}
function St({
  rows: s,
  rowId: A,
  columns: x,
  colCount: o,
  timelineColIndex: l,
  renderTrack: u,
  rowHeight: c = at,
  rowClass: p,
  maxBodyHeight: y,
  headerClassName: I,
  headerGroups: v,
  renderFooter: G,
  view: g,
  anchor: T,
  now: i,
  connectors: d,
  connectorAccent: K,
  connectorStyle: C,
  views: te,
  hideToolbar: ue,
  onViewChange: he,
  onDateChange: H,
  onToggle: U,
  onActivate: B,
  ariaLabel: _,
  className: j,
  scrollerRef: h,
  axis: z,
  metrics: N,
  setMetrics: ne
}) {
  const F = st(), { range: X, columns: w, columnWidths: O, axisWidth: M, paneWidth: m, isFit: re, paneKeys: E } = z, q = ot + (v ? xe : 0), $e = a.useMemo(
    () => v ? et(w, z.unit) : [],
    [v, w, z.unit]
  ), pe = (e) => O.slice(e.firstColumn, e.firstColumn + e.columnCount).reduce((t, r) => t + r, 0), Pe = (e) => pe(e) >= e.label.length * 7 + 16 ? e.label : e.shortLabel, Q = Math.max(0, N.width - m), ie = a.useMemo(
    () => z.continuous ? tt(O, N.left, Q, Math.max(Q, 400)) : null,
    [z.continuous, O, N.left, Q]
  ), ye = (e, t, r) => /* @__PURE__ */ k(
    "div",
    {
      className: W(
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
  ), ve = ie ? (
    // Windowed: positioned cells in a full-width box, so the header still spans
    // the whole axis and lines up with the rows below it.
    /* @__PURE__ */ n("div", { "data-schedule-windowed": "", className: "zen-relative zen-h-full zen-w-full", children: ie.offsets.map((e, t) => {
      const r = ie.first + t;
      return ye(w[r], O[r], e);
    }) })
  ) : w.map((e, t) => ye(e, O[t])), se = g === "fit" ? "month" : g, We = (e) => z.minGapMs > 0 ? (e.getTime() - X.start.getTime()) / z.minGapMs : 0, ze = new Date(X.start.getTime() + (N.left + Q / 2) * z.minGapMs), we = z.continuous ? ze : T, Me = a.useRef(""), me = `${g}|${T.getTime()}|${X.start.getTime()}|${X.end.getTime()}`;
  a.useEffect(() => {
    if (!z.continuous || N.width === 0 || Me.current === me) return;
    Me.current = me;
    const e = We(Fe(se, T).start), t = requestAnimationFrame(() => {
      const r = h.current;
      if (!r) return;
      const f = Math.max(0, e);
      r.scrollLeft = getComputedStyle(r).direction === "rtl" ? -f : f;
    });
    return () => cancelAnimationFrame(t);
  }, [z.continuous, N.width > 0, me]);
  const [Y, Ge] = a.useState({ x: 0, y: 0, edge: 0 });
  a.useLayoutEffect(() => {
    const e = h.current;
    if (!e) return;
    const t = e.clientTop, r = Math.max(0, e.offsetHeight - e.clientHeight - t * 2), f = Math.max(0, e.offsetWidth - e.clientWidth - t * 2);
    Ge((b) => b.x === r && b.y === f && b.edge === t ? b : { x: r, y: f, edge: t });
  });
  const Z = Y.x > 0 && m > 0 && Q > 0, ae = a.useRef(null), fe = (e, t) => {
    e && t && Math.abs(t.scrollLeft - e.scrollLeft) >= 1 && (t.scrollLeft = e.scrollLeft);
  };
  a.useEffect(() => {
    const e = h.current;
    if (!Z || !e) return;
    const t = () => fe(e, ae.current);
    return e.addEventListener("scroll", t, { passive: !0 }), () => e.removeEventListener("scroll", t);
  }, [Z, h]), a.useLayoutEffect(() => {
    Z && fe(h.current, ae.current);
  }, [Z, M, N.width, h]);
  const ke = Ve(X, i), ee = s.length * c, ge = a.useMemo(
    () => E.map((e) => x.find((t) => t.key === e)).filter(Boolean),
    [E, x]
  ), be = ge.length + 1, $ = nt(s.length, c, N.top, N.height), Xe = s.slice($.startIndex, $.endIndex), Oe = a.useMemo(() => !d || d.length === 0 ? null : (
    /* Mirrored under RTL rather than recomputed: the bars are placed with
       logical inset properties, so the axis is already flipped and the routes
       have to flip with it — arrowheads included. */
    /* @__PURE__ */ n(
      "svg",
      {
        "aria-hidden": "true",
        className: "zen-pointer-events-none zen-absolute zen-top-0 zen-z-10 rtl:-zen-scale-x-100",
        width: M,
        height: ee,
        viewBox: `0 0 ${M} ${ee}`,
        style: { insetInlineStart: m },
        children: d.map((e) => {
          const t = K?.(e) ?? !1, r = C?.(e), f = t ? "var(--zen-color-error)" : r?.color ?? "var(--zen-color-muted-fg)";
          return /* @__PURE__ */ k("g", { children: [
            /* @__PURE__ */ n(
              "path",
              {
                d: e.d,
                fill: "none",
                stroke: f,
                strokeDasharray: r?.dash,
                strokeWidth: t ? 2.25 : 1.5
              }
            ),
            /* @__PURE__ */ n(
              "polygon",
              {
                points: [
                  `${e.arrow.x},${e.arrow.y}`,
                  `${e.arrow.x - e.arrow.dir * de * 1.6},${e.arrow.y - de}`,
                  `${e.arrow.x - e.arrow.dir * de * 1.6},${e.arrow.y + de}`
                ].join(" "),
                fill: f
              }
            )
          ] }, e.id);
        })
      }
    )
  ), [d, K, C, M, ee, m]), [Ne, Se] = a.useState({ row: 0, col: 0 }), D = Math.min(Math.max(Ne.row, 0), Math.max(s.length - 1, 0)), V = Math.min(Math.max(Ne.col, 0), be - 1), qe = Math.min(Math.max(D, $.startIndex), Math.max($.endIndex - 1, 0)), oe = a.useRef(null), le = a.useRef(!1), Ke = a.useCallback((e, t) => {
    Se((r) => r.row === e && r.col === t ? r : { row: e, col: t });
  }, []), Ue = (e) => {
    const t = h.current;
    if (!t) return;
    const r = q + e * c, f = r - q, b = r + c - t.clientHeight, S = Math.max(0, Math.min(Math.max(t.scrollTop, b), f));
    S !== t.scrollTop && (t.scrollTop = S, ne((P) => P.top === S ? P : { ...P, top: S }));
  }, Be = (e, t) => {
    Se({ row: e, col: t }), oe.current = { row: e, col: t }, Ue(e);
  };
  a.useLayoutEffect(() => {
    const e = oe.current, t = h.current;
    if (!e || !t) return;
    const r = t.querySelector(`[data-gantt-cell="${e.row}:${e.col}"]`);
    if (!r) return;
    oe.current = null, le.current = !0, r.focus({ preventScroll: !0 });
    const f = r.querySelector("[data-gantt-bar]");
    if (!f) return;
    const b = f.getBoundingClientRect(), S = t.getBoundingClientRect(), P = getComputedStyle(t).direction === "rtl", L = P ? S.left : S.left + m, R = P ? S.right - m : S.right;
    b.left < L ? t.scrollLeft -= L - b.left : b.right > R && (t.scrollLeft += Math.min(b.right - R, b.left - L));
  });
  const De = (e) => {
    if (e.altKey || e.metaKey) return;
    const t = h.current, r = t ? getComputedStyle(t).direction === "rtl" : !1, f = r ? "ArrowLeft" : "ArrowRight", b = r ? "ArrowRight" : "ArrowLeft", S = Math.max(1, Math.floor((N.height - q) / c)), P = s.length - 1, L = s[D];
    let R = D, J = V;
    switch (e.key) {
      case "ArrowDown":
        R = Math.min(P, D + 1);
        break;
      case "ArrowUp":
        R = Math.max(0, D - 1);
        break;
      case f:
        if (V === 0 && L?.hasChildren && !L.expanded) {
          e.preventDefault(), U(L);
          return;
        }
        J = Math.min(be - 1, V + 1);
        break;
      case b:
        if (V === 0 && L?.hasChildren && L.expanded) {
          e.preventDefault(), U(L);
          return;
        }
        J = Math.max(0, V - 1);
        break;
      case "Home":
        J = 0, e.ctrlKey && (R = 0);
        break;
      case "End":
        J = be - 1, e.ctrlKey && (R = P);
        break;
      case "PageDown":
        R = Math.min(P, D + S);
        break;
      case "PageUp":
        R = Math.max(0, D - S);
        break;
      case "Enter":
      case " ":
        e.preventDefault(), L && B?.(L);
        return;
      default:
        return;
    }
    e.preventDefault(), !(R === D && J === V) && Be(R, J);
  };
  return a.useEffect(() => {
    const e = h.current;
    if (e && !oe.current && !e.contains(document.activeElement)) {
      if (le.current && document.activeElement === document.body) {
        e.focus({ preventScroll: !0 });
        return;
      }
      le.current = !1;
    }
  }, [$.startIndex, $.endIndex, h]), /* Positioned only so the axis scrollbar can be pinned to the foot of the
     scroller, which is always the last thing in here. A sibling of the
     scroller rather than a wrapper around it: the scroller stays the grid's
     parent and the toolbar's next sibling, which is how callers find it. */
  /* @__PURE__ */ k("div", { className: W("zen-relative zen-flex zen-w-full zen-flex-col zen-gap-3", j), children: [
    !ue && /* @__PURE__ */ k("div", { className: "zen-flex zen-flex-wrap zen-items-center zen-gap-2", children: [
      !re && /* @__PURE__ */ k(Le, { children: [
        /* @__PURE__ */ n(
          ce,
          {
            variant: "outline",
            size: "sm",
            "aria-label": F.t("scheduleGrid.previous"),
            onClick: () => H(Ce(se, we, -1)),
            children: /* @__PURE__ */ n(_e, { name: "chevron-left", size: 14, className: "rtl:zen-rotate-180" })
          }
        ),
        /* @__PURE__ */ n(ce, { variant: "outline", size: "sm", onClick: () => H(i), children: F.t("scheduleGrid.today") }),
        /* @__PURE__ */ n(
          ce,
          {
            variant: "outline",
            size: "sm",
            "aria-label": F.t("scheduleGrid.next"),
            onClick: () => H(Ce(se, we, 1)),
            children: /* @__PURE__ */ n(_e, { name: "chevron-right", size: 14, className: "rtl:zen-rotate-180" })
          }
        )
      ] }),
      /* @__PURE__ */ n(
        "span",
        {
          dir: "auto",
          className: "zen-mx-1 zen-text-sm zen-font-medium zen-text-zen-foreground",
          children: re ? rt(X) : it(se, z.continuous ? ze : T)
        }
      ),
      /* @__PURE__ */ n("div", { className: "zen-ms-auto zen-flex zen-gap-1", role: "group", "aria-label": F.t("scheduleGrid.view"), children: (te ?? ht).map((e) => /* @__PURE__ */ n(
        ce,
        {
          variant: g === e ? "solid" : "outline",
          size: "sm",
          "aria-pressed": g === e,
          onClick: () => {
            z.continuous && e !== "fit" && H(ze), he(e);
          },
          children: F.t(ut[e])
        },
        e
      )) })
    ] }),
    /* @__PURE__ */ k(
      "div",
      {
        ref: h,
        tabIndex: -1,
        onFocus: () => {
          le.current = !0;
        },
        className: W(
          "zen-relative zen-overflow-auto zen-rounded-zen-md zen-border zen-border-zen-border focus-visible:zen-outline-none",
          y === void 0 && "zen-max-h-[32rem]"
        ),
        style: y === void 0 ? void 0 : { maxHeight: y },
        children: [
          /* @__PURE__ */ k(
            "div",
            {
              style: { width: m + M },
              role: "treegrid",
              "aria-rowcount": s.length + 1,
              "aria-colcount": o,
              "aria-label": _,
              onKeyDown: De,
              children: [
                /* @__PURE__ */ k(
                  "div",
                  {
                    role: "row",
                    "aria-rowindex": 1,
                    className: W("zen-sticky zen-top-0 zen-z-30 zen-flex zen-border-b zen-border-zen-border zen-bg-zen-muted", I),
                    style: { height: q, boxSizing: "border-box" },
                    children: [
                      /* @__PURE__ */ n(
                        "div",
                        {
                          className: W(
                            "zen-sticky zen-z-40 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-muted zen-text-xs zen-font-semibold zen-text-zen-muted-fg",
                            I
                          ),
                          style: { width: m, insetInlineStart: 0 },
                          children: ge.map((e) => /* @__PURE__ */ n(
                            "div",
                            {
                              role: "columnheader",
                              "aria-colindex": e.colIndex,
                              className: W("zen-truncate", e.className ?? "zen-px-2"),
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
                          "aria-colindex": l,
                          "aria-label": F.t("scheduleGrid.timeline"),
                          className: v ? "zen-flex zen-flex-col" : "zen-flex",
                          style: { width: M },
                          children: v ? /* @__PURE__ */ k(Le, { children: [
                            /* @__PURE__ */ n(
                              "div",
                              {
                                "aria-hidden": "true",
                                "data-schedule-groups": "",
                                className: "zen-flex zen-shrink-0 zen-border-b zen-border-zen-border",
                                style: { height: xe, boxSizing: "border-box" },
                                children: $e.map((e) => (
                                  /* No overflow clipping here: a clipping ancestor becomes the
                                     label's scroll container and `sticky` stops working. */
                                  /* @__PURE__ */ n(
                                    "div",
                                    {
                                      "data-schedule-group": "",
                                      className: "zen-shrink-0 zen-border-e zen-border-zen-border last:zen-border-e-0",
                                      style: { width: pe(e) },
                                      children: /* @__PURE__ */ n(
                                        "span",
                                        {
                                          className: "zen-sticky zen-inline-block zen-max-w-full zen-truncate zen-px-2 zen-align-top zen-text-xs zen-font-semibold zen-text-zen-foreground",
                                          style: { insetInlineStart: m, lineHeight: `${xe - 1}px` },
                                          children: Pe(e)
                                        }
                                      )
                                    },
                                    e.start.getTime()
                                  )
                                ))
                              }
                            ),
                            /* @__PURE__ */ n("div", { "data-schedule-axis-row": "", className: "zen-flex zen-min-h-0 zen-flex-1", children: ve })
                          ] }) : ve
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ k("div", { className: "zen-relative", style: { height: ee }, children: [
                  $.paddingTop > 0 && /* @__PURE__ */ n("div", { "aria-hidden": "true", style: { height: $.paddingTop } }),
                  Xe.map((e) => /* @__PURE__ */ n(
                    zt,
                    {
                      row: e,
                      columns: ge,
                      axisColumns: w,
                      columnWidths: O,
                      columnWindow: ie,
                      axisWidth: M,
                      paneWidth: m,
                      timelineColIndex: l,
                      renderTrack: u,
                      rowHeight: c,
                      rowClass: p?.(e),
                      tabCol: e.index === qe ? V : -1,
                      onFocusCell: Ke
                    },
                    A(e)
                  )),
                  $.paddingBottom > 0 && /* @__PURE__ */ n("div", { "aria-hidden": "true", style: { height: $.paddingBottom } }),
                  ke !== null && /* @__PURE__ */ n(
                    "div",
                    {
                      "aria-hidden": "true",
                      className: "zen-pointer-events-none zen-absolute zen-top-0 zen-z-10 zen-w-px zen-bg-zen-error",
                      style: {
                        height: ee,
                        insetInlineStart: m + ke / 100 * M
                      }
                    }
                  ),
                  Oe
                ] })
              ]
            }
          ),
          G && /* @__PURE__ */ n(
            "div",
            {
              className: "zen-sticky zen-bottom-0 zen-z-30 zen-flex zen-border-t zen-border-zen-border zen-bg-zen-muted",
              style: { width: m + M },
              children: G({ columns: w, columnWidths: O, axisWidth: M, paneWidth: m })
            }
          )
        ]
      }
    ),
    Z && /* @__PURE__ */ k(
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
              style: { width: m, boxSizing: "border-box" }
            }
          ),
          /* @__PURE__ */ n(
            "div",
            {
              ref: ae,
              tabIndex: -1,
              onScroll: () => fe(ae.current, h.current),
              className: "zen-min-w-0 zen-flex-1 zen-overflow-x-scroll zen-overflow-y-hidden",
              children: /* @__PURE__ */ n("div", { style: { width: M, height: 1 } })
            }
          )
        ]
      }
    )
  ] });
}
function zt({
  row: s,
  columns: A,
  axisColumns: x,
  columnWindow: o,
  columnWidths: l,
  axisWidth: u,
  paneWidth: c,
  timelineColIndex: p,
  renderTrack: y,
  rowHeight: I,
  rowClass: v,
  tabCol: G,
  onFocusCell: g
}) {
  const T = A.length;
  return /* @__PURE__ */ k(
    "div",
    {
      role: "row",
      "aria-rowindex": s.index + 2,
      "aria-level": s.depth + 1,
      "aria-expanded": s.hasChildren ? s.expanded : void 0,
      className: W(
        "zen-flex zen-border-b zen-border-zen-border last:zen-border-b-0",
        /* The frozen pane is the row's CHILD, so it covers the row's content
           box and stops one pixel short of its bottom border. Whatever is drawn
           over the axis at that height then shows through the pane as it
           scrolls under: a dependency line routed along a row boundary crossed
           the whole pane, and the today marker left a dot on every rule. The
           pane redraws the rule itself, one pixel below its own box and at its
           own stacking level. Not on the last row, which has no rule to cover. */
        "[&:not(:last-child)>div:first-child]:zen-shadow-[0_1px_0_0_var(--zen-color-border)]",
        v
      ),
      style: { height: I, boxSizing: "border-box" },
      children: [
        /* @__PURE__ */ n(
          "div",
          {
            className: "zen-sticky zen-z-20 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-background",
            style: { width: c, insetInlineStart: 0 },
            children: A.map((i, d) => /* @__PURE__ */ n(
              "div",
              {
                role: "gridcell",
                "aria-colindex": i.colIndex,
                "data-gantt-cell": `${s.index}:${d}`,
                tabIndex: G === d ? 0 : -1,
                onFocus: () => g(s.index, d),
                "aria-label": i.ariaLabel?.(s),
                className: W("zen-flex zen-items-center", i.className ?? "zen-px-2", Ae),
                style: { width: i.width, ...i.style?.(s) },
                children: i.render(s)
              },
              i.key
            ))
          }
        ),
        /* @__PURE__ */ k(
          "div",
          {
            role: "gridcell",
            "aria-colindex": p,
            "data-gantt-cell": `${s.index}:${T}`,
            tabIndex: G === T ? 0 : -1,
            onFocus: () => g(s.index, T),
            className: W("zen-relative zen-shrink-0", Ae),
            style: { width: u },
            children: [
              /* @__PURE__ */ n("div", { "aria-hidden": "true", className: "zen-absolute zen-inset-0 zen-flex", children: (o ? o.offsets.map((i, d) => o.first + d) : x.map((i, d) => d)).map((i) => {
                const d = x[i], K = o ? o.offsets[i - o.first] : void 0;
                return /* @__PURE__ */ n(
                  "div",
                  {
                    className: W(
                      "zen-shrink-0 zen-border-e zen-border-zen-border last:zen-border-e-0",
                      K !== void 0 && "zen-absolute zen-inset-y-0",
                      d.nonWorking && (v ? "zen-bg-[color-mix(in_srgb,var(--zen-color-muted)_40%,transparent)]" : "zen-bg-zen-muted"),
                      d.today && (v ? "zen-bg-[color-mix(in_srgb,var(--zen-color-primary-soft)_40%,transparent)]" : "zen-bg-zen-primary-soft")
                    ),
                    style: K !== void 0 ? { width: l[i], insetInlineStart: K } : { width: l[i] }
                  },
                  d.start.getTime()
                );
              }) }),
              y(s, u)
            ]
          }
        )
      ]
    }
  );
}
export {
  ht as ALL_VIEWS,
  xe as GROUP_PX,
  ot as HEADER_PX,
  Mt as INDENT_PX,
  at as ROW_PX,
  St as ScheduleGrid,
  kt as useScheduleAxis,
  Nt as useScrollerMetrics
};
//# sourceMappingURL=index257.js.map
