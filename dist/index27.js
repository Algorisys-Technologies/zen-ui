import { template as m, spread as ee, mergeProps as ne, insert as c, createComponent as d, setAttribute as g, effect as v, setStyleProperty as $, memo as y, className as C, style as te, use as re, delegateEvents as oe } from "solid-js/web";
import { splitProps as ae, createSignal as A, Show as w, For as B, Index as ie } from "solid-js";
import { cn as x } from "./index106.js";
import "./index25.js";
import { formatMediaTime as le, clampBadgePct as F, dragRangeEdge as K, MIN_MEDIA_RANGE as se } from "./index29.js";
import { Icon as ue } from "./index21.js";
var ce = /* @__PURE__ */ m('<div aria-hidden=true class="zen-absolute zen-inset-0 zen-flex zen-overflow-hidden zen-opacity-60 zen-pointer-events-none">'), ze = /* @__PURE__ */ m('<div class="zen-absolute zen-top-0 zen-h-full zen-w-px zen-bg-zen-foreground zen-pointer-events-none zen-z-10">'), L = /* @__PURE__ */ m('<div class="zen-absolute zen-top-0.5 -zen-translate-x-1/2 zen-whitespace-nowrap zen-rounded-zen-sm zen-bg-zen-foreground zen-px-1.5 zen-text-xs zen-font-mono zen-text-zen-background zen-pointer-events-none zen-z-20">'), de = /* @__PURE__ */ m('<div><div class="zen-w-full zen-overflow-x-auto zen-rounded-zen-md"><div role=group dir=ltr style=min-width:100%>'), ge = /* @__PURE__ */ m('<img alt class="zen-h-full zen-shrink-0 zen-object-cover">'), ve = /* @__PURE__ */ m("<button type=button>"), me = /* @__PURE__ */ m("<div>"), fe = /* @__PURE__ */ m("<div role=slider tabindex=0 aria-orientation=horizontal aria-valuemin=0>");
const ke = (G) => {
  const [e, U] = ae(G, ["duration", "ranges", "activeIndex", "onActiveIndexChange", "onRangesChange", "onRangesInput", "onRangesCommit", "onRangeRemove", "onSeek", "onTrackDblClick", "thumbnails", "currentTime", "zoom", "minRangeDuration", "formatTime", "rangeClass", "label", "class"]);
  let k;
  const [T, M] = A(null), [q, S] = A(null), [_, E] = A(null), D = (r) => (e.formatTime ?? le)(r), I = () => e.minRangeDuration ?? se, h = (r) => r / e.duration * 100, R = (r) => {
    if (!k) return 0;
    const s = k.getBoundingClientRect();
    return Math.max(0, Math.min(1, (r - s.left) / s.width)) * e.duration;
  };
  let b = null, P = !1;
  const J = (r) => (e.onRangesInput ?? e.onRangesChange)?.(r), O = (r, s, t) => {
    t.preventDefault(), t.stopPropagation(), t.target.setPointerCapture(t.pointerId), M({
      index: r,
      edge: s
    }), b = null, e.onActiveIndexChange?.(r);
  }, Q = (r) => {
    const s = T();
    if (!s) {
      E(R(r.clientX));
      return;
    }
    r.preventDefault();
    const {
      ranges: t,
      edgeTime: z
    } = K(e.ranges, s.index, s.edge, R(r.clientX), e.duration, I());
    b = t;
    const n = t[s.index];
    S({
      pct: F(h(z)),
      text: `${D(z)} · ${(n.end - n.start).toFixed(1)}s`
    }), J(t), e.onSeek?.(z);
  }, V = () => {
    T() && (b && (e.onRangesCommit?.(b), P = !0), M(null), S(null), b = null);
  }, W = (r) => {
    if (P) {
      P = !1;
      return;
    }
    e.onSeek?.(R(r.clientX));
  }, Y = (r, s, t) => {
    const z = t.key === "ArrowRight" ? 1 : t.key === "ArrowLeft" ? -1 : 0;
    if (!z) return;
    t.preventDefault();
    const n = e.ranges[r], o = s === "start" ? n.start : n.end, {
      ranges: i
    } = K(e.ranges, r, s, o + z * (t.shiftKey ? 1 : I()), e.duration, I());
    e.onRangesChange?.(i);
  }, Z = (r) => `color-mix(in srgb, var(--zen-color-primary) ${r}%, transparent)`;
  return (() => {
    var r = de(), s = r.firstChild, t = s.firstChild;
    ee(r, ne({
      get class() {
        return x("zen-flex zen-w-full zen-flex-col", e.class);
      }
    }, U), !1, !0), t.addEventListener("pointerleave", () => E(null)), t.$$pointerup = V, t.$$pointermove = Q, t.$$dblclick = (n) => e.onTrackDblClick?.(R(n.clientX)), t.$$click = W;
    var z = k;
    return typeof z == "function" ? re(z, t) : k = t, c(t, d(w, {
      get when() {
        return y(() => !!e.thumbnails)() && e.thumbnails.length > 0;
      },
      get children() {
        var n = ce();
        return c(n, d(B, {
          get each() {
            return e.thumbnails;
          },
          children: (o) => (() => {
            var i = ge();
            return g(i, "src", o), g(i, "draggable", !1), v((f) => $(i, "width", `${100 / (e.thumbnails?.length || 1)}%`)), i;
          })()
        })), n;
      }
    }), null), c(t, d(w, {
      get when() {
        return y(() => e.currentTime !== void 0)() && e.duration > 0;
      },
      get children() {
        var n = ze();
        return v((o) => $(n, "left", `${h(e.currentTime)}%`)), n;
      }
    }), null), c(t, d(w, {
      get when() {
        return y(() => _() !== null)() && !T();
      },
      get children() {
        var n = L();
        return c(n, () => D(_())), v((o) => $(n, "left", `${F(h(_()))}%`)), n;
      }
    }), null), c(t, d(w, {
      get when() {
        return q();
      },
      children: (n) => (() => {
        var o = L();
        return c(o, () => n().text), v((i) => $(o, "left", `${n().pct}%`)), o;
      })()
    }), null), c(t, d(ie, {
      get each() {
        return e.ranges;
      },
      children: (n, o) => {
        const i = () => o === e.activeIndex, f = () => e.rangeClass?.(o, i());
        return (() => {
          var p = me();
          return p.$$click = (a) => {
            a.stopPropagation(), e.onActiveIndexChange?.(o);
          }, c(p, d(B, {
            each: ["start", "end"],
            children: (a) => (() => {
              var u = fe();
              return u.$$keydown = (l) => Y(o, a, l), u.$$pointerdown = (l) => O(o, a, l), g(u, "aria-label", `Range ${o + 1} ${a}`), v((l) => {
                var X = e.duration, H = n()[a], N = D(n()[a]), j = x("zen-absolute zen-top-0 zen-h-full zen-w-3 zen-cursor-ew-resize", "zen-bg-zen-primary hover:zen-opacity-80", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", a === "start" ? "zen-left-0" : "zen-right-0");
                return X !== l.e && g(u, "aria-valuemax", l.e = X), H !== l.t && g(u, "aria-valuenow", l.t = H), N !== l.a && g(u, "aria-valuetext", l.a = N), j !== l.o && C(u, l.o = j), l;
              }, {
                e: void 0,
                t: void 0,
                a: void 0,
                o: void 0
              }), u;
            })()
          }), null), c(p, d(w, {
            get when() {
              return y(() => !!i())() && e.onRangeRemove;
            },
            get children() {
              var a = ve();
              return a.$$click = (u) => {
                u.stopPropagation(), e.onRangeRemove?.(o);
              }, g(a, "aria-label", `Remove range ${o + 1}`), c(a, d(ue, {
                name: "x",
                size: 10
              })), v(() => C(a, x("zen-absolute zen-top-1 zen-left-1/2 -zen-translate-x-1/2 zen-z-10", "zen-flex zen-h-4 zen-w-4 zen-cursor-pointer zen-items-center zen-justify-center", "zen-rounded-zen-full zen-border zen-border-zen-border zen-bg-zen-background zen-p-0", "zen-text-zen-muted-fg hover:zen-border-zen-error hover:zen-bg-zen-error hover:zen-text-zen-error-fg", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"))), a;
            }
          }), null), v((a) => {
            var u = x("zen-absolute zen-top-0 zen-h-full", f() ?? (i() ? "zen-ring-2 zen-ring-zen-primary" : "zen-ring-1 zen-ring-zen-primary")), l = {
              left: `${h(n().start)}%`,
              width: `${h(n().end - n().start)}%`,
              ...f() ? {} : {
                background: Z(i() ? 40 : 20)
              }
            };
            return u !== a.e && C(p, a.e = u), a.t = te(p, l, a.t), a;
          }, {
            e: void 0,
            t: void 0
          }), p;
        })();
      }
    }), null), v((n) => {
      var o = e.label ?? "Media timeline", i = x("zen-relative zen-h-14 zen-select-none zen-overflow-hidden zen-rounded-zen-md", "zen-border zen-border-zen-border zen-bg-zen-muted zen-cursor-crosshair"), f = `${(e.zoom ?? 1) * 100}%`;
      return o !== n.e && g(t, "aria-label", n.e = o), i !== n.t && C(t, n.t = i), f !== n.a && $(t, "width", n.a = f), n;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    }), r;
  })();
};
oe(["click", "dblclick", "pointermove", "pointerup", "pointerdown", "keydown"]);
export {
  ke as MediaTimeline
};
//# sourceMappingURL=index27.js.map
