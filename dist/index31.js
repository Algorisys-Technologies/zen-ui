import { jsx as i, jsxs as A } from "react/jsx-runtime";
import * as u from "react";
import { cn as v } from "./index160.js";
import "./index28.js";
import "./index110.js";
import { formatMediaTime as ae, clampBadgePct as K, MIN_MEDIA_RANGE as ce, moveRange as H, dragRangeEdge as L } from "./index33.js";
import { Icon as ze } from "./index63.js";
import { useLocale as ue } from "./index90.js";
const de = (s) => `color-mix(in srgb, var(--zen-color-primary) ${s}%, transparent)`, F = "zen-absolute zen-top-0.5 -zen-translate-x-1/2 zen-whitespace-nowrap zen-rounded-zen-sm zen-bg-zen-foreground zen-px-1.5 zen-text-xs zen-font-mono zen-text-zen-background zen-pointer-events-none zen-z-20", pe = u.forwardRef(
  ({
    duration: s,
    ranges: z,
    rangeMode: P = "partition",
    activeIndex: U,
    onActiveIndexChange: g,
    onRangesChange: D,
    onRangesInput: W,
    onRangesCommit: _,
    onRangeRemove: X,
    onSeek: C,
    onTrackDblClick: G,
    thumbnails: x,
    currentTime: I,
    zoom: q = 1,
    minRangeDuration: h = ce,
    formatTime: b = ae,
    rangeClass: J,
    rangeColor: O,
    rangeLabel: j,
    label: Q,
    className: V,
    ...Y
  }, Z) => {
    const w = ue(), ee = Q ?? w.t("mediaTimeline.mediaTimeline"), o = P === "independent", B = u.useRef(null), [a, N] = u.useState(null), [$, T] = u.useState(null), [R, y] = u.useState(null), d = u.useRef(null), k = u.useRef(!1), E = u.useRef(0), p = (n) => n / s * 100, f = (n) => {
      const e = B.current;
      if (!e) return 0;
      const t = e.getBoundingClientRect();
      return Math.max(0, Math.min(1, (n - t.left) / t.width)) * s;
    }, S = (n) => (W ?? D)?.(n), ne = (n, e, t) => {
      t.preventDefault(), t.stopPropagation(), t.target.setPointerCapture(t.pointerId), N({ index: n, edge: e }), y(null), d.current = null, g?.(n);
    }, te = (n, e) => {
      o && (e.preventDefault(), e.stopPropagation(), e.currentTarget.setPointerCapture(e.pointerId), E.current = f(e.clientX) - z[n].start, N({ index: n, edge: "move" }), y(null), d.current = null, g?.(n));
    }, re = (n) => {
      if (!a) {
        y(f(n.clientX));
        return;
      }
      if (n.preventDefault(), a.edge === "move") {
        const { ranges: l, start: m } = H(
          z,
          a.index,
          f(n.clientX) - E.current,
          s
        );
        d.current = l;
        const r = l[a.index];
        T({
          pct: K(p(m)),
          text: `${b(m)} · ${(r.end - r.start).toFixed(1)}s`
        }), S(l);
        return;
      }
      const { ranges: e, edgeTime: t } = L(
        z,
        a.index,
        a.edge,
        f(n.clientX),
        s,
        h,
        P
      );
      d.current = e;
      const c = e[a.index];
      T({
        pct: K(p(t)),
        text: `${b(t)} · ${(c.end - c.start).toFixed(1)}s`
      }), S(e), C?.(t);
    }, oe = () => {
      a && (d.current && (_?.(d.current), k.current = !0), N(null), T(null), d.current = null);
    }, le = (n) => {
      if (k.current) {
        k.current = !1;
        return;
      }
      o && g?.(-1), C?.(f(n.clientX));
    }, ie = (n, e, t) => {
      const c = t.key === "ArrowRight" ? 1 : t.key === "ArrowLeft" ? -1 : 0;
      if (!c) return;
      t.preventDefault();
      const l = z[n], m = e === "start" ? l.start : l.end, { ranges: r } = L(
        z,
        n,
        e,
        m + c * (t.shiftKey ? 1 : h),
        s,
        h,
        P
      );
      D?.(r);
    }, se = (n, e) => {
      const t = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!t) return;
      e.preventDefault();
      const { ranges: c } = H(
        z,
        n,
        z[n].start + t * (e.shiftKey ? 1 : h),
        s
      );
      D?.(c);
    };
    return /* @__PURE__ */ i("div", { ref: Z, className: v("zen-flex zen-w-full zen-flex-col", V), ...Y, children: /* @__PURE__ */ i("div", { className: "zen-w-full zen-overflow-x-auto zen-rounded-zen-md", children: /* @__PURE__ */ A(
      "div",
      {
        ref: B,
        role: "group",
        "aria-label": ee,
        dir: "ltr",
        className: v(
          // Overlay lanes are shorter than filmstrip tracks — the height
          // is a per-mode default because the caller's `className` lands
          // on the ROOT, where a height utility could not reach this.
          o ? "zen-h-10" : "zen-h-14",
          "zen-relative zen-select-none zen-overflow-hidden zen-rounded-zen-md",
          "zen-border zen-border-zen-border zen-bg-zen-muted zen-cursor-crosshair"
        ),
        style: { width: `${q * 100}%`, minWidth: "100%" },
        onClick: le,
        onDoubleClick: (n) => G?.(f(n.clientX)),
        onPointerDown: () => k.current = !1,
        onPointerMove: re,
        onPointerUp: oe,
        onPointerLeave: () => y(null),
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
          I !== void 0 && s > 0 ? /* @__PURE__ */ i(
            "div",
            {
              className: "zen-absolute zen-top-0 zen-h-full zen-w-px zen-bg-zen-foreground zen-pointer-events-none zen-z-10",
              style: { left: `${p(I)}%` }
            }
          ) : null,
          R !== null && !a ? /* @__PURE__ */ i("div", { className: F, style: { left: `${K(p(R))}%` }, children: b(R) }) : null,
          $ ? /* @__PURE__ */ i("div", { className: F, style: { left: `${$.pct}%` }, children: $.text }) : null,
          z.map((n, e) => {
            const t = e === U, c = J?.(e, t), l = c ? void 0 : O?.(e, t), m = a?.edge === "move" && a.index === e;
            return /* @__PURE__ */ A(
              "div",
              {
                role: o ? "slider" : void 0,
                tabIndex: o ? 0 : void 0,
                "aria-orientation": o ? "horizontal" : void 0,
                "aria-label": o ? w.t("mediaTimeline.rangePosition", { n: e + 1 }) : void 0,
                "aria-valuemin": o ? 0 : void 0,
                "aria-valuemax": o ? s - (n.end - n.start) : void 0,
                "aria-valuenow": o ? n.start : void 0,
                "aria-valuetext": o ? b(n.start) : void 0,
                className: v(
                  "zen-absolute",
                  o ? v(
                    "zen-top-1 zen-bottom-1 zen-rounded-zen-sm zen-overflow-hidden",
                    m ? "zen-cursor-grabbing" : "zen-cursor-grab",
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
                  } : { background: de(t ? 40 : 20) }
                },
                onClick: (r) => {
                  r.stopPropagation(), g?.(e);
                },
                onPointerDown: (r) => te(e, r),
                onKeyDown: (r) => o && se(e, r),
                children: [
                  ["start", "end"].map((r) => /* @__PURE__ */ i(
                    "div",
                    {
                      role: "slider",
                      tabIndex: 0,
                      "aria-orientation": "horizontal",
                      "aria-label": w.t(r === "start" ? "mediaTimeline.rangeStart" : "mediaTimeline.rangeEnd", { n: e + 1 }),
                      "aria-valuemin": 0,
                      "aria-valuemax": s,
                      "aria-valuenow": n[r],
                      "aria-valuetext": b(n[r]),
                      className: v(
                        "zen-absolute zen-top-0 zen-h-full zen-w-3 zen-cursor-ew-resize",
                        "zen-bg-zen-primary hover:zen-opacity-80",
                        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                        r === "start" ? "zen-left-0" : "zen-right-0"
                      ),
                      style: l ? { background: l } : void 0,
                      onPointerDown: (M) => ne(e, r, M),
                      onKeyDown: (M) => ie(e, r, M)
                    },
                    r
                  )),
                  j ? /* @__PURE__ */ i("span", { className: "zen-pointer-events-none zen-absolute zen-inset-0 zen-flex zen-items-center zen-px-3 zen-text-xs zen-text-zen-foreground", children: /* @__PURE__ */ i("span", { className: "zen-truncate", children: j(e) }) }) : null,
                  t && X ? /* @__PURE__ */ i(
                    "button",
                    {
                      type: "button",
                      "aria-label": w.t("mediaTimeline.removeRange", { n: e + 1 }),
                      className: v(
                        "zen-absolute zen-top-1 zen-left-1/2 -zen-translate-x-1/2 zen-z-10",
                        "zen-flex zen-h-4 zen-w-4 zen-cursor-pointer zen-items-center zen-justify-center",
                        "zen-rounded-zen-full zen-border zen-border-zen-border zen-bg-zen-background zen-p-0",
                        "zen-text-zen-muted-fg hover:zen-border-zen-error hover:zen-bg-zen-error hover:zen-text-zen-error-fg",
                        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
                      ),
                      onPointerDown: (r) => r.stopPropagation(),
                      onClick: (r) => {
                        r.stopPropagation(), X(e);
                      },
                      children: /* @__PURE__ */ i(ze, { name: "x", size: 10 })
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
pe.displayName = "MediaTimeline";
export {
  pe as MediaTimeline
};
//# sourceMappingURL=index31.js.map
