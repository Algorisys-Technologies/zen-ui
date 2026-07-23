import { DATA_TOP_LAYER_ATTR as _ } from "./index178.js";
import { getActiveElement as f, contains as d, focusWithoutScrolling as c, getDocument as j, removeItemFromArray as N, isFocusable as w, visuallyHiddenStyles as D, getAllTabbableIn as x } from "./index163.js";
import { createSignal as V, createEffect as v, onCleanup as E } from "solid-js";
import { isServer as b } from "solid-js/web";
import { access as k } from "./index165.js";
var h = "focusScope.autoFocusOnMount", F = "focusScope.autoFocusOnUnmount", C = {
  bubbles: !1,
  cancelable: !0
}, P = {
  /** A stack of focus scopes, with the active one at the top */
  stack: [],
  active() {
    return this.stack[0];
  },
  add(o) {
    o !== this.active() && this.active()?.pause(), this.stack = N(this.stack, o), this.stack.unshift(o);
  },
  remove(o) {
    this.stack = N(this.stack, o), this.active()?.resume();
  }
};
function q(o, i) {
  const [T, g] = V(!1), A = {
    pause() {
      g(!0);
    },
    resume() {
      g(!1);
    }
  };
  let m = null;
  const S = (e) => o.onMountAutoFocus?.(e), p = (e) => o.onUnmountAutoFocus?.(e), a = () => j(i()), O = () => {
    const e = a().createElement("span");
    return e.setAttribute("data-focus-trap", ""), e.tabIndex = 0, Object.assign(e.style, D), e;
  }, L = () => {
    const e = i();
    return e ? x(e, !0).filter((t) => !t.hasAttribute("data-focus-trap")) : [];
  }, U = () => {
    const e = L();
    return e.length > 0 ? e[0] : null;
  }, y = () => {
    const e = L();
    return e.length > 0 ? e[e.length - 1] : null;
  }, I = () => {
    const e = i();
    if (!e)
      return !1;
    const t = f(e);
    return !t || d(e, t) ? !1 : w(t);
  };
  v(() => {
    if (b)
      return;
    const e = i();
    if (!e)
      return;
    P.add(A);
    const t = f(e);
    if (!d(e, t)) {
      const n = new CustomEvent(h, C);
      e.addEventListener(h, S), e.dispatchEvent(n), n.defaultPrevented || setTimeout(() => {
        c(U()), f(e) === t && c(e);
      }, 0);
    }
    E(() => {
      e.removeEventListener(h, S), setTimeout(() => {
        const n = new CustomEvent(F, C);
        I() && n.preventDefault(), e.addEventListener(F, p), e.dispatchEvent(n), n.defaultPrevented || c(t ?? a().body), e.removeEventListener(F, p), P.remove(A);
      }, 0);
    });
  }), v(() => {
    if (b)
      return;
    const e = i();
    if (!e || !k(o.trapFocus) || T())
      return;
    const t = (n) => {
      const r = n.target;
      r?.closest(`[${_}]`) || (d(e, r) ? m = r : c(m));
    }, s = (n) => {
      const u = n.relatedTarget ?? f(e);
      u?.closest(`[${_}]`) || d(e, u) || c(m);
    };
    a().addEventListener("focusin", t), a().addEventListener("focusout", s), E(() => {
      a().removeEventListener("focusin", t), a().removeEventListener("focusout", s);
    });
  }), v(() => {
    if (b)
      return;
    const e = i();
    if (!e || !k(o.trapFocus) || T())
      return;
    const t = O();
    e.insertAdjacentElement("afterbegin", t);
    const s = O();
    e.insertAdjacentElement("beforeend", s);
    function n(u) {
      const l = U(), M = y();
      u.relatedTarget === l ? c(M) : c(l);
    }
    t.addEventListener("focusin", n), s.addEventListener("focusin", n);
    const r = new MutationObserver((u) => {
      for (const l of u)
        l.previousSibling === s && (s.remove(), e.insertAdjacentElement("beforeend", s)), l.nextSibling === t && (t.remove(), e.insertAdjacentElement("afterbegin", t));
    });
    r.observe(e, {
      childList: !0,
      subtree: !1
    }), E(() => {
      t.removeEventListener("focusin", n), s.removeEventListener("focusin", n), t.remove(), s.remove(), r.disconnect();
    });
  });
}
export {
  q as createFocusScope
};
//# sourceMappingURL=index170.js.map
