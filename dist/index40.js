import { template as f, insert as d, createComponent as o, memo as F, effect as z, className as C, setAttribute as s, setStyleProperty as M, delegateEvents as G } from "solid-js/web";
import { createMemo as c, createSignal as _, For as K, Show as k } from "solid-js";
import { cn as D } from "./index103.js";
import { arrowStep as N } from "./index112.js";
import "./index25.js";
var R = /* @__PURE__ */ f("<button type=button role=radio>"), T = /* @__PURE__ */ f("<span aria-hidden=true>"), U = /* @__PURE__ */ f("<input type=hidden>"), Z = /* @__PURE__ */ f("<div role=radiogroup>"), q = /* @__PURE__ */ f('<span class="zen-relative zen-inline-flex zen-p-0.5">'), J = /* @__PURE__ */ f('<span class="zen-absolute zen-inset-y-0 zen-start-0 zen-overflow-hidden zen-text-zen-warning">'), Q = /* @__PURE__ */ f('<span class="zen-relative zen-inline-block zen-shrink-0 zen-text-zen-border">'), W = /* @__PURE__ */ f('<svg viewBox="0 0 24 24"stroke=currentColor stroke-width=1.5 stroke-linecap=round stroke-linejoin=round aria-hidden=true><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2">');
const X = {
  sm: 16,
  md: 24,
  lg: 32
}, Y = {
  sm: "gap-0.5",
  md: "gap-1",
  lg: "gap-1.5"
}, ae = (n) => {
  const a = c(() => n.max ?? 5), r = c(() => n.size ?? "md"), u = c(() => n.allowClear ?? !0), v = () => n.value !== void 0, [y, L] = _(n.defaultValue ?? 0), i = c(() => v() ? n.value : y()), [O, $] = _(0), V = c(() => O() || i()), h = c(() => !n.disabled && !n.readOnly), x = c(() => n.allowHalf ? 0.5 : 1), m = (t) => {
    const e = Math.max(0, Math.min(a(), t));
    v() || L(e), n.onValueChange?.(e);
  }, I = (t) => {
    if (!h()) return;
    const e = N(t.key, t.currentTarget);
    e === 1 || t.key === "ArrowUp" ? (t.preventDefault(), m(Math.min(a(), i() + x()))) : e === -1 || t.key === "ArrowDown" ? (t.preventDefault(), m(Math.max(0, i() - x()))) : t.key === "Home" ? (t.preventDefault(), m(x())) : t.key === "End" && (t.preventDefault(), m(a()));
  }, B = c(() => Array.from({
    length: a()
  }, (t, e) => e + 1)), P = (t) => Math.max(0, Math.min(1, V() - (t - 1))), j = (t) => `${t} ${t === 1 ? "star" : "stars"}`, S = (t) => (() => {
    var e = R();
    return e.addEventListener("focus", () => h() && $(0)), e.addEventListener("mouseleave", () => h() && $(0)), e.addEventListener("mouseenter", () => h() && $(t.s)), e.$$click = () => {
      h() && (u() && i() === t.s ? m(0) : m(t.s));
    }, z((l) => {
      var g = i() === t.s, w = j(t.s), b = n.disabled, E = i() === t.s || i() === 0 && t.s === x() ? 0 : -1, A = D("zen-absolute zen-inset-y-0 zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-0", "zen-rounded-zen-sm", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", (n.disabled || n.readOnly) && "zen-cursor-default", t.half === "left" && "zen-left-0 zen-w-1/2", t.half === "right" && "zen-right-0 zen-w-1/2", !t.half && "zen-inset-x-0");
      return g !== l.e && s(e, "aria-checked", l.e = g), w !== l.t && s(e, "aria-label", l.t = w), b !== l.a && (e.disabled = l.a = b), E !== l.o && s(e, "tabindex", l.o = E), A !== l.i && C(e, l.i = A), l;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0
    }), e;
  })();
  return (() => {
    var t = Z();
    return t.$$keydown = I, d(t, o(K, {
      get each() {
        return B();
      },
      children: (e) => (
        // The star is drawn once and the options sit over it, rather than
        // each option drawing half a star: two clipped halves side by side
        // seam visibly down the middle of every star.
        (() => {
          var l = q();
          return d(l, o(p, {
            get size() {
              return X[r()];
            },
            get fill() {
              return P(e);
            }
          }), null), d(l, o(k, {
            get when() {
              return n.allowHalf;
            },
            get fallback() {
              return o(S, {
                s: e
              });
            },
            get children() {
              return [o(S, {
                s: e - 0.5,
                half: "left"
              }), o(S, {
                s: e,
                half: "right"
              })];
            }
          }), null), l;
        })()
      )
    }), null), d(t, o(k, {
      get when() {
        return n.showValue;
      },
      get children() {
        var e = T();
        return d(e, (() => {
          var l = F(() => i() > 0);
          return () => l() ? `${i()} / ${a()}` : "—";
        })()), z(() => C(e, D("zen-ml-1 zen-text-sm zen-font-medium zen-tabular-nums", i() > 0 ? "zen-text-zen-foreground" : "zen-text-zen-muted-fg"))), e;
      }
    }), null), d(t, o(k, {
      get when() {
        return n.name;
      },
      get children() {
        var e = U();
        return z(() => s(e, "name", n.name)), z(() => e.value = i()), e;
      }
    }), null), z((e) => {
      var l = n.label, g = n.disabled || void 0, w = n.readOnly || void 0, b = D("zen-inline-flex zen-items-center", Y[r()], n.disabled && "zen-opacity-50 zen-cursor-not-allowed", n.class);
      return l !== e.e && s(t, "aria-label", e.e = l), g !== e.t && s(t, "aria-disabled", e.t = g), w !== e.a && s(t, "aria-readonly", e.a = w), b !== e.o && C(t, e.o = b), e;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0
    }), t;
  })();
}, p = (n) => (() => {
  var a = Q();
  return d(a, o(H, {
    get size() {
      return n.size;
    },
    filled: !1
  }), null), d(a, o(k, {
    get when() {
      return n.fill > 0;
    },
    get children() {
      var r = J();
      return d(r, o(H, {
        get size() {
          return n.size;
        },
        filled: !0
      })), z((u) => M(r, "width", `${n.fill * 100}%`)), r;
    }
  }), null), z((r) => {
    var u = `${n.size}px`, v = `${n.size}px`;
    return u !== r.e && M(a, "width", r.e = u), v !== r.t && M(a, "height", r.t = v), r;
  }, {
    e: void 0,
    t: void 0
  }), a;
})(), H = (n) => (() => {
  var a = W();
  return z((r) => {
    var u = n.size, v = n.size, y = n.filled ? "currentColor" : "none";
    return u !== r.e && s(a, "width", r.e = u), v !== r.t && s(a, "height", r.t = v), y !== r.a && s(a, "fill", r.a = y), r;
  }, {
    e: void 0,
    t: void 0,
    a: void 0
  }), a;
})();
G(["click", "keydown"]);
export {
  ae as Rating
};
//# sourceMappingURL=index40.js.map
