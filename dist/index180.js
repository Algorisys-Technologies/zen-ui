import { DATA_TOP_LAYER_ATTR as p } from "./index178.js";
import { getDocument as L, noop as g, composeEventHandlers as v, isCtrlKey as I, contains as m } from "./index163.js";
import { createEffect as _, onCleanup as h } from "solid-js";
import { isServer as C } from "solid-js/web";
import { access as P } from "./index165.js";
var O = "interactOutside.pointerDownOutside", w = "interactOutside.focusOutside";
function S(o, s) {
  let u, a = g;
  const n = () => L(s()), D = (e) => o.onPointerDownOutside?.(e), T = (e) => o.onFocusOutside?.(e), d = (e) => o.onInteractOutside?.(e), l = (e) => {
    const t = e.target;
    return !(t instanceof Element) || t.closest(`[${p}]`) || !m(n(), t) || m(s(), t) ? !1 : !o.shouldExcludeElement?.(t);
  }, E = (e) => {
    function t() {
      const r = s(), i = e.target;
      if (!r || !i || !l(e))
        return;
      const c = v([D, d]);
      i.addEventListener(O, c, {
        once: !0
      });
      const b = new CustomEvent(O, {
        bubbles: !1,
        cancelable: !0,
        detail: {
          originalEvent: e,
          isContextMenu: e.button === 2 || I(e) && e.button === 0
        }
      });
      i.dispatchEvent(b);
    }
    e.pointerType === "touch" ? (n().removeEventListener("click", t), a = t, n().addEventListener("click", t, {
      once: !0
    })) : t();
  }, f = (e) => {
    const t = s(), r = e.target;
    if (!t || !r || !l(e))
      return;
    const i = v([T, d]);
    r.addEventListener(w, i, {
      once: !0
    });
    const c = new CustomEvent(w, {
      bubbles: !1,
      cancelable: !0,
      detail: {
        originalEvent: e,
        isContextMenu: !1
      }
    });
    r.dispatchEvent(c);
  };
  _(() => {
    C || P(o.isDisabled) || (u = window.setTimeout(() => {
      n().addEventListener("pointerdown", E, !0);
    }, 0), n().addEventListener("focusin", f, !0), h(() => {
      window.clearTimeout(u), n().removeEventListener("click", a), n().removeEventListener("pointerdown", E, !0), n().removeEventListener("focusin", f, !0);
    }));
  });
}
export {
  S as createInteractOutside
};
//# sourceMappingURL=index180.js.map
