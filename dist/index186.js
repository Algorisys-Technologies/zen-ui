import { jsx as r, jsxs as v, Fragment as be } from "react/jsx-runtime";
import * as d from "react";
import { cn as X } from "./index145.js";
import "./index25.js";
import { nowPct as xe } from "./index185.js";
import { ganttFitUnit as pe, ganttFitHourStep as ye, ganttRange as ve, ganttRangeColumns as we, ganttColumns as ke, ganttPaneColumns as Me, ganttColumnWidths as Ne, ganttRowWindow as Se, shiftGanttAnchor as se, ganttSpanLabel as Ie, ganttRangeLabel as Ce } from "./index100.js";
import { Button as H } from "./index65.js";
import { Icon as le } from "./index57.js";
const Te = 36, Y = 44, Ue = 14, Le = {
  day: 56,
  week: 128,
  month: 44,
  /* Sized to FIT, not to breathe: a year you have to scroll sideways to reach
     December in is not showing you the year, which is the only reason the view
     exists. 14 × 72 and 12 × 80 both land near 1000px — inside a normal content
     column — and "13 Jul" and "Sep" are comfortable at those widths. */
  quarter: 72,
  year: 80
}, Re = {
  hour: 40,
  day: 20,
  /* 26, not the quarter view's 72: a fit week column draws "13" with the month
     only where it changes, not "13 Jul" twenty times over. */
  week: 26,
  month: 30
}, Ee = {
  day: 34,
  week: 44,
  month: 20,
  quarter: 38,
  year: 30
}, We = 280, Q = 5, _e = 512, de = "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-inset focus-visible:zen-ring-zen-ring", Ae = {
  fit: "Fit",
  day: "Day",
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  year: "Year"
}, Fe = ["fit", "day", "week", "month", "quarter", "year"];
function Ve(n) {
  const { view: S, anchor: x, fitRange: a, now: i, calendar: o, hourStep: u, columnWidth: z, paneColumns: m, available: p } = n, E = S === "fit", c = E ? "month" : S, s = x.getTime(), I = i.getTime(), C = a ? pe(a.end.getTime() - a.start.getTime()) : null, U = C === "hour" && u === void 0 && a ? ye(a.end.getTime() - a.start.getTime()) : u, D = d.useMemo(() => ve(c, x), [c, s]), T = a ?? D, w = d.useMemo(
    () => a && C ? we(a, C, { now: i, calendar: o, hourStep: U }) : ke(c, x, { now: i, calendar: o, hourStep: u }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [a, C, c, s, I, o, U]
  ), A = z !== void 0 ? w.length * z : C ? w.length * Re[C] : w.length * Ee[c], K = z !== void 0 ? w.length * z : C ? Number.POSITIVE_INFINITY : w.length * Le[c], k = d.useMemo(() => {
    const l = {};
    for (const h of m) l[h.key] = h.width;
    return l;
  }, [m]), J = m.map((l) => l.key).join(","), F = d.useMemo(
    () => Me(
      m.map((l) => l.key),
      k,
      p,
      Math.max(We, A)
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [J, k, p, A]
  ), V = F.reduce((l, h) => l + (k[h] ?? 0), 0), L = p > 0 ? Math.min(K, Math.max(A, p - V)) : Number.isFinite(K) ? K : A, O = d.useMemo(
    () => Ne(w, T, L),
    [w, T, L]
  ), q = d.useMemo(
    () => L > 0 ? (T.end.getTime() - T.start.getTime()) / L : 0,
    [T, L]
  );
  return { range: T, columns: w, columnWidths: O, axisWidth: L, paneWidth: V, isFit: E, minGapMs: q, paneKeys: F };
}
function je(n) {
  const [S, x] = d.useState({ top: 0, height: _e, width: 0 }), a = d.useCallback(() => {
    const i = n.current;
    i && x(
      (o) => o.top === i.scrollTop && o.height === i.clientHeight && o.width === i.clientWidth ? o : { top: i.scrollTop, height: i.clientHeight, width: i.clientWidth }
    );
  }, [n]);
  return d.useLayoutEffect(() => {
    const i = n.current;
    if (!i) return;
    let o = 0;
    const u = () => {
      o = 0, a();
    }, z = () => {
      o === 0 && (o = requestAnimationFrame(u));
    };
    i.addEventListener("scroll", z, { passive: !0 });
    const m = new ResizeObserver(z);
    return m.observe(i), () => {
      o !== 0 && cancelAnimationFrame(o), i.removeEventListener("scroll", z), m.disconnect();
    };
  }, [n, a]), d.useLayoutEffect(a), { metrics: S, setMetrics: x, measure: a };
}
function Ge({
  rows: n,
  rowId: S,
  columns: x,
  colCount: a,
  timelineColIndex: i,
  renderTrack: o,
  rowHeight: u = Te,
  renderFooter: z,
  view: m,
  anchor: p,
  now: E,
  connectors: c,
  connectorAccent: s,
  views: I,
  hideToolbar: C,
  onViewChange: U,
  onDateChange: D,
  onToggle: T,
  onActivate: w,
  ariaLabel: A,
  className: K,
  scrollerRef: k,
  axis: J,
  metrics: F,
  setMetrics: V
}) {
  const { range: L, columns: O, columnWidths: q, axisWidth: l, paneWidth: h, isFit: ne, paneKeys: re } = J, Z = m === "fit" ? "month" : m, ie = xe(L, E), B = n.length * u, ee = d.useMemo(
    () => re.map((e) => x.find((t) => t.key === e)).filter(Boolean),
    [re, x]
  ), te = ee.length + 1, M = Se(n.length, u, F.top, F.height), ce = n.slice(M.startIndex, M.endIndex), he = d.useMemo(() => !c || c.length === 0 ? null : (
    /* Mirrored under RTL rather than recomputed: the bars are placed with
       logical inset properties, so the axis is already flipped and the routes
       have to flip with it — arrowheads included. */
    /* @__PURE__ */ r(
      "svg",
      {
        "aria-hidden": "true",
        className: "zen-pointer-events-none zen-absolute zen-top-0 zen-z-10 rtl:-zen-scale-x-100",
        width: l,
        height: B,
        viewBox: `0 0 ${l} ${B}`,
        style: { insetInlineStart: h },
        children: c.map((e) => {
          const t = s?.(e) ? "var(--zen-color-error)" : "var(--zen-color-muted-fg)";
          return /* @__PURE__ */ v("g", { children: [
            /* @__PURE__ */ r(
              "path",
              {
                d: e.d,
                fill: "none",
                stroke: t,
                strokeWidth: s?.(e) ? 2.25 : 1.5
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
  ), [c, s, l, B, h]), [ae, oe] = d.useState({ row: 0, col: 0 }), W = Math.min(Math.max(ae.row, 0), Math.max(n.length - 1, 0)), _ = Math.min(Math.max(ae.col, 0), te - 1), ue = Math.min(Math.max(W, M.startIndex), Math.max(M.endIndex - 1, 0)), j = d.useRef(null), G = d.useRef(!1), me = d.useCallback((e, t) => {
    oe((f) => f.row === e && f.col === t ? f : { row: e, col: t });
  }, []), ze = (e) => {
    const t = k.current;
    if (!t) return;
    const f = Y + e * u, P = f - Y, R = f + u - t.clientHeight, g = Math.max(0, Math.min(Math.max(t.scrollTop, R), P));
    g !== t.scrollTop && (t.scrollTop = g, V((N) => N.top === g ? N : { ...N, top: g }));
  }, fe = (e, t) => {
    oe({ row: e, col: t }), j.current = { row: e, col: t }, ze(e);
  };
  d.useLayoutEffect(() => {
    const e = j.current, t = k.current;
    if (!e || !t) return;
    const f = t.querySelector(`[data-gantt-cell="${e.row}:${e.col}"]`);
    if (!f) return;
    j.current = null, G.current = !0, f.focus({ preventScroll: !0 });
    const P = f.querySelector("[data-gantt-bar]");
    if (!P) return;
    const R = P.getBoundingClientRect(), g = t.getBoundingClientRect(), N = getComputedStyle(t).direction === "rtl", b = N ? g.left : g.left + h, y = N ? g.right - h : g.right;
    R.left < b ? t.scrollLeft -= b - R.left : R.right > y && (t.scrollLeft += Math.min(R.right - y, R.left - b));
  });
  const ge = (e) => {
    if (e.altKey || e.metaKey) return;
    const t = k.current, f = t ? getComputedStyle(t).direction === "rtl" : !1, P = f ? "ArrowLeft" : "ArrowRight", R = f ? "ArrowRight" : "ArrowLeft", g = Math.max(1, Math.floor((F.height - Y) / u)), N = n.length - 1, b = n[W];
    let y = W, $ = _;
    switch (e.key) {
      case "ArrowDown":
        y = Math.min(N, W + 1);
        break;
      case "ArrowUp":
        y = Math.max(0, W - 1);
        break;
      case P:
        if (_ === 0 && b?.hasChildren && !b.expanded) {
          e.preventDefault(), T(b);
          return;
        }
        $ = Math.min(te - 1, _ + 1);
        break;
      case R:
        if (_ === 0 && b?.hasChildren && b.expanded) {
          e.preventDefault(), T(b);
          return;
        }
        $ = Math.max(0, _ - 1);
        break;
      case "Home":
        $ = 0, e.ctrlKey && (y = 0);
        break;
      case "End":
        $ = te - 1, e.ctrlKey && (y = N);
        break;
      case "PageDown":
        y = Math.min(N, W + g);
        break;
      case "PageUp":
        y = Math.max(0, W - g);
        break;
      case "Enter":
      case " ":
        e.preventDefault(), b && w?.(b);
        return;
      default:
        return;
    }
    e.preventDefault(), !(y === W && $ === _) && fe(y, $);
  };
  return d.useEffect(() => {
    const e = k.current;
    if (e && !j.current && !e.contains(document.activeElement)) {
      if (G.current && document.activeElement === document.body) {
        e.focus({ preventScroll: !0 });
        return;
      }
      G.current = !1;
    }
  }, [M.startIndex, M.endIndex, k]), /* @__PURE__ */ v("div", { className: X("zen-flex zen-w-full zen-flex-col zen-gap-3", K), children: [
    !C && /* @__PURE__ */ v("div", { className: "zen-flex zen-flex-wrap zen-items-center zen-gap-2", children: [
      !ne && /* @__PURE__ */ v(be, { children: [
        /* @__PURE__ */ r(
          H,
          {
            variant: "outline",
            size: "sm",
            "aria-label": "Previous",
            onClick: () => D(se(Z, p, -1)),
            children: /* @__PURE__ */ r(le, { name: "chevron-left", size: 14, className: "rtl:zen-rotate-180" })
          }
        ),
        /* @__PURE__ */ r(H, { variant: "outline", size: "sm", onClick: () => D(E), children: "Today" }),
        /* @__PURE__ */ r(
          H,
          {
            variant: "outline",
            size: "sm",
            "aria-label": "Next",
            onClick: () => D(se(Z, p, 1)),
            children: /* @__PURE__ */ r(le, { name: "chevron-right", size: 14, className: "rtl:zen-rotate-180" })
          }
        )
      ] }),
      /* @__PURE__ */ r(
        "span",
        {
          dir: "auto",
          className: "zen-mx-1 zen-text-sm zen-font-medium zen-text-zen-foreground",
          children: ne ? Ie(L) : Ce(Z, p)
        }
      ),
      /* @__PURE__ */ r("div", { className: "zen-ms-auto zen-flex zen-gap-1", role: "group", "aria-label": "View", children: (I ?? Fe).map((e) => /* @__PURE__ */ r(
        H,
        {
          variant: m === e ? "solid" : "outline",
          size: "sm",
          "aria-pressed": m === e,
          onClick: () => U(e),
          children: Ae[e]
        },
        e
      )) })
    ] }),
    /* @__PURE__ */ v(
      "div",
      {
        ref: k,
        tabIndex: -1,
        onFocus: () => {
          G.current = !0;
        },
        className: "zen-relative zen-max-h-[32rem] zen-overflow-auto zen-rounded-zen-md zen-border zen-border-zen-border focus-visible:zen-outline-none",
        children: [
          /* @__PURE__ */ v(
            "div",
            {
              style: { width: h + l },
              role: "treegrid",
              "aria-rowcount": n.length + 1,
              "aria-colcount": a,
              "aria-label": A,
              onKeyDown: ge,
              children: [
                /* @__PURE__ */ v(
                  "div",
                  {
                    role: "row",
                    "aria-rowindex": 1,
                    className: "zen-sticky zen-top-0 zen-z-30 zen-flex zen-border-b zen-border-zen-border zen-bg-zen-muted",
                    style: { height: Y, boxSizing: "border-box" },
                    children: [
                      /* @__PURE__ */ r(
                        "div",
                        {
                          className: "zen-sticky zen-z-40 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-muted zen-text-xs zen-font-semibold zen-text-zen-muted-fg",
                          style: { width: h, insetInlineStart: 0 },
                          children: ee.map((e) => /* @__PURE__ */ r(
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
                          "aria-label": "Timeline",
                          className: "zen-flex",
                          style: { width: l },
                          children: O.map((e, t) => /* @__PURE__ */ v(
                            "div",
                            {
                              className: X(
                                "zen-flex zen-shrink-0 zen-flex-col zen-items-center zen-justify-center zen-overflow-hidden zen-border-e zen-border-zen-border last:zen-border-e-0",
                                e.nonWorking && "zen-bg-zen-muted",
                                e.today && "zen-bg-zen-primary-soft"
                              ),
                              style: { width: q[t] },
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
                /* @__PURE__ */ v("div", { className: "zen-relative", style: { height: B }, children: [
                  M.paddingTop > 0 && /* @__PURE__ */ r("div", { "aria-hidden": "true", style: { height: M.paddingTop } }),
                  ce.map((e) => /* @__PURE__ */ r(
                    Pe,
                    {
                      row: e,
                      columns: ee,
                      axisColumns: O,
                      columnWidths: q,
                      axisWidth: l,
                      paneWidth: h,
                      timelineColIndex: i,
                      renderTrack: o,
                      rowHeight: u,
                      tabCol: e.index === ue ? _ : -1,
                      onFocusCell: me
                    },
                    S(e)
                  )),
                  M.paddingBottom > 0 && /* @__PURE__ */ r("div", { "aria-hidden": "true", style: { height: M.paddingBottom } }),
                  ie !== null && /* @__PURE__ */ r(
                    "div",
                    {
                      "aria-hidden": "true",
                      className: "zen-pointer-events-none zen-absolute zen-top-0 zen-z-10 zen-w-px zen-bg-zen-error",
                      style: {
                        height: B,
                        insetInlineStart: h + ie / 100 * l
                      }
                    }
                  ),
                  he
                ] })
              ]
            }
          ),
          z && /* @__PURE__ */ r(
            "div",
            {
              className: "zen-sticky zen-bottom-0 zen-z-30 zen-flex zen-border-t zen-border-zen-border zen-bg-zen-muted",
              style: { width: h + l },
              children: z({ columns: O, columnWidths: q, axisWidth: l, paneWidth: h })
            }
          )
        ]
      }
    )
  ] });
}
function Pe({
  row: n,
  columns: S,
  axisColumns: x,
  columnWidths: a,
  axisWidth: i,
  paneWidth: o,
  timelineColIndex: u,
  renderTrack: z,
  rowHeight: m,
  tabCol: p,
  onFocusCell: E
}) {
  const c = S.length;
  return /* @__PURE__ */ v(
    "div",
    {
      role: "row",
      "aria-rowindex": n.index + 2,
      "aria-level": n.depth + 1,
      "aria-expanded": n.hasChildren ? n.expanded : void 0,
      className: "zen-flex zen-border-b zen-border-zen-border last:zen-border-b-0",
      style: { height: m, boxSizing: "border-box" },
      children: [
        /* @__PURE__ */ r(
          "div",
          {
            className: "zen-sticky zen-z-20 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-background",
            style: { width: o, insetInlineStart: 0 },
            children: S.map((s, I) => /* @__PURE__ */ r(
              "div",
              {
                role: "gridcell",
                "aria-colindex": s.colIndex,
                "data-gantt-cell": `${n.index}:${I}`,
                tabIndex: p === I ? 0 : -1,
                onFocus: () => E(n.index, I),
                "aria-label": s.ariaLabel?.(n),
                className: X("zen-flex zen-items-center", s.className ?? "zen-px-2", de),
                style: { width: s.width, ...s.style?.(n) },
                children: s.render(n)
              },
              s.key
            ))
          }
        ),
        /* @__PURE__ */ v(
          "div",
          {
            role: "gridcell",
            "aria-colindex": u,
            "data-gantt-cell": `${n.index}:${c}`,
            tabIndex: p === c ? 0 : -1,
            onFocus: () => E(n.index, c),
            className: X("zen-relative zen-shrink-0", de),
            style: { width: i },
            children: [
              /* @__PURE__ */ r("div", { "aria-hidden": "true", className: "zen-absolute zen-inset-0 zen-flex", children: x.map((s, I) => /* @__PURE__ */ r(
                "div",
                {
                  className: X(
                    "zen-shrink-0 zen-border-e zen-border-zen-border last:zen-border-e-0",
                    s.nonWorking && "zen-bg-zen-muted/40",
                    s.today && "zen-bg-zen-primary-soft/40"
                  ),
                  style: { width: a[I] }
                },
                s.start.getTime()
              )) }),
              z(n, i)
            ]
          }
        )
      ]
    }
  );
}
export {
  Fe as ALL_VIEWS,
  Y as HEADER_PX,
  Ue as INDENT_PX,
  Te as ROW_PX,
  Ge as ScheduleGrid,
  Ve as useScheduleAxis,
  je as useScrollerMetrics
};
//# sourceMappingURL=index186.js.map
