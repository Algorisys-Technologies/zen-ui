import * as d from "react";
import { useComposedRefs as P } from "./index192.js";
import { Primitive as R } from "./index201.js";
import { useCallbackRef as S } from "./index207.js";
import { jsx as M } from "react/jsx-runtime";
var h = "focusScope.autoFocusOnMount", F = "focusScope.autoFocusOnUnmount", T = { bubbles: !1, cancelable: !0 }, _ = "FocusScope", K = d.forwardRef((e, t) => {
  const {
    loop: n = !1,
    trapped: s = !1,
    onMountAutoFocus: p,
    onUnmountAutoFocus: I,
    ...L
  } = e, [o, U] = d.useState(null), E = S(p), v = S(I), b = d.useRef(null), g = P(t, U), a = d.useRef({
    paused: !1,
    pause() {
      this.paused = !0;
    },
    resume() {
      this.paused = !1;
    }
  }).current;
  d.useEffect(() => {
    if (s) {
      let u = function(r) {
        if (a.paused || !o) return;
        const i = r.target;
        o.contains(i) ? b.current = i : f(b.current, { select: !0 });
      }, l = function(r) {
        if (a.paused || !o) return;
        const i = r.relatedTarget;
        i !== null && (o.contains(i) || f(b.current, { select: !0 }));
      }, c = function(r) {
        if (document.activeElement === document.body)
          for (const y of r)
            y.removedNodes.length > 0 && f(o);
      };
      document.addEventListener("focusin", u), document.addEventListener("focusout", l);
      const m = new MutationObserver(c);
      return o && m.observe(o, { childList: !0, subtree: !0 }), () => {
        document.removeEventListener("focusin", u), document.removeEventListener("focusout", l), m.disconnect();
      };
    }
  }, [s, o, a.paused]), d.useEffect(() => {
    if (o) {
      C.add(a);
      const u = document.activeElement;
      if (!o.contains(u)) {
        const c = new CustomEvent(h, T);
        o.addEventListener(h, E), o.dispatchEvent(c), c.defaultPrevented || (w(W(k(o)), { select: !0 }), document.activeElement === u && f(o));
      }
      return () => {
        o.removeEventListener(h, E), setTimeout(() => {
          const c = new CustomEvent(F, T);
          o.addEventListener(F, v), o.dispatchEvent(c), c.defaultPrevented || f(u ?? document.body, { select: !0 }), o.removeEventListener(F, v), C.remove(a);
        }, 0);
      };
    }
  }, [o, E, v, a]);
  const A = d.useCallback(
    (u) => {
      if (!n && !s || a.paused) return;
      const l = u.key === "Tab" && !u.altKey && !u.ctrlKey && !u.metaKey, c = document.activeElement;
      if (l && c) {
        const m = u.currentTarget, [r, i] = V(m);
        r && i ? !u.shiftKey && c === i ? (u.preventDefault(), n && f(r, { select: !0 })) : u.shiftKey && c === r && (u.preventDefault(), n && f(i, { select: !0 })) : c === m && u.preventDefault();
      }
    },
    [n, s, a.paused]
  );
  return /* @__PURE__ */ M(R.div, { tabIndex: -1, ...L, ref: g, onKeyDown: A });
});
K.displayName = _;
function w(e, { select: t = !1 } = {}) {
  const n = document.activeElement;
  for (const s of e)
    if (f(s, { select: t }), document.activeElement !== n) return;
}
function V(e) {
  const t = k(e), n = N(t, e), s = N(t.reverse(), e);
  return [n, s];
}
function k(e) {
  const t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (s) => {
      const p = s.tagName === "INPUT" && s.type === "hidden";
      return s.disabled || s.hidden || p ? NodeFilter.FILTER_SKIP : s.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  for (; n.nextNode(); ) t.push(n.currentNode);
  return t;
}
function N(e, t) {
  const n = typeof t.checkVisibility == "function" && t.checkVisibility({ checkVisibilityCSS: !0 });
  for (const s of e)
    if (!(n ? !s.checkVisibility({ checkVisibilityCSS: !0 }) : x(s, { upTo: t })))
      return s;
}
function x(e, { upTo: t }) {
  if (getComputedStyle(e).visibility === "hidden") return !0;
  for (; e; ) {
    if (t !== void 0 && e === t) return !1;
    if (getComputedStyle(e).display === "none") return !0;
    e = e.parentElement;
  }
  return !1;
}
function D(e) {
  return e instanceof HTMLInputElement && "select" in e;
}
function f(e, { select: t = !1 } = {}) {
  if (e && e.focus) {
    const n = document.activeElement;
    e.focus({ preventScroll: !0 }), e !== n && D(e) && t && e.select();
  }
}
var C = H();
function H() {
  let e = [];
  return {
    add(t) {
      const n = e[0];
      t !== n && n?.pause(), e = O(e, t), e.unshift(t);
    },
    remove(t) {
      e = O(e, t), e[0]?.resume();
    }
  };
}
function O(e, t) {
  const n = [...e], s = n.indexOf(t);
  return s !== -1 && n.splice(s, 1), n;
}
function W(e) {
  return e.filter((t) => t.tagName !== "A");
}
export {
  K as FocusScope
};
//# sourceMappingURL=index196.js.map
