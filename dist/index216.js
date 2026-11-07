import { jsx as r, jsxs as w, Fragment as xe } from "react/jsx-runtime";
import * as l from "react";
import { cn as X } from "./index160.js";
import "./index28.js";
import { nowPct as pe } from "./index215.js";
import { ganttFitUnit as ye, ganttFitHourStep as ve, ganttRange as we, ganttRangeColumns as ke, ganttColumns as Me, ganttPaneColumns as Ne, ganttColumnWidths as Se, ganttRowWindow as Ie, shiftGanttAnchor as le, ganttSpanLabel as Ce, ganttRangeLabel as Le } from "./index110.js";
import { Button as Y } from "./index71.js";
import { Icon as de } from "./index63.js";
import { useLocale as Te } from "./index90.js";
const Re = 36, J = 44, je = 14, Ee = {
  day: 56,
  week: 128,
  month: 44,
  /* Sized to FIT, not to breathe: a year you have to scroll sideways to reach
     December in is not showing you the year, which is the only reason the view
     exists. 14 × 72 and 12 × 80 both land near 1000px — inside a normal content
     column — and "13 Jul" and "Sep" are comfortable at those widths. */
  quarter: 72,
  year: 80
}, _e = {
  hour: 40,
  day: 20,
  /* 26, not the quarter view's 72: a fit week column draws "13" with the month
     only where it changes, not "13 Jul" twenty times over. */
  week: 26,
  month: 30
}, Ae = {
  day: 34,
  week: 44,
  month: 20,
  quarter: 38,
  year: 30
}, We = 280, Q = 5, Fe = 512, ce = "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-inset focus-visible:zen-ring-zen-ring", Ge = {
  fit: "scheduleGrid.views.fit",
  day: "scheduleGrid.views.day",
  week: "scheduleGrid.views.week",
  month: "scheduleGrid.views.month",
  quarter: "scheduleGrid.views.quarter",
  year: "scheduleGrid.views.year"
}, Pe = ["fit", "day", "week", "month", "quarter", "year"];
function He(n) {
  const { view: C, anchor: p, fitRange: a, now: i, calendar: s, hourStep: c, columnWidth: m, paneColumns: u, available: y } = n, _ = C === "fit", d = _ ? "month" : C, o = p.getTime(), L = i.getTime(), T = a ? ye(a.end.getTime() - a.start.getTime()) : null, D = T === "hour" && c === void 0 && a ? ve(a.end.getTime() - a.start.getTime()) : c, q = l.useMemo(() => we(d, p), [d, o]), R = a ?? q, k = l.useMemo(
    () => a && T ? ke(a, T, { now: i, calendar: s, hourStep: D }) : Me(d, p, { now: i, calendar: s, hourStep: c }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [a, T, d, o, L, s, D]
  ), F = m !== void 0 ? k.length * m : T ? k.length * _e[T] : k.length * Ae[d], K = m !== void 0 ? k.length * m : T ? Number.POSITIVE_INFINITY : k.length * Ee[d], M = l.useMemo(() => {
    const g = {};
    for (const h of u) g[h.key] = h.width;
    return g;
  }, [u]), Z = u.map((g) => g.key).join(","), G = l.useMemo(
    () => Ne(
      u.map((g) => g.key),
      M,
      y,
      Math.max(We, F)
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Z, M, y, F]
  ), U = G.reduce((g, h) => g + (M[h] ?? 0), 0), z = y > 0 ? Math.min(K, Math.max(F, y - U)) : Number.isFinite(K) ? K : F, V = l.useMemo(
    () => Se(k, R, z),
    [k, R, z]
  ), O = l.useMemo(
    () => z > 0 ? (R.end.getTime() - R.start.getTime()) / z : 0,
    [R, z]
  );
  return { range: R, columns: k, columnWidths: V, axisWidth: z, paneWidth: U, isFit: _, minGapMs: O, paneKeys: G };
}
function Ye(n) {
  const [C, p] = l.useState({ top: 0, height: Fe, width: 0 }), a = l.useCallback(() => {
    const i = n.current;
    i && p(
      (s) => s.top === i.scrollTop && s.height === i.clientHeight && s.width === i.clientWidth ? s : { top: i.scrollTop, height: i.clientHeight, width: i.clientWidth }
    );
  }, [n]);
  return l.useLayoutEffect(() => {
    const i = n.current;
    if (!i) return;
    let s = 0;
    const c = () => {
      s = 0, a();
    }, m = () => {
      s === 0 && (s = requestAnimationFrame(c));
    };
    i.addEventListener("scroll", m, { passive: !0 });
    const u = new ResizeObserver(m);
    return u.observe(i), () => {
      s !== 0 && cancelAnimationFrame(s), i.removeEventListener("scroll", m), u.disconnect();
    };
  }, [n, a]), l.useLayoutEffect(a), { metrics: C, setMetrics: p, measure: a };
}
function Je({
  rows: n,
  rowId: C,
  columns: p,
  colCount: a,
  timelineColIndex: i,
  renderTrack: s,
  rowHeight: c = Re,
  renderFooter: m,
  view: u,
  anchor: y,
  now: _,
  connectors: d,
  connectorAccent: o,
  views: L,
  hideToolbar: T,
  onViewChange: D,
  onDateChange: q,
  onToggle: R,
  onActivate: k,
  ariaLabel: F,
  className: K,
  scrollerRef: M,
  axis: Z,
  metrics: G,
  setMetrics: U
}) {
  const z = Te(), { range: V, columns: O, columnWidths: g, axisWidth: h, paneWidth: N, isFit: re, paneKeys: ie } = Z, ee = u === "fit" ? "month" : u, ae = pe(V, _), B = n.length * c, te = l.useMemo(
    () => ie.map((e) => p.find((t) => t.key === e)).filter(Boolean),
    [ie, p]
  ), ne = te.length + 1, S = Ie(n.length, c, G.top, G.height), ue = n.slice(S.startIndex, S.endIndex), he = l.useMemo(() => !d || d.length === 0 ? null : (
    /* Mirrored under RTL rather than recomputed: the bars are placed with
       logical inset properties, so the axis is already flipped and the routes
       have to flip with it — arrowheads included. */
    /* @__PURE__ */ r(
      "svg",
      {
        "aria-hidden": "true",
        className: "zen-pointer-events-none zen-absolute zen-top-0 zen-z-10 rtl:-zen-scale-x-100",
        width: h,
        height: B,
        viewBox: `0 0 ${h} ${B}`,
        style: { insetInlineStart: N },
        children: d.map((e) => {
          const t = o?.(e) ? "var(--zen-color-error)" : "var(--zen-color-muted-fg)";
          return /* @__PURE__ */ w("g", { children: [
            /* @__PURE__ */ r(
              "path",
              {
                d: e.d,
                fill: "none",
                stroke: t,
                strokeWidth: o?.(e) ? 2.25 : 1.5
              }
            ),
            /* @__PURE__ */ r(
              "polygon",
              {
                points: [
                  `${e.arrow.x},${e.arrow.y}`,
                  `${e.arrow.x - e.arrow.dir * Q * 1.6},${e.arrow.y - Q}`,
                  `${e.arrow.x - e.arrow.dir * Q * 1.6},${e.arrow.y + Q}`
                ].join(" "),
                fill: t
              }
            )
          ] }, e.id);
        })
      }
    )
  ), [d, o, h, B, N]), [se, oe] = l.useState({ row: 0, col: 0 }), A = Math.min(Math.max(se.row, 0), Math.max(n.length - 1, 0)), W = Math.min(Math.max(se.col, 0), ne - 1), me = Math.min(Math.max(A, S.startIndex), Math.max(S.endIndex - 1, 0)), j = l.useRef(null), H = l.useRef(!1), ze = l.useCallback((e, t) => {
    oe((f) => f.row === e && f.col === t ? f : { row: e, col: t });
  }, []), fe = (e) => {
    const t = M.current;
    if (!t) return;
    const f = J + e * c, P = f - J, E = f + c - t.clientHeight, b = Math.max(0, Math.min(Math.max(t.scrollTop, E), P));
    b !== t.scrollTop && (t.scrollTop = b, U((I) => I.top === b ? I : { ...I, top: b }));
  }, ge = (e, t) => {
    oe({ row: e, col: t }), j.current = { row: e, col: t }, fe(e);
  };
  l.useLayoutEffect(() => {
    const e = j.current, t = M.current;
    if (!e || !t) return;
    const f = t.querySelector(`[data-gantt-cell="${e.row}:${e.col}"]`);
    if (!f) return;
    j.current = null, H.current = !0, f.focus({ preventScroll: !0 });
    const P = f.querySelector("[data-gantt-bar]");
    if (!P) return;
    const E = P.getBoundingClientRect(), b = t.getBoundingClientRect(), I = getComputedStyle(t).direction === "rtl", x = I ? b.left : b.left + N, v = I ? b.right - N : b.right;
    E.left < x ? t.scrollLeft -= x - E.left : E.right > v && (t.scrollLeft += Math.min(E.right - v, E.left - x));
  });
  const be = (e) => {
    if (e.altKey || e.metaKey) return;
    const t = M.current, f = t ? getComputedStyle(t).direction === "rtl" : !1, P = f ? "ArrowLeft" : "ArrowRight", E = f ? "ArrowRight" : "ArrowLeft", b = Math.max(1, Math.floor((G.height - J) / c)), I = n.length - 1, x = n[A];
    let v = A, $ = W;
    switch (e.key) {
      case "ArrowDown":
        v = Math.min(I, A + 1);
        break;
      case "ArrowUp":
        v = Math.max(0, A - 1);
        break;
      case P:
        if (W === 0 && x?.hasChildren && !x.expanded) {
          e.preventDefault(), R(x);
          return;
        }
        $ = Math.min(ne - 1, W + 1);
        break;
      case E:
        if (W === 0 && x?.hasChildren && x.expanded) {
          e.preventDefault(), R(x);
          return;
        }
        $ = Math.max(0, W - 1);
        break;
      case "Home":
        $ = 0, e.ctrlKey && (v = 0);
        break;
      case "End":
        $ = ne - 1, e.ctrlKey && (v = I);
        break;
      case "PageDown":
        v = Math.min(I, A + b);
        break;
      case "PageUp":
        v = Math.max(0, A - b);
        break;
      case "Enter":
      case " ":
        e.preventDefault(), x && k?.(x);
        return;
      default:
        return;
    }
    e.preventDefault(), !(v === A && $ === W) && ge(v, $);
  };
  return l.useEffect(() => {
    const e = M.current;
    if (e && !j.current && !e.contains(document.activeElement)) {
      if (H.current && document.activeElement === document.body) {
        e.focus({ preventScroll: !0 });
        return;
      }
      H.current = !1;
    }
  }, [S.startIndex, S.endIndex, M]), /* @__PURE__ */ w("div", { className: X("zen-flex zen-w-full zen-flex-col zen-gap-3", K), children: [
    !T && /* @__PURE__ */ w("div", { className: "zen-flex zen-flex-wrap zen-items-center zen-gap-2", children: [
      !re && /* @__PURE__ */ w(xe, { children: [
        /* @__PURE__ */ r(
          Y,
          {
            variant: "outline",
            size: "sm",
            "aria-label": z.t("scheduleGrid.previous"),
            onClick: () => q(le(ee, y, -1)),
            children: /* @__PURE__ */ r(de, { name: "chevron-left", size: 14, className: "rtl:zen-rotate-180" })
          }
        ),
        /* @__PURE__ */ r(Y, { variant: "outline", size: "sm", onClick: () => q(_), children: z.t("scheduleGrid.today") }),
        /* @__PURE__ */ r(
          Y,
          {
            variant: "outline",
            size: "sm",
            "aria-label": z.t("scheduleGrid.next"),
            onClick: () => q(le(ee, y, 1)),
            children: /* @__PURE__ */ r(de, { name: "chevron-right", size: 14, className: "rtl:zen-rotate-180" })
          }
        )
      ] }),
      /* @__PURE__ */ r(
        "span",
        {
          dir: "auto",
          className: "zen-mx-1 zen-text-sm zen-font-medium zen-text-zen-foreground",
          children: re ? Ce(V) : Le(ee, y)
        }
      ),
      /* @__PURE__ */ r("div", { className: "zen-ms-auto zen-flex zen-gap-1", role: "group", "aria-label": z.t("scheduleGrid.view"), children: (L ?? Pe).map((e) => /* @__PURE__ */ r(
        Y,
        {
          variant: u === e ? "solid" : "outline",
          size: "sm",
          "aria-pressed": u === e,
          onClick: () => D(e),
          children: z.t(Ge[e])
        },
        e
      )) })
    ] }),
    /* @__PURE__ */ w(
      "div",
      {
        ref: M,
        tabIndex: -1,
        onFocus: () => {
          H.current = !0;
        },
        className: "zen-relative zen-max-h-[32rem] zen-overflow-auto zen-rounded-zen-md zen-border zen-border-zen-border focus-visible:zen-outline-none",
        children: [
          /* @__PURE__ */ w(
            "div",
            {
              style: { width: N + h },
              role: "treegrid",
              "aria-rowcount": n.length + 1,
              "aria-colcount": a,
              "aria-label": F,
              onKeyDown: be,
              children: [
                /* @__PURE__ */ w(
                  "div",
                  {
                    role: "row",
                    "aria-rowindex": 1,
                    className: "zen-sticky zen-top-0 zen-z-30 zen-flex zen-border-b zen-border-zen-border zen-bg-zen-muted",
                    style: { height: J, boxSizing: "border-box" },
                    children: [
                      /* @__PURE__ */ r(
                        "div",
                        {
                          className: "zen-sticky zen-z-40 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-muted zen-text-xs zen-font-semibold zen-text-zen-muted-fg",
                          style: { width: N, insetInlineStart: 0 },
                          children: te.map((e) => /* @__PURE__ */ r(
                            "div",
                            {
                              role: "columnheader",
                              "aria-colindex": e.colIndex,
                              className: X("zen-truncate", e.className ?? "zen-px-2"),
                              style: { width: e.width },
                              children: e.label
                            },
                            e.key
                          ))
                        }
                      ),
                      /* @__PURE__ */ r(
                        "div",
                        {
                          role: "columnheader",
                          "aria-colindex": i,
                          "aria-label": z.t("scheduleGrid.timeline"),
                          className: "zen-flex",
                          style: { width: h },
                          children: O.map((e, t) => /* @__PURE__ */ w(
                            "div",
                            {
                              className: X(
                                "zen-flex zen-shrink-0 zen-flex-col zen-items-center zen-justify-center zen-overflow-hidden zen-border-e zen-border-zen-border last:zen-border-e-0",
                                e.nonWorking && "zen-bg-zen-muted",
                                e.today && "zen-bg-zen-primary-soft"
                              ),
                              style: { width: g[t] },
                              children: [
                                /* @__PURE__ */ r("span", { className: "zen-text-xs zen-font-medium zen-text-zen-foreground", children: e.label }),
                                e.sublabel && /* @__PURE__ */ r("span", { className: "zen-text-[10px] zen-text-zen-muted-fg", children: e.sublabel })
                              ]
                            },
                            e.start.getTime()
                          ))
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ w("div", { className: "zen-relative", style: { height: B }, children: [
                  S.paddingTop > 0 && /* @__PURE__ */ r("div", { "aria-hidden": "true", style: { height: S.paddingTop } }),
                  ue.map((e) => /* @__PURE__ */ r(
                    $e,
                    {
                      row: e,
                      columns: te,
                      axisColumns: O,
                      columnWidths: g,
                      axisWidth: h,
                      paneWidth: N,
                      timelineColIndex: i,
                      renderTrack: s,
                      rowHeight: c,
                      tabCol: e.index === me ? W : -1,
                      onFocusCell: ze
                    },
                    C(e)
                  )),
                  S.paddingBottom > 0 && /* @__PURE__ */ r("div", { "aria-hidden": "true", style: { height: S.paddingBottom } }),
                  ae !== null && /* @__PURE__ */ r(
                    "div",
                    {
                      "aria-hidden": "true",
                      className: "zen-pointer-events-none zen-absolute zen-top-0 zen-z-10 zen-w-px zen-bg-zen-error",
                      style: {
                        height: B,
                        insetInlineStart: N + ae / 100 * h
                      }
                    }
                  ),
                  he
                ] })
              ]
            }
          ),
          m && /* @__PURE__ */ r(
            "div",
            {
              className: "zen-sticky zen-bottom-0 zen-z-30 zen-flex zen-border-t zen-border-zen-border zen-bg-zen-muted",
              style: { width: N + h },
              children: m({ columns: O, columnWidths: g, axisWidth: h, paneWidth: N })
            }
          )
        ]
      }
    )
  ] });
}
function $e({
  row: n,
  columns: C,
  axisColumns: p,
  columnWidths: a,
  axisWidth: i,
  paneWidth: s,
  timelineColIndex: c,
  renderTrack: m,
  rowHeight: u,
  tabCol: y,
  onFocusCell: _
}) {
  const d = C.length;
  return /* @__PURE__ */ w(
    "div",
    {
      role: "row",
      "aria-rowindex": n.index + 2,
      "aria-level": n.depth + 1,
      "aria-expanded": n.hasChildren ? n.expanded : void 0,
      className: "zen-flex zen-border-b zen-border-zen-border last:zen-border-b-0",
      style: { height: u, boxSizing: "border-box" },
      children: [
        /* @__PURE__ */ r(
          "div",
          {
            className: "zen-sticky zen-z-20 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-background",
            style: { width: s, insetInlineStart: 0 },
            children: C.map((o, L) => /* @__PURE__ */ r(
              "div",
              {
                role: "gridcell",
                "aria-colindex": o.colIndex,
                "data-gantt-cell": `${n.index}:${L}`,
                tabIndex: y === L ? 0 : -1,
                onFocus: () => _(n.index, L),
                "aria-label": o.ariaLabel?.(n),
                className: X("zen-flex zen-items-center", o.className ?? "zen-px-2", ce),
                style: { width: o.width, ...o.style?.(n) },
                children: o.render(n)
              },
              o.key
            ))
          }
        ),
        /* @__PURE__ */ w(
          "div",
          {
            role: "gridcell",
            "aria-colindex": c,
            "data-gantt-cell": `${n.index}:${d}`,
            tabIndex: y === d ? 0 : -1,
            onFocus: () => _(n.index, d),
            className: X("zen-relative zen-shrink-0", ce),
            style: { width: i },
            children: [
              /* @__PURE__ */ r("div", { "aria-hidden": "true", className: "zen-absolute zen-inset-0 zen-flex", children: p.map((o, L) => /* @__PURE__ */ r(
                "div",
                {
                  className: X(
                    "zen-shrink-0 zen-border-e zen-border-zen-border last:zen-border-e-0",
                    o.nonWorking && "zen-bg-zen-muted/40",
                    o.today && "zen-bg-zen-primary-soft/40"
                  ),
                  style: { width: a[L] }
                },
                o.start.getTime()
              )) }),
              m(n, i)
            ]
          }
        )
      ]
    }
  );
}
export {
  Pe as ALL_VIEWS,
  J as HEADER_PX,
  je as INDENT_PX,
  Re as ROW_PX,
  Je as ScheduleGrid,
  He as useScheduleAxis,
  Ye as useScrollerMetrics
};
//# sourceMappingURL=index216.js.map
