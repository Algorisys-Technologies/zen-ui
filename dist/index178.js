import { access as c } from "./index223.js";
import { mergeProps as M, createUniqueId as E, createEffect as v, createSignal as k, onCleanup as w } from "solid-js";
import { contains as S } from "./index224.js";
import y from "./index225.js";
import { getScrollAtLocation as C } from "./index226.js";
var [x, T] = k([]), D = (l) => x().indexOf(l) === x().length - 1, I = (l) => {
  const o = M({
    element: null,
    enabled: !0,
    hideScrollbar: !0,
    preventScrollbarShift: !0,
    preventScrollbarShiftMode: "padding",
    restoreScrollPosition: !0,
    allowPinchZoom: !1
  }, l), s = E();
  let i = [0, 0], d = null, u = null;
  v(() => {
    c(o.enabled) && (T((e) => [...e, s]), w(() => {
      T((e) => e.filter((t) => t !== s));
    }));
  }), v(() => {
    if (!c(o.enabled) || !c(o.hideScrollbar)) return;
    const {
      body: e
    } = document, t = window.innerWidth - e.offsetWidth;
    if (c(o.preventScrollbarShift)) {
      const n = {
        overflow: "hidden"
      }, r = [];
      t > 0 && (c(o.preventScrollbarShiftMode) === "padding" ? n.paddingRight = `calc(${window.getComputedStyle(e).paddingRight} + ${t}px)` : n.marginRight = `calc(${window.getComputedStyle(e).marginRight} + ${t}px)`, r.push({
        key: "--scrollbar-width",
        value: `${t}px`
      }));
      const a = window.scrollY, f = window.scrollX;
      y({
        key: "prevent-scroll",
        element: e,
        style: n,
        properties: r,
        cleanup: () => {
          c(o.restoreScrollPosition) && t > 0 && window.scrollTo(f, a);
        }
      });
    } else
      y({
        key: "prevent-scroll",
        element: e,
        style: {
          overflow: "hidden"
        }
      });
  }), v(() => {
    !D(s) || !c(o.enabled) || (document.addEventListener("wheel", g, {
      passive: !1
    }), document.addEventListener("touchstart", p, {
      passive: !1
    }), document.addEventListener("touchmove", b, {
      passive: !1
    }), w(() => {
      document.removeEventListener("wheel", g), document.removeEventListener("touchstart", p), document.removeEventListener("touchmove", b);
    }));
  });
  const p = (e) => {
    i = P(e), d = null, u = null;
  }, g = (e) => {
    const t = e.target, n = c(o.element), r = R(e), a = Math.abs(r[0]) > Math.abs(r[1]) ? "x" : "y", f = a === "x" ? r[0] : r[1], m = L(t, a, f, n);
    let h;
    n && S(n, t) ? h = !m : h = !0, h && e.cancelable && e.preventDefault();
  }, b = (e) => {
    const t = c(o.element), n = e.target;
    let r;
    if (e.touches.length === 2)
      r = !c(o.allowPinchZoom);
    else {
      if (d == null || u === null) {
        const a = P(e).map((m, h) => i[h] - m), f = Math.abs(a[0]) > Math.abs(a[1]) ? "x" : "y";
        d = f, u = f === "x" ? a[0] : a[1];
      }
      if (n.type === "range")
        r = !1;
      else {
        const a = L(n, d, u, t);
        t && S(t, n) ? r = !a : r = !0;
      }
    }
    r && e.cancelable && e.preventDefault();
  };
}, R = (l) => [l.deltaX, l.deltaY], P = (l) => l.changedTouches[0] ? [l.changedTouches[0].clientX, l.changedTouches[0].clientY] : [0, 0], L = (l, o, s, i) => {
  const d = i !== null && S(i, l), [u, p] = C(l, o, d ? i : void 0);
  return !(s > 0 && Math.abs(u) <= 1 || s < 0 && Math.abs(p) < 1);
}, W = I, Z = W;
export {
  Z as default
};
//# sourceMappingURL=index178.js.map
