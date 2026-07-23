import { template as v, spread as j, mergeProps as H, insert as S, createComponent as I, effect as P, setAttribute as a, className as B, setStyleProperty as F, delegateEvents as K } from "solid-js/web";
import { splitProps as L, createMemo as u, createSignal as N, For as O, Show as T } from "solid-js";
import { cn as V } from "./index103.js";
import { arrowStep as U } from "./index112.js";
import { toColorOption as Z, normalizeHex as s, contrastingInk as q, colorLabel as A } from "./index116.js";
import "./index25.js";
var G = /* @__PURE__ */ v("<div role=radiogroup>"), J = /* @__PURE__ */ v('<svg width=12 height=12 viewBox="0 0 24 24"fill=none stroke-width=3 stroke-linecap=round stroke-linejoin=round aria-hidden=true><polyline points="20 6 9 17 4 12">'), Q = /* @__PURE__ */ v("<button type=button role=radio>");
const R = {
  sm: "zen-h-6 zen-w-6",
  md: "zen-h-8 zen-w-8",
  lg: "zen-h-10 zen-w-10"
}, te = (f) => {
  const [t, D] = L(f, ["colors", "value", "defaultValue", "onValueChange", "label", "size", "disabled", "class"]), c = u(() => t.colors.map(Z)), [E, M] = N(s(f.defaultValue ?? "") ?? ""), m = () => t.value !== void 0, z = u(() => m() ? s(t.value) ?? "" : E()), b = (n) => {
    const r = s(n) ?? n;
    m() || M(r), t.onValueChange?.(r);
  }, g = u(() => c().findIndex((n) => s(n.value) === z())), $ = (n) => {
    if (t.disabled) return;
    const r = c(), d = r.length - 1, i = g(), l = (e) => {
      n.preventDefault(), b(r[Math.max(0, Math.min(d, e))].value);
    }, o = U(n.key, n.currentTarget);
    o === 1 || n.key === "ArrowDown" ? l(i < 0 ? 0 : i + 1) : o === -1 || n.key === "ArrowUp" ? l(i < 0 ? 0 : i - 1) : n.key === "Home" ? l(0) : n.key === "End" && l(d);
  };
  return (() => {
    var n = G();
    return n.$$keydown = $, j(n, H({
      get "aria-label"() {
        return t.label;
      },
      get "aria-disabled"() {
        return t.disabled || void 0;
      },
      get class() {
        return V("zen-flex zen-flex-wrap zen-gap-1.5", t.disabled && "zen-opacity-50", t.class);
      }
    }, D), !1, !0), S(n, I(O, {
      get each() {
        return c();
      },
      children: (r, d) => {
        const i = () => s(r.value) ?? r.value, l = () => i() === z();
        return (() => {
          var o = Q();
          return o.$$click = () => !t.disabled && b(r.value), S(o, I(T, {
            get when() {
              return l();
            },
            get children() {
              var e = J();
              return P(() => a(e, "stroke", q(i()))), e;
            }
          })), P((e) => {
            var p = l(), h = A(r), w = A(r), k = t.disabled, y = l() || g() < 0 && d() === 0 ? 0 : -1, x = V("zen-inline-flex zen-items-center zen-justify-center zen-rounded-zen-sm", "zen-cursor-pointer zen-border zen-border-zen-border zen-p-0 zen-transition-transform", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2", t.disabled && "zen-cursor-not-allowed", R[t.size ?? "md"]), C = i();
            return p !== e.e && a(o, "aria-checked", e.e = p), h !== e.t && a(o, "aria-label", e.t = h), w !== e.a && a(o, "title", e.a = w), k !== e.o && (o.disabled = e.o = k), y !== e.i && a(o, "tabindex", e.i = y), x !== e.n && B(o, e.n = x), C !== e.s && F(o, "background-color", e.s = C), e;
          }, {
            e: void 0,
            t: void 0,
            a: void 0,
            o: void 0,
            i: void 0,
            n: void 0,
            s: void 0
          }), o;
        })();
      }
    })), n;
  })();
};
K(["keydown", "click"]);
export {
  te as ColorPalette
};
//# sourceMappingURL=index23.js.map
