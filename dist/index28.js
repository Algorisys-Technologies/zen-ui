import { jsx as i, jsxs as E } from "react/jsx-runtime";
import * as u from "react";
import { cn as m } from "./index145.js";
import "./index25.js";
import "./index100.js";
import { formatMediaTime as ie, clampBadgePct as T, MIN_MEDIA_RANGE as se, moveRange as H, dragRangeEdge as S } from "./index30.js";
import { Icon as ae } from "./index57.js";
const ce = (s) => `color-mix(in srgb, var(--zen-color-primary) ${s}%, transparent)`, F = "zen-absolute zen-top-0.5 -zen-translate-x-1/2 zen-whitespace-nowrap zen-rounded-zen-sm zen-bg-zen-foreground zen-px-1.5 zen-text-xs zen-font-mono zen-text-zen-background zen-pointer-events-none zen-z-20", ze = u.forwardRef(
  ({
    duration: s,
    ranges: z,
    rangeMode: $ = "partition",
    activeIndex: L,
    onActiveIndexChange: g,
    onRangesChange: k,
    onRangesInput: U,
    onRangesCommit: W,
    onRangeRemove: K,
    onSeek: X,
    onTrackDblClick: _,
    thumbnails: x,
    currentTime: C,
    zoom: G = 1,
    minRangeDuration: h = se,
    formatTime: b = ie,
    rangeClass: q,
    rangeColor: J,
    rangeLabel: I,
    label: O = "Media timeline",
    className: Q,
    ...V
  }, Y) => {
    const o = $ === "independent", j = u.useRef(null), [a, P] = u.useState(null), [D, N] = u.useState(null), [R, w] = u.useState(null), d = u.useRef(null), y = u.useRef(!1), B = u.useRef(0), p = (n) => n / s * 100, f = (n) => {
      const e = j.current;
      if (!e) return 0;
      const t = e.getBoundingClientRect();
      return Math.max(0, Math.min(1, (n - t.left) / t.width)) * s;
    }, A = (n) => (U ?? k)?.(n), Z = (n, e, t) => {
      t.preventDefault(), t.stopPropagation(), t.target.setPointerCapture(t.pointerId), P({ index: n, edge: e }), w(null), d.current = null, g?.(n);
    }, ee = (n, e) => {
      o && (e.preventDefault(), e.stopPropagation(), e.currentTarget.setPointerCapture(e.pointerId), B.current = f(e.clientX) - z[n].start, P({ index: n, edge: "move" }), w(null), d.current = null, g?.(n));
    }, ne = (n) => {
      if (!a) {
        w(f(n.clientX));
        return;
      }
      if (n.preventDefault(), a.edge === "move") {
        const { ranges: l, start: v } = H(
          z,
          a.index,
          f(n.clientX) - B.current,
          s
        );
        d.current = l;
        const r = l[a.index];
        N({
          pct: T(p(v)),
          text: `${b(v)} · ${(r.end - r.start).toFixed(1)}s`
        }), A(l);
        return;
      }
      const { ranges: e, edgeTime: t } = S(
        z,
        a.index,
        a.edge,
        f(n.clientX),
        s,
        h,
        $
      );
      d.current = e;
      const c = e[a.index];
      N({
        pct: T(p(t)),
        text: `${b(t)} · ${(c.end - c.start).toFixed(1)}s`
      }), A(e), X?.(t);
    }, te = () => {
      a && (d.current && (W?.(d.current), y.current = !0), P(null), N(null), d.current = null);
    }, re = (n) => {
      if (y.current) {
        y.current = !1;
        return;
      }
      o && g?.(-1), X?.(f(n.clientX));
    }, oe = (n, e, t) => {
      const c = t.key === "ArrowRight" ? 1 : t.key === "ArrowLeft" ? -1 : 0;
      if (!c) return;
      t.preventDefault();
      const l = z[n], v = e === "start" ? l.start : l.end, { ranges: r } = S(
        z,
        n,
        e,
        v + c * (t.shiftKey ? 1 : h),
        s,
        h,
        $
      );
      k?.(r);
    }, le = (n, e) => {
      const t = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!t) return;
      e.preventDefault();
      const { ranges: c } = H(
        z,
        n,
        z[n].start + t * (e.shiftKey ? 1 : h),
        s
      );
      k?.(c);
    };
    return /* @__PURE__ */ i("div", { ref: Y, className: m("zen-flex zen-w-full zen-flex-col", Q), ...V, children: /* @__PURE__ */ i("div", { className: "zen-w-full zen-overflow-x-auto zen-rounded-zen-md", children: /* @__PURE__ */ E(
      "div",
      {
        ref: j,
        role: "group",
        "aria-label": O,
        dir: "ltr",
        className: m(
          // Overlay lanes are shorter than filmstrip tracks — the height
          // is a per-mode default because the caller's `className` lands
          // on the ROOT, where a height utility could not reach this.
          o ? "zen-h-10" : "zen-h-14",
          "zen-relative zen-select-none zen-overflow-hidden zen-rounded-zen-md",
          "zen-border zen-border-zen-border zen-bg-zen-muted zen-cursor-crosshair"
        ),
        style: { width: `${G * 100}%`, minWidth: "100%" },
        onClick: re,
        onDoubleClick: (n) => _?.(f(n.clientX)),
        onPointerDown: () => y.current = !1,
        onPointerMove: ne,
        onPointerUp: te,
        onPointerLeave: () => w(null),
        children: [
          x && x.length > 0 ? /* @__PURE__ */ i(
            "div",
            {
              "aria-hidden": "true",
              className: "zen-absolute zen-inset-0 zen-flex zen-overflow-hidden zen-opacity-60 zen-pointer-events-none",
              children: x.map((n, e) => /* @__PURE__ */ i(
                "img",
                {
                  src: n,
                  alt: "",
                  draggable: !1,
                  className: "zen-h-full zen-shrink-0 zen-object-cover",
                  style: { width: `${100 / x.length}%` }
                },
                e
              ))
            }
          ) : null,
          C !== void 0 && s > 0 ? /* @__PURE__ */ i(
            "div",
            {
              className: "zen-absolute zen-top-0 zen-h-full zen-w-px zen-bg-zen-foreground zen-pointer-events-none zen-z-10",
              style: { left: `${p(C)}%` }
            }
          ) : null,
          R !== null && !a ? /* @__PURE__ */ i("div", { className: F, style: { left: `${T(p(R))}%` }, children: b(R) }) : null,
          D ? /* @__PURE__ */ i("div", { className: F, style: { left: `${D.pct}%` }, children: D.text }) : null,
          z.map((n, e) => {
            const t = e === L, c = q?.(e, t), l = c ? void 0 : J?.(e, t), v = a?.edge === "move" && a.index === e;
            return /* @__PURE__ */ E(
              "div",
              {
                role: o ? "slider" : void 0,
                tabIndex: o ? 0 : void 0,
                "aria-orientation": o ? "horizontal" : void 0,
                "aria-label": o ? `Range ${e + 1} position` : void 0,
                "aria-valuemin": o ? 0 : void 0,
                "aria-valuemax": o ? s - (n.end - n.start) : void 0,
                "aria-valuenow": o ? n.start : void 0,
                "aria-valuetext": o ? b(n.start) : void 0,
                className: m(
                  "zen-absolute",
                  o ? m(
                    "zen-top-1 zen-bottom-1 zen-rounded-zen-sm zen-overflow-hidden",
                    v ? "zen-cursor-grabbing" : "zen-cursor-grab",
                    // Outline, not ring: the colour treatment owns the
                    // bar's box-shadow inline, and an inline style would
                    // silently beat a focus ring built from box-shadow.
                    "focus-visible:zen-outline focus-visible:zen-outline-2 focus-visible:zen-outline-zen-ring"
                  ) : "zen-top-0 zen-h-full",
                  c ?? (l ? "" : t ? "zen-ring-2 zen-ring-zen-primary" : "zen-ring-1 zen-ring-zen-primary")
                ),
                style: {
                  left: `${p(n.start)}%`,
                  width: `${p(n.end - n.start)}%`,
                  // A sliver of a span must stay visible and grabbable.
                  ...o ? { minWidth: "4px" } : {},
                  ...c ? {} : l ? {
                    background: `color-mix(in srgb, ${l} ${t ? 40 : 25}%, transparent)`,
                    boxShadow: `inset 0 0 0 ${t ? 2 : 1}px ${l}`
                  } : { background: ce(t ? 40 : 20) }
                },
                onClick: (r) => {
                  r.stopPropagation(), g?.(e);
                },
                onPointerDown: (r) => ee(e, r),
                onKeyDown: (r) => o && le(e, r),
                children: [
                  ["start", "end"].map((r) => /* @__PURE__ */ i(
                    "div",
                    {
                      role: "slider",
                      tabIndex: 0,
                      "aria-orientation": "horizontal",
                      "aria-label": `Range ${e + 1} ${r}`,
                      "aria-valuemin": 0,
                      "aria-valuemax": s,
                      "aria-valuenow": n[r],
                      "aria-valuetext": b(n[r]),
                      className: m(
                        "zen-absolute zen-top-0 zen-h-full zen-w-3 zen-cursor-ew-resize",
                        "zen-bg-zen-primary hover:zen-opacity-80",
                        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                        r === "start" ? "zen-left-0" : "zen-right-0"
                      ),
                      style: l ? { background: l } : void 0,
                      onPointerDown: (M) => Z(e, r, M),
                      onKeyDown: (M) => oe(e, r, M)
                    },
                    r
                  )),
                  I ? /* @__PURE__ */ i("span", { className: "zen-pointer-events-none zen-absolute zen-inset-0 zen-flex zen-items-center zen-px-3 zen-text-xs zen-text-zen-foreground", children: /* @__PURE__ */ i("span", { className: "zen-truncate", children: I(e) }) }) : null,
                  t && K ? /* @__PURE__ */ i(
                    "button",
                    {
                      type: "button",
                      "aria-label": `Remove range ${e + 1}`,
                      className: m(
                        "zen-absolute zen-top-1 zen-left-1/2 -zen-translate-x-1/2 zen-z-10",
                        "zen-flex zen-h-4 zen-w-4 zen-cursor-pointer zen-items-center zen-justify-center",
                        "zen-rounded-zen-full zen-border zen-border-zen-border zen-bg-zen-background zen-p-0",
                        "zen-text-zen-muted-fg hover:zen-border-zen-error hover:zen-bg-zen-error hover:zen-text-zen-error-fg",
                        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
                      ),
                      onPointerDown: (r) => r.stopPropagation(),
                      onClick: (r) => {
                        r.stopPropagation(), K(e);
                      },
                      children: /* @__PURE__ */ i(ae, { name: "x", size: 10 })
                    }
                  ) : null
                ]
              },
              e
            );
          })
        ]
      }
    ) }) });
  }
);
ze.displayName = "MediaTimeline";
export {
  ze as MediaTimeline
};
//# sourceMappingURL=index28.js.map
