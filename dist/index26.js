import { template as M, spread as N, mergeProps as W, insert as v, createComponent as z, memo as S, effect as $, setAttribute as p, setStyleProperty as F, className as D, use as G, delegateEvents as H } from "solid-js/web";
import { splitProps as K, children as O, createMemo as _, createSignal as q, Show as A, For as E } from "solid-js";
import { cn as C } from "./index103.js";
import { directionOf as B, arrowStep as J } from "./index112.js";
import "./index25.js";
import { Icon as Q } from "./index21.js";
var R = /* @__PURE__ */ M('<div class="zen-flex zen-justify-center zen-gap-1.5">'), U = /* @__PURE__ */ M('<div role=group aria-roledescription=carousel><div class="zen-relative zen-flex zen-items-center zen-gap-2"><div tabindex=0>'), X = /* @__PURE__ */ M('<div role=group aria-roledescription=slide class="zen-shrink-0 zen-snap-start">'), T = /* @__PURE__ */ M("<button type=button>");
const oe = (f) => {
  const [r, o] = K(f, ["label", "arrows", "dots", "perView", "class", "children"]), w = O(() => r.children), b = _(() => w.toArray()), d = _(() => b().length), i = () => r.perView ?? 1, x = _(() => Math.max(0, d() - i()));
  let l;
  const [s, V] = q(0), g = (e) => {
    if (!l) return;
    const u = Math.max(0, Math.min(x(), e)), a = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches, y = B(l) === "rtl" ? -1 : 1;
    l.scrollTo({
      left: y * u * (l.clientWidth / i()),
      behavior: a ? "auto" : "smooth"
    });
  }, j = () => {
    if (!l) return;
    const e = l.clientWidth / i();
    e > 0 && V(Math.round(Math.abs(l.scrollLeft) / e));
  }, L = (e) => {
    const u = J(e.key, e.currentTarget);
    u ? (e.preventDefault(), g(s() + u)) : e.key === "Home" ? (e.preventDefault(), g(0)) : e.key === "End" && (e.preventDefault(), g(x()));
  };
  return (() => {
    var e = U(), u = e.firstChild, a = u.firstChild;
    N(e, W({
      get "aria-label"() {
        return r.label ?? "Carousel";
      },
      get class() {
        return C("zen-relative zen-flex zen-flex-col zen-gap-2", r.class);
      }
    }, o), !1, !0), v(u, z(A, {
      get when() {
        return S(() => !!(r.arrows ?? !0))() && d() > i();
      },
      get children() {
        return z(I, {
          dir: "prev",
          get disabled() {
            return s() <= 0;
          },
          onClick: () => g(s() - 1)
        });
      }
    }), a), a.$$keydown = L, a.addEventListener("scroll", j);
    var y = l;
    return typeof y == "function" ? G(y, a) : l = a, v(a, z(E, {
      get each() {
        return b();
      },
      children: (k, c) => (() => {
        var n = X();
        return v(n, k), $((t) => {
          var h = `${c() + 1} of ${d()}`, m = c() < s() || c() >= s() + i() || void 0, P = `calc((100% - ${(i() - 1) * 0.75}rem) / ${i()})`;
          return h !== t.e && p(n, "aria-label", t.e = h), m !== t.t && p(n, "aria-hidden", t.t = m), P !== t.a && F(n, "width", t.a = P), t;
        }, {
          e: void 0,
          t: void 0,
          a: void 0
        }), n;
      })()
    })), v(u, z(A, {
      get when() {
        return S(() => !!(r.arrows ?? !0))() && d() > i();
      },
      get children() {
        return z(I, {
          dir: "next",
          get disabled() {
            return s() >= x();
          },
          onClick: () => g(s() + 1)
        });
      }
    }), null), v(e, z(A, {
      get when() {
        return S(() => !!(r.dots ?? !0))() && d() > i();
      },
      get children() {
        var k = R();
        return v(k, z(E, {
          get each() {
            return Array.from({
              length: x() + 1
            }, (c, n) => n);
          },
          children: (c) => (() => {
            var n = T();
            return n.$$click = () => g(c), p(n, "aria-label", `Go to slide ${c + 1}`), $((t) => {
              var h = c === s() || void 0, m = C("zen-h-2 zen-w-2 zen-cursor-pointer zen-rounded-zen-full zen-border-0 zen-p-0", "zen-transition-colors", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2", c === s() ? "zen-bg-zen-primary" : "zen-bg-zen-border hover:zen-bg-zen-muted-fg");
              return h !== t.e && p(n, "aria-current", t.e = h), m !== t.t && D(n, t.t = m), t;
            }, {
              e: void 0,
              t: void 0
            }), n;
          })()
        })), k;
      }
    }), null), $(() => D(a, C(
      "zen-flex zen-min-w-0 zen-flex-1 zen-gap-3 zen-overflow-x-auto",
      "zen-snap-x zen-snap-mandatory",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2 zen-rounded-zen-md",
      // The scroller IS the control, so its scrollbar is chrome.
      "zen-[scrollbar-width:none]"
    ))), e;
  })();
}, I = (f) => (() => {
  var r = T();
  return r.$$click = () => f.onClick(), v(r, z(Q, {
    get name() {
      return f.dir === "prev" ? "chevron-left" : "chevron-right";
    },
    size: 16
  })), $((o) => {
    var w = f.disabled, b = f.dir === "prev" ? "Previous slide" : "Next slide", d = C("zen-inline-flex zen-h-8 zen-w-8 zen-shrink-0 zen-items-center zen-justify-center", "zen-cursor-pointer zen-rounded-zen-full zen-border zen-border-zen-border zen-bg-zen-background", "zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", "disabled:zen-cursor-not-allowed disabled:zen-opacity-40 disabled:hover:zen-bg-zen-background");
    return w !== o.e && (r.disabled = o.e = w), b !== o.t && p(r, "aria-label", o.t = b), d !== o.a && D(r, o.a = d), o;
  }, {
    e: void 0,
    t: void 0,
    a: void 0
  }), r;
})();
H(["keydown", "click"]);
export {
  oe as Carousel
};
//# sourceMappingURL=index26.js.map
