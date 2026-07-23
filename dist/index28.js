import { template as p, spread as re, mergeProps as ie, insert as v, createComponent as x, setAttribute as u, effect as f, className as B, style as oe, setStyleProperty as M, memo as K, use as le, delegateEvents as ae } from "solid-js/web";
import { splitProps as se, createSignal as E, createMemo as ue, Show as _, For as ce } from "solid-js";
import { cn as I } from "./index106.js";
import "./index25.js";
import { waveformPath as de, MIN_MEDIA_RANGE as ve, formatMediaTime as fe, clampBadgePct as U, moveClip as V, dragClipEdge as W } from "./index29.js";
var pe = /* @__PURE__ */ p('<div role=slider tabindex=0 aria-orientation=horizontal aria-label="Clip position"aria-valuemin=0><svg aria-hidden=true class="zen-absolute zen-inset-0 zen-h-full zen-w-full zen-text-zen-primary zen-pointer-events-none"preserveAspectRatio=none><path fill=currentColor fill-opacity=0.7>'), ze = /* @__PURE__ */ p('<div class="zen-absolute zen-top-0 zen-h-full zen-w-px zen-bg-zen-foreground zen-pointer-events-none zen-z-10">'), j = /* @__PURE__ */ p('<div class="zen-absolute zen-top-0.5 -zen-translate-x-1/2 zen-whitespace-nowrap zen-rounded-zen-sm zen-bg-zen-foreground zen-px-1.5 zen-text-xs zen-font-mono zen-text-zen-background zen-pointer-events-none zen-z-20">'), me = /* @__PURE__ */ p('<div><div class="zen-w-full zen-overflow-x-auto zen-rounded-zen-md"><div role=group dir=ltr style=min-width:100%>'), ge = /* @__PURE__ */ p('<svg aria-hidden=true class="zen-absolute zen-inset-0 zen-h-full zen-w-full zen-text-zen-primary zen-pointer-events-none"preserveAspectRatio=none><path fill=currentColor fill-opacity=0.7>'), he = /* @__PURE__ */ p("<div role=slider tabindex=0 aria-orientation=horizontal>");
const De = (q) => {
  const [n, J] = se(q, ["peaks", "duration", "audioDuration", "clip", "onClipChange", "onClipInput", "onClipCommit", "onSeek", "currentTime", "zoom", "minClipDuration", "formatTime", "clipClass", "label", "class"]);
  let D;
  const [k, L] = E(null), [O, S] = E(null), [R, X] = E(null), y = (r) => (n.formatTime ?? fe)(r), z = () => n.minClipDuration ?? ve, m = () => n.audioDuration ?? n.duration, g = (r) => r / n.duration * 100, T = (r) => {
    if (!D) return 0;
    const i = D.getBoundingClientRect();
    return Math.max(0, Math.min(1, (r - i.left) / i.width)) * n.duration;
  }, N = ue(() => de(n.peaks)), Q = () => {
    const r = n.peaks.length, i = n.clip, o = i.start / m() * r, d = (i.end - i.start) / m() * r;
    return `${o} 0 ${d} 2`;
  };
  let h = null, F = 0, P = !1;
  const Y = (r) => (n.onClipInput ?? n.onClipChange)?.(r), G = (r, i) => {
    i.preventDefault(), i.stopPropagation(), i.target.setPointerCapture(i.pointerId), r === "move" && (F = T(i.clientX) - n.clip.offset), L(r), h = null;
  }, Z = (r) => {
    const i = k();
    if (!i) {
      X(T(r.clientX));
      return;
    }
    r.preventDefault();
    const o = T(r.clientX), d = n.clip;
    let e, l;
    i === "move" ? (e = V(d, o - F, n.duration), l = e.offset) : (e = W(d, i, o, {
      audioDuration: m(),
      laneDuration: n.duration,
      minDuration: z()
    }), l = i === "start" ? e.offset : e.offset + (e.end - e.start)), h = e, S({
      pct: U(g(l)),
      text: `${y(l)} · ${(e.end - e.start).toFixed(1)}s`
    }), Y(e);
  }, ee = () => {
    k() && (h && (n.onClipCommit?.(h), P = !0), L(null), S(null), h = null);
  }, ne = (r) => {
    if (P) {
      P = !1;
      return;
    }
    n.onSeek?.(T(r.clientX));
  }, H = (r, i) => {
    const o = i.key === "ArrowRight" ? 1 : i.key === "ArrowLeft" ? -1 : 0;
    if (!o) return;
    i.preventDefault();
    const d = o * (i.shiftKey ? 1 : z()), e = n.clip, l = r === "move" ? V(e, e.offset + d, n.duration) : W(e, r, (r === "start" ? e.offset : e.offset + (e.end - e.start)) + d, {
      audioDuration: m(),
      laneDuration: n.duration,
      minDuration: z()
    });
    n.onClipChange?.(l);
  }, te = (r) => `color-mix(in srgb, var(--zen-color-primary) ${r}%, transparent)`;
  return (() => {
    var r = me(), i = r.firstChild, o = i.firstChild;
    re(r, ie({
      get class() {
        return I("zen-flex zen-w-full zen-flex-col", n.class);
      }
    }, J), !1, !0), o.addEventListener("pointerleave", () => X(null)), o.$$pointerup = ee, o.$$pointermove = Z, o.$$pointerdown = () => P = !1, o.$$click = ne;
    var d = D;
    return typeof d == "function" ? le(d, o) : D = o, v(o, x(_, {
      get when() {
        return n.clip !== void 0;
      },
      get fallback() {
        return (() => {
          var e = ge(), l = e.firstChild;
          return f((c) => {
            var t = `0 0 ${Math.max(1, n.peaks.length)} 2`, s = N();
            return t !== c.e && u(e, "viewBox", c.e = t), s !== c.t && u(l, "d", c.t = s), c;
          }, {
            e: void 0,
            t: void 0
          }), e;
        })();
      },
      get children() {
        var e = pe(), l = e.firstChild, c = l.firstChild;
        return e.$$keydown = (t) => H("move", t), e.$$pointerdown = (t) => G("move", t), e.$$click = (t) => t.stopPropagation(), v(e, x(ce, {
          each: ["start", "end"],
          children: (t) => (() => {
            var s = he();
            return s.$$keydown = (a) => H(t, a), s.$$pointerdown = (a) => G(t, a), u(s, "aria-label", `Clip trim ${t}`), f((a) => {
              var w = t === "start" ? 0 : n.clip.start + z(), $ = t === "start" ? n.clip.end - z() : m(), A = n.clip[t], b = y(n.clip[t]), C = I("zen-absolute zen-top-0 zen-h-full zen-w-2 zen-cursor-ew-resize", "zen-bg-zen-primary hover:zen-opacity-80", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", t === "start" ? "zen-left-0" : "zen-right-0");
              return w !== a.e && u(s, "aria-valuemin", a.e = w), $ !== a.t && u(s, "aria-valuemax", a.t = $), A !== a.a && u(s, "aria-valuenow", a.a = A), b !== a.o && u(s, "aria-valuetext", a.o = b), C !== a.i && B(s, a.i = C), a;
            }, {
              e: void 0,
              t: void 0,
              a: void 0,
              o: void 0,
              i: void 0
            }), s;
          })()
        }), null), f((t) => {
          var s = n.duration - (n.clip.end - n.clip.start), a = n.clip.offset, w = y(n.clip.offset), $ = I("zen-absolute zen-top-0 zen-h-full", k() === "move" ? "zen-cursor-grabbing" : "zen-cursor-grab", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", n.clipClass ?? "zen-ring-1 zen-ring-zen-primary"), A = {
            left: `${g(n.clip.offset)}%`,
            width: `${g(n.clip.end - n.clip.start)}%`,
            ...n.clipClass ? {} : {
              background: te(25)
            }
          }, b = Q(), C = N();
          return s !== t.e && u(e, "aria-valuemax", t.e = s), a !== t.t && u(e, "aria-valuenow", t.t = a), w !== t.a && u(e, "aria-valuetext", t.a = w), $ !== t.o && B(e, t.o = $), t.i = oe(e, A, t.i), b !== t.n && u(l, "viewBox", t.n = b), C !== t.s && u(c, "d", t.s = C), t;
        }, {
          e: void 0,
          t: void 0,
          a: void 0,
          o: void 0,
          i: void 0,
          n: void 0,
          s: void 0
        }), e;
      }
    }), null), v(o, x(_, {
      get when() {
        return K(() => n.currentTime !== void 0)() && n.duration > 0;
      },
      get children() {
        var e = ze();
        return f((l) => M(e, "left", `${g(n.currentTime)}%`)), e;
      }
    }), null), v(o, x(_, {
      get when() {
        return K(() => R() !== null)() && !k();
      },
      get children() {
        var e = j();
        return v(e, () => y(R())), f((l) => M(e, "left", `${U(g(R()))}%`)), e;
      }
    }), null), v(o, x(_, {
      get when() {
        return O();
      },
      children: (e) => (() => {
        var l = j();
        return v(l, () => e().text), f((c) => M(l, "left", `${e().pct}%`)), l;
      })()
    }), null), f((e) => {
      var l = n.label ?? "Audio waveform", c = I("zen-relative zen-h-12 zen-select-none zen-overflow-hidden zen-rounded-zen-md", "zen-border zen-border-zen-border zen-bg-zen-muted zen-cursor-crosshair"), t = `${(n.zoom ?? 1) * 100}%`;
      return l !== e.e && u(o, "aria-label", e.e = l), c !== e.t && B(o, e.t = c), t !== e.a && M(o, "width", e.a = t), e;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    }), r;
  })();
};
ae(["click", "pointerdown", "pointermove", "pointerup", "keydown"]);
export {
  De as Waveform
};
//# sourceMappingURL=index28.js.map
