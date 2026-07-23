import { mergeProps as x } from "solid-js";
function Z(t, e, n = -1) {
  return n in t ? [...t.slice(0, n), e, ...t.slice(n)] : [...t, e];
}
function K(t, e) {
  const n = [...t], o = n.indexOf(e);
  return o !== -1 && n.splice(o, 1), n;
}
function tt(t) {
  return typeof t == "number";
}
function et(t) {
  return Object.prototype.toString.call(t) === "[object String]";
}
function D(t) {
  return typeof t == "function";
}
function nt(t) {
  return (e) => `${t()}-${e}`;
}
function ot(t, e) {
  return t ? t === e || t.contains(e) : !1;
}
function C(t, e = !1) {
  const { activeElement: n } = g(t);
  if (!n?.nodeName)
    return null;
  if (I(n) && n.contentDocument)
    return C(
      n.contentDocument.body,
      e
    );
  if (e) {
    const o = n.getAttribute("aria-activedescendant");
    if (o) {
      const r = g(n).getElementById(o);
      if (r)
        return r;
    }
  }
  return n;
}
function rt(t) {
  return g(t).defaultView || window;
}
function g(t) {
  return t ? t.ownerDocument || t : document;
}
function I(t) {
  return t.tagName === "IFRAME";
}
var F = /* @__PURE__ */ ((t) => (t.Escape = "Escape", t.Enter = "Enter", t.Tab = "Tab", t.Space = " ", t.ArrowDown = "ArrowDown", t.ArrowLeft = "ArrowLeft", t.ArrowRight = "ArrowRight", t.ArrowUp = "ArrowUp", t.End = "End", t.Home = "Home", t.PageDown = "PageDown", t.PageUp = "PageUp", t))(F || {});
function P(t) {
  return typeof window > "u" || window.navigator == null ? !1 : (
    // @ts-ignore
    window.navigator.userAgentData?.brands.some(
      (e) => t.test(e.brand)
    ) || t.test(window.navigator.userAgent)
  );
}
function w(t) {
  return typeof window < "u" && window.navigator != null ? t.test(
    // @ts-ignore
    window.navigator.userAgentData?.platform || window.navigator.platform
  ) : !1;
}
function h() {
  return w(/^Mac/i);
}
function H() {
  return w(/^iPhone/i);
}
function R() {
  return w(/^iPad/i) || // iPadOS 13 lies and says it's a Mac, but we can distinguish by detecting touch support.
  h() && navigator.maxTouchPoints > 1;
}
function O() {
  return H() || R();
}
function it() {
  return h() || O();
}
function st() {
  return P(/AppleWebKit/i) && !W();
}
function W() {
  return P(/Chrome/i);
}
function V(t, e) {
  return e && (D(e) ? e(t) : e[0](e[1], t)), t?.defaultPrevented;
}
function ct(t) {
  return (e) => {
    for (const n of t)
      V(e, n);
  };
}
function lt(t) {
  return h() ? t.metaKey && !t.ctrlKey : t.ctrlKey && !t.metaKey;
}
function ft(t) {
  if (t)
    if (_())
      t.focus({ preventScroll: !0 });
    else {
      const e = B(t);
      t.focus(), j(e);
    }
}
var p = null;
function _() {
  if (p == null) {
    p = !1;
    try {
      document.createElement("div").focus({
        get preventScroll() {
          return p = !0, !0;
        }
      });
    } catch {
    }
  }
  return p;
}
function B(t) {
  let e = t.parentNode;
  const n = [], o = document.scrollingElement || document.documentElement;
  for (; e instanceof HTMLElement && e !== o; )
    (e.offsetHeight < e.scrollHeight || e.offsetWidth < e.scrollWidth) && n.push({
      element: e,
      scrollTop: e.scrollTop,
      scrollLeft: e.scrollLeft
    }), e = e.parentNode;
  return o instanceof HTMLElement && n.push({
    element: o,
    scrollTop: o.scrollTop,
    scrollLeft: o.scrollLeft
  }), n;
}
function j(t) {
  for (const { element: e, scrollTop: n, scrollLeft: o } of t)
    e.scrollTop = n, e.scrollLeft = o;
}
var M = [
  "input:not([type='hidden']):not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "a[href]",
  "area[href]",
  "[tabindex]",
  "iframe",
  "object",
  "embed",
  "audio[controls]",
  "video[controls]",
  "[contenteditable]:not([contenteditable='false'])"
], k = [
  ...M,
  '[tabindex]:not([tabindex="-1"]):not([disabled])'
], E = `${M.join(
  ":not([hidden]),"
)},[tabindex]:not([disabled]):not([hidden])`, U = k.join(
  ':not([hidden]):not([tabindex="-1"]),'
);
function Y(t, e) {
  const o = Array.from(
    t.querySelectorAll(E)
  ).filter(S);
  return e && S(t) && o.unshift(t), o.forEach((r, i) => {
    if (I(r) && r.contentDocument) {
      const s = r.contentDocument.body, c = Y(s, !1);
      o.splice(i, 1, ...c);
    }
  }), o;
}
function S(t) {
  return G(t) && !X(t);
}
function G(t) {
  return t.matches(E) && T(t);
}
function X(t) {
  return Number.parseInt(t.getAttribute("tabindex") || "0", 10) < 0;
}
function T(t, e) {
  return t.nodeName !== "#comment" && $(t) && z(t, e) && (!t.parentElement || T(t.parentElement, t));
}
function $(t) {
  if (!(t instanceof HTMLElement) && !(t instanceof SVGElement))
    return !1;
  const { display: e, visibility: n } = t.style;
  let o = e !== "none" && n !== "hidden" && n !== "collapse";
  if (o) {
    if (!t.ownerDocument.defaultView)
      return o;
    const { getComputedStyle: r } = t.ownerDocument.defaultView, { display: i, visibility: s } = r(t);
    o = i !== "none" && s !== "hidden" && s !== "collapse";
  }
  return o;
}
function z(t, e) {
  return !t.hasAttribute("hidden") && (t.nodeName === "DETAILS" && e && e.nodeName !== "SUMMARY" ? t.hasAttribute("open") : !0);
}
function at(t, e, n) {
  const o = e?.tabbable ? U : E, r = document.createTreeWalker(t, NodeFilter.SHOW_ELEMENT, {
    acceptNode(i) {
      return e?.from?.contains(i) ? NodeFilter.FILTER_REJECT : i.matches(o) && T(i) && (!e?.accept || e.accept(i)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  return e?.from && (r.currentNode = e.from), r;
}
function A(t) {
  let e = t;
  for (; e && !q(e); )
    e = e.parentElement;
  return e || document.scrollingElement || document.documentElement;
}
function q(t) {
  const e = window.getComputedStyle(t);
  return /(auto|scroll)/.test(
    e.overflow + e.overflowX + e.overflowY
  );
}
function ut() {
}
function dt(t, e = Number.NEGATIVE_INFINITY, n = Number.POSITIVE_INFINITY) {
  return Math.min(Math.max(t, e), n);
}
function bt(t, e, n, o) {
  const r = (t - (Number.isNaN(e) ? 0 : e)) % o;
  let i = Math.abs(r) * 2 >= o ? t + Math.sign(r) * (o - Math.abs(r)) : t - r;
  Number.isNaN(e) ? !Number.isNaN(n) && i > n && (i = Math.floor(n / o) * o) : i < e ? i = e : !Number.isNaN(n) && i > n && (i = e + Math.floor((n - e) / o) * o);
  const s = o.toString(), c = s.indexOf("."), l = c >= 0 ? s.length - c : 0;
  if (l > 0) {
    const f = 10 ** l;
    i = Math.round(i * f) / f;
  }
  return i;
}
function pt(t) {
  return [t.clientX, t.clientY];
}
function mt(t, e) {
  const [n, o] = t;
  let r = !1;
  const i = e.length;
  for (let s = i, c = 0, l = s - 1; c < s; l = c++) {
    const [f, a] = e[c], [m, u] = e[l], [, N] = e[l === 0 ? s - 1 : l - 1] || [0, 0], b = (a - u) * (n - f) - (f - m) * (o - a);
    if (u < a) {
      if (o >= u && o < a) {
        if (b === 0)
          return !0;
        b > 0 && (o === u ? o > N && (r = !r) : r = !r);
      }
    } else if (a < u) {
      if (o > a && o <= u) {
        if (b === 0)
          return !0;
        b < 0 && (o === u ? o < N && (r = !r) : r = !r);
      }
    } else if (o === a && (n >= m && n <= f || n >= f && n <= m))
      return !0;
  }
  return r;
}
function gt(t, e) {
  return x(t, e);
}
var d = /* @__PURE__ */ new Map(), v = /* @__PURE__ */ new Set();
function L() {
  if (typeof window > "u")
    return;
  const t = (n) => {
    if (!n.target)
      return;
    let o = d.get(n.target);
    o || (o = /* @__PURE__ */ new Set(), d.set(n.target, o), n.target.addEventListener(
      "transitioncancel",
      e
    )), o.add(n.propertyName);
  }, e = (n) => {
    if (!n.target)
      return;
    const o = d.get(n.target);
    if (o && (o.delete(n.propertyName), o.size === 0 && (n.target.removeEventListener(
      "transitioncancel",
      e
    ), d.delete(n.target)), d.size === 0)) {
      for (const r of v)
        r();
      v.clear();
    }
  };
  document.body.addEventListener("transitionrun", t), document.body.addEventListener("transitionend", e);
}
typeof document < "u" && (document.readyState !== "loading" ? L() : document.addEventListener("DOMContentLoaded", L));
function J(t, e) {
  const n = y(t, e, "left"), o = y(t, e, "top"), r = e.offsetWidth, i = e.offsetHeight;
  let s = t.scrollLeft, c = t.scrollTop;
  const l = s + t.offsetWidth, f = c + t.offsetHeight;
  n <= s ? s = n : n + r > l && (s += n + r - l), o <= c ? c = o : o + i > f && (c += o + i - f), t.scrollLeft = s, t.scrollTop = c;
}
function y(t, e, n) {
  const o = n === "left" ? "offsetLeft" : "offsetTop";
  let r = 0;
  for (; e.offsetParent && (r += e[o], e.offsetParent !== t); ) {
    if (e.offsetParent.contains(t)) {
      r -= t[o];
      break;
    }
    e = e.offsetParent;
  }
  return r;
}
function wt(t, e) {
  if (document.contains(t)) {
    const n = document.scrollingElement || document.documentElement;
    if (window.getComputedStyle(n).overflow === "hidden") {
      let r = A(t);
      for (; t && r && t !== n && r !== n; )
        J(
          r,
          t
        ), t = r, r = A(t);
    } else {
      const { left: r, top: i } = t.getBoundingClientRect();
      t?.scrollIntoView?.({ block: "nearest" });
      const { left: s, top: c } = t.getBoundingClientRect();
      (Math.abs(r - s) > 1 || Math.abs(i - c) > 1) && t.scrollIntoView?.({ block: "nearest" });
    }
  }
}
var ht = {
  border: "0",
  clip: "rect(0 0 0 0)",
  "clip-path": "inset(50%)",
  height: "1px",
  margin: "0 -1px -1px 0",
  overflow: "hidden",
  padding: "0",
  position: "absolute",
  width: "1px",
  "white-space": "nowrap"
};
export {
  F as EventKey,
  E as FOCUSABLE_ELEMENT_SELECTOR,
  U as TABBABLE_ELEMENT_SELECTOR,
  Z as addItemToArray,
  V as callHandler,
  dt as clamp,
  ct as composeEventHandlers,
  ot as contains,
  nt as createGenerateId,
  ft as focusWithoutScrolling,
  C as getActiveElement,
  Y as getAllTabbableIn,
  g as getDocument,
  pt as getEventPoint,
  at as getFocusableTreeWalker,
  A as getScrollParent,
  rt as getWindow,
  it as isAppleDevice,
  W as isChrome,
  lt as isCtrlKey,
  T as isElementVisible,
  G as isFocusable,
  I as isFrame,
  D as isFunction,
  O as isIOS,
  R as isIPad,
  H as isIPhone,
  h as isMac,
  tt as isNumber,
  mt as isPointInPolygon,
  et as isString,
  S as isTabbable,
  st as isWebKit,
  gt as mergeDefaultProps,
  ut as noop,
  K as removeItemFromArray,
  J as scrollIntoView,
  wt as scrollIntoViewport,
  bt as snapValueToStep,
  ht as visuallyHiddenStyles
};
//# sourceMappingURL=index164.js.map
