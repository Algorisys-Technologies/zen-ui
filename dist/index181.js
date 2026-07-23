import { offset as st, flip as rt, shift as ct, size as lt, hide as ft, arrow as ut, computePosition as ht } from "./index210.js";
import { createCoords as m, rectToClientRect as J, floor as D, max as E, round as z, min as N } from "./index211.js";
import { getOverflowAncestors as V, isElement as v, getDocumentElement as b, getWindow as O, getFrameElement as U, getComputedStyle as R, isHTMLElement as T, isWebKit as Q, isTopLayer as $, getParentNode as W, isLastTraversableNode as A, isTableElement as at, isContainingBlock as Y, getContainingBlock as dt, getNodeName as _, isOverflowElement as q, getNodeScroll as H } from "./index212.js";
function Z(t) {
  const e = R(t);
  let o = parseFloat(e.width) || 0, i = parseFloat(e.height) || 0;
  const n = T(t), r = n ? t.offsetWidth : o, s = n ? t.offsetHeight : i, c = z(o) !== r || z(i) !== s;
  return c && (o = r, i = s), {
    width: o,
    height: i,
    $: c
  };
}
function X(t) {
  return v(t) ? t : t.contextElement;
}
function F(t) {
  const e = X(t);
  if (!T(e))
    return m(1);
  const o = e.getBoundingClientRect(), {
    width: i,
    height: n,
    $: r
  } = Z(e);
  let s = (r ? z(o.width) : o.width) / i, c = (r ? z(o.height) : o.height) / n;
  return (!s || !Number.isFinite(s)) && (s = 1), (!c || !Number.isFinite(c)) && (c = 1), {
    x: s,
    y: c
  };
}
const gt = /* @__PURE__ */ m(0);
function tt(t) {
  const e = O(t);
  return !Q() || !e.visualViewport ? gt : {
    x: e.visualViewport.offsetLeft,
    y: e.visualViewport.offsetTop
  };
}
function pt(t, e, o) {
  return e === void 0 && (e = !1), !o || e && o !== O(t) ? !1 : e;
}
function L(t, e, o, i) {
  e === void 0 && (e = !1), o === void 0 && (o = !1);
  const n = t.getBoundingClientRect(), r = X(t);
  let s = m(1);
  e && (i ? v(i) && (s = F(i)) : s = F(t));
  const c = pt(r, o, i) ? tt(r) : m(0);
  let l = (n.left + c.x) / s.x, f = (n.top + c.y) / s.y, u = n.width / s.x, a = n.height / s.y;
  if (r) {
    const d = O(r), h = i && v(i) ? O(i) : i;
    let w = d, p = U(w);
    for (; p && i && h !== w; ) {
      const y = F(p), g = p.getBoundingClientRect(), x = R(p), C = g.left + (p.clientLeft + parseFloat(x.paddingLeft)) * y.x, S = g.top + (p.clientTop + parseFloat(x.paddingTop)) * y.y;
      l *= y.x, f *= y.y, u *= y.x, a *= y.y, l += C, f += S, w = O(p), p = U(w);
    }
  }
  return J({
    width: u,
    height: a,
    x: l,
    y: f
  });
}
function I(t, e) {
  const o = H(t).scrollLeft;
  return e ? e.left + o : L(b(t)).left + o;
}
function et(t, e) {
  const o = t.getBoundingClientRect(), i = o.left + e.scrollLeft - I(t, o), n = o.top + e.scrollTop;
  return {
    x: i,
    y: n
  };
}
function wt(t) {
  let {
    elements: e,
    rect: o,
    offsetParent: i,
    strategy: n
  } = t;
  const r = n === "fixed", s = b(i), c = e ? $(e.floating) : !1;
  if (i === s || c && r)
    return o;
  let l = {
    scrollLeft: 0,
    scrollTop: 0
  }, f = m(1);
  const u = m(0), a = T(i);
  if ((a || !a && !r) && ((_(i) !== "body" || q(s)) && (l = H(i)), a)) {
    const h = L(i);
    f = F(i), u.x = h.x + i.clientLeft, u.y = h.y + i.clientTop;
  }
  const d = s && !a && !r ? et(s, l) : m(0);
  return {
    width: o.width * f.x,
    height: o.height * f.y,
    x: o.x * f.x - l.scrollLeft * f.x + u.x + d.x,
    y: o.y * f.y - l.scrollTop * f.y + u.y + d.y
  };
}
function yt(t) {
  return Array.from(t.getClientRects());
}
function mt(t) {
  const e = b(t), o = H(t), i = t.ownerDocument.body, n = E(e.scrollWidth, e.clientWidth, i.scrollWidth, i.clientWidth), r = E(e.scrollHeight, e.clientHeight, i.scrollHeight, i.clientHeight);
  let s = -o.scrollLeft + I(t);
  const c = -o.scrollTop;
  return R(i).direction === "rtl" && (s += E(e.clientWidth, i.clientWidth) - n), {
    width: n,
    height: r,
    x: s,
    y: c
  };
}
const K = 25;
function xt(t, e) {
  const o = O(t), i = b(t), n = o.visualViewport;
  let r = i.clientWidth, s = i.clientHeight, c = 0, l = 0;
  if (n) {
    r = n.width, s = n.height;
    const u = Q();
    (!u || u && e === "fixed") && (c = n.offsetLeft, l = n.offsetTop);
  }
  const f = I(i);
  if (f <= 0) {
    const u = i.ownerDocument, a = u.body, d = getComputedStyle(a), h = u.compatMode === "CSS1Compat" && parseFloat(d.marginLeft) + parseFloat(d.marginRight) || 0, w = Math.abs(i.clientWidth - a.clientWidth - h);
    w <= K && (r -= w);
  } else f <= K && (r += f);
  return {
    width: r,
    height: s,
    x: c,
    y: l
  };
}
function vt(t, e) {
  const o = L(t, !0, e === "fixed"), i = o.top + t.clientTop, n = o.left + t.clientLeft, r = T(t) ? F(t) : m(1), s = t.clientWidth * r.x, c = t.clientHeight * r.y, l = n * r.x, f = i * r.y;
  return {
    width: s,
    height: c,
    x: l,
    y: f
  };
}
function j(t, e, o) {
  let i;
  if (e === "viewport")
    i = xt(t, o);
  else if (e === "document")
    i = mt(b(t));
  else if (v(e))
    i = vt(e, o);
  else {
    const n = tt(t);
    i = {
      x: e.x - n.x,
      y: e.y - n.y,
      width: e.width,
      height: e.height
    };
  }
  return J(i);
}
function ot(t, e) {
  const o = W(t);
  return o === e || !v(o) || A(o) ? !1 : R(o).position === "fixed" || ot(o, e);
}
function Rt(t, e) {
  const o = e.get(t);
  if (o)
    return o;
  let i = V(t, [], !1).filter((c) => v(c) && _(c) !== "body"), n = null;
  const r = R(t).position === "fixed";
  let s = r ? W(t) : t;
  for (; v(s) && !A(s); ) {
    const c = R(s), l = Y(s);
    !l && c.position === "fixed" && (n = null), (r ? !l && !n : !l && c.position === "static" && !!n && (n.position === "absolute" || n.position === "fixed") || q(s) && !l && ot(t, s)) ? i = i.filter((u) => u !== s) : n = c, s = W(s);
  }
  return e.set(t, i), i;
}
function bt(t) {
  let {
    element: e,
    boundary: o,
    rootBoundary: i,
    strategy: n
  } = t;
  const s = [...o === "clippingAncestors" ? $(e) ? [] : Rt(e, this._c) : [].concat(o), i], c = j(e, s[0], n);
  let l = c.top, f = c.right, u = c.bottom, a = c.left;
  for (let d = 1; d < s.length; d++) {
    const h = j(e, s[d], n);
    l = E(h.top, l), f = N(h.right, f), u = N(h.bottom, u), a = E(h.left, a);
  }
  return {
    width: f - a,
    height: u - l,
    x: a,
    y: l
  };
}
function Ct(t) {
  const {
    width: e,
    height: o
  } = Z(t);
  return {
    width: e,
    height: o
  };
}
function Ot(t, e, o) {
  const i = T(e), n = b(e), r = o === "fixed", s = L(t, !0, r, e);
  let c = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const l = m(0);
  function f() {
    l.x = I(n);
  }
  if (i || !i && !r)
    if ((_(e) !== "body" || q(n)) && (c = H(e)), i) {
      const h = L(e, !0, r, e);
      l.x = h.x + e.clientLeft, l.y = h.y + e.clientTop;
    } else n && f();
  r && !i && n && f();
  const u = n && !i && !r ? et(n, c) : m(0), a = s.left + c.scrollLeft - l.x - u.x, d = s.top + c.scrollTop - l.y - u.y;
  return {
    x: a,
    y: d,
    width: s.width,
    height: s.height
  };
}
function M(t) {
  return R(t).position === "static";
}
function G(t, e) {
  if (!T(t) || R(t).position === "fixed")
    return null;
  if (e)
    return e(t);
  let o = t.offsetParent;
  return b(t) === o && (o = o.ownerDocument.body), o;
}
function it(t, e) {
  const o = O(t);
  if ($(t))
    return o;
  if (!T(t)) {
    let n = W(t);
    for (; n && !A(n); ) {
      if (v(n) && !M(n))
        return n;
      n = W(n);
    }
    return o;
  }
  let i = G(t, e);
  for (; i && at(i) && M(i); )
    i = G(i, e);
  return i && A(i) && M(i) && !Y(i) ? o : i || dt(t) || o;
}
const Lt = async function(t) {
  const e = this.getOffsetParent || it, o = this.getDimensions, i = await o(t.floating);
  return {
    reference: Ot(t.reference, await e(t.floating), t.strategy),
    floating: {
      x: 0,
      y: 0,
      width: i.width,
      height: i.height
    }
  };
};
function Tt(t) {
  return R(t).direction === "rtl";
}
const Et = {
  convertOffsetParentRelativeRectToViewportRelativeRect: wt,
  getDocumentElement: b,
  getClippingRect: bt,
  getOffsetParent: it,
  getElementRects: Lt,
  getClientRects: yt,
  getDimensions: Ct,
  getScale: F,
  isElement: v,
  isRTL: Tt
};
function nt(t, e) {
  return t.x === e.x && t.y === e.y && t.width === e.width && t.height === e.height;
}
function Ft(t, e) {
  let o = null, i;
  const n = b(t);
  function r() {
    var c;
    clearTimeout(i), (c = o) == null || c.disconnect(), o = null;
  }
  function s(c, l) {
    c === void 0 && (c = !1), l === void 0 && (l = 1), r();
    const f = t.getBoundingClientRect(), {
      left: u,
      top: a,
      width: d,
      height: h
    } = f;
    if (c || e(), !d || !h)
      return;
    const w = D(a), p = D(n.clientWidth - (u + d)), y = D(n.clientHeight - (a + h)), g = D(u), C = {
      rootMargin: -w + "px " + -p + "px " + -y + "px " + -g + "px",
      threshold: E(0, N(1, l)) || 1
    };
    let S = !0;
    function k(P) {
      const B = P[0].intersectionRatio;
      if (B !== l) {
        if (!S)
          return s();
        B ? s(!1, B) : i = setTimeout(() => {
          s(!1, 1e-7);
        }, 1e3);
      }
      B === 1 && !nt(f, t.getBoundingClientRect()) && s(), S = !1;
    }
    try {
      o = new IntersectionObserver(k, {
        ...C,
        // Handle <iframe>s
        root: n.ownerDocument
      });
    } catch {
      o = new IntersectionObserver(k, C);
    }
    o.observe(t);
  }
  return s(!0), r;
}
function Dt(t, e, o, i) {
  i === void 0 && (i = {});
  const {
    ancestorScroll: n = !0,
    ancestorResize: r = !0,
    elementResize: s = typeof ResizeObserver == "function",
    layoutShift: c = typeof IntersectionObserver == "function",
    animationFrame: l = !1
  } = i, f = X(t), u = n || r ? [...f ? V(f) : [], ...e ? V(e) : []] : [];
  u.forEach((g) => {
    n && g.addEventListener("scroll", o, {
      passive: !0
    }), r && g.addEventListener("resize", o);
  });
  const a = f && c ? Ft(f, o) : null;
  let d = -1, h = null;
  s && (h = new ResizeObserver((g) => {
    let [x] = g;
    x && x.target === f && h && e && (h.unobserve(e), cancelAnimationFrame(d), d = requestAnimationFrame(() => {
      var C;
      (C = h) == null || C.observe(e);
    })), o();
  }), f && !l && h.observe(f), e && h.observe(e));
  let w, p = l ? L(t) : null;
  l && y();
  function y() {
    const g = L(t);
    p && !nt(p, g) && o(), p = g, w = requestAnimationFrame(y);
  }
  return o(), () => {
    var g;
    u.forEach((x) => {
      n && x.removeEventListener("scroll", o), r && x.removeEventListener("resize", o);
    }), a?.(), (g = h) == null || g.disconnect(), h = null, l && cancelAnimationFrame(w);
  };
}
const zt = st, At = ct, Ht = rt, It = lt, Mt = ft, Nt = ut, Vt = (t, e, o) => {
  const i = /* @__PURE__ */ new Map(), n = {
    platform: Et,
    ...o
  }, r = {
    ...n.platform,
    _c: i
  };
  return ht(t, e, {
    ...n,
    platform: r
  });
};
export {
  Nt as arrow,
  Dt as autoUpdate,
  Vt as computePosition,
  Ht as flip,
  V as getOverflowAncestors,
  Mt as hide,
  zt as offset,
  Et as platform,
  At as shift,
  It as size
};
//# sourceMappingURL=index181.js.map
