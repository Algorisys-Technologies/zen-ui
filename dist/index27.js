import { template as h, spread as ve, mergeProps as ge, insert as v, createComponent as f, setAttribute as c, effect as p, setStyleProperty as P, memo as X, className as E, style as Q, use as me, delegateEvents as fe } from "solid-js/web";
import { splitProps as he, createSignal as j, Show as k, For as V, Index as pe } from "solid-js";
import { cn as R } from "./index106.js";
import "./index25.js";
import { formatMediaTime as be, clampBadgePct as G, moveRange as W, dragRangeEdge as Y, MIN_MEDIA_RANGE as $e } from "./index29.js";
import { Icon as xe } from "./index21.js";
var we = /* @__PURE__ */ h('<div aria-hidden=true class="zen-absolute zen-inset-0 zen-flex zen-overflow-hidden zen-opacity-60 zen-pointer-events-none">'), ke = /* @__PURE__ */ h('<div class="zen-absolute zen-top-0 zen-h-full zen-w-px zen-bg-zen-foreground zen-pointer-events-none zen-z-10">'), Z = /* @__PURE__ */ h('<div class="zen-absolute zen-top-0.5 -zen-translate-x-1/2 zen-whitespace-nowrap zen-rounded-zen-sm zen-bg-zen-foreground zen-px-1.5 zen-text-xs zen-font-mono zen-text-zen-background zen-pointer-events-none zen-z-20">'), Re = /* @__PURE__ */ h('<div><div class="zen-w-full zen-overflow-x-auto zen-rounded-zen-md"><div role=group dir=ltr style=min-width:100%>'), ye = /* @__PURE__ */ h('<img alt class="zen-h-full zen-shrink-0 zen-object-cover">'), Ce = /* @__PURE__ */ h('<span class="zen-pointer-events-none zen-absolute zen-inset-0 zen-flex zen-items-center zen-px-3 zen-text-xs zen-text-zen-foreground"><span class=zen-truncate>'), Te = /* @__PURE__ */ h("<button type=button>"), De = /* @__PURE__ */ h("<div>"), Ie = /* @__PURE__ */ h("<div role=slider tabindex=0 aria-orientation=horizontal aria-valuemin=0>");
const Xe = (ee) => {
  const [e, ne] = he(ee, ["duration", "ranges", "rangeMode", "activeIndex", "onActiveIndexChange", "onRangesChange", "onRangesInput", "onRangesCommit", "onRangeRemove", "onSeek", "onTrackDblClick", "thumbnails", "currentTime", "zoom", "minRangeDuration", "formatTime", "rangeClass", "rangeColor", "rangeLabel", "label", "class"]);
  let A;
  const [_, B] = j(null), [te, K] = j(null), [F, H] = j(null), y = (r) => (e.formatTime ?? be)(r), M = () => e.minRangeDuration ?? $e, N = () => e.rangeMode ?? "partition", z = () => N() === "independent", $ = (r) => r / e.duration * 100, x = (r) => {
    if (!A) return 0;
    const a = A.getBoundingClientRect();
    return Math.max(0, Math.min(1, (r - a.left) / a.width)) * e.duration;
  };
  let b = null, L = !1, U = 0;
  const q = (r) => (e.onRangesInput ?? e.onRangesChange)?.(r), re = (r, a, o) => {
    o.preventDefault(), o.stopPropagation(), o.target.setPointerCapture(o.pointerId), B({
      index: r,
      edge: a
    }), b = null, e.onActiveIndexChange?.(r);
  }, oe = (r, a) => {
    z() && (a.preventDefault(), a.stopPropagation(), a.currentTarget.setPointerCapture(a.pointerId), U = x(a.clientX) - e.ranges[r].start, B({
      index: r,
      edge: "move"
    }), b = null, H(null), e.onActiveIndexChange?.(r));
  }, ie = (r) => {
    const a = _();
    if (!a) {
      H(x(r.clientX));
      return;
    }
    if (r.preventDefault(), a.edge === "move") {
      const {
        ranges: i,
        start: l
      } = W(e.ranges, a.index, x(r.clientX) - U, e.duration);
      b = i;
      const m = i[a.index];
      K({
        pct: G($(l)),
        text: `${y(l)} · ${(m.end - m.start).toFixed(1)}s`
      }), q(i);
      return;
    }
    const {
      ranges: o,
      edgeTime: g
    } = Y(e.ranges, a.index, a.edge, x(r.clientX), e.duration, M(), N());
    b = o;
    const t = o[a.index];
    K({
      pct: G($(g)),
      text: `${y(g)} · ${(t.end - t.start).toFixed(1)}s`
    }), q(o), e.onSeek?.(g);
  }, ae = () => {
    _() && (b && (e.onRangesCommit?.(b), L = !0), B(null), K(null), b = null);
  }, le = (r) => {
    if (L) {
      L = !1;
      return;
    }
    z() && e.onActiveIndexChange?.(-1), e.onSeek?.(x(r.clientX));
  }, se = (r, a, o) => {
    const g = o.key === "ArrowRight" ? 1 : o.key === "ArrowLeft" ? -1 : 0;
    if (!g) return;
    o.preventDefault();
    const t = e.ranges[r], i = a === "start" ? t.start : t.end, {
      ranges: l
    } = Y(e.ranges, r, a, i + g * (o.shiftKey ? 1 : M()), e.duration, M(), N());
    e.onRangesChange?.(l);
  }, de = (r, a) => {
    const o = a.key === "ArrowRight" ? 1 : a.key === "ArrowLeft" ? -1 : 0;
    if (!o) return;
    a.preventDefault();
    const {
      ranges: g
    } = W(e.ranges, r, e.ranges[r].start + o * (a.shiftKey ? 1 : M()), e.duration);
    e.onRangesChange?.(g);
  }, ue = (r) => `color-mix(in srgb, var(--zen-color-primary) ${r}%, transparent)`;
  return (() => {
    var r = Re(), a = r.firstChild, o = a.firstChild;
    ve(r, ge({
      get class() {
        return R("zen-flex zen-w-full zen-flex-col", e.class);
      }
    }, ne), !1, !0), o.addEventListener("pointerleave", () => H(null)), o.$$pointerup = ae, o.$$pointermove = ie, o.$$pointerdown = () => L = !1, o.$$dblclick = (t) => e.onTrackDblClick?.(x(t.clientX)), o.$$click = le;
    var g = A;
    return typeof g == "function" ? me(g, o) : A = o, v(o, f(k, {
      get when() {
        return X(() => !!e.thumbnails)() && e.thumbnails.length > 0;
      },
      get children() {
        var t = we();
        return v(t, f(V, {
          get each() {
            return e.thumbnails;
          },
          children: (i) => (() => {
            var l = ye();
            return c(l, "src", i), c(l, "draggable", !1), p((m) => P(l, "width", `${100 / (e.thumbnails?.length || 1)}%`)), l;
          })()
        })), t;
      }
    }), null), v(o, f(k, {
      get when() {
        return X(() => e.currentTime !== void 0)() && e.duration > 0;
      },
      get children() {
        var t = ke();
        return p((i) => P(t, "left", `${$(e.currentTime)}%`)), t;
      }
    }), null), v(o, f(k, {
      get when() {
        return X(() => F() !== null)() && !_();
      },
      get children() {
        var t = Z();
        return v(t, () => y(F())), p((i) => P(t, "left", `${G($(F()))}%`)), t;
      }
    }), null), v(o, f(k, {
      get when() {
        return te();
      },
      children: (t) => (() => {
        var i = Z();
        return v(i, () => t().text), p((l) => P(i, "left", `${t().pct}%`)), i;
      })()
    }), null), v(o, f(pe, {
      get each() {
        return e.ranges;
      },
      children: (t, i) => {
        const l = () => i === e.activeIndex, m = () => e.rangeClass?.(i, l()), w = () => m() ? void 0 : e.rangeColor?.(i, l()), ce = () => {
          const s = _();
          return s !== null && s.edge === "move" && s.index === i;
        };
        return (() => {
          var s = De();
          return s.$$keydown = (n) => z() && de(i, n), s.$$pointerdown = (n) => oe(i, n), s.$$click = (n) => {
            n.stopPropagation(), e.onActiveIndexChange?.(i);
          }, v(s, f(V, {
            each: ["start", "end"],
            children: (n) => (() => {
              var d = Ie();
              return d.$$keydown = (u) => se(i, n, u), d.$$pointerdown = (u) => re(i, n, u), c(d, "aria-label", `Range ${i + 1} ${n}`), p((u) => {
                var C = e.duration, T = t()[n], D = y(t()[n]), I = R("zen-absolute zen-top-0 zen-h-full zen-w-3 zen-cursor-ew-resize", "zen-bg-zen-primary hover:zen-opacity-80", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", n === "start" ? "zen-left-0" : "zen-right-0"), S = w() ? {
                  background: w()
                } : void 0;
                return C !== u.e && c(d, "aria-valuemax", u.e = C), T !== u.t && c(d, "aria-valuenow", u.t = T), D !== u.a && c(d, "aria-valuetext", u.a = D), I !== u.o && E(d, u.o = I), u.i = Q(d, S, u.i), u;
              }, {
                e: void 0,
                t: void 0,
                a: void 0,
                o: void 0,
                i: void 0
              }), d;
            })()
          }), null), v(s, f(k, {
            get when() {
              return e.rangeLabel;
            },
            get children() {
              var n = Ce(), d = n.firstChild;
              return v(d, () => e.rangeLabel(i)), n;
            }
          }), null), v(s, f(k, {
            get when() {
              return X(() => !!l())() && e.onRangeRemove;
            },
            get children() {
              var n = Te();
              return n.$$click = (d) => {
                d.stopPropagation(), e.onRangeRemove?.(i);
              }, n.$$pointerdown = (d) => d.stopPropagation(), c(n, "aria-label", `Remove range ${i + 1}`), v(n, f(xe, {
                name: "x",
                size: 10
              })), p(() => E(n, R("zen-absolute zen-top-1 zen-left-1/2 -zen-translate-x-1/2 zen-z-10", "zen-flex zen-h-4 zen-w-4 zen-cursor-pointer zen-items-center zen-justify-center", "zen-rounded-zen-full zen-border zen-border-zen-border zen-bg-zen-background zen-p-0", "zen-text-zen-muted-fg hover:zen-border-zen-error hover:zen-bg-zen-error hover:zen-text-zen-error-fg", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"))), n;
            }
          }), null), p((n) => {
            var d = z() ? "slider" : void 0, u = z() ? 0 : void 0, C = z() ? "horizontal" : void 0, T = z() ? `Range ${i + 1} position` : void 0, D = z() ? 0 : void 0, I = z() ? e.duration - (t().end - t().start) : void 0, S = z() ? t().start : void 0, J = z() ? y(t().start) : void 0, O = R("zen-absolute", z() ? R(
              "zen-top-1 zen-bottom-1 zen-rounded-zen-sm zen-overflow-hidden",
              ce() ? "zen-cursor-grabbing" : "zen-cursor-grab",
              // Outline, not ring: the colour treatment owns the
              // bar's box-shadow inline, and an inline style would
              // silently beat a focus ring built from box-shadow.
              "focus-visible:zen-outline focus-visible:zen-outline-2 focus-visible:zen-outline-zen-ring"
            ) : "zen-top-0 zen-h-full", m() ?? (w() ? "" : l() ? "zen-ring-2 zen-ring-zen-primary" : "zen-ring-1 zen-ring-zen-primary")), ze = {
              left: `${$(t().start)}%`,
              width: `${$(t().end - t().start)}%`,
              // A sliver of a span must stay visible and grabbable.
              ...z() ? {
                "min-width": "4px"
              } : {},
              ...m() ? {} : w() ? {
                background: `color-mix(in srgb, ${w()} ${l() ? 40 : 25}%, transparent)`,
                "box-shadow": `inset 0 0 0 ${l() ? 2 : 1}px ${w()}`
              } : {
                background: ue(l() ? 40 : 20)
              }
            };
            return d !== n.e && c(s, "role", n.e = d), u !== n.t && c(s, "tabindex", n.t = u), C !== n.a && c(s, "aria-orientation", n.a = C), T !== n.o && c(s, "aria-label", n.o = T), D !== n.i && c(s, "aria-valuemin", n.i = D), I !== n.n && c(s, "aria-valuemax", n.n = I), S !== n.s && c(s, "aria-valuenow", n.s = S), J !== n.h && c(s, "aria-valuetext", n.h = J), O !== n.r && E(s, n.r = O), n.d = Q(s, ze, n.d), n;
          }, {
            e: void 0,
            t: void 0,
            a: void 0,
            o: void 0,
            i: void 0,
            n: void 0,
            s: void 0,
            h: void 0,
            r: void 0,
            d: void 0
          }), s;
        })();
      }
    }), null), p((t) => {
      var i = e.label ?? "Media timeline", l = R(
        // Overlay lanes are shorter than filmstrip tracks — the height is
        // a per-mode default because the caller's `class` lands on the
        // ROOT, where a height utility could not reach this element.
        z() ? "zen-h-10" : "zen-h-14",
        "zen-relative zen-select-none zen-overflow-hidden zen-rounded-zen-md",
        "zen-border zen-border-zen-border zen-bg-zen-muted zen-cursor-crosshair"
      ), m = `${(e.zoom ?? 1) * 100}%`;
      return i !== t.e && c(o, "aria-label", t.e = i), l !== t.t && E(o, t.t = l), m !== t.a && P(o, "width", t.a = m), t;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    }), r;
  })();
};
fe(["click", "dblclick", "pointerdown", "pointermove", "pointerup", "keydown"]);
export {
  Xe as MediaTimeline
};
//# sourceMappingURL=index27.js.map
